import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProductCard from './ProductCard.jsx';
import { apiGet, apiPost } from './api.js';
import { IMG_FALLBACK } from './constants.js';
import { formatOrderDate, orderStatusClass, orderStatusLabel } from './utils.js';

const EMPTY_SUMMARY = {
  subtotal: 0,
  delivery: 0,
  discountAmount: 0,
  total: 0,
  couponApplied: false,
  discountPercent: 0,
};

const CAT_PILLS = [
  { cat: 'all', ci: '🍽️', cn: 'All dishes' },
  { cat: 'indian', ci: '🍛', cn: 'Indian' },
  { cat: 'chinese', ci: '🥡', cn: 'Chinese' },
  { cat: 'pizza', ci: '🍕', cn: 'Pizza' },
  { cat: 'asian', ci: '🍣', cn: 'Asian' },
  { cat: 'american', ci: '🍔', cn: 'American' },
  { cat: 'healthy', ci: '🥗', cn: 'Healthy' },
  { cat: 'desserts', ci: '🍰', cn: 'Desserts' },
];

const CAROUSEL_SLIDES = [
  {
    cs: 'cs-1',
    tag: "🔥 Chef's pick",
    title: 'Smash burgers &\nhand-cut fries',
    body: 'Prime patties, brioche buns, and sauces made in-house. The late-night order your city talks about.',
    filter: 'american',
    btn: 'American',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&w=800&q=80',
  },
  {
    cs: 'cs-2',
    tag: '🍕 Wood-fired',
    title: 'Pizza from\n650°F ovens',
    body: 'Slow-fermented dough, San Marzano tomatoes, and fresh mozzarella—delivered crisp, every time.',
    filter: 'pizza',
    btn: 'Pizza',
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&w=800&q=80',
  },
  {
    cs: 'cs-3',
    tag: '🥢 Pan-Asian',
    title: 'Rolls, bowls &\nwok classics',
    body: 'From sushi platters to fiery noodles—one app, every craving covered.',
    filter: 'asian',
    btn: 'Asian',
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&w=800&q=80',
  },
];

function filterByCat(items, cat) {
  if (cat === 'all') return items;
  return items.filter((p) => p.cat === cat);
}

function OrderFooterLine({ o }) {
  const totalStr = `₹${o.total.toLocaleString('en-IN')}`;
  if (o.status === 'transit' && o.expectedDelivery) {
    return (
      <>
        Total: <strong>{totalStr}</strong>
        &nbsp;·&nbsp; Expected delivery: <strong>{o.expectedDelivery}</strong>
      </>
    );
  }
  if (o.status === 'delivered' && o.deliveredOn) {
    return (
      <>
        Total: <strong>{totalStr}</strong>
        &nbsp;·&nbsp; Delivered on: <strong>{o.deliveredOn}</strong>
      </>
    );
  }
  if (o.estimated) {
    return (
      <>
        Total: <strong>{totalStr}</strong>
        &nbsp;·&nbsp; Estimated: <strong>{o.estimated}</strong>
      </>
    );
  }
  return (
    <>
      Total: <strong>{totalStr}</strong>
    </>
  );
}

function imgErr(e) {
  e.target.onerror = null;
  e.target.src = IMG_FALLBACK;
}

