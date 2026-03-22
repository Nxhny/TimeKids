// controllers/playlistController.js
// ─────────────────────────────────────────────────────────────────────────────
// Playlist CRUD + track management.
// ─────────────────────────────────────────────────────────────────────────────
import * as playlistModel from '../models/playlistModel.js';

/** GET /api/playlists */
export async function listPlaylists(req, res) {
  try {
    const playlists = await playlistModel.getPlaylistsByUser(req.user.id);
    return res.json({ playlists });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/** GET /api/playlists/:id */
export async function getPlaylist(req, res) {
  try {
    const playlist = await playlistModel.getPlaylistById(req.params.id, req.user.id);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found.' });
    return res.json({ playlist });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/** POST /api/playlists — body: { name, description } */
export async function createPlaylist(req, res) {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Playlist name is required.' });
    const playlist = await playlistModel.createPlaylist(req.user.id, { name: name.trim(), description });
    return res.status(201).json({ playlist });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/** PUT /api/playlists/:id */
export async function updatePlaylist(req, res) {
  try {
    const { name, description } = req.body;
    const playlist = await playlistModel.updatePlaylist(req.params.id, req.user.id, { name, description });
    return res.json({ playlist });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/** DELETE /api/playlists/:id */
export async function deletePlaylist(req, res) {
  try {
    await playlistModel.deletePlaylist(req.params.id, req.user.id);
    return res.json({ message: 'Playlist deleted.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/** POST /api/playlists/:id/tracks — body: { audioId } */
export async function addTrack(req, res) {
  try {
    const { audioId } = req.body;
    if (!audioId) return res.status(400).json({ error: 'audioId is required.' });
    const item = await playlistModel.addToPlaylist(req.params.id, audioId, req.user.id);
    return res.status(201).json({ item, message: 'Track added to playlist.' });
  } catch (err) {
    return res.status(err.message.includes('denied') ? 403 : 500).json({ error: err.message });
  }
}

/** DELETE /api/playlists/:id/tracks/:audioId */
export async function removeTrack(req, res) {
  try {
    await playlistModel.removeFromPlaylist(req.params.id, req.params.audioId, req.user.id);
    return res.json({ message: 'Track removed from playlist.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
