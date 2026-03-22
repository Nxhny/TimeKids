# 🌙 TimeKids

> A calming, audio-only platform for children — soothing lullabies and bedtime stories.
> Built with Node.js + Express (MVC) + Supabase + Vanilla JS.

![TimeKids](public/assets/logo.png)

---

## 🚀 Quick Start (3 steps)

### 1 — Install
```bash
git clone <your-repo> && cd timekids
npm install
cp .env.example .env          # then fill in your Supabase keys
```

### 2 — Set up the database
1. Go to **Supabase Dashboard → SQL Editor → New Query**
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run** — all tables, RLS policies, triggers, and seed data are created

### 3 — Run
```bash
npm run dev       # development with auto-reload
npm start         # production
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🐳 Docker

```bash
# Development (hot-reload)
docker-compose up --build

# Production build
docker build -t timekids .
docker run -p 3000:3000 --env-file .env timekids
```

---

## 📁 Project Structure

```
timekids/
│
├── server.js                      # Express entry point
├── package.json
├── Dockerfile
├── docker-compose.yml
├── .env.example
│
├── services/
│   └── supabaseClient.js          # Dual Supabase clients (anon + service-role)
│
├── models/                        # Data access layer — all DB queries here
│   ├── audioModel.js
│   ├── childModel.js              # Child profiles + recently played
│   ├── favoritesModel.js
│   ├── playlistModel.js
│   └── userModel.js
│
├── controllers/                   # Business logic
│   ├── authController.js
│   ├── audioController.js         # Plan limit enforcement here
│   ├── childController.js
│   ├── favoritesController.js
│   └── playlistController.js
│
├── routes/                        # Express route definitions
│   ├── index.js                   # Mounts all routers
│   ├── authRoutes.js
│   ├── audioRoutes.js
│   ├── childRoutes.js
│   ├── favoritesRoutes.js
│   ├── playlistRoutes.js
│   └── adminRoutes.js
│
├── middleware/
│   └── auth.js                    # JWT guard + optional auth + admin guard
│
├── views/                         # HTML pages
│   ├── index.html                 # Landing page
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html             # Main app — audio grid, player, sleep timer
│   ├── children.html              # Child profile manager
│   ├── playlists.html
│   ├── profile.html
│   ├── admin.html
│   └── 404.html
│
├── public/
│   ├── css/
│   │   ├── main.css               # Full design system (CSS variables, components)
│   │   ├── auth.css               # Login / register page styles
│   │   └── i18n.css               # Language switcher widget
│   ├── js/
│   │   ├── api.js                 # Centralised fetch wrapper
│   │   ├── app.js                 # Dashboard — grid, player, sleep timer, playlists
│   │   ├── auth.js                # Login / register logic
│   │   ├── children.js            # Child profile management
│   │   ├── admin.js
│   │   ├── playlists.js
│   │   ├── profile.js
│   │   ├── player.js              # Visualizer, continue-listening, keyboard shortcuts
│   │   ├── i18n.js                # 201-key i18n engine (EN/FR/ES)
│   │   └── utils.js               # Shared helpers
│   ├── assets/
│   │   └── logo.png
│   ├── manifest.json              # PWA manifest
│   └── sw.js                      # Service Worker (offline caching)
│
└── supabase/
    └── schema.sql                 # Full DB schema + RLS + seed data
```

---

## ✨ Feature Checklist

### Core
- [x] **Sign up / Login / Logout** — Supabase Auth (httpOnly cookies + Bearer token)
- [x] **Audio library** — lullabies + bedtime stories
- [x] **Add via YouTube URL** — extracts video ID, stores embed URL (zero storage cost)
- [x] **Upload MP3** — direct to Supabase Storage bucket `audio-files`
- [x] **Audio player** — play/pause, seek, volume, loop, prev/next
- [x] **Sleep timer** — 5 / 10 / 20 / 30 / 60 min, auto-stops playback
- [x] **Favourites** — persistent per user, toggle from any card
- [x] **Category filtering + search** — live filter with debounce

### Advanced
- [x] **Playlists** — create, rename, delete, add/remove tracks, play all
- [x] **Child profiles** — per-parent, emoji avatar picker, age, active selection
- [x] **Recently Played** — scrollable strip on dashboard, with position bar
- [x] **Continue Listening** — resume banner remembers last position (localStorage + DB)
- [x] **Waveform visualizer** — Web Audio API canvas animation in player bar
- [x] **Keyboard shortcuts** — Space, ←/→ seek, Shift+←/→ prev/next, M mute, ↑↓ volume
- [x] **Media Session API** — lock-screen / notification controls on mobile
- [x] **Ambient sounds** — 6 curated YouTube-sourced tracks (rain, ocean, fire, etc.)

### UX / Design
- [x] **Dark mode** — toggle, persisted in localStorage
- [x] **PWA** — installable, offline caching via Service Worker
- [x] **Responsive** — mobile-first, sidebar collapses on small screens
- [x] **First-login onboarding** — 3-step modal, shown once
- [x] **i18n** — 201 translation keys, 3 languages (🇬🇧 EN / 🇫🇷 FR / 🇪🇸 ES)
- [x] **Custom 404** — "Lost in dreamland" page

### Admin & Security
- [x] **Admin panel** — stats, all audio, user plan management
- [x] **Free plan limits** — 10 lullabies + 10 stories per user (enforced server-side)
- [x] **Premium plan** — unlimited uploads
- [x] **Row Level Security** — all Supabase tables
- [x] **Rate limiting** — express-rate-limit on all API routes
- [x] **Helmet.js** — security headers
- [x] **Input validation** — all controllers

---

## 🌍 Languages

| Language | Code | Status |
|---|---|---|
| English | `en` | ✅ Complete |
| Français | `fr` | ✅ Complete |
| Español | `es` | ✅ Complete |

**Adding a new language** — edit `public/js/i18n.js`:
```js
// 1. Add to LANGUAGES
export const LANGUAGES = {
  en: { label: 'English', flag: '🇬🇧' },
  fr: { label: 'Français', flag: '🇫🇷' },
  es: { label: 'Español', flag: '🇪🇸' },
  de: { label: 'Deutsch', flag: '🇩🇪' },  // ← add here
};

