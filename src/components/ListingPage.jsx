import { useState, useEffect, useRef } from 'react';
import { Search, Star, Plus, AlertCircle, ChevronLeft, ChevronRight, SlidersHorizontal, PlusCircle, MinusCircle, ArrowRight } from 'lucide-react';
import { mockSkincareProducts } from '../data/mockProducts';

function ListingPage({ navigateToDetail, addToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter/Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  
  // Pagination States (For the 2x2 grid, we show 4 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // FAQ Accordion State (index of active FAQ item)
  const [activeFaq, setActiveFaq] = useState(0);

  // Spotlight container ref for horizontal scrolling
  const spotlightRef = useRef(null);

  // Fetch Products on Mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://dummyjson.com/products?limit=194');
        if (!response.ok) {
          throw new Error('Failed to retrieve products. Please check your connection.');
        }
        const data = await response.json();
        
        // Filter out non-skincare/beauty products from the 194 fetched items
        const allProducts = data.products || [];
        const skincareCategories = ['beauty', 'fragrances', 'skin-care'];
        const filteredBeautyProducts = allProducts.filter(p => {
          const cat = p.category.toLowerCase();
          const title = p.title.toLowerCase();
          
          // Exclude obvious makeup products to maintain a pure skincare feel, but keep creams/cleansers/oils
          const isMakeup = title.includes('mascara') || title.includes('eyeshadow') || title.includes('lipstick') || title.includes('nail polish') || title.includes('powder');
          
          return (skincareCategories.includes(cat) || cat.includes('skin') || cat.includes('beauty')) && !isMakeup;
        });

        setProducts([...mockSkincareProducts, ...filteredBeautyProducts]);
        setError(null);
      } catch (err) {
        console.warn('API fetch failed, falling back to local mock products:', err);
        setProducts(mockSkincareProducts);
        setError(null); // Clear error since we have a fallback list
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Reset page when search or category change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Handle Category Filter Selection (Custom Keyword Mapping)
  const filterByCustomCategory = (product) => {
    if (selectedCategory === 'All') return true;
    
    const titleLower = product.title.toLowerCase();

    if (selectedCategory === 'Serums') {
      return titleLower.includes('serum') || titleLower.includes('essence') || titleLower.includes('oil') || titleLower.includes('elixir') || titleLower.includes('ampoule');
    }
    if (selectedCategory === 'Cleanse') {
      return titleLower.includes('cleanser') || titleLower.includes('wash') || titleLower.includes('soap') || titleLower.includes('gel') || titleLower.includes('scrub');
    }
    if (selectedCategory === 'Face Cream') {
      return titleLower.includes('cream') || titleLower.includes('moisturizer') || titleLower.includes('balm') || titleLower.includes('hydra') || titleLower.includes('cream');
    }
    if (selectedCategory === 'Lotion') {
      return titleLower.includes('lotion') || titleLower.includes('body') || titleLower.includes('sunscreen') || titleLower.includes('spf') || titleLower.includes('sunblock');
    }
    return false;
  };

  // Filter Products
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = filterByCustomCategory(product);
      
    return matchesSearch && matchesCategory;
  });

  // Sort Products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') {
      return a.price - b.price;
    }
    if (sortBy === 'price-high') {
      return b.price - a.price;
    }
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    if (sortBy === 'discount') {
      return b.discountPercentage - a.discountPercentage;
    }
    return 0;
  });

  // Paginate Products
  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  // Spotlight Products (Top beauty/skincare products to show in horizontal slider)
  const spotlightProducts = products
    .filter(p => p.category.toLowerCase().includes('beauty') || p.category.toLowerCase().includes('skin'))
    .slice(4, 12);

  const scrollSpotlight = (direction) => {
    if (spotlightRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      spotlightRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const element = document.getElementById('skin-first-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // 3D Parallax Tilt Event Handlers for Hero & Banner Frames
  const handleHeroMouseMove = (e) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((centerY - y) / centerY) * 15;
    const rotateY = ((x - centerX) / centerX) * 15;

    const oval = container.querySelector('.hero-oval-frame');
    const capsule = container.querySelector('.hero-capsule-frame');
    
    if (oval) {
      oval.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(60px)`;
    }
    if (capsule) {
      capsule.style.transform = `perspective(1000px) rotateX(${rotateX * 0.7}deg) rotateY(${rotateY * 0.7}deg) translateZ(30px) rotate(4deg)`;
    }
  };

  const handleHeroMouseLeave = (e) => {
    const container = e.currentTarget;
    const oval = container.querySelector('.hero-oval-frame');
    const capsule = container.querySelector('.hero-capsule-frame');
    
    if (oval) {
      oval.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(50px)';
    }
    if (capsule) {
      capsule.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(20px) rotate(4deg)';
    }
  };

  // 3D Parallax Tilt for Cards
  const handleCardMouseMove = (e) => {
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

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // FAQ Content Arrays
  const faqs = [
    {
      q: "What skin types are your products suitable for?",
      a: "Our skincare products are formulated to be gentle yet active, making them suitable for all skin types, including sensitive, dry, oily, and combination skin. We avoid harsh chemicals to ensure high tolerability."
    },
    {
      q: "Are your products cruelty-free and vegan?",
      a: "Yes! All Fabish products are 100% cruelty-free. We do not test on animals at any stage of product development, and our entire organic collection is free from animal-derived ingredients."
    },
    {
      q: "How long will it take to see results?",
      a: "Most users notice hydrated, softer skin within 3 to 7 days. For deeper concerns like hyperpigmentation or fine lines, visible improvements usually appear within 4 to 6 weeks of consistent daily usage."
    },
    {
      q: "How should I store your skincare products?",
      a: "We recommend storing your products in a cool, dry place away from direct sunlight. Because our formulas contain organic extracts, keeping them tightly closed ensures maximum botanical potency."
    },
    {
      q: "How do I choose the right products for my skin?",
      a: "You can filter our catalog by specific categories like Serums, Cleanse, or Face Creams, or contact our customer support team for a personalized beauty routine recommendation."
    }
  ];

  // Testimonials Content Arrays
  const testimonials = [
    {
      name: "Sharon Roberts",
      role: "Marketing Executive",
      comment: "The Brightening Botanical Serum is a game-changer! My dark spots have noticeably faded, and my complexion has never looked so glowing.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120&h=120"
    },
    {
      name: "Amanda R.",
      role: "Fitness Trainer",
      comment: "I've struggled for years to find a sunscreen that works for my sensitive skin. The Daily Defense is perfect—lightweight and doesn't break me out.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120&h=120"
    },
    {
      name: "David K.",
      role: "Creative Director",
      comment: "Simple, honest, and highly effective. The Hydrating Cleanser removes all dirt without stripping my face. Definitely buying again.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120"
    }
  ];

  if (loading) {
    return (
      <div className="container page-transition" style={{ paddingTop: '110px' }}>
        <div style={{ height: '450px', width: '100%', borderRadius: '32px' }} className="skeleton" />
        <div style={{ height: '250px', width: '100%', borderRadius: '32px', marginTop: '2rem' }} className="skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container page-transition" style={{ paddingTop: '110px' }}>
        <div className="empty-state">
          <AlertCircle size={64} className="text-danger" />
          <h2>Unable to Load Catalog</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition" id="listing-page-view">
      
      {/* 3D Overlapping Hero Banner Section (Full Width layout) */}
      <section 
        className="hero-section-full" 
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        id="hero-banner"
      >
        <div className="container hero-dribbble-container">
          <div className="hero-dribbble-left">
            <h1 className="floating-element">Unlock Your Natural Glow</h1>
            <p>Discover skincare products crafted with pure, natural ingredients. Elevate your beauty routine with solutions designed to nourish, protect, and renew your skin.</p>
            <button 
              className="btn hero-dribbble-btn"
              onClick={() => {
                const element = document.getElementById('skin-first-section');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Shop Now
            </button>
          </div>
          
          <div className="hero-dribbble-right">
            <div className="hero-oval-frame">
              <img src="/skincare_model_hero.png" alt="Skincare Model Natural Glow" />
            </div>
            <div className="hero-capsule-frame">
              <img src="/skincare_product_hero.png" alt="Organic Skincare Products bottles" />
            </div>
          </div>
        </div>
      </section>

      {/* Dribbble custom Shop by Category grid dashboard (Centered Container) */}
      <section style={{ margin: '6rem 0' }}>
        <div className="container">
          <h2 className="category-section-title">Shop by Category</h2>
          
          <div className="category-grid-dribbble" id="category-grid-dashboard">
            {/* Column 1: Serums Card (Tall) */}
            <div className="category-col">
              <div 
                className={`dribbble-cat-card dribbble-cat-card-tall ${selectedCategory === 'Serums' ? 'active-border' : ''}`}
                onClick={() => { setSelectedCategory('Serums'); setTimeout(() => { document.getElementById('skin-first-section')?.scrollIntoView({ behavior: 'smooth' }); }, 150); }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                id="cat-card-serums"
              >
                <div className="dribbble-cat-img-wrapper">
                  <img src="/category_serums.png" alt="Botanical Serums" />
                </div>
                <span className="dribbble-cat-badge">Serums</span>
              </div>
            </div>

            {/* Column 2: Info + Face Cream (Short) */}
            <div className="category-col">
              <div className="category-center-desc">
                <h3>Explore Our Range</h3>
                <p>Explore our full range of skincare products, each formulated to address different skin concerns and goals.</p>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                  onClick={() => { setSelectedCategory('All'); }}
                >
                  Explore All
                </button>
              </div>

              <div 
                className="dribbble-cat-card dribbble-cat-card-short"
                onClick={() => { setSelectedCategory('Face Cream'); setTimeout(() => { document.getElementById('skin-first-section')?.scrollIntoView({ behavior: 'smooth' }); }, 150); }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                id="cat-card-facecream"
              >
                <div className="dribbble-cat-img-wrapper">
                  <img src="/category_facecream.png" alt="Organic Face Creams" />
                </div>
                <span className="dribbble-cat-badge">Face Cream</span>
              </div>
            </div>

            {/* Column 3: Cleanse (Short) + Lotion (Short) */}
            <div className="category-col">
              <div 
                className="dribbble-cat-card dribbble-cat-card-short"
                onClick={() => { setSelectedCategory('Cleanse'); setTimeout(() => { document.getElementById('skin-first-section')?.scrollIntoView({ behavior: 'smooth' }); }, 150); }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                id="cat-card-cleanse"
              >
                <div className="dribbble-cat-img-wrapper">
                  <img src="/category_cleanse.png" alt="Gentle Cleansers" />
                </div>
                <span className="dribbble-cat-badge">Cleanse</span>
              </div>

              <div 
                className="dribbble-cat-card dribbble-cat-card-short"
                onClick={() => { setSelectedCategory('Lotion'); setTimeout(() => { document.getElementById('skin-first-section')?.scrollIntoView({ behavior: 'smooth' }); }, 150); }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                id="cat-card-lotion"
              >
                <div className="dribbble-cat-img-wrapper">
                  <img src="/category_lotion.png" alt="Restorative Lotions" />
                </div>
                <span className="dribbble-cat-badge">Lotion</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spotlight Horizontal Product Section (Full Width Layout) */}
      <section className="spotlight-section-full">
        <div className="container">
          <div className="spotlight-header">
            <div>
              <span className="detail-brand-badge">Premium Highlights</span>
              <h2>Fabish Skincare For Your...</h2>
            </div>
            <div className="spotlight-nav">
              <button className="btn btn-icon" onClick={() => scrollSpotlight('left')} aria-label="Scroll left">
                <ChevronLeft size={20} />
              </button>
              <button className="btn btn-icon" onClick={() => scrollSpotlight('right')} aria-label="Scroll right">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="spotlight-scroll-container" ref={spotlightRef}>
            {spotlightProducts.map((prod) => (
              <div 
                key={prod.id} 
                className="spotlight-card"
                onClick={() => navigateToDetail(prod.id)}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="spotlight-img-wrapper">
                  <img src={prod.thumbnail} alt={prod.title} loading="lazy" />
                </div>
                <div className="spotlight-info">
                  <span className="spotlight-cat">{prod.category}</span>
                  <h3 className="spotlight-title">{prod.title}</h3>
                  <div className="spotlight-price-row">
                    <span className="spotlight-price">{formatPrice(prod.price)}</span>
                    <button 
                      className="skincare-card-add"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(prod, 1);
                        alert(`Added 1 x ${prod.title} to cart.`);
                      }}
                      aria-label="Add to cart"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Product Catalog Section ("Skin First" - Redesigned to Dribbble Split View) */}
      <section className="skin-first-section" id="skin-first-section" style={{ scrollMarginTop: '110px' }}>
        <div className="container">
          <div className="skin-first-header">
            <h2>Skin First</h2>
            <p>At Skin First, we prioritize healthy, radiant skin with products designed to hydrate, protect, and rejuvenate. Our essentials provide the foundation your skin needs to look and feel its best.</p>
          </div>

          {/* Sleek Filters Controls Bar */}
          <div className="catalog-filter-bar">
            <div className="catalog-pills">
              {['All', 'Serums', 'Cleanse', 'Face Cream', 'Lotion'].map((cat) => (
                <span 
                  key={cat}
                  className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'All' ? 'All Products' : cat}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div className="search-input-container" style={{ width: '260px' }}>
                <Search size={16} />
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ padding: '10px 16px 10px 42px', fontSize: '0.85rem' }}
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  id="search-products-input"
                />
              </div>

              <select 
                className="sort-select" 
                style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                id="sort-products-select"
                aria-label="Sort products"
              >
                <option value="default">Sort: Default</option>
                <option value="price-low">Price: Low-High</option>
                <option value="price-high">Price: High-Low</option>
                <option value="rating">Top Rated</option>
                <option value="discount">Biggest Sale</option>
              </select>
            </div>
          </div>

          {/* Split Catalog Content */}
          {paginatedProducts.length === 0 ? (
            <div className="empty-state">
              <SlidersHorizontal size={48} />
              <h2>No Products Found</h2>
              <p>Try resetting filters to discover all available skincare and beauty formulas.</p>
              <button className="btn btn-outline" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="skin-first-split">
              {/* Left Column: 3D Portrait Model Image */}
              <div 
                className="skin-first-banner"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <img src="/skin_first_model.png" alt="Healthy glowing skin routine model" />
                <div className="skin-first-banner-overlay">
                  <span className="detail-brand-badge" style={{ color: '#ffffff', background: 'rgba(255,255,255,0.2)' }}>Skin First Essentials</span>
                  <h3>Dermatologist Approved</h3>
                  <p>Our products are botanically sourced and clinical strength, maintaining pH balance and supporting cellular regeneration.</p>
                </div>
              </div>

              {/* Right Column: 2x2 Products Grid */}
              <div className="skin-first-grid-wrapper">
                <div className="skin-first-grid" id="products-catalog-grid">
                  {paginatedProducts.map((product) => (
                    <div 
                      key={product.id}
                      className="skincare-card"
                      onClick={() => navigateToDetail(product.id)}
                      onMouseMove={handleCardMouseMove}
                      onMouseLeave={handleCardMouseLeave}
                      id={`product-card-${product.id}`}
                    >
                      <div className="skincare-card-img-wrapper">
                        <img src={product.thumbnail} alt={product.title} loading="lazy" />
                        <div className="skincare-card-shop-btn">Shop Now</div>
                      </div>
                      
                      <div className="skincare-card-info">
                        <span className="skincare-card-cat">{product.category}</span>
                        <h3 className="skincare-card-title">{product.title}</h3>
                        
                        <div className="skincare-card-price-row">
                          <span className="skincare-card-price">{formatPrice(product.price)}</span>
                          <button
                            className="skincare-card-add"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product, 1);
                              alert(`Added 1 x ${product.title} to cart.`);
                            }}
                            aria-label="Add to cart"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination arrows located right below the 2x2 grid */}
                <div className="skin-first-actions">
                  <span className="pagination-info" style={{ margin: 0 }}>
                    Showing products <strong>{startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)}</strong> of <strong>{totalItems}</strong>
                  </span>
                  
                  {totalPages > 1 && (
                    <div className="skin-first-controls">
                      <button 
                        className="btn btn-icon" 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button 
                        className="btn btn-icon" 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Asked Questions FAQ Accordion Block */}
      <section className="faq-section" id="faq-section" style={{ background: 'var(--bg-secondary)', padding: '6rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '4rem' }}>
          <div className="faq-left">
            <h2>Asked Questions</h2>
            <p>Skincare can be complex, so we've gathered the most common questions to help guide you on your journey to healthy, beautiful skin.</p>
          </div>
          
          <div className="faq-list">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className={`faq-item ${activeFaq === idx ? 'faq-item-active' : ''}`}
                onClick={() => setActiveFaq(activeFaq === idx ? -1 : idx)}
                id={`faq-item-${idx}`}
              >
                <div className="faq-header">
                  <h3>{faq.q}</h3>
                  <div className="faq-icon-box">
                    {activeFaq === idx ? <MinusCircle size={20} /> : <PlusCircle size={20} />}
                  </div>
                </div>
                <div className="faq-body">
                  <p className="faq-content">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Reviews Testimonials Section */}
      <section className="testimonials-section" id="testimonials-section">
        <div className="container">
          <div className="testimonials-header">
            <h2>What Our Clients Say</h2>
            <p>Hear from real customers who have transformed their skin with our organic botanical formulas.</p>
          </div>
          
          <div className="testimonials-slider-container">
            {testimonials.map((test, idx) => (
              <div key={idx} className="testimonial-card-dribbble" onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}>
                <div className="testimonial-stars">
                  {Array.from({ length: test.rating }).map((_, sIdx) => (
                    <Star key={sIdx} size={16} fill="currentColor" stroke="none" />
                  ))}
                </div>
                <p className="testimonial-text">"{test.comment}"</p>
                <div className="testimonial-user">
                  <div className="testimonial-avatar">
                    <img src={test.avatar} alt={test.name} />
                  </div>
                  <div className="testimonial-user-info">
                    <h4>{test.name}</h4>
                    <span>{test.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Banner Call To Action (Full Width) */}
      <section className="cta-section-full">
        <div className="container">
          <div 
            className="cta-banner"
            onMouseMove={handleHeroMouseMove}
            onMouseLeave={handleHeroMouseLeave}
          >
            <div className="cta-left">
              <h2>Ready to Transform Your Skin?</h2>
              <p>At Fabish, we prioritize healthy, radiant skin with products designed to hydrate, protect, and rejuvenate. Subscribe to our newsletter to receive expert skincare advice, product launches, and exclusive member savings.</p>
              
              <form className="cta-input-group" onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }}>
                <input 
                  type="email" 
                  className="cta-input" 
                  placeholder="Enter your email address" 
                  required
                  aria-label="Email address"
                />
                <button type="submit" className="cta-submit-btn" aria-label="Subscribe">
                  <ArrowRight size={20} />
                </button>
              </form>
            </div>
            
            <div className="cta-right">
              <div className="cta-oval-frame">
                <img src="/footer_banner_model.png" alt="Healthy Radiant Skin Care model portrait" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Site Footer (Full Width) */}
      <footer className="footer-section-full">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-brand-logo">
                <Plus size={28} style={{ color: 'var(--accent-primary)' }} />
                <span>Fabish</span>
              </div>
              <p>Premium organic skincare solutions designed to nourish, protect, and restore your skin's natural radiant glow.</p>
            </div>

            <div className="footer-col">
              <h4>Shop</h4>
              <ul className="footer-links">
                <li><span onClick={() => { setSelectedCategory('Serums'); window.scrollTo({ top: 1000, behavior: 'smooth' }); }} style={{ cursor: 'pointer' }}>Serums</span></li>
                <li><span onClick={() => { setSelectedCategory('Cleanse'); window.scrollTo({ top: 1000, behavior: 'smooth' }); }} style={{ cursor: 'pointer' }}>Cleanse</span></li>
                <li><span onClick={() => { setSelectedCategory('Face Cream'); window.scrollTo({ top: 1000, behavior: 'smooth' }); }} style={{ cursor: 'pointer' }}>Face Cream</span></li>
                <li><span onClick={() => { setSelectedCategory('Lotion'); window.scrollTo({ top: 1000, behavior: 'smooth' }); }} style={{ cursor: 'pointer' }}>Lotion</span></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Company</h4>
              <ul className="footer-links">
                <li><a href="#about" onClick={(e) => { e.preventDefault(); alert("Fabish by Jovac is a premium organic skincare retailer providing botanically-active solutions."); }}>About Us</a></li>
                <li><a href="#careers" onClick={(e) => { e.preventDefault(); alert("Careers page coming soon."); }}>Careers</a></li>
                <li><a href="#sustainability" onClick={(e) => { e.preventDefault(); alert("All products are biodegradable and sourced from eco-certified farms."); }}>Sustainability</a></li>
                <li><a href="#press" onClick={(e) => { e.preventDefault(); alert("Press inquiries: press@fabishskincare.com"); }}>Press Releases</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Contact</h4>
              <ul className="footer-links">
                <li><a href="mailto:contact@fabishskincare.com">contact@fabishskincare.com</a></li>
                <li><a href="tel:+1800FABISH">(+1) 800-FABISH</a></li>
                <li><span>Mon - Fri: 9:00 AM - 6:00 PM EST</span></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Fabish Skincare by Jovac. All rights reserved.</span>
            <div className="footer-bottom-links">
              <a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Privacy Policy."); }}>Privacy Policy</a>
              <a href="#terms" onClick={(e) => { e.preventDefault(); alert("Terms of Service."); }}>Terms of Service</a>
              <a href="#cookies" onClick={(e) => { e.preventDefault(); alert("Cookie Preferences."); }}>Cookies</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default ListingPage;
