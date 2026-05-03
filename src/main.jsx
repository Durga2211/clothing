import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Admin from './Admin.jsx'

// Default products that ship with the store
const DEFAULT_PRODUCTS = [
  { 
    id: 1, 
    title: 'BLACK PUFFER EDGE', 
    price: 'Rs. 7,499.00', 
    image: '/product1.png',
    description: 'A modern twist on the classic puffer, the Black Puffer Edge features an oversized collar and minimalist design. Warm, water-resistant, and perfect for layering—this jacket is a seasonal essential.',
    images: ['/product1.png', '/puffer_crop1.png', '/puffer_crop2.png', '/product1.png'],
    sizes: ['S', 'M', 'L', 'XL']
  },
  { id: 2, title: 'BLACK BLAZER DRESS', price: 'Rs. 5,499.00', image: '/product2.png', description: 'Elegant tailored blazer dress.', images: ['/product2.png', '/product2.png'], sizes: ['XS', 'S', 'M', 'L'] },
  { id: 3, title: 'BLACK HIGH-WAIST JEANS', price: 'Rs. 3,999.00', image: '/product3.png', description: 'Classic wide-leg denim.', images: ['/product3.png', '/product3.png'], sizes: ['28', '30', '32', '34', '36'] },
  { id: 4, title: 'BLACK PUFFER JACKET', price: 'Rs. 5,799.00', image: '/product4.png', description: 'Daily essential puffer.', images: ['/product4.png', '/product4.png'], sizes: ['M', 'L', 'XL'] },
];

function Root() {
  const [route, setRoute] = useState(window.location.hash);
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      let data = await res.json();
      if (data.length === 0) {
        const seedRes = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(DEFAULT_PRODUCTS)
        });
        data = await seedRes.json();
      }
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts(DEFAULT_PRODUCTS);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const addProducts = async (newProducts) => {
    const maxId = products.reduce((max, p) => Math.max(max, p.id), 0);
    const withIds = newProducts.map((p, i) => ({ ...p, id: maxId + i + 1 }));
    
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withIds)
      });
      const savedProducts = await res.json();
      setProducts(prev => [...prev, ...savedProducts]);
    } catch (err) {
      console.error('Failed to add products:', err);
      setProducts(prev => [...prev, ...withIds]);
    }
  };

  const updateProduct = async (id, updates) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updated = await res.json();
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
    } catch (err) {
      console.error('Failed to update product:', err);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete product:', err);
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  if (route === '#/admin') {
    return <Admin onBack={() => { window.location.hash = ''; }} products={products} addProducts={addProducts} updateProduct={updateProduct} deleteProduct={deleteProduct} />;
  }

  return <App products={products} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
