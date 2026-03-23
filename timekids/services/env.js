// services/env.js
// ─────────────────────────────────────────────────────────────────────────────
// Single source of dotenv loading — import this FIRST in any module
// that needs environment variables at module-load time.
// ─────────────────────────────────────────────────────────────────────────────
import dotenv from 'dotenv';
dotenv.config();
export default process.env;
