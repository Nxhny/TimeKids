// public/js/app.js
// ─────────────────────────────────────────────────────────────────────────────
// TimeKids Dashboard — main application.
// Integrates: audio grid, player, sleep timer, favourites, add-track modal,
// continue-listening, waveform visualizer, keyboard shortcuts, playlist picker.
// ─────────────────────────────────────────────────────────────────────────────
import api from './api.js';
import { showToast, formatTime, buildAudioCard, setupThemeToggle } from './utils.js';
import {
  saveResumeState,
  loadResumeState,
  clearResumeState,
  initVisualizer,
  registerKeyboardShortcuts,
  setupMediaSession,
} from './player.js';

// ── State ──────────────────────────────────────────────────────────────────
const S = {
  user:           null,
  allAudio:       [],
  favorites:      new Set(),
  playlists:      [],          // user's playlists for the picker
  currentTrack:   null,
  playlist:       [],          // currently playing playlist context
  isPlaying:      false,
  isLooping:      false,
  isMuted:        false,
  prevVolume:     0.8,
  currentView:    'all',
  currentCategory:null,
  searchQuery:    '',
  sleepTimer:     null,
  sleepSeconds:   0,
  timerInterval:  null,
};

// ── DOM ────────────────────────────────────────────────────────────────────
const audioEl       = document.getElementById('audio-player');
const playerBar     = document.getElementById('player-bar');
const playBtn       = document.getElementById('play-btn');
const prevBtn       = document.getElementById('prev-btn');
const nextBtn       = document.getElementById('next-btn');
const loopBtn       = document.getElementById('loop-btn');
const muteBtn       = document.getElementById('mute-btn');
const favPlayerBtn  = document.getElementById('fav-player-btn');
const progressFill  = document.getElementById('progress-fill');
const progressBarEl = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl   = document.getElementById('total-time');
const volumeSlider  = document.getElementById('volume-slider');
const playerTitle   = document.getElementById('player-title');
const playerCat     = document.getElementById('player-category');
const playerArtEl   = document.getElementById('player-art');
const timerLabel    = document.getElementById('timer-label');
const timerBadge    = document.getElementById('timer-badge');
const timerCountdown= document.getElementById('timer-countdown');
const pageTitle     = document.getElementById('page-title');
const audioGrid     = document.getElementById('audio-grid');
const vizCanvas     = document.getElementById('viz-canvas');
const kbdHint       = document.getElementById('kbd-hint');

// ── Bootstrap ──────────────────────────────────────────────────────────────
(async () => {
  setupThemeToggle();
  await guardAuth();
  await Promise.all([loadUserData(), loadFavoriteIds(), fetchPlaylists()]);
  await loadAudio();
  setupNavLinks();
  setupPlayer();
  setupSleepTimer();
  setupModal();
  setupSearch();
  setupSidebarToggle();
  setupResumeBanner();
  handleUrlParams();
  initVisualizer(audioEl, vizCanvas);
  registerKeyboardShortcuts({
    audioEl,
    onPlayPause: togglePlay,
    onNext:      playNext,
    onPrev:      playPrev,
    onMute:      toggleMute,
  });
})();

// ── Auth guard ─────────────────────────────────────────────────────────────
async function guardAuth() {
  try {
    const { user } = await api.get('/auth/me');
    S.user = user;
  } catch {
    localStorage.removeItem('tk_token');
    window.location.href = '/login';
  }
}

// ── User UI ────────────────────────────────────────────────────────────────
async function loadUserData() {
  const u = S.user;
  document.getElementById('user-name').textContent      = u.display_name || u.email;
  document.getElementById('user-avatar').textContent    = (u.display_name?.[0] || u.email?.[0] || '?').toUpperCase();
  document.getElementById('user-plan-badge').textContent = u.plan === 'premium' ? '⭐ Premium' : '🌙 Free Plan';
  if (u.is_admin) document.getElementById('admin-nav-section').style.display = 'block';

  if (u.plan === 'free') {
    document.getElementById('usage-panel').style.display = 'block';
    try {
      const { usage } = await api.get('/audio/user/my');
      updateUsageBars(usage);
    } catch {}
  }
}

