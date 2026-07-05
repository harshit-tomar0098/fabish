import { useState, useEffect } from 'react';
import { ShoppingBag, Sun, Moon, Leaf, Search } from 'lucide-react';

function Navbar({ currentView, cartCount, toggleTheme, currentTheme, setView }) {
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll listener to toggle solid background when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = currentView === 'listing' && !isScrolled;
  const headerClass = `navbar ${isTransparent ? 'navbar-transparent navbar-on-hero' : 'navbar-solid'}`;

  return (
    <header className={headerClass} id="main-navigation-header">
      <div className="container navbar-container">
        {/* Brand Logo matching Fabish style */}
        <div className="navbar-brand" onClick={() => setView('listing')} id="nav-brand-logo">
          <Leaf size={28} fill="currentColor" style={{ transform: 'rotate(-15deg)' }} />
          <span>Fabish</span>
        </div>

        {/* Navigation Menu links */}
        <nav className="navbar-menu" id="nav-menu-bar">
          <span 
            className={`nav-link ${currentView === 'listing' ? 'active' : ''}`}
            onClick={() => setView('listing')}
            id="nav-link-home"
          >
            Home
          </span>
          <span 
            className="nav-link" 
            onClick={() => { setView('listing'); setTimeout(() => { document.getElementById('skin-first-section')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }}
            id="nav-link-shop"
          >
            Shop
          </span>
          <span 
            className="nav-link" 
            onClick={() => { setView('listing'); setTimeout(() => { document.getElementById('category-grid-dashboard')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }}
            id="nav-link-products"
          >
            Products
          </span>
          <span 
            className="nav-link" 
            onClick={() => alert("Fabish by Jovac is a premium organic skincare retailer providing botanically-active solutions.")}
            id="nav-link-about"
          >
            About Us
          </span>
          <span 
            className="nav-link" 
            onClick={() => alert("Get in touch at contact@fabishskincare.com or (+1) 800-FABISH")}
            id="nav-link-contact"
          >
            Contact
          </span>
        </nav>

        {/* Header Actions */}
        <div className="navbar-actions" id="nav-actions-bar">
          {/* Quick Search trigger */}
          <button 
            className="btn-icon" 
            onClick={() => { setView('listing'); setTimeout(() => { document.getElementById('search-products-input')?.focus(); }, 150); }}
            title="Search products"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* Theme Toggle Button */}
          <button 
            className="btn-icon" 
            onClick={toggleTheme} 
            title={currentTheme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            id="btn-toggle-theme"
            aria-label="Toggle theme"
          >
            {currentTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Cart Icon Button */}
          <button 
            className="btn-icon cart-icon-btn" 
            onClick={() => setView('cart')}
            title="Open Shopping Cart"
            id="btn-navbar-cart"
            aria-label="View cart"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="cart-badge" id="navbar-cart-badge">{cartCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
