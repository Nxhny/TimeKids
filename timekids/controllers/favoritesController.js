// controllers/favoritesController.js
// ─────────────────────────────────────────────────────────────────────────────
// Manages user favorites (add, remove, list).
// All routes require authentication.
// ─────────────────────────────────────────────────────────────────────────────
import * as favoritesModel from '../models/favoritesModel.js';

/** GET /api/favorites — list current user's favorites */
export async function listFavorites(req, res) {
  try {
    const favorites = await favoritesModel.getFavoritesByUser(req.user.id);
    return res.json({ favorites });
  } catch (err) {
    console.error('[favoritesController.listFavorites]', err);
    return res.status(500).json({ error: 'Failed to fetch favorites.' });
  }
}

/** GET /api/favorites/ids — list just the IDs (for UI state) */
export async function listFavoriteIds(req, res) {
  try {
    const ids = await favoritesModel.getFavoriteIds(req.user.id);
    return res.json({ ids });
  } catch (err) {
    console.error('[favoritesController.listFavoriteIds]', err);
    return res.status(500).json({ error: 'Failed to fetch favorite IDs.' });
  }
}

/** POST /api/favorites/:audioId — toggle favorite */
export async function toggleFavorite(req, res) {
  try {
    const { audioId } = req.params;
    const userId = req.user.id;

    const isFav = await favoritesModel.isFavorited(userId, audioId);

    if (isFav) {
      await favoritesModel.removeFavorite(userId, audioId);
      return res.json({ favorited: false, message: 'Removed from favorites.' });
    } else {
      await favoritesModel.addFavorite(userId, audioId);
      return res.json({ favorited: true, message: 'Added to favorites!' });
    }
  } catch (err) {
    console.error('[favoritesController.toggleFavorite]', err);
    return res.status(500).json({ error: 'Failed to update favorites.' });
  }
}

/** DELETE /api/favorites/:audioId — explicitly remove */
export async function removeFavorite(req, res) {
  try {
    await favoritesModel.removeFavorite(req.user.id, req.params.audioId);
    return res.json({ message: 'Removed from favorites.' });
  } catch (err) {
    console.error('[favoritesController.removeFavorite]', err);
    return res.status(500).json({ error: 'Failed to remove favorite.' });
  }
}
