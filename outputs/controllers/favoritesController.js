/**
 * Favorites Controller
 * Handles all business logic for user favorites
 * MVC Pattern: Controller Layer
 */

import FavoritesModel from '../models/favoritesModel.js';
import AudioModel from '../models/audioModel.js';

class FavoritesController {
  /**
   * Get all favorites for authenticated user
   * Request: GET /api/favorites
   * Requires: req.session.userId
   */
  static async getUserFavorites(req, res) {
    try {
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      const favorites = await FavoritesModel.getUserFavorites(userId);

      res.json({
        success: true,
        data: favorites,
        count: favorites.length
      });
    } catch (error) {
      console.error('Error in getUserFavorites:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch favorites',
        message: error.message
      });
    }
  }

  /**
   * Check if audio is favorited
   * Request: GET /api/favorites/check/:audioId
   * Requires: req.session.userId
   */
  static async checkFavorite(req, res) {
    try {
      const userId = req.session.userId;
      const { audioId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      if (!audioId) {
        return res.status(400).json({
          success: false,
          error: 'Audio ID is required'
        });
      }

      const isFavorited = await FavoritesModel.isFavorited(userId, audioId);

      res.json({
        success: true,
        audioId,
        isFavorited
      });
    } catch (error) {
      console.error('Error in checkFavorite:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check favorite status',
        message: error.message
      });
    }
  }

  /**
   * Add audio to favorites
   * Request: POST /api/favorites
   * Body: { audioId }
   * Requires: req.session.userId
   */
  static async addFavorite(req, res) {
    try {
      const userId = req.session.userId;
      const { audioId } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      if (!audioId) {
        return res.status(400).json({
          success: false,
          error: 'Audio ID is required'
        });
      }

      // Verify audio exists
      const audio = await AudioModel.getAudioById(audioId);
      if (!audio) {
        return res.status(404).json({
          success: false,
          error: 'Audio not found'
        });
      }

      const favorite = await FavoritesModel.addFavorite(userId, audioId);

      res.status(201).json({
        success: true,
        message: 'Added to favorites',
        data: favorite
      });
    } catch (error) {
      console.error('Error in addFavorite:', error);

      // Check if duplicate error
      if (error.message.includes('already in favorites')) {
        return res.status(409).json({
          success: false,
          error: 'Already in favorites'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to add favorite',
        message: error.message
      });
    }
  }

  /**
   * Remove audio from favorites
   * Request: DELETE /api/favorites/:audioId
   * Requires: req.session.userId
   */
  static async removeFavorite(req, res) {
    try {
      const userId = req.session.userId;
      const { audioId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      if (!audioId) {
        return res.status(400).json({
          success: false,
          error: 'Audio ID is required'
        });
      }

      const success = await FavoritesModel.removeFavorite(userId, audioId);

      res.json({
        success: true,
        message: 'Removed from favorites',
        audioId
      });
    } catch (error) {
      console.error('Error in removeFavorite:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove favorite',
        message: error.message
      });
    }
  }

  /**
   * Get favorite count for user
   * Request: GET /api/favorites/count
   * Requires: req.session.userId
   */
  static async getFavoriteCount(req, res) {
    try {
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      const count = await FavoritesModel.getFavoriteCount(userId);

      res.json({
        success: true,
        count
      });
    } catch (error) {
      console.error('Error in getFavoriteCount:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get favorite count',
        message: error.message
      });
    }
  }

  /**
   * Get most favorited audio (public)
   * Request: GET /api/favorites/trending?limit=10
   */
  static async getTrendingAudio(req, res) {
    try {
      const { limit = 10 } = req.query;

      const trending = await FavoritesModel.getMostFavorited(parseInt(limit));

      res.json({
        success: true,
        data: trending,
        count: trending.length
      });
    } catch (error) {
      console.error('Error in getTrendingAudio:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get trending audio',
        message: error.message
      });
    }
  }
}

export default FavoritesController;
