// controllers/authController.js
// ─────────────────────────────────────────────────────────────────────────────
// Handles auth flows: signup, login, logout, session verification.
// Uses Supabase Auth under the hood.
// ─────────────────────────────────────────────────────────────────────────────
import { supabaseAdmin } from '../services/supabaseClient.js';
import { upsertProfile } from '../models/userModel.js';

/** POST /api/auth/signup */
export async function signup(req, res) {
  try {
    const { email, password, display_name } = req.body;

    if (!email || !password || !display_name) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    // Create auth user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm for dev; remove in prod
      user_metadata: { display_name },
    });

    if (error) return res.status(400).json({ error: error.message });

    // Create profile record
    await upsertProfile(data.user.id, {
      display_name,
      email,
      plan: 'free',
      avatar_url: null,
    });

    return res.status(201).json({ message: 'Account created successfully!', user: data.user });
  } catch (err) {
    console.error('[authController.signup]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/** POST /api/auth/login */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Authenticate via Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signInWithPassword
      ? await supabaseAdmin.auth.signInWithPassword({ email, password })
      : await supabaseAdmin.auth.signIn({ email, password });

    // supabaseAdmin is service key — use regular client for sign-in
    const { createClient } = await import('@supabase/supabase-js');
    const authClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({ email, password });

    if (authError) return res.status(401).json({ error: 'Invalid email or password.' });

    const { session, user } = authData;

    // Set secure httpOnly cookie with access token
    res.cookie('sb_access_token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie('sb_refresh_token', session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.json({
      message: 'Logged in successfully.',
      user: {
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.display_name,
      },
      access_token: session.access_token,
    });
  } catch (err) {
    console.error('[authController.login]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/** POST /api/auth/logout */
export async function logout(req, res) {
  res.clearCookie('sb_access_token');
  res.clearCookie('sb_refresh_token');
  return res.json({ message: 'Logged out successfully.' });
}

/** GET /api/auth/me — verify session & return current user */
export async function getMe(req, res) {
  try {
    const token = req.cookies?.sb_access_token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) return res.status(401).json({ error: 'Not authenticated.' });

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ error: 'Invalid or expired session.' });

    // Get profile for plan info
    const { getProfile } = await import('../models/userModel.js');
    const profile = await getProfile(data.user.id);

    return res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        display_name: data.user.user_metadata?.display_name || profile?.display_name,
        plan: profile?.plan || 'free',
        avatar_url: profile?.avatar_url,
        is_admin: profile?.is_admin || false,
      },
    });
  } catch (err) {
    console.error('[authController.getMe]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
