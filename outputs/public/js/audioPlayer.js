/**
 * Audio Player Module
 * Handles playback, sleep timer, and player state
 */

const AudioPlayer = {
  // Player state
  currentAudio: null,
  isPlaying: false,
  repeatMode: 'off', // off, one, all
  sleepTimer: null,
  sleepRemaining: 0,
  queue: [],

  // DOM elements
  audio: null,
  playBtn: null,
  progressBar: null,
  volumeBar: null,
  currentTimeEl: null,
  durationEl: null,
  favoriteBtn: null,
  timerBtn: null,
  timerDisplay: null,

  /**
   * Initialize player
   */
  init() {
    // Get audio element
    this.audio = document.getElementById('audioElement');
    if (!this.audio) {
      this.audio = document.createElement('audio');
      this.audio.id = 'audioElement';
      document.body.appendChild(this.audio);
    }

    // Get UI elements
    this.playBtn = document.getElementById('playBtn') || document.getElementById('miniPlayBtn');
    this.progressBar = document.getElementById('progressBar');
    this.volumeBar = document.getElementById('volumeBar');
    this.currentTimeEl = document.getElementById('currentTime');
    this.durationEl = document.getElementById('duration');
    this.favoriteBtn = document.getElementById('favoriteBtn');
    this.timerBtn = document.getElementById('timerBtn');
    this.timerDisplay = document.getElementById('timerDisplay') || document.getElementById('timerDisplay-large');

    // Setup event listeners
    this.setupEventListeners();

    // Load saved preferences
    this.loadPreferences();

    // Try to resume last played
    this.tryResumeLastPlayed();
  },

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    if (!this.audio) return;

    // Play/pause button
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => this.togglePlay());
    }

    // Audio events
    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.updatePlayButton();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updatePlayButton();
    });

    this.audio.addEventListener('timeupdate', () => {
      this.updateProgress();
      this.savePlaybackState();
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.durationEl) {
        this.durationEl.textContent = UI.formatTime(this.audio.duration);
      }
    });

    this.audio.addEventListener('ended', () => {
      this.onTrackEnded();
    });

    // Progress bar
    if (this.progressBar) {
      this.progressBar.addEventListener('change', () => {
        const time = (this.progressBar.value / 100) * this.audio.duration;
        this.audio.currentTime = time;
      });

      this.progressBar.addEventListener('input', () => {
        const time = (this.progressBar.value / 100) * this.audio.duration;
        this.currentTimeEl.textContent = UI.formatTime(time);
      });
    }

    // Volume control
    if (this.volumeBar) {
      this.volumeBar.addEventListener('input', () => {
        this.audio.volume = this.volumeBar.value / 100;
        const volumeValue = document.getElementById('volumeValue');
        if (volumeValue) {
          volumeValue.textContent = this.volumeBar.value + '%';
        }
        localStorage.setItem('playerVolume', this.volumeBar.value);
      });
    }

    // Favorite button
    if (this.favoriteBtn) {
      this.favoriteBtn.addEventListener('click', () => this.toggleFavorite());
    }

    // Timer button
    if (this.timerBtn) {
      this.timerBtn.addEventListener('click', () => this.showTimerOptions());
    }

    // Timer options
    document.querySelectorAll('.timer-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const minutes = parseInt(btn.dataset.minutes);
        if (minutes === 0) {
          this.cancelSleepTimer();
        } else {
          this.setSleepTimer(minutes);
        }
      });
    });

    // Repeat button
    const repeatBtn = document.getElementById('repeatBtn');
    if (repeatBtn) {
      repeatBtn.addEventListener('click', () => this.toggleRepeat());
    }

    // Next/Previous buttons
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('previousBtn');

    if (nextBtn) nextBtn.addEventListener('click', () => this.playNext());
    if (prevBtn) prevBtn.addEventListener('click', () => this.playPrevious());
  },

  /**
   * Play audio
   */
  async play(audio) {
    try {
      this.currentAudio = audio;

      // Update player UI
      const titleEl = document.getElementById('playerTitle') || document.getElementById('metaTitle');
      const typeEl = document.getElementById('playerType') || document.getElementById('metaType');
      const categoryEl = document.getElementById('playerCategory') || document.getElementById('metaCategory');
      const miniTitle = document.getElementById('miniTitle');

      if (titleEl) titleEl.textContent = audio.title;
      if (typeEl) typeEl.textContent = audio.type;
      if (categoryEl) categoryEl.textContent = audio.category;
      if (miniTitle) miniTitle.textContent = audio.title;

      // Set audio source
      this.audio.src = audio.audio_url;

      // Play
      await this.audio.play();

      // Update UI
      this.updatePlayButton();
      this.updateFavoriteButton();

      // Show mini player
      const miniPlayer = document.getElementById('miniPlayer');
      if (miniPlayer) {
        miniPlayer.style.display = 'block';
      }

      // Save to history
      await API.user.addToHistory(audio.id);

      // Display modal if exists
      const modal = document.getElementById('playerModal');
      if (modal && window.innerWidth > 768) {
        modal.style.display = 'flex';
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      UI.toast('Error playing audio', 'error');
    }
  },

  /**
   * Toggle play/pause
   */
  togglePlay() {
    if (!this.currentAudio) {
      UI.toast('Select a track first', 'warning');
      return;
    }

    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play().catch(err => console.error('Play error:', err));
    }
  },

  /**
   * Update play button UI
   */
  updatePlayButton() {
    if (this.playBtn) {
      this.playBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
    }
  },

  /**
   * Update progress bar
   */
  updateProgress() {
    if (this.progressBar && this.audio.duration) {
      const progress = (this.audio.currentTime / this.audio.duration) * 100;
      this.progressBar.value = progress;

      // Update fill width
      const fill = document.querySelector('.progress-fill');
      if (fill) {
        fill.style.width = progress + '%';
      }
    }

    if (this.currentTimeEl) {
      this.currentTimeEl.textContent = UI.formatTime(this.audio.currentTime);
    }
  },

  /**
   * Track ended handler
   */
  onTrackEnded() {
    if (this.repeatMode === 'one') {
      this.audio.currentTime = 0;
      this.audio.play();
    } else if (this.queue.length > 0) {
      this.playNext();
    } else {
      this.isPlaying = false;
      this.updatePlayButton();
    }
  },

  /**
   * Toggle repeat mode
   */
  toggleRepeat() {
    const modes = ['off', 'one', 'all'];
    const currentIndex = modes.indexOf(this.repeatMode);
    this.repeatMode = modes[(currentIndex + 1) % modes.length];

    const repeatBtn = document.getElementById('repeatBtn');
    if (repeatBtn) {
      const icons = { 'off': '🔄', 'one': '🔂', 'all': '🔁' };
      repeatBtn.textContent = icons[this.repeatMode];
      if (this.repeatMode !== 'off') {
        repeatBtn.classList.add('active');
      } else {
        repeatBtn.classList.remove('active');
      }
    }

    localStorage.setItem('repeatMode', this.repeatMode);
  },

  /**
   * Sleep Timer - Set timer
   */
  setSleepTimer(minutes) {
    this.cancelSleepTimer();

    this.sleepRemaining = minutes * 60;
    const timerBtn = document.getElementById('timerBtn');

    if (timerBtn) {
      timerBtn.classList.add('active');
    }

    if (this.timerDisplay) {
      this.timerDisplay.style.display = 'block';
    }

    this.updateTimerDisplay();

    // Set interval
    this.sleepTimer = setInterval(() => {
      this.sleepRemaining--;

      if (this.sleepRemaining <= 0) {
        this.endSleepTimer();
      } else {
        this.updateTimerDisplay();
      }
    }, 1000);

    UI.toast(`Sleep timer set for ${minutes} minutes`, 'success');
  },

  /**
   * Update timer display
   */
  updateTimerDisplay() {
    const mins = Math.floor(this.sleepRemaining / 60);
    const secs = this.sleepRemaining % 60;
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

    if (this.timerDisplay) {
      const timerText = this.timerDisplay.querySelector('#timerText');
      if (timerText) {
        timerText.textContent = timeStr;
      }
    }

    const timerDisplayLarge = document.getElementById('timerDisplay-large');
    if (timerDisplayLarge) {
      const text = timerDisplayLarge.querySelector('.timer-text');
      if (text) {
        text.textContent = timeStr;
      }
    }
  },

  /**
   * End sleep timer
   */
  endSleepTimer() {
    this.audio.pause();
    this.cancelSleepTimer();
    UI.toast('Sleep timer ended. Goodnight! 🌙', 'success');
  },

  /**
   * Cancel sleep timer
   */
  cancelSleepTimer() {
    if (this.sleepTimer) {
      clearInterval(this.sleepTimer);
      this.sleepTimer = null;
    }

    this.sleepRemaining = 0;

    const timerBtn = document.getElementById('timerBtn');
    if (timerBtn) {
      timerBtn.classList.remove('active');
    }

    if (this.timerDisplay) {
      this.timerDisplay.style.display = 'none';
    }
  },

  /**
   * Show timer options
   */
  showTimerOptions() {
    const modal = document.getElementById('timerModal');
    if (modal) {
      modal.style.display = 'flex';
    }
  },

  /**
   * Toggle favorite
   */
  async toggleFavorite() {
    if (!this.currentAudio) {
      UI.toast('Select a track first', 'warning');
      return;
    }

    if (!Auth.isAuthenticated) {
      UI.toast('Please login to save favorites', 'warning');
      window.location.href = '/login';
      return;
    }

    try {
      const isFavorited = await API.favorites.check(this.currentAudio.id);

      if (isFavorited) {
        await API.favorites.remove(this.currentAudio.id);
        this.currentAudio.isFavorited = false;
        UI.toast('Removed from favorites', 'success');
      } else {
        await API.favorites.add(this.currentAudio.id);
        this.currentAudio.isFavorited = true;
        UI.toast('Added to favorites ❤️', 'success');
      }

      this.updateFavoriteButton();
    } catch (error) {
      UI.toast('Error updating favorite', 'error');
    }
  },

  /**
   * Update favorite button
   */
  async updateFavoriteButton() {
    if (!this.favoriteBtn || !this.currentAudio || !Auth.isAuthenticated) return;

    try {
      const isFavorited = await API.favorites.check(this.currentAudio.id);
      this.favoriteBtn.textContent = isFavorited ? '❤️' : '🤍';
      this.favoriteBtn.classList.toggle('favorited', isFavorited);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  },

  /**
   * Play next in queue
   */
  playNext() {
    if (this.queue.length === 0) return;
    const current = this.queue.indexOf(this.currentAudio);
    const next = (current + 1) % this.queue.length;
    this.play(this.queue[next]);
  },

  /**
   * Play previous in queue
   */
  playPrevious() {
    if (this.queue.length === 0) return;
    const current = this.queue.indexOf(this.currentAudio);
    const prev = (current - 1 + this.queue.length) % this.queue.length;
    this.play(this.queue[prev]);
  },

  /**
   * Save playback state
   */
  savePlaybackState() {
    if (!this.currentAudio) return;
    localStorage.setItem('lastPlayedAudio', JSON.stringify({
      id: this.currentAudio.id,
      time: this.audio.currentTime
    }));
  },

  /**
   * Try resume last played
   */
  tryResumeLastPlayed() {
    const saved = localStorage.getItem('lastPlayedAudio');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Could load and resume here if auto-resume is enabled
      } catch (error) {
        console.error('Error parsing saved state:', error);
      }
    }
  },

  /**
   * Load preferences
   */
  loadPreferences() {
    const volume = localStorage.getItem('playerVolume') || '70';
    if (this.volumeBar) {
      this.volumeBar.value = volume;
      this.audio.volume = volume / 100;
    }

    const repeatMode = localStorage.getItem('repeatMode') || 'off';
    this.repeatMode = repeatMode;
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  AudioPlayer.init();
});
