// middleware/auth.js
// ─────────────────────────────────────────────────────────────────────────────
// Middleware to protect routes that require authentication.
// Reads the JWT from cookie or Authorization header, verifies via Supabase.
// ─────────────────────────────────────────────────────────────────────────────
import { supabaseAdmin } from '../services/supabaseClient.js';
import { getProfile } from '../models/userModel.js';

/** Protect any route — attaches req.user if valid */
export async function requireAuth(req, res, next) {
  try {
    const token =
      req.cookies?.sb_access_token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    }

    req.user = data.user;
    next();
  } catch (err) {
    console.error('[requireAuth]', err);
    return res.status(500).json({ error: 'Auth verification failed.' });
  }
}

/** Optional auth — attaches req.user if token present, continues either way */
export async function optionalAuth(req, res, next) {
  try {
    const token =
      req.cookies?.sb_access_token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const { data } = await supabaseAdmin.auth.getUser(token);
      if (data?.user) req.user = data.user;
    }
    next();
  } catch {
    next();
  }
}

/** Admin-only guard — must be used AFTER requireAuth */
export async function requireAdmin(req, res, next) {
  try {
    const profile = await getProfile(req.user.id);
    if (!profile?.is_admin) {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    req.profile = profile;
    next();
  } catch (err) {
    console.error('[requireAdmin]', err);
    return res.status(500).json({ error: 'Authorization check failed.' });
  }
}
