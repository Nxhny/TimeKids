// public/js/app.js
// ─────────────────────────────────────────────────────────────────────────────
// TimeKids Dashboard — main application.
// Integrates: audio grid, player, sleep timer, favourites, add-track modal,
// continue-listening, waveform visualizer, keyboard shortcuts, playlist picker.
// ─────────────────────────────────────────────────────────────────────────────
import api from './api.js';
import { showToast, formatTime, buildAudioCard, setupThemeToggle } from './utils.js';
import { t, applyTranslations, renderLanguageSwitcher } from './i18n.js';
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
  applyTranslations();
  renderLanguageSwitcher('#lang-switcher-slot');
  renderLanguageSwitcher('#lang-switcher-topbar');
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
  await loadRecentlyPlayed();
  setupOnboarding();
  handleUrlParams();
  initVisualizer(audioEl, vizCanvas);
  startPlayTracking();
  showActiveChildPill();
  setupOfflineBanner();

  // Re-apply translations and re-render switchers when language changes
  window.addEventListener('langchange', () => {
    applyTranslations();
    renderLanguageSwitcher('#lang-switcher-slot');
    renderLanguageSwitcher('#lang-switcher-topbar');
    // Re-render the audio grid so badge labels update
    if (S.allAudio.length) applyFilters();
  });

  setupKbdModal();
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
async function loadAudio(filters = {}, append = false) {
  if (!append) {
    S.page    = 0;
    S.hasMore = true;
    S.allAudio = [];
  }
  if (!S.hasMore || S.isLoadingMore) return;

  S.isLoadingMore = true;
  const p = new URLSearchParams();
  if (filters.type)     p.set('type', filters.type);
  if (filters.category) p.set('category', filters.category);
  if (filters.search)   p.set('search', filters.search);
  p.set('limit',  S.pageSize);
  p.set('offset', S.page * S.pageSize);

  try {
    const [{ audio }, catResult] = await Promise.all([
      api.get(`/audio?${p}`),
      S.page === 0 ? api.get('/audio/categories') : Promise.resolve(null),
    ]);

    S.hasMore = audio.length === S.pageSize;
    S.page++;

    if (append) {
      S.allAudio = [...S.allAudio, ...audio];
      appendToGrid(audio, S.allAudio);
    } else {
      S.allAudio = audio;
      renderGrid(audio);
    }

    if (catResult) renderCategoryFilters(catResult.categories);
    updateInfiniteScrollSentinel();
  } catch (err) {
    if (!append) audioGrid.innerHTML = emptyState('😓', 'Failed to load content', err.message);
  } finally {
    S.isLoadingMore = false;
  }
}

/** Append new cards to existing grid without re-rendering everything */
function appendToGrid(newTracks, allTracks) {
  // Remove sentinel if present
  document.getElementById('scroll-sentinel')?.remove();

  const fragment = document.createDocumentFragment();
  newTracks.forEach((track, relIdx) => {
    const absIdx = allTracks.length - newTracks.length + relIdx;
    const div    = document.createElement('div');
    div.innerHTML = buildAudioCard(track, S.favorites.has(track.id), absIdx);
    const card   = div.firstElementChild;
    if (!card) return;

    card.addEventListener('click', e => {
      if (e.target.closest('.fav-btn') || e.target.closest('.delete-btn') || e.target.closest('.add-pl-btn')) return;
      playTrack(track, allTracks);
    });
    card.querySelector('.fav-btn')?.addEventListener('click', async e => {
      e.stopPropagation(); await toggleFavorite(track.id, card.querySelector('.fav-btn'));
    });
    card.querySelector('.delete-btn')?.addEventListener('click', async e => {
      e.stopPropagation();
      if (!confirm(t('delete.confirm'))) return;
      try { await api.delete(`/audio/${track.id}`); card.remove(); showToast(t('toast.deleted'), 'success'); }
      catch (err) { showToast(err.message, 'error'); }
    });
    card.querySelector('.add-pl-btn')?.addEventListener('click', e => {
      e.stopPropagation(); openPlaylistPicker(card, track);
    });
    fragment.appendChild(card);
  });
  audioGrid.appendChild(fragment);
}

/** Invisible sentinel div — IntersectionObserver triggers next page load */
let _scrollObserver = null;
function updateInfiniteScrollSentinel() {
  document.getElementById('scroll-sentinel')?.remove();
  if (!S.hasMore) return;

  const sentinel = document.createElement('div');
  sentinel.id = 'scroll-sentinel';
  sentinel.style.cssText = 'height:40px;grid-column:1/-1;display:flex;align-items:center;justify-content:center;';
  sentinel.innerHTML = '<div class="skeleton" style="width:60px;height:8px;border-radius:99px;"></div>';
  audioGrid.appendChild(sentinel);

  if (_scrollObserver) _scrollObserver.disconnect();
  _scrollObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      loadAudio({ type: S.currentView === 'all' ? undefined : S.currentView }, true);
    }
  }, { rootMargin: '200px' });
  _scrollObserver.observe(sentinel);
}

