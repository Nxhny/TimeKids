/**
 * Admin Routes
 * Protected routes for administrative functions
 * Requires admin role
 * MVC Pattern: Routes connect HTTP requests to Controllers
 */

import express from 'express';
import AudioModel from '../models/audioModel.js';
import { uploadAudioFile, deleteAudioFile, getPublicUrl } from '../services/supabaseClient.js';

const router = express.Router();

// Admin authentication middleware
const requireAdmin = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  // In production, check user role from database
  // For now, checking if admin flag is set in session
  if (req.session.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  next();
};

// Apply admin middleware
router.use(requireAdmin);

/**
 * Create new audio content
 * POST /api/admin/audio
 * Body: { title, type, category, audio_url, description, duration }
 */
router.post('/audio', async (req, res) => {
  try {
    const { title, type, category, audio_url, description, duration } = req.body;

    // Validation
    if (!title || !type || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title, type, and category are required'
      });
    }

    if (!['lullaby', 'story'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be "lullaby" or "story"'
      });
    }

    const audio = await AudioModel.createAudio({
      title,
      type,
      category,
      audio_url,
      description,
      duration
    });

    res.status(201).json({
      success: true,
      message: 'Audio content created',
      data: audio
    });
  } catch (error) {
    console.error('Error creating audio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create audio content',
      message: error.message
    });
  }
});

/**
 * Update audio content
 * PUT /api/admin/audio/:id
 * Body: { title, type, category, description, duration }
 */
router.put('/audio/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Audio ID is required'
      });
    }

    // Validate type if provided
    if (updates.type && !['lullaby', 'story'].includes(updates.type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be "lullaby" or "story"'
      });
    }

    const audio = await AudioModel.updateAudio(id, updates);

    if (!audio) {
      return res.status(404).json({
        success: false,
        error: 'Audio not found'
      });
    }

    res.json({
      success: true,
      message: 'Audio content updated',
      data: audio
    });
  } catch (error) {
    console.error('Error updating audio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update audio content',
      message: error.message
    });
  }
});

/**
 * Delete audio content
 * DELETE /api/admin/audio/:id
 */
router.delete('/audio/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Audio ID is required'
      });
    }

    // Get audio to find file
    const audio = await AudioModel.getAudioById(id);
    if (!audio) {
      return res.status(404).json({
        success: false,
        error: 'Audio not found'
      });
    }

    // Delete from storage if URL exists
    if (audio.audio_url) {
      try {
        const filename = audio.audio_url.split('/').pop();
        await deleteAudioFile(filename);
      } catch (storageError) {
        console.error('Error deleting file from storage:', storageError);
      }
    }

    // Delete from database
    await AudioModel.deleteAudio(id);

    res.json({
      success: true,
      message: 'Audio content deleted'
    });
  } catch (error) {
    console.error('Error deleting audio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete audio content',
      message: error.message
    });
  }
});

/**
 * Upload audio file
 * POST /api/admin/upload
 * Requires: multipart/form-data with file field
 */
router.post('/upload', async (req, res) => {
  try {
    // This is a placeholder for multipart file handling
    // In production, use multer middleware for file uploads

    res.json({
      success: false,
      error: 'File upload requires multer middleware setup',
      note: 'Install multer: npm install multer'
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      message: error.message
    });
  }
});

/**
 * Get admin statistics
 * GET /api/admin/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const allAudio = await AudioModel.getAllAudio({ limit: 10000 });

    const stats = {
      totalAudio: allAudio.length,
      lullabies: allAudio.filter(a => a.type === 'lullaby').length,
      stories: allAudio.filter(a => a.type === 'story').length,
      categories: [...new Set(allAudio.map(a => a.category))].length
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

export default router;
