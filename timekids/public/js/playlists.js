// public/js/playlists.js
import api from './api.js';
import { showToast, formatTime, buildAudioCard, setupThemeToggle, logout } from './utils.js';
import { t, applyTranslations, renderLanguageSwitcher } from './i18n.js';

setupThemeToggle();
applyTranslations();
renderLanguageSwitcher('#lang-switcher-slot');
window.addEventListener('langchange', () => {
  applyTranslations();
  // Re-render grid labels
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
});

// ── Audio element ─────────────────────────────────────────────────────────
const audioEl       = document.getElementById('audio-player');
const playerBar     = document.getElementById('player-bar');
const playBtn       = document.getElementById('play-btn');
const prevBtn       = document.getElementById('prev-btn');
const nextBtn       = document.getElementById('next-btn');
const progressFill  = document.getElementById('progress-fill');
const progressBarEl = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl   = document.getElementById('total-time');
const volumeSlider  = document.getElementById('volume-slider');

let pageState = { playlist: null, tracks: [], currentIdx: -1 };

// ── Auth guard ─────────────────────────────────────────────────────────────
let currentUser;
(async () => {
  try {
    const data = await api.get('/auth/me');
    currentUser = data.user;
    document.getElementById('user-name').textContent   = currentUser.display_name || currentUser.email;
    document.getElementById('user-avatar').textContent = (currentUser.display_name?.[0] || '?').toUpperCase();
  } catch {
    window.location.href = '/login';
    return;
  }

  await renderPlaylists();
  setupModal();
  setupPlayer();
  document.getElementById('logout-btn').addEventListener('click', logout);
})();

// ── Render playlists grid ─────────────────────────────────────────────────
async function renderPlaylists() {
  const grid = document.getElementById('playlist-grid');
  document.getElementById('page-heading').textContent = t('pl.title');

  try {
    const { playlists } = await api.get('/playlists');
    const emojis = ['🎵', '🌙', '⭐', '💫', '🎼', '🎹', '🎶', '🌸'];

    const newCard = `
      <div class="playlist-new-card" id="btn-new-inline">
        <span class="plus">➕</span>
        <span style="font-weight:700;font-size:.9rem;" data-i18n="pl.new_label">${t('pl.new_label')}</span>
      </div>`;

    if (!playlists.length) {
      grid.innerHTML = newCard;
    } else {
      grid.innerHTML = playlists.map((pl, i) => {
        const count = pl.playlist_items?.[0]?.count || 0;
        const label = count === 1
          ? `1 ${t('pl.tracks')}`
          : `${count} ${t('pl.tracks_plural')}`;
        return `
          <div class="playlist-card" data-id="${pl.id}">
            <div class="playlist-card-cover">
              <span>${emojis[i % emojis.length]}</span>
            </div>
            <div class="playlist-card-body">
              <div class="playlist-card-name">${escHtml(pl.name)}</div>
              ${pl.description ? `<div class="playlist-card-meta" style="margin-bottom:4px;">${escHtml(pl.description)}</div>` : ''}
              <div class="playlist-card-meta">${label}</div>
            </div>
          </div>`;
      }).join('') + newCard;
    }

    grid.querySelectorAll('.playlist-card').forEach(card => {
      card.addEventListener('click', () => openPlaylist(card.dataset.id));
    });
    grid.querySelector('#btn-new-inline')?.addEventListener('click', openModal);
    document.getElementById('btn-new-playlist').addEventListener('click', openModal);

  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">😓</div><p>${escHtml(err.message)}</p></div>`;
  }
}