// 2. Add 'de' value to every entry in TRANSLATIONS
'nav.all': { en: 'All Content', fr: 'Tout le contenu', es: 'Todo el contenido', de: 'Alle Inhalte' },
```
That's it — the switcher widget and all `data-i18n` bindings update automatically.

---

## 🔐 Environment Variables

```env
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server
PORT=3000
NODE_ENV=development          # set to "production" in prod
JWT_SECRET=change-in-production

# App URL (used for CORS)
APP_URL=http://localhost:3000
```

> **Finding your keys:** Supabase Dashboard → Project Settings → API

---

## 📡 API Reference

### Auth `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/signup` | — | Create account |
| `POST` | `/login` | — | Login → sets httpOnly cookie + returns token |
| `POST` | `/logout` | — | Clears session cookies |
| `GET` | `/me` | ✅ | Get current user + plan info |

### Audio `/api/audio`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | — | List all (`?type=&category=&search=`) |
| `GET` | `/categories` | — | All distinct categories |
| `GET` | `/:id` | — | Single track |
| `GET` | `/user/my` | ✅ | My uploads + usage counts |
| `POST` | `/youtube` | ✅ | Add YouTube track (plan-limited) |
| `POST` | `/upload` | ✅ | Upload MP3 to Storage (plan-limited) |
| `DELETE` | `/:id` | ✅ | Delete own track |

### Favorites `/api/favorites`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✅ | Full favorite list with audio data |
| `GET` | `/ids` | ✅ | Just IDs (for UI state) |
| `POST` | `/:audioId` | ✅ | Toggle favorite |
| `DELETE` | `/:audioId` | ✅ | Remove |

### Playlists `/api/playlists`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✅ | My playlists |
| `POST` | `/` | ✅ | Create playlist |
| `PUT` | `/:id` | ✅ | Update |
| `DELETE` | `/:id` | ✅ | Delete |
| `POST` | `/:id/tracks` | ✅ | Add track |
| `DELETE` | `/:id/tracks/:audioId` | ✅ | Remove track |

### Children `/api/children`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✅ | My child profiles |
| `POST` | `/` | ✅ | Create child |
| `PUT` | `/:id` | ✅ | Update child |
| `DELETE` | `/:id` | ✅ | Delete child |
| `GET` | `/recent` | ✅ | Recently played (last 8) |
| `POST` | `/recent` | ✅ | Record play position |

### Admin `/api/admin`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/stats` | ✅ Admin | Overview stats |
| `GET` | `/users` | ✅ Admin | All users |
| `PUT` | `/users/:id/plan` | ✅ Admin | Change user plan |
| `GET` | `/audio` | ✅ Admin | All audio content |

---

## ⌨️ Keyboard Shortcuts (Dashboard)

| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `←` / `→` | Seek −10s / +10s |
| `Shift + ←` | Previous track |
| `Shift + →` | Next track |
| `↑` / `↓` | Volume up / down |
| `M` | Toggle mute |

---

## 🗄️ Database Tables

| Table | Description |
|---|---|
| `profiles` | Extends `auth.users` — display name, plan, avatar, admin flag |
| `audio_content` | All audio tracks (lullabies + stories) |
| `favorites` | User ↔ audio many-to-many |
| `playlists` | User-created playlists |
| `playlist_items` | Tracks within playlists (ordered by position) |
| `child_profiles` | Child profiles per parent account |
| `recent_plays` | Last played position per user per track |
| `listen_history` | Server-side resume state |

All tables have **Row Level Security** enabled with appropriate policies.

---

## 🛠️ Making a User Admin

In Supabase SQL Editor:
```sql
UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'admin@example.com';
```

---

## 🌐 Production Deployment

### Railway / Render / Fly.io
1. Connect your repository
2. Set all env vars from `.env.example`
3. Set `NODE_ENV=production`
4. Deploy — the `Dockerfile` handles the rest

### Manual
```bash
NODE_ENV=production npm start
```

### Before going live
- [ ] Remove `email_confirm: true` from `authController.js` (enables Supabase email verification)
- [ ] Set a strong `JWT_SECRET`
- [ ] Configure Supabase Storage CORS for your production domain
- [ ] Enable Supabase Auth email confirmation in the dashboard
- [ ] Set up a custom SMTP provider in Supabase for branded emails

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 (ES Modules) |
| Framework | Express 4 |
| Architecture | MVC |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (JWT) |
| Storage | Supabase Storage |
| Frontend | Vanilla HTML/CSS/JS (ES Modules) |
| Audio (free) | YouTube embed API |
| Audio (uploads) | Supabase Storage |
| PWA | Web App Manifest + Service Worker |
| i18n | Custom engine (EN/FR/ES, 201 keys) |
| Fonts | Baloo 2 + Nunito (Google Fonts) |
| Security | Helmet + CORS + express-rate-limit |
| Docker | Multi-stage alpine image |
