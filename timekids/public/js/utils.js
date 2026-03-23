// public/js/utils.js
// ─────────────────────────────────────────────────────────────────────────────
// Shared utility functions used across all JS modules.
// ─────────────────────────────────────────────────────────────────────────────

/** Format seconds → "m:ss" */
export function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/** Show a toast notification (auto-dismiss after 3 s) */
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success:'✅', error:'❌', info:'🌙', warning:'⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '🌙'}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

/**
 * Build an audio card HTML string.
 * Includes: favourite button, add-to-playlist button, delete button (own uploads).
 */
export function buildAudioCard(track, isFavorited = false, idx = 0) {
  const isYt   = track.is_youtube;
  const isLull = track.type === 'lullaby';
  const lullEmojis = ['🎵','🌙','⭐','🌟','💫','🎼','🎹','🎶'];
  const storyEmojis= ['📖','✨','🌙','🦋','🌈','🌸','🌺','💤'];
  const emoji = (isLull ? lullEmojis : storyEmojis)[idx % 8];

  return `
  <div class="audio-card" data-id="${track.id}" data-type="${track.type}">
    <div class="audio-card-art ${isLull ? '' : 'story-art'}">
      <span style="position:relative;z-index:1;font-size:2.6rem;">${emoji}</span>
      ${isYt ? '<span style="position:absolute;bottom:8px;right:8px;background:rgba(220,38,38,.85);color:white;font-size:.65rem;font-weight:800;padding:3px 7px;border-radius:99px;z-index:2;">▶ YT</span>' : ''}
    </div>
    <div class="audio-card-actions">
      <button class="fav-btn ${isFavorited ? 'active' : ''}" title="Favourite">${isFavorited ? '❤️' : '🤍'}</button>
      <button class="add-pl-btn" title="Add to Playlist">📋</button>
      <button class="fav-btn share-btn" title="Share">🔗</button>
      ${track.uploaded_by ? `<button class="fav-btn delete-btn" title="Delete">🗑️</button>` : ''}
    </div>
    <div class="audio-card-body">
      <div class="audio-card-title">${escHtml(track.title)}</div>
      ${track.description ? `<div style="font-size:.78rem;color:var(--text-muted);margin-bottom:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(track.description)}</div>` : ''}
      <div class="audio-card-meta">
        <span class="badge badge-${track.type}">${track.type === 'lullaby' ? '🎵 Lullaby' : '📖 Story'}</span>
        ${track.duration ? `<span style="font-size:.75rem;color:var(--text-muted);">${formatTime(track.duration)}</span>` : ''}
      </div>
      <div style="font-size:.75rem;color:var(--text-muted);margin-top:6px;">${escHtml(track.category)}</div>
    </div>
  </div>`;
}

/** Escape HTML to prevent XSS */
export function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Apply saved theme on page load */
export function applyTheme() {
  const saved = localStorage.getItem('tk_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeBtn(saved);
}

/** Wire up the theme toggle button */
export function setupThemeToggle() {
  applyTheme();
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('tk_theme', next);
    updateThemeBtn(next);
  });
}

function updateThemeBtn(theme) {
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/** Unified logout */
export async function logout() {
  try { await fetch('/api/auth/logout', { method:'POST', credentials:'include' }); } catch {}
  localStorage.removeItem('tk_token');
  localStorage.removeItem('tk_user');
  window.location.href = '/login';
}
