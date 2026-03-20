/**
 * Auth Controller
 * Handles authentication logic with Supabase Auth
 * MVC Pattern: Controller Layer
 */

import { supabase } from '../services/supabaseClient.js';

class AuthController {
  /**
   * Sign up new user
   * Request: POST /api/auth/signup
   * Body: { email, password, name }
   */
  static async signup(req, res) {
    try {
      const { email, password, name } = req.body;

      // Validation
      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          error: 'Email, password, and name are required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }

      // Validate password strength (min 8 chars)
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters'
        });
      }

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(201).json({
        success: true,
        message: 'Signup successful. Please check your email to confirm.',
        user: {
          id: data.user?.id,
          email: data.user?.email
        }
      });
    } catch (error) {
      console.error('Error in signup:', error);
      res.status(500).json({
        success: false,
        error: 'Signup failed',
        message: error.message
      });
    }
  }

  /**
   * Login user
   * Request: POST /api/auth/login
   * Body: { email, password }
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // Store session info
      req.session.userId = data.user.id;
      req.session.userEmail = data.user.email;
      req.session.userName = data.user.user_metadata?.name || email;

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || email
        },
        session: {
          accessToken: data.session?.access_token
        }
      });
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed',
        message: error.message
      });
    }
  }

  /**
   * Logout user
   * Request: POST /api/auth/logout
   */
  static async logout(req, res) {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Supabase signout error:', error);
      }

      // Destroy session
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Logout failed'
          });
        }

        res.json({
          success: true,
          message: 'Logout successful'
        });
      });
    } catch (error) {
      console.error('Error in logout:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed',
        message: error.message
      });
    }
  }

  /**
   * Get current authenticated user
   * Request: GET /api/auth/me
   */
  static async getCurrentUser(req, res) {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      res.json({
        success: true,
        user: {
          id: req.session.userId,
          email: req.session.userEmail,
          name: req.session.userName
        }
      });
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user',
        message: error.message
      });
    }
  }

  /**
   * Verify email (for confirmation links)
   * Request: POST /api/auth/verify
   * Body: { token, type }
   */
  static async verifyEmail(req, res) {
    try {
      const { token, type } = req.body;

      if (!token || !type) {
        return res.status(400).json({
          success: false,
          error: 'Token and type are required'
        });
      }

      const { data, error } = await supabase.auth.verifyOtp({
        token,
        type
      });

      if (error) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.json({
        success: true,
        message: 'Email verified successfully',
        user: {
          id: data.user?.id,
          email: data.user?.email
        }
      });
    } catch (error) {
      console.error('Error in verifyEmail:', error);
      res.status(500).json({
        success: false,
        error: 'Verification failed',
        message: error.message
      });
    }
  }

  /**
   * Check authentication status
   * Request: GET /api/auth/status
   */
  static async getAuthStatus(req, res) {
    try {
      const isAuthenticated = !!req.session.userId;

      res.json({
        success: true,
        isAuthenticated,
        user: isAuthenticated ? {
          id: req.session.userId,
          email: req.session.userEmail,
          name: req.session.userName
        } : null
      });
    } catch (error) {
      console.error('Error in getAuthStatus:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check status',
        message: error.message
      });
    }
  }
}

export default AuthController;
