/**
 * Audio Routes
 * Public routes for audio content browsing
 * MVC Pattern: Routes connect HTTP requests to Controllers
 */

import express from 'express';
import AudioController from '../controllers/audioController.js';

const router = express.Router();

// Get all audio
router.get('/', AudioController.getAllAudio);

// Search audio
router.get('/search', AudioController.searchAudio);

// Get categories
router.get('/categories', AudioController.getCategories);

// Get by type (lullaby or story)
router.get('/type/:type', AudioController.getAudioByType);

// Get by category
router.get('/category/:category', AudioController.getAudioByCategory);

// Get specific audio by ID
router.get('/:id', AudioController.getAudioById);

export default router;
