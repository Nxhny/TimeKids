/**
 * Favorites Routes
 * Protected routes requiring authentication
 * MVC Pattern: Routes connect HTTP requests to Controllers
 */

import express from 'express';
import FavoritesController from '../controllers/favoritesController.js';

const router = express.Router();

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  next();
};

// Apply auth middleware to all routes
router.use(requireAuth);

// Get user's favorites
router.get('/', FavoritesController.getUserFavorites);

// Get favorite count
router.get('/count', FavoritesController.getFavoriteCount);

// Check if audio is favorited
router.get('/check/:audioId', FavoritesController.checkFavorite);

// Add to favorites
router.post('/', FavoritesController.addFavorite);

// Remove from favorites
router.delete('/:audioId', FavoritesController.removeFavorite);

// Get trending (most favorited)
router.get('/trending', FavoritesController.getTrendingAudio);

export default router;