async function loadFavoritesView() {
  try {
    const { favorites } = await api.get('/favorites');
    const audio = favorites.map(f => f.audio_content).filter(Boolean);
    renderGrid(audio);
    document.getElementById('filter-bar').style.display = 'none';
  } catch (err) { showToast(t('toast.favs_fail'), 'error'); }
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
  { id:'amb-1', title:'Gentle Rain',    type:'lullaby', category:'Ambient', audio_url:'https://www.youtube-nocookie.com/embed/mPZkdNFkNps', is_youtube:true, description:'Soothing rain on leaves' },
  { id:'amb-2', title:'Ocean Waves',    type:'lullaby', category:'Ambient', audio_url:'https://www.youtube-nocookie.com/embed/V-_O7nl0Ii0', is_youtube:true, description:'Peaceful ocean waves' },
  { id:'amb-3', title:'Forest Birds',   type:'lullaby', category:'Ambient', audio_url:'https://www.youtube-nocookie.com/embed/Qm846KdZN_c', is_youtube:true, description:'Birds in a calm forest' },
  { id:'amb-4', title:'White Noise',    type:'lullaby', category:'Ambient', audio_url:'https://www.youtube-nocookie.com/embed/nMfPqeZjc2c', is_youtube:true, description:'Pure white noise' },
  { id:'amb-5', title:'Crackling Fire', type:'lullaby', category:'Ambient', audio_url:'https://www.youtube-nocookie.com/embed/L_LUpnjgPso', is_youtube:true, description:'Cozy fireplace sounds' },
  { id:'amb-6', title:'Thunderstorm',   type:'lullaby', category:'Ambient', audio_url:'https://www.youtube-nocookie.com/embed/yIQd2Ya0Ziw', is_youtube:true, description:'Distant thunder and rain' },
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
      if (!confirm(t('delete.confirm'))) return;
      try {
        await api.delete(`/audio/${id}`);
        card.style.opacity = '0'; card.style.transform = 'scale(.9)';
        card.style.transition = 'all .3s';
        setTimeout(() => card.remove(), 300);
        showToast(t('toast.deleted'), 'success');
      } catch (err) { showToast(err.message, 'error'); }
    });

    // Add to playlist button (injected by buildAudioCard via the DOM)
    card.querySelector('.add-pl-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      openPlaylistPicker(card, track);
    });

    card.querySelector('.share-btn')?.addEventListener('click', async e => {
      e.stopPropagation();
      await shareTrack(track);
    });
  });
}

/** Share a track via Web Share API or clipboard fallback */
async function shareTrack(track) {
  const text  = `🌙 "${track.title}" on TimeKids`;
  const url   = track.is_youtube
    ? track.audio_url.replace('/embed/', '/watch?v=').replace('youtube-nocookie.com', 'youtube.com')
    : window.location.origin + '/dashboard';

  if (navigator.share) {
    try {
      await navigator.share({ title: track.title, text, url });
      return;
    } catch { /* user cancelled */ return; }
  }
  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    showToast('🔗 Link copied to clipboard!', 'success');
  } catch {
    showToast('🔗 ' + url, 'info');
  }
}

