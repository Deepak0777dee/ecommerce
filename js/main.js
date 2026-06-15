/* ===================================
   STACKLY - Main JavaScript
   Shared interactions & animations
   =================================== */

// ─── Custom Cursor ───
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

if (cursor && follower) {
  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = followerX + 'px';
    follower.style.top = followerY + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  const hoverTargets = document.querySelectorAll('a, button, .product-card, .category-card, .feature-card, [data-hover]');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
      follower.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
      follower.classList.remove('hover');
    });
  });
}

// ─── Navigation ───
const nav = document.querySelector('.nav');
const hamburger = document.querySelector('.nav-hamburger');
const mobileNav = document.querySelector('.mobile-nav');
const mobileOverlay = document.querySelector('.mobile-nav-overlay');

// Scroll detection for nav
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    nav?.classList.add('scrolled');
  } else {
    nav?.classList.remove('scrolled');
  }
  updateScrollTop();
}, { passive: true });

// Mobile nav toggle
hamburger?.addEventListener('click', () => {
  mobileNav?.classList.toggle('open');
  mobileOverlay?.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  hamburger.classList.toggle('active');
  if (hamburger.classList.contains('active')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

mobileOverlay?.addEventListener('click', () => {
  mobileNav?.classList.remove('open');
  mobileOverlay?.classList.remove('open');
  hamburger?.classList.remove('active');
  hamburger?.querySelectorAll('span').forEach(s => s.style.transform = s.style.opacity = '');
});

document.addEventListener('click', (e) => {
  if (e.target.closest('#mobile-nav-close')) {
    mobileNav?.classList.remove('open');
    mobileOverlay?.classList.remove('open');
    hamburger?.classList.remove('active');
    hamburger?.querySelectorAll('span').forEach(s => s.style.transform = s.style.opacity = '');
  }
});


// ─── Active nav link ───
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPath || (currentPath === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ─── Scroll Reveal (IntersectionObserver) ───
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

initScrollReveal();

// ─── Scroll to Top ───
const scrollTopBtn = document.querySelector('.scroll-top');

function updateScrollTop() {
  if (window.scrollY > 400) {
    scrollTopBtn?.classList.add('visible');
  } else {
    scrollTopBtn?.classList.remove('visible');
  }
}

scrollTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ─── Counter Animation ───
function animateCounter(el, target, duration = 2000, suffix = '') {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      start = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(start).toLocaleString() + suffix;
  }, 16);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.counter);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, 2000, suffix);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
}

initCounters();