export default function App() {
  const [promoVisible, setPromoVisible] = useState(true);
  const [page, setPage] = useState('home');
  const [activeNav, setActiveNav] = useState('home');
  const [activeCat, setActiveCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [effectiveCouponCode, setEffectiveCouponCode] = useState('');
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState({ cls: '', text: '' });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timerH, setTimerH] = useState('00');
  const [timerM, setTimerM] = useState('00');
  const [timerS, setTimerS] = useState('00');
  const [flashEndMs, setFlashEndMs] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifsRead, setNotifsRead] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [modalTotal, setModalTotal] = useState('');
  const [toasts, setToasts] = useState([]);

  const featuredRef = useRef(null);
  const notifBtnRef = useRef(null);
  const notifPanelRef = useRef(null);
  const searchBlurTimer = useRef(null);
  const checkoutInFlight = useRef(false);

  const showToast = useCallback((msg) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2700);
  }, []);

  const ALL_ITEMS = useMemo(() => [...products, ...deals], [products, deals]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return ALL_ITEMS.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6);
  }, [searchQuery, ALL_ITEMS]);

  const filteredProducts = useMemo(() => filterByCat(products, activeCat), [products, activeCat]);
  const filteredDeals = useMemo(() => filterByCat(deals, activeCat), [deals, activeCat]);

  const wishlistProducts = useMemo(() => {
    return wishlist.map((id) => ALL_ITEMS.find((p) => p.id === id)).filter(Boolean);
  }, [wishlist]);

  const showPage = useCallback((name, navBtn) => {
    setPage(name);
    window.scrollTo(0, 0);
    if (name === 'orders') {
      setActiveNav('orders');
      return;
    }
    if (name === 'wishlist') {
      setActiveNav(null);
      return;
    }
    if (name !== 'home') return;
    if (!navBtn) {
      setActiveNav(null);
      return;
    }
    const label = navBtn.textContent?.trim();
    if (label === 'Home') setActiveNav('home');
    else if (label === 'Orders') setActiveNav('orders');
    else if (['Indian', 'Chinese', 'Pizza', 'Asian'].includes(label)) {
      const map = { Indian: 'indian', Chinese: 'chinese', Pizza: 'pizza', Asian: 'asian' };
      setActiveNav(map[label] || 'home');
    } else {
      setActiveNav(null);
    }
  }, []);

  const filterCat = useCallback(
    (cat) => {
      setActiveCat(cat);
      if (cat !== 'all') {
        featuredRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    []
  );

  /** Search picks a dish on the menu; user adds from the card (no auto-add to bag). */
  const goToProductFromSearch = useCallback((p) => {
    setPage('home');
    setActiveNav('home');
    setActiveCat('all');
    setSearchOpen(false);
    setSearchQuery('');
    const elId = `product-${p.id}`;
    setTimeout(() => {
      document.getElementById(elId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, []);

  const addToCart = useCallback(
    (id) => {
      const p = ALL_ITEMS.find((x) => x.id === id);
      if (!p) return;
      setCart((c) => [...c, { product: p, quantity: 1 }]);
      showToast(`✅ ${p.name} added to bag`);
    },
    [showToast, ALL_ITEMS]
  );

  const toggleWish = useCallback(
    (id) => {
      setWishlist((w) => {
        if (w.includes(id)) {
          showToast('Removed from favorites');
          return w.filter((x) => x !== id);
        }
        showToast('❤️ Saved to favorites');
        return [...w, id];
      });
    },
    [showToast]
  );

  const removeLine = useCallback((i) => {
    setCart((c) => c.filter((_, idx) => idx !== i));
  }, []);

  const changeQty = useCallback((i, d) => {
    setCart((c) => {
      const next = [...c];
      next[i] = { ...next[i], quantity: next[i].quantity + d };
      if (next[i].quantity <= 0) next.splice(i, 1);
      return next;
    });
  }, []);

  const applyCoupon = useCallback(async () => {
    try {
      const data = await apiPost('/api/coupon/apply', { code: couponInput });
      if (data.ok) {
        setEffectiveCouponCode(couponInput.trim().toUpperCase());
        setCouponMsg({ cls: 'ok', text: `🎉 ${data.percent}% discount applied!` });
      } else {
        setEffectiveCouponCode('');
        setCouponMsg({ cls: 'err', text: data.errorMessage || '❌ Invalid code' });
      }
    } catch {
      showToast('Could not verify coupon');
    }
  }, [couponInput, showToast]);

  const openCart = useCallback(() => {
    setCartOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeCart = useCallback(() => {
    setCartOpen(false);
    document.body.style.overflow = '';
  }, []);

  const checkout = useCallback(async () => {
    if (checkoutInFlight.current) return;
    if (cart.length === 0) {
      showToast('🥡 Your bag is empty');
      return;
    }
    checkoutInFlight.current = true;
    try {
      const lines = cart.map((l) => ({ productId: l.product.id, quantity: l.quantity }));
      const t = await apiPost('/api/cart/summary', { lines, couponCode: effectiveCouponCode });
      const estDate = new Date(Date.now() + 3 * 86400000);
      setOrderHistory((h) => [
        {
          id: 'MN' + Date.now().toString().slice(-6),
          date: formatOrderDate(new Date()),
          status: 'processing',
          items: cart.map((line) => ({
            image: line.product.image,
            name: line.product.name,
            qty: line.quantity,
          })),
          total: t.total,
          estimated: formatOrderDate(estDate),
        },
        ...h,
      ]);
      setModalTotal(`₹${t.total.toLocaleString('en-IN')}.00`);
      setSummary(t);
      setCheckoutOpen(true);
    } catch {
      checkoutInFlight.current = false;
      showToast('Could not place order — check connection');
    }
  }, [cart, effectiveCouponCode, showToast]);

  useEffect(() => {
    if (!checkoutOpen) checkoutInFlight.current = false;
  }, [checkoutOpen]);

  const clearCartState = useCallback(() => {
    setCart([]);
    setEffectiveCouponCode('');
    setCouponInput('');
    setCouponMsg({ cls: '', text: '' });
    setSummary(EMPTY_SUMMARY);
    closeCart();
  }, [closeCart]);

  const subscribeNewsletter = useCallback((email) => {
    if (!email.includes('@')) {
      showToast('⚠️ Enter a valid email');
      return false;
    }
    showToast('🎉 Subscribed successfully!');
    return true;
  }, [showToast]);

  useEffect(() => {
    const id = setInterval(() => moveCarousel(1), 4000);
    return () => clearInterval(id);
  }, []);

  function moveCarousel(dir) {
    setCurrentSlide((s) => (s + dir + 3) % 3);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet('/api/products');
        if (cancelled) return;
        setProducts(data.products);
        setDeals(data.deals);
      } catch {
        if (!cancelled) showToast('Could not load menu — is the API running?');
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { endMs } = await apiGet('/api/flash');
        if (!cancelled) setFlashEndMs(endMs);
      } catch {
        if (!cancelled) setFlashEndMs(Date.now());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (flashEndMs == null) return;
    const endTime = new Date(flashEndMs);
    function tick() {
      const now = new Date();
      const remaining = endTime - now;
      if (remaining <= 0) {
        setTimerH('00');
        setTimerM('00');
        setTimerS('00');
        return;
      }
      setTimerH(String(Math.floor(remaining / 3600000)).padStart(2, '0'));
      setTimerM(String(Math.floor((remaining % 3600000) / 60000)).padStart(2, '0'));
      setTimerS(String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0'));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [flashEndMs]);

  useEffect(() => {
    if (catalogLoading && products.length === 0) return;
    const lines = cart.map((l) => ({ productId: l.product.id, quantity: l.quantity }));
    const tmr = setTimeout(() => {
      (async () => {
        try {
          const s = await apiPost('/api/cart/summary', { lines, couponCode: effectiveCouponCode });
          setSummary(s);
        } catch {
          showToast('Could not update bag totals');
        }
      })();
    }, 150);
    return () => clearTimeout(tmr);
  }, [cart, effectiveCouponCode, catalogLoading, products.length, showToast]);

  useEffect(() => {
    function onDocClick(e) {
      const panel = notifPanelRef.current;
      const btn = notifBtnRef.current;
      if (notifOpen && panel && btn && !panel.contains(e.target) && !btn.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [notifOpen]);

  return (
    <>
      {promoVisible ? (
        <div className="promo-bar" id="promoBar">
          🛵 Free delivery on orders above <strong>₹999</strong> &nbsp;·&nbsp; Use <strong>NEST10</strong> for 10%
          off &nbsp;·&nbsp; Live order tracking
          <button type="button" className="promo-close" onClick={() => setPromoVisible(false)} aria-label="Close">
            ✕
          </button>
        </div>
      ) : null}

      <nav>
        <button type="button" className="nav-logo" onClick={() => showPage('home')}>
          Meal<span>Nest</span>
        </button>
        <div className="nav-center">
          <button
            type="button"
            className={`nav-link ${activeNav === 'home' ? 'active' : ''}`}
            onClick={(e) => {
              showPage('home', e.currentTarget);
              setActiveCat('all');
            }}
          >
            Home
          </button>
          <button
            type="button"
            className={`nav-link ${activeNav === 'indian' ? 'active' : ''}`}
            onClick={(e) => {
              showPage('home', e.currentTarget);
              filterCat('indian');
            }}
          >
            Indian
          </button>
          <button
            type="button"
            className={`nav-link ${activeNav === 'chinese' ? 'active' : ''}`}
            onClick={(e) => {
              showPage('home', e.currentTarget);
              filterCat('chinese');
            }}
          >
            Chinese
          </button>
          <button
            type="button"
            className={`nav-link ${activeNav === 'pizza' ? 'active' : ''}`}
            onClick={(e) => {
              showPage('home', e.currentTarget);
              filterCat('pizza');
            }}
          >
            Pizza
          </button>
          <button
            type="button"
            className={`nav-link ${activeNav === 'asian' ? 'active' : ''}`}
            onClick={(e) => {
              showPage('home', e.currentTarget);
              filterCat('asian');
            }}
          >
            Asian
          </button>
          <button
            type="button"
            className={`nav-link ${activeNav === 'orders' ? 'active' : ''}`}
            onClick={(e) => showPage('orders', e.currentTarget)}
          >
            Orders
          </button>
        </div>
        <div className="nav-right">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search dishes & restaurants..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(!!e.target.value.trim());
              }}
              onBlur={() => {
                searchBlurTimer.current = setTimeout(() => setSearchOpen(false), 200);
              }}
              onFocus={() => searchQuery.trim() && setSearchOpen(true)}
            />
            {searchOpen && searchResults.length > 0 ? (
              <div className="search-results open">
                {searchResults.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    className="sr-item"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => goToProductFromSearch(p)}
                  >
                    <img className="sr-thumb" src={p.image} alt="" referrerPolicy="no-referrer" onError={imgErr} />
                    <span>
                      {p.name} — <strong>₹{p.price.toLocaleString('en-IN')}</strong>
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <button type="button" className="icon-btn" title="Favorites" onClick={() => showPage('wishlist')}>
            🤍
          </button>
          <button
            type="button"
            ref={notifBtnRef}
            className="icon-btn"
            id="notifBtn"
            onClick={() => setNotifOpen((o) => !o)}
            title="Notifications"
          >
            🔔
            {!notifsRead ? (
              <span className="notif-badge" id="notifBadge">
                3
              </span>
            ) : null}
          </button>
          <button type="button" className="cart-btn" onClick={openCart}>
            🛍️ Bag
            <span className="cart-badge" id="cartBadge">
              {cartCount}
            </span>
          </button>
        </div>
      </nav>

      <div ref={notifPanelRef} className={`notif-panel ${notifOpen ? 'open' : ''}`} id="notifPanel">
        <div className="notif-head">
          <h4>Notifications</h4>
          <button
            type="button"
            className="mark-read"
            onClick={() => {
              setNotifsRead(true);
              setNotifOpen(false);
            }}
          >
            Mark all read
          </button>
        </div>
        <div className={`notif-item ${!notifsRead ? 'unread' : ''}`}>
          <span className="notif-icon">🛵</span>
          <div>
            <div className="notif-text">Your rider is 4 min away — Order #MN8821</div>
            <div className="notif-time">2 hours ago</div>
          </div>
        </div>
        <div className={`notif-item ${!notifsRead ? 'unread' : ''}`}>
          <span className="notif-icon">🎉</span>
          <div>
            <div className="notif-text">Happy Hour: 25% off select mains tonight</div>
            <div className="notif-time">5 hours ago</div>
          </div>
        </div>
        <div className={`notif-item ${!notifsRead ? 'unread' : ''}`}>
          <span className="notif-icon">💰</span>
          <div>
            <div className="notif-text">Refund of ₹299 credited to your wallet.</div>
            <div className="notif-time">Yesterday</div>
          </div>
        </div>
        <div className="notif-item">
          <span className="notif-icon">⭐</span>
          <div>
            <div className="notif-text">How was your biryani? Tap to rate your last order</div>
            <div className="notif-time">2 days ago</div>
          </div>
        </div>
      </div>

      <div className={`page ${page === 'home' ? 'active' : ''}`} id="page-home">
        <section className="hero">
          <div className="hero-text">
            <div className="hero-tag">✦ Citywide delivery</div>
            <h1>
              Great food,
              <br />
              minutes away.
            </h1>
            <p>
              Chef-crafted dishes from top-rated kitchens. Tracked delivery, contactless drop-off, and the same
              polished experience you expect—now for every meal.
            </p>
            <div className="hero-btns">
              <button
                type="button"
                className="btn-primary"
                onClick={() => featuredRef.current?.scrollIntoView({ behavior: 'smooth' })}
              >
                Browse menu →
              </button>
              <button type="button" className="btn-outline" onClick={() => showPage('orders')}>
                Track order
              </button>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-stat">
              <div className="val">2M+</div>
              <div className="lbl">Orders delivered</div>
            </div>
            <div className="hero-stat">
              <div className="val">4K+</div>
              <div className="lbl">Restaurant partners</div>
            </div>
            <div className="hero-stat">
              <div className="val">28m</div>
              <div className="lbl">Avg. arrival</div>
            </div>
            <div className="hero-stat">
              <div className="val">4.8★</div>
              <div className="lbl">App store rating</div>
            </div>
          </div>
        </section>

        <div className="cat-strip">
          <h3>Cravings by cuisine</h3>
          <div className="cat-list">
            {CAT_PILLS.map((pill) => (
              <button
                type="button"
                key={pill.cat}
                className={`cat-pill ${activeCat === pill.cat ? 'active' : ''}`}
                onClick={() => filterCat(pill.cat)}
              >
                <span className="ci">{pill.ci}</span>
                <span className="cn">{pill.cn}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flash-banner">
          <div className="flash-left">
            <span className="flash-fire">⚡</span>
            <div>
              <div className="flash-title">Happy hour — up to 40% off mains</div>
              <div className="flash-sub">Participating kitchens · while supplies last</div>
            </div>
          </div>
          <div className="timer-boxes">
            <div className="timer-box">
              <div className="tv" id="timerH">
                {timerH}
              </div>
              <div className="tl">Hours</div>
            </div>
            <span className="timer-sep">:</span>
            <div className="timer-box">
              <div className="tv" id="timerM">
                {timerM}
              </div>
              <div className="tl">Mins</div>
            </div>
            <span className="timer-sep">:</span>
            <div className="timer-box">
              <div className="tv" id="timerS">
                {timerS}
              </div>
              <div className="tl">Secs</div>
            </div>
          </div>
        </div>

        <div className="carousel-section">
          <div className="carousel-wrap">
            <div
              className="carousel-slides"
              id="carouselSlides"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {CAROUSEL_SLIDES.map((s) => (
                <div key={s.cs} className={`carousel-slide ${s.cs}`}>
                  <div className="slide-text">
                    <span className="slide-tag">{s.tag}</span>
                    <h2 style={{ whiteSpace: 'pre-line' }}>{s.title}</h2>
                    <p>{s.body}</p>
                    <button type="button" className="btn-primary" onClick={() => filterCat(s.filter)}>
                      {s.btn}
                    </button>
                  </div>
                  <div className="slide-visual">
                    <img src={s.img} alt="" referrerPolicy="no-referrer" onError={imgErr} />
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className="carousel-prev" onClick={() => moveCarousel(-1)}>
              ‹
            </button>
            <button type="button" className="carousel-next" onClick={() => moveCarousel(1)}>
              ›
            </button>
          </div>
          <div className="carousel-dots" id="carouselDots">
            {[0, 1, 2].map((i) => (
              <button
                type="button"
                key={i}
                className={`cdot ${currentSlide === i ? 'active' : ''}`}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <section className="section" ref={featuredRef} id="featured">
          <div className="section-head">
            <h2>Popular near you</h2>
            <a className="see-all" href="#popular" onClick={(e) => e.preventDefault()}>
              See all dishes →
            </a>
          </div>
          <div className="products-grid" id="productsGrid">
            {catalogLoading ? (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--warm-gray)' }}>Loading menu…</p>
            ) : filteredProducts.length === 0 ? (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--warm-gray)' }}>No dishes in this category.</p>
            ) : (
              filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  wishlisted={wishlist.includes(p.id)}
                  onWish={toggleWish}
                  onAdd={addToCart}
                />
              ))
            )}
          </div>
        </section>

        <div className="brands-strip">
          <h3>Kitchen partners</h3>
          <div className="brands-list">
            {['Tunday Kababi', 'Olive Bistro', 'The Fatty Bao', 'Social Offline', 'Truffles', 'Copper Chimney', 'Toit', 'Blue Tokai'].map(
              (b) => (
                <div key={b} className="brand-chip">
                  {b}
                </div>
              )
            )}
          </div>
        </div>

        <section className="section" style={{ background: 'var(--charcoal)' }}>
          <div className="section-head">
            <h2 style={{ color: 'var(--white)' }}>Combos & feast boxes 🔥</h2>
            <a className="see-all" href="#combos" onClick={(e) => e.preventDefault()} style={{ color: 'var(--accent)' }}>
              View all →
            </a>
          </div>
          <div className="products-grid" id="dealsGrid">
            {catalogLoading ? (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--white)' }}>Loading combos…</p>
            ) : filteredDeals.length === 0 ? (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>No combos in this filter.</p>
            ) : (
              filteredDeals.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  wishlisted={wishlist.includes(p.id)}
                  onWish={toggleWish}
                  onAdd={addToCart}
                />
              ))
            )}
          </div>
        </section>

        <section className="testimonials">
          <div className="section-head">
            <h2>What diners say</h2>
          </div>
          <div className="testi-grid">
            {[
              {
                t: '"MealNest has become our weeknight default. Tracking is accurate and food arrives hot—rare for delivery."',
                n: 'Priya Sharma',
                l: 'Bengaluru, KA',
                a: 'P',
                s: '★★★★★',
              },
              {
                t: '"Ordered biryani in 26 minutes flat. Rider was polite, packaging was spill-proof. This is how delivery should feel."',
                n: 'Rahul Verma',
                l: 'Mumbai, MH',
                a: 'R',
                s: '★★★★★',
              },
              {
                t: '"Huge menu, fair pricing, and the combo deals actually save money. Support helped when one item was swapped."',
                n: 'Anjali Nair',
                l: 'Chennai, TN',
                a: 'A',
                s: '★★★★☆',
              },
              {
                t: '"Clean UI, reliable ETAs, and I love seeing the rider on the map. Ordering lunch between meetings is painless."',
                n: 'Karan Mehta',
                l: 'Delhi, DL',
                a: 'K',
                s: '★★★★★',
              },
            ].map((x) => (
              <div key={x.n} className="testi-card">
                <div className="testi-stars">{x.s}</div>
                <div className="testi-text">{x.t}</div>
                <div className="testi-user">
                  <div className="testi-avatar">{x.a}</div>
                  <div>
                    <div className="testi-name">{x.n}</div>
                    <div className="testi-loc">{x.l}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <NewsletterBlock onSubscribe={subscribeNewsletter} />

        <footer>
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">
                Meal<span>Nest</span>
              </div>
              <p>Premium food delivery with live tracking, trusted kitchens, and support that answers when you’re hungry.</p>
            </div>
            <div className="footer-col">
              <h4>Explore</h4>
              {['indian', 'chinese', 'pizza', 'healthy', 'desserts'].map((c) => (
                <a
                  key={c}
                  href="#explore"
                  onClick={(e) => {
                    e.preventDefault();
                    showPage('home');
                    filterCat(c);
                  }}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </a>
              ))}
            </div>
            <div className="footer-col">
              <h4>Account</h4>
              <a href="#wish" onClick={(e) => { e.preventDefault(); showPage('wishlist'); }}>
                Saved dishes
              </a>
              <a href="#orders" onClick={(e) => { e.preventDefault(); showPage('orders'); }}>
                Order history
              </a>
              <a href="#profile">Profile Settings</a>
              <a href="#addr">Address Book</a>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <a href="#help">Help Center</a>
              <a href="#ret">Return Policy</a>
              <a href="#track">Track Order</a>
              <a href="#contact">Contact Us</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 MealNest Foods Pvt. Ltd. All rights reserved.</span>
            <div className="footer-socials">
              <div className="social-btn">📘</div>
              <div className="social-btn">📸</div>
              <div className="social-btn">🐦</div>
              <div className="social-btn">▶️</div>
            </div>
          </div>
        </footer>
      </div>

      <div className={`page ${page === 'wishlist' ? 'active' : ''}`} id="page-wishlist">
        <div className="page-hero">
          <h1>Saved dishes 🤍</h1>
          <p>Your favorites from every cuisine—one tap to reorder.</p>
        </div>
        {wishlistProducts.length === 0 ? (
          <div className="empty-state">
            <div className="big-icon">🤍</div>
            <h3>No saved dishes yet</h3>
            <p>Tap the heart on any dish to save it for quick reorder.</p>
            <button type="button" className="btn-primary" style={{ margin: '0 auto', display: 'block' }} onClick={() => showPage('home')}>
              Explore menu
            </button>
          </div>
        ) : (
          <div className="wishlist-grid" id="wishlistGrid">
            {wishlistProducts.map((p) => (
              <ProductCard key={p.id} product={p} wishlisted onWish={toggleWish} onAdd={addToCart} />
            ))}
          </div>
        )}
      </div>

      <div className={`page ${page === 'orders' ? 'active' : ''}`} id="page-orders">
        <div className="page-hero">
          <h1>Your orders 📦</h1>
          <p>Live status, receipts, and delivery ETAs in one place.</p>
        </div>
        <div className="orders-list" id="ordersListContainer">
          {orderHistory.length === 0 ? (
            <div className="empty-state">
              <div className="big-icon">🥡</div>
              <h3>No orders yet</h3>
              <p>Place your first order and track delivery from here.</p>
              <button type="button" className="btn-primary" style={{ margin: '0 auto', display: 'block' }} onClick={() => showPage('home')}>
                Browse menu
              </button>
            </div>
          ) : (
            orderHistory.map((o) => (
              <div key={o.id} className="order-card">
                <div className="order-top">
                  <div>
                    <div className="order-id">Order #{o.id}</div>
                    <div className="order-date">{o.date}</div>
                  </div>
                  <span className={`order-status ${orderStatusClass(o.status)}`}>{orderStatusLabel(o.status)}</span>
                </div>
                <div className="order-items">
                  {o.items.map((i, idx) => (
                    <div key={idx} className="order-item-chip">
                      {i.image ? (
                        <img className="order-chip-img" src={i.image} alt="" referrerPolicy="no-referrer" onError={imgErr} />
                      ) : null}
                      <span>
                        {i.name} ×{i.qty}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="order-total">
                  <OrderFooterLine o={o} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div
        className={`cart-overlay ${cartOpen ? 'open' : ''}`}
        id="cartOverlay"
        onClick={closeCart}
        aria-hidden={!cartOpen}
      />
      <div className={`cart-sidebar ${cartOpen ? 'open' : ''}`} id="cartSidebar">
        <div className="cart-header">
          <h2>Your bag 🛍️</h2>
          <button type="button" className="cart-close" onClick={closeCart}>
            ✕
          </button>
        </div>
        <div className="cart-items" id="cartItemsContainer">
          {cart.length === 0 ? (
            <div className="cart-empty" id="cartEmpty">
              <div className="icon">🥡</div>
              <p>
                Your bag is empty.
                <br />
                Add dishes to start an order.
              </p>
            </div>
          ) : (
            cart.map((item, i) => (
              <div key={`${item.product.id}-${i}`} className="cart-item">
                <div className="ci-img">
                  <img src={item.product.image} alt="" width={68} height={68} loading="lazy" referrerPolicy="no-referrer" onError={imgErr} />
                </div>
                <div className="ci-details">
                  <div className="ci-name">{item.product.name}</div>
                  <div className="ci-price">₹{item.product.price.toLocaleString('en-IN')} each</div>
                  <div className="qty-ctrl">
                    <button type="button" className="qty-btn" onClick={() => changeQty(i, -1)}>
                      −
                    </button>
                    <span className="qty-num">{item.quantity}</span>
                    <button type="button" className="qty-btn" onClick={() => changeQty(i, +1)}>
                      +
                    </button>
                  </div>
                </div>
                <button type="button" className="ci-remove" onClick={() => removeLine(i)}>
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
        <div className="cart-footer">
          <div className="coupon-row">
            <input
              type="text"
              className="coupon-input"
              id="couponInput"
              placeholder="Enter coupon code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
            />
            <button type="button" className="coupon-btn" onClick={applyCoupon}>
              Apply
            </button>
          </div>
          <div className={`coupon-msg ${couponMsg.cls}`} id="couponMsg">
            {couponMsg.text}
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <span id="subtotalDisplay">₹{summary.subtotal.toLocaleString('en-IN')}.00</span>
          </div>
          <div className="summary-row">
            <span>Discount</span>
            <span id="discountDisplay" style={{ color: 'var(--green)' }}>
              -₹{summary.discountAmount.toLocaleString('en-IN')}.00
            </span>
          </div>
          <div className="summary-row">
            <span>Delivery fee</span>
            <span id="deliveryDisplay">
              {summary.delivery === 0
                ? summary.subtotal > 999
                  ? 'FREE'
                  : '₹0.00'
                : `₹${summary.delivery}.00`}
            </span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span id="totalDisplay">₹{summary.total.toLocaleString('en-IN')}.00</span>
          </div>
          <button type="button" className="checkout-btn" onClick={checkout}>
            Place order →
          </button>
        </div>
      </div>

      <div className="toast-container" id="toastContainer">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.msg}
          </div>
        ))}
      </div>

      <div className={`modal-overlay ${checkoutOpen ? 'open' : ''}`} id="checkoutModal">
        <div className="modal">
          <h3>Order confirmed! 🎉</h3>
          <p>Thanks for choosing MealNest. A rider will be assigned shortly—most orders arrive within 35 minutes.</p>
          <p style={{ marginBottom: 0 }}>
            <strong>
              Order Total: <span id="modalTotal">{modalTotal}</span>
            </strong>
          </p>
          <div className="modal-actions" style={{ marginTop: 20 }}>
            <button
              type="button"
              className="mbtn primary"
              onClick={() => {
                setCheckoutOpen(false);
                clearCartState();
                showPage('orders');
              }}
            >
              Track Order
            </button>
            <button
              type="button"
              className="mbtn secondary"
              onClick={() => setCheckoutOpen(false)}
            >
              Back to menu
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function NewsletterBlock({ onSubscribe }) {
  const [email, setEmail] = useState('');
  return (
    <section className="newsletter">
      <h2>Offers in your inbox 📬</h2>
      <p>Weekly chef specials, new restaurant drops, and members-only discounts—no spam.</p>
      <div className="newsletter-form">
        <input
          type="email"
          className="newsletter-input"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="button"
          className="newsletter-btn"
          onClick={() => {
            if (onSubscribe(email)) setEmail('');
          }}
        >
          Subscribe
        </button>
      </div>
    </section>
  );
}
