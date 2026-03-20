/**
 * Auth Routes
 * MVC Pattern: Routes connect HTTP requests to Controllers
 */

import express from 'express';
import AuthController from '../controllers/authController.js';

const router = express.Router();

// Public auth routes
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.getCurrentUser);
router.get('/status', AuthController.getAuthStatus);
router.post('/verify', AuthController.verifyEmail);

export default router;