// ─── GSAP Animations (loaded from CDN) ───
function initGSAP() {
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);
  setupAceternityText();

  // --- Mouse Glow ---
  let glow = document.querySelector('.mouse-glow');
  if (!glow) {
    glow = document.createElement('div');
    glow.className = 'mouse-glow';
    document.body.appendChild(glow);
  }
  const xTo = gsap.quickTo(glow, "x", {duration: 0.6, ease: "power3"}),
        yTo = gsap.quickTo(glow, "y", {duration: 0.6, ease: "power3"});
  
  window.addEventListener("mousemove", e => {
    xTo(e.clientX);
    yTo(e.clientY);
  });

  // Clear CSS reveal classes from elements that GSAP will animate to prevent opacity 0 to 0 bugs
  const gsapTargets = document.querySelectorAll('.section-title, .product-card, .feature-card, .category-card, .testimonial-card, .value-card, .cta-banner');
  gsapTargets.forEach(el => {
    el.classList.remove('reveal', 'reveal-left', 'reveal-right');
    // Force opacity to 1 so that GSAP from() can read it correctly if from() is used
    el.style.opacity = '1'; 
    el.style.transform = 'none';
  });

  const heroElements = [
    { selector: '.hero-badge', delay: 0.1 },
    { selector: '.hero-desc', delay: 0.7 },
    { selector: '.hero-cta', delay: 0.9 }
  ];
  heroElements.forEach(item => {
    if (document.querySelector(item.selector)) {
      gsap.fromTo(item.selector,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: item.delay }
      );
    }
  });

  if (document.querySelector('.hero-stats .stat-item')) {
    gsap.fromTo('.hero-stats .stat-item',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out', delay: 1.1 }
    );
  }

  if (document.querySelector('.hero-main-image')) {
    gsap.fromTo('.hero-main-image',
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out', delay: 0.4 }
    );
  }

  // Use utils.toArray to iterate over grids for proper scoping
  gsap.utils.toArray('.products-grid').forEach(grid => {
    const cards = grid.querySelectorAll('.product-card');
    if (cards.length) {
      gsap.fromTo(cards,
        { opacity: 0, y: 60, scale: 0.95 },
        { scrollTrigger: { trigger: grid, start: 'top 85%' }, opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out' }
      );
    }
  });

  gsap.utils.toArray('.features-grid').forEach(grid => {
    const cards = grid.querySelectorAll('.feature-card');
    if (cards.length) {
      gsap.fromTo(cards,
        { opacity: 0, y: 50 },
        { scrollTrigger: { trigger: grid, start: 'top 85%' }, opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' }
      );
    }
  });

  gsap.utils.toArray('.categories-grid').forEach(grid => {
    const cards = grid.querySelectorAll('.category-card');
    if (cards.length) {
      gsap.fromTo(cards,
        { opacity: 0, scale: 0.92 },
        { scrollTrigger: { trigger: grid, start: 'top 85%' }, opacity: 1, scale: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' }
      );
    }
  });

  gsap.utils.toArray('.testimonials-grid').forEach(grid => {
    const cards = grid.querySelectorAll('.testimonial-card');
    if (cards.length) {
      gsap.fromTo(cards,
        { opacity: 0, y: 40 },
        { scrollTrigger: { trigger: grid, start: 'top 85%' }, opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out' }
      );
    }
  });

  gsap.utils.toArray('.cta-banner').forEach(banner => {
    gsap.fromTo(banner,
      { opacity: 0, y: 60 },
      { scrollTrigger: { trigger: banner, start: 'top 85%' }, opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );
  });

  // Spotlight Parallax
  const spotlightBg = document.querySelector('.spotlight-bg');
  if (spotlightBg) {
    gsap.to(spotlightBg, {
      scrollTrigger: {
        trigger: '.spotlight-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      },
      y: 150,
      ease: 'none'
    });
  }

  const spotlightCard = document.querySelector('.spotlight-card');
  if (spotlightCard) {
    gsap.fromTo(spotlightCard,
      { opacity: 0, y: 100 },
      { scrollTrigger: { trigger: '.spotlight-section', start: 'top 60%' }, opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );
  }

  // Lookbook animation
  gsap.utils.toArray('.lookbook-container').forEach(look => {
    gsap.fromTo(look,
      { opacity: 0, scale: 0.95 },
      { scrollTrigger: { trigger: look, start: 'top 80%' }, opacity: 1, scale: 1, duration: 1, ease: 'power3.out' }
    );
  });

  // Parallax on hero orbs
  const orbs = document.querySelectorAll('.hero-orb');
  orbs.forEach((orb, i) => {
    gsap.to(orb, {
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      y: (i + 1) * -80,
      ease: 'none'
    });
  });

  // Section title animations
  gsap.utils.toArray('.section-title').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      { scrollTrigger: { trigger: el, start: 'top 85%' }, opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );
  });

  gsap.utils.toArray('.values-grid').forEach(grid => {
    const cards = grid.querySelectorAll('.value-card');
    if (cards.length) {
      gsap.fromTo(cards,
        { opacity: 0, y: 50, scale: 0.95 },
        { scrollTrigger: { trigger: grid, start: 'top 85%' }, opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out' }
      );
    }
  });

  const statBands = document.querySelectorAll('.stat-band-number');
  if (statBands.length) {
    gsap.fromTo(statBands,
      { opacity: 0, scale: 0.5 },
      { scrollTrigger: { trigger: '.stats-band', start: 'top 85%' }, opacity: 1, scale: 1, duration: 0.8, stagger: 0.15, ease: 'back.out(1.5)' }
    );
  }
}

// ─── Product image quick-view on hover ───
function initProductHovers() {
  document.querySelectorAll('.product-card').forEach(card => {
    const img = card.querySelector('.product-card-image img');
    if (!img) return;

    card.addEventListener('mouseenter', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(img, { scale: 1.08, duration: 0.5, ease: 'power2.out' });
      }
    });
    card.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(img, { scale: 1, duration: 0.5, ease: 'power2.out' });
      }
    });
  });
}

