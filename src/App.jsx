import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ListingPage from './components/ListingPage';
import ProductDetailPage from './components/ProductDetailPage';
import CartPage from './components/CartPage';

function App() {
  // Global States
  const [currentView, setCurrentView] = useState('listing'); // 'listing' | 'detail' | 'cart'
  const [selectedProductId, setSelectedProductId] = useState(null);
  
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('jovac-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('jovac-theme');
    if (savedTheme) return savedTheme;
    // Fallback to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Sync Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('jovac-cart', JSON.stringify(cart));
  }, [cart]);

  // Sync Theme to HTML Attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('jovac-theme', theme);
  }, [theme]);

  // View Navigation Helpers
  const navigateToListing = () => {
    setCurrentView('listing');
    setSelectedProductId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToDetail = (productId) => {
    setSelectedProductId(productId);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCart = () => {
    setCurrentView('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Cart Operation Functions
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculate cart badge counts
  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="app-layout">
      <Navbar 
        currentView={currentView}
        cartCount={totalCartItems}
        toggleTheme={toggleTheme}
        currentTheme={theme}
        setView={(view) => {
          if (view === 'listing') navigateToListing();
          if (view === 'cart') navigateToCart();
        }}
      />
      
      <main>
        {currentView === 'listing' && (
          <ListingPage 
            navigateToDetail={navigateToDetail} 
            addToCart={addToCart} 
          />
        )}
        
        {currentView === 'detail' && (
          <ProductDetailPage 
            productId={selectedProductId}
            navigateToListing={navigateToListing}
            addToCart={addToCart}
          />
        )}
        
        {currentView === 'cart' && (
          <CartPage 
            cart={cart}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            navigateToListing={navigateToListing}
            navigateToDetail={navigateToDetail}
            clearCart={clearCart}
          />
        )}
      </main>
    </div>
  );
}

export default App;
