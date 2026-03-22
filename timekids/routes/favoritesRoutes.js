// routes/favoritesRoutes.js
import { Router } from 'express';
import {
  listFavorites,
  listFavoriteIds,
  toggleFavorite,
  removeFavorite,
} from '../controllers/favoritesController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All favorites routes require auth
router.use(requireAuth);

router.get('/', listFavorites);
router.get('/ids', listFavoriteIds);
router.post('/:audioId', toggleFavorite);
router.delete('/:audioId', removeFavorite);

export default router;
