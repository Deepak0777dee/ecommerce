/* ==========================================
   STACKLY SHOP — auth.js
   localStorage-based auth system
   ========================================== */

const AUTH_KEY = 'sc_user';

function authLogin(name, email, role, password) {
  const user = { name, email, role, password, loggedIn: true, ts: Date.now() };
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

function authSignup(name, email, role, password) {
  const user = { name, email, role, password, loggedIn: true, ts: Date.now() };
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

function authGetUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user && user.loggedIn ? user : null;
  } catch { return null; }
}

function authIsLoggedIn() { return !!authGetUser(); }

function authLogout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = 'index.html';
}

function authSyncNavbar() {
  const user = authGetUser();

  // Desktop navbar login wrap
  const loginWrap = document.querySelector('.nav-login-btn-wrap');
  if (loginWrap) {
    if (user) {
      const initial = (user.name || 'U')[0].toUpperCase();
      const firstName = user.name ? user.name.split(' ')[0] : 'User';
      loginWrap.innerHTML = `
        <div class="nav-user-chip" id="nav-user-chip" role="button" aria-label="User menu" aria-expanded="false" tabindex="0">
          <div class="nav-user-avatar">${initial}</div>
          <span class="nav-user-name">${firstName}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
          <div class="nav-user-dropdown" id="nav-user-dropdown" role="menu">
            <a href="dashboard.html" role="menuitem">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Dashboard
            </a>
            <a href="dashboard.html#orders" role="menuitem">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              My Orders
            </a>
            <a href="dashboard.html#wishlist" role="menuitem">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              Wishlist
            </a>
            <button onclick="authLogout()" class="nav-logout-btn" role="menuitem">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </button>
          </div>
        </div>`;

      const chip = document.getElementById('nav-user-chip');
      const dropdown = document.getElementById('nav-user-dropdown');
      if (chip && dropdown) {
        chip.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = dropdown.classList.toggle('open');
          chip.setAttribute('aria-expanded', isOpen);
        });
        chip.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chip.click(); }
        });
        document.addEventListener('click', () => {
          dropdown.classList.remove('open');
          chip.setAttribute('aria-expanded', 'false');
        });
      }
    } else {
      loginWrap.innerHTML = `<a href="login.html" class="nav-login-btn" id="nav-login-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Login
      </a>`;
    }
  }

  // Mobile login wrap
  const mobileLoginWrap = document.querySelector('.mobile-login-wrap');
  if (mobileLoginWrap) {
    if (user) {
      const initial = (user.name || 'U')[0].toUpperCase();
      mobileLoginWrap.innerHTML = `
        <div style="display:flex;align-items:center;gap:0.75rem;padding:0.875rem 1rem;background:rgba(45,80,22,0.06);border-radius:10px;border:1px solid rgba(45,80,22,0.12);">
          <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--primary-light));display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:1rem;flex-shrink:0;font-family:var(--font-mono);">${initial}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:0.9rem;color:var(--text-dark);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${user.name}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${user.email}</div>
          </div>
          <button onclick="authLogout()" style="flex-shrink:0;font-size:0.78rem;color:#ef4444;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:0.35rem 0.65rem;cursor:pointer;font-weight:600;">Logout</button>
        </div>`;
    } else {
      mobileLoginWrap.innerHTML = `<a href="login.html" style="display:flex;align-items:center;justify-content:center;padding:0.875rem;border-radius:99px;background:var(--accent);color:#fff;font-weight:700;font-size:0.9rem;font-family:var(--font-mono);">Login to Your Account</a>`;
    }
  }
}

// Login form validation
function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const email = document.getElementById('login-email');
    const password = document.getElementById('login-password');

    clearError(email);
    clearError(password);

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      showError(email, 'Please enter a valid email address'); valid = false;
    }
    if (!password.value || password.value.length < 6) {
      showError(password, 'Password must be at least 6 characters'); valid = false;
    }

    if (valid) {
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Logging in…';
      btn.disabled = true;
      setTimeout(() => {
        authLogin('Alex Johnson', email.value, 'customer', password.value);
        window.location.href = 'dashboard.html';
      }, 1000);
    }
  });
}

// Signup form validation
function initSignupForm() {
  const form = document.getElementById('signup-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const name = document.getElementById('signup-name');
    const email = document.getElementById('signup-email');
    const password = document.getElementById('signup-password');
    const confirm = document.getElementById('signup-confirm');

    [name, email, password, confirm].forEach(clearError);

    if (!name.value.trim()) { showError(name, 'Please enter your full name'); valid = false; }
    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) { showError(email, 'Please enter a valid email'); valid = false; }
    if (!password.value || password.value.length < 6) { showError(password, 'Password must be at least 6 characters'); valid = false; }
    if (confirm.value !== password.value) { showError(confirm, 'Passwords do not match'); valid = false; }

    if (valid) {
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Creating account…';
      btn.disabled = true;
      setTimeout(() => {
        authSignup(name.value.trim(), email.value, 'customer', password.value);
        window.location.href = 'dashboard.html';
      }, 1000);
    }
  });
}

function showError(input, msg) {
  const group = input.closest('.form-group');
  if (group) {
    group.classList.add('has-error');
    const errEl = group.querySelector('.form-error-msg');
    if (errEl) errEl.textContent = msg;
  }
  input.classList.add('error');
}

function clearError(input) {
  const group = input.closest('.form-group');
  if (group) group.classList.remove('has-error');
  input.classList.remove('error');
}

document.addEventListener('DOMContentLoaded', () => {
  authSyncNavbar();
  initLoginForm();
  initSignupForm();
});
