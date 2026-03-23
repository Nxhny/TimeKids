// public/js/auth.js
// ─────────────────────────────────────────────────────────────────────────────
// Handles login & register form submissions.
// All user-facing strings go through t() for i18n support.
// ─────────────────────────────────────────────────────────────────────────────
import api from './api.js';
import { t, applyTranslations, renderLanguageSwitcher } from './i18n.js';

// ── Apply translations immediately on load ─────────────────────────────────
applyTranslations();
renderLanguageSwitcher('#lang-switcher-slot');
window.addEventListener('langchange', () => applyTranslations());

// ── Helpers ────────────────────────────────────────────────────────────────
const pathName = window.location.pathname;
const msgEl    = document.getElementById('form-message');

function showMessage(text, type = 'error') {
  msgEl.className  = `form-message ${type}`;
  msgEl.innerHTML  = `<span>${type === 'error' ? '❌' : '✅'}</span> ${text}`;
}

function setLoading(btn, loading) {
  const textEl    = btn.querySelector('span#btn-text');      // ✅ CORRIGÉ
  const spinnerEl = btn.querySelector('span#btn-spinner');   // ✅ CORRIGÉ
  btn.disabled = loading;
  if (textEl)    textEl.style.opacity   = loading ? '0.5' : '1';
  if (spinnerEl) spinnerEl.style.display = loading ? 'inline' : 'none';
}

// ── LOGIN ──────────────────────────────────────────────────────────────────
if (pathName === '/login') {
  const form = document.getElementById('login-form');
  const btn  = document.getElementById('submit-btn');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
      showMessage(t('login.error_fields'));
      return;
    }

    setLoading(btn, true);
    try {
      const data = await api.post('/auth/login', { email, password });
      if (data.access_token) localStorage.setItem('tk_token', data.access_token);
      localStorage.setItem('tk_user', JSON.stringify(data.user));
      showMessage(t('login.redirecting'), 'success');
      setTimeout(() => { window.location.href = '/dashboard'; }, 800);
    } catch (err) {
      showMessage(err.message || t('login.error_invalid'));
    } finally {
      setLoading(btn, false);
    }
  });
}

// ── REGISTER ───────────────────────────────────────────────────────────────
if (pathName === '/register') {
  const form = document.getElementById('register-form');
  const btn  = document.getElementById('submit-btn');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const display_name = form.display_name.value.trim();
    const email        = form.email.value.trim();
    const password     = form.password.value;
    const plan         = form.plan?.value || 'free';

    if (!display_name || !email || !password) {
      showMessage(t('login.error_fields'));
      return;
    }
    if (password.length < 8) {
      showMessage(t('register.pw_short'));
      return;
    }

    setLoading(btn, true);
    try {
      await api.post('/auth/signup', { display_name, email, password, plan });
      showMessage(t('register.success'), 'success');
      setTimeout(() => { window.location.href = '/login'; }, 1200);
    } catch (err) {
      showMessage(err.message || t('error.generic'));
    } finally {
      setLoading(btn, false);
    }
  });

  // ── Password strength meter ──────────────────────────────────────────
  document.getElementById('password')?.addEventListener('input', function () {
    const val  = this.value;
    const el   = document.getElementById('pw-strength');
    const fill = document.getElementById('strength-fill');
    const text = document.getElementById('strength-text');
    if (!val) { el.style.display = 'none'; return; }
    el.style.display = 'block';

    let score = 0;
    if (val.length >= 8)        score++;
    if (/[A-Z]/.test(val))      score++;
    if (/[0-9]/.test(val))      score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const levels = [
      { w: '25%', bg: '#f87171', key: 'pw.weak'   },
      { w: '50%', bg: '#fbbf24', key: 'pw.fair'   },
      { w: '75%', bg: '#60a5fa', key: 'pw.good'   },
      { w: '100%',bg: '#34d399', key: 'pw.strong' },
    ];
    const lvl = levels[Math.max(score - 1, 0)];
    fill.style.width      = lvl.w;
    fill.style.background = lvl.bg;
    text.textContent      = t(lvl.key);
  });

  // ── Plan card selection ──────────────────────────────────────────────
  document.querySelectorAll('input[name="plan"]').forEach(radio => {
    radio.addEventListener('change', function () {
      document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
      this.closest('.plan-card').classList.add('selected');
    });
  });
}

// ── Redirect already-logged-in users ──────────────────────────────────────
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
