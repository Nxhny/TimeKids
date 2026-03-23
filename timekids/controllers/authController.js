// controllers/authController.js
// ─────────────────────────────────────────────────────────────────────────────
// Auth flows: signup, login, logout, session check,
// forgot password, reset password, update profile, delete account.
// ─────────────────────────────────────────────────────────────────────────────
import '../services/env.js';                          // ensures .env is loaded first
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin }  from '../services/supabaseClient.js';
import { upsertProfile, getProfile } from '../models/userModel.js';

// Anon client — lazy singleton, created on first use so env vars are definitely loaded
let _authClient = null;
function getAuthClient() {
  if (!_authClient) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment.');
    }
    _authClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return _authClient;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function setCookies(res, session) {
  const secure = process.env.NODE_ENV === 'production';
  res.cookie('sb_access_token', session.access_token, {
    httpOnly: true, secure, sameSite: 'Lax',
    maxAge: 60 * 60 * 1000,            // 1 hour
  });
  res.cookie('sb_refresh_token', session.refresh_token, {
    httpOnly: true, secure, sameSite: 'Lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
}

function clearCookies(res) {
  res.clearCookie('sb_access_token');
  res.clearCookie('sb_refresh_token');
}

// ── POST /api/auth/signup ──────────────────────────────────────────────────
export async function signup(req, res) {
  try {
    const { email, password, display_name, plan = 'free' } = req.body;
    if (!email || !password || !display_name)
      return res.status(400).json({ error: 'All fields are required.' });
    if (password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      // email_confirm: true,
      // ↑ PRODUCTION: Remove this line and enable email confirmation in
      //   Supabase Dashboard → Authentication → Settings → Enable email confirmations
      // In development, set email_confirm: true to skip the confirmation step.
      email_confirm: process.env.NODE_ENV !== 'production',
      user_metadata: { display_name },
    });
    if (error) return res.status(400).json({ error: error.message });

    await upsertProfile(data.user.id, {
      display_name,
      email,
      plan: ['free', 'premium'].includes(plan) ? plan : 'free',
      avatar_url: null,
    });

    return res.status(201).json({ message: 'Account created successfully!' });
  } catch (err) {
    console.error('[signup]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// ── POST /api/auth/login ───────────────────────────────────────────────────
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    // Verify Supabase config is available
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('[login] FATAL: Missing Supabase environment variables!');
      return res.status(500).json({ error: 'Server configuration error. Contact support.' });
    }

    const { data, error } = await getAuthClient().auth.signInWithPassword({ email, password });
    if (error) {
      console.warn('[login] Auth error:', error.message, '| email:', email);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const { session, user } = data;
    setCookies(res, session);

    const profile = await getProfile(user.id).catch(() => null);

    return res.json({
      message: 'Logged in.',
      access_token: session.access_token,
      user: {
        id:           user.id,
        email:        user.email,
        display_name: user.user_metadata?.display_name || profile?.display_name,
        plan:         profile?.plan || 'free',
        is_admin:     profile?.is_admin || false,
      },
    });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// ── POST /api/auth/logout ──────────────────────────────────────────────────
export async function logout(req, res) {
  clearCookies(res);
  return res.json({ message: 'Logged out.' });
}

// ── GET /api/auth/me ───────────────────────────────────────────────────────
export async function getMe(req, res) {
  try {
    const profile = await getProfile(req.user.id).catch(() => null);
    return res.json({
      user: {
        id:           req.user.id,
        email:        req.user.email,
        display_name: req.user.user_metadata?.display_name || profile?.display_name,
        plan:         profile?.plan || 'free',
        avatar_url:   profile?.avatar_url || null,
        is_admin:     profile?.is_admin || false,
      },
    });
  } catch (err) {
    console.error('[getMe]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// ── POST /api/auth/forgot-password ────────────────────────────────────────
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const redirectTo = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password`;

    const { error } = await getAuthClient().auth.resetPasswordForEmail(email, { redirectTo });
    if (error) return res.status(400).json({ error: error.message });

    // Always return success (don't reveal whether email exists)
    return res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('[forgotPassword]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// ── POST /api/auth/reset-password ─────────────────────────────────────────
// Called after user clicks the email link (which contains access_token in hash)
export async function resetPassword(req, res) {
  try {
    const { access_token, new_password } = req.body;
    if (!access_token || !new_password)
      return res.status(400).json({ error: 'access_token and new_password are required.' });
    if (new_password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    // Verify the token, then update password
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(access_token);
    if (userErr || !userData.user)
      return res.status(401).json({ error: 'Invalid or expired reset link.' });

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userData.user.id, {
      password: new_password,
    });
    if (error) return res.status(400).json({ error: error.message });

    return res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('[resetPassword]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// ── PUT /api/auth/profile ──────────────────────────────────────────────────
// Update display name and/or password
export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { display_name, current_password, new_password, avatar_emoji } = req.body;

    const updates = {};

    // Update display name and/or avatar
    const profileFields = {};
    if (display_name?.trim())  profileFields.display_name = display_name.trim();
    if (avatar_emoji)           profileFields.avatar_url   = avatar_emoji; // stored as emoji string

    if (Object.keys(profileFields).length) {
      await upsertProfile(userId, profileFields);
      if (profileFields.display_name) {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: { display_name: profileFields.display_name },
        });
      }
      updates.profile = true;
    }

    // Update password (requires current password verification)
    if (new_password) {
      if (!current_password)
        return res.status(400).json({ error: 'Current password is required to set a new one.' });
      if (new_password.length < 8)
        return res.status(400).json({ error: 'New password must be at least 8 characters.' });

      // Verify current password by signing in
      const { error: verifyErr } = await getAuthClient().auth.signInWithPassword({
        email:    req.user.email,
        password: current_password,
      });
      if (verifyErr)
        return res.status(401).json({ error: 'Current password is incorrect.' });

      // Update via admin client
      const { error: pwErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: new_password,
      });
      if (pwErr) return res.status(400).json({ error: pwErr.message });
      updates.password = true;
    }

    if (!Object.keys(updates).length)
      return res.status(400).json({ error: 'Nothing to update.' });

    return res.json({ message: 'Profile updated successfully.', updates });
  } catch (err) {
    console.error('[updateProfile]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// ── DELETE /api/auth/account ───────────────────────────────────────────────
export async function deleteAccount(req, res) {
  try {
    const userId = req.user.id;
    const { password } = req.body;
    if (!password)
      return res.status(400).json({ error: 'Password confirmation required.' });

    // Verify password before deleting
    const { error: verifyErr } = await getAuthClient().auth.signInWithPassword({
      email:    req.user.email,
      password,
    });
    if (verifyErr)
      return res.status(401).json({ error: 'Incorrect password. Account not deleted.' });

    // Delete user — Supabase cascades to profiles, favorites, playlists etc.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) return res.status(500).json({ error: error.message });

    clearCookies(res);
    return res.json({ message: 'Account deleted permanently.' });
  } catch (err) {
    console.error('[deleteAccount]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
