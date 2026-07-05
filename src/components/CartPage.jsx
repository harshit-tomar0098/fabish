import { useState } from 'react';
import { Trash2, ShoppingBag, CheckCircle2, ChevronLeft, CreditCard, Sparkles, Leaf } from 'lucide-react';

function CartPage({ 
  cart, 
  updateQuantity, 
  removeFromCart, 
  navigateToListing, 
  navigateToDetail,
  clearCart 
}) {
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [simulatedOrderId, setSimulatedOrderId] = useState('');

  // Currency Formatter Helper
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Calculations
  const rawSubtotal = cart.reduce((total, item) => {
    const originalPrice = item.product.price / (1 - (item.product.discountPercentage / 100));
    return total + (originalPrice * item.quantity);
  }, 0);

  const discountedSubtotal = cart.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);

  const totalSavings = rawSubtotal - discountedSubtotal;
  
  const estimatedTax = discountedSubtotal * 0.12;

  const shippingThreshold = 150;
  const shippingFee = discountedSubtotal > shippingThreshold ? 0 : 15;

  const grandTotal = discountedSubtotal + estimatedTax + shippingFee;

  const handleCheckout = () => {
    const randomOrderId = 'FAB-' + Math.floor(100000 + Math.random() * 900000);
    setSimulatedOrderId(randomOrderId);
    setCheckoutSuccess(true);
  };

  const handleCloseCheckout = () => {
    setCheckoutSuccess(false);
    clearCart();
    navigateToListing();
  };

  // 3D Parallax Tilt Event Handlers
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((centerY - y) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    card.style.setProperty('--tilt-x', `${rotateX}deg`);
    card.style.setProperty('--tilt-y', `${rotateY}deg`);
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  };

  if (cart.length === 0) {
    return (
      <div className="container page-transition" style={{ paddingTop: '2rem' }}>
        <div className="empty-state" id="empty-cart-state">
          <ShoppingBag size={64} style={{ color: 'var(--text-tertiary)' }} />
          <h2>Your Cart is Empty</h2>
          <p>Before you checkout, discover our organic skincare formulas. Find your perfect routine in our catalog.</p>
          <button className="btn btn-primary" onClick={navigateToListing} id="btn-empty-cart-browse">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-transition" id="cart-page-view" style={{ paddingTop: '2rem' }}>
      
      {/* Checkout Success Modal Overlay */}
      {checkoutSuccess && (
        <div className="modal-overlay" id="checkout-success-modal">
          <div className="modal-content" style={{ borderRadius: '32px' }}>
            <div className="success-icon-wrapper" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
              <CheckCircle2 size={40} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '500' }}>Order Confirmed!</h3>
            <p>Thank you for your purchase. Your order has been placed successfully and is being prepared with botanical care.</p>
            
            <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '12px 16px', marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Order ID: <strong style={{ color: 'var(--text-primary)' }}>{simulatedOrderId}</strong>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleCloseCheckout} id="btn-success-close">
              Back to Catalog
            </button>
          </div>
        </div>
      )}

      {/* Hero Link */}
      <button className="btn btn-secondary back-to-listing-btn" onClick={navigateToListing} id="btn-cart-back-to-shop">
        <ChevronLeft size={16} />
        Continue Shopping
      </button>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: '500' }}>
        Your <span style={{ color: 'var(--accent-primary)' }}>Shopping Bag</span>
      </h1>

      {/* Cart Layout grid */}
      <div className="cart-layout">
        {/* Left list of items */}
        <div className="cart-items-section" id="cart-items-list">
          {cart.map((item) => {
            const originalPrice = item.product.price / (1 - (item.product.discountPercentage / 100));
            const hasDiscount = item.product.discountPercentage > 5;
            
            return (
              <div key={item.product.id} className="cart-card" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '24px' }} id={`cart-card-${item.product.id}`}>
                <div className="cart-img-wrapper" style={{ backgroundColor: 'var(--bg-primary)' }}>
                  <img src={item.product.thumbnail} alt={item.product.title} />
                </div>

                <div className="cart-item-info">
                  <span className="cart-item-cat">{item.product.category}</span>
                  <h3 
                    className="cart-item-title" 
                    onClick={() => navigateToDetail(item.product.id)}
                    style={{ fontWeight: '500' }}
                  >
                    {item.product.title}
                  </h3>
                  
                  <div className="cart-item-prices">
                    <span className="cart-item-current" style={{ color: 'var(--text-primary)' }}>{formatPrice(item.product.price)}</span>
                    {hasDiscount && (
                      <span className="cart-item-orig">{formatPrice(originalPrice)}</span>
                    )}
                  </div>
                </div>

                <div className="cart-item-actions">
                  <div className="quantity-controller" style={{ borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-primary)' }}>
                    <button 
                      className="qty-btn" 
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="qty-display">{item.quantity}</span>
                    <button 
                      className="qty-btn" 
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button 
                    className="btn-icon" 
                    style={{ color: 'var(--danger)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-full)' }}
                    onClick={() => removeFromCart(item.product.id)}
                    title="Remove item"
                    id={`btn-cart-remove-${item.product.id}`}
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="cart-item-total" style={{ fontFamily: 'var(--font-sans)', fontWeight: '700' }} id={`cart-item-total-${item.product.id}`}>
                    {formatPrice(item.product.price * item.quantity)}
                  </div>
                </div>
              </div>
            );
          })}
          
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem' }}>
            <button 
              className="btn btn-secondary" 
              style={{ color: 'var(--danger)', borderColor: 'var(--border-color)' }}
              onClick={clearCart}
              id="btn-clear-cart"
            >
              Clear Shopping Cart
            </button>
          </div>
        </div>

        {/* Right Bill Summary Card */}
        <div 
          className="bill-summary-card" 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '28px' }}
          id="cart-bill-summary"
        >
          <h2 style={{ fontWeight: '500' }}>Bill Summary</h2>
          
          <div className="summary-rows">
            {totalSavings > 0 && (
              <div className="summary-row">
                <span>Original Subtotal</span>
                <span>{formatPrice(rawSubtotal)}</span>
              </div>
            )}
            
            {totalSavings > 0 && (
              <div className="summary-row">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
                  Store Savings
                </span>
                <span className="summary-discount-val" style={{ color: 'var(--success)' }}>-{formatPrice(totalSavings)}</span>
              </div>
            )}
            
            <div className="summary-row" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
              <span>Subtotal</span>
              <span>{formatPrice(discountedSubtotal)}</span>
            </div>
            
            <div className="summary-row">
              <span>Estimated Tax (12%)</span>
              <span>{formatPrice(estimatedTax)}</span>
            </div>
            
            <div className="summary-row">
              <span>Shipping Fee</span>
              {shippingFee === 0 ? (
                <span className="summary-discount-val" style={{ color: 'var(--success)' }}>FREE</span>
              ) : (
                <span>{formatPrice(shippingFee)}</span>
              )}
            </div>

            {shippingFee > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '-8px', textAlign: 'right' }}>
                Add {formatPrice(shippingThreshold - discountedSubtotal)} more for FREE shipping
              </div>
            )}
          </div>

          <div className="summary-rows">
            <div className="summary-row-bold" style={{ borderTop: '1px dashed var(--border-color)', color: 'var(--text-primary)' }}>
              <span>Total Price</span>
              <span id="bill-grand-total">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <button 
            className="btn checkout-confirm-btn btn-checkout" 
            onClick={handleCheckout}
            id="btn-cart-checkout"
          >
            <CreditCard size={18} />
            Confirm & Pay {formatPrice(grandTotal)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
