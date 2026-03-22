// public/js/children.js
import api from './api.js';
import { showToast, setupThemeToggle, logout } from './utils.js';
import { t, applyTranslations } from './i18n.js';

setupThemeToggle();
applyTranslations();
window.addEventListener('langchange', () => applyTranslations());

const CHILD_KEY   = 'tk_active_child';   // localStorage key
const AVATARS = ['🌙','⭐','🦁','🐻','🦊','🐼','🐨','🐸','🦋','🌈','🎵','💫','🌸','🌺','🦄','🐬','🐧','🦉','🍀','🎈'];

let editingId = null;

// ── Auth guard ─────────────────────────────────────────────────────────────
(async () => {
  try {
    const { user } = await api.get('/auth/me');
    document.getElementById('user-name').textContent   = user.display_name || user.email;
    document.getElementById('user-avatar').textContent = (user.display_name?.[0] || '?').toUpperCase();
  } catch {
    window.location.href = '/login';
    return;
  }

  buildEmojiPicker();
  await renderChildren();
  loadActiveChild();
  setupModal();

  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('clear-active-btn').addEventListener('click', () => {
    localStorage.removeItem(CHILD_KEY);
    document.getElementById('active-child-bar').style.display = 'none';
    document.querySelectorAll('.child-card').forEach(c => c.classList.remove('selected'));
    showToast(t('child.cleared'), 'info');
  });
})();

// ── Build emoji picker ─────────────────────────────────────────────────────
function buildEmojiPicker() {
  const grid = document.getElementById('emoji-grid');
  grid.innerHTML = AVATARS.map(e =>
    `<button type="button" class="emoji-opt" data-emoji="${e}">${e}</button>`
  ).join('');

  grid.querySelectorAll('.emoji-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      grid.querySelectorAll('.emoji-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('selected-emoji').textContent    = btn.dataset.emoji;
      document.getElementById('avatar-emoji-input').value = btn.dataset.emoji;
    });
  });
}

function setActiveEmoji(emoji) {
  document.getElementById('selected-emoji').textContent    = emoji;
  document.getElementById('avatar-emoji-input').value = emoji;
  document.querySelectorAll('.emoji-opt').forEach(b => {
    b.classList.toggle('active', b.dataset.emoji === emoji);
  });
}

// ── Load active child from localStorage ───────────────────────────────────
function loadActiveChild() {
  const raw = localStorage.getItem(CHILD_KEY);
  if (!raw) return;
  try {
    const child = JSON.parse(raw);
    showActiveBar(child);
    document.querySelector(`.child-card[data-id="${child.id}"]`)?.classList.add('selected');
  } catch {}
}

function showActiveBar(child) {
  document.getElementById('active-avatar').textContent = child.avatar_emoji || '🌙';
  document.getElementById('active-name').textContent   = child.name;
  document.getElementById('active-child-bar').style.display = 'flex';
}

