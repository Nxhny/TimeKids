/**
 * Admin Panel Script
 * Handles content management and statistics
 */

let currentPanel = 'dashboard';
let allContent = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  if (!Auth.isAuthenticated) {
    window.location.href = '/login';
    return;
  }

  await loadDashboardStats();
  await loadContent();
  setupEventListeners();
});

/**
 * Switch to different panel
 */
function switchPanel(panelName) {
  currentPanel = panelName;

  // Update menu
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`[data-panel="${panelName}"]`).classList.add('active');

  // Update content
  document.querySelectorAll('.admin-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  document.getElementById(panelName + 'Panel').classList.add('active');
}

/**
 * Load dashboard statistics
 */
async function loadDashboardStats() {
  try {
    const data = await API.request('/admin/stats');
    const stats = data.data;

    document.getElementById('totalAudio').textContent = stats.totalAudio;
    document.getElementById('totalLullabies').textContent = stats.lullabies;
    document.getElementById('totalStories').textContent = stats.stories;
    document.getElementById('totalCategories').textContent = stats.categories;
  } catch (error) {
    console.error('Error loading stats:', error);
    UI.toast('Failed to load statistics', 'error');
  }
}

/**
 * Load all audio content
 */
async function loadContent() {
  try {
    const data = await API.audio.getAll({ limit: 1000 });
    allContent = data.data || [];
    displayContent();
  } catch (error) {
    console.error('Error loading content:', error);
    UI.toast('Failed to load content', 'error');
  }
}

/**
 * Display content in table
 */
function displayContent() {
  const contentList = document.getElementById('contentList');
  const type = document.getElementById('contentType').value;
  const search = document.getElementById('contentSearch').value.toLowerCase();

  let filtered = allContent;

  if (type) {
    filtered = filtered.filter(item => item.type === type);
  }

  if (search) {
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search)
    );
  }

  if (filtered.length === 0) {
    contentList.innerHTML = '<p class="empty-message">No content found</p>';
    return;
  }

  contentList.innerHTML = '';

  filtered.forEach(audio => {
    const row = document.createElement('div');
    row.className = 'table-row';
    row.innerHTML = `
      <div class="col col-title">${audio.title}</div>
      <div class="col col-type">${audio.type}</div>
      <div class="col col-category">${audio.category}</div>
      <div class="col col-actions">
        <div class="table-actions">
          <button class="action-btn" onclick="editContent('${audio.id}')">✏️ Edit</button>
          <button class="action-btn danger" onclick="deleteContent('${audio.id}')">🗑️ Delete</button>
        </div>
      </div>
    `;
    contentList.appendChild(row);
  });
}

/**
 * Edit audio content
 */
async function editContent(audioId) {
  try {
    const audio = allContent.find(a => a.id === audioId);
    if (!audio) return;

    // Populate form
    document.getElementById('editTitle').value = audio.title;
    document.getElementById('editType').value = audio.type;
    document.getElementById('editCategory').value = audio.category;
    document.getElementById('editDescription').value = audio.description || '';

    // Show modal
    const modal = document.getElementById('editModal');
    modal.style.display = 'flex';

    // Handle form submission
    document.getElementById('editForm').onsubmit = async (e) => {
      e.preventDefault();

      try {
        const updates = {
          title: document.getElementById('editTitle').value,
          type: document.getElementById('editType').value,
          category: document.getElementById('editCategory').value,
          description: document.getElementById('editDescription').value
        };

        await API.request(`/admin/audio/${audioId}`, {
          method: 'PUT',
          body: JSON.stringify(updates)
        });

        modal.style.display = 'none';
        await loadContent();
        UI.toast('Content updated successfully', 'success');
      } catch (error) {
        console.error('Error updating content:', error);
        UI.toast('Failed to update content', 'error');
      }
    };
  } catch (error) {
    console.error('Error editing content:', error);
    UI.toast('Failed to load content for editing', 'error');
  }
}

/**
 * Delete audio content
 */
async function deleteContent(audioId) {
  if (!confirm('Are you sure you want to delete this content?')) {
    return;
  }

  try {
    await API.request(`/admin/audio/${audioId}`, {
      method: 'DELETE'
    });

    await loadContent();
    UI.toast('Content deleted successfully', 'success');
  } catch (error) {
    console.error('Error deleting content:', error);
    UI.toast('Failed to delete content', 'error');
  }
}

/**
 * Handle file input
 */
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    document.getElementById('fileName').textContent = file.name;
  }
}

/**
 * Handle form upload
 */
async function handleUploadSubmit(event) {
  event.preventDefault();

  const title = document.getElementById('uploadTitle').value;
  const type = document.getElementById('uploadType').value;
  const category = document.getElementById('uploadCategory').value;
  const description = document.getElementById('uploadDescription').value;
  const duration = document.getElementById('uploadDuration').value;
  const audioUrl = document.getElementById('uploadURL').value;

  if (!title || !type || !category) {
    UI.toast('Please fill in all required fields', 'warning');
    return;
  }

  try {
    const buttonText = document.getElementById('uploadButtonText');
    const spinner = document.getElementById('uploadSpinner');
    const submitBtn = event.target.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    buttonText.style.display = 'none';
    spinner.style.display = 'inline-block';

    const audioData = {
      title,
      type,
      category,
      description,
      duration: duration ? parseInt(duration) : null,
      audio_url: audioUrl || 'https://example.com/audio.mp3'
    };

    await API.request('/admin/audio', {
      method: 'POST',
      body: JSON.stringify(audioData)
    });

    // Reset form
    document.getElementById('uploadForm').reset();
    document.getElementById('fileName').textContent = 'No file selected';

    submitBtn.disabled = false;
    buttonText.style.display = 'inline';
    spinner.style.display = 'none';

    UI.toast('Content uploaded successfully', 'success');
    await loadDashboardStats();
    await loadContent();
    switchPanel('dashboard');
  } catch (error) {
    console.error('Error uploading content:', error);
    UI.toast('Failed to upload content', 'error');

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const buttonText = document.getElementById('uploadButtonText');
    const spinner = document.getElementById('uploadSpinner');

    submitBtn.disabled = false;
    buttonText.style.display = 'inline';
    spinner.style.display = 'none';
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Panel switching
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      switchPanel(item.dataset.panel);
    });
  });

  // Content filters
  const contentSearch = document.getElementById('contentSearch');
  const contentType = document.getElementById('contentType');

  if (contentSearch) {
    contentSearch.addEventListener('input', displayContent);
  }

  if (contentType) {
    contentType.addEventListener('change', displayContent);
  }

  // File input
  const fileInput = document.getElementById('uploadFile');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);
  }

  // Upload form
  const uploadForm = document.getElementById('uploadForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', handleUploadSubmit);
  }

  // Edit modal close
  const closeEditModal = document.getElementById('closeEditModal');
  if (closeEditModal) {
    closeEditModal.addEventListener('click', () => {
      document.getElementById('editModal').style.display = 'none';
    });
  }

  // Modal background click
  document.getElementById('editModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('editModal')) {
      document.getElementById('editModal').style.display = 'none';
    }
  });

  // Set initial panel
  switchPanel('dashboard');
}