function updateUsageBars(usage) {
  if (!usage) return;
  const lp = Math.min((usage.lullaby.used / usage.lullaby.limit) * 100, 100);
  const sp = Math.min((usage.story.used   / usage.story.limit)   * 100, 100);
  document.getElementById('usage-lullaby-bar').style.width  = lp + '%';
  document.getElementById('usage-story-bar').style.width    = sp + '%';
  document.getElementById('usage-lullaby-text').textContent = `${usage.lullaby.used} / ${usage.lullaby.limit}`;
  document.getElementById('usage-story-text').textContent   = `${usage.story.used} / ${usage.story.limit}`;
}

// ── Fetch playlists for picker ─────────────────────────────────────────────
async function fetchPlaylists() {
  try {
    const { playlists } = await api.get('/playlists');
    S.playlists = playlists;
  } catch {}
}

// ── Load audio grid ────────────────────────────────────────────────────────
async function loadAudio(filters = {}) {
  const p = new URLSearchParams();
  if (filters.type)     p.set('type', filters.type);
  if (filters.category) p.set('category', filters.category);
  if (filters.search)   p.set('search', filters.search);

  try {
    const [{ audio }, { categories }] = await Promise.all([
      api.get(`/audio?${p}`),
      api.get('/audio/categories'),
    ]);
    S.allAudio = audio;
    renderGrid(audio);
    renderCategoryFilters(categories);
  } catch (err) {
    audioGrid.innerHTML = emptyState('😓', 'Failed to load content', err.message);
  }
}

async function loadFavoritesView() {
  try {
    const { favorites } = await api.get('/favorites');
    const audio = favorites.map(f => f.audio_content).filter(Boolean);
    renderGrid(audio);
    document.getElementById('filter-bar').style.display = 'none';
  } catch (err) { showToast('Failed to load favourites', 'error'); }
}

async function loadMyUploads() {
  try {
    const { audio, usage } = await api.get('/audio/user/my');
    renderGrid(audio);
    updateUsageBars(usage);
    document.getElementById('filter-bar').style.display = 'none';
  } catch { showToast('Failed to load uploads', 'error'); }
}

const AMBIENT = [
  { id:'amb-1', title:'Gentle Rain',    type:'lullaby', category:'Ambient', audio_url:'https://www.youtube.com/embed/mPZkdNFkNps', is_youtube:true, description:'Soothing rain on leaves' },
  { id:'amb-2', title:'Ocean Waves',    type:'lullaby', category:'Ambient', audio_url:'https://www.youtube.com/embed/V-_O7nl0Ii0', is_youtube:true, description:'Peaceful ocean waves' },
  { id:'amb-3', title:'Forest Birds',   type:'lullaby', category:'Ambient', audio_url:'https://www.youtube.com/embed/Qm846KdZN_c', is_youtube:true, description:'Birds in a calm forest' },
  { id:'amb-4', title:'White Noise',    type:'lullaby', category:'Ambient', audio_url:'https://www.youtube.com/embed/nMfPqeZjc2c', is_youtube:true, description:'Pure white noise' },
  { id:'amb-5', title:'Crackling Fire', type:'lullaby', category:'Ambient', audio_url:'https://www.youtube.com/embed/L_LUpnjgPso', is_youtube:true, description:'Cozy fireplace sounds' },
  { id:'amb-6', title:'Thunderstorm',   type:'lullaby', category:'Ambient', audio_url:'https://www.youtube.com/embed/yIQd2Ya0Ziw', is_youtube:true, description:'Distant thunder and rain' },
];

