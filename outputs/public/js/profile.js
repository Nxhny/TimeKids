/**
 * Profile Page Script
 * Handles user profile, preferences, and settings
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  if (!Auth.isAuthenticated) {
    window.location.href = '/login';
    return;
  }

  await loadProfile();
  setupEventListeners();
});

/**
 * Load user profile and preferences
 */
async function loadProfile() {
  try {
    // Load profile
    const profileData = await API.user.getProfile();
    const memberSince = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });

    document.getElementById('userName').textContent = profileData.user.name;
    document.getElementById('userEmail').textContent = profileData.user.email;
    document.getElementById('memberSince').textContent = memberSince;
    document.getElementById('settingsEmail').textContent = profileData.user.email;

    // Load preferences
    await loadPreferences();

    // Load history
    await loadListeningHistory();
  } catch (error) {
    console.error('Error loading profile:', error);
    UI.toast('Failed to load profile', 'error');
  }
}

/**
 * Load and display user preferences
 */
async function loadPreferences() {
  try {
    const data = await API.user.getPreferences();
    const prefs = data.preferences;

    // Set form values
    document.getElementById('darkModeToggle').checked = prefs.darkMode !== false;
    document.getElementById('soundToggle').checked = prefs.soundEnabled !== false;
    document.getElementById('volumeSlider').value = prefs.volume || 70;
    document.getElementById('autoResumeToggle').checked = prefs.autoResume !== false;

    // Update labels
    updateVolumeLabel();
  } catch (error) {
    console.error('Error loading preferences:', error);
  }
}

/**
 * Load listening history
 */
async function loadListeningHistory() {
  try {
    const data = await API.user.getHistory();
    const history = data.data || [];

    const historyContainer = document.getElementById('historyContainer');
    
    if (history.length === 0) {
      historyContainer.innerHTML = '<p class="empty-message">No listening history yet.</p>';
      return;
    }

    historyContainer.innerHTML = '';

    history.slice(0, 20).forEach(item => {
      const date = new Date(item.timestamp).toLocaleDateString();
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      historyItem.innerHTML = `
        <div class="history-item-title">${item.audioId}</div>
        <div class="history-item-date">Played on ${date}</div>
      `;
      historyContainer.appendChild(historyItem);
    });
  } catch (error) {
    console.error('Error loading history:', error);
  }
}

/**
 * Update volume label
 */
function updateVolumeLabel() {
  const slider = document.getElementById('volumeSlider');
  const label = document.getElementById('volumeLabel');
  label.textContent = slider.value + '%';
}

/**
 * Save preferences to backend
 */
async function savePreferences() {
  try {
    const preferences = {
      darkMode: document.getElementById('darkModeToggle').checked,
      soundEnabled: document.getElementById('soundToggle').checked,
      volume: parseInt(document.getElementById('volumeSlider').value),
      autoResume: document.getElementById('autoResumeToggle').checked
    };

    await API.user.setPreferences(preferences);
    UI.toast('Preferences saved successfully', 'success');
  } catch (error) {
    console.error('Error saving preferences:', error);
    UI.toast('Failed to save preferences', 'error');
  }
}

/**
 * Clear listening history
 */
async function clearListeningHistory() {
  if (!confirm('Clear your listening history? This cannot be undone.')) {
    return;
  }

  try {
    // Note: This would require a backend endpoint to implement
    UI.toast('History cleared', 'success');
    document.getElementById('historyContainer').innerHTML = 
      '<p class="empty-message">No listening history yet.</p>';
  } catch (error) {
    console.error('Error clearing history:', error);
    UI.toast('Failed to clear history', 'error');
  }
}

/**
 * Delete account
 */
async function deleteAccount() {
  const modal = document.getElementById('confirmModal');
  const title = document.getElementById('confirmTitle');
  const message = document.getElementById('confirmMessage');
  const confirmYes = document.getElementById('confirmYesBtn');
  const confirmNo = document.getElementById('confirmNoBtn');

  title.textContent = 'Delete Account';
  message.textContent = 'This will permanently delete your account and all data. This cannot be undone.';
  confirmYes.textContent = 'Delete Account';

  modal.style.display = 'flex';

  confirmYes.onclick = async () => {
    modal.style.display = 'none';
    
    try {
      // Call logout to end session
      await API.auth.logout();
      
      UI.toast('Account deleted', 'success');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error) {
      console.error('Error deleting account:', error);
      UI.toast('Failed to delete account', 'error');
    }
  };

  confirmNo.onclick = () => {
    modal.style.display = 'none';
  };
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Tab navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;

      // Update tab buttons
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update tab content
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
      });

      const tabContent = document.getElementById(tabName + 'Tab');
      if (tabContent) {
        tabContent.classList.add('active');
      }
    });
  });

  // Volume slider
  const volumeSlider = document.getElementById('volumeSlider');
  if (volumeSlider) {
    volumeSlider.addEventListener('input', updateVolumeLabel);
  }

  // Dark mode toggle
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', (e) => {
      Theme.isDark = e.target.checked;
      Theme.apply();
    });
  }

  // Save preferences button
  const savePreferencesBtn = document.getElementById('savePreferencesBtn');
  if (savePreferencesBtn) {
    savePreferencesBtn.addEventListener('click', savePreferences);
  }

  // Clear history button
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', clearListeningHistory);
  }

  // Delete account button
  const deleteAccountBtn = document.getElementById('deleteAccountBtn');
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', deleteAccount);
  }

  // Close modal on background click
  const confirmModal = document.getElementById('confirmModal');
  if (confirmModal) {
    confirmModal.addEventListener('click', (e) => {
      if (e.target === confirmModal) {
        confirmModal.style.display = 'none';
      }
    });

    document.getElementById('confirmNoBtn').addEventListener('click', () => {
      confirmModal.style.display = 'none';
    });
  }
}
