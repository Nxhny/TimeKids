// models/childModel.js
// ─────────────────────────────────────────────────────────────────────────────
// Child profiles: each user (parent) can have multiple child profiles.
// Each child gets their own favorites, avatar, and age-appropriate content.
// ─────────────────────────────────────────────────────────────────────────────
import { supabaseAdmin } from '../services/supabaseClient.js';

// ── Read ───────────────────────────────────────────────────────────────────

/** Get all child profiles belonging to a parent */
export async function getChildrenByUser(userId) {
  const { data, error } = await supabaseAdmin
    .from('child_profiles')
    .select('*')
    .eq('parent_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

/** Get a single child profile (verifies ownership) */
export async function getChildById(id, parentId) {
  const { data, error } = await supabaseAdmin
    .from('child_profiles')
    .select('*')
    .eq('id', id)
    .eq('parent_id', parentId)
    .single();

  if (error) throw error;
  return data;
}

// ── Write ──────────────────────────────────────────────────────────────────

/** Create a child profile */
export async function createChild(parentId, { name, age, avatar_emoji }) {
  const { data, error } = await supabaseAdmin
    .from('child_profiles')
    .insert([{
      parent_id:     parentId,
      name:          name.trim(),
      age:           age ? parseInt(age) : null,
      avatar_emoji:  avatar_emoji || '🌙',
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update a child profile */
export async function updateChild(id, parentId, fields) {
  const { data, error } = await supabaseAdmin
    .from('child_profiles')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('parent_id', parentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Delete a child profile */
export async function deleteChild(id, parentId) {
  const { error } = await supabaseAdmin
    .from('child_profiles')
    .delete()
    .eq('id', id)
    .eq('parent_id', parentId);

  if (error) throw error;
  return true;
}

// ── Recent plays ───────────────────────────────────────────────────────────

/** Save/update a listening event for a user (not per-child for simplicity) */
export async function upsertRecentPlay(userId, audioId, positionSec = 0) {
  const { data, error } = await supabaseAdmin
    .from('recent_plays')
    .upsert({
      user_id:    userId,
      audio_id:   audioId,
      position:   positionSec,
      played_at:  new Date().toISOString(),
    }, { onConflict: 'user_id,audio_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Get recent plays for a user, joined with audio_content */
export async function getRecentPlays(userId, limit = 8) {
  const { data, error } = await supabaseAdmin
    .from('recent_plays')
    .select(`
      id, position, played_at,
      audio_content ( id, title, type, category, audio_url, description, duration, is_youtube )
    `)
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
