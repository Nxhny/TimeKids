// public/js/auth.js
// ─────────────────────────────────────────────────────────────────────────────
// Handles login & register form submissions.
// ─────────────────────────────────────────────────────────────────────────────
import api from './api.js';

const path = window.location.pathname;
const msgEl = document.getElementById('form-message');

function showMessage(text, type = 'error') {
  msgEl.className = `form-message ${type}`;
  msgEl.innerHTML = `<span>${type === 'error' ? '❌' : '✅'}</span> ${text}`;
}

function setLoading(btn, loading) {
  const text = btn.querySelector('#btn-text');
  const spinner = btn.querySelector('#btn-spinner');
  btn.disabled = loading;
  if (text) text.style.opacity = loading ? '0.5' : '1';
  if (spinner) spinner.style.display = loading ? 'inline' : 'none';
}

// ── LOGIN ─────────────────────────────────────────────────────────────────
if (path === '/login') {
  const form = document.getElementById('login-form');
  const btn  = document.getElementById('submit-btn');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) { showMessage('Please fill in all fields.'); return; }

    setLoading(btn, true);
    try {
      const data = await api.post('/auth/login', { email, password });
      // Store token for API calls
      if (data.access_token) localStorage.setItem('tk_token', data.access_token);
      localStorage.setItem('tk_user', JSON.stringify(data.user));
      showMessage('Welcome back! Redirecting…', 'success');
      setTimeout(() => { window.location.href = '/dashboard'; }, 800);
    } catch (err) {
      showMessage(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(btn, false);
    }
  });
}

// ── REGISTER ──────────────────────────────────────────────────────────────
if (path === '/register') {
  const form = document.getElementById('register-form');
  const btn  = document.getElementById('submit-btn');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const display_name = form.display_name.value.trim();
    const email        = form.email.value.trim();
    const password     = form.password.value;
    const plan         = form.plan?.value || 'free';

    if (!display_name || !email || !password) {
      showMessage('Please fill in all fields.'); return;
    }
    if (password.length < 8) {
      showMessage('Password must be at least 8 characters.'); return;
    }

    setLoading(btn, true);
    try {
      await api.post('/auth/signup', { display_name, email, password, plan });
      showMessage('Account created! Taking you to login…', 'success');
      setTimeout(() => { window.location.href = '/login'; }, 1200);
    } catch (err) {
      showMessage(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(btn, false);
    }
  });
}

// Redirect already-logged-in users away from auth pages
(async () => {
  const token = localStorage.getItem('tk_token');
  if (!token) return;
  try {
    await api.get('/auth/me');
    window.location.href = '/dashboard';
  } catch {
    localStorage.removeItem('tk_token');
    localStorage.removeItem('tk_user');
  }
})();
