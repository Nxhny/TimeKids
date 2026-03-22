// models/userModel.js
// ─────────────────────────────────────────────────────────────────────────────
// Data access layer for user profiles and plan management.
// ─────────────────────────────────────────────────────────────────────────────
import { supabaseAdmin } from '../services/supabaseClient.js';

/** Get user profile from profiles table */
export async function getProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Upsert user profile (create or update) */
export async function upsertProfile(userId, fields) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert({ id: userId, ...fields, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Get user plan — 'free' or 'premium' */
export async function getUserPlan(userId) {
  const profile = await getProfile(userId);
  return profile?.plan || 'free';
}

/**
 * Plan limits:
 *   free    → 10 lullabies + 10 stories
 *   premium → unlimited
 */
export const PLAN_LIMITS = {
  free: { lullaby: 10, story: 10 },
  premium: { lullaby: Infinity, story: Infinity },
};
