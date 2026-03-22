# 🌙 TimeKids

> A calming audio platform for children — soothing lullabies and bedtime stories, audio-only.

![TimeKids Logo](public/assets/logo.png)

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js v18+
- A [Supabase](https://supabase.com) account (free tier works)

### 2. Clone & Install
```bash
git clone <your-repo>
cd timekids
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```

Open `.env` and fill in:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3000
NODE_ENV=development
JWT_SECRET=change-me-in-production
APP_URL=http://localhost:3000
```

> **Where to find these:** Supabase Dashboard → Project Settings → API

### 4. Set up the database
1. Go to your Supabase project → **SQL Editor → New Query**
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run**

### 5. Set up Storage
In Supabase → **Storage**:
1. Create a new bucket named `audio-files`
2. Set it to **Public**
3. Uncomment and run the Storage policies section from `supabase/schema.sql`

### 6. Run the app
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
timekids/
├── server.js                # Express entry point
├── package.json
├── .env.example
│
├── services/
│   └── supabaseClient.js    # Supabase client factory (anon + admin)
│
├── models/                  # Data access layer (Supabase queries)
│   ├── audioModel.js
│   ├── favoritesModel.js
│   └── userModel.js
│
├── controllers/             # Business logic
│   ├── authController.js
│   ├── audioController.js
│   └── favoritesController.js
│
├── routes/                  # Express route definitions
│   ├── index.js
│   ├── authRoutes.js
│   ├── audioRoutes.js
│   ├── favoritesRoutes.js
│   └── adminRoutes.js
│
├── middleware/
│   └── auth.js              # JWT verification + admin guard
│
├── views/                   # HTML pages (SSR-lite)
│   ├── index.html           # Landing page
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html       # Main app
│   ├── profile.html
│   └── admin.html
│
├── public/                  # Static assets
│   ├── css/
│   │   ├── main.css         # Design system
│   │   └── auth.css
│   ├── js/
│   │   ├── api.js           # Fetch wrapper
│   │   ├── auth.js          # Login/register logic
│   │   ├── app.js           # Dashboard logic + player
│   │   ├── profile.js
│   │   ├── admin.js
│   │   └── utils.js         # Shared helpers
│   └── assets/
│       └── logo.png
│
└── supabase/
    └── schema.sql           # Full DB schema + RLS + seed data
```

---

## 🎵 Features

| Feature | Status |
|---------|--------|
| Sign up / Login / Logout | ✅ Supabase Auth |
| Audio library (lullabies + stories) | ✅ |
| Add tracks via **YouTube URL** | ✅ |
| Upload MP3 files to Supabase Storage | ✅ |
| **Free plan limits** (10 songs + 10 stories) | ✅ |
| Premium plan (unlimited) | ✅ |
| Audio player (play/pause/seek/volume/loop) | ✅ |
| YouTube embed player | ✅ |
| Sleep timer (5/10/20/30/60 min) | ✅ |
| Favourites (persistent) | ✅ |
| Category filtering + search | ✅ |
| Ambient sounds section | ✅ |
| My Uploads page | ✅ |
| Admin panel (manage users + content) | ✅ |
| Dark mode toggle | ✅ |
| Fully responsive (mobile-first) | ✅ |
| Row Level Security on all tables | ✅ |
| Rate limiting | ✅ |

---

## 🆓 Plan Limits

| | Free | Premium |
|--|------|---------|
| Lullabies | 10 | Unlimited |
| Stories | 10 | Unlimited |
| YouTube links | ✅ | ✅ |
| MP3 uploads | ✅ | ✅ |
| Favourites | ✅ | ✅ |
| Sleep timer | ✅ | ✅ |

---

## 🔐 Security

- All private routes require a valid Supabase JWT
- Cookies are `httpOnly`, `sameSite: Lax`, and `secure` in production
- Row Level Security on all Supabase tables
- Multer limits file uploads to `audio/*` MIME type and 20 MB
- Helmet.js + CORS + Rate limiting on all routes
- Input validation on all controllers

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | — | Create account |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/logout` | — | Logout |
| GET | `/api/auth/me` | ✅ | Get current user |

### Audio
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/audio` | — | List all (filter: `?type=&category=&search=`) |
| GET | `/api/audio/categories` | — | All distinct categories |
| GET | `/api/audio/:id` | — | Get single track |
| GET | `/api/audio/user/my` | ✅ | My uploads + usage |
| POST | `/api/audio/youtube` | ✅ | Add YouTube track |
| POST | `/api/audio/upload` | ✅ | Upload MP3 |
| DELETE | `/api/audio/:id` | ✅ | Delete own track |

### Favorites
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/favorites` | ✅ | My favourites (with audio data) |
| GET | `/api/favorites/ids` | ✅ | My favourite IDs |
| POST | `/api/favorites/:audioId` | ✅ | Toggle favourite |
| DELETE | `/api/favorites/:audioId` | ✅ | Remove favourite |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | ✅ Admin | App statistics |
| GET | `/api/admin/users` | ✅ Admin | All users |
| PUT | `/api/admin/users/:id/plan` | ✅ Admin | Update user plan |
| GET | `/api/admin/audio` | ✅ Admin | All audio |

---

## 🛠️ Making a user admin

In Supabase SQL Editor:
```sql
UPDATE public.profiles SET is_admin = TRUE WHERE email = 'admin@example.com';
```

---

## 🌙 Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Set a strong `JWT_SECRET`
3. Update `APP_URL` to your production domain
4. Enable email confirmation in Supabase Auth settings (remove `email_confirm: true` from `authController.js`)
5. Deploy to Railway, Render, Fly.io, or any Node.js host

---

## 📦 Tech Stack

- **Backend:** Node.js + Express (ES Modules)
- **Architecture:** MVC
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (JWT)
- **Storage:** Supabase Storage
- **Frontend:** Vanilla HTML/CSS/JS (ES Modules)
- **Fonts:** Baloo 2 + Nunito (Google Fonts)
- **Audio source:** YouTube embeds (free) + Supabase Storage (uploads)
