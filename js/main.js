/* ==========================================
   STACKLY SHOP — main.js
   Global interactivity & animations
   ========================================== */

/* ── PAGE LOADER ── */
function initLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('loaded'), 500);
  });
  // Fallback
  setTimeout(() => loader && loader.classList.add('loaded'), 2200);
}

/* ── NAVBAR ── */
function initNavbar() {
  const navbar = document.getElementById('main-navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Set active link
  const links = navbar.querySelectorAll('.nav-menu a');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ── MOBILE MENU ── */
function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.mobile-menu');
  const close = document.querySelector('.mobile-menu-close');

  if (!toggle || !menu) return;

  const openMenu = () => {
    menu.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    menu.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => menu.classList.contains('open') ? closeMenu() : openMenu());
  close && close.addEventListener('click', closeMenu);
  menu.addEventListener('click', (e) => { if (e.target === menu) closeMenu(); });

  // Set active link in mobile menu
  const mobileLinks = menu.querySelectorAll('.mobile-nav-links a');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  mobileLinks.forEach(link => {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
  });
}

/* ── SCROLL ANIMATIONS (Intersection Observer) ── */
function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-anim]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('anim-in'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ── ANIMATED COUNTERS ── */
function initCounters() {
  const counters = document.querySelectorAll('.fact-num[data-target]');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current) + suffix;
      if (current >= target) clearInterval(timer);
    }, 16);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ── FAQ ACCORDION ── */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => { i.classList.remove('open'); i.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false'); });
      if (!isOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });
}

/* ── TOAST SYSTEM ── */
window.showToast = function(msg, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${icons[type] || icons.info}<span>${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 350);
  }, duration);
};

/* ── CART SYSTEM ── */
const CART_KEY = 'sc_cart';

function cartGet() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function cartSave(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartBadge();
}

function cartAdd(id, name, price, img) {
  const cart = cartGet();
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, img, qty: 1 });
  }
  cartSave(cart);
  window.showToast(`🛒 ${name} added to cart!`, 'success');
}

function cartRemove(id) {
  const cart = cartGet().filter(i => i.id !== id);
  cartSave(cart);
  renderCartDrawer();
}

function cartUpdateQty(id, delta) {
  const cart = cartGet();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty = Math.max(1, item.qty + delta);
    cartSave(cart);
    renderCartDrawer();
  }
}

function cartTotal() {
  return cartGet().reduce((sum, i) => sum + (parseFloat(i.price) * i.qty), 0);
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.nav-cart-badge');
  const count = cartGet().reduce((sum, i) => sum + i.qty, 0);
  badges.forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}

function renderCartDrawer() {
  const drawerItems = document.getElementById('cart-items-list');
  const totalEl = document.getElementById('cart-total-val');
  if (!drawerItems) return;

  const cart = cartGet();
  if (cart.length === 0) {
    drawerItems.innerHTML = `<div class="cart-empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--border-light)"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
      <span>Your cart is empty</span>
    </div>`;
  } else {
    drawerItems.innerHTML = cart.map(item => `
      <div class="cart-item" id="cart-item-${item.id}">
        <img class="cart-item-img" src="${item.img}" alt="${item.name}" onerror="this.style.background='var(--bg-cream)'">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${(parseFloat(item.price) * item.qty).toFixed(2)}</div>
          <span class="cart-item-remove" onclick="cartRemove('${item.id}')">Remove</span>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="cartUpdateQty('${item.id}', -1)" aria-label="Decrease">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="cartUpdateQty('${item.id}', 1)" aria-label="Increase">+</button>
        </div>
      </div>`).join('');
  }

  if (totalEl) totalEl.textContent = '$' + cartTotal().toFixed(2);
}

function initCartDrawer() {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  const closeBtn = document.getElementById('cart-close');
  const cartBtns = document.querySelectorAll('.open-cart-btn, .cart-icon');

  if (!overlay || !drawer) return;

  const open = () => {
    overlay.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderCartDrawer();
  };

  const close = () => {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  };

  cartBtns.forEach(btn => btn.addEventListener('click', open));
  closeBtn && closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);

  // Checkout stub
  const checkoutBtn = document.getElementById('cart-checkout-btn');
  checkoutBtn && checkoutBtn.addEventListener('click', () => {
    if (cartGet().length === 0) {
      window.showToast('Your cart is empty!', 'error');
      return;
    }
    window.showToast('🎉 Order placed successfully! (Demo)', 'success');
    cartSave([]);
    renderCartDrawer();
    close();
  });

  updateCartBadge();
}