// ─── Filter checkboxes (shop page) ───
function initFilters() {
  document.querySelectorAll('.filter-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const cb = opt.querySelector('.filter-checkbox');
      if (cb) cb.classList.toggle('checked');
      if (cb?.classList.contains('checked')) {
        cb.innerHTML = '✓';
      } else {
        cb.innerHTML = '';
      }
    });
  });
}
initFilters();

// ─── Product detail: quantity ───
const qtyBtns = document.querySelectorAll('.qty-btn');
const qtyDisplay = document.querySelector('.qty-display');
if (qtyDisplay) {
  let qty = 1;
  qtyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.action === 'plus') qty = Math.min(qty + 1, 99);
      if (btn.dataset.action === 'minus') qty = Math.max(qty - 1, 1);
      qtyDisplay.textContent = qty;
    });
  });
}

// ─── Product gallery thumbs ───
const thumbs = document.querySelectorAll('.product-thumb');
const mainImg = document.querySelector('.product-gallery-main img');
if (thumbs.length && mainImg) {
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const src = thumb.querySelector('img')?.src;
      if (src) {
        if (typeof gsap !== 'undefined') {
          gsap.to(mainImg, {
            opacity: 0, scale: 0.97, duration: 0.2,
            onComplete: () => {
              mainImg.src = src;
              gsap.to(mainImg, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' });
            }
          });
        } else {
          mainImg.src = src;
        }
      }
    });
  });
}

// ─── Size selection ───
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.size-options')?.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ─── Color selection ───
document.querySelectorAll('.color-dot').forEach(dot => {
  dot.addEventListener('click', () => {
    dot.closest('.color-options')?.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
  });
});

// ─── Newsletter form ───
const newsletterForm = document.querySelector('.newsletter-form');
newsletterForm?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = newsletterForm.querySelector('button');
  const original = btn.innerHTML;
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px; display:inline-block; vertical-align:middle;"><path d="M20 6L9 17l-5-5"/></svg> Subscribed!';
  btn.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
  setTimeout(() => {
    btn.innerHTML = original;
    btn.style.background = '';
    newsletterForm.reset();
  }, 3000);
});