// ── Render grid ────────────────────────────────────────────────────────────
function renderGrid(tracks) {
  if (!tracks.length) {
    audioGrid.innerHTML = emptyState('🌙', 'Nothing here yet', 'Add your first track or explore another section.');
    return;
  }
  audioGrid.innerHTML = tracks.map((t, i) => buildAudioCard(t, S.favorites.has(t.id), i)).join('');

  audioGrid.querySelectorAll('.audio-card').forEach(card => {
    const id    = card.dataset.id;
    const track = tracks.find(t => t.id === id);
    if (!track) return;

    // Play on card click
    card.addEventListener('click', e => {
      if (e.target.closest('.fav-btn') || e.target.closest('.delete-btn') || e.target.closest('.add-pl-btn')) return;
      playTrack(track, tracks);
    });

    // Favourite toggle
    card.querySelector('.fav-btn')?.addEventListener('click', async e => {
      e.stopPropagation();
      await toggleFavorite(id, card.querySelector('.fav-btn'));
    });

    // Delete
    card.querySelector('.delete-btn')?.addEventListener('click', async e => {
      e.stopPropagation();
      if (!confirm('Delete this track?')) return;
      try {
        await api.delete(`/audio/${id}`);
        card.style.opacity = '0'; card.style.transform = 'scale(.9)';
        card.style.transition = 'all .3s';
        setTimeout(() => card.remove(), 300);
        showToast('Track deleted.', 'success');
      } catch (err) { showToast(err.message, 'error'); }
    });

    // Add to playlist button (injected by buildAudioCard via the DOM)
    card.querySelector('.add-pl-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      openPlaylistPicker(card, track);
    });
  });
}

// ── Playlist picker (mini dropdown on card) ────────────────────────────────
function openPlaylistPicker(card, track) {
  // Remove any existing pickers
  document.querySelectorAll('.pl-picker').forEach(p => p.remove());

  if (!S.playlists.length) {
    showToast('Create a playlist first!', 'info');
    window.location.href = '/playlists';
    return;
  }

  const picker = document.createElement('div');
  picker.className = 'pl-picker open';
  picker.style.cssText = 'position:absolute;top:40px;right:8px;z-index:150;';

  picker.innerHTML = S.playlists.map(pl => `
    <div class="pl-picker-item" data-pl-id="${pl.id}">${escHtml(pl.name)}</div>
  `).join('') + `<div class="pl-picker-item new" data-pl-id="new">+ New Playlist</div>`;

  card.style.position = 'relative';
  card.appendChild(picker);

  picker.querySelectorAll('.pl-picker-item').forEach(item => {
    item.addEventListener('click', async e => {
      e.stopPropagation();
      const plId = item.dataset.plId;
      picker.remove();
      if (plId === 'new') { window.location.href = '/playlists'; return; }
      try {
        await api.post(`/playlists/${plId}/tracks`, { audioId: track.id });
        showToast('Added to playlist! 📋', 'success');
      } catch (err) { showToast(err.message, 'error'); }
    });
  });

  // Close on outside click
  const close = e => { if (!picker.contains(e.target)) { picker.remove(); document.removeEventListener('click', close); } };
  setTimeout(() => document.addEventListener('click', close), 0);
}

// ── Category filters ───────────────────────────────────────────────────────
function renderCategoryFilters(categories) {
  const container = document.getElementById('category-filters');
  container.innerHTML = ['All', ...categories].map(cat =>
    `<button class="filter-chip ${!S.currentCategory && cat === 'All' ? 'active' : ''}" data-cat="${cat}">${cat}</button>`
  ).join('');
  container.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      S.currentCategory = chip.dataset.cat === 'All' ? null : chip.dataset.cat;
      applyFilters();
    });
  });
}

function applyFilters() {
  let tracks = S.allAudio;
  if (S.currentCategory) tracks = tracks.filter(t => t.category === S.currentCategory);
  if (S.searchQuery)      tracks = tracks.filter(t => t.title.toLowerCase().includes(S.searchQuery.toLowerCase()));
  renderGrid(tracks);
}

// ── Search ─────────────────────────────────────────────────────────────────
function setupSearch() {
  let debounce;
  document.getElementById('search-input').addEventListener('input', e => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      S.searchQuery = e.target.value;
      if (['all','lullaby','story'].includes(S.currentView)) applyFilters();
    }, 280);
  });
}

// ── Favourites ─────────────────────────────────────────────────────────────
async function loadFavoriteIds() {
  try {
    const { ids } = await api.get('/favorites/ids');
    S.favorites = new Set(ids);
  } catch {}
}

