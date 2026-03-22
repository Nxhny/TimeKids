// public/js/admin.js
import api from './api.js';
import { showToast, setupThemeToggle, logout } from './utils.js';
import { t, applyTranslations, renderLanguageSwitcher } from './i18n.js';

setupThemeToggle();
applyTranslations();
renderLanguageSwitcher('#lang-switcher-slot');
window.addEventListener('langchange', () => applyTranslations());

// ── Auth + admin guard ─────────────────────────────────────────────────────
let adminUser;
(async () => {
  try {
    const data = await api.get('/auth/me');
    adminUser = data.user;
    if (!adminUser.is_admin) { window.location.href = '/dashboard'; return; }
  } catch {
    window.location.href = '/login';
    return;
  }

  await loadStats();

  // Section nav
  document.querySelectorAll('[data-section]').forEach(link => {
    link.addEventListener('click', async e => {
      e.preventDefault();
      document.querySelectorAll('[data-section]').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const sec = link.dataset.section;
      document.getElementById('section-overview').style.display = sec === 'overview' ? 'block' : 'none';
      document.getElementById('section-audio').style.display    = sec === 'audio'    ? 'block' : 'none';
      document.getElementById('section-users').style.display    = sec === 'users'    ? 'block' : 'none';
      if (sec === 'audio') await loadAudioTable();
      if (sec === 'users') await loadUsersTable();
    });
  });

  document.getElementById('logout-btn')?.addEventListener('click', logout);
})();

// ── Stats ──────────────────────────────────────────────────────────────────
async function loadStats() {
  try {
    const stats = await api.get('/admin/stats');
    document.getElementById('stat-total-audio').textContent = stats.totalAudio    ?? '—';
    document.getElementById('stat-total-users').textContent = stats.totalUsers    ?? '—';
    document.getElementById('stat-total-favs').textContent  = stats.totalFavorites ?? '—';
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── Audio table ────────────────────────────────────────────────────────────
async function loadAudioTable() {
  const tbody = document.getElementById('audio-table-body');
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);">${t('nav.all')}…</td></tr>`;
  try {
    const { audio } = await api.get('/admin/audio');
    if (!audio.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);">${t('empty.nothing')}</td></tr>`;
      return;
    }
    tbody.innerHTML = audio.map(a => `
      <tr>
        <td><strong>${escHtml(a.title)}</strong></td>
        <td><span class="badge badge-${a.type}">${a.type === 'lullaby' ? t('badge.lullaby') : t('badge.story')}</span></td>
        <td>${escHtml(a.category)}</td>
        <td>${a.is_youtube ? '<span class="badge badge-youtube">YouTube</span>' : '<span class="badge badge-free">Upload</span>'}</td>
        <td style="color:var(--text-muted);font-size:.82rem;">${new Date(a.created_at).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="window.adminDeleteAudio('${a.id}', this)">🗑️ ${t('pl.delete')}</button>
        </td>
      </tr>`).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="color:red;padding:20px;">${escHtml(err.message)}</td></tr>`;
  }
}

// ── Users table ────────────────────────────────────────────────────────────
async function loadUsersTable() {
  const tbody = document.getElementById('users-table-body');
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-muted);">${t('admin.users')}…</td></tr>`;
  try {
    const { users } = await api.get('/admin/users');
    if (!users.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-muted);">${t('empty.nothing')}</td></tr>`;
      return;
    }
    tbody.innerHTML = users.map(u => `
      <tr>
        <td>${escHtml(u.email)}</td>
        <td>${escHtml(u.user_metadata?.display_name || '—')}</td>
        <td>
          <select class="form-select" style="padding:6px 10px;font-size:.8rem;"
            onchange="window.adminUpdatePlan('${u.id}', this.value)">
            <option value="free"    ${u.plan !== 'premium' ? 'selected' : ''}>🌙 ${t('plan.free')}</option>
            <option value="premium" ${u.plan === 'premium' ? 'selected' : ''}>⭐ ${t('plan.premium_badge')}</option>
          </select>
        </td>
        <td style="color:var(--text-muted);font-size:.82rem;">${new Date(u.created_at).toLocaleDateString()}</td>
        <td><span style="font-size:.78rem;color:var(--text-muted);">${u.id.slice(0, 8)}…</span></td>
      </tr>`).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="color:red;padding:20px;">${escHtml(err.message)}</td></tr>`;
  }
}

// ── Global handlers for inline onclick ────────────────────────────────────
window.adminDeleteAudio = async (id, btn) => {
  if (!confirm(t('delete.confirm'))) return;
  btn.disabled = true;
  try {
    await api.delete(`/audio/${id}`);
    btn.closest('tr').remove();
    showToast(t('toast.deleted'), 'success');
    await loadStats();
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false;
  }
};

window.adminUpdatePlan = async (userId, plan) => {
  try {
    await api.put(`/admin/users/${userId}/plan`, { plan });
    showToast(`${t('language.label')}: ${plan} ✓`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
};

function escHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