// ─── Contact form ───
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    let isValid = true;
    
    const first = document.getElementById('first-name').value.trim();
    const last = document.getElementById('last-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value.trim();

    const grpFirst = document.getElementById('grp-contact-first');
    const grpLast = document.getElementById('grp-contact-last');
    const grpEmail = document.getElementById('grp-contact-email');
    const grpSubject = document.getElementById('grp-contact-subject');
    const grpMessage = document.getElementById('grp-contact-message');

    [grpFirst, grpLast, grpEmail, grpSubject, grpMessage].forEach(g => g.classList.remove('has-error'));

    // Name validations
    if (!first) {
      document.getElementById('err-contact-first').innerText = 'Please enter your first name.';
      grpFirst.classList.add('has-error');
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(first)) {
      document.getElementById('err-contact-first').innerText = 'Only alphabetic characters allowed.';
      grpFirst.classList.add('has-error');
      isValid = false;
    }

    if (!last) {
      document.getElementById('err-contact-last').innerText = 'Please enter your last name.';
      grpLast.classList.add('has-error');
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(last)) {
      document.getElementById('err-contact-last').innerText = 'Only alphabetic characters allowed.';
      grpLast.classList.add('has-error');
      isValid = false;
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      document.getElementById('err-contact-email').innerText = 'Please enter your email.';
      grpEmail.classList.add('has-error');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      document.getElementById('err-contact-email').innerText = 'Please enter a valid email address.';
      grpEmail.classList.add('has-error');
      isValid = false;
    }

    if (!subject) {
      document.getElementById('err-contact-subject').innerText = 'Please select a subject.';
      grpSubject.classList.add('has-error');
      isValid = false;
    }

    if (!message) {
      document.getElementById('err-contact-message').innerText = 'Please enter a message.';
      grpMessage.classList.add('has-error');
      isValid = false;
    }

    if (!isValid) return;

    contactForm.reset();

    // Toaster notification
    const toaster = document.createElement('div');
    toaster.className = 'toaster';
    toaster.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Message Sent Successfully!';
    document.body.appendChild(toaster);

    // Trigger animation
    setTimeout(() => toaster.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
      toaster.classList.remove('show');
      setTimeout(() => toaster.remove(), 400);
    }, 3000);
  });
}

