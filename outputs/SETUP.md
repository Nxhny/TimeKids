# TimeKids - Setup & Installation Guide

A calming audio platform for children featuring lullabies and bedtime stories.

## 📋 Prerequisites

- Node.js 16+ and npm
- Supabase account (free tier available)
- Git (optional)

## 🚀 Quick Start

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Wait for the project to initialize (2-3 minutes)
4. Go to **Settings → API** and copy:
   - **Project URL** (SUPABASE_URL)
   - **Anon Public Key** (SUPABASE_ANON_KEY)
   - **Service Role Key** (SUPABASE_SERVICE_KEY)

### Step 2: Create Database Schema

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `database/schema.sql`
4. Click **Run**
5. Wait for success confirmation

### Step 3: Create Storage Bucket

1. In Supabase, go to **Storage**
2. Click **New bucket**
3. Name it: `audio-files`
4. Make it **Public** (uncheck private)
5. Click **Create bucket**

### Step 4: Enable Authentication

1. In Supabase, go to **Authentication → Settings**
2. Under **Email Auth**, enable **Confirm email** (optional but recommended)
3. Configure email settings if desired

### Step 5: Setup Project Locally

```bash
# Clone or extract the project
cd timekids

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your Supabase credentials
nano .env
```

Edit `.env` file with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-secret-session-key-change-this
```

### Step 6: Start Development Server

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

Visit: **http://localhost:3000**

## 📁 Project Structure

```
timekids/
├── server.js                 # Express server entry point
├── package.json             # Dependencies
├── .env.example             # Environment variables template
│
├── services/
│   └── supabaseClient.js    # Supabase initialization
│
├── models/                  # Data access layer
│   ├── audioModel.js
│   └── favoritesModel.js
│
├── controllers/             # Business logic
│   ├── audioController.js
│   ├── favoritesController.js
│   └── authController.js
│
├── routes/                  # API routes
│   ├── auth.js
│   ├── audio.js
│   ├── favorites.js
│   ├── user.js
│   └── admin.js
│
├── views/                   # HTML pages
│   ├── index.html           # Landing page
│   ├── login.html           # Login page
│   ├── signup.html          # Registration page
│   ├── dashboard.html       # Main interface
│   ├── player.html          # Full player
│   ├── favorites.html       # Favorites page
│   ├── profile.html         # User profile
│   └── admin.html           # Admin panel
│
├── public/
│   ├── css/                 # Stylesheets
│   │   ├── styles.css       # Main styles
│   │   ├── home.css
│   │   ├── auth.css
│   │   ├── dashboard.css
│   │   ├── player.css
│   │   ├── favorites.css
│   │   ├── profile.css
│   │   └── admin.css
│   │
│   └── js/                  # Client-side scripts
│       ├── app.js           # Main app logic
│       ├── audioPlayer.js   # Audio player
│       ├── auth.js          # Auth logic
│       ├── playerPage.js    # Player page
│       ├── favorites.js     # Favorites logic
│       ├── profile.js       # Profile logic
│       └── admin.js         # Admin panel
│
└── database/
    └── schema.sql           # Database schema
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/status` - Check auth status

### Audio Content (Public)
- `GET /api/audio` - Get all audio
- `GET /api/audio/:id` - Get single audio
- `GET /api/audio/type/:type` - Get by type (lullaby/story)
- `GET /api/audio/category/:category` - Get by category
- `GET /api/audio/categories` - Get all categories
- `GET /api/audio/search` - Search audio

### Favorites (Protected)
- `GET /api/favorites` - Get user's favorites
- `GET /api/favorites/check/:audioId` - Check if favorited
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:audioId` - Remove from favorites

### User (Protected)
- `GET /api/user/profile` - Get profile
- `GET /api/user/preferences` - Get preferences
- `POST /api/user/preferences` - Save preferences
- `GET /api/user/history` - Get listening history
- `POST /api/user/history` - Add to history

### Admin (Admin Only)
- `POST /api/admin/audio` - Create audio
- `PUT /api/admin/audio/:id` - Update audio
- `DELETE /api/admin/audio/:id` - Delete audio
- `GET /api/admin/stats` - Get statistics

