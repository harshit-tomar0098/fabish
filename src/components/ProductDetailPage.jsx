import { useState, useEffect } from 'react';
import { ArrowLeft, Star, ShoppingCart, Calendar, AlertCircle } from 'lucide-react';
import { mockSkincareProducts } from '../data/mockProducts';

function ProductDetailPage({ productId, navigateToListing, addToCart }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  useEffect(() => {
    if (!productId) return;
    
    const fetchProductDetails = async () => {
      // If it is one of our custom mock products, load it locally
      const mockProd = mockSkincareProducts.find(p => p.id === Number(productId));
      if (mockProd) {
        setProduct(mockProd);
        setActiveImage(mockProd.thumbnail);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`https://dummyjson.com/products/${productId}`);
        if (!response.ok) {
          throw new Error('Product details could not be loaded.');
        }
        const data = await response.json();
        setProduct(data);
        setActiveImage(data.thumbnail);
        setError(null);
      } catch (err) {
        // Fallback: see if we can find it in our mock list (e.g. if we are offline)
        const fallbackProd = mockSkincareProducts.find(p => p.id === Number(productId)) || mockSkincareProducts[0];
        if (fallbackProd) {
          console.warn('Failed to fetch details, falling back to mock product:', err);
          setProduct(fallbackProd);
          setActiveImage(fallbackProd.thumbnail);
          setError(null);
        } else {
          setError(err.message || 'Something went wrong fetching details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  // Adjust quantity
  const incrementQty = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQty = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // 3D Parallax Tilt Event Handlers for main image card
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((centerY - y) / centerY) * 12;
    const rotateY = ((x - centerX) / centerX) * 12;
    
    card.style.setProperty('--tilt-x', `${rotateX}deg`);
    card.style.setProperty('--tilt-y', `${rotateY}deg`);
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  };

  // Helper: Format Price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="container page-transition" style={{ paddingTop: '2.5rem' }}>
        <div style={{ height: '38px', width: '130px', marginBottom: '2rem' }} className="skeleton" />
        
        <div className="detail-layout">
          <div>
            <div className="skeleton" style={{ aspectRatio: '4/3', width: '100%', borderRadius: '32px', marginBottom: '1rem' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '16px' }} />
              <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '16px' }} />
            </div>
          </div>
          
          <div>
            <div className="skeleton" style={{ height: '20px', width: '20%', marginBottom: '10px' }} />
            <div className="skeleton" style={{ height: '44px', width: '75%', marginBottom: '15px' }} />
            <div className="skeleton" style={{ height: '30px', width: '100%', borderRadius: '24px', marginBottom: '20px' }} />
            <div className="skeleton" style={{ height: '80px', width: '100%', borderRadius: '24px', marginBottom: '20px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container page-transition">
        <div className="empty-state">
          <AlertCircle size={64} className="text-danger" />
          <h2>Product Not Found</h2>
          <p>{error || 'The requested product detail is unavailable.'}</p>
          <button className="btn btn-primary" onClick={navigateToListing}>
            Return to Catalog
          </button>
        </div>
      </div>
    );
  }

  const originalPrice = product.price / (1 - (product.discountPercentage / 100));
  const hasDiscount = product.discountPercentage > 5;

  let stockClass = 'stock-in';
  let stockLabel = 'In Stock';
  if (product.stock === 0) {
    stockClass = 'stock-out';
    stockLabel = 'Out of Stock';
  } else if (product.stock < 10) {
    stockClass = 'stock-low';
    stockLabel = `Low Stock (${product.stock} left)`;
  }

  return (
    <div className="container page-transition" id="product-detail-view" style={{ paddingTop: '2rem' }}>
      
      {/* Back Button */}
      <button 
        className="btn btn-secondary back-to-listing-btn" 
        onClick={navigateToListing}
        id="btn-back-to-catalog"
      >
        <ArrowLeft size={16} />
        Back to Catalog
      </button>

      {/* Main Detail Grid */}
      <div className="detail-layout">
        {/* Left Column: Image Gallery */}
        <div className="detail-gallery-container">
          <div 
            className="main-image-panel" 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            id="detail-main-image-panel"
            style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '32px' }}
          >
            <img src={activeImage} alt={product.title} />
          </div>
          
          {/* Thumbnails list */}
          {product.images && product.images.length > 1 && (
            <div className="gallery-thumbnails" id="detail-gallery-thumbnails">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  className={`thumbnail-btn ${activeImage === imgUrl ? 'active' : ''}`}
                  onClick={() => setActiveImage(imgUrl)}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information Panel */}
        <div className="detail-info-panel" id="detail-info-panel">
          <span className="detail-brand-badge">{product.category}</span>
          <h1 className="detail-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{product.title}</h1>

          {/* Rating & Brand details */}
          <div className="detail-brand-rating" style={{ marginBottom: '1.8rem' }}>
            <div className="rating-pill">
              <Star size={14} fill="currentColor" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
            {product.brand && (
              <span className="brand-label">Brand: <strong>{product.brand}</strong></span>
            )}
          </div>

          {/* Price Box */}
          <div className="detail-price-section" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '24px' }}>
            <div className="detail-pricing-row">
              <span className="detail-current-price" style={{ fontSize: '2.6rem' }}>{formatPrice(product.price)}</span>
              {hasDiscount && (
                <>
                  <span className="detail-original-price">{formatPrice(originalPrice)}</span>
                  <span className="detail-discount-tag">-{Math.round(product.discountPercentage)}% OFF</span>
                </>
              )}
            </div>
            
            {/* Stock Level Indicator */}
            <div className="detail-stock-row">
              <span className={`stock-indicator ${stockClass}`} />
              <span style={{ color: product.stock === 0 ? 'var(--danger)' : product.stock < 10 ? 'var(--warning)' : 'var(--success)', fontWeight: '600' }}>
                {stockLabel}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="detail-desc" style={{ fontSize: '1.05rem', lineHeight: '1.7' }}>{product.description}</p>

          {/* User Add-to-Cart Action */}
          {product.stock > 0 ? (
            <div className="detail-actions-panel">
              <div className="quantity-controller" style={{ borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-secondary)' }}>
                <button className="qty-btn" onClick={decrementQty} aria-label="Decrease quantity">-</button>
                <span className="qty-display">{quantity}</span>
                <button className="qty-btn" onClick={incrementQty} aria-label="Increase quantity">+</button>
              </div>
              
              <button 
                className="btn btn-primary" 
                style={{ flexGrow: 1, height: '48px' }}
                onClick={() => {
                  addToCart(product, quantity);
                  alert(`Added ${quantity} ${product.title} to cart successfully!`);
                }}
                id="btn-detail-add-to-cart"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            </div>
          ) : (
            <button className="btn btn-secondary" disabled style={{ width: '100%', height: '48px', marginBottom: '2rem' }}>
              Out of Stock
            </button>
          )}

          {/* Technical Specifications */}
          <div className="detail-specs-box">
            <h3>Specifications</h3>
            <div className="specs-grid">
              <div className="spec-item" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px' }}>
                <div className="spec-label">Warranty</div>
                <div className="spec-val">{product.warrantyInformation || 'N/A'}</div>
              </div>
              <div className="spec-item" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px' }}>
                <div className="spec-label">Shipping Policy</div>
                <div className="spec-val">{product.shippingInformation || 'N/A'}</div>
              </div>
              <div className="spec-item" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px' }}>
                <div className="spec-label">Return Policy</div>
                <div className="spec-val">{product.returnPolicy || 'N/A'}</div>
              </div>
              <div className="spec-item" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px' }}>
                <div className="spec-label">Dimensions</div>
                <div className="spec-val">
                  {product.dimensions 
                    ? `${product.dimensions.width}W x ${product.dimensions.height}H x ${product.dimensions.depth}D cm`
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List Section */}
      {product.reviews && product.reviews.length > 0 && (
        <section className="reviews-section" id="product-reviews-section">
          <h2>Customer Reviews</h2>
          <div className="reviews-list">
            {product.reviews.map((rev, idx) => (
              <div key={idx} className="review-card" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '24px' }}>
                <div className="review-header">
                  <span className="review-author" style={{ color: 'var(--text-primary)' }}>{rev.reviewerName}</span>
                  <span className="review-date">
                    <Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    {new Date(rev.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                
                <div className="review-rating">
                  {Array.from({ length: 5 }).map((_, sIdx) => (
                    <Star 
                      key={sIdx} 
                      size={14} 
                      fill={sIdx < rev.rating ? 'var(--accent-primary)' : 'none'} 
                      stroke={sIdx < rev.rating ? 'var(--accent-primary)' : 'currentColor'} 
                    />
                  ))}
                </div>
                
                <p className="review-comment">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductDetailPage;