// ─── Add to Cart ───
document.querySelectorAll('.product-add-btn, [data-cart-btn]').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    const badge = document.querySelector('.nav-icon-btn .badge');
    if (badge) {
      const count = parseInt(badge.textContent) + 1;
      badge.textContent = count;
      if (typeof gsap !== 'undefined') {
        gsap.from(badge, { scale: 1.5, duration: 0.3, ease: 'back.out(2)' });
      }
    }

    // Ripple
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position:absolute;width:60px;height:60px;
      background:rgba(78,205,196,0.4);border-radius:50%;
      transform:translate(-50%,-50%) scale(0);
      pointer-events:none;
      animation: ripple-anim 0.6s ease-out forwards;
    `;
    const rect = btn.getBoundingClientRect();
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top = (e.clientY - rect.top) + 'px';
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// Ripple keyframe
const rippleStyle = document.createElement('style');
rippleStyle.textContent = '@keyframes ripple-anim { to { transform: translate(-50%,-50%) scale(3); opacity:0; } }';
document.head.appendChild(rippleStyle);

// ─── Wishlist toggle ───
document.querySelectorAll('[data-wishlist]').forEach(btn => {
  btn.addEventListener('click', function() {
    const isActive = this.classList.toggle('active');
    this.style.color = isActive ? '#FF6B6B' : '';
    if (typeof gsap !== 'undefined') {
      gsap.from(this, { scale: 1.3, duration: 0.3, ease: 'back.out(2)' });
    }
  });
});

// ─── Initialize GSAP after DOM ready ───
document.addEventListener('DOMContentLoaded', () => {
  initGSAP();
  initProductHovers();
});

// If GSAP loaded async
window.addEventListener('load', () => {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
});

// ─── Global Back Button ───
document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.global-back-btn')) {
    const backBtn = document.createElement('button');
    backBtn.className = 'global-back-btn';
    backBtn.setAttribute('aria-label', 'Go back');
    backBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>';
    backBtn.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'index.html';
      }
    });
    
    backBtn.addEventListener('mouseenter', () => {
      if (typeof cursor !== 'undefined' && cursor) cursor.classList.add('hover');
      if (typeof follower !== 'undefined' && follower) follower.classList.add('hover');
    });
    backBtn.addEventListener('mouseleave', () => {
      if (typeof cursor !== 'undefined' && cursor) cursor.classList.remove('hover');
      if (typeof follower !== 'undefined' && follower) follower.classList.remove('hover');
    });

    document.body.appendChild(backBtn);
  }
});

// ─── ACETERNITY UI ANIMATIONS ───
document.addEventListener('DOMContentLoaded', () => {
  // Spotlight Glow Cursor Tracking
  const spotlightWrappers = document.querySelectorAll('.spotlight-card-wrapper');
  
  spotlightWrappers.forEach(wrapper => {
    wrapper.addEventListener('mousemove', (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const glow = wrapper.querySelector('.spotlight-glow');
      if (glow) {
        glow.style.setProperty('--mouseX', x + 'px');
        glow.style.setProperty('--mouseY', y + 'px');
      }
      
      // 3D Tilt Effect
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5; // Max 5 deg tilt
      const rotateY = ((x - centerX) / centerX) * 5;
      
      wrapper.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      wrapper.style.zIndex = '10';
      wrapper.style.transition = 'none'; // remove transition for smooth tracking
    });
    
    wrapper.addEventListener('mouseleave', () => {
      wrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      wrapper.style.zIndex = '1';
      wrapper.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
    });
  });

  // Re-run GSAP triggers if any layout shifted
  if (typeof ScrollTrigger !== 'undefined') {
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);
  }
});

// 3D Hero Image Mouse Tracking
const heroVisual = document.querySelector('.hero-visual');
const heroImageWrapper = document.querySelector('.hero-image-wrapper');
if (heroVisual && heroImageWrapper) {
  heroVisual.addEventListener('mousemove', (e) => {
    const rect = heroVisual.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (-15 to 15 degrees)
    const xPct = (x / rect.width) - 0.5;
    const yPct = (y / rect.height) - 0.5;
    
    const rotateY = xPct * 30; // left-right
    const rotateX = yPct * -30; // up-down
    
    heroImageWrapper.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    heroImageWrapper.style.transition = 'transform 0.1s ease-out';
  });
  
  heroVisual.addEventListener('mouseleave', () => {
    heroImageWrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    heroImageWrapper.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
  });
}



// ─── ACETERNITY TEXT ANIMATION ───
function setupAceternityText() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  const titles = document.querySelectorAll('.section-title, .hero-title, .section-eyebrow, .footer-giant-text');
  
  titles.forEach(title => {
    // Avoid double splitting
    if (title.classList.contains('text-split-done')) return;
    title.classList.add('text-split-done');

    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (!text.trim()) return null;
        const words = text.split(/(\s+)/);
        const fragment = document.createDocumentFragment();
        words.forEach(word => {
          if (!word.trim()) {
            fragment.appendChild(document.createTextNode(word));
            return;
          }
          const wrap = document.createElement('span');
          wrap.className = 'word-wrap';
          wrap.innerHTML = `<span class="word-inner">${word}</span>`;
          fragment.appendChild(wrap);
        });
        return fragment;
      } else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('word-wrap') && !node.classList.contains('word-inner')) {
        const children = Array.from(node.childNodes);
        children.forEach(child => {
          const replacement = processNode(child);
          if (replacement) {
            node.replaceChild(replacement, child);
          }
        });
        return null;
      }
      return null;
    };

    Array.from(title.childNodes).forEach(child => {
      const replacement = processNode(child);
      if (replacement) {
        title.replaceChild(replacement, child);
      }
    });

    const wordsInner = title.querySelectorAll('.word-inner');
    if (wordsInner.length) {
      gsap.to(wordsInner, {
        scrollTrigger: {
          trigger: title,
          start: 'top 90%',
        },
        y: 0,
        rotateX: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.05,
        ease: 'power3.out',
        delay: title.classList.contains('hero-title') ? 0.3 : 0
      });
    }
  });
}

// ─── Password Visibility Toggle ───
window.togglePassword = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
  input.setAttribute('type', type);
  
  const eye = btn.querySelector('.eye-icon');
  const eyeOff = btn.querySelector('.eye-off-icon');
  if (type === 'text') {
    eye.style.display = 'none';
    eyeOff.style.display = 'block';
  } else {
    eye.style.display = 'block';
    eyeOff.style.display = 'none';
  }
};
