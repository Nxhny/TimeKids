// public/js/profile.js
import api from './api.js';
import { showToast, buildAudioCard, setupThemeToggle, logout } from './utils.js';
import { t, applyTranslations, renderLanguageSwitcher } from './i18n.js';

setupThemeToggle();
applyTranslations();
renderLanguageSwitcher('#lang-switcher-slot');
window.addEventListener('langchange', () => applyTranslations());

(async () => {
  // ── Auth guard ───────────────────────────────────────────────────────────
  let user;
  try {
    const data = await api.get('/auth/me');
    user = data.user;
  } catch {
    window.location.href = '/login';
    return;
  }

  // ── Populate profile hero ────────────────────────────────────────────────
  const initial = (user.display_name?.[0] || user.email?.[0] || '?').toUpperCase();
  document.getElementById('profile-avatar').textContent   = initial;
  document.getElementById('user-avatar-sm').textContent  = initial;
  document.getElementById('sidebar-user-name').textContent = user.display_name || user.email;
  document.getElementById('profile-name').textContent    = user.display_name || 'User';
  document.getElementById('profile-email').textContent   = user.email;

  const planBadge = document.getElementById('profile-plan-badge');
  planBadge.className   = `badge badge-${user.plan}`;
  planBadge.textContent = user.plan === 'premium' ? t('plan.premium_badge') : t('plan.free_badge');

  if (user.plan === 'premium') {
    document.getElementById('upgrade-section').style.display = 'none';
  }

  // ── My uploads + usage ───────────────────────────────────────────────────
  try {
    const { audio, usage } = await api.get('/audio/user/my');

    // Stats
    const lulCount = audio.filter(a => a.type === 'lullaby').length;
    const stoCount = audio.filter(a => a.type === 'story').length;
    document.getElementById('stat-lullabies').textContent = lulCount;
    document.getElementById('stat-stories').textContent   = stoCount;

    // Usage bars
    if (usage) {
      const lp = Math.min((usage.lullaby.used / (usage.lullaby.limit || 10)) * 100, 100);
      const sp = Math.min((usage.story.used   / (usage.story.limit   || 10)) * 100, 100);
      document.getElementById('usage-lullaby').style.width       = lp + '%';
      document.getElementById('usage-story').style.width         = sp + '%';
      const lulLim = usage.lullaby.limit === Infinity ? '∞' : usage.lullaby.limit;
      const stoLim = usage.story.limit   === Infinity ? '∞' : usage.story.limit;
      document.getElementById('usage-lullaby-label').textContent = `${usage.lullaby.used} / ${lulLim}`;
      document.getElementById('usage-story-label').textContent   = `${usage.story.used} / ${stoLim}`;
    }

    // My uploads grid
    const grid = document.getElementById('my-uploads-grid');
    if (audio.length) {
      grid.innerHTML = audio.map((track, i) => buildAudioCard(track, false, i)).join('');
      grid.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const card = btn.closest('.audio-card');
          const id   = card.dataset.id;
          if (!confirm(t('delete.confirm'))) return;
          try {
            await api.delete(`/audio/${id}`);
            card.style.opacity    = '0';
            card.style.transform  = 'scale(0.9)';
            card.style.transition = 'all .3s';
            setTimeout(() => card.remove(), 300);
            showToast(t('toast.deleted'), 'success');
          } catch (err) {
            showToast(err.message, 'error');
          }
        });
      });
    } else {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="empty-icon">📤</div>
          <h3 data-i18n="profile.no_uploads">${t('profile.no_uploads')}</h3>
          <p data-i18n="profile.go_dashboard">${t('profile.go_dashboard')}</p>
        </div>`;
    }
  } catch (err) {
    showToast(t('empty.no_content'), 'error');
  }

  // ── Favourites count ─────────────────────────────────────────────────────
  try {
    const { ids } = await api.get('/favorites/ids');
    document.getElementById('stat-favorites').textContent = ids.length;
  } catch {}

  // ── Logout ───────────────────────────────────────────────────────────────
  document.getElementById('logout-btn')?.addEventListener('click', logout);

  // ── Re-apply after any lang change ───────────────────────────────────────
  window.addEventListener('langchange', () => {
    planBadge.textContent = user.plan === 'premium' ? t('plan.premium_badge') : t('plan.free_badge');
  });
})();
