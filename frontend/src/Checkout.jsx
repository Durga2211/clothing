import React, { useState } from 'react';
import { ArrowLeft, X, ChevronRight, CheckCircle, ShoppingBag, Tag, Truck, Shield, CreditCard } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

function Checkout({ items, onClose, onSuccess, clearCart }) {
  const [step, setStep] = useState(1); // 1: Contact, 2: Address, 3: Payment
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [form, setForm] = useState({
    phone: '',
    fullName: '',
    address: '',
    pincode: '',
    city: '',
    state: '',
    email: '',
  });

  const [errors, setErrors] = useState({});

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/^Rs\.?\s*/i, '').replace(/,/g, '')) || 0;
    return sum + price * item.qty;
  }, 0);

  const discount = couponApplied ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal - discount;

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Auto-fetch city/state from pincode
  const handlePincodeChange = async (value) => {
    updateField('pincode', value);
    if (value.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await res.json();
        if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          setForm(prev => ({
            ...prev,
            city: po.District || po.Division || '',
            state: po.State || '',
          }));
        }
      } catch (err) {
        // Silently fail — user can type manually
      }
    }
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.phone || form.phone.length < 10) errs.phone = 'Enter a valid 10-digit phone number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.pincode || form.pincode.length !== 6) errs.pincode = 'Enter a valid 6-digit pincode';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.state.trim()) errs.state = 'State is required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const applyCoupon = () => {
    setCouponError('');
    if (couponCode.trim().toUpperCase() === 'PRIME5') {
      setCouponApplied(true);
    } else {
      setCouponError('Invalid coupon code. Try PRIME5');
    }
  };

  const removeCoupon = () => {
    setCouponApplied(false);
    setCouponCode('');
    setCouponError('');
  };

  const [paymentError, setPaymentError] = useState('');

  const initiatePayment = async () => {
    setLoading(true);
    setPaymentError('');
    try {
      // Create order on backend
      const orderRes = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          receipt: `pt_${Date.now()}`,
          notes: {
            customer_name: form.fullName,
            customer_email: form.email,
            customer_phone: form.phone,
            shipping_address: `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`,
            items: items.map(i => `${i.title} (${i.selectedSize}) x${i.qty}`).join(', '),
          },
        }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}));
        throw new Error(errData.message || `Server error (${orderRes.status})`);
      }

      const orderData = await orderRes.json();

      if (!orderData.id) {
        throw new Error('Failed to create order');
      }

      // Open Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Prime Threads',
        description: items.length === 1
          ? `${items[0].title} — ${items[0].selectedSize}`
          : `${items.length} items`,
        order_id: orderData.id,
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
        },
        notes: {
          address: `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`,
        },
        theme: {
          color: '#000000',
        },
        handler: async function (response) {
          // Verify payment on backend
          try {
            const verifyRes = await fetch(`${API_BASE}/api/orders/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              // Save order to database
              try {
                await fetch(`${API_BASE}/api/orders/save`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    orderId: `PT-${Date.now().toString(36).toUpperCase()}`,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    status: 'Paid',
                    customer: {
                      fullName: form.fullName,
                      phone: form.phone,
                      email: form.email,
                    },
                    shipping: {
                      address: form.address,
                      city: form.city,
                      state: form.state,
                      pincode: form.pincode,
                    },
                    items: items.map(item => ({
                      productId: item.id,
                      title: item.title,
                      price: item.price,
                      image: item.image,
                      selectedSize: item.selectedSize,
                      qty: item.qty,
                    })),
                    subtotal,
                    discount,
                    couponCode: couponApplied ? 'PRIME5' : '',
                    total,
                    currency: 'INR',
                  }),
                });
              } catch (saveErr) {
                console.error('Order save failed:', saveErr);
              }

              setPaymentSuccess(true);
              setPaymentId(response.razorpay_payment_id);
              if (clearCart) clearCart();
              if (onSuccess) onSuccess(response.razorpay_payment_id);
            } else {
              setPaymentError('Payment verification failed. Please contact support if amount was deducted.');
            }
          } catch (err) {
            console.error('Verification failed:', err);
            setPaymentSuccess(true);
            setPaymentId(response.razorpay_payment_id);
            if (clearCart) clearCart();
          }
          setLoading(false);
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      // Handle payment failures
      rzp.on('payment.failed', function (response) {
        setLoading(false);
        const desc = response.error?.description || 'Payment failed. Please try again.';
        const reason = response.error?.reason || '';
        setPaymentError(`${desc}${reason ? ` (${reason})` : ''}`);
        console.error('Payment failed:', response.error);
      });

      rzp.open();
    } catch (err) {
      console.error('Payment initiation failed:', err);
      setLoading(false);
      setPaymentError(err.message || 'Failed to initiate payment. Please try again.');
    }
  };

  // ─── SUCCESS SCREEN ──────────────────────────
  if (paymentSuccess) {
    return (
      <div className="checkout-overlay">
        <div className="checkout-container">
          <div className="checkout-success">
            <div className="checkout-success__icon">
              <CheckCircle size={64} strokeWidth={1.5} />
            </div>
            <h2>Payment Successful!</h2>
            <p>Thank you for your purchase. Your order has been confirmed.</p>
            <div className="checkout-success__details">
              <div className="checkout-success__detail-row">
                <span>Payment ID</span>
                <strong>{paymentId}</strong>
              </div>
              <div className="checkout-success__detail-row">
                <span>Amount Paid</span>
                <strong>₹{total.toLocaleString('en-IN')}.00</strong>
              </div>
              <div className="checkout-success__detail-row">
                <span>Shipping To</span>
                <strong>{form.city}, {form.state}</strong>
              </div>
            </div>
            <p className="checkout-success__note">
              A confirmation email will be sent to <strong>{form.email}</strong>
            </p>
            <button className="checkout-btn checkout-btn--primary" onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN CHECKOUT ────────────────────────────
  return (
    <div className="checkout-overlay">
      <div className="checkout-container">
        {/* ─── LEFT: ORDER SUMMARY ─── */}
        <div className="checkout-summary">
          <div className="checkout-summary__header">
            <h2><ShoppingBag size={20} /> Order Summary</h2>
          </div>

          <div className="checkout-summary__items">
            {items.map(item => (
              <div key={item.cartKey} className="checkout-summary__item">
                <img src={item.image} alt={item.title} className="checkout-summary__item-img" />
                <div className="checkout-summary__item-info">
                  <div className="checkout-summary__item-title">
                    {item.title} ({item.selectedSize})
                  </div>
                  <div className="checkout-summary__item-meta">
                    Quantity: {item.qty} &nbsp;&nbsp; Price: {item.price}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-summary__totals">
            <div className="checkout-summary__row">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}.00</span>
            </div>
            <div className="checkout-summary__row">
              <span>Shipping</span>
              <span className="checkout-summary__free">Free</span>
            </div>
            {couponApplied && (
              <div className="checkout-summary__row checkout-summary__row--discount">
                <span>Coupon (PRIME5 — 5% off)</span>
                <span>-₹{discount.toLocaleString('en-IN')}.00</span>
              </div>
            )}
            <div className="checkout-summary__row checkout-summary__row--total">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}.00</span>
            </div>
          </div>

          {/* Coupon */}
          <div className="checkout-coupon">
            {couponApplied ? (
              <div className="checkout-coupon__applied">
                <Tag size={16} />
                <span>PRIME5 applied — 5% off!</span>
                <button onClick={removeCoupon}>Remove</button>
              </div>
            ) : (
              <div className="checkout-coupon__form">
                <Tag size={16} color="#10b981" />
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                />
                <button onClick={applyCoupon}>Apply</button>
              </div>
            )}
            {couponError && <div className="checkout-coupon__error">{couponError}</div>}
          </div>

          <div className="checkout-summary__badges">
            <div className="checkout-summary__badge"><Truck size={16} /> Free Shipping</div>
            <div className="checkout-summary__badge"><Shield size={16} /> Secure Payment</div>
          </div>
        </div>

        {/* ─── RIGHT: FORM ─── */}
        <div className="checkout-form-panel">
          {/* Top bar */}
          <div className="checkout-form__topbar">
            <button className="checkout-form__back" onClick={() => step > 1 ? setStep(step - 1) : onClose()}>
              <ArrowLeft size={20} />
            </button>
            <button className="checkout-form__close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="checkout-progress">
            <div className={`checkout-progress__step ${step >= 1 ? 'checkout-progress__step--active' : ''}`}>
              <span className="checkout-progress__number">1</span>
              <span>Contact</span>
            </div>
            <div className="checkout-progress__line">
              <div className={`checkout-progress__line-fill ${step >= 2 ? 'checkout-progress__line-fill--active' : ''}`} />
            </div>
            <div className={`checkout-progress__step ${step >= 2 ? 'checkout-progress__step--active' : ''}`}>
              <span className="checkout-progress__number">2</span>
              <span>Address</span>
            </div>
            <div className="checkout-progress__line">
              <div className={`checkout-progress__line-fill ${step >= 3 ? 'checkout-progress__line-fill--active' : ''}`} />
            </div>
            <div className={`checkout-progress__step ${step >= 3 ? 'checkout-progress__step--active' : ''}`}>
              <span className="checkout-progress__number">3</span>
              <span>Payment</span>
            </div>
          </div>

          {/* Prepaid offer banner */}
          <div className="checkout-banner">
            <CreditCard size={16} />
            Get an additional 5% OFF on prepaid orders! Use code <strong>PRIME5</strong>
          </div>

          {/* Step content */}
          <div className="checkout-form__content">
            {/* STEP 1: Contact */}
            {step === 1 && (
              <div className="checkout-step">
                <h3 className="checkout-step__title">Contact Information</h3>
                <p className="checkout-step__desc">We'll use this to send you order updates</p>
                <div className="checkout-field">
                  <label>Phone Number</label>
                  <div className="checkout-field__phone">
                    <span className="checkout-field__prefix">+91</span>
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      maxLength={10}
                    />
                  </div>
                  {errors.phone && <span className="checkout-field__error">{errors.phone}</span>}
                </div>
              </div>
            )}

            {/* STEP 2: Address */}
            {step === 2 && (
              <div className="checkout-step">
                <h3 className="checkout-step__title">Shipping Address</h3>

                <div className="checkout-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={form.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                  />
                  {errors.fullName && <span className="checkout-field__error">{errors.fullName}</span>}
                </div>

                <div className="checkout-field">
                  <label>Address 1 (House no, Building, Street, Area)</label>
                  <textarea
                    rows={3}
                    placeholder="Enter your complete address"
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                  />
                  {errors.address && <span className="checkout-field__error">{errors.address}</span>}
                </div>

                <div className="checkout-field-row checkout-field-row--3">
                  <div className="checkout-field">
                    <label>Pincode</label>
                    <input
                      type="text"
                      placeholder="572103"
                      value={form.pincode}
                      onChange={(e) => handlePincodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                    />
                    {errors.pincode && <span className="checkout-field__error">{errors.pincode}</span>}
                  </div>
                  <div className="checkout-field">
                    <label>City</label>
                    <input
                      type="text"
                      placeholder="City"
                      value={form.city}
                      onChange={(e) => updateField('city', e.target.value)}
                    />
                    {errors.city && <span className="checkout-field__error">{errors.city}</span>}
                  </div>
                  <div className="checkout-field">
                    <label>State</label>
                    <input
                      type="text"
                      placeholder="State"
                      value={form.state}
                      onChange={(e) => updateField('state', e.target.value)}
                    />
                    {errors.state && <span className="checkout-field__error">{errors.state}</span>}
                  </div>
                </div>

                <div className="checkout-field">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                  {errors.email && <span className="checkout-field__error">{errors.email}</span>}
                </div>
              </div>
            )}

            {/* STEP 3: Payment */}
            {step === 3 && (
              <div className="checkout-step">
                <h3 className="checkout-step__title">Payment</h3>
                <p className="checkout-step__desc">You'll be redirected to Razorpay's secure payment gateway</p>

                <div className="checkout-payment-summary">
                  <div className="checkout-payment-summary__item">
                    <span>Delivering to</span>
                    <strong>{form.fullName}</strong>
                  </div>
                  <div className="checkout-payment-summary__item">
                    <span>Address</span>
                    <strong>{form.address}, {form.city}, {form.state} - {form.pincode}</strong>
                  </div>
                  <div className="checkout-payment-summary__item">
                    <span>Contact</span>
                    <strong>+91 {form.phone}</strong>
                  </div>
                  <div className="checkout-payment-summary__item">
                    <span>Email</span>
                    <strong>{form.email}</strong>
                  </div>
                  <div className="checkout-payment-summary__divider" />
                  <div className="checkout-payment-summary__item checkout-payment-summary__item--total">
                    <span>Amount to Pay</span>
                    <strong>₹{total.toLocaleString('en-IN')}.00</strong>
                  </div>
                </div>

                <div className="checkout-payment-methods">
                  <div className="checkout-payment-method">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" />
                    <span>UPI, Cards, Net Banking, Wallets & More</span>
                  </div>
                </div>

                {paymentError && (
                  <div className="checkout-field__error" style={{ marginTop: '16px', padding: '12px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', textAlign: 'center' }}>
                    {paymentError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom action */}
          <div className="checkout-form__footer">
            {step < 3 ? (
              <button className="checkout-btn checkout-btn--primary" onClick={handleNext}>
                Save & Continue <ChevronRight size={18} />
              </button>
            ) : (
              <button
                className="checkout-btn checkout-btn--primary checkout-btn--pay"
                onClick={initiatePayment}
                disabled={loading}
              >
                {loading ? (
                  <span className="checkout-btn__spinner" />
                ) : (
                  <>Pay ₹{total.toLocaleString('en-IN')}.00</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
