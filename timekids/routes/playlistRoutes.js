// routes/playlistRoutes.js
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  listPlaylists, getPlaylist, createPlaylist,
  updatePlaylist, deletePlaylist, addTrack, removeTrack,
} from '../controllers/playlistController.js';

const router = Router();

router.use(requireAuth);

router.get('/',             listPlaylists);
router.get('/:id',          getPlaylist);
router.post('/',            createPlaylist);
router.put('/:id',          updatePlaylist);
router.delete('/:id',       deletePlaylist);
router.post('/:id/tracks',  addTrack);
router.delete('/:id/tracks/:audioId', removeTrack);

export default router;
