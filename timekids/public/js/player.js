// public/js/player.js
// ─────────────────────────────────────────────────────────────────────────────
// Enhanced Audio Player Module
// • Web Audio API waveform visualizer
// • "Continue listening" — persists playback position in localStorage
// • Keyboard shortcuts (Space, ←/→, M)
// • Media Session API (lockscreen controls on mobile)
// ─────────────────────────────────────────────────────────────────────────────

const RESUME_KEY = 'tk_resume';

// ── Continue Listening ────────────────────────────────────────────────────

/** Save current playback state to localStorage */
export function saveResumeState(track, currentTime) {
  if (!track) return;
  try {
    localStorage.setItem(RESUME_KEY, JSON.stringify({
      id:          track.id,
      title:       track.title,
      type:        track.type,
      category:    track.category,
      audio_url:   track.audio_url,
      is_youtube:  track.is_youtube,
      currentTime: currentTime || 0,
      savedAt:     Date.now(),
    }));
  } catch {}
}

/** Load saved playback state */
export function loadResumeState() {
  try {
    const raw = localStorage.getItem(RESUME_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    // Expire after 7 days
    if (Date.now() - state.savedAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(RESUME_KEY);
      return null;
    }
    return state;
  } catch {
    return null;
  }
}

/** Clear resume state */
export function clearResumeState() {
  localStorage.removeItem(RESUME_KEY);
}

// ── Waveform Visualizer ────────────────────────────────────────────────────

let audioCtx    = null;
let analyser    = null;
let source      = null;
let animFrame   = null;
let canvasEl    = null;
let canvasCtx   = null;
let isConnected = false;

/** Initialize Web Audio API visualizer. Call once after audioEl is created. */
export function initVisualizer(audioEl, canvas) {
  canvasEl  = canvas;
  canvasCtx = canvas.getContext('2d');

  // Lazy-create AudioContext on first user interaction (browser policy)
  const setupCtx = () => {
    if (audioCtx) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      source = audioCtx.createMediaElementSource(audioEl);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      isConnected = true;
    } catch (e) {
      console.warn('Web Audio API not available:', e);
    }
  };

  audioEl.addEventListener('play', () => {
    setupCtx();
    if (audioCtx?.state === 'suspended') audioCtx.resume();
    drawVisualizer();
  });

  audioEl.addEventListener('pause', () => stopVisualizer());
  audioEl.addEventListener('ended', () => stopVisualizer());
}

function drawVisualizer() {
  if (!analyser || !canvasEl) return;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray    = new Uint8Array(bufferLength);

  const draw = () => {
    animFrame = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    const W = canvasEl.width  = canvasEl.offsetWidth;
    const H = canvasEl.height = canvasEl.offsetHeight;

    canvasCtx.clearRect(0, 0, W, H);

    const barW  = (W / bufferLength) * 2.2;
    const gap   = 2;
    let   x     = 0;

    // Draw gradient bars
    for (let i = 0; i < bufferLength; i++) {
      const barH = (dataArray[i] / 255) * H * 0.9;
      const hue  = 195 + (i / bufferLength) * 60; // sky-blue → lavender

      const grad = canvasCtx.createLinearGradient(0, H - barH, 0, H);
      grad.addColorStop(0, `hsla(${hue},70%,70%,0.9)`);
      grad.addColorStop(1, `hsla(${hue},70%,55%,0.4)`);

      canvasCtx.fillStyle = grad;
      canvasCtx.beginPath();
      canvasCtx.roundRect?.(x, H - barH, barW - gap, barH, [3, 3, 0, 0]);
      if (!canvasCtx.roundRect) canvasCtx.rect(x, H - barH, barW - gap, barH);
      canvasCtx.fill();

      x += barW;
    }
  };

  draw();
}

function stopVisualizer() {
  if (animFrame) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }
  if (canvasCtx && canvasEl) {
    canvasCtx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  }
}

// ── Keyboard Shortcuts ────────────────────────────────────────────────────

/**
 * Register keyboard shortcuts for the player.
 * @param {{ onPlayPause, onNext, onPrev, onMute, audioEl }} handlers
 */
export function registerKeyboardShortcuts({ onPlayPause, onNext, onPrev, onMute, audioEl }) {
  document.addEventListener('keydown', (e) => {
    // Ignore when typing in inputs
    if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        onPlayPause?.();
        break;
      case 'ArrowRight':
        if (e.shiftKey) { onNext?.(); } else { audioEl.currentTime += 10; }
        break;
      case 'ArrowLeft':
        if (e.shiftKey) { onPrev?.(); } else { audioEl.currentTime = Math.max(0, audioEl.currentTime - 10); }
        break;
      case 'KeyM':
        onMute?.();
        break;
      case 'ArrowUp':
        e.preventDefault();
        audioEl.volume = Math.min(1, audioEl.volume + 0.1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        audioEl.volume = Math.max(0, audioEl.volume - 0.1);
        break;
    }
  });
}

// ── Media Session API ─────────────────────────────────────────────────────

/**
 * Set up Media Session metadata for lock-screen / notification controls.
 * @param {Object} track
 * @param {{ onPlay, onPause, onNext, onPrev }} handlers
 */
export function setupMediaSession(track, { onPlay, onPause, onNext, onPrev } = {}) {
  if (!('mediaSession' in navigator)) return;

  navigator.mediaSession.metadata = new MediaMetadata({
    title:  track.title,
    artist: track.type === 'lullaby' ? '🎵 Lullaby' : '📖 Story',
    album:  'TimeKids',
    artwork: [{ src: '/assets/logo.png', sizes: '512x512', type: 'image/png' }],
  });

  if (onPlay)  navigator.mediaSession.setActionHandler('play',          onPlay);
  if (onPause) navigator.mediaSession.setActionHandler('pause',         onPause);
  if (onNext)  navigator.mediaSession.setActionHandler('nexttrack',     onNext);
  if (onPrev)  navigator.mediaSession.setActionHandler('previoustrack', onPrev);

  navigator.mediaSession.setActionHandler('seekforward',  () => {});
  navigator.mediaSession.setActionHandler('seekbackward', () => {});
}
