// routes/adminRoutes.js
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import * as audioModel from '../models/audioModel.js';
import * as userModel from '../models/userModel.js';
import { supabaseAdmin } from '../services/supabaseClient.js';

const router = Router();

// All admin routes require auth + admin role
router.use(requireAuth, requireAdmin);

/** GET /api/admin/stats */
router.get('/stats', async (req, res) => {
  try {
    const [audio, favorites] = await Promise.all([
      supabaseAdmin.from('audio_content').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('favorites').select('id', { count: 'exact', head: true }),
    ]);

    const { count: userCount } = await supabaseAdmin.auth.admin.listUsers();

    return res.json({
      totalAudio: audio.count,
      totalFavorites: favorites.count,
      totalUsers: userCount,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/** GET /api/admin/users */
router.get('/users', async (req, res) => {
  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;
    return res.json({ users });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/** PUT /api/admin/users/:id/plan */
router.put('/users/:id/plan', async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['free', 'premium'].includes(plan)) {
      return res.status(400).json({ error: 'Plan must be "free" or "premium".' });
    }
    const profile = await userModel.upsertProfile(req.params.id, { plan });
    return res.json({ profile });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/** GET /api/admin/audio */
router.get('/audio', async (req, res) => {
  try {
    const audio = await audioModel.getAllAudio({ limit: 200 });
    return res.json({ audio });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
