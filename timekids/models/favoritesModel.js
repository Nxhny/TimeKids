// models/favoritesModel.js
// ─────────────────────────────────────────────────────────────────────────────
// Data access layer for favorites table.
// RLS on this table ensures users can only access their own favorites.
// ─────────────────────────────────────────────────────────────────────────────
import { supabaseAdmin } from '../services/supabaseClient.js';

/** Get all favorites for a user, joined with audio_content details */
export async function getFavoritesByUser(userId) {
  const { data, error } = await supabaseAdmin
    .from('favorites')
    .select(`
      id,
      created_at,
      audio_content (
        id, title, type, category, audio_url,
        description, duration, is_youtube
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/** Check if a specific audio is favorited by user */
export async function isFavorited(userId, audioId) {
  const { data, error } = await supabaseAdmin
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('audio_id', audioId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

/** Add a favorite */
export async function addFavorite(userId, audioId) {
  // Prevent duplicates
  const exists = await isFavorited(userId, audioId);
  if (exists) return null;

  const { data, error } = await supabaseAdmin
    .from('favorites')
    .insert([{ user_id: userId, audio_id: audioId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Remove a favorite */
export async function removeFavorite(userId, audioId) {
  const { error } = await supabaseAdmin
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('audio_id', audioId);

  if (error) throw error;
  return true;
}

/** Get all favorite audio IDs for a user (for bulk UI state) */
export async function getFavoriteIds(userId) {
  const { data, error } = await supabaseAdmin
    .from('favorites')
    .select('audio_id')
    .eq('user_id', userId);

  if (error) throw error;
  return data.map((d) => d.audio_id);
}