/* ── ADD TO CART BUTTONS ── */
function initAddToCartBtns() {
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.dataset.id;
      const name = this.dataset.name;
      const price = this.dataset.price;
      const img = this.dataset.img || 'images/product_apple.webp';
      if (!id || !name || !price) return;
      cartAdd(id, name, price, img);
      this.classList.add('added');
      const orig = this.innerHTML;
      this.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Added!`;
      setTimeout(() => { this.innerHTML = orig; this.classList.remove('added'); }, 2000);
    });
  });
}

/* ── WISHLIST ── */
const WISHLIST_KEY = 'sc_wishlist';

function wishlistGet() {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; }
  catch { return []; }
}

function wishlistToggle(id, name, price, img) {
  let list = wishlistGet();
  const idx = list.findIndex(i => i.id === id);
  if (idx > -1) {
    list.splice(idx, 1);
    window.showToast(`Removed from wishlist`, 'info');
  } else {
    list.push({ id, name, price, img });
    window.showToast(`❤️ ${name} saved to wishlist!`, 'success');
  }
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  syncWishlistBtns();
}

function syncWishlistBtns() {
  const list = wishlistGet();
  document.querySelectorAll('.btn-wishlist').forEach(btn => {
    const id = btn.dataset.id;
    if (list.find(i => i.id === id)) {
      btn.classList.add('wishlisted');
    } else {
      btn.classList.remove('wishlisted');
    }
  });
}

function initWishlistBtns() {
  document.querySelectorAll('.btn-wishlist').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.dataset.id;
      const name = this.dataset.name;
      const price = this.dataset.price;
      const img = this.dataset.img || '';
      wishlistToggle(id, name, price, img);
    });
  });
  syncWishlistBtns();
}

/* ── METEOR EFFECT ── */
function initMeteors() {
  const layer = document.getElementById('meteors-layer');
  if (!layer) return;

  const createMeteor = () => {
    const m = document.createElement('div');
    m.className = 'meteor';
    m.style.left = Math.random() * 100 + '%';
    m.style.top = '-80px';
    const dur = 1.5 + Math.random() * 2;
    m.style.animationDuration = dur + 's';
    m.style.animationDelay = Math.random() * 3 + 's';
    m.style.opacity = 0.3 + Math.random() * 0.7;
    m.style.height = 40 + Math.random() * 60 + 'px';
    layer.appendChild(m);
    setTimeout(() => m.remove(), (dur + 3) * 1000);
  };

  setInterval(createMeteor, 600);
}

/* ── TESTIMONIAL CAROUSEL ── */
function initTestiCarousel() {
  const testimonials = [
    {
      quote: '"I only had a small basket of vegetables. Now I have a thriving family business thanks to the quality produce from Stackly. The freshness is unmatched!"',
      name: 'Sarah M.',
      role: 'Loyal Customer · 2 years',
      tab: 'Family'
    },
    {
      quote: '"My nutritionist recommended Stackly for its pesticide-free selection. My whole family has seen real health improvements since switching."',
      name: 'Dr. Priya K.',
      role: 'Health & Wellness Coach',
      tab: 'Health'
    },
    {
      quote: '"Best value for the quality you get. Compared to supermarkets, Stackly gives me premium fresh produce at prices that make sense."',
      name: 'Marcus R.',
      role: 'Budget-Conscious Shopper',
      tab: 'Price'
    },
    {
      quote: '"The quality is extraordinary. Each delivery is handpicked and perfectly ripe. I have never received a subpar order in 18 months."',
      name: 'Amelia T.',
      role: 'Premium Member',
      tab: 'Quality'
    }
  ];

  let current = 0;
  const quoteEl = document.getElementById('testi-quote');
  const nameEl = document.getElementById('testi-name');
  const roleEl = document.getElementById('testi-role');
  const tabs = document.querySelectorAll('.testi-tab');
  const prevBtn = document.getElementById('testi-prev');
  const nextBtn = document.getElementById('testi-next');

  if (!quoteEl) return;

  function updateTesti(idx) {
    current = idx;
    const t = testimonials[idx];
    quoteEl.style.opacity = '0';
    setTimeout(() => {
      quoteEl.textContent = t.quote;
      if (nameEl) nameEl.textContent = t.name;
      if (roleEl) roleEl.textContent = t.role;
      quoteEl.style.opacity = '1';
    }, 200);
    tabs.forEach((tab, i) => tab.classList.toggle('active', i === idx));
  }

  tabs.forEach((tab, i) => tab.addEventListener('click', () => updateTesti(i)));
  prevBtn && prevBtn.addEventListener('click', () => updateTesti((current - 1 + testimonials.length) % testimonials.length));
  nextBtn && nextBtn.addEventListener('click', () => updateTesti((current + 1) % testimonials.length));

  updateTesti(0);

  // Auto-rotate
  setInterval(() => updateTesti((current + 1) % testimonials.length), 5000);
}

/* ── SHOP FILTER SYSTEM ── */
function initShopFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const products = document.querySelectorAll('.product-card[data-category]');
  const searchInput = document.getElementById('shop-search');

  function filterProducts() {
    const active = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const query = searchInput ? searchInput.value.toLowerCase() : '';

    products.forEach(card => {
      const cat = card.dataset.category || '';
      const name = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
      const matchCat = active === 'all' || cat === active;
      const matchSearch = !query || name.includes(query);
      card.style.display = (matchCat && matchSearch) ? '' : 'none';
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterProducts();
    });
  });

  searchInput && searchInput.addEventListener('input', filterProducts);
}

/* ── TRACKING FORM ── */
function initTrackingForm() {
  const form = document.getElementById('tracking-form');
  if (!form) return;

  const mockOrders = {
    'SC-001': { status: 'delivered', product: 'Premium Apple Box (2kg)', date: 'Jun 10, 2026' },
    'SC-002': { status: 'shipped', product: 'Tropical Fruit Mix (3kg)', date: 'Jun 11, 2026' },
    'SC-003': { status: 'processing', product: 'Organic Kiwi Pack (1kg)', date: 'Jun 12, 2026' },
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('tracking-input');
    const result = document.getElementById('tracking-result');
    const id = input?.value.trim().toUpperCase();

    if (!id) { window.showToast('Please enter an order ID', 'error'); return; }

    const order = mockOrders[id];
    if (!order && result) {
      result.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--text-muted);">
        <p style="font-size:1rem;">No order found for <strong>${id}</strong>. Try: SC-001, SC-002, or SC-003</p></div>`;
      result.style.display = 'block';
      return;
    }

    if (result) {
      const statuses = ['placed', 'processing', 'shipped', 'out_delivery', 'delivered'];
      const currentIdx = { placed: 0, processing: 1, shipped: 2, out_delivery: 3, delivered: 4 }[order.status] || 2;

      const steps = [
        { key: 'placed', label: 'Order Placed', desc: 'Your order has been confirmed', time: 'Jun 10, 09:00 AM' },
        { key: 'processing', label: 'Processing', desc: 'Items being freshly packed at our facility', time: 'Jun 10, 11:30 AM' },
        { key: 'shipped', label: 'Shipped', desc: 'On the way with our delivery partner', time: 'Jun 11, 08:00 AM' },
        { key: 'out_delivery', label: 'Out for Delivery', desc: 'Your delivery is nearby!', time: 'Jun 12, 10:00 AM' },
        { key: 'delivered', label: 'Delivered ✓', desc: 'Package delivered successfully', time: 'Jun 12, 02:15 PM' }
      ];

      result.innerHTML = `
        <div style="background:var(--white);border:1px solid var(--border-light);border-radius:var(--border-radius-lg);padding:2rem;margin-bottom:1.5rem;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;">
            <div>
              <div style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted);margin-bottom:0.25rem;">ORDER ID</div>
              <div style="font-weight:700;font-size:1.1rem;color:var(--text-dark);">${id}</div>
            </div>
            <span class="order-status ${order.status}" style="font-size:0.82rem;">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
          </div>
          <div style="margin-top:1rem;font-size:0.9rem;color:var(--text-muted);">${order.product} · ${order.date}</div>
        </div>
        <div class="timeline">
          ${steps.map((step, i) => `
            <div class="timeline-item ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : ''}">
              <div class="timeline-dot">${i < currentIdx ? '✓' : ''}</div>
              <div class="timeline-title">${step.label}</div>
              <div class="timeline-desc">${step.desc}</div>
              ${i <= currentIdx ? `<div class="timeline-time">${step.time}</div>` : ''}
            </div>`).join('')}
        </div>`;
      result.style.display = 'block';
    }
  });
}

/* ── NEWSLETTER FORM ── */
function initNewsletter() {
  const btn = document.getElementById('newsletter-btn');
  const input = document.getElementById('newsletter-email');
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const email = input.value.trim();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      window.showToast('Please enter a valid email', 'error');
      return;
    }
    btn.textContent = '✓ Subscribed!';
    btn.disabled = true;
    input.value = '';
    window.showToast('🎉 You\'re subscribed! Welcome to Stackly.', 'success');
    setTimeout(() => { btn.textContent = 'Subscribe'; btn.disabled = false; }, 3000);
  });
}

/* ── CONTACT FORM ── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;
    setTimeout(() => {
      window.showToast('✅ Message sent! We\'ll respond within 24 hours.', 'success');
      form.reset();
      btn.textContent = 'Send Message';
      btn.disabled = false;
    }, 1200);
  });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initCounters();
  initFAQ();
  initMeteors();
  initTestiCarousel();
  initCartDrawer();
  initAddToCartBtns();
  initWishlistBtns();
  initShopFilters();
  initTrackingForm();
  initNewsletter();
  initContactForm();
  updateCartBadge();
});