// ── Playlist picker (mini dropdown on card) ────────────────────────────────
function openPlaylistPicker(card, track) {
  // Remove any existing pickers
  document.querySelectorAll('.pl-picker').forEach(p => p.remove());

  if (!S.playlists.length) {
    showToast(t('toast.create_pl_first'), 'info');
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
        showToast(t('toast.pl_added'), 'success');
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
  if (S.currentCategory) tracks = tracks.filter(tr => tr.category === S.currentCategory);
  if (S.searchQuery) {
    const q = S.searchQuery.toLowerCase();
    tracks = tracks.filter(tr => tr.title.toLowerCase().includes(q));
  }
  renderGridWithHighlight(tracks, S.searchQuery);
}

/** Render grid and highlight search terms in titles */
function renderGridWithHighlight(tracks, query) {
  if (!tracks.length) {
    audioGrid.innerHTML = emptyState('🔍', t('empty.no_results') || 'No results', `No tracks match "${escHtml(query || '')}"`);
    return;
  }
  renderGrid(tracks);
  if (!query) return;

  // Highlight matching text in card titles
  const q   = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex
  const re  = new RegExp(`(${q})`, 'gi');
  audioGrid.querySelectorAll('.audio-card-title').forEach(el => {
    if (el.dataset.highlighted) return;
    el.innerHTML = el.textContent.replace(re,
      '<mark style="background:var(--gold-200);border-radius:2px;padding:0 1px;">$1</mark>'
    );
    el.dataset.highlighted = '1';
  });
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
    showToast(favorited ? t('fav.added') : t('fav.removed'), favorited ? 'success' : 'info');
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
    document.querySelectorAll('.audio-card.now-playing').forEach(c => c.classList.remove('now-playing'));
    if (S.isLooping) { audioEl.currentTime = 0; audioEl.play().catch(() => {}); }
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
    flashKbdHint(S.isLooping ? t('player.loop_on') : t('player.loop_off'));
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

  // Handle audio load/play errors (CORS, 404, Supabase storage issues)
  audioEl.addEventListener('error', (e) => {
    const code = audioEl.error?.code;
    const msgs = {
      1: 'Playback aborted.',
      2: 'Network error — check your connection.',
      3: 'Audio decoding failed. The file may be corrupted.',
      4: 'Audio format not supported or file not accessible.',
    };
    const msg = msgs[code] || 'Could not load audio.';
    showToast(`❌ ${msg}`, 'error');
    playBtn.textContent = '▶';
    S.isPlaying = false;
    console.error('[AudioError]', code, msg, audioEl.src);
  });

  // Visual loading indicator on the play button
  audioEl.addEventListener('waiting', () => { playBtn.textContent = '⏳'; });
  audioEl.addEventListener('playing', () => { playBtn.textContent = '⏸'; S.isPlaying = true; });
  audioEl.addEventListener('pause',   () => { playBtn.textContent = '▶'; S.isPlaying = false; });
}

async function playTrack(track, playlistContext = []) {
  S.currentTrack = track;
  S.playlist     = playlistContext;

  // Highlight the now-playing card
  updateNowPlayingCard(track.id);

  // Animate player art
  document.getElementById('player-art')?.classList.add('playing');

  // ✅ REVERT : Si YouTube, ouvrir le modal et jouer le son
  if (track.is_youtube) {
    openYouTubeModal(track);
    updatePlayerBar(track, false);
    return;
  }

  // Stop any current playback cleanly
  audioEl.pause();
  audioEl.currentTime = 0;

  // Show loading state
  updatePlayerBar(track, false);
  playBtn.textContent = '⏳';

  try {
    let audioUrl = track.audio_url;

    // Set source and load
    audioEl.src = audioUrl;
    audioEl.load(); // explicit load() call ensures fresh request

    // Wait for browser to have enough data, then play
    await new Promise((resolve, reject) => {
      const onCanPlay = () => { cleanup(); resolve(); };
      const onError   = () => { cleanup(); reject(audioEl.error); };
      const cleanup   = () => {
        audioEl.removeEventListener('canplay', onCanPlay);
        audioEl.removeEventListener('error',   onError);
      };
      audioEl.addEventListener('canplay', onCanPlay, { once: true });
      audioEl.addEventListener('error',   onError,   { once: true });
      // Safety timeout — if 8s pass and neither fires, try playing anyway
      setTimeout(() => { cleanup(); resolve(); }, 8000);
    });

    await audioEl.play();
    S.isPlaying = true;
    updatePlayerBar(track, true);
    setupMediaSession(track, {
      onPlay:  async () => { await audioEl.play(); playBtn.textContent = '⏸'; },
      onPause: ()      => { audioEl.pause(); playBtn.textContent = '▶'; },
      onNext:  playNext,
      onPrev:  playPrev,
    });

  } catch (err) {
    // Autoplay blocked by browser policy — user must click play manually
    if (err?.name === 'NotAllowedError') {
      showToast('▶ Click Play to start (browser autoplay blocked)', 'info');
      updatePlayerBar(track, false); // show paused state
    } else {
      showToast('❌ Could not play this track. Check that the file is accessible.', 'error');
      console.error('[playTrack error]', err, track.audio_url);
      playBtn.textContent = '▶';
    }
  }
}

function updatePlayerBar(track, playing) {
  playerBar.classList.remove('hidden');
  playerTitle.textContent  = track.title;
  playerCat.textContent    = `${track.type === 'lullaby' ? '🎵' : '📖'} ${track.category}`;
  playerArtEl.textContent  = track.type === 'lullaby' ? '🎵' : '📖';
  playBtn.textContent      = playing ? '⏸' : '▶';
  updatePlayerFavBtn();
  markNowPlayingCard(track.id, playing);
}

/** Highlight the currently playing card in the grid */
function markNowPlayingCard(trackId, playing) {
  // Remove from all cards first
  document.querySelectorAll('.audio-card.now-playing').forEach(c => c.classList.remove('now-playing'));
  if (!playing || !trackId) return;
  const card = document.querySelector(`.audio-card[data-id="${trackId}"]`);
  if (card) {
    card.classList.add('now-playing');
    // Scroll card into view if off-screen (smooth)
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function updatePlayerFavBtn() {
  if (!S.currentTrack) return;
  favPlayerBtn.textContent = S.favorites.has(S.currentTrack.id) ? '❤️' : '🤍';
}

async function togglePlay() {
  if (!S.currentTrack) return;
  if (S.currentTrack.is_youtube) return;
  if (audioEl.paused) {
    try {
      await audioEl.play();
      S.isPlaying = true;
      playBtn.textContent = '⏸';
    } catch (err) {
      showToast('▶ Playback blocked — click play again', 'info');
    }
  } else {
    audioEl.pause();
    S.isPlaying = false;
    playBtn.textContent = '▶';
    markNowPlayingCard(S.currentTrack?.id, false);
  }
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
  flashKbdHint(audioEl.muted ? t('player.muted') : t('player.unmuted'));
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
const ytModalTitle = document.getElementById('yt-modal-title');
const ytModalCat   = document.getElementById('yt-modal-category');
const closeYtBtn   = document.getElementById('close-yt-modal');
const ytFavBtn     = document.getElementById('yt-fav-btn');
const ytPlBtn      = document.getElementById('yt-pl-btn');

// YouTube IFrame Player instance (managed by YouTube API)
let ytPlayer       = null;
let ytCurrentTrack = null;

/**
 * Extract the raw video ID from a stored embed URL.
 * Handles both youtube.com/embed/ID and youtube-nocookie.com/embed/ID
 */
function extractVideoId(audioUrl) {
  const m = audioUrl.match(/\/embed\/([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

// Timer to detect if YT player never fires onReady (network timeout)
let _ytReadyTimer = null;

function openYouTubeModal(track) {
  ytCurrentTrack = track;
  ytModalTitle.textContent = track.title;
  ytModalCat.textContent   = `${track.type === 'lullaby' ? '🎵' : '📖'} ${track.category}`;
  ytFavBtn.textContent     = S.favorites.has(track.id) ? '❤️ Favourited' : '🤍 Favourite';

  // Reset UI state — show loading, hide error
  showYtLoading();
  ytModal.classList.add('open');
  applyTranslations(ytModal);

  const videoId = extractVideoId(track.audio_url);
  if (!videoId) {
    showYtError(track.audio_url);
    return;
  }

  // Destroy previous player cleanly
  clearTimeout(_ytReadyTimer);
  if (ytPlayer) {
    try { ytPlayer.stopVideo(); ytPlayer.destroy(); } catch {}
    ytPlayer = null;
  }

  // (Re)create the target div — YT API replaces it with an iframe
  const container = document.getElementById('yt-player-container');
  const old = document.getElementById('yt-player');
  if (old) old.remove();
  const playerDiv = document.createElement('div');
  playerDiv.id = 'yt-player';
  if (container) container.prepend(playerDiv);

  // 15-second safety timeout — shows fallback if API never responds
  _ytReadyTimer = setTimeout(() => {
    if (!ytPlayer || document.getElementById('yt-loading')?.style.display !== 'none') {
      showYtError(track.audio_url, 'timeout');
    }
  }, 15000);

  if (window.YT?.Player) {
    createYTPlayer(videoId, playerDiv);
  } else {
    window._ytPendingVideoId   = videoId;
    window._ytPendingPlayerDiv = playerDiv;
  }
}

function createYTPlayer(videoId, playerDiv) {
  ytPlayer = new window.YT.Player(playerDiv, {
    videoId,
    height: '100%',
    width:  '100%',
    playerVars: {
      autoplay:        1,
      rel:             0,
      modestbranding:  1,
      playsinline:     1,
      enablejsapi:     1,
      fs:              1,   // allow fullscreen
      cc_load_policy:  0,   // no closed captions
      iv_load_policy:  3,   // no video annotations
      origin:          window.location.origin,
    },
    events: {
      onReady: (e) => {
        clearTimeout(_ytReadyTimer);  // cancel safety timeout
        hideYtLoading();
        e.target.playVideo();
      },
      onError: (e) => {
        clearTimeout(_ytReadyTimer);
        // Error codes:
        //   2   = invalid videoId parameter
        //   5   = HTML5 player error
        //   100 = video not found / removed / private
        //   101 = embedding not allowed by video owner
        //   150 = embedding not allowed (same as 101)
        //   153 = embedding disabled (partner restriction)
        const code = e.data;
        console.warn('[YouTube Player Error]', code);
        if (ytCurrentTrack) showYtError(ytCurrentTrack.audio_url, code);
      },
      onStateChange: (e) => {
        // PlayerState: -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering, 5=queued
        if (e.data === window.YT.PlayerState.PLAYING)   hideYtLoading();
        if (e.data === window.YT.PlayerState.BUFFERING) {
          // Show loading spinner during buffering
          document.getElementById('yt-loading').style.display = 'flex';
        }
      },
    },
  });
}

// Listen for YouTube IFrame API ready event (dispatched by the global stub in HTML)
function handleYtApiReady() {
  if (window._ytPendingVideoId && window._ytPendingPlayerDiv) {
    createYTPlayer(window._ytPendingVideoId, window._ytPendingPlayerDiv);
    delete window._ytPendingVideoId;
    delete window._ytPendingPlayerDiv;
  }
}

// API may already be ready (race condition if app.js loads after API)
if (window._ytApiReady) {
  handleYtApiReady();
} else {
  window.addEventListener('ytApiReady', handleYtApiReady, { once: true });
}

function showYtLoading() {
  const loading = document.getElementById('yt-loading');
  const err     = document.getElementById('yt-embed-error');
  if (loading) loading.style.display = 'flex';
  if (err)     err.style.display     = 'none';
}

function hideYtLoading() {
  const loading = document.getElementById('yt-loading');
  if (loading) loading.style.display = 'none';
}

function showYtError(audioUrl, code) {
  const loading = document.getElementById('yt-loading');
  const err     = document.getElementById('yt-embed-error');
  if (loading) loading.style.display = 'none';
  if (err)     err.style.display     = 'flex';

  // Build direct YouTube watch link
  const videoId  = extractVideoId(audioUrl) || '';
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const link     = document.getElementById('yt-fallback-link');
  if (link) link.href = watchUrl;

  // Human-readable description per error code
  const codeMap = {
    2:         'Invalid video ID. The video may have been deleted.',
    5:         'HTML5 player error. Try a different browser.',
    100:       'This video is private or has been removed.',
    101:       'Embedding disabled by the video owner.',
    150:       'Embedding disabled by the video owner.',
    153:       'Embedding disabled by the video owner.',
    'timeout': 'Could not connect to YouTube. Check your internet connection.',
  };
  const desc = document.querySelector('#yt-embed-error p[data-i18n="yt.error_desc"]');
  if (desc && codeMap[code]) {
    desc.removeAttribute('data-i18n'); // override i18n for specific message
    desc.textContent = codeMap[code];
  }

  // Show error code hint in console
  if (code && code !== 'timeout') {
    console.warn(`[YouTube Error ${code}] Video: ${videoId} — ${codeMap[code] || 'Unknown error'}`);
  }
}

function closeYouTubeModal() {
  ytModal.classList.remove('open');
  // Stop and destroy player to stop audio
  if (ytPlayer) {
    try { ytPlayer.stopVideo(); ytPlayer.destroy(); } catch {}
    ytPlayer = null;
  }
  // Recreate empty player div for next use
  const container = document.getElementById('yt-player-container');
  const old = document.getElementById('yt-player');
  if (old) old.remove();
  const fresh = document.createElement('div');
  fresh.id = 'yt-player';
  if (container) container.prepend(fresh);
  showYtLoading();
}

closeYtBtn.addEventListener('click', closeYouTubeModal);
ytModal.addEventListener('click', e => { if (e.target === ytModal) closeYouTubeModal(); });

ytFavBtn.addEventListener('click', async () => {
  if (!S.currentTrack) return;
  const { favorited } = await api.post(`/favorites/${S.currentTrack.id}`).catch(() => ({ favorited: false }));
  favorited ? S.favorites.add(S.currentTrack.id) : S.favorites.delete(S.currentTrack.id);
  ytFavBtn.textContent = favorited ? '❤️ Favourited' : '🤍 Favourite';
});

ytPlBtn.addEventListener('click', () => {
  if (!S.currentTrack || !S.playlists.length) { showToast(t('toast.create_pl_first'), 'info'); return; }
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
        showToast(t('toast.pl_added'), 'success');
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
  subEl.textContent = `${t('resume.sub')} · ${formatTime(resume.currentTime)}`;
  banner.classList.add('visible');

  playResume.addEventListener('click', async () => {
    banner.classList.remove('visible');
    if (resume.is_youtube) {
      S.currentTrack = resume;
      openYouTubeModal(resume);
    } else {
      S.currentTrack = resume;
      updatePlayerBar(resume, false);
      playBtn.textContent = '⏳';
      audioEl.src = resume.audio_url;
      audioEl.load();
      try {
        await new Promise((resolve, reject) => {
          audioEl.addEventListener('canplay', resolve, { once: true });
          audioEl.addEventListener('error',   reject,  { once: true });
          setTimeout(resolve, 8000);
        });
        if (resume.currentTime > 0) audioEl.currentTime = resume.currentTime;
        await audioEl.play();
        S.isPlaying = true;
        updatePlayerBar(resume, true);
      } catch (err) {
        showToast('▶ Click play to resume', 'info');
        updatePlayerBar(resume, false);
      }
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
      audioEl.pause(); closeYouTubeModal();
      S.isPlaying = false; playBtn.textContent = '▶';
      showToast(t('timer.ended'), 'info');
    }
  }, 1000);
  showToast(t('timer.set', { min: mins }), 'success');
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
      showToast(t('toast.track_added'), 'success');
      modal.classList.remove('open'); ytForm.reset();
      // Reset preview
      if (previewPanel) { previewPanel.style.display = 'none'; }
      if (previewIframe) previewIframe.src = '';
      await loadAudio(); await fetchPlaylists();
    } catch (err) {
      ytMsg.className = 'form-message error';
      ytMsg.innerHTML = `❌ ${err.message}` + (err.data?.upgrade ? ` <a href="/profile" style="color:var(--accent);">Upgrade →</a>` : '');
    } finally { ytSubmit.disabled = false; ytSubmit.textContent = 'Add Track 🎵'; }
  });

  // ── YouTube URL live preview / test ──────────────────────────────────
  const ytUrlInput   = document.getElementById('yt-url-input');
  const ytTestBtn    = document.getElementById('yt-test-btn');
  const previewPanel = document.getElementById('yt-preview-panel');
  const previewIframe= document.getElementById('yt-preview-iframe');
  const previewLoad  = document.getElementById('yt-preview-loading');
  const previewErr   = document.getElementById('yt-preview-error');
  const previewErrCode = document.getElementById('yt-preview-err-code');

  function showPreviewLoading() {
    previewPanel.style.display  = 'block';
    previewLoad.style.display   = 'flex';
    previewIframe.style.display = 'none';
    previewErr.style.display    = 'none';
    const okBadge = document.getElementById('yt-preview-ok');
    if (okBadge) okBadge.style.display = 'none';
  }

  function showPreviewOk(embedUrl) {
    previewLoad.style.display   = 'none';
    previewErr.style.display    = 'none';
    previewIframe.style.display = 'block';
    previewIframe.src = embedUrl + '?autoplay=0&rel=0&modestbranding=1';
    // Show green embeddable badge
    const okBadge = document.getElementById('yt-preview-ok');
    if (okBadge) okBadge.style.display = 'block';
  }

  function showPreviewError(code) {
    previewLoad.style.display   = 'none';
    previewIframe.style.display = 'none';
    previewErr.style.display    = 'flex';
    if (previewErrCode) previewErrCode.textContent = code ? `Error ${code}` : '';
    const okBadge = document.getElementById('yt-preview-ok');
    if (okBadge) okBadge.style.display = 'none';
  }

  // Test via YouTube oEmbed (no API key, CORS-friendly) + iframe load detection
  ytTestBtn?.addEventListener('click', async () => {
    const urlVal = ytUrlInput?.value?.trim();
    if (!urlVal) { showToast('Paste a YouTube URL first', 'info'); return; }

    // Extract video ID client-side (same regex as server)
    const m = urlVal.match(/(?:[?&]v=|youtu\.be\/|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
    if (!m) { showToast('❌ Invalid YouTube URL', 'error'); return; }
    const videoId = m[1];

    ytTestBtn.disabled  = true;
    ytTestBtn.textContent = '⏳';
    showPreviewLoading();

    // Quick oEmbed check (tells us if video exists and is public)
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const res = await fetch(oembedUrl, { mode: 'cors' });
      if (!res.ok) {
        ytTestBtn.disabled = false; ytTestBtn.textContent = '🔍 Test';
        showPreviewError(res.status === 401 || res.status === 403 ? 101 : res.status);
        return;
      }
      const data = await res.json();

      // oEmbed OK — now try embedding with iframe + error event
      const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
      previewIframe.onerror = () => { showPreviewError('load'); };

      // Use youtube IFrame API to detect errors (more reliable than iframe load event)
      // First show the preview — if it loads fine, great; if not, onError fires
      showPreviewOk(embedUrl);

      // Also set the url input title to the video title
      if (data.title) {
        ytUrlInput.title = `✅ "${data.title}"`;
        // Auto-fill the track title if empty
        const titleInput = document.querySelector('#youtube-form input[name="title"]');
        if (titleInput && !titleInput.value) titleInput.value = data.title;
        showToast(`✅ Found: "${data.title.substring(0, 40)}"`, 'success');
      }
    } catch (err) {
      // oEmbed CORS error — likely video exists but request was blocked
      // Fall back to just showing the embed iframe optimistically
      const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
      showPreviewOk(embedUrl);
      showToast('⚠️ Could not pre-verify — trying embed directly', 'warning');
    } finally {
      ytTestBtn.disabled  = false;
      ytTestBtn.textContent = '🔍 Test';
    }
  });

  // Auto-test when url input loses focus and has a value
  ytUrlInput?.addEventListener('blur', () => {
    if (ytUrlInput.value.trim().length > 10) ytTestBtn?.click();
  });

  // Clear preview when modal closes
  [closeBtn, cancelBtn].forEach(b => b?.addEventListener('click', () => {
    if (previewPanel) previewPanel.style.display = 'none';
    if (previewIframe) previewIframe.src = '';
  }));

  // Upload form
  const upForm   = document.getElementById('upload-form');
  const upMsg    = document.getElementById('upload-form-msg');
  const upSubmit = document.getElementById('upload-submit-btn');

  upForm?.addEventListener('submit', async e => {
    e.preventDefault();
    upSubmit.disabled = true; upSubmit.textContent = '⏳ Uploading…';
    try {
      await api.postForm('/audio/upload', new FormData(upForm));
      showToast(t('toast.uploaded'), 'success');
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

  const titles = { all:t('view.all'), lullaby:t('view.lullaby'), story:t('view.story'), favorites:t('view.favorites'), ambient:t('view.ambient'), 'my-uploads':t('view.my-uploads') };
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

  const isMobile = () => window.innerWidth <= 900;
  if (isMobile()) toggle.style.display = 'flex';
  window.addEventListener('resize', () => { toggle.style.display = isMobile() ? 'flex' : 'none'; });
  toggle?.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!sidebar.contains(e.target) && !toggle?.contains(e.target)) sidebar.classList.remove('open');
  });

  // ── Swipe-to-close on mobile ────────────────────────────────────────────
  let touchStartX = null;
  sidebar.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  sidebar.addEventListener('touchmove', e => {
    if (touchStartX === null || !isMobile()) return;
    const dx = e.touches[0].clientX - touchStartX;
    // Swipe left > 60px → close
    if (dx < -60) {
      sidebar.classList.remove('open');
      touchStartX = null;
    }
  }, { passive: true });

  sidebar.addEventListener('touchend', () => { touchStartX = null; }, { passive: true });
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

// ── Keyboard shortcuts modal ───────────────────────────────────────────────
function setupKbdModal() {
  const modal    = document.getElementById('kbd-modal');
  const openBtn  = document.getElementById('kbd-help-btn');
  const closeBtn = document.getElementById('close-kbd-modal');
  if (!modal) return;

  openBtn?.addEventListener('click', () => {
    modal.classList.toggle('open');
    if (modal.classList.contains('open')) applyTranslations(modal);
  });
  closeBtn?.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });

  // ? shortcut hint in topbar
  window.addEventListener('langchange', () => {
    if (modal.classList.contains('open')) applyTranslations(modal);
  });
}

// ── Now-playing card highlight ─────────────────────────────────────────────
function updateNowPlayingCard(trackId) {
  // Remove previous highlight
  document.querySelectorAll('.audio-card.now-playing').forEach(c => c.classList.remove('now-playing'));
  // Add to new one
  if (trackId) {
    const card = document.querySelector(`.audio-card[data-id="${trackId}"]`);
    if (card) {
      card.classList.add('now-playing');
      // Smooth scroll card into view if not visible
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

// ── Online / Offline banner ────────────────────────────────────────────────
function setupOfflineBanner() {
  const banner = document.getElementById('offline-banner');
  if (!banner) return;

  const update = () => {
    if (navigator.onLine) {
      banner.style.display = 'none';
      document.querySelector('.main-content')?.style.removeProperty('padding-top');
    } else {
      banner.style.display = 'block';
      // Shift content down so banner doesn't cover topbar
      const mc = document.querySelector('.main-content');
      if (mc) mc.style.paddingTop = '36px';
    }
  };

  window.addEventListener('online',  update);
  window.addEventListener('offline', update);
  update(); // check current state on load
}

// ── Recently Played ────────────────────────────────────────────────────────

/** Load and render the recently-played row */
async function loadRecentlyPlayed() {
  try {
    const { plays } = await api.get('/children/recent');
    const section   = document.getElementById('recently-played-section');
    const grid      = document.getElementById('recently-played-grid');
    if (!plays?.length) return;

    section.style.display = 'block';
    grid.innerHTML = plays.map((p, i) => {
      const t  = p.audio_content;
      if (!t) return '';
      const emojis = ['🎵','🌙','⭐','🌟','💫','🎼','📖','🌸'];
      const emoji  = emojis[i % 8];
      const pct    = t.duration ? Math.round((p.position / t.duration) * 100) : 0;
      return `
        <div class="audio-card" data-id="${t.id}" style="min-width:160px;max-width:160px;cursor:pointer;flex-shrink:0;">
          <div class="audio-card-art ${t.type === 'lullaby' ? '' : 'story-art'}" style="aspect-ratio:1;">
            <span style="font-size:2rem;position:relative;z-index:1;">${emoji}</span>
          </div>
          <div class="audio-card-body" style="padding:10px;">
            <div class="audio-card-title" style="font-size:.82rem;">${escHtml(t.title)}</div>
            ${pct > 0 ? `
            <div style="margin-top:6px;">
              <div style="height:3px;background:var(--sky-100);border-radius:99px;overflow:hidden;">
                <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,var(--primary),var(--accent));border-radius:99px;"></div>
              </div>
              <div style="font-size:.68rem;color:var(--text-muted);margin-top:2px;">${formatTime(p.position)} played</div>
            </div>` : ''}
          </div>
        </div>`;
    }).join('');

    // Wire clicks
    grid.querySelectorAll('.audio-card').forEach(card => {
      const id    = card.dataset.id;
      const play  = plays.find(p => p.audio_content?.id === id);
      if (!play?.audio_content) return;
      card.addEventListener('click', () => {
        const track = play.audio_content;
        S.currentTrack = track;
        if (track.is_youtube) {
          openYouTubeModal(track);
        } else {
          audioEl.src = track.audio_url;
          audioEl.load();
          audioEl.addEventListener('canplay', async () => {
            if (play.position > 0) audioEl.currentTime = play.position;
            try { await audioEl.play(); } catch {}
          }, { once: true });
          S.isPlaying = true;
          updatePlayerBar(track, true);
        }
      });
    });
  } catch { /* quiet — recently played is non-critical */ }
}

/** Record a play event every 10 seconds while playing */
function startPlayTracking() {
  let tracker;
  audioEl.addEventListener('play', () => {
    tracker = setInterval(() => {
      if (!S.currentTrack?.id || audioEl.paused) return;
      api.post('/children/recent', {
        audioId:  S.currentTrack.id,
        position: Math.floor(audioEl.currentTime),
      }).catch(() => {});
    }, 10_000);
  });
  audioEl.addEventListener('pause', () => clearInterval(tracker));
  audioEl.addEventListener('ended', () => {
    clearInterval(tracker);
    if (S.currentTrack?.id) {
      api.post('/children/recent', { audioId: S.currentTrack.id, position: 0 }).catch(() => {});
    }
  });
}

// ── First-login Onboarding ─────────────────────────────────────────────────

const ONBOARD_KEY = 'tk_onboarded';

function setupOnboarding() {
  if (localStorage.getItem(ONBOARD_KEY)) return;

  const modal = document.getElementById('onboard-modal');
  if (!modal) return;

  // Delay so dashboard loads first
  setTimeout(() => {
    modal.classList.add('open');
    applyTranslations(modal);
  }, 600);

  document.getElementById('onboard-close-btn').addEventListener('click', () => {
    modal.classList.remove('open');
    localStorage.setItem(ONBOARD_KEY, '1');
  });
}

// ── Active child topbar pill ───────────────────────────────────────────────

function showActiveChildPill() {
  try {
    const child = JSON.parse(localStorage.getItem('tk_active_child') || 'null');
    const pill  = document.getElementById('active-child-pill');
    if (!pill) return;
    if (child) {
      document.getElementById('topbar-child-emoji').textContent = child.avatar_emoji || '🌙';
      document.getElementById('topbar-child-name').textContent  = child.name;
      pill.style.display = 'flex';
      // Clear link
      pill.querySelector('a').addEventListener('click', e => {
        e.preventDefault();
        localStorage.removeItem('tk_active_child');
        pill.style.display = 'none';
      });
    } else {
      pill.style.display = 'none';
    }
  } catch {}
}
