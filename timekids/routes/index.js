// routes/index.js
// ─────────────────────────────────────────────────────────────────────────────
// Central router — mounts all route modules
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express';
import authRoutes from './authRoutes.js';
import audioRoutes from './audioRoutes.js';
import favoritesRoutes from './favoritesRoutes.js';
import adminRoutes from './adminRoutes.js';
import playlistRoutes from './playlistRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/audio', audioRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/playlists', playlistRoutes);
router.use('/admin', adminRoutes);

export default router;
