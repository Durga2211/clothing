import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, User, ShoppingBag, ChevronLeft, ChevronRight, ArrowUp, CheckCircle, Mail, Menu, X, Truck, RotateCcw, ArrowRight, Phone, MapPin, Send, Minus, Plus, Trash2 } from 'lucide-react';
import './index.css';

function App({ products: allProducts = [] }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);
  const [toast, setToast] = useState({ message: '', visible: false });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [contactOpen, setContactOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [currentView, setCurrentView] = useState('home'); // home, shop, sale
  const productsRef = useRef(null);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => {
    const price = parseInt(item.price.replace(/[^\d]/g, '')) / 100;
    return sum + price * item.qty;
  }, 0);

  // Hero carousel images from existing products
  const heroImages = [
    '/product1.png',
    '/product2.png',
    '/product3.png',
    '/product4.png',
    '/related1.png',
    '/related2.png',
    '/related3.png',
    '/related4.png',
  ];

  // Auto-advance hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % Math.max(1, Math.ceil(heroImages.length / 5)));
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  useEffect(() => {
    const handleScroll = () => {
      if (selectedProduct && window.scrollY > 400) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedProduct]);

  const showNotification = (message) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast({ message: '', visible: false });
    }, 3000);
  };

  const handleAddToCart = (product, overrideSize) => {
    const size = overrideSize || selectedSize;
    if (product.sizes && product.sizes.length > 0 && !size) {
      showNotification('Please select a size first.');
      return;
    }
    const cartKey = `${product.id}-${size || 'onesize'}`;
    setCart(prev => {
      const existing = prev.find(item => item.cartKey === cartKey);
      if (existing) {
        return prev.map(item =>
          item.cartKey === cartKey ? { ...item, qty: item.qty + quantity } : item
        );
      }
      return [...prev, { ...product, cartKey, selectedSize: size || 'One Size', qty: quantity }];
    });
    setAddedProduct(product);
    showNotification(`${product.title} added to cart!`);
    setTimeout(() => setAddedProduct(null), 3000);
  };

  const updateCartQty = (cartKey, delta) => {
    setCart(prev =>
      prev.map(item => {
        if (item.cartKey === cartKey) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
      }).filter(item => item.qty > 0)
    );
  };

  const removeFromCart = (cartKey) => {
    setCart(prev => prev.filter(item => item.cartKey !== cartKey));
  };

  const handleBuyNow = (product) => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      showNotification('Please select a size first.');
      return;
    }
    const phone = '917019330696';
    const imageUrl = `${window.location.origin}${product.image}`;
    const sizeText = selectedSize ? `\n📏 Size: ${selectedSize}` : '';
    const message = `Hi! I'd like to buy this item:\n\n🛍️ *${product.title}*\n💰 Price: ${product.price}${sizeText}\n📷 Image: ${imageUrl}\n\nPlease confirm availability and proceed with my order. Thank you!`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    showNotification('Opening WhatsApp...');
  };

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const products = allProducts;

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setSelectedSize(null);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setSelectedProduct(null);
    setSelectedSize(null);
    setQuantity(1);
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (view) => {
    setSelectedProduct(null);
    setSelectedSize(null);
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get visible hero images (5 at a time in the carousel)
  const getVisibleImages = () => {
    const allImgs = [...heroImages];
    // Always show 5 images from products
    if (products.length > 0) {
      return products.slice(0, 5).map(p => ({
        image: p.image,
        title: p.title,
        price: p.price,
        product: p,
      }));
    }
    return allImgs.slice(0, 5).map((img, i) => ({
      image: img,
      title: '',
      price: '',
      product: null,
    }));
  };

  const visibleHeroImages = getVisibleImages();

  // ─── NAVBAR ─────────────────────────────────
  const NavBar = ({ dark }) => (
    <nav className={`pt-nav ${dark ? 'pt-nav--dark' : 'pt-nav--light'}`}>
      <div className="pt-nav__logo" onClick={handleBackToHome}>
        <div className="pt-nav__logo-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L4 8v12l10 6 10-6V8L14 2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M14 10l-4 2.5v5L14 20l4-2.5v-5L14 10z" fill="currentColor" opacity="0.3"/>
          </svg>
        </div>
        <span className="pt-nav__logo-text">PRIME THREADS</span>
      </div>

      <div className={`pt-nav__links ${mobileMenuOpen ? 'pt-nav__links--open' : ''}`}>
        <a
          href="#"
          className={currentView === 'home' && !selectedProduct ? 'active' : ''}
          onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}
        >Home</a>
        <a
          href="#"
          className={currentView === 'shop' ? 'active' : ''}
          onClick={(e) => { e.preventDefault(); handleNavClick('shop'); }}
        >Shop</a>
        <a
          href="#"
          className={currentView === 'sale' ? 'active' : ''}
          onClick={(e) => { e.preventDefault(); handleNavClick('sale'); }}
        >Sale</a>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); setContactOpen(true); setMobileMenuOpen(false); }}
        >Contact</a>
      </div>

      <div className="pt-nav__actions">
        <button className="pt-nav__cart-btn" onClick={() => setCartOpen(true)}>
          <ShoppingBag size={20} strokeWidth={1.5} />
          {cartCount > 0 && <span className="pt-nav__cart-badge">{cartCount}</span>}
        </button>
        <a href="#" className="pt-nav__auth-link" onClick={(e) => e.preventDefault()}>Login</a>
        <a href="#" className="pt-nav__auth-link pt-nav__auth-link--outlined" onClick={(e) => e.preventDefault()}>Sign up</a>
        <button className="pt-nav__mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );

  // ─── CART DRAWER ─────────────────────────────
  const CartDrawer = () => (
    <>
      <div className={`pt-overlay ${cartOpen ? 'pt-overlay--visible' : ''}`} onClick={() => setCartOpen(false)} />
      <div className={`pt-cart-drawer ${cartOpen ? 'pt-cart-drawer--open' : ''}`}>
        <div className="pt-cart-drawer__header">
          <h3>Your Cart ({cartCount})</h3>
          <button onClick={() => setCartOpen(false)}><X size={20} /></button>
        </div>
        {cart.length === 0 ? (
          <div className="pt-cart-drawer__empty">
            <ShoppingBag size={48} strokeWidth={1} />
            <p>Your cart is empty</p>
            <button className="pt-btn pt-btn--primary" onClick={() => { setCartOpen(false); handleNavClick('shop'); }}>
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="pt-cart-drawer__items">
              {cart.map(item => (
                <div key={item.cartKey} className="pt-cart-item">
                  <img src={item.image} alt={item.title} className="pt-cart-item__img" />
                  <div className="pt-cart-item__details">
                    <div className="pt-cart-item__title">{item.title}</div>
                    <div className="pt-cart-item__meta">Size: {item.selectedSize}</div>
                    <div className="pt-cart-item__price">{item.price}</div>
                    <div className="pt-cart-item__qty">
                      <button onClick={() => updateCartQty(item.cartKey, -1)}><Minus size={14} /></button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateCartQty(item.cartKey, 1)}><Plus size={14} /></button>
                    </div>
                  </div>
                  <button className="pt-cart-item__remove" onClick={() => removeFromCart(item.cartKey)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="pt-cart-drawer__footer">
              <div className="pt-cart-drawer__total">
                <span>Total</span>
                <span>Rs. {cartTotal.toLocaleString('en-IN')}.00</span>
              </div>
              <button className="pt-btn pt-btn--primary pt-btn--full" onClick={() => {
                const phone = '917019330696';
                const items = cart.map(item => `• ${item.title} (${item.selectedSize}) x${item.qty} — ${item.price}`).join('\n');
                const message = `Hi! I'd like to order:\n\n${items}\n\n💰 Total: Rs. ${cartTotal.toLocaleString('en-IN')}.00\n\nPlease confirm!`;
                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
              }}>
                Checkout via WhatsApp
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );

  // ─── CONTACT MODAL ───────────────────────────
  const ContactModal = () => (
    <>
      <div className={`pt-overlay ${contactOpen ? 'pt-overlay--visible' : ''}`} onClick={() => setContactOpen(false)} />
      <div className={`pt-contact-modal ${contactOpen ? 'pt-contact-modal--open' : ''}`}>
        <button className="pt-contact-modal__close" onClick={() => setContactOpen(false)}><X size={24} /></button>
        <div className="pt-contact-modal__content">
          <div className="pt-contact-modal__left">
            <h2>Get in Touch</h2>
            <p>We'd love to hear from you. Drop us a message and we'll get back to you within 24 hours.</p>
            <div className="pt-contact-info">
              <div className="pt-contact-info__item">
                <Mail size={18} />
                <span>hello@primethreads.com</span>
              </div>
              <div className="pt-contact-info__item">
                <Phone size={18} />
                <span>+91 7019 330 696</span>
              </div>
              <div className="pt-contact-info__item">
                <MapPin size={18} />
                <span>Bangalore, India</span>
              </div>
            </div>
          </div>
          <form className="pt-contact-form" onSubmit={(e) => { e.preventDefault(); showNotification('Message sent successfully!'); setContactOpen(false); }}>
            <div className="pt-contact-form__group">
              <label>Name</label>
              <input type="text" placeholder="Your name" required />
            </div>
            <div className="pt-contact-form__group">
              <label>Email</label>
              <input type="email" placeholder="your@email.com" required />
            </div>
            <div className="pt-contact-form__group">
              <label>Message</label>
              <textarea rows={4} placeholder="How can we help?" required />
            </div>
            <button type="submit" className="pt-btn pt-btn--primary pt-btn--full">
              <Send size={16} /> Send Message
            </button>
          </form>
        </div>
      </div>
    </>
  );

  // ─── HERO SECTION ────────────────────────────
  const HeroSection = () => (
    <section className="pt-hero">
      <div className="pt-hero__content">
        <div className="pt-hero__badge">New spring collection 2025</div>
        <h1 className="pt-hero__title">
          Where style speaks, trends resonate,
          <br />fashion flourishes
        </h1>
        <p className="pt-hero__subtitle">
          Unveiling a fashion destination where trends blend seamlessly with your
          individual style aspirations. Discover today!
        </p>
        <button className="pt-hero__cta" onClick={() => handleNavClick('shop')}>
          New collection <ArrowRight size={16} />
        </button>
      </div>

      <div className="pt-hero__carousel">
        <button className="pt-hero__carousel-arrow pt-hero__carousel-arrow--left" onClick={() => setHeroIndex(prev => prev > 0 ? prev - 1 : 0)}>
          <ChevronLeft size={20} />
        </button>

        <div className="pt-hero__carousel-track">
          {visibleHeroImages.map((item, i) => (
            <div
              key={i}
              className={`pt-hero__carousel-card ${i === 2 ? 'pt-hero__carousel-card--center' : ''}`}
              onClick={() => item.product && handleProductClick(item.product)}
              style={{ cursor: item.product ? 'pointer' : 'default' }}
            >
              <img src={item.image} alt={item.title || 'Fashion'} />
              {i === 2 && item.price && (
                <div className="pt-hero__carousel-price">
                  <span>Price for all</span>
                  <strong>{item.price}</strong>
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="pt-hero__carousel-arrow pt-hero__carousel-arrow--right" onClick={() => setHeroIndex(prev => prev + 1)}>
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );

  // ─── PRODUCTS GRID VIEW ──────────────────────
  const ProductsGrid = ({ title, subtitle, productList }) => (
    <section className="pt-products" ref={productsRef}>
      <div className="pt-products__header">
        <div>
          <h2 className="pt-products__title">{title}</h2>
          {subtitle && <p className="pt-products__subtitle">{subtitle}</p>}
        </div>
        <div className="pt-products__controls">
          <ChevronLeft size={20} strokeWidth={1.5} style={{ cursor: 'pointer', opacity: 0.5 }} />
          <ChevronRight size={20} strokeWidth={1.5} style={{ cursor: 'pointer', opacity: 0.5 }} />
        </div>
      </div>

      <div className="pt-products__grid">
        {productList.map(product => (
          <div key={product.id} className="pt-product-card" onClick={() => handleProductClick(product)}>
            <div className="pt-product-card__image">
              <img src={product.image} alt={product.title} />
              <button
                className="pt-product-card__quick-add"
                onClick={(e) => {
                  e.stopPropagation();
                  if (product.sizes && product.sizes.length > 0) {
                    handleProductClick(product);
                  } else {
                    handleAddToCart(product, 'One Size');
                  }
                }}
              >
                Quick Add
              </button>
            </div>
            <div className="pt-product-card__info">
              <span className="pt-product-card__name">{product.title}</span>
              <span className="pt-product-card__price">{product.price}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  // ─── PRODUCT DETAIL ──────────────────────────
  const ProductDetail = () => (
    <div className="pt-detail">
      <div className="pt-detail__breadcrumb">
        <a href="#" onClick={(e) => { e.preventDefault(); handleBackToHome(); }}>Home</a>
        <ChevronRight size={14} />
        <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('shop'); }}>Shop</a>
        <ChevronRight size={14} />
        <span>{selectedProduct.title}</span>
      </div>

      <div className="pt-detail__container">
        <div className="pt-detail__images">
          {selectedProduct.images.map((img, i) => (
            <img key={i} src={img} alt="" />
          ))}
        </div>

        <div className="pt-detail__info">
          <h1>{selectedProduct.title}</h1>
          <div className="pt-detail__price">
            {selectedProduct.price}
            <span className="pt-detail__tax">Taxes included.</span>
          </div>

          <p className="pt-detail__desc">{selectedProduct.description}</p>

          {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
            <div className="pt-detail__sizes">
              <div className="pt-detail__sizes-label">Size <strong>{selectedSize || ''}</strong></div>
              <div className="pt-detail__sizes-options">
                {selectedProduct.sizes.map(size => (
                  <button
                    key={size}
                    className={`pt-size-btn ${selectedSize === size ? 'pt-size-btn--selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-detail__actions">
            <div className="pt-qty-selector">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
            <button className="pt-btn pt-btn--primary pt-btn--full" onClick={() => handleAddToCart(selectedProduct)}>
              {addedProduct?.id === selectedProduct.id ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <CheckCircle size={16} /> Added to Cart
                </span>
              ) : 'Add to Cart'}
            </button>
            <button className="pt-btn pt-btn--outline pt-btn--full" onClick={() => handleBuyNow(selectedProduct)}>
              Buy it Now
            </button>
          </div>

          <div className="pt-detail__meta">
            <div className="pt-detail__meta-item"><CheckCircle size={16} color="#10b981" /> Wardrobe upgrade in process.</div>
            <div className="pt-detail__meta-item"><CheckCircle size={16} color="#10b981" /> Good clothes. No second thoughts.</div>
            <div className="pt-detail__meta-item"><CheckCircle size={16} color="#10b981" /> Secure online payment</div>
            <div className="pt-detail__meta-item"><CheckCircle size={16} color="#10b981" /> Free shipping on prepaid orders</div>
          </div>

          <div className="pt-detail__trust">
            <div className="pt-detail__trust-badge">
              <Truck size={20} />
              <span>Free Shipping on Prepaid</span>
            </div>
            <div className="pt-detail__trust-badge">
              <RotateCcw size={20} />
              <span>Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <section className="pt-products" style={{ borderTop: '1px solid #eee', marginTop: 60 }}>
        <div className="pt-products__header">
          <h2 className="pt-products__title">You may also like</h2>
        </div>
        <div className="pt-products__grid">
          {products.filter(p => p.id !== selectedProduct.id).slice(0, 4).map(product => (
            <div key={product.id} className="pt-product-card" onClick={() => handleProductClick(product)}>
              <div className="pt-product-card__image">
                <img src={product.image} alt={product.title} />
              </div>
              <div className="pt-product-card__info">
                <span className="pt-product-card__name">{product.title}</span>
                <span className="pt-product-card__price">{product.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  // ─── FOOTER ──────────────────────────────────
  const Footer = () => (
    <footer className="pt-footer">
      <div className="pt-footer__top">
        <div className="pt-footer__col pt-footer__col--brand">
          <div className="pt-footer__brand-name">PRIME THREADS</div>
          <p>Premium fashion destination where trends blend seamlessly with your individual style aspirations.</p>
          <div className="pt-footer__socials">
            <a href="#"><Mail size={18} /></a>
            <a href="#"><Phone size={18} /></a>
            <a href="#"><MapPin size={18} /></a>
          </div>
        </div>
        <div className="pt-footer__col">
          <h4>Company</h4>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); setContactOpen(true); }}>Contact</a></li>
            <li><a href="#">Terms</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>
        <div className="pt-footer__col">
          <h4>Shop</h4>
          <ul>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('shop'); }}>All Products</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('sale'); }}>Sale</a></li>
            <li><a href="#">New Arrivals</a></li>
            <li><a href="#">Bestsellers</a></li>
          </ul>
        </div>
        <div className="pt-footer__col pt-footer__col--newsletter">
          <h4>Newsletter</h4>
          <p>Sign up to receive 10% off your first order</p>
          <div className="pt-footer__newsletter-form">
            <input type="email" placeholder="Email address" />
            <button>Subscribe</button>
          </div>
        </div>
      </div>

      <div className="pt-footer__bottom">
        <span>© 2025 Prime Threads. All rights reserved.</span>
        <div className="pt-footer__payments">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" />
        </div>
      </div>
    </footer>
  );

  // ─── RENDER ──────────────────────────────────
  return (
    <div className="pt-app">
      {/* Toast */}
      <div className={`pt-toast ${toast.visible ? 'pt-toast--visible' : ''}`}>
        <CheckCircle size={18} /> {toast.message}
      </div>

      <CartDrawer />
      <ContactModal />

      {/* Sticky Bar on Product Detail */}
      {selectedProduct && (
        <div className={`pt-sticky-bar ${showStickyBar && !addedProduct ? 'pt-sticky-bar--visible' : ''}`}>
          <div className="pt-sticky-bar__info">
            <img src={selectedProduct.image} alt="" />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{selectedProduct.title}</div>
              <div style={{ fontSize: 11 }}>{selectedProduct.price}</div>
            </div>
          </div>
          <button className="pt-btn pt-btn--primary" style={{ padding: '8px 20px', fontSize: 11 }} onClick={() => handleAddToCart(selectedProduct)}>
            Add to Cart
          </button>
        </div>
      )}

      {selectedProduct ? (
        <>
          <NavBar dark={false} />
          <ProductDetail />
        </>
      ) : currentView === 'shop' ? (
        <>
          <NavBar dark={false} />
          <ProductsGrid title="All Products" subtitle="Browse our complete collection" productList={products} />
        </>
      ) : currentView === 'sale' ? (
        <>
          <NavBar dark={false} />
          <ProductsGrid title="Sale" subtitle="Limited time offers on selected items" productList={products} />
        </>
      ) : (
        <>
          <NavBar dark={true} />
          <HeroSection />
          <ProductsGrid title="Just arrived" subtitle="Our newest additions to the collection" productList={products} />
        </>
      )}

      <Footer />

      <button className="pt-back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <ArrowUp size={20} strokeWidth={2} />
      </button>
    </div>
  );
}

export default App;
