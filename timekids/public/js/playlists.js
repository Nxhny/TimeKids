// public/js/playlists.js
import api from './api.js';
import { showToast, formatTime, buildAudioCard, setupThemeToggle, logout } from './utils.js';

setupThemeToggle();

const audioEl     = document.getElementById('audio-player');
const playerBar   = document.getElementById('player-bar');
const playBtn     = document.getElementById('play-btn');
const prevBtn     = document.getElementById('prev-btn');
const nextBtn     = document.getElementById('next-btn');
const progressFill = document.getElementById('progress-fill');
const progressBar  = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl   = document.getElementById('total-time');
const volumeSlider  = document.getElementById('volume-slider');

let state = { playlist: null, tracks: [], currentIdx: -1, isPlaying: false };

// ── Auth guard ────────────────────────────────────────────────────────────
let user;
(async () => {
  try {
    const data = await api.get('/auth/me');
    user = data.user;
    document.getElementById('user-name').textContent = user.display_name || user.email;
    document.getElementById('user-avatar').textContent = (user.display_name?.[0] || '?').toUpperCase();
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
  try {
    const { playlists } = await api.get('/playlists');

    const newCard = `
      <div class="playlist-new-card" id="btn-new-inline">
        <span class="plus">➕</span>
        <span style="font-weight:700;font-size:0.9rem;">New Playlist</span>
      </div>`;

    if (!playlists.length) {
      grid.innerHTML = newCard;
    } else {
      const emojis = ['🎵','🌙','⭐','💫','🎼','🎹','🎶','🌸'];
      grid.innerHTML = playlists.map((pl, i) => {
        const count = pl.playlist_items?.[0]?.count || 0;
        return `
        <div class="playlist-card" data-id="${pl.id}">
          <div class="playlist-card-cover">
            <span>${emojis[i % emojis.length]}</span>
          </div>
          <div class="playlist-card-body">
            <div class="playlist-card-name">${escHtml(pl.name)}</div>
            ${pl.description ? `<div class="playlist-card-meta" style="margin-bottom:4px;">${escHtml(pl.description)}</div>` : ''}
            <div class="playlist-card-meta">${count} track${count !== 1 ? 's' : ''}</div>
          </div>
        </div>`;
      }).join('') + newCard;
    }

    // Events
    grid.querySelectorAll('.playlist-card').forEach(card => {
      card.addEventListener('click', () => openPlaylist(card.dataset.id));
    });
    grid.querySelector('#btn-new-inline')?.addEventListener('click', () => openModal());
    document.getElementById('btn-new-playlist').addEventListener('click', () => openModal());

  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">😓</div><p>${err.message}</p></div>`;
  }
}

// ── Open playlist detail ───────────────────────────────────────────────────
async function openPlaylist(id) {
  document.getElementById('playlists-view').style.display = 'none';
  const detail = document.getElementById('playlist-detail');
  detail.classList.add('open');
  document.getElementById('page-heading').textContent = '← Playlist';

  try {
    const { playlist } = await api.get(`/playlists/${id}`);
    state.playlist = playlist;

    document.getElementById('detail-name').textContent = playlist.name;
    document.getElementById('detail-description').textContent = playlist.description || '';

    const trackList = document.getElementById('track-list');
    const items = playlist.playlist_items || [];
    state.tracks = items.map(i => i.audio_content).filter(Boolean);

    if (!items.length) {
      trackList.innerHTML = `<div class="empty-state"><div class="empty-icon">🎵</div><p>No tracks yet. Go to the dashboard and add some!</p></div>`;
    } else {
      trackList.innerHTML = items.map((item, idx) => {
        const t = item.audio_content;
        if (!t) return '';
        return `
        <div class="track-row" data-id="${t.id}" data-idx="${idx}">
          <div class="track-row-num">${idx + 1}</div>
          <div style="width:36px;height:36px;border-radius:var(--radius-sm);background:${t.type === 'lullaby' ? 'var(--lav-100)' : 'var(--peach-100)'};display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">${t.type === 'lullaby' ? '🎵' : '📖'}</div>
          <div class="track-row-info">
            <div class="track-row-title">${escHtml(t.title)}</div>
            <div class="track-row-meta">${escHtml(t.category)} · ${t.type}</div>
          </div>
          ${t.duration ? `<span style="font-size:0.75rem;color:var(--text-muted);">${formatTime(t.duration)}</span>` : ''}
          <div class="track-row-actions">
            <button class="btn btn-ghost btn-icon-sm remove-track-btn" data-audio-id="${t.id}" title="Remove">✕</button>
          </div>
        </div>`;
      }).join('');

      // Play on click
      trackList.querySelectorAll('.track-row').forEach(row => {
        row.addEventListener('click', (e) => {
          if (e.target.closest('.remove-track-btn')) return;
          const idx = parseInt(row.dataset.idx);
          playTrackAt(idx);
        });
      });

      // Remove track
      trackList.querySelectorAll('.remove-track-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const audioId = btn.dataset.audioId;
          try {
            await api.delete(`/playlists/${id}/tracks/${audioId}`);
            btn.closest('.track-row').remove();
            showToast('Track removed.', 'success');
          } catch (err) {
            showToast(err.message, 'error');
          }
        });
      });
    }

    // Play all
    document.getElementById('play-all-btn').onclick = () => {
      if (state.tracks.length) playTrackAt(0);
    };

    // Delete playlist
    document.getElementById('delete-playlist-btn').onclick = async () => {
      if (!confirm(`Delete "${playlist.name}"?`)) return;
      try {
        await api.delete(`/playlists/${id}`);
        showToast('Playlist deleted.', 'success');
        closeDetail();
        await renderPlaylists();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };

    // Back button
    document.getElementById('back-to-playlists').onclick = closeDetail;

  } catch (err) {
    showToast('Failed to load playlist: ' + err.message, 'error');
  }
}

