// server.js
// ─────────────────────────────────────────────────────────────────────────────
// TimeKids — Express MVC Server
// ─────────────────────────────────────────────────────────────────────────────
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

import apiRoutes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security Middleware ────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.youtube.com', 'https://cdn.jsdelivr.net'],
        frameSrc: ["'self'", 'https://www.youtube.com', 'https://www.youtube-nocookie.com'],
        mediaSrc: ["'self'", 'https://*.supabase.co', 'blob:'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: ["'self'", 'https://*.supabase.co', process.env.SUPABASE_URL],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      },
    },
  })
);

app.use(
  cors({
    origin: process.env.APP_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// ── Rate Limiting ─────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many requests. Please try again later.' },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
});

// ── Body Parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Static Files ──────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter, apiRoutes);

// ── SPA Fallback — serve views ────────────────────────────────────────────
const viewsDir = path.join(__dirname, 'views');

app.get('/', (_, res) => res.sendFile(path.join(viewsDir, 'index.html')));
app.get('/login', (_, res) => res.sendFile(path.join(viewsDir, 'login.html')));
app.get('/register', (_, res) => res.sendFile(path.join(viewsDir, 'register.html')));
app.get('/dashboard', (_, res) => res.sendFile(path.join(viewsDir, 'dashboard.html')));
app.get('/profile', (_, res) => res.sendFile(path.join(viewsDir, 'profile.html')));
app.get('/admin', (_, res) => res.sendFile(path.join(viewsDir, 'admin.html')));
app.get('/playlists',  (_, res) => res.sendFile(path.join(viewsDir, 'playlists.html')));

// ── 404 ────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found.' });
  }
  res.status(404).sendFile(path.join(viewsDir, "404.html"));
});

// ── Error Handler ─────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[Global Error]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
});

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌙 TimeKids server running at http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

export default app;
