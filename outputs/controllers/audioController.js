/**
 * Audio Controller
 * Handles all business logic for audio content
 * MVC Pattern: Controller Layer
 */

import AudioModel from '../models/audioModel.js';

class AudioController {
  /**
   * Get all audio with optional filters
   * Request: GET /api/audio?type=lullaby&category=Calm&search=quiet
   */
  static async getAllAudio(req, res) {
    try {
      const { type, category, search, limit = 20, offset = 0 } = req.query;

      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset),
        ...(type && { type }),
        ...(category && { category }),
        ...(search && { searchTerm: search })
      };

      const audio = await AudioModel.getAllAudio(options);

      res.json({
        success: true,
        data: audio,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          count: audio.length
        }
      });
    } catch (error) {
      console.error('Error in getAllAudio:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch audio content',
        message: error.message
      });
    }
  }

  /**
   * Get single audio by ID
   * Request: GET /api/audio/:id
   */
  static async getAudioById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Audio ID is required'
        });
      }

      const audio = await AudioModel.getAudioById(id);

      if (!audio) {
        return res.status(404).json({
          success: false,
          error: 'Audio not found'
        });
      }

      res.json({
        success: true,
        data: audio
      });
    } catch (error) {
      console.error('Error in getAudioById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch audio',
        message: error.message
      });
    }
  }

  /**
   * Get audio by type (lullaby or story)
   * Request: GET /api/audio/type/lullaby
   */
  static async getAudioByType(req, res) {
    try {
      const { type } = req.params;

      if (!['lullaby', 'story'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid type. Must be "lullaby" or "story"'
        });
      }

      const audio = await AudioModel.getAudioByType(type);

      res.json({
        success: true,
        type,
        data: audio,
        count: audio.length
      });
    } catch (error) {
      console.error('Error in getAudioByType:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch audio by type',
        message: error.message
      });
    }
  }

  /**
   * Get audio by category
   * Request: GET /api/audio/category/Calm
   */
  static async getAudioByCategory(req, res) {
    try {
      const { category } = req.params;

      if (!category) {
        return res.status(400).json({
          success: false,
          error: 'Category is required'
        });
      }

      const audio = await AudioModel.getAudioByCategory(category);

      res.json({
        success: true,
        category,
        data: audio,
        count: audio.length
      });
    } catch (error) {
      console.error('Error in getAudioByCategory:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch audio by category',
        message: error.message
      });
    }
  }

  /**
   * Get all available categories
   * Request: GET /api/audio/categories
   */
  static async getCategories(req, res) {
    try {
      const categories = await AudioModel.getCategories();

      res.json({
        success: true,
        data: categories,
        count: categories.length
      });
    } catch (error) {
      console.error('Error in getCategories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch categories',
        message: error.message
      });
    }
  }

  /**
   * Search audio
   * Request: GET /api/audio/search?q=rain&type=lullaby
   */
  static async searchAudio(req, res) {
    try {
      const { q, type, category } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Search query must be at least 2 characters'
        });
      }

      const results = await AudioModel.searchAudio(q, {
        ...(type && { type }),
        ...(category && { category })
      });

      res.json({
        success: true,
        query: q,
        filters: {
          type: type || null,
          category: category || null
        },
        data: results,
        count: results.length
      });
    } catch (error) {
      console.error('Error in searchAudio:', error);
      res.status(500).json({
        success: false,
        error: 'Search failed',
        message: error.message
      });
    }
  }
}

export default AudioController;
