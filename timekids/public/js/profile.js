// public/js/profile.js
import api from './api.js';
import { showToast, buildAudioCard, setupThemeToggle, logout } from './utils.js';

setupThemeToggle();

(async () => {
  // Auth guard
  let user;
  try {
    const data = await api.get('/auth/me');
    user = data.user;
  } catch {
    window.location.href = '/login';
    return;
  }

  // Fill profile hero
  const initial = (user.display_name?.[0] || user.email?.[0] || '?').toUpperCase();
  document.getElementById('profile-avatar').textContent    = initial;
  document.getElementById('user-avatar-sm').textContent   = initial;
  document.getElementById('sidebar-user-name').textContent = user.display_name || user.email;
  document.getElementById('profile-name').textContent     = user.display_name || 'User';
  document.getElementById('profile-email').textContent    = user.email;

  const planBadge = document.getElementById('profile-plan-badge');
  planBadge.className = `badge badge-${user.plan}`;
  planBadge.textContent = user.plan === 'premium' ? '⭐ Premium' : '🌙 Free Plan';

  if (user.plan === 'premium') {
    document.getElementById('upgrade-section').style.display = 'none';
  }

  // Load user uploads + usage
  try {
    const { audio, usage } = await api.get('/audio/user/my');

    // Stats
    const lulCount = audio.filter(a => a.type === 'lullaby').length;
    const stoCount = audio.filter(a => a.type === 'story').length;
    document.getElementById('stat-lullabies').textContent = lulCount;
    document.getElementById('stat-stories').textContent   = stoCount;

    // Usage bars
    if (usage) {
      const lulPct = Math.min((usage.lullaby.used / (usage.lullaby.limit || 10)) * 100, 100);
      const stoPct = Math.min((usage.story.used / (usage.story.limit || 10)) * 100, 100);
      document.getElementById('usage-lullaby').style.width   = lulPct + '%';
      document.getElementById('usage-story').style.width     = stoPct + '%';
      document.getElementById('usage-lullaby-label').textContent = `${usage.lullaby.used} / ${usage.lullaby.limit === Infinity ? '∞' : usage.lullaby.limit}`;
      document.getElementById('usage-story-label').textContent   = `${usage.story.used} / ${usage.story.limit === Infinity ? '∞' : usage.story.limit}`;
    }

    // Render my uploads
    const grid = document.getElementById('my-uploads-grid');
    if (audio.length) {
      grid.innerHTML = audio.map((t, i) => buildAudioCard(t, false, i)).join('');
      grid.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const card = btn.closest('.audio-card');
          const id   = card.dataset.id;
          if (!confirm('Delete this track?')) return;
          try {
            await api.delete(`/audio/${id}`);
            card.style.opacity = '0';
            setTimeout(() => card.remove(), 300);
            showToast('Track deleted.', 'success');
          } catch (err) {
            showToast(err.message, 'error');
          }
        });
      });
    } else {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">📤</div><h3>No uploads yet</h3><p>Go to the dashboard to add your first track.</p></div>`;
    }
  } catch (err) {
    showToast('Failed to load your uploads.', 'error');
  }

  // Favourites count
  try {
    const { ids } = await api.get('/favorites/ids');
    document.getElementById('stat-favorites').textContent = ids.length;
  } catch {}

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', logout);
})();