// ── Render grid ────────────────────────────────────────────────────────────
async function renderChildren() {
  const grid = document.getElementById('children-grid');
  try {
    const { children } = await api.get('/children');

    const newCard = `
      <div class="child-card-new" id="btn-new-inline">
        <span class="plus">➕</span>
        <span style="font-weight:700;" data-i18n="child.new_btn">${t('child.new_btn')}</span>
      </div>`;

    if (!children.length) {
      grid.innerHTML = newCard;
    } else {
      const activeId = (() => { try { return JSON.parse(localStorage.getItem(CHILD_KEY))?.id; } catch { return null; } })();
      grid.innerHTML = children.map(c => `
        <div class="child-card ${c.id === activeId ? 'selected' : ''}" data-id="${c.id}">
          <span class="child-select-badge" data-i18n="child.active_tag">Active</span>
          <div class="child-avatar">${c.avatar_emoji || '🌙'}</div>
          <div class="child-name">${escHtml(c.name)}</div>
          <div class="child-age">${c.age != null ? `${c.age} ${t('child.years')}` : ''}</div>
          <div class="child-actions">
            <button class="btn btn-primary btn-sm select-btn" data-id="${c.id}" title="${t('child.select_btn')}" data-i18n-title="child.select_btn">▶ ${t('child.select_btn')}</button>
            <button class="btn btn-ghost btn-sm btn-icon edit-btn" data-id="${c.id}" title="${t('child.edit_btn')}">✏️</button>
            <button class="btn btn-ghost btn-sm btn-icon delete-btn" data-id="${c.id}" title="${t('pl.delete')}">🗑️</button>
          </div>
        </div>`).join('') + newCard;
    }

    // Events
    grid.querySelectorAll('.select-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const { child } = await api.get(`/children/${id}`).catch(() => ({ child: null }));
        if (!child) return;
        localStorage.setItem(CHILD_KEY, JSON.stringify(child));
        showActiveBar(child);
        document.querySelectorAll('.child-card').forEach(c => c.classList.remove('selected'));
        btn.closest('.child-card').classList.add('selected');
        showToast(`${t('child.selected')}: ${child.name} ${child.avatar_emoji}`, 'success');
      });
    });

    grid.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const { child } = await api.get(`/children/${id}`).catch(() => ({ child: null }));
        if (child) openModal(child);
      });
    });

    grid.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        if (!confirm(t('child.confirm_delete'))) return;
        try {
          await api.delete(`/children/${btn.dataset.id}`);
          showToast(t('child.deleted'), 'success');
          // Clear active if deleted
          const active = JSON.parse(localStorage.getItem(CHILD_KEY) || 'null');
          if (active?.id === btn.dataset.id) {
            localStorage.removeItem(CHILD_KEY);
            document.getElementById('active-child-bar').style.display = 'none';
          }
          await renderChildren();
        } catch (err) { showToast(err.message, 'error'); }
      });
    });

    grid.querySelector('#btn-new-inline')?.addEventListener('click', () => openModal(null));
    document.getElementById('btn-new-child').addEventListener('click', () => openModal(null));

  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><p>${escHtml(err.message)}</p></div>`;
  }
}

// ── Modal ─────────────────────────────────────────────────────────────────
function setupModal() {
  const modal  = document.getElementById('child-modal');
  const form   = document.getElementById('child-form');
  const msgEl  = document.getElementById('child-form-msg');

  document.getElementById('close-child-modal').addEventListener('click', closeModal);
  document.getElementById('cancel-child-modal').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name         = form.name.value.trim();
    const age          = form.age.value ? parseInt(form.age.value) : null;
    const avatar_emoji = document.getElementById('avatar-emoji-input').value;

    if (!name) { msgEl.className = 'form-message error'; msgEl.textContent = '❌ ' + t('child.name_required'); return; }

    const submitBtn = document.getElementById('child-submit-btn');
    submitBtn.disabled = true;
    msgEl.className = 'form-message';

    try {
      if (editingId) {
        await api.put(`/children/${editingId}`, { name, age, avatar_emoji });
        showToast(t('child.updated'), 'success');
      } else {
        await api.post('/children', { name, age, avatar_emoji });
        showToast(t('child.created'), 'success');
      }
      closeModal();
      form.reset();
      await renderChildren();
    } catch (err) {
      msgEl.className = 'form-message error';
      msgEl.textContent = '❌ ' + err.message;
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function openModal(child) {
  editingId = child?.id || null;
  const title = document.getElementById('child-modal-title');
  const submit = document.getElementById('child-submit-text');

  if (child) {
    title.textContent  = t('child.modal_edit');
    submit.textContent = t('child.save_btn');
    document.getElementById('child-name-input').value = child.name;
    document.getElementById('child-age-input').value  = child.age || '';
    setActiveEmoji(child.avatar_emoji || '🌙');
  } else {
    title.textContent  = t('child.modal_add');
    submit.textContent = t('child.save_btn');
    document.getElementById('child-name-input').value = '';
    document.getElementById('child-age-input').value  = '';
    setActiveEmoji('🌙');
  }
  document.getElementById('child-form-msg').className = 'form-message';
  document.getElementById('child-modal').classList.add('open');
}

function closeModal() {
  editingId = null;
  document.getElementById('child-modal').classList.remove('open');
}

function escHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
