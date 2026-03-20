/**
 * TimeKids - Audio Platform for Children
 * Main Server Entry Point
 * MVC Architecture with Supabase Backend
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import audioRoutes from './routes/audio.js';
import favoritesRoutes from './routes/favorites.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/user.js';

// Load environment variables
dotenv.config();

// ES6 module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// ROUTES SETUP
// ============================================

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/audio', audioRoutes);

// Protected routes (require authentication)
app.use('/api/favorites', favoritesRoutes);
app.use('/api/user', userRoutes);

// Admin routes (require admin role)
app.use('/api/admin', adminRoutes);

// ============================================
// VIEW ROUTES (HTML Pages)
// ============================================

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Authentication pages
app.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/signup', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

// Dashboard (protected)
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// Player page
app.get('/player', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'player.html'));
});

// Favorites page (protected)
app.get('/favorites', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'views', 'favorites.html'));
});

// Admin panel (protected & admin only)
app.get('/admin', (req, res) => {
  if (!req.session.userId || req.session.userRole !== 'admin') {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// User profile (protected)
app.get('/profile', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║         🌙 TimeKids Server 🌙         ║
║       Lullabies & Bedtime Stories      ║
╚════════════════════════════════════════╝

✨ Server running on: http://localhost:${PORT}
🔧 Environment: ${process.env.NODE_ENV || 'development'}
📚 API Ready: http://localhost:${PORT}/api

Press Ctrl+C to stop the server
  `);
});

export default app;
