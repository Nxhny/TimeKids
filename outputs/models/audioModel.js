/**
 * Audio Content Model
 * Handles all database queries for audio content (lullabies and stories)
 * MVC Pattern: Data Layer
 */

import { supabase } from '../services/supabaseClient.js';

class AudioModel {
  /**
   * Get all audio content with optional filtering
   * @param {object} options - Filter options
   * @returns {Promise<array>} - Audio content records
   */
  static async getAllAudio(options = {}) {
    try {
      let query = supabase
        .from('audio_content')
        .select('*');

      // Apply filters
      if (options.type) {
        query = query.eq('type', options.type); // 'lullaby' or 'story'
      }

      if (options.category) {
        query = query.eq('category', options.category);
      }

      if (options.searchTerm) {
        query = query.ilike('title', `%${options.searchTerm}%`);
      }

      // Add sorting
      query = query.order('created_at', { ascending: false });

      // Add pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching audio content:', error);
      throw error;
    }
  }

  /**
   * Get single audio content by ID
   * @param {string} id - Audio content ID
   * @returns {Promise<object>} - Audio content record
   */
  static async getAudioById(id) {
    try {
      const { data, error } = await supabase
        .from('audio_content')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching audio with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get audio by type (lullaby or story)
   * @param {string} type - 'lullaby' or 'story'
   * @returns {Promise<array>} - Filtered audio records
   */
  static async getAudioByType(type) {
    try {
      const { data, error } = await supabase
        .from('audio_content')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching ${type} content:`, error);
      throw error;
    }
  }

  /**
   * Get audio by category
   * @param {string} category - Category name
   * @returns {Promise<array>} - Filtered audio records
   */
  static async getAudioByCategory(category) {
    try {
      const { data, error } = await supabase
        .from('audio_content')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching category ${category}:`, error);
      throw error;
    }
  }

  /**
   * Get all available categories
   * @returns {Promise<array>} - Unique categories
   */
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from('audio_content')
        .select('category')
        .neq('category', null);

      if (error) throw error;

      // Extract unique categories
      const categories = [...new Set(data.map(item => item.category))];
      return categories.sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Create new audio content (admin only)
   * @param {object} audioData - Audio content data
   * @returns {Promise<object>} - Created record
   */
  static async createAudio(audioData) {
    try {
      const { data, error } = await supabase
        .from('audio_content')
        .insert([{
          title: audioData.title,
          type: audioData.type, // 'lullaby' or 'story'
          category: audioData.category,
          audio_url: audioData.audio_url,
          description: audioData.description || null,
          duration: audioData.duration || null,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error creating audio content:', error);
      throw error;
    }
  }

  /**
   * Update audio content (admin only)
   * @param {string} id - Audio content ID
   * @param {object} updates - Fields to update
   * @returns {Promise<object>} - Updated record
   */
  static async updateAudio(id, updates) {
    try {
      const { data, error } = await supabase
        .from('audio_content')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error(`Error updating audio ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete audio content (admin only)
   * @param {string} id - Audio content ID
   * @returns {Promise<boolean>} - Success status
   */
  static async deleteAudio(id) {
    try {
      const { error } = await supabase
        .from('audio_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting audio ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search audio by multiple criteria
   * @param {string} searchTerm - Search term
   * @param {object} filters - Additional filters
   * @returns {Promise<array>} - Search results
   */
  static async searchAudio(searchTerm, filters = {}) {
    try {
      let query = supabase
        .from('audio_content')
        .select('*');

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching audio:', error);
      throw error;
    }
  }
}

export default AudioModel;
