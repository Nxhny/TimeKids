// routes/childRoutes.js
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  listChildren, getChild, createChild,
  updateChild, deleteChild,
  recordPlay, getRecentPlays,
} from '../controllers/childController.js';

const router = Router();
router.use(requireAuth);

// Child profiles
router.get('/',         listChildren);
router.get('/recent',   getRecentPlays);
router.post('/recent',  recordPlay);
router.get('/:id',      getChild);
router.post('/',        createChild);
router.put('/:id',      updateChild);
router.delete('/:id',   deleteChild);

export default router;
