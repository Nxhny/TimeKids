/**
 * TimeKids - Main Application Logic
 * Global utilities and core functionality
 */

// ============================================
// API HELPER FUNCTIONS
// ============================================

const API = {
  /**
   * Make API request
   */
  async request(endpoint, options = {}) {
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const config = { ...defaultOptions, ...options };

    try {
      const response = await fetch(`/api${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Audio endpoints
  audio: {
    getAll: (options = {}) => {
      const params = new URLSearchParams(options).toString();
      return API.request(`/audio?${params}`);
    },
    getById: (id) => API.request(`/audio/${id}`),
    getByType: (type) => API.request(`/audio/type/${type}`),
    getByCategory: (category) => API.request(`/audio/category/${category}`),
    getCategories: () => API.request('/audio/categories'),
    search: (query, filters = {}) => {
      const params = new URLSearchParams({ q: query, ...filters }).toString();
      return API.request(`/audio/search?${params}`);
    }
  },

  // Favorites endpoints
  favorites: {
    getAll: () => API.request('/favorites'),
    check: (audioId) => API.request(`/favorites/check/${audioId}`),
    add: (audioId) => API.request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ audioId })
    }),
    remove: (audioId) => API.request(`/favorites/${audioId}`, {
      method: 'DELETE'
    }),
    getTrending: (limit = 10) => API.request(`/favorites/trending?limit=${limit}`)
  },

  // Auth endpoints
  auth: {
    login: (email, password) => API.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
    signup: (name, email, password) => API.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    }),
    logout: () => API.request('/auth/logout', {
      method: 'POST'
    }),
    getStatus: () => API.request('/auth/status'),
    getCurrentUser: () => API.request('/auth/me')
  },

  // User endpoints
  user: {
    getProfile: () => API.request('/user/profile'),
    getPreferences: () => API.request('/user/preferences'),
    setPreferences: (prefs) => API.request('/user/preferences', {
      method: 'POST',
      body: JSON.stringify(prefs)
    }),
    getHistory: () => API.request('/user/history'),
    addToHistory: (audioId, timestamp) => API.request('/user/history', {
      method: 'POST',
      body: JSON.stringify({ audioId, timestamp })
    })
  }
};

// ============================================
// AUTH STATE MANAGEMENT
// ============================================

const Auth = {
  user: null,
  isAuthenticated: false,

  async init() {
    try {
      const data = await API.auth.getStatus();
      this.isAuthenticated = data.isAuthenticated;
      this.user = data.user;
      this.updateUI();
    } catch (error) {
      console.error('Auth init error:', error);
      this.isAuthenticated = false;
    }
  },

  updateUI() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.style.display = this.isAuthenticated ? 'block' : 'none';
      logoutBtn.addEventListener('click', () => this.logout());
    }
  },

  async logout() {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await API.auth.logout();
        window.location.href = '/';
      } catch (error) {
        alert('Logout failed: ' + error.message);
      }
    }
  }
};

// ============================================
// THEME MANAGEMENT
// ============================================

const Theme = {
  isDark: localStorage.getItem('darkMode') === 'true',

  init() {
    // Check system preference if no saved preference
    if (!localStorage.getItem('darkMode')) {
      this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    this.apply();
    this.setupToggle();
  },

  apply() {
    const body = document.body;
    const toggle = document.getElementById('themeToggle');

    if (this.isDark) {
      body.classList.add('dark-mode');
      if (toggle) toggle.textContent = '☀️';
    } else {
      body.classList.remove('dark-mode');
      if (toggle) toggle.textContent = '🌙';
    }

    localStorage.setItem('darkMode', this.isDark);
  },

  setupToggle() {
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        this.isDark = !this.isDark;
        this.apply();
      });
    }
  },

  toggle() {
    this.isDark = !this.isDark;
    this.apply();
  }
};

// ============================================
// UI UTILITIES
// ============================================

const UI = {
  /**
   * Show toast notification
   */
  toast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: ${type === 'success' ? '#a8d5a8' : type === 'error' ? '#f5a8a8' : '#a8d8d8'};
      color: white;
      border-radius: 0.5rem;
      z-index: 10000;
      animation: slideUp 0.3s ease-in-out;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideDown 0.3s ease-in-out';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  /**
   * Show loading spinner
   */
  showLoading(element) {
    if (element) {
      element.innerHTML = '<div class="spinner" style="margin: auto;"></div>';
    }
  },

  /**
   * Format time in MM:SS
   */
  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * Create audio card HTML
   */
  createAudioCard(audio, isFavorited = false) {
    const card = document.createElement('div');
    card.className = 'audio-card';
    card.innerHTML = `
      <div class="audio-cover">
        ${audio.type === 'lullaby' ? '🎵' : '📖'}
      </div>
      <div class="audio-card-content">
        <div class="audio-type">${audio.type}</div>
        <h3 class="audio-title">${audio.title}</h3>
        <p class="audio-category">${audio.category}</p>
        <div class="audio-footer">
          <button class="audio-btn audio-play-btn" data-id="${audio.id}">▶️ Play</button>
          <button class="audio-btn audio-favorite-btn ${isFavorited ? 'favorited' : ''}" data-id="${audio.id}">
            ${isFavorited ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
    `;
    return card;
  }
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize theme
  Theme.init();

  // Initialize auth
  await Auth.init();

  // Set welcome name if on dashboard
  if (Auth.isAuthenticated && Auth.user) {
    const welcomeEl = document.getElementById('welcomeName');
    if (welcomeEl) {
      welcomeEl.textContent = `Welcome back, ${Auth.user.name}! 👋`;
    }

    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
      userNameEl.textContent = Auth.user.name;
    }

    const userEmailEl = document.getElementById('userEmail');
    if (userEmailEl) {
      userEmailEl.textContent = Auth.user.email;
    }
  }
});

// ============================================
// ERROR HANDLING
// ============================================

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
