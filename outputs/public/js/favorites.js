/**
 * Favorites Page Script
 * Handles loading, displaying, and managing user's favorite content
 */

let currentFilter = 'all';
let favoritesList = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  if (!Auth.isAuthenticated) {
    window.location.href = '/login';
    return;
  }

  await loadFavorites();
  setupEventListeners();
});

/**
 * Load user favorites from API
 */
async function loadFavorites() {
  try {
    UI.showLoading(document.getElementById('favoritesGrid'));

    const data = await API.favorites.getAll();
    favoritesList = data.data || [];

    updateFavoriteCount();
    displayFavorites();
  } catch (error) {
    console.error('Error loading favorites:', error);
    UI.toast('Failed to load favorites', 'error');
  }
}

/**
 * Display favorites based on current filter
 */
function displayFavorites() {
  const grid = document.getElementById('favoritesGrid');
  const emptyState = document.getElementById('emptyState');

  // Filter by type
  let filtered = favoritesList;
  if (currentFilter !== 'all') {
    filtered = favoritesList.filter(fav => 
      fav.audio_content?.type === currentFilter
    );
  }

  // Show/hide empty state
  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  grid.innerHTML = '';

  // Create cards
  filtered.forEach(favorite => {
    const audio = favorite.audio_content;
    if (audio) {
      const card = UI.createAudioCard(audio, true);
      
      // Add event listeners
      card.querySelector('.audio-play-btn').addEventListener('click', () => {
        AudioPlayer.play(audio);
      });

      card.querySelector('.audio-favorite-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        removeFavorite(audio.id, card);
      });

      grid.appendChild(card);
    }
  });
}

/**
 * Update favorite count display
 */
function updateFavoriteCount() {
  const countEl = document.getElementById('favoriteCount');
  const count = favoritesList.length;
  countEl.textContent = `${count} item${count !== 1 ? 's' : ''} saved`;
}

/**
 * Remove favorite with confirmation
 */
async function removeFavorite(audioId, cardElement) {
  const modal = document.getElementById('confirmModal');
  const confirmYes = document.getElementById('confirmYesBtn');
  const confirmNo = document.getElementById('confirmNoBtn');

  modal.style.display = 'flex';

  confirmYes.onclick = async () => {
    modal.style.display = 'none';
    await performRemoveFavorite(audioId, cardElement);
  };

  confirmNo.onclick = () => {
    modal.style.display = 'none';
  };
}

/**
 * Actually remove favorite from database
 */
async function performRemoveFavorite(audioId, cardElement) {
  try {
    await API.favorites.remove(audioId);
    
    // Remove from list
    favoritesList = favoritesList.filter(fav => fav.audio_id !== audioId);
    
    // Animate removal
    cardElement.style.opacity = '0';
    cardElement.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
      displayFavorites();
      updateFavoriteCount();
      UI.toast('Removed from favorites', 'success');
    }, 300);
  } catch (error) {
    console.error('Error removing favorite:', error);
    UI.toast('Failed to remove favorite', 'error');
  }
}

/**
 * Clear all favorites
 */
async function clearAllFavorites() {
  if (!confirm('Are you sure you want to remove all favorites? This cannot be undone.')) {
    return;
  }

  try {
    // Remove each favorite
    for (const fav of favoritesList) {
      await API.favorites.remove(fav.audio_id);
    }

    favoritesList = [];
    displayFavorites();
    updateFavoriteCount();
    UI.toast('All favorites cleared', 'success');
  } catch (error) {
    console.error('Error clearing favorites:', error);
    UI.toast('Failed to clear favorites', 'error');
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Filter tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      displayFavorites();
    });
  });

  // Clear all button
  const clearAllBtn = document.getElementById('clearAllBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', clearAllFavorites);
  }

  // Close modal
  const confirmModal = document.getElementById('confirmModal');
  if (confirmModal) {
    confirmModal.addEventListener('click', (e) => {
      if (e.target === confirmModal) {
        confirmModal.style.display = 'none';
      }
    });
  }
}