async function toggleFavorite(audioId, btnEl) {
  try {
    const { favorited } = await api.post(`/favorites/${audioId}`);
    favorited ? S.favorites.add(audioId) : S.favorites.delete(audioId);
    if (btnEl) { btnEl.classList.toggle('active', favorited); btnEl.textContent = favorited ? '❤️' : '🤍'; }
    showToast(favorited ? 'Added to favourites! ❤️' : 'Removed from favourites', favorited ? 'success' : 'info');
    if (S.currentTrack?.id === audioId) updatePlayerFavBtn();
  } catch (err) { showToast(err.message, 'error'); }
}

// ── Player ─────────────────────────────────────────────────────────────────
function setupPlayer() {
  audioEl.addEventListener('timeupdate', () => {
    if (!audioEl.duration) return;
    const pct = (audioEl.currentTime / audioEl.duration) * 100;
    progressFill.style.width       = pct + '%';
    currentTimeEl.textContent      = formatTime(audioEl.currentTime);
    totalTimeEl.textContent        = formatTime(audioEl.duration);
    // Autosave resume state every 5 seconds
    if (Math.floor(audioEl.currentTime) % 5 === 0) saveResumeState(S.currentTrack, audioEl.currentTime);
  });

  audioEl.addEventListener('ended', () => {
    clearResumeState();
    if (S.isLooping) { audioEl.currentTime = 0; audioEl.play(); }
    else playNext();
  });

  audioEl.addEventListener('loadedmetadata', () => { totalTimeEl.textContent = formatTime(audioEl.duration); });

  playBtn.addEventListener('click', togglePlay);
  prevBtn.addEventListener('click', playPrev);
  nextBtn.addEventListener('click', playNext);

  loopBtn.addEventListener('click', () => {
    S.isLooping = !S.isLooping;
    loopBtn.classList.toggle('active', S.isLooping);
    audioEl.loop = S.isLooping;
    flashKbdHint(S.isLooping ? '🔁 Loop on' : '🔁 Loop off');
  });

  muteBtn.addEventListener('click', toggleMute);
  volumeSlider.addEventListener('input', () => { audioEl.volume = volumeSlider.value; S.prevVolume = audioEl.volume; });

  favPlayerBtn.addEventListener('click', async () => {
    if (!S.currentTrack) return;
    await toggleFavorite(S.currentTrack.id, null);
    updatePlayerFavBtn();
  });

  progressBarEl.addEventListener('click', e => {
    if (!audioEl.duration) return;
    const rect = progressBarEl.getBoundingClientRect();
    audioEl.currentTime = ((e.clientX - rect.left) / rect.width) * audioEl.duration;
  });

  audioEl.volume = 0.8;
}

function playTrack(track, playlistContext = []) {
  S.currentTrack = track;
  S.playlist     = playlistContext;

  if (track.is_youtube) {
    openYouTubeModal(track);
    updatePlayerBar(track, false);
    return;
  }

  audioEl.src = track.audio_url;
  audioEl.play();
  S.isPlaying = true;
  updatePlayerBar(track, true);
  setupMediaSession(track, {
    onPlay:  () => { audioEl.play(); playBtn.textContent = '⏸'; },
    onPause: () => { audioEl.pause(); playBtn.textContent = '▶'; },
    onNext:  playNext,
    onPrev:  playPrev,
  });
}

function updatePlayerBar(track, playing) {
  playerBar.classList.remove('hidden');
  playerTitle.textContent  = track.title;
  playerCat.textContent    = `${track.type === 'lullaby' ? '🎵' : '📖'} ${track.category}`;
  playerArtEl.textContent  = track.type === 'lullaby' ? '🎵' : '📖';
  playBtn.textContent      = playing ? '⏸' : '▶';
  updatePlayerFavBtn();
}

function updatePlayerFavBtn() {
  if (!S.currentTrack) return;
  favPlayerBtn.textContent = S.favorites.has(S.currentTrack.id) ? '❤️' : '🤍';
}

function togglePlay() {
  if (!S.currentTrack) return;
  if (S.currentTrack.is_youtube) return;
  if (audioEl.paused) { audioEl.play(); S.isPlaying = true; playBtn.textContent = '⏸'; }
  else                { audioEl.pause(); S.isPlaying = false; playBtn.textContent = '▶'; }
}

