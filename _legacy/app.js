const IMG_QS = '?auto=format&w=800&q=80';
const IMG_FALLBACK = 'https://placehold.co/800x800/E8E0D0/6B6B70?text=Photo';
const IMG_ONERROR = 'onerror="this.onerror=null;this.src=\'' + IMG_FALLBACK + '\'"';

const PRODUCTS = [
  {id:1, name:"Truffle Margherita Pizza (12\")", cat:"pizza", image:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38" + IMG_QS, price:1299, orig:1699, rating:3.3, rev:1243, badge:"sale"},
  {id:2, name:"Hyderabadi Chicken Dum Biryani", cat:"indian", image:"https://images.unsplash.com/photo-1555939594-58d7cb561ad1" + IMG_QS, price:1499, orig:1899, rating:4.0, rev:876, badge:"hot"},
  {id:3, name:"Butter Chicken & Garlic Naan", cat:"indian", image:"https://images.unsplash.com/photo-1467003909585-2f8a72700288" + IMG_QS, price:1399, orig:1699, rating:2.7, rev:534, badge:"new"},
  {id:4, name:"Veg Hakka Noodles", cat:"chinese", image:"https://images.unsplash.com/photo-1540189549336-e6e99c3679fe" + IMG_QS, price:799, orig:999, rating:5.0, rev:392, badge:"sale"},
  {id:5, name:"Dragon Roll Sushi Platter", cat:"asian", image:"https://images.unsplash.com/photo-1553621042-f6e147245754" + IMG_QS, price:1899, orig:2299, rating:3.0, rev:218, badge:null},
  {id:6, name:"Double Smash Burger & Fries", cat:"american", image:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd" + IMG_QS, price:1099, orig:1399, rating:4.5, rev:671, badge:"new"},
  {id:7, name:"Greek Quinoa Power Bowl", cat:"healthy", image:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd" + IMG_QS, price:899, orig:1099, rating:2.0, rev:905, badge:"hot"},
  {id:8, name:"Belgian Waffle & Berries", cat:"desserts", image:"https://images.unsplash.com/photo-1504754524776-8f4f37790ca0" + IMG_QS, price:499, orig:699, rating:3.8, rev:2187, badge:"new"},
  {id:9, name:"Thai Green Curry & Jasmine Rice", cat:"asian", image:"https://images.unsplash.com/photo-1473093295043-cdd812d0e601" + IMG_QS, price:1199, orig:1499, rating:1.5, rev:341, badge:null},
  {id:10, name:"Classic Caesar Salad", cat:"healthy", image:"https://images.unsplash.com/photo-1546069901-ba9599a7e63c" + IMG_QS, price:799, orig:999, rating:4.2, rev:562, badge:"top"},
  {id:11, name:"Grilled Paneer Tikka", cat:"indian", image:"https://images.unsplash.com/photo-1511690656952-34342bb7c2f2" + IMG_QS, price:949, orig:1199, rating:3.5, rev:287, badge:null},
  {id:12, name:"Chocolate Lava Cake", cat:"desserts", image:"https://images.unsplash.com/photo-1565958011703-44f9829ba187" + IMG_QS, price:499, orig:649, rating:2.3, rev:893, badge:"new"},
];

const DEALS = [
  {id:101, name:"Family Feast — 4 mains + sides", cat:"combo", image:"https://images.unsplash.com/photo-1504674900247-0877df9cc836" + IMG_QS, price:2499, orig:3299, rating:4.6, rev:3421, badge:"sale"},
  {id:102, name:"Sunday Brunch for Two", cat:"combo", image:"https://images.unsplash.com/photo-1484723091739-30a097e8f929" + IMG_QS, price:1899, orig:2399, rating:4.7, rev:891, badge:"hot"},
  {id:103, name:"Party Starter Pack", cat:"combo", image:"https://images.unsplash.com/photo-1498837167922-ddd27525d352" + IMG_QS, price:1599, orig:1999, rating:4.8, rev:1567, badge:"sale"},
  {id:104, name:"Midnight Munchies Combo", cat:"combo", image:"https://images.unsplash.com/photo-1482049016688-2d3e1b311543" + IMG_QS, price:1299, orig:1699, rating:4.9, rev:742, badge:"new"},
];


let orderHistory = [];
let lastCartTotals = { subtotal: 0, delivery: 0, discAmt: 0, total: 0 };
let cart = [];
let wishlist = [];
let discount = 0;
let couponApplied = false;
let currentSlide = 0;
let carouselInterval;


function showPage(name, navBtn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
  if (navBtn) navBtn.classList.add('active');
  window.scrollTo(0,0);
  if (name === 'wishlist') renderWishlist();
  if (name === 'orders') renderOrders();
}

function orderStatusLabel(status) {
  if (status === 'delivered') return 'Delivered';
  if (status === 'transit') return 'In Transit';
  return 'Processing';
}

function orderStatusClass(status) {
  if (status === 'delivered') return 'status-delivered';
  if (status === 'transit') return 'status-transit';
  return 'status-processing';
}

function formatOrderDate(d) {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function orderFooterLine(o) {
  const totalStr = `₹${o.total.toLocaleString('en-IN')}`;
  if (o.status === 'transit' && o.expectedDelivery) {
    return `Total: <strong>${totalStr}</strong> &nbsp;·&nbsp; Expected delivery: <strong>${o.expectedDelivery}</strong>`;
  }
  if (o.status === 'delivered' && o.deliveredOn) {
    return `Total: <strong>${totalStr}</strong> &nbsp;·&nbsp; Delivered on: <strong>${o.deliveredOn}</strong>`;
  }
  if (o.estimated) {
    return `Total: <strong>${totalStr}</strong> &nbsp;·&nbsp; Estimated: <strong>${o.estimated}</strong>`;
  }
  return `Total: <strong>${totalStr}</strong>`;
}

function escAttr(s) {
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
}

function renderOrders() {
  const con = document.getElementById('ordersListContainer');
  if (!con) return;
  if (orderHistory.length === 0) {
    con.innerHTML = `<div class="empty-state"><div class="big-icon">🥡</div><h3>No orders yet</h3><p>Place your first order and track delivery from here.</p><button class="btn-primary" onclick="showPage('home')" style="margin:0 auto;display:block">Browse menu</button></div>`;
    return;
  }
  con.innerHTML = orderHistory.map(o => {
    const chips = o.items.map(i => {
      const img = i.image ? `<img class="order-chip-img" src="${escAttr(i.image)}" alt="" referrerpolicy="no-referrer" ${IMG_ONERROR}>` : '';
      return `<div class="order-item-chip">${img}<span>${escAttr(i.name)} ×${i.qty}</span></div>`;
    }).join('');
    return `
    <div class="order-card">
      <div class="order-top"><div><div class="order-id">Order #${o.id}</div><div class="order-date">${o.date}</div></div><span class="order-status ${orderStatusClass(o.status)}">${orderStatusLabel(o.status)}</span></div>
      <div class="order-items">${chips}</div>
      <div class="order-total">${orderFooterLine(o)}</div>
    </div>`;
  }).join('');
}


function renderProducts(containerId, products) {
  const grid = document.getElementById(containerId);
  grid.innerHTML = '';
  products.forEach(p => {
    const pct = Math.round((1 - p.price/p.orig)*100);
    const bgMap = {pizza:'#FFF5EE',indian:'#FFF8F0',chinese:'#FFF5F5',asian:'#F0FFF8',american:'#FFF0F0',healthy:'#F0FFF4',desserts:'#FFF5FA',combo:'#F5F0FF'};
    const bg = bgMap[p.cat] || '#F5F5F5';

    // BUG: Star row always shows 5 filled stars (rating text is still wrong vs display).
    const fullStars = '★'.repeat(5);
    const emptyStars = '';

    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.cat = p.cat;
    card.innerHTML = `
      <div class="prod-img" style="background:${bg}">
        ${p.badge ? `<span class="badge ${p.badge}">${p.badge==='sale'?`-${pct}%`:p.badge.charAt(0).toUpperCase()+p.badge.slice(1)}</span>` : ''}
        <button class="wish-btn" id="wish-${p.id}" onclick="toggleWishlist(${p.id},this)" title="Save dish">🤍</button>
        <img class="prod-photo" src="${escAttr(p.image)}" alt="${escAttr(p.name)}" loading="lazy" width="600" height="600" referrerpolicy="no-referrer" ${IMG_ONERROR}>
      </div>
      <div class="prod-info">
        <div class="prod-cat">${p.cat.charAt(0).toUpperCase() + p.cat.slice(1)}</div>
        <div class="prod-name">${p.name}</div>
        <div class="prod-rating">
          <span class="stars">${fullStars}${emptyStars}</span>
          <span class="rating-val">${p.rating} (${p.rev.toLocaleString('en-IN')})</span>
        </div>
        <div class="prod-bottom">
          <div class="prod-price">₹${p.price.toLocaleString('en-IN')}<span class="prod-orig">₹${p.orig.toLocaleString('en-IN')}</span></div>
          <button class="add-btn" onclick="addToCart(${p.id})">Add to bag</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}


function filterCat(cat, pill) {

  document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
  if (pill) pill.classList.add('active');
  else {
    document.querySelectorAll('.cat-pill').forEach(p => {
      if (p.querySelector('.cn').textContent.toLowerCase().includes(cat === 'all' ? 'all' : cat)) {
        p.classList.add('active');
      }
    });
  }

  const cards = document.querySelectorAll('#productsGrid .product-card');
  cards.forEach(c => {
    c.style.display = (cat === 'all' || c.dataset.cat === cat) ? 'block' : 'none';
  });

  if (cat !== 'all') {
    document.getElementById('featured').scrollIntoView({behavior:'smooth'});
  }
}


function updateCarousel() {
  document.getElementById('carouselSlides').style.transform = `translateX(-${currentSlide * 100}%)`;
  const dots = document.querySelectorAll('.cdot');
  dots.forEach(d => d.classList.remove('active'));
  if (dots[currentSlide]) dots[currentSlide].classList.add('active');
}

function moveCarousel(dir) {
  const total = 3;
  currentSlide = (currentSlide + dir + total) % total;
  updateCarousel();
}

function goSlide(i) {
  currentSlide = i;
  updateCarousel();
}

function startCarousel() {
  carouselInterval = setInterval(() => moveCarousel(1), 4000);
}


function startTimer() {
  // BUG: Countdown target is "now", so timer stays at 00:00:00.
  const endTime = new Date();

  function tick() {
    const now = new Date();
    const remaining = endTime - now; 
    

    if (remaining <= 0) {
      document.getElementById('timerH').textContent = '00';
      document.getElementById('timerM').textContent = '00';
      document.getElementById('timerS').textContent = '00';
      return; 
    }

    const h = String(Math.floor(remaining / 3600000)).padStart(2,'0');
    const m = String(Math.floor((remaining % 3600000) / 60000)).padStart(2,'0');
    const s = String(Math.floor((remaining % 60000) / 1000)).padStart(2,'0');
    document.getElementById('timerH').textContent = h;
    document.getElementById('timerM').textContent = m;
    document.getElementById('timerS').textContent = s;
  }

  tick();
  setInterval(tick, 1000);
}


function addToCart(id) {
  const all = [...PRODUCTS, ...DEALS];
  const p = all.find(x => x.id === id);
  if (!p) return;
  // BUG: Same dish added twice creates two lines instead of increasing quantity.
  cart.push({ product: p, quantity: 1 });
  updateBadge();
  renderCart();
  showToast(`✅ ${p.name} added to bag`);
}

function updateBadge() {
  const n = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cartBadge').textContent = n;
}

function removeFromCart(i) {
  cart.splice(i, 1);
  renderCart();
  updateBadge();
  calcTotals();
}

function changeQty(i, d) {
  cart[i].quantity += d;
  if (cart[i].quantity <= 0) { removeFromCart(i); return; }
  renderCart();
  calcTotals();
}

function renderCart() {
  const con = document.getElementById('cartItemsContainer');
  const emp = document.getElementById('cartEmpty');
  const existing = con.querySelectorAll('.cart-item');
  existing.forEach(e => e.remove());

  if (cart.length === 0) {
    emp.style.display = 'block';
    calcTotals();
    return;
  }
  emp.style.display = 'none';

  cart.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="ci-img"><img src="${escAttr(item.product.image)}" alt="" width="68" height="68" loading="lazy" referrerpolicy="no-referrer" ${IMG_ONERROR}></div>
      <div class="ci-details">
        <div class="ci-name">${item.product.name}</div>
        <div class="ci-price">₹${item.product.price.toLocaleString('en-IN')} each</div>
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="changeQty(${i},-1)">−</button>
          <span class="qty-num">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQty(${i},+1)">+</button>
        </div>
      </div>
      <button class="ci-remove" onclick="removeFromCart(${i})">🗑️</button>
    `;
    con.appendChild(div);
  });
  calcTotals();
}


function calcTotals() {
  if (cart.length === 0) {
    document.getElementById('subtotalDisplay').textContent = '₹0.00';
    document.getElementById('discountDisplay').textContent = '-₹0.00';
    document.getElementById('deliveryDisplay').textContent = '₹49.00';
    document.getElementById('totalDisplay').textContent = '₹49.00';
    lastCartTotals = { subtotal: 0, delivery: 0, discAmt: 0, total: 0 };
    return;
  }

  // BUG: Subtotal only reflects last line item (accumulator reset each pass).
  let subtotal = cart.reduce((acc, item) => {
    acc = 0;
    return acc + item.product.price * item.quantity;
  }, 0);

  const delivery = subtotal > 999 ? 0 : 49;
  let discAmt = 0;
  if (couponApplied) {
    discAmt = Math.round((subtotal + delivery) * discount / 100);
  }
  const total = Math.max(0, subtotal + delivery - discAmt);
  lastCartTotals = { subtotal, delivery, discAmt, total };

  document.getElementById('subtotalDisplay').textContent = `₹${subtotal.toLocaleString('en-IN')}.00`;
  document.getElementById('discountDisplay').textContent = `-₹${discAmt.toLocaleString('en-IN')}.00`;
  document.getElementById('deliveryDisplay').textContent = delivery === 0 ? 'FREE' : `₹${delivery}.00`;
  document.getElementById('totalDisplay').textContent = `₹${total.toLocaleString('en-IN')}.00`;
}

function applyCoupon() {
  const code = document.getElementById('couponInput').value.trim().toUpperCase();
  const msg = document.getElementById('couponMsg');
  const VALID = { NEST10: 10, SAVE20: 20, FLAT50: 50 };
  if (VALID[code]) {
    discount = VALID[code];
    couponApplied = true;
    msg.className = 'coupon-msg ok';
    msg.textContent = `🎉 ${discount}% discount applied!`;
    calcTotals();
  } else {
    msg.className = 'coupon-msg err';
    msg.textContent = '❌ Invalid code. Try NEST10';
  }
}


function toggleWishlist(id, btn) {
  const idx = wishlist.indexOf(id);
  if (idx === -1) {
    wishlist.push(id);
    btn.textContent = '❤️';
    showToast('❤️ Saved to favorites');
  } else {
    wishlist.splice(idx, 1);
    btn.textContent = '🤍';
    showToast('Removed from favorites');
  }
}

function renderWishlist() {
  const con = document.getElementById('wishlistContent');
  if (wishlist.length === 0) {
    con.innerHTML = `<div class="empty-state"><div class="big-icon">🤍</div><h3>No saved dishes yet</h3><p>Tap the heart on any dish to save it for quick reorder.</p><button class="btn-primary" onclick="showPage('home')" style="margin:0 auto;display:block">Explore menu</button></div>`;
    return;
  }
  const all = [...PRODUCTS, ...DEALS];
  const items = wishlist.map(id => all.find(p => p.id === id)).filter(Boolean);
  con.innerHTML = '<div class="wishlist-grid" id="wishlistGrid"></div>';
  renderProducts('wishlistGrid', items);
 
  items.forEach(p => {
    const btn = document.getElementById(`wish-${p.id}`);
    if (btn) btn.textContent = '❤️';
  });
}

function handleSearch(val) {
  const box = document.getElementById('searchResults');
  if (!val.trim()) { box.classList.remove('open'); return; }
  const all = [...PRODUCTS, ...DEALS];
  const results = all.filter(p => p.name.toLowerCase().includes(val.toLowerCase())).slice(0,6);
  if (!results.length) { box.classList.remove('open'); return; }
  box.innerHTML = results.map(p =>
    `<div class="sr-item" onclick="addToCart(${p.id});closeSearch()">
      <img class="sr-thumb" src="${escAttr(p.image)}" alt="" referrerpolicy="no-referrer" ${IMG_ONERROR}>
      <span>${p.name} — <strong>₹${p.price.toLocaleString('en-IN')}</strong></span>
    </div>`
  ).join('');
  box.classList.add('open');
}

function closeSearch() {
  document.getElementById('searchResults').classList.remove('open');
}


function toggleNotif() {
  document.getElementById('notifPanel').classList.toggle('open');
}

function markAllRead() {
  document.querySelectorAll('.notif-item.unread').forEach(n => n.classList.remove('unread'));
  document.getElementById('notifBadge').style.display = 'none';
  document.getElementById('notifPanel').classList.remove('open');
}

document.addEventListener('click', function(e) {
  const panel = document.getElementById('notifPanel');
  const btn = document.getElementById('notifBtn');
  if (panel.classList.contains('open') && !panel.contains(e.target) && !btn.contains(e.target)) {
    panel.classList.remove('open');
  }
});


function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}


function checkout() {
  if (cart.length === 0) { showToast('🥡 Your bag is empty'); return; }
  calcTotals();
  const t = lastCartTotals;
  const estDate = new Date(Date.now() + 3 * 86400000);
  orderHistory.unshift({
    id: 'MN' + Date.now().toString().slice(-6),
    date: formatOrderDate(new Date()),
    status: 'processing',
    items: cart.map(line => ({
      image: line.product.image,
      name: line.product.name,
      qty: line.quantity,
    })),
    total: t.total,
    estimated: formatOrderDate(estDate),
  });
  renderOrders();
  document.getElementById('modalTotal').textContent = document.getElementById('totalDisplay').textContent;
  document.getElementById('checkoutModal').classList.add('open');
}
function closeModal() {
  document.getElementById('checkoutModal').classList.remove('open');
}
function clearCart() {
  cart = []; couponApplied = false; discount = 0;
  document.getElementById('couponInput').value = '';
  document.getElementById('couponMsg').textContent = '';
  renderCart(); updateBadge(); closeCart();
}


function subscribeNewsletter(btn) {
  const input = btn.previousElementSibling;
  if (!input.value.includes('@')) { showToast('⚠️ Enter a valid email'); return; }
  showToast('🎉 Subscribed successfully!');
  input.value = '';
}


function showToast(msg) {
  const con = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  con.appendChild(t);
  setTimeout(() => t.remove(), 2700);
}


(function init() {
  renderProducts('productsGrid', PRODUCTS);
  renderProducts('dealsGrid', DEALS);
  renderOrders();
  startTimer();
  startCarousel();
  updateCarousel();
})();