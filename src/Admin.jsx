import React, { useState, useRef } from 'react';
import { ShoppingBag, Users, TrendingUp, DollarSign, Package, ArrowUp, ArrowDown, LogOut, Eye, ChevronDown, BarChart3, Clock, CheckCircle, Search, Plus, X, Upload, Save, Trash2, Image, Edit3 } from 'lucide-react';

const ADMIN_USER = 'fardad';
const ADMIN_PASS = '1234567890';

function Admin({ onBack, products = [], addProducts, updateProduct, deleteProduct }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [saveToast, setSaveToast] = useState('');
  const [editingSizes, setEditingSizes] = useState(null); // { id, sizes: 'S, M, L' }

  // ─── ADD PRODUCTS STATE ──────────────────────
  const [newItems, setNewItems] = useState([]);

  const createEmptyItem = () => ({
    tempId: Date.now() + Math.random(),
    title: '',
    price: '',
    description: '',
    sizes: '',
    image: null,        // data URL for main image
    imagePreview: null,  
    extraImages: [],     // array of data URLs
  });

  const addNewItemSlot = () => {
    setNewItems(prev => [...prev, createEmptyItem()]);
  };

  const removeNewItem = (tempId) => {
    setNewItems(prev => prev.filter(item => item.tempId !== tempId));
  };

  const updateNewItem = (tempId, field, value) => {
    setNewItems(prev => prev.map(item => 
      item.tempId === tempId ? { ...item, [field]: value } : item
    ));
  };

  const handleImageUpload = (tempId, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updateNewItem(tempId, 'image', e.target.result);
      updateNewItem(tempId, 'imagePreview', e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleExtraImages = (tempId, files) => {
    const fileArray = Array.from(files);
    const readers = fileArray.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(dataUrls => {
      setNewItems(prev => prev.map(item =>
        item.tempId === tempId
          ? { ...item, extraImages: [...item.extraImages, ...dataUrls] }
          : item
      ));
    });
  };

  const removeExtraImage = (tempId, imgIndex) => {
    setNewItems(prev => prev.map(item =>
      item.tempId === tempId
        ? { ...item, extraImages: item.extraImages.filter((_, i) => i !== imgIndex) }
        : item
    ));
  };

  const handleSaveAll = () => {
    const validItems = newItems.filter(item => item.title && item.price && item.image);
    if (validItems.length === 0) {
      setSaveToast('Please fill in at least one product with a name, price, and image.');
      setTimeout(() => setSaveToast(''), 3000);
      return;
    }

    const formatted = validItems.map(item => ({
      title: item.title.toUpperCase(),
      price: item.price.startsWith('Rs.') ? item.price : `Rs. ${item.price}`,
      description: item.description || `${item.title} — premium quality.`,
      image: item.image,
      images: [item.image, ...item.extraImages],
      sizes: item.sizes ? item.sizes.split(',').map(s => s.trim()).filter(Boolean) : ['ONE SIZE'],
    }));

    addProducts(formatted);
    setNewItems([]);
    setSaveToast(`${formatted.length} product${formatted.length > 1 ? 's' : ''} saved and live on the store!`);
    setTimeout(() => setSaveToast(''), 4000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  // Mock data for dashboard
  const stats = [
    { label: 'Total Revenue', value: '₹12,84,500', change: '+14.2%', positive: true, icon: DollarSign },
    { label: 'Total Orders', value: '156', change: '+8.7%', positive: true, icon: ShoppingBag },
    { label: 'New Customers', value: '43', change: '+12.1%', positive: true, icon: Users },
    { label: 'Conversion Rate', value: '3.2%', change: '-0.4%', positive: false, icon: TrendingUp },
  ];

  const recentOrders = [
    { id: '#ORD-2841', customer: 'Arjun Mehta', product: 'BLACK PUFFER EDGE', price: 'Rs. 7,499', status: 'Delivered', date: '28 Apr 2026' },
    { id: '#ORD-2840', customer: 'Sofia Rossi', product: 'BLACK BLAZER DRESS', price: 'Rs. 5,499', status: 'Shipped', date: '27 Apr 2026' },
    { id: '#ORD-2839', customer: 'Liam Chen', product: 'BLACK HIGH-WAIST JEANS', price: 'Rs. 3,999', status: 'Processing', date: '27 Apr 2026' },
    { id: '#ORD-2838', customer: 'Emma Davis', product: 'AQUASHIELD WINDBREAKER', price: 'Rs. 9,150', status: 'Delivered', date: '26 Apr 2026' },
    { id: '#ORD-2837', customer: 'Kai Nakamura', product: 'BLACK PUFFER JACKET', price: 'Rs. 5,799', status: 'Delivered', date: '26 Apr 2026' },
    { id: '#ORD-2836', customer: 'Priya Sharma', product: 'LIGHT GREY COZY CHIC TEE', price: 'Rs. 2,900', status: 'Shipped', date: '25 Apr 2026' },
  ];

  const topProducts = [
    { name: 'BLACK PUFFER EDGE', sold: 48, revenue: '₹3,59,952', image: '/product1.png' },
    { name: 'AQUASHIELD WINDBREAKER', sold: 35, revenue: '₹3,20,250', image: '/related2.png' },
    { name: 'BLACK BLAZER DRESS', sold: 29, revenue: '₹1,59,471', image: '/product2.png' },
    { name: 'BLACK HIGH-WAIST JEANS', sold: 22, revenue: '₹87,978', image: '/product3.png' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return '#10b981';
      case 'Shipped': return '#3b82f6';
      case 'Processing': return '#f59e0b';
      default: return '#888';
    }
  };

  // ─── LOGIN SCREEN ─────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-logo">release</div>
            <h2>Admin Panel</h2>
            <p>Enter your credentials to access the dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="admin-login-form">
            {loginError && <div className="login-error">{loginError}</div>}
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
            <button type="submit" className="admin-login-btn">SIGN IN</button>
          </form>
          <div className="admin-login-footer">
            <a href="#" onClick={onBack}>← Back to Store</a>
          </div>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD ─────────────────────────────
  return (
    <div className="admin-layout">
      {/* Save Toast */}
      {saveToast && (
        <div className="admin-toast">
          <CheckCircle size={18} /> {saveToast}
        </div>
      )}

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">release</div>
        <nav className="sidebar-nav">
          <button className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <BarChart3 size={18} /> Dashboard
          </button>
          <button className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <ShoppingBag size={18} /> Orders
          </button>
          <button className={`sidebar-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            <Package size={18} /> Products
          </button>
          <button className={`sidebar-link ${activeTab === 'add-products' ? 'active' : ''}`} onClick={() => setActiveTab('add-products')}>
            <Plus size={18} /> Add Products
          </button>
          <button className={`sidebar-link ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
            <Users size={18} /> Customers
          </button>
        </nav>
        <div className="sidebar-bottom">
          <button className="sidebar-link" onClick={onBack}>
            <Eye size={18} /> View Store
          </button>
          <button className="sidebar-link logout" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1 className="admin-page-title">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'orders' && 'Orders'}
              {activeTab === 'products' && 'Products'}
              {activeTab === 'add-products' && 'Add New Products'}
              {activeTab === 'customers' && 'Customers'}
            </h1>
            <p className="admin-page-subtitle">Welcome back, Fardad</p>
          </div>
          <div className="admin-header-actions">
            <div className="admin-search">
              <Search size={16} />
              <input type="text" placeholder="Search..." />
            </div>
            <div className="admin-avatar">F</div>
          </div>
        </header>

        {/* ═══ DASHBOARD TAB ═══ */}
        {activeTab === 'dashboard' && (
          <div className="admin-content">
            <div className="stats-grid">
              {stats.map((stat, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-icon-wrap">
                    <stat.icon size={20} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">{stat.label}</span>
                    <span className="stat-value">{stat.value}</span>
                    <span className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                      {stat.positive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      {stat.change} from last month
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="admin-grid-2">
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3>Recent Orders</h3>
                  <button className="admin-card-action">View All</button>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{order.id}</td>
                        <td>{order.customer}</td>
                        <td>{order.product}</td>
                        <td>{order.price}</td>
                        <td>
                          <span className="status-badge" style={{ color: getStatusColor(order.status), background: `${getStatusColor(order.status)}15` }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ color: '#888' }}>{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-card">
                <div className="admin-card-header">
                  <h3>Top Products</h3>
                  <button className="admin-card-action">View All</button>
                </div>
                <div className="top-products-list">
                  {topProducts.map((product, i) => (
                    <div key={i} className="top-product-item">
                      <div className="top-product-rank">{i + 1}</div>
                      <img src={product.image} alt="" className="top-product-img" />
                      <div className="top-product-info">
                        <span className="top-product-name">{product.name}</span>
                        <span className="top-product-sold">{product.sold} sold</span>
                      </div>
                      <span className="top-product-revenue">{product.revenue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ ORDERS TAB ═══ */}
        {activeTab === 'orders' && (
          <div className="admin-content">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>All Orders</h3>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.product}</td>
                      <td>{order.price}</td>
                      <td>
                        <span className="status-badge" style={{ color: getStatusColor(order.status), background: `${getStatusColor(order.status)}15` }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ color: '#888' }}>{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ PRODUCTS TAB ═══ */}
        {activeTab === 'products' && (
          <div className="admin-content">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Product Inventory ({products.length} items)</h3>
                <button className="add-product-btn" onClick={() => setActiveTab('add-products')}>
                  <Plus size={14} /> Add New
                </button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Sizes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td><img src={p.image} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, background: '#f5f5f5' }} /></td>
                      <td style={{ fontWeight: 600 }}>{p.title}</td>
                      <td>{p.price}</td>
                      <td>
                        {editingSizes?.id === p.id ? (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input
                              type="text"
                              value={editingSizes.sizes}
                              onChange={(e) => setEditingSizes({ ...editingSizes, sizes: e.target.value })}
                              style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12, width: 150, fontFamily: 'inherit' }}
                              placeholder="S, M, L, XL"
                              autoFocus
                            />
                            <button className="add-product-btn" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => {
                              const newSizes = editingSizes.sizes.split(',').map(s => s.trim()).filter(Boolean);
                              updateProduct(p.id, { sizes: newSizes });
                              setEditingSizes(null);
                              setSaveToast('Sizes updated successfully!');
                              setTimeout(() => setSaveToast(''), 3000);
                            }}>
                              <Save size={12} /> Save
                            </button>
                            <button className="delete-btn" style={{ padding: '4px 8px' }} onClick={() => setEditingSizes(null)}>
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                            {(p.sizes || []).map((s, i) => (
                              <span key={i} className="size-badge">{s}</span>
                            ))}
                            <button
                              className="edit-sizes-btn"
                              onClick={() => setEditingSizes({ id: p.id, sizes: (p.sizes || []).join(', ') })}
                              title="Edit sizes"
                            >
                              <Edit3 size={12} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        <button className="delete-btn" onClick={() => deleteProduct(p.id)}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ ADD PRODUCTS TAB ═══ */}
        {activeTab === 'add-products' && (
          <div className="admin-content">
            {/* Action Bar */}
            <div className="add-products-actions">
              <button className="add-item-btn" onClick={addNewItemSlot}>
                <Plus size={16} /> Add New Item
              </button>
              {newItems.length > 0 && (
                <button className="save-all-btn" onClick={handleSaveAll}>
                  <Save size={16} /> Save All ({newItems.length} item{newItems.length > 1 ? 's' : ''})
                </button>
              )}
            </div>

            {newItems.length === 0 ? (
              <div className="empty-add-state">
                <div className="empty-add-icon"><Plus size={40} /></div>
                <h3>No items queued</h3>
                <p>Click "Add New Item" to start adding products to your store.</p>
                <button className="add-item-btn" onClick={addNewItemSlot}>
                  <Plus size={16} /> Add New Item
                </button>
              </div>
            ) : (
              <div className="new-items-list">
                {newItems.map((item, index) => (
                  <div key={item.tempId} className="new-item-card">
                    <div className="new-item-header">
                      <span className="new-item-number">Item #{index + 1}</span>
                      <button className="remove-item-btn" onClick={() => removeNewItem(item.tempId)}>
                        <X size={16} /> Remove
                      </button>
                    </div>

                    <div className="new-item-body">
                      {/* Image Upload Area */}
                      <div className="image-upload-section">
                        <div className="main-image-upload">
                          {item.imagePreview ? (
                            <div className="image-preview">
                              <img src={item.imagePreview} alt="Preview" />
                              <button className="change-image-btn" onClick={() => {
                                updateNewItem(item.tempId, 'image', null);
                                updateNewItem(item.tempId, 'imagePreview', null);
                              }}>
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <label className="upload-zone">
                              <Upload size={24} />
                              <span>Upload Main Image</span>
                              <span className="upload-hint">JPG, PNG — click to browse</span>
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  if (e.target.files[0]) handleImageUpload(item.tempId, e.target.files[0]);
                                }}
                              />
                            </label>
                          )}
                        </div>

                        {/* Extra Images */}
                        <div className="extra-images-row">
                          {item.extraImages.map((img, imgIndex) => (
                            <div key={imgIndex} className="extra-image-thumb">
                              <img src={img} alt="" />
                              <button className="remove-extra-btn" onClick={() => removeExtraImage(item.tempId, imgIndex)}>
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                          <label className="add-extra-btn">
                            <Image size={16} />
                            <span>+</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                if (e.target.files.length) handleExtraImages(item.tempId, e.target.files);
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Details Form */}
                      <div className="item-details-form">
                        <div className="form-group">
                          <label>Product Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Black Leather Jacket"
                            value={item.title}
                            onChange={(e) => updateNewItem(item.tempId, 'title', e.target.value)}
                          />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Price *</label>
                            <input
                              type="text"
                              placeholder="e.g. Rs. 1,999.00"
                              value={item.price}
                              onChange={(e) => updateNewItem(item.tempId, 'price', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Sizes (comma separated)</label>
                            <input
                              type="text"
                              placeholder="e.g. S, M, L, XL"
                              value={item.sizes}
                              onChange={(e) => updateNewItem(item.tempId, 'sizes', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Description</label>
                          <textarea
                            placeholder="Describe this product..."
                            rows={3}
                            value={item.description}
                            onChange={(e) => updateNewItem(item.tempId, 'description', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ CUSTOMERS TAB ═══ */}
        {activeTab === 'customers' && (
          <div className="admin-content">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Customer List</h3>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                    <th>Last Order</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Arjun Mehta', email: 'arjun@example.com', orders: 4, spent: 'Rs. 28,796', last: '28 Apr 2026' },
                    { name: 'Sofia Rossi', email: 'sofia@example.com', orders: 2, spent: 'Rs. 12,998', last: '27 Apr 2026' },
                    { name: 'Liam Chen', email: 'liam@example.com', orders: 1, spent: 'Rs. 3,999', last: '27 Apr 2026' },
                    { name: 'Emma Davis', email: 'emma@example.com', orders: 6, spent: 'Rs. 43,300', last: '26 Apr 2026' },
                    { name: 'Kai Nakamura', email: 'kai@example.com', orders: 3, spent: 'Rs. 19,997', last: '26 Apr 2026' },
                    { name: 'Priya Sharma', email: 'priya@example.com', orders: 1, spent: 'Rs. 2,900', last: '25 Apr 2026' },
                  ].map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td style={{ color: '#888' }}>{c.email}</td>
                      <td>{c.orders}</td>
                      <td>{c.spent}</td>
                      <td style={{ color: '#888' }}>{c.last}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Admin;