function closeDetail() {
  document.getElementById('playlist-detail').classList.remove('open');
  document.getElementById('playlists-view').style.display = 'block';
  document.getElementById('page-heading').textContent = '📋 My Playlists';
}

// ── Player ─────────────────────────────────────────────────────────────────
function playTrackAt(idx) {
  const track = state.tracks[idx];
  if (!track) return;
  state.currentIdx = idx;

  document.getElementById('player-title').textContent    = track.title;
  document.getElementById('player-category').textContent = track.category;
  document.getElementById('player-art').textContent      = track.type === 'lullaby' ? '🎵' : '📖';
  playerBar.classList.remove('hidden');

  if (track.is_youtube) {
    window.open(track.audio_url, '_blank');
    return;
  }

  audioEl.src = track.audio_url;
  audioEl.play();
  state.isPlaying = true;
  playBtn.textContent = '⏸';

  // Highlight active row
  document.querySelectorAll('.track-row').forEach((row, i) => {
    row.style.background = i === idx ? 'var(--sky-100)' : '';
  });
}

function setupPlayer() {
  audioEl.addEventListener('timeupdate', () => {
    if (!audioEl.duration) return;
    progressFill.style.width = (audioEl.currentTime / audioEl.duration * 100) + '%';
    currentTimeEl.textContent = formatTime(audioEl.currentTime);
    totalTimeEl.textContent   = formatTime(audioEl.duration);
  });

  audioEl.addEventListener('ended', () => {
    if (state.currentIdx < state.tracks.length - 1) playTrackAt(state.currentIdx + 1);
  });

  playBtn.addEventListener('click', () => {
    if (audioEl.paused) { audioEl.play(); playBtn.textContent = '⏸'; }
    else { audioEl.pause(); playBtn.textContent = '▶'; }
  });

  prevBtn.addEventListener('click', () => { if (state.currentIdx > 0) playTrackAt(state.currentIdx - 1); });
  nextBtn.addEventListener('click', () => { if (state.currentIdx < state.tracks.length - 1) playTrackAt(state.currentIdx + 1); });

  progressBar.addEventListener('click', (e) => {
    if (!audioEl.duration) return;
    const rect = progressBar.getBoundingClientRect();
    audioEl.currentTime = ((e.clientX - rect.left) / rect.width) * audioEl.duration;
  });

  volumeSlider.addEventListener('input', () => { audioEl.volume = volumeSlider.value; });
}

// ── Modal ─────────────────────────────────────────────────────────────────
function setupModal() {
  const modal = document.getElementById('new-playlist-modal');
  const form  = document.getElementById('new-playlist-form');
  const msgEl = document.getElementById('pl-form-msg');

  document.getElementById('btn-new-playlist').addEventListener('click', openModal);
  document.getElementById('close-pl-modal').addEventListener('click', closeModal);
  document.getElementById('cancel-pl-modal').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name        = form.name.value.trim();
    const description = form.description.value.trim();
    if (!name) { msgEl.className = 'form-message error'; msgEl.innerHTML = '❌ Name is required.'; return; }

    try {
      await api.post('/playlists', { name, description });
      showToast('Playlist created! 🎉', 'success');
      closeModal();
      form.reset();
      await renderPlaylists();
    } catch (err) {
      msgEl.className = 'form-message error';
      msgEl.innerHTML = `❌ ${err.message}`;
    }
  });
}

function openModal()  { document.getElementById('new-playlist-modal').classList.add('open'); }
function closeModal() { document.getElementById('new-playlist-modal').classList.remove('open'); }

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