// ── Open playlist detail ───────────────────────────────────────────────────
async function openPlaylist(id) {
  document.getElementById('playlists-view').style.display = 'none';
  const detail = document.getElementById('playlist-detail');
  detail.classList.add('open');

  try {
    const { playlist } = await api.get(`/playlists/${id}`);
    pageState.playlist = playlist;

    document.getElementById('detail-name').textContent        = playlist.name;
    document.getElementById('detail-description').textContent = playlist.description || '';
    document.getElementById('play-all-btn').textContent       = t('pl.play_all');
    document.getElementById('delete-playlist-btn').textContent = t('pl.delete');
    document.getElementById('back-to-playlists').textContent  = t('pl.back');

    const trackList = document.getElementById('track-list');
    const items     = playlist.playlist_items || [];
    pageState.tracks = items.map(i => i.audio_content).filter(Boolean);

    if (!items.length) {
      trackList.innerHTML = `<div class="empty-state"><div class="empty-icon">🎵</div><p data-i18n="pl.empty">${t('pl.empty')}</p></div>`;
    } else {
      trackList.innerHTML = items.map((item, idx) => {
        const track = item.audio_content;
        if (!track) return '';
        return `
          <div class="track-row" data-id="${track.id}" data-idx="${idx}">
            <div class="track-row-num">${idx + 1}</div>
            <div style="width:36px;height:36px;border-radius:var(--radius-sm);background:${track.type === 'lullaby' ? 'var(--lav-100)' : 'var(--peach-100)'};display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">
              ${track.type === 'lullaby' ? '🎵' : '📖'}
            </div>
            <div class="track-row-info">
              <div class="track-row-title">${escHtml(track.title)}</div>
              <div class="track-row-meta">${escHtml(track.category)} · ${track.type}</div>
            </div>
            ${track.duration ? `<span style="font-size:.75rem;color:var(--text-muted);">${formatTime(track.duration)}</span>` : ''}
            <div class="track-row-actions">
              <button class="btn btn-ghost btn-icon-sm remove-track-btn" data-audio-id="${track.id}" title="${t('pl.delete')}">✕</button>
            </div>
          </div>`;
      }).join('');

      // Play on row click
      trackList.querySelectorAll('.track-row').forEach(row => {
        row.addEventListener('click', e => {
          if (e.target.closest('.remove-track-btn')) return;
          playTrackAt(parseInt(row.dataset.idx));
        });
      });

      // Remove from playlist
      trackList.querySelectorAll('.remove-track-btn').forEach(btn => {
        btn.addEventListener('click', async e => {
          e.stopPropagation();
          try {
            await api.delete(`/playlists/${id}/tracks/${btn.dataset.audioId}`);
            btn.closest('.track-row').remove();
            showToast(t('pl.track_removed'), 'success');
          } catch (err) {
            showToast(err.message, 'error');
          }
        });
      });
    }

    document.getElementById('play-all-btn').onclick = () => {
      if (pageState.tracks.length) playTrackAt(0);
    };

    document.getElementById('delete-playlist-btn').onclick = async () => {
      const msg = t('pl.confirm_delete', { name: playlist.name });
      if (!confirm(msg)) return;
      try {
        await api.delete(`/playlists/${id}`);
        showToast(t('pl.deleted'), 'success');
        closeDetail();
        await renderPlaylists();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };

    document.getElementById('back-to-playlists').onclick = closeDetail;

  } catch (err) {
    showToast(err.message, 'error');
  }
}

function closeDetail() {
  document.getElementById('playlist-detail').classList.remove('open');
  document.getElementById('playlists-view').style.display = 'block';
  document.getElementById('page-heading').textContent = t('pl.title');
}

// ── Audio player ───────────────────────────────────────────────────────────
async function playTrackAt(idx) {
  const track = pageState.tracks[idx];
  if (!track) return;
  pageState.currentIdx = idx;

  document.getElementById('player-title').textContent    = track.title;
  document.getElementById('player-category').textContent = track.category;
  document.getElementById('player-art').textContent      = track.type === 'lullaby' ? '🎵' : '📖';
  playerBar.classList.remove('hidden');

  if (track.is_youtube) {
    // Convert embed URL back to a watchable youtube.com URL
    const m = track.audio_url.match(/\/embed\/([A-Za-z0-9_-]{11})/);
    const watchUrl = m ? `https://www.youtube.com/watch?v=${m[1]}` : track.audio_url;
    window.open(watchUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  // Proper async load + play
  playBtn.textContent = '⏳';
  audioEl.src = track.audio_url;
  audioEl.load();
  try {
    await new Promise((resolve, reject) => {
      audioEl.addEventListener('canplay', resolve, { once: true });
      audioEl.addEventListener('error',   reject,  { once: true });
      setTimeout(resolve, 8000);
    });
    await audioEl.play();
    playBtn.textContent = '⏸';
  } catch (err) {
    playBtn.textContent = '▶';
    if (err?.name === 'NotAllowedError') {
      // autoplay blocked — user already clicked, retry once
      try { await audioEl.play(); playBtn.textContent = '⏸'; } catch {}
    }
  }

  // Highlight active row
  document.querySelectorAll('.track-row').forEach((row, i) => {
    row.style.background = i === idx ? 'var(--sky-100)' : '';
  });
}

function setupPlayer() {
  audioEl.addEventListener('timeupdate', () => {
    if (!audioEl.duration) return;
    progressFill.style.width  = (audioEl.currentTime / audioEl.duration * 100) + '%';
    currentTimeEl.textContent = formatTime(audioEl.currentTime);
    totalTimeEl.textContent   = formatTime(audioEl.duration);
  });

  audioEl.addEventListener('ended', () => {
    if (pageState.currentIdx < pageState.tracks.length - 1) {
      playTrackAt(pageState.currentIdx + 1);
    }
  });

  playBtn.addEventListener('click', async () => {
    if (audioEl.paused) {
      try { await audioEl.play(); playBtn.textContent = '⏸'; } catch {}
    } else {
      audioEl.pause(); playBtn.textContent = '▶';
    }
  });
  prevBtn.addEventListener('click', () => {
    if (pageState.currentIdx > 0) playTrackAt(pageState.currentIdx - 1);
  });
  nextBtn.addEventListener('click', () => {
    if (pageState.currentIdx < pageState.tracks.length - 1) playTrackAt(pageState.currentIdx + 1);
  });

  progressBarEl.addEventListener('click', e => {
    if (!audioEl.duration) return;
    const rect = progressBarEl.getBoundingClientRect();
    audioEl.currentTime = ((e.clientX - rect.left) / rect.width) * audioEl.duration;
  });

  volumeSlider.addEventListener('input', () => { audioEl.volume = volumeSlider.value; });

  audioEl.addEventListener('error', () => {
    playBtn.textContent = '▶';
    const codes = { 1:'Aborted', 2:'Network error', 3:'Decode error', 4:'Format not supported' };
    const msg = codes[audioEl.error?.code] || 'Could not load audio';
    // Show inline error in track list
    const activeRow = document.querySelector('.track-row[style*="sky-100"]');
    if (activeRow) activeRow.style.background = '#fef2f2';
    import('./utils.js').then(({ showToast }) => showToast('❌ ' + msg, 'error'));
  });
  audioEl.addEventListener('waiting', () => { playBtn.textContent = '⏳'; });
  audioEl.addEventListener('playing', () => { playBtn.textContent = '⏸'; });
  audioEl.addEventListener('pause',   () => { playBtn.textContent = '▶'; });
}

// ── New Playlist Modal ─────────────────────────────────────────────────────
function setupModal() {
  const modal = document.getElementById('new-playlist-modal');
  const form  = document.getElementById('new-playlist-form');
  const msgEl = document.getElementById('pl-form-msg');

  document.getElementById('btn-new-playlist').addEventListener('click', openModal);
  document.getElementById('close-pl-modal').addEventListener('click', closeModal);
  document.getElementById('cancel-pl-modal').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name        = form.name.value.trim();
    const description = form.description.value.trim();

    if (!name) {
      msgEl.className = 'form-message error';
      msgEl.innerHTML = `❌ ${t('pl.name_label').replace(' *', '')} required.`;
      return;
    }
    try {
      await api.post('/playlists', { name, description });
      showToast(t('pl.created'), 'success');
      closeModal();
      form.reset();
      await renderPlaylists();
    } catch (err) {
      msgEl.className = 'form-message error';
      msgEl.innerHTML = `❌ ${err.message}`;
    }
  });

  // Keep modal labels in sync with language
  window.addEventListener('langchange', () => {
    document.getElementById('new-playlist-modal').querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
  });
}

function openModal()  {
  const modal = document.getElementById('new-playlist-modal');
  // Apply current language to modal labels
  modal.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  modal.classList.add('open');
}
function closeModal() { document.getElementById('new-playlist-modal').classList.remove('open'); }

function escHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
