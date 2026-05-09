const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: Number },
  title: { type: String, required: true },
  price: { type: String, required: true },
  image: { type: String },
  selectedSize: { type: String },
  qty: { type: Number, default: 1 },
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  status: { type: String, default: 'Paid', enum: ['Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] },

  // Customer details
  customer: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
  },

  // Shipping address
  shipping: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },

  // Items
  items: [orderItemSchema],

  // Pricing
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  couponCode: { type: String },
  total: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
