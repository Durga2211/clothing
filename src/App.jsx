import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, User, ShoppingBag, Store, Tag, ChevronLeft, ChevronRight, ArrowUp, CheckCircle, Mail, Menu, X, Truck, RotateCcw } from 'lucide-react';
import './index.css';

function App({ products: allProducts = [] }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [addedProduct, setAddedProduct] = useState(null);
  const [toast, setToast] = useState({ message: '', visible: false });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const productsRef = useRef(null);

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

  const handleAddToCart = (product) => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      showNotification('Please select a size first.');
      return;
    }
    setCartCount(prev => prev + quantity);
    setAddedProduct(product);
    showNotification(`${product.title} (${selectedSize || 'One Size'}) added to your cart.`);
    setTimeout(() => {
      setAddedProduct(null);
    }, 4000);
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

  const relatedProducts = [
    { id: 5, title: 'MID-RISE JEANS WITH WIDE-LEG', price: 'Rs. 6,250.00', image: '/related1.png' },
    { id: 6, title: 'AQUASHIELD WINDBREAKER', price: 'Rs. 9,150.00', image: '/related2.png' },
    { id: 7, title: 'LIGHT GREY COZY CHIC TEE', price: 'Rs. 2,900.00', image: '/related3.png' },
    { id: 8, title: 'DARK GREY COZY CHIC TEE', price: 'Rs. 2,900.00', image: '/related4.png' }
  ];

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const MegaMenu = () => (
    <div className="mega-menu dropdown-content">
      <div className="menu-column">
        <h5>Featured</h5>
        <ul className="menu-links">
          <li><a href="#">NEW</a></li>
          <li><a href="#">BESTSELLERS</a></li>
          <li><a href="#">BASICS</a></li>
        </ul>
      </div>
      <div className="menu-column">
        <h5>Categories</h5>
        <ul className="menu-links" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <li><a href="#">TOPS</a></li>
          <li><a href="#">JEANS</a></li>
          <li><a href="#">SHORTS</a></li>
          <li><a href="#">T-SHIRTS</a></li>
          <li><a href="#">BOTTOMS</a></li>
          <li><a href="#">SWEATPANTS</a></li>
          <li><a href="#">JACKETS & COATS</a></li>
          <li><a href="#">HOODIES & SWEATSHIRTS</a></li>
        </ul>
      </div>
      <div className="menu-spotlight">
        <div className="spotlight-card">
          <img src="/spotlight1.png" alt="" />
          <div className="spotlight-overlay">
            <span>SPOTLIGHT</span>
            <h3>Transient Echoes</h3>
          </div>
        </div>
        <div className="spotlight-card">
          <img src="/spotlight2.png" alt="" />
          <div className="spotlight-overlay">
            <span>SS26</span>
            <h3>Get ready for the sun</h3>
          </div>
        </div>
      </div>
    </div>
  );

  const PagesDropdown = () => (
    <div className="pages-dropdown dropdown-content">
      <ul className="pages-links">
        <li><a href="#">FAQ</a></li>
        <li><a href="#">Blog</a></li>
        <li><a href="#">Lookbook</a></li>
        <li><a href="#">Content tiles</a></li>
      </ul>
      <div className="pages-image">
        <img src="/hero_new_banner.png" alt="" />
      </div>
    </div>
  );

  const NavBar = ({ transparent }) => (
    <nav className={`main-nav ${transparent ? 'transparent' : ''}`}>
      <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="nav-item">
          <a href="#" className={!selectedProduct ? 'active' : ''} onClick={(e) => { e.preventDefault(); handleBackToHome(); setMobileMenuOpen(false); }}>HOME</a>
        </div>
        <div className="nav-item">
          <a href="#">SHOP <ChevronDown size={14} className="desktop-only" /></a>
          <MegaMenu />
        </div>
        <div className="nav-item">
          <a href="#">PAGES <ChevronDown size={14} className="desktop-only" /></a>
          <PagesDropdown />
        </div>
        <div className="nav-item">
          <a href="#">CONTACT</a>
        </div>
      </div>
      <div className="logo" onClick={handleBackToHome} style={{ cursor: 'pointer' }}>release</div>
      <div className="nav-actions">
        <button className="icon-button"><Search size={20} strokeWidth={1.5} /></button>
        <button className="icon-button desktop-only"><User size={20} strokeWidth={1.5} /></button>
        <button className="icon-button">
          <ShoppingBag size={20} strokeWidth={1.5} />
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
      </div>
    </nav>
  );

  const Footer = () => (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-section footer-newsletter">
          <h4>NEWSLETTER</h4>
          <p>Sign up to receive 10% off your first order</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Email address" />
            <button>SUBSCRIBE</button>
          </div>
        </div>
        <div className="footer-section">
          <h4>COMPANY</h4>
          <ul className="footer-links">
            <li><a href="#">Search</a></li>
            <li><a href="#">Contact</a></li>
            <li><a href="#">Terms</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>PAGES</h4>
          <ul className="footer-links">
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Lookbook</a></li>
            <li><a href="#">Collections</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>SHOP</h4>
          <ul className="footer-links">
            <li><a href="#">Tops</a></li>
            <li><a href="#">T-shirts</a></li>
            <li><a href="#">Knitwear</a></li>
            <li><a href="#">Dresses</a></li>
            <li><a href="#">Bottoms</a></li>
            <li><a href="#">Jackets & Coats</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-brand">
        <div className="footer-logo">release</div>
        <div className="footer-tagline">
          Release is a premium official Shopify theme designed by DigiFist.
        </div>
        <div className="footer-socials">
          <a href="#"><Search size={20} /></a>
          <a href="#"><User size={20} /></a>
          <a href="#"><Mail size={20} /></a>
          <a href="#"><ShoppingBag size={20} /></a>
        </div>
      </div>

      <div className="footer-bottom">
        <div>Copyright © 2026 DigiFist. All rights reserved. Powered by Shopify.</div>
        <div className="payment-icons">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" />
        </div>
      </div>
    </footer>
  );

  return (
    <div className="app-container">
      {/* Toast Notification */}
      <div className={`toast ${toast.visible ? 'visible' : ''}`}>
        <CheckCircle size={18} /> {toast.message}
      </div>

      {/* Sticky Added Bar */}
      <div className={`sticky-added-bar ${addedProduct ? 'visible' : ''}`}>
        <div className="sticky-added-content">
          <div className="product-snippet">
            <img src={addedProduct?.image} alt="" />
            <div className="product-snippet-info">
              <span className="name">{addedProduct?.title}</span>
              <span className="price">{addedProduct?.price}</span>
            </div>
          </div>
          <button className="btn-black" style={{ padding: '10px 30px', fontSize: '12px' }}>VIEW CART</button>
        </div>
      </div>

      {selectedProduct ? (
        <>
          {/* Sticky Product Bar */}
          <div className={`sticky-product-bar ${showStickyBar && !addedProduct ? 'visible' : ''}`}>
            <div className="sticky-info">
              <img src={selectedProduct.image} alt="" />
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700' }}>{selectedProduct.title}</div>
                <div style={{ fontSize: '11px' }}>{selectedProduct.price}</div>
              </div>
            </div>
            <button className="btn-black" style={{ padding: '8px 20px', fontSize: '10px' }} onClick={() => handleAddToCart(selectedProduct)}>
              {addedProduct?.id === selectedProduct.id ? 'ADDED!' : 'ADD TO CART'}
            </button>
          </div>

          <NavBar transparent={false} />

          <div className="product-page">
            <div className="product-detail-container">
              <div className="product-images-grid">
                {selectedProduct.images.map((img, i) => (
                  <img key={i} src={img} alt="" />
                ))}
              </div>

              <div className="product-info-panel">
                <div className="product-header">
                  <h1>{selectedProduct.title}</h1>
                  <div className="price">{selectedProduct.price} <span style={{ fontSize: '10px', color: '#888' }}>TAXES INCLUDED.</span></div>
                </div>

                <div className="product-description">
                  {selectedProduct.description}
                  <div style={{ marginTop: '10px', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}>READ MORE +</div>
                </div>

                {/* ─── SIZE SELECTOR ─── */}
                {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                  <div className="size-selector">
                    <div className="size-label">SIZE <strong>{selectedSize || ''}</strong></div>
                    <div className="size-options">
                      {selectedProduct.sizes.map((size) => (
                        <button
                          key={size}
                          className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="buy-buttons">
                  {/* Quantity Selector */}
                  <div className="quantity-selector">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)}>+</button>
                  </div>

                  <button className="btn-black btn-add-cart" onClick={() => handleAddToCart(selectedProduct)}>
                    {addedProduct?.id === selectedProduct.id ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                         <CheckCircle size={16} /> ADDED TO CART
                      </span>
                    ) : 'ADD TO CART'}
                  </button>
                  <button className="btn-outline btn-buy-now" onClick={() => handleBuyNow(selectedProduct)}>BUY IT NOW</button>
                </div>

                <div className="product-meta">
                  <div className="stock-alert">
                     <CheckCircle size={16} color="#10b981" /> Wardrobe upgrade in process.
                  </div>
                  <div className="stock-alert">
                     <CheckCircle size={16} color="#10b981" /> Good clothes. No second thoughts.
                  </div>
                  <div className="stock-alert">
                     <CheckCircle size={16} color="#10b981" /> Secure online payment
                  </div>
                  <div className="stock-alert">
                     <CheckCircle size={16} color="#10b981" /> Free shipping on prepaid orders
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="trust-badges">
                  <div className="trust-badge">
                    <Truck size={20} />
                    <span>FREE SHIPPING ON PREPAID ORDERS</span>
                  </div>
                  <div className="trust-badge">
                    <RotateCcw size={20} />
                    <span>EASY RETURNS</span>
                  </div>
                </div>
              </div>
            </div>

            <section className="related-section">
              <h2 className="related-title">You may also like</h2>
              <div className="products-grid">
                {relatedProducts.map(product => (
                  <div key={product.id} className="product-card" onClick={() => handleProductClick(product)}>
                    <div className="product-image-container">
                      <img src={product.image} alt={product.title} />
                    </div>
                    <div className="product-info">
                      <span className="product-title">{product.title}</span>
                      <span className="product-price">{product.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      ) : (
        <>
          <NavBar transparent={true} />

          <main className="hero">
            <img src="/hero_new_banner.png" alt="" className="hero-bg" />
            <div className="hero-overlay" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 40%, rgba(0,0,0,0.8) 100%)' }}></div>
            <div className="hero-content" style={{ marginTop: '30vh' }}>
              <span className="hero-subtitle" style={{ fontSize: '14px', letterSpacing: '2px', fontWeight: '600', color: '#fff' }}>NOW LIVE</span>
              <h1 className="hero-title" style={{ fontSize: '48px', letterSpacing: '1px', textTransform: 'uppercase', color: '#fff' }}>BLACK FRIDAY SALE</h1>
              <button 
                className="hero-button" 
                onClick={scrollToProducts}
                style={{ border: 'none', borderBottom: '1px solid #fff', borderRadius: '0', padding: '0 0 4px 0', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px', color: '#fff', background: 'none', cursor: 'pointer' }}>
                &rarr; ENTER THE SALE
              </button>
            </div>
          </main>

          <section className="products-section" ref={productsRef}>
            <div className="section-header">
              <h2 className="section-title">Just arrived</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                <a href="#" className="view-all" style={{ borderBottom: '1px solid #000', textDecoration: 'none', color: '#000', fontSize: '11px', fontWeight: '700' }}>VIEW ALL</a>
                <div style={{ display: 'flex', gap: '12px', color: '#888' }}>
                  <ChevronLeft size={20} strokeWidth={1} />
                  <ChevronRight size={20} strokeWidth={1} />
                </div>
              </div>
            </div>

            <div className="products-grid">
              {products.map(product => (
                <div key={product.id} className="product-card" onClick={() => handleProductClick(product)}>
                  <div className="product-image-container">
                    <img src={product.image} alt={product.title} />
                  </div>
                  <div className="product-info">
                    <span className="product-title">{product.title}</span>
                    <span className="product-price">{product.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <Footer />

      <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <ArrowUp size={20} strokeWidth={2} />
      </button>
    </div>
  );
}

export default App;
