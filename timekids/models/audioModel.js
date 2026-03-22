// models/audioModel.js
// ─────────────────────────────────────────────────────────────────────────────
// Data access layer for audio_content table.
// All DB interactions go through this model — controllers stay clean.
// ─────────────────────────────────────────────────────────────────────────────
import { supabase, supabaseAdmin } from '../services/supabaseClient.js';

// ── Read Operations ────────────────────────────────────────────────────────

/** Fetch all public audio content (lullabies + stories) */
export async function getAllAudio({ type, category, search, limit = 50, offset = 0 } = {}) {
  let query = supabase
    .from('audio_content')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) query = query.eq('type', type);
  if (category) query = query.eq('category', category);
  if (search) query = query.ilike('title', `%${search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/** Fetch single audio by ID */
export async function getAudioById(id) {
  const { data, error } = await supabase
    .from('audio_content')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/** Fetch all distinct categories */
export async function getCategories() {
  const { data, error } = await supabase
    .from('audio_content')
    .select('category')
    .order('category');

  if (error) throw error;
  // Return unique categories
  return [...new Set(data.map((d) => d.category))];
}

/** Fetch audio uploaded by a specific user */
export async function getAudioByUser(userId) {
  const { data, error } = await supabase
    .from('audio_content')
    .select('*')
    .eq('uploaded_by', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/** Count audio uploaded by user (for plan limits) */
export async function countUserAudio(userId, type) {
  let query = supabase
    .from('audio_content')
    .select('id', { count: 'exact', head: true })
    .eq('uploaded_by', userId);

  if (type) query = query.eq('type', type);

  const { count, error } = await query;
  if (error) throw error;
  return count;
}

// ── Write Operations ────────────────────────────────────────────────────────

/** Insert new audio content record */
export async function createAudio({ title, type, category, audio_url, description, duration, uploaded_by, is_youtube }) {
  const { data, error } = await supabaseAdmin
    .from('audio_content')
    .insert([{
      title,
      type,
      category,
      audio_url,
      description: description || null,
      duration: duration || null,
      uploaded_by: uploaded_by || null,
      is_youtube: is_youtube || false,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update audio content record */
export async function updateAudio(id, fields) {
  const { data, error } = await supabaseAdmin
    .from('audio_content')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Delete audio content record */
export async function deleteAudio(id) {
  const { error } = await supabaseAdmin
    .from('audio_content')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}