function toggleMute() {
  if (audioEl.muted) {
    audioEl.muted = false;
    audioEl.volume = S.prevVolume || 0.8;
    volumeSlider.value = audioEl.volume;
    muteBtn.textContent = '🔊';
  } else {
    S.prevVolume = audioEl.volume;
    audioEl.muted = true;
    volumeSlider.value = 0;
    muteBtn.textContent = '🔇';
  }
  flashKbdHint(audioEl.muted ? '🔇 Muted' : '🔊 Unmuted');
}

function playNext() {
  if (!S.playlist.length) return;
  const idx  = S.playlist.findIndex(t => t.id === S.currentTrack?.id);
  const next = S.playlist[(idx + 1) % S.playlist.length];
  if (next) playTrack(next, S.playlist);
}

function playPrev() {
  if (!S.playlist.length) return;
  const idx  = S.playlist.findIndex(t => t.id === S.currentTrack?.id);
  const prev = S.playlist[(idx - 1 + S.playlist.length) % S.playlist.length];
  if (prev) playTrack(prev, S.playlist);
}

// ── YouTube Modal ──────────────────────────────────────────────────────────
const ytModal      = document.getElementById('yt-play-modal');
const ytIframe     = document.getElementById('yt-iframe');
const ytModalTitle = document.getElementById('yt-modal-title');
const ytModalCat   = document.getElementById('yt-modal-category');
const closeYtBtn   = document.getElementById('close-yt-modal');
const ytFavBtn     = document.getElementById('yt-fav-btn');
const ytPlBtn      = document.getElementById('yt-pl-btn');

function openYouTubeModal(track) {
  ytModalTitle.textContent = track.title;
  ytModalCat.textContent   = `${track.type === 'lullaby' ? '🎵' : '📖'} ${track.category}`;
  ytIframe.src = track.audio_url + (track.audio_url.includes('?') ? '&autoplay=1' : '?autoplay=1');
  ytFavBtn.textContent = S.favorites.has(track.id) ? '❤️ Favourited' : '🤍 Favourite';
  ytModal.classList.add('open');
}

closeYtBtn.addEventListener('click', () => { ytModal.classList.remove('open'); ytIframe.src = ''; });
ytModal.addEventListener('click', e => { if (e.target === ytModal) { ytModal.classList.remove('open'); ytIframe.src = ''; } });

ytFavBtn.addEventListener('click', async () => {
  if (!S.currentTrack) return;
  const { favorited } = await api.post(`/favorites/${S.currentTrack.id}`).catch(() => ({ favorited: false }));
  favorited ? S.favorites.add(S.currentTrack.id) : S.favorites.delete(S.currentTrack.id);
  ytFavBtn.textContent = favorited ? '❤️ Favourited' : '🤍 Favourite';
});

ytPlBtn.addEventListener('click', () => {
  if (!S.currentTrack || !S.playlists.length) { showToast('Create a playlist first!', 'info'); return; }
  // Quick picker in the modal footer area
  const existingPicker = ytModal.querySelector('.pl-picker');
  if (existingPicker) { existingPicker.remove(); return; }

  const picker = document.createElement('div');
  picker.className = 'pl-picker open';
  picker.style.cssText = 'position:absolute;bottom:60px;right:20px;z-index:220;';
  picker.innerHTML = S.playlists.map(pl =>
    `<div class="pl-picker-item" data-pl-id="${pl.id}">${escHtml(pl.name)}</div>`
  ).join('');

  ytModal.querySelector('.modal').style.position = 'relative';
  ytModal.querySelector('.modal').appendChild(picker);

  picker.querySelectorAll('.pl-picker-item').forEach(item => {
    item.addEventListener('click', async () => {
      picker.remove();
      try {
        await api.post(`/playlists/${item.dataset.plId}/tracks`, { audioId: S.currentTrack.id });
        showToast('Added to playlist! 📋', 'success');
      } catch (err) { showToast(err.message, 'error'); }
    });
  });
});

