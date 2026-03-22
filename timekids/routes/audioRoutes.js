// routes/audioRoutes.js
import { Router } from 'express';
import multer from 'multer';
import {
  listAudio,
  getCategories,
  getAudio,
  listMyAudio,
  addYouTubeAudio,
  uploadAudio,
  deleteAudio,
  updateAudio,
} from '../controllers/audioController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Multer for in-memory file uploads (max 20 MB per file)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith('audio/')) cb(null, true);
    else cb(new Error('Only audio files are allowed.'));
  },
});

// Public routes
router.get('/', listAudio);
router.get('/categories', getCategories);
router.get('/:id', getAudio);

// Authenticated routes
router.get('/user/my', requireAuth, listMyAudio);
router.post('/youtube', requireAuth, addYouTubeAudio);
router.post('/upload', requireAuth, upload.single('audio'), uploadAudio);
router.delete('/:id', requireAuth, deleteAudio);
router.put('/:id', requireAuth, updateAudio);

export default router;
