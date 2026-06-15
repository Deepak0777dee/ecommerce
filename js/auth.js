/* ==========================================
   STACKLY - Premium E-Commerce
   auth.js
   localStorage-based mock authentication
   ========================================== */

const AUTH_KEY = 'stackly_user';

function authLogin(name, email, password) {
  // If user already exists in localStorage and matches email/password, preserve their role.
  // Otherwise, default to 'customer'.
  let role = 'customer';
  const existing = authGetUser();
  if (existing && existing.email === email && existing.password === password) {
    role = existing.role || 'customer';
  }
  
  const user = { name, email, password, role, loggedIn: true, ts: Date.now() };
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

function authSignup(name, email, password, role = 'customer') {
  const user = { name, email, password, role, loggedIn: true, ts: Date.now() };
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
  window.location.href = 'login.html';
}

function authSyncNavbar() {
  const user = authGetUser();

  // Desktop navbar
  const loginWraps = document.querySelectorAll('.nav-login-wrap');
  loginWraps.forEach(loginWrap => {
    if (user) {
      const initial = (user.name || 'U')[0].toUpperCase();
      const firstName = user.name ? user.name.split(' ')[0] : 'User';
      const dashPath = user.role === 'admin' ? 'admin_dashboard.html' : 'dashboard.html';
      
      loginWrap.innerHTML = `
        <div class="nav-user-chip" id="nav-user-chip" role="button" aria-label="User menu" aria-expanded="false" tabindex="0">
          <div class="nav-user-avatar">${initial}</div>
          <span class="nav-user-name">${firstName}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
          <div class="nav-user-dropdown" id="nav-user-dropdown" role="menu">
            <div class="dropdown-header">
              <p class="dropdown-name">${user.name}</p>
              <p class="dropdown-email">${user.email}</p>
            </div>
            <div class="dropdown-divider"></div>
            <a href="${dashPath}#overview" role="menuitem" class="dropdown-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Dashboard
            </a>
            ${user.role === 'admin' ? `
            <a href="${dashPath}#settings" role="menuitem" class="dropdown-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              Settings
            </a>
            ` : `
            <a href="${dashPath}#profile" role="menuitem" class="dropdown-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              My Profile
            </a>
            <a href="${dashPath}#orders" role="menuitem" class="dropdown-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              My Orders
            </a>
            `}
            <button onclick="authLogout()" class="dropdown-item dropdown-logout" role="menuitem">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </div>`;

      // Chip toggle
      const chip = loginWrap.querySelector('#nav-user-chip');
      const dropdown = loginWrap.querySelector('#nav-user-dropdown');
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
      loginWrap.innerHTML = `<a href="login.html" class="btn btn-outline btn-sm nav-login-btn">Sign In</a>`;
    }
  });

  // Mobile menu login wrap
  const mobileLoginWraps = document.querySelectorAll('.mobile-login-wrap');
  mobileLoginWraps.forEach(mobileLoginWrap => {
    if (user) {
      const initial = (user.name || 'U')[0].toUpperCase();
      mobileLoginWrap.innerHTML = `
        <div class="mobile-user-card">
          <div class="mobile-user-avatar">${initial}</div>
          <div class="mobile-user-info">
            <div class="mobile-user-name">${user.name}</div>
            <div class="mobile-user-email">${user.email}</div>
          </div>
          <button onclick="authLogout()" class="mobile-logout-btn">Logout</button>
        </div>`;
    } else {
      mobileLoginWrap.innerHTML = `<a href="login.html" class="btn btn-primary btn-sm" style="width:100%; justify-content:center;">Sign In / Register</a>`;
    }
  });
}

document.addEventListener('DOMContentLoaded', authSyncNavbar);
