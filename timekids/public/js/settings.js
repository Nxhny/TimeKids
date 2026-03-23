// public/js/settings.js
import api from './api.js';
import { showToast, setupThemeToggle, logout } from './utils.js';
import { t, applyTranslations, renderLanguageSwitcher, getLang, setLang, LANGUAGES } from './i18n.js';

setupThemeToggle();
applyTranslations();
renderLanguageSwitcher('#lang-switcher-slot');
window.addEventListener('langchange', () => applyTranslations());

// ── Auth guard ─────────────────────────────────────────────────────────────
let currentUser;
(async () => {
  try {
    const { user } = await api.get('/auth/me');
    currentUser = user;
  } catch {
    window.location.href = '/login';
    return;
  }

  // Fill UI with user data
  document.getElementById('user-name').textContent   = currentUser.display_name || currentUser.email;
  document.getElementById('user-avatar').textContent = (currentUser.display_name?.[0] || '?').toUpperCase();
  document.getElementById('display_name').value      = currentUser.display_name || '';
  document.getElementById('email_display').value     = currentUser.email;

  // Setup avatar picker
  setupAvatarPicker(currentUser);

  // Language switcher in settings card (larger, full-width)
  renderLangCards();
  window.addEventListener('langchange', renderLangCards);

  setupProfileForm();
  setupPasswordForm();
  setupThemeButtons();
  setupDeleteAccount();
  document.getElementById('logout-btn').addEventListener('click', logout);
})();

// ── Language card switcher ────────────────────────────────────────────────
function renderLangCards() {
  const container = document.getElementById('lang-switcher-settings');
  if (!container) return;
  const current = getLang();

  container.innerHTML = Object.entries(LANGUAGES).map(([code, meta]) => `
    <button
      class="lang-card-opt ${code === current ? 'active' : ''}"
      data-lang="${code}"
      style="
        display:flex;align-items:center;gap:12px;width:100%;
        padding:12px 16px;margin-bottom:8px;
        border-radius:var(--radius-md);
        border:2px solid ${code === current ? 'var(--primary)' : 'var(--border)'};
        background:${code === current ? 'var(--sky-50)' : 'var(--bg-card)'};
        cursor:pointer;transition:var(--transition);
        font-size:.9rem;font-weight:700;
        color:${code === current ? 'var(--primary-dark)' : 'var(--text-primary)'};
      "
      title="${meta.label}"
    >
      <span style="font-size:1.4rem;">${meta.flag}</span>
      <span style="flex:1;text-align:left;">${meta.label}</span>
      ${code === current ? '<span style="color:var(--primary);font-size:.8rem;font-weight:900;">✓</span>' : ''}
    </button>
  `).join('');

  container.querySelectorAll('.lang-card-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      setLang(btn.dataset.lang);
      renderLangCards();
      showToast(`🌍 ${LANGUAGES[btn.dataset.lang].label}`, 'success');
    });
  });
}

// ── Profile name form ─────────────────────────────────────────────────────
function setupProfileForm() {
  const form     = document.getElementById('profile-form');
  const msgEl    = document.getElementById('profile-form-msg');
  const savedEl  = document.getElementById('profile-saved');
  const btn      = document.getElementById('save-profile-btn');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const display_name = document.getElementById('display_name').value.trim();
    if (!display_name) { showFormMsg(msgEl, t('login.error_fields'), 'error'); return; }

    btn.disabled = true;
    msgEl.className = 'form-message';
    const avatar_emoji = document.getElementById('avatar_emoji_input')?.value || undefined;
    try {
      await api.put('/auth/profile', { display_name, ...(avatar_emoji ? { avatar_emoji } : {}) });
      // Update nav
      document.getElementById('user-name').textContent = display_name;
      const emojiVal = document.getElementById('avatar_emoji_input')?.value;
      const avatarEl = document.getElementById('user-avatar');
      if (avatarEl) {
        if (emojiVal) { avatarEl.textContent = emojiVal; avatarEl.style.background = 'linear-gradient(135deg,var(--lav-100),var(--sky-100))'; avatarEl.style.color = 'var(--text-primary)'; }
        else avatarEl.textContent = display_name[0].toUpperCase();
      }
      document.getElementById('avatar-name-preview').textContent = display_name;
      // Flash saved indicator
      savedEl.classList.add('show');
      setTimeout(() => savedEl.classList.remove('show'), 2500);
      showToast(`✅ ${t('settings.saved')}`, 'success');
    } catch (err) {
      showFormMsg(msgEl, err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  });
}

// ── Password form ─────────────────────────────────────────────────────────
function setupPasswordForm() {
  const form    = document.getElementById('password-form');
  const msgEl   = document.getElementById('password-form-msg');
  const savedEl = document.getElementById('password-saved');
  const btn     = document.getElementById('save-password-btn');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const current_password = document.getElementById('current_password').value;
    const new_password     = document.getElementById('new_password').value;
    const confirm          = document.getElementById('confirm_password').value;

    if (!current_password || !new_password)
      { showFormMsg(msgEl, t('login.error_fields'), 'error'); return; }
    if (new_password.length < 8)
      { showFormMsg(msgEl, t('register.pw_short'), 'error'); return; }
    if (new_password !== confirm)
      { showFormMsg(msgEl, t('reset.mismatch'), 'error'); return; }

    btn.disabled = true;
    msgEl.className = 'form-message';
    try {
      await api.put('/auth/profile', { current_password, new_password });
      form.reset();
      savedEl.classList.add('show');
      setTimeout(() => savedEl.classList.remove('show'), 2500);
      showToast(`🔑 ${t('settings.pw_updated')}`, 'success');
    } catch (err) {
      showFormMsg(msgEl, err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  });
}

