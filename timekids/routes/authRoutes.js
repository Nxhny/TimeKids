// routes/authRoutes.js
import { Router } from 'express';
import {
  signup, login, logout, getMe,
  forgotPassword, resetPassword,
  updateProfile, deleteAccount,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/signup',           signup);
router.post('/login',            login);
router.post('/logout',           logout);
router.get ('/me',               requireAuth, getMe);
router.post('/forgot-password',  forgotPassword);
router.post('/reset-password',   resetPassword);
router.put ('/profile',          requireAuth, updateProfile);
router.delete('/account',        requireAuth, deleteAccount);

export default router;
