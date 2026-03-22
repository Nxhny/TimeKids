// controllers/childController.js
// ─────────────────────────────────────────────────────────────────────────────
// Child profile management + recently played history.
// ─────────────────────────────────────────────────────────────────────────────
import * as childModel from '../models/childModel.js';

/** GET /api/children */
export async function listChildren(req, res) {
  try {
    const children = await childModel.getChildrenByUser(req.user.id);
    return res.json({ children });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/** GET /api/children/:id */
export async function getChild(req, res) {
  try {
    const child = await childModel.getChildById(req.params.id, req.user.id);
    if (!child) return res.status(404).json({ error: 'Child profile not found.' });
    return res.json({ child });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/** POST /api/children — body: { name, age, avatar_emoji } */
export async function createChild(req, res) {
  try {
    const { name, age, avatar_emoji } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required.' });
    const child = await childModel.createChild(req.user.id, { name, age, avatar_emoji });
    return res.status(201).json({ child });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/** PUT /api/children/:id */
export async function updateChild(req, res) {
  try {
    const { name, age, avatar_emoji } = req.body;
    const child = await childModel.updateChild(req.params.id, req.user.id, { name, age, avatar_emoji });
    return res.json({ child });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/** DELETE /api/children/:id */
export async function deleteChild(req, res) {
  try {
    await childModel.deleteChild(req.params.id, req.user.id);
    return res.json({ message: 'Child profile deleted.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ── Recently Played ────────────────────────────────────────────────────────

/** POST /api/children/recent — body: { audioId, position } */
export async function recordPlay(req, res) {
  try {
    const { audioId, position } = req.body;
    if (!audioId) return res.status(400).json({ error: 'audioId is required.' });
    const play = await childModel.upsertRecentPlay(req.user.id, audioId, position || 0);
    return res.json({ play });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/** GET /api/children/recent */
export async function getRecentPlays(req, res) {
  try {
    const plays = await childModel.getRecentPlays(req.user.id, 8);
    return res.json({ plays });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