// ── Theme buttons ─────────────────────────────────────────────────────────
function setupThemeButtons() {
  const current = localStorage.getItem('tk_theme') || 'light';
  updateThemeBtns(current);

  document.getElementById('theme-light-btn').addEventListener('click', () => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('tk_theme', 'light');
    updateThemeBtns('light');
    document.getElementById('theme-toggle').textContent = '🌙';
  });

  document.getElementById('theme-dark-btn').addEventListener('click', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('tk_theme', 'dark');
    updateThemeBtns('dark');
    document.getElementById('theme-toggle').textContent = '☀️';
  });
}

function updateThemeBtns(theme) {
  const light = document.getElementById('theme-light-btn');
  const dark  = document.getElementById('theme-dark-btn');
  if (theme === 'dark') {
    dark.className  = 'btn btn-primary';
    light.className = 'btn btn-ghost';
  } else {
    light.className = 'btn btn-primary';
    dark.className  = 'btn btn-ghost';
  }
  // Set inline flex for centering
  [light, dark].forEach(b => b.style.cssText = b.style.cssText + ';flex:1;justify-content:center;');
}

// ── Delete account ────────────────────────────────────────────────────────
function setupDeleteAccount() {
  const modal      = document.getElementById('delete-modal');
  const openBtn    = document.getElementById('delete-account-btn');
  const closeBtn   = document.getElementById('close-delete-modal');
  const cancelBtn  = document.getElementById('cancel-delete-btn');
  const confirmBtn = document.getElementById('confirm-delete-btn');
  const msgEl      = document.getElementById('delete-msg');

  openBtn.addEventListener('click', () => {
    document.getElementById('delete-password').value = '';
    msgEl.className = 'form-message';
    modal.classList.add('open');
  });
  closeBtn.addEventListener('click',  () => modal.classList.remove('open'));
  cancelBtn.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });

  confirmBtn.addEventListener('click', async () => {
    const password = document.getElementById('delete-password').value;
    if (!password) { showFormMsg(msgEl, t('login.error_fields'), 'error'); return; }

    confirmBtn.disabled = true;
    try {
      await api.delete('/auth/account', {});
      // api.delete doesn't send body — use fetch directly
      const token = localStorage.getItem('tk_token');
      const res = await fetch('/api/auth/account', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.removeItem('tk_token');
      localStorage.removeItem('tk_user');
      showToast('Account deleted. Goodbye! 👋', 'info');
      setTimeout(() => window.location.href = '/', 1500);
    } catch (err) {
      showFormMsg(msgEl, err.message, 'error');
      confirmBtn.disabled = false;
    }
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────
function showFormMsg(el, text, type) {
  el.className = `form-message ${type}`;
  el.innerHTML = `<span>${type === 'error' ? '❌' : '✅'}</span> ${text}`;
}


// ── Emoji Avatar Picker ────────────────────────────────────────────────────
const AVATAR_EMOJIS = ['🌙','⭐','🦁','🐻','🦊','🐼','🐨','🐸','🦋','🌈','🎵','💫','🌸','🌺','🦄','🐬','🐧','🦉','🍀','🎈','🌻','🐙','🦋','🌊','🍓','🎸','🎀','🌴'];

function setupAvatarPicker(user) {
  const grid     = document.getElementById('settings-emoji-grid');
  const display  = document.getElementById('current-avatar-display');
  const nameEl   = document.getElementById('avatar-name-preview');
  const input    = document.getElementById('avatar_emoji_input');
  if (!grid) return;

  // Load saved avatar from profile
  const saved = user.avatar_url || '🌙';
  const isEmoji = [...saved].length <= 2;
  
  if (isEmoji) {
    display.textContent  = saved;
    display.style.fontSize = '1.5rem';
    display.style.background = 'linear-gradient(135deg, var(--lav-100), var(--sky-100))';
    display.style.color = 'var(--text-primary)';
    input.value = saved;
  } else {
    // Initials fallback
    display.textContent = (user.display_name?.[0] || '?').toUpperCase();
  }
  nameEl.textContent = user.display_name || '—';

  // Render emoji grid
  grid.innerHTML = AVATAR_EMOJIS.map(e => `
    <button type="button" class="emoji-opt${e === saved ? ' active' : ''}" data-emoji="${e}"
      style="width:38px;height:38px;border-radius:var(--radius-md);font-size:1.3rem;display:flex;align-items:center;justify-content:center;border:2px solid ${e === saved ? 'var(--primary)' : 'transparent'};background:${e === saved ? 'var(--sky-50)' : 'transparent'};cursor:pointer;transition:var(--transition);">
      ${e}
    </button>`).join('');

  grid.querySelectorAll('.emoji-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      grid.querySelectorAll('.emoji-opt').forEach(b => {
        b.style.border = '2px solid transparent';
        b.style.background = 'transparent';
      });
      btn.style.border = '2px solid var(--primary)';
      btn.style.background = 'var(--sky-50)';
      display.textContent = btn.dataset.emoji;
      display.style.fontSize = '1.5rem';
      display.style.background = 'linear-gradient(135deg, var(--lav-100), var(--sky-100))';
      display.style.color = 'var(--text-primary)';
      input.value = btn.dataset.emoji;
    });
  });
}
