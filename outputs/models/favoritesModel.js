/**
 * Favorites Model
 * Handles all database queries for user favorites
 * MVC Pattern: Data Layer
 */

import { supabase } from '../services/supabaseClient.js';

class FavoritesModel {
  /**
   * Get all favorites for a user
   * @param {string} userId - User ID
   * @returns {Promise<array>} - User's favorite audio items
   */
  static async getUserFavorites(userId) {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          audio_id,
          created_at,
          audio_content (
            id,
            title,
            type,
            category,
            audio_url,
            description,
            duration
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      throw error;
    }
  }

  /**
   * Check if audio is favorited by user
   * @param {string} userId - User ID
   * @param {string} audioId - Audio content ID
   * @returns {Promise<boolean>} - Whether audio is favorited
   */
  static async isFavorited(userId, audioId) {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('audio_id', audioId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return !!data;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      throw error;
    }
  }

  /**
   * Add audio to favorites
   * @param {string} userId - User ID
   * @param {string} audioId - Audio content ID
   * @returns {Promise<object>} - Created favorite record
   */
  static async addFavorite(userId, audioId) {
    try {
      // Check if already favorited
      const isFav = await this.isFavorited(userId, audioId);
      if (isFav) {
        throw new Error('Already in favorites');
      }

      const { data, error } = await supabase
        .from('favorites')
        .insert([{
          user_id: userId,
          audio_id: audioId,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  }

  /**
   * Remove audio from favorites
   * @param {string} userId - User ID
   * @param {string} audioId - Audio content ID
   * @returns {Promise<boolean>} - Success status
   */
  static async removeFavorite(userId, audioId) {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('audio_id', audioId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  }

  /**
   * Remove all favorites for a user
   * (useful for account deletion)
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Success status
   */
  static async clearAllFavorites(userId) {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error clearing favorites:', error);
      throw error;
    }
  }

  /**
   * Get favorite count for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} - Number of favorites
   */
  static async getFavoriteCount(userId) {
    try {
      const { count, error } = await supabase
        .from('favorites')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting favorite count:', error);
      throw error;
    }
  }

  /**
   * Get most favorited audio items (for recommendations)
   * @param {number} limit - Number of items to return
   * @returns {Promise<array>} - Most favorited audio items
   */
  static async getMostFavorited(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          audio_id,
          audio_content (
            id,
            title,
            type,
            category,
            audio_url
          )
        `)
        .limit(1000); // Get all to process

      if (error) throw error;

      // Count occurrences and sort
      const counts = {};
      data?.forEach(fav => {
        if (fav.audio_id) {
          counts[fav.audio_id] = (counts[fav.audio_id] || 0) + 1;
        }
      });

      // Get top items
      const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);

      return sorted.map(([audioId, count]) => ({
        audioId,
        favoriteCount: count
      }));
    } catch (error) {
      console.error('Error getting most favorited:', error);
      throw error;
    }
  }
}

export default FavoritesModel;