## 🎨 Features

### Core Features ✅
- ✅ User authentication (signup/login)
- ✅ Audio content browsing (lullabies & stories)
- ✅ Audio player with play/pause
- ✅ Progress bar and volume control
- ✅ Favorites system
- ✅ Sleep timer (5, 10, 20, 30 min)
- ✅ Dark mode toggle
- ✅ Responsive design
- ✅ Admin content management

### Advanced Features 🚀
- 🚀 User listening history
- 🚀 Repeat modes
- 🚀 Queue management
- 🚀 Search and filtering
- 🚀 Trending content
- 🚀 User preferences
- 🚀 Session persistence

## 🎵 Adding Audio Content

### Option 1: Admin Panel
1. Login to your app
2. (Add admin role to your user in Supabase)
3. Navigate to `/admin`
4. Upload audio files
5. Add metadata (title, type, category)

### Option 2: Direct Upload via Supabase
1. Go to Supabase Storage
2. Open `audio-files` bucket
3. Click Upload
4. Upload MP3 files
5. Copy public URL
6. In SQL Editor, insert into `audio_content` table

### Option 3: Programmatically
```javascript
const response = await fetch('/api/admin/audio', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Song Name',
    type: 'lullaby',
    category: 'Calm',
    audio_url: 'https://...',
    duration: 300
  })
});
```

## 🛡️ Security

### RLS Policies
- Audio content: Public read-only
- Favorites: Users can only see/edit their own
- User data: Only accessible to authenticated user

### Best Practices
1. **Never commit .env file** with real credentials
2. **Use service key** only on backend
3. **Use anon key** for frontend
4. **Enable email verification** for production
5. **Set strong SESSION_SECRET** in production
6. **Use HTTPS** in production

## 🚨 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| SUPABASE_URL | Your Supabase project URL | https://abc123.supabase.co |
| SUPABASE_ANON_KEY | Public anon key | eyJ... |
| SUPABASE_SERVICE_KEY | Server-side service key | eyJ... |
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development/production |
| SESSION_SECRET | Session encryption key | random-secret-key |

## 🧪 Testing

### Test Login
```
Email: test@example.com
Password: testpassword123
```

### Test Audio Upload
1. Navigate to admin panel
2. Fill in audio details
3. Select audio file or provide URL
4. Submit form

### Test Features
- Add/remove favorites
- Set sleep timer
- Toggle dark mode
- Search content
- View history

## 🐛 Troubleshooting

### "Cannot find module @supabase/supabase-js"
```bash
npm install @supabase/supabase-js
```

### "Connection refused" on localhost
- Check if port 3000 is already in use
- Try: `lsof -i :3000` (macOS/Linux)
- Change PORT in .env if needed

### Audio won't play
1. Check audio_url in database
2. Verify file exists in Supabase Storage
3. Check browser console for CORS errors
4. Ensure SUPABASE_URL is correct

### Favorites not saving
1. Check if user is authenticated
2. Verify RLS policies are enabled
3. Check browser console for errors
4. Ensure user has correct permissions

## 📱 Deployment

### To Heroku
```bash
heroku create your-app-name
heroku config:set SUPABASE_URL=your-url
heroku config:set SUPABASE_ANON_KEY=your-key
git push heroku main
```

### To Vercel
```bash
npm i -g vercel
vercel --prod
# Follow prompts
```

### To DigitalOcean App Platform
1. Connect GitHub repo
2. Set environment variables
3. Deploy

## 📚 Documentation

### API Documentation
See route files in `/routes` for detailed endpoint specs

### Database Schema
See `/database/schema.sql` for complete schema

### Component Documentation
See HTML files in `/views` for UI structure

## 🤝 Contributing

To contribute improvements:

1. Fork the project
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - Feel free to use for personal or commercial projects

## 🎓 Learning Resources

- [Supabase Docs](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com)
- [MDN Web Docs](https://developer.mozilla.org)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## 📧 Support

For issues or questions:
1. Check documentation
2. Search existing issues
3. Create new issue with details

---

**Happy coding! 🌙** Make bedtime peaceful for children everywhere.
