/**
 * User Routes
 * Protected routes for user profile and preferences
 * MVC Pattern: Routes connect HTTP requests to Controllers
 */

import express from 'express';

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

/**
 * Get user profile
 * GET /api/user/profile
 */
router.get('/profile', (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.session.userId,
        email: req.session.userEmail,
        name: req.session.userName
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

/**
 * Update user preferences
 * POST /api/user/preferences
 * Body: { darkMode, soundEnabled, volume }
 */
router.post('/preferences', (req, res) => {
  try {
    const { darkMode, soundEnabled, volume } = req.body;

    // Store in session (in production, would store in database)
    req.session.preferences = {
      darkMode: darkMode ?? true,
      soundEnabled: soundEnabled ?? true,
      volume: Math.min(100, Math.max(0, volume ?? 70))
    };

    res.json({
      success: true,
      message: 'Preferences updated',
      preferences: req.session.preferences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences'
    });
  }
});

/**
 * Get user preferences
 * GET /api/user/preferences
 */
router.get('/preferences', (req, res) => {
  try {
    const preferences = req.session.preferences || {
      darkMode: true,
      soundEnabled: true,
      volume: 70
    };

    res.json({
      success: true,
      preferences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch preferences'
    });
  }
});

/**
 * Update listening history
 * POST /api/user/history
 * Body: { audioId, timestamp }
 */
router.post('/history', (req, res) => {
  try {
    const { audioId, timestamp } = req.body;

    if (!audioId) {
      return res.status(400).json({
        success: false,
        error: 'Audio ID is required'
      });
    }

    // Initialize history array if not exists
    if (!req.session.listeningHistory) {
      req.session.listeningHistory = [];
    }

    // Add to history (keep last 50)
    req.session.listeningHistory.unshift({
      audioId,
      timestamp: timestamp || new Date().toISOString()
    });
    req.session.listeningHistory = req.session.listeningHistory.slice(0, 50);

    res.json({
      success: true,
      message: 'History updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update history'
    });
  }
});

/**
 * Get listening history
 * GET /api/user/history
 */
router.get('/history', (req, res) => {
  try {
    const history = req.session.listeningHistory || [];

    res.json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch history'
    });
  }
});

export default router;
