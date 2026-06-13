require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5001;

// Validate Razorpay credentials at startup
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env');
  process.exit(1);
}

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// CORS — allow frontend origin
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  }
}));

app.use(express.json({ limit: '50mb' }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clothing';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const Product = require('./models/Product');
const Order = require('./models/Order');

// ─── Health Check ─────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Prime Threads API', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({ status: 'ok', database: states[dbState] || 'unknown' });
});

// ─── API Routes ───────────────────────────────

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ id: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST to sync/add products
app.post('/api/products', async (req, res) => {
  try {
    const newProducts = req.body;
    if (Array.isArray(newProducts)) {
      const savedProducts = [];
      for (const p of newProducts) {
        const updated = await Product.findOneAndUpdate(
          { id: p.id },
          p,
          { new: true, upsert: true }
        );
        savedProducts.push(updated);
      }
      res.json(savedProducts);
    } else {
      res.status(400).json({ message: 'Expected an array of products' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE a product
app.put('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await Product.findOneAndUpdate({ id }, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await Product.findOneAndDelete({ id });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Razorpay Order Routes ────────────────────

// Create a Razorpay order
app.post('/api/orders', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;
    if (!amount) return res.status(400).json({ message: 'Amount is required' });

    const amountInPaise = Math.round(amount * 100);
    if (amountInPaise < 100) {
      return res.status(400).json({ message: 'Minimum amount is ₹1 (100 paise)' });
    }

    const options = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `order_${Date.now()}`,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);
    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Razorpay order error:', err);
    if (err.statusCode === 401) {
      return res.status(401).json({ message: 'Razorpay authentication failed. Check API credentials.' });
    }
    res.status(500).json({ message: err.message });
  }
});

// Verify payment signature
app.post('/api/orders/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ verified: false, message: 'Missing required payment fields' });
    }

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      res.json({ verified: true, payment_id: razorpay_payment_id });
    } else {
      res.status(400).json({ verified: false, message: 'Payment signature verification failed. Do NOT mark as paid.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Order Management Routes ──────────────────

// Save a completed order
app.post('/api/orders/save', async (req, res) => {
  try {
    const orderData = req.body;
    const order = new Order(orderData);
    await order.save();
    res.json(order);
  } catch (err) {
    console.error('Save order error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET all saved orders (for admin dashboard)
app.get('/api/orders/all', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE order status
app.put('/api/orders/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
