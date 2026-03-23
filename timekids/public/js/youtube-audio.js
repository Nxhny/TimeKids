// public/js/youtube-audio.js
// ─────────────────────────────────────────────────────────────────────────────
// Module pour lire les vidéos YouTube en mode AUDIO SEUL (sans vidéo)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extraire l'ID YouTube d'une URL
 * @param {string} url - URL YouTube
 * @returns {string|null} - YouTube ID ou null
 */
export function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /\/embed\/([A-Za-z0-9_-]{11})/,
    /\/shorts\/([A-Za-z0-9_-]{11})/,
    /music\.youtube\.com.*[?&]v=([A-Za-z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const m = (url || '').trim().match(pattern);
    if (m) return m[1];
  }
  return null;
}

/**
 * Obtenir l'URL audio MP3 d'une vidéo YouTube
 * ⚠️ Note: YouTube embed n'est pas un fichier audio valide pour <audio>
 * Cette fonction retourne null si impossible (ce qui est la plupart du temps)
 * 
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<string|null>} - URL du fichier audio MP3 ou null
 */
export async function getYouTubeAudioUrl(videoId) {
  if (!videoId) throw new Error('Invalid YouTube ID');

  // ✅ NOTE IMPORTANTE :
  // YouTube n'expose pas directement les URLs audio extraites.
  // Même les APIs tierces (yt-dlp, etc.) ne fonctionnent pas
  // car YouTube bloque les accès non-autorisés.
  
  // Retourner null indique qu'on ne peut pas extraire l'audio
  // Le lecteur affichera un message et lien vers YouTube
  return null;
}

/**
 * Obtenir l'URL YouTube directe pour ouvrir dans YouTube
 * @param {string} videoId - YouTube video ID
 * @returns {string} - URL YouTube
 */
export function getYouTubeUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Vérifier si une vidéo YouTube peut être lue en audio
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<boolean>} - Toujours false (YouTube ne supporte pas)
 */
export async function testYouTubeAudioAvailability(videoId) {
  // ✅ Honnêtement : YouTube n'expose pas les audios directement
  // C'est une limitation technique de YouTube
  return false;
}

/**
 * Afficher un message à l'utilisateur et rediriger vers YouTube
 * @param {string} videoId - YouTube video ID
 * @param {string} title - Titre de la vidéo
 */
export function openYouTubeInNewTab(videoId, title = 'Video') {
  const url = getYouTubeUrl(videoId);
  const message = `Unable to extract audio from YouTube. Opening "${title}" on YouTube...`;
  console.warn('[youtube-audio]', message);
  
  // Ouvrir YouTube dans un nouvel onglet
  window.open(url, '_blank');
}

export default {
  extractYouTubeId,
  getYouTubeAudioUrl,
  getYouTubeUrl,
  testYouTubeAudioAvailability,
  openYouTubeInNewTab,
};