// ── Continue-listening ─────────────────────────────────────────────────────
function setupResumeBanner() {
  const resume = loadResumeState();
  if (!resume) return;

  const banner    = document.getElementById('resume-banner');
  const art       = document.getElementById('resume-art');
  const titleEl   = document.getElementById('resume-title');
  const subEl     = document.getElementById('resume-sub');
  const playResume= document.getElementById('resume-play-btn');
  const dismiss   = document.getElementById('resume-dismiss-btn');

  art.textContent     = resume.type === 'lullaby' ? '🎵' : '📖';
  titleEl.textContent = resume.title;
  subEl.textContent   = `Last at ${formatTime(resume.currentTime)} · ${resume.category}`;
  banner.classList.add('visible');

  playResume.addEventListener('click', () => {
    banner.classList.remove('visible');
    if (resume.is_youtube) {
      S.currentTrack = resume;
      openYouTubeModal(resume);
    } else {
      audioEl.src = resume.audio_url;
      audioEl.addEventListener('loadedmetadata', () => {
        audioEl.currentTime = resume.currentTime;
        audioEl.play();
      }, { once: true });
      S.currentTrack = resume;
      S.isPlaying    = true;
      updatePlayerBar(resume, true);
    }
  });

  dismiss.addEventListener('click', () => {
    banner.classList.remove('visible');
    clearResumeState();
  });
}

// ── Sleep timer ────────────────────────────────────────────────────────────
function setupSleepTimer() {
  const btn   = document.getElementById('sleep-timer-btn');
  const panel = document.getElementById('timer-panel');

  btn.addEventListener('click', e => { e.stopPropagation(); panel.classList.toggle('open'); });
  document.addEventListener('click', () => panel.classList.remove('open'));
  panel.addEventListener('click', e => e.stopPropagation());

  document.querySelectorAll('.timer-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.timer-option').forEach(o => o.classList.remove('active'));
      const mins = parseInt(opt.dataset.minutes);
      if (mins === 0) cancelSleepTimer();
      else { opt.classList.add('active'); startSleepTimer(mins); }
      panel.classList.remove('open');
    });
  });
}

function startSleepTimer(mins) {
  cancelSleepTimer();
  S.sleepSeconds = mins * 60;
  timerLabel.textContent = formatTime(S.sleepSeconds);
  timerBadge.style.display = 'flex';

  S.timerInterval = setInterval(() => {
    S.sleepSeconds--;
    const d = formatTime(S.sleepSeconds);
    timerLabel.textContent     = d;
    timerCountdown.textContent = d;
    if (S.sleepSeconds <= 0) {
      cancelSleepTimer();
      audioEl.pause(); ytIframe.src = '';
      S.isPlaying = false; playBtn.textContent = '▶';
      showToast('😴 Sleep timer ended — sweet dreams!', 'info');
    }
  }, 1000);
  showToast(`⏱️ Sleep timer: ${mins} min`, 'success');
}

function cancelSleepTimer() {
  clearInterval(S.timerInterval);
  S.timerInterval = null; S.sleepSeconds = 0;
  timerLabel.textContent = 'Timer';
  timerBadge.style.display = 'none';
}

// ── Add-track modal ────────────────────────────────────────────────────────
function setupModal() {
  const modal      = document.getElementById('add-track-modal');
  const openBtn    = document.getElementById('btn-add-track');
  const closeBtn   = document.getElementById('close-modal-btn');
  const cancelBtn  = document.getElementById('cancel-modal-btn');
  const cancelUpBtn= document.getElementById('cancel-upload-btn');

  openBtn?.addEventListener('click',  e => { e.preventDefault(); modal.classList.add('open'); });
  closeBtn?.addEventListener('click', () => modal.classList.remove('open'));
  cancelBtn?.addEventListener('click',() => modal.classList.remove('open'));
  cancelUpBtn?.addEventListener('click',() => modal.classList.remove('open'));
  modal?.addEventListener('click',    e => { if (e.target === modal) modal.classList.remove('open'); });

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-youtube').style.display = btn.dataset.tab === 'youtube' ? 'block' : 'none';
      document.getElementById('tab-upload').style.display  = btn.dataset.tab === 'upload'  ? 'block' : 'none';
    });
  });

  // YouTube form
  const ytForm   = document.getElementById('youtube-form');
  const ytMsg    = document.getElementById('yt-form-msg');
  const ytSubmit = document.getElementById('yt-submit-btn');

  ytForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(ytForm));
    ytSubmit.disabled = true; ytSubmit.textContent = '⏳ Adding…'; ytMsg.className = 'form-message';
    try {
      await api.post('/audio/youtube', body);
      showToast('🎵 Track added!', 'success');
      modal.classList.remove('open'); ytForm.reset();
      await loadAudio(); await fetchPlaylists();
    } catch (err) {
      ytMsg.className = 'form-message error';
      ytMsg.innerHTML = `❌ ${err.message}` + (err.data?.upgrade ? ` <a href="/profile" style="color:var(--accent);">Upgrade →</a>` : '');
    } finally { ytSubmit.disabled = false; ytSubmit.textContent = 'Add Track 🎵'; }
  });

  // Upload form
  const upForm   = document.getElementById('upload-form');
  const upMsg    = document.getElementById('upload-form-msg');
  const upSubmit = document.getElementById('upload-submit-btn');

  upForm?.addEventListener('submit', async e => {
    e.preventDefault();
    upSubmit.disabled = true; upSubmit.textContent = '⏳ Uploading…';
    try {
      await api.postForm('/audio/upload', new FormData(upForm));
      showToast('📤 Uploaded!', 'success');
      modal.classList.remove('open'); upForm.reset();
      await loadAudio();
    } catch (err) {
      upMsg.className = 'form-message error';
      upMsg.innerHTML = `❌ ${err.message}`;
    } finally { upSubmit.disabled = false; upSubmit.textContent = 'Upload 📤'; }
  });
}

