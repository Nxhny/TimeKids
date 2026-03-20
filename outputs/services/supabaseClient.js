/**
 * Supabase Client Service
 * Handles all Supabase connections and configuration
 * This is the single source of truth for database and storage access
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY'
  );
}

/**
 * Main Supabase client for public operations
 * Uses anon key for browser-safe operations
 */
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * Admin Supabase client for server-side operations
 * Uses service key for administrative operations
 * Should only be used on backend, never exposed to client
 */
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

/**
 * Storage bucket names
 */
export const BUCKETS = {
  AUDIO_FILES: 'audio-files',
  AVATARS: 'avatars'
};

/**
 * Helper function to get signed URL for audio files
 * @param {string} path - File path in storage
 * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns {Promise<string>} - Signed URL
 */
export const getSignedAudioUrl = async (path, expiresIn = 3600) => {
  try {
    const { data } = await supabase.storage
      .from(BUCKETS.AUDIO_FILES)
      .createSignedUrl(path, expiresIn);
    return data?.signedUrl || null;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
};

/**
 * Helper function to get public URL for files
 * (if bucket has public access)
 * @param {string} bucket - Bucket name
 * @param {string} path - File path in storage
 * @returns {string} - Public URL
 */
export const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || null;
};

/**
 * Upload audio file to storage
 * @param {File} file - Audio file to upload
 * @param {string} filename - Filename to save as
 * @returns {Promise<object>} - Upload result
 */
export const uploadAudioFile = async (file, filename) => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKETS.AUDIO_FILES)
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error uploading audio file:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete audio file from storage
 * @param {string} filename - Filename to delete
 * @returns {Promise<object>} - Deletion result
 */
export const deleteAudioFile = async (filename) => {
  try {
    const { error } = await supabase.storage
      .from(BUCKETS.AUDIO_FILES)
      .remove([filename]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting audio file:', error);
    return { success: false, error: error.message };
  }
};

export default supabase;
