// models/playlistModel.js
// ─────────────────────────────────────────────────────────────────────────────
// Data access layer for playlists and playlist_items tables.
// ─────────────────────────────────────────────────────────────────────────────
import { supabaseAdmin } from '../services/supabaseClient.js';

// ── Read ───────────────────────────────────────────────────────────────────

/** Get all playlists owned by a user */
export async function getPlaylistsByUser(userId) {
  const { data, error } = await supabaseAdmin
    .from('playlists')
    .select('*, playlist_items(count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/** Get single playlist with all its tracks */
export async function getPlaylistById(id, userId) {
  const { data, error } = await supabaseAdmin
    .from('playlists')
    .select(`
      *,
      playlist_items (
        id, position,
        audio_content ( id, title, type, category, audio_url, description, duration, is_youtube )
      )
    `)
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw error;

  // Sort items by position
  if (data?.playlist_items) {
    data.playlist_items.sort((a, b) => a.position - b.position);
  }
  return data;
}

// ── Write ──────────────────────────────────────────────────────────────────

/** Create a playlist */
export async function createPlaylist(userId, { name, description }) {
  const { data, error } = await supabaseAdmin
    .from('playlists')
    .insert([{ user_id: userId, name, description: description || null }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Rename / update a playlist */
export async function updatePlaylist(id, userId, fields) {
  const { data, error } = await supabaseAdmin
    .from('playlists')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Delete a playlist (cascades playlist_items) */
export async function deletePlaylist(id, userId) {
  const { error } = await supabaseAdmin
    .from('playlists')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
}

/** Add a track to a playlist */
export async function addToPlaylist(playlistId, audioId, userId) {
  // Verify playlist belongs to user
  const { data: pl, error: plErr } = await supabaseAdmin
    .from('playlists')
    .select('id')
    .eq('id', playlistId)
    .eq('user_id', userId)
    .single();
  if (plErr) throw new Error('Playlist not found or access denied.');

  // Get current max position
  const { data: items } = await supabaseAdmin
    .from('playlist_items')
    .select('position')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: false })
    .limit(1);

  const nextPos = (items?.[0]?.position ?? -1) + 1;

  const { data, error } = await supabaseAdmin
    .from('playlist_items')
    .insert([{ playlist_id: playlistId, audio_id: audioId, position: nextPos }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Remove a track from a playlist */
export async function removeFromPlaylist(playlistId, audioId, userId) {
  // Verify ownership
  const { data: pl, error: plErr } = await supabaseAdmin
    .from('playlists')
    .select('id')
    .eq('id', playlistId)
    .eq('user_id', userId)
    .single();
  if (plErr) throw new Error('Playlist not found or access denied.');

  const { error } = await supabaseAdmin
    .from('playlist_items')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('audio_id', audioId);

  if (error) throw error;
  return true;
}