// ── Nav links / views ──────────────────────────────────────────────────────
function setupNavLinks() {
  document.querySelectorAll('[data-view]').forEach(link => {
    link.addEventListener('click', e => { e.preventDefault(); setView(link.dataset.view); });
  });

  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    saveResumeState(S.currentTrack, audioEl.currentTime);
    await api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('tk_token');
    localStorage.removeItem('tk_user');
    window.location.href = '/login';
  });
}

async function setView(view) {
  S.currentView = view; S.currentCategory = null; S.searchQuery = '';
  document.getElementById('search-input').value = '';

  document.querySelectorAll('[data-view]').forEach(l => l.classList.remove('active'));
  document.querySelector(`[data-view="${view}"]`)?.classList.add('active');

  const titles = { all:'🏠 All Content', lullaby:'🎵 Lullabies', story:'📖 Stories', favorites:'❤️ Favourites', ambient:'🌧️ Ambient Sounds', 'my-uploads':'📤 My Uploads' };
  pageTitle.textContent = titles[view] || 'Content';

  const filterBar = document.getElementById('filter-bar');
  filterBar.style.display = ['all','lullaby','story'].includes(view) ? 'flex' : 'none';

  showSkeletons();

  if      (view === 'favorites')   await loadFavoritesView();
  else if (view === 'my-uploads')  await loadMyUploads();
  else if (view === 'ambient')     { renderGrid(AMBIENT); filterBar.style.display = 'none'; }
  else                              await loadAudio({ type: view === 'all' ? undefined : view });
}

function handleUrlParams() {
  const v = new URLSearchParams(window.location.search).get('view');
  if (v) setView(v);
}

function showSkeletons() {
  audioGrid.innerHTML = Array(6).fill('<div class="skeleton" style="height:260px;border-radius:var(--radius-lg);"></div>').join('');
}

// ── Sidebar mobile ─────────────────────────────────────────────────────────
function setupSidebarToggle() {
  const toggle  = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth <= 900) toggle.style.display = 'flex';
  window.addEventListener('resize', () => { toggle.style.display = window.innerWidth <= 900 ? 'flex' : 'none'; });
  toggle?.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!sidebar.contains(e.target) && !toggle.contains(e.target)) sidebar.classList.remove('open');
  });
}

// ── Keyboard hint overlay ──────────────────────────────────────────────────
let kbdTimeout;
function flashKbdHint(msg) {
  kbdHint.textContent = msg;
  kbdHint.classList.add('show');
  clearTimeout(kbdTimeout);
  kbdTimeout = setTimeout(() => kbdHint.classList.remove('show'), 1600);
}

// ── Helpers ────────────────────────────────────────────────────────────────
function emptyState(icon, title, body = '') {
  return `<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">${icon}</div><h3>${title}</h3>${body ? `<p>${body}</p>` : ''}</div>`;
}
function escHtml(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
