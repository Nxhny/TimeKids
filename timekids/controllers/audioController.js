// controllers/audioController.js
// ─────────────────────────────────────────────────────────────────────────────
// Business logic for audio content: list, get, create (YouTube / upload), delete.
// Enforces free plan limits: 10 lullabies + 10 stories per user.
// ─────────────────────────────────────────────────────────────────────────────
import * as audioModel from '../models/audioModel.js';
import * as userModel from '../models/userModel.js';
import { supabaseAdmin } from '../services/supabaseClient.js';

/** GET /api/audio — list all public audio with optional filters */
export async function listAudio(req, res) {
  try {
    const { type, category, search, limit, offset } = req.query;
    const audio = await audioModel.getAllAudio({
      type,
      category,
      search,
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
    });
    return res.json({ audio });
  } catch (err) {
    console.error('[audioController.listAudio]', err);
    return res.status(500).json({ error: 'Failed to fetch audio content.' });
  }
}

/** GET /api/audio/categories — get distinct categories */
export async function getCategories(req, res) {
  try {
    const categories = await audioModel.getCategories();
    return res.json({ categories });
  } catch (err) {
    console.error('[audioController.getCategories]', err);
    return res.status(500).json({ error: 'Failed to fetch categories.' });
  }
}

/** GET /api/audio/:id — get single audio */
export async function getAudio(req, res) {
  try {
    const audio = await audioModel.getAudioById(req.params.id);
    if (!audio) return res.status(404).json({ error: 'Audio not found.' });
    return res.json({ audio });
  } catch (err) {
    console.error('[audioController.getAudio]', err);
    return res.status(500).json({ error: 'Failed to fetch audio.' });
  }
}

/** GET /api/audio/my — list audio uploaded by current user */
export async function listMyAudio(req, res) {
  try {
    const userId = req.user.id;
    const audio = await audioModel.getAudioByUser(userId);

    // Include usage counts
    const lullabyCount = await audioModel.countUserAudio(userId, 'lullaby');
    const storyCount = await audioModel.countUserAudio(userId, 'story');
    const plan = await userModel.getUserPlan(userId);
    const limits = userModel.PLAN_LIMITS[plan];

    return res.json({
      audio,
      usage: {
        lullaby: { used: lullabyCount, limit: limits.lullaby },
        story: { used: storyCount, limit: limits.story },
        plan,
      },
    });
  } catch (err) {
    console.error('[audioController.listMyAudio]', err);
    return res.status(500).json({ error: 'Failed to fetch your audio.' });
  }
}

/**
 * POST /api/audio/youtube
 * Add a YouTube-sourced track (stores YouTube ID, no file upload)
 * Body: { title, type, category, youtube_url, description }
 */
export async function addYouTubeAudio(req, res) {
  try {
    const userId = req.user.id;
    const { title, type, category, youtube_url, description } = req.body;

    // Validate required fields
    if (!title || !type || !category || !youtube_url) {
      return res.status(400).json({ error: 'title, type, category, and youtube_url are required.' });
    }
    if (!['lullaby', 'story'].includes(type)) {
      return res.status(400).json({ error: 'type must be "lullaby" or "story".' });
    }

    // Extract YouTube video ID
    const ytId = extractYouTubeId(youtube_url);
    if (!ytId) {
      return res.status(400).json({ error: 'Invalid YouTube URL. Accepted formats: youtu.be/ID or youtube.com/watch?v=ID' });
    }

    // Enforce plan limits
    const plan = await userModel.getUserPlan(userId);
    const limits = userModel.PLAN_LIMITS[plan];
    const currentCount = await audioModel.countUserAudio(userId, type);

    if (currentCount >= limits[type]) {
      return res.status(403).json({
        error: `Free plan limit reached. You can only add ${limits[type]} ${type === 'lullaby' ? 'lullabies' : 'stories'}.`,
        upgrade: true,
      });
    }

    // Store YouTube embed URL
    const audio_url = `https://www.youtube.com/embed/${ytId}`;

    const audio = await audioModel.createAudio({
      title: title.trim(),
      type,
      category: category.trim(),
      audio_url,
      description: description?.trim() || null,
      uploaded_by: userId,
      is_youtube: true,
    });

    return res.status(201).json({ message: 'Track added successfully!', audio });
  } catch (err) {
    console.error('[audioController.addYouTubeAudio]', err);
    return res.status(500).json({ error: 'Failed to add YouTube audio.' });
  }
}

/**
 * POST /api/audio/upload
 * Upload an MP3 directly to Supabase Storage (within plan limits)
 */
export async function uploadAudio(req, res) {
  try {
    const userId = req.user.id;
    const { title, type, category, description } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No audio file provided.' });
    if (!title || !type || !category) {
      return res.status(400).json({ error: 'title, type, and category are required.' });
    }
    if (!['lullaby', 'story'].includes(type)) {
      return res.status(400).json({ error: 'type must be "lullaby" or "story".' });
    }

    // Enforce plan limits
    const plan = await userModel.getUserPlan(userId);
    const limits = userModel.PLAN_LIMITS[plan];
    const currentCount = await audioModel.countUserAudio(userId, type);

    if (currentCount >= limits[type]) {
      return res.status(403).json({
        error: `Free plan limit reached. You can only add ${limits[type]} ${type === 'lullaby' ? 'lullabies' : 'stories'}.`,
        upgrade: true,
      });
    }

    // Upload to Supabase Storage
    const filename = `${userId}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('audio-files')
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('audio-files')
      .getPublicUrl(filename);

    const audio = await audioModel.createAudio({
      title: title.trim(),
      type,
      category: category.trim(),
      audio_url: urlData.publicUrl,
      description: description?.trim() || null,
      uploaded_by: userId,
      is_youtube: false,
    });

    return res.status(201).json({ message: 'Audio uploaded successfully!', audio });
  } catch (err) {
    console.error('[audioController.uploadAudio]', err);
    return res.status(500).json({ error: 'Failed to upload audio.' });
  }
}

/** DELETE /api/audio/:id */
export async function deleteAudio(req, res) {
  try {
    const userId = req.user.id;
    const audio = await audioModel.getAudioById(req.params.id);

    if (!audio) return res.status(404).json({ error: 'Audio not found.' });

    // Only uploader or admin can delete
    const profile = await userModel.getProfile(userId);
    if (audio.uploaded_by !== userId && !profile?.is_admin) {
      return res.status(403).json({ error: 'Not authorized to delete this track.' });
    }

    await audioModel.deleteAudio(req.params.id);
    return res.json({ message: 'Audio deleted successfully.' });
  } catch (err) {
    console.error('[audioController.deleteAudio]', err);
    return res.status(500).json({ error: 'Failed to delete audio.' });
  }
}

/** PUT /api/audio/:id (admin only) */
export async function updateAudio(req, res) {
  try {
    const audio = await audioModel.updateAudio(req.params.id, req.body);
    return res.json({ message: 'Audio updated.', audio });
  } catch (err) {
    console.error('[audioController.updateAudio]', err);
    return res.status(500).json({ error: 'Failed to update audio.' });
  }
}

// ── Helper ─────────────────────────────────────────────────────────────────

/** Extract YouTube video ID from various URL formats */
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
