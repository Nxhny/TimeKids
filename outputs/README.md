# 🌙 TimeKids - Lullabies & Bedtime Stories Platform

![TimeKids Banner](https://img.shields.io/badge/TimeKids-Sweet%20Dreams%20Awaiting-A8D8D8?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-16+-green?style=flat-square)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

A beautiful, calming web application designed for children and parents, offering audio-only lullabies and bedtime stories. Built with modern web technologies and a focus on simplicity, security, and soothing aesthetics.

## ✨ Features

### 🎵 Audio Experience
- **Lullabies Collection**: Curated selection of calming lullabies from around the world
- **Bedtime Stories**: Narrated stories designed to encourage peaceful sleep
- **Ambient Sounds**: Nature sounds like rain, ocean waves, and forest ambience
- **Audio-Only Content**: No video distractions, pure audio experience

### 🎮 Player Features
- **Play/Pause Controls**: Simple and intuitive playback controls
- **Progress Bar**: Visual track progress with seek capability
- **Volume Control**: Adjustable volume with visual feedback
- **Repeat Modes**: Off, repeat one, repeat all
- **Sleep Timer**: Set timer (5, 10, 20, 30 minutes) with auto-stop
- **Queue Management**: Build and manage your listening queue

### 👤 User Features
- **User Authentication**: Secure signup and login
- **Favorites System**: Save favorite content for quick access
- **Listening History**: Track previously played content
- **User Preferences**: Customize app behavior
- **Dark Mode**: Auto or manual theme toggle

### 🎨 Design & UX
- **Soft Pastel Colors**: Calming color palette (teals, peaches, lavenders)
- **Minimalist Interface**: Clean, uncluttered design
- **Fully Responsive**: Works perfectly on mobile, tablet, and desktop
- **Smooth Animations**: Subtle, soothing transitions
- **Accessible**: Built with accessibility in mind

### 🛡️ Security
- **Supabase Auth**: Secure authentication system
- **Row-Level Security**: Database-level access control
- **Session Management**: Secure session handling
- **Input Validation**: All inputs validated on server
- **HTTPS Ready**: Production-ready security

## 🏗️ Architecture

### **MVC Pattern**
```
Model (Data)
  ↓
Controller (Logic)
  ↓
View (Presentation)
```

### **Tech Stack**

**Frontend:**
- HTML5, CSS3 (modern with CSS variables)
- Vanilla JavaScript (ES6 modules)
- Responsive design (mobile-first)

**Backend:**
- Node.js with Express
- RESTful API architecture
- Session management

**Database & Storage:**
- Supabase (PostgreSQL)
- Row-level security policies
- Cloud storage for audio files

**Architecture:**
- Separation of concerns
- Reusable components
- Clean code principles

## 📦 Installation

### Quick Start (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/yourusername/timekids.git
cd timekids

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Edit .env with your Supabase credentials
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-key
# etc.

# 5. Start development server
npm run dev

# 6. Open browser to http://localhost:3000
```

For detailed setup instructions, see [SETUP.md](./SETUP.md)

## 🚀 Usage

### As a User

1. **Sign Up**: Create account on `/signup`
2. **Browse**: Explore lullabies and stories on dashboard
3. **Play**: Click any track to start playback
4. **Favorites**: Click heart icon to save favorites
5. **Timer**: Use sleep timer for automatic stop
6. **Profile**: Customize preferences in profile page

### As an Admin

1. **Add Content**: Navigate to `/admin` panel
2. **Upload Audio**: Upload MP3 files with metadata
3. **Manage**: Edit or delete existing content
4. **Monitor**: View statistics and popular items

## 📁 Project Structure

```
timekids/
├── 📄 server.js                    Express app setup
├── 📄 package.json                 Dependencies
├── 📄 .env.example                 Environment template
│
├── 📁 services/                    External integrations
│   └── supabaseClient.js
│
├── 📁 models/                      Data access layer
│   ├── audioModel.js              Audio queries
│   └── favoritesModel.js          Favorites queries
│
├── 📁 controllers/                 Business logic
│   ├── audioController.js
│   ├── favoritesController.js
│   └── authController.js
│
├── 📁 routes/                      API endpoints
│   ├── auth.js                    Authentication
│   ├── audio.js                   Audio content
│   ├── favorites.js               User favorites
│   ├── user.js                    User data
│   └── admin.js                   Admin functions
│
├── 📁 views/                       HTML templates
│   ├── index.html                 Home page
│   ├── login.html                 Login page
│   ├── signup.html                Registration
│   ├── dashboard.html             Main interface
│   ├── player.html                Full player
│   ├── favorites.html             Favorites
│   ├── profile.html               User profile
│   └── admin.html                 Admin panel
│
├── 📁 public/
│   ├── css/                       Stylesheets
│   │   ├── styles.css             Main styles
│   │   ├── home.css               Home page
│   │   ├── auth.css               Auth pages
│   │   ├── dashboard.css          Dashboard
│   │   ├── player.css             Player page
│   │   ├── favorites.css          Favorites
│   │   ├── profile.css            Profile
│   │   └── admin.css              Admin panel
│   │
│   └── js/                        Client scripts
│       ├── app.js                 Main app
│       ├── audioPlayer.js         Audio player
│       ├── auth.js                Auth logic
│       └── [page scripts]
│
└── 📁 database/
    └── schema.sql                 Database schema
```

## 🎨 Design System

### Color Palette (Soft & Calming)
- **Primary**: `#a8d8d8` (Soft Teal)
- **Secondary**: `#f7d4d1` (Soft Peach)
- **Accent**: `#d4a5d8` (Soft Lavender)
- **Success**: `#a8d5a8` (Soft Green)
- **Danger**: `#f5a8a8` (Soft Red)

### Typography
- **Display**: Fredoka (rounded, friendly)
- **Body**: Nunito (readable, warm)

### Spacing System
Uses CSS custom properties for consistent spacing throughout the app.

## 🔐 Security Features

✅ **Authentication**
- Email/password signup and login
- Session-based authentication
- Secure session handling

✅ **Database Security**
- Row-Level Security (RLS) policies
- Role-based access control
- Validated input queries

✅ **Frontend Security**
- XSS protection
- CSRF tokens for forms
- Secure HTTP headers

✅ **API Security**
- Input validation
- Error handling
- Rate limiting ready

## 📊 Database Schema

### Tables
- `audio_content`: Lullabies and stories metadata
- `favorites`: User favorite associations

### Key Features
- UUID primary keys
- Timestamps for audit trails
- Foreign key relationships
- Unique constraints
- Indexes for performance

See [schema.sql](./database/schema.sql) for complete details.

## 🧠 Core Functionality

### Sleep Timer Implementation
```javascript
// 1. User selects time (5, 10, 20, or 30 minutes)
// 2. Timer counts down in seconds
// 3. When zero, audio automatically pauses
// 4. Optional notification to user
```

### Favorites System
```javascript
// 1. User authenticates
// 2. Clicks heart icon on track
// 3. Added to user's favorites in database
// 4. Appears in Favorites page
// 5. Can be removed anytime
```

### Audio Player
```javascript
// 1. User selects track
// 2. Audio URL loaded from database
// 3. HTML5 audio element plays
// 4. Progress bar syncs with playback
// 5. User controls volume, seek, repeat
```

## 🌐 API Overview

### Base URL
```
http://localhost:3000/api
```

### Example Requests

**Get all audio:**
```bash
curl http://localhost:3000/api/audio
```

**Get lullabies:**
```bash
curl http://localhost:3000/api/audio/type/lullaby
```

**Search:**
```bash
curl http://localhost:3000/api/audio/search?q=rain
```

**User's favorites:**
```bash
curl http://localhost:3000/api/favorites \
  -H "Cookie: connect.sid=..."
```

## 🎯 Performance

- **CSS Variables**: Minimal repaints on theme change
- **Lazy Loading**: Images and assets loaded on demand
- **Efficient Queries**: Database indexes and pagination
- **Minified Assets**: Production-ready optimization
- **CDN Ready**: Static files can be cached

## ♿ Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance
- Focus indicators

## 🧪 Testing

### Manual Testing Checklist

- [ ] User signup and login
- [ ] Audio playback works
- [ ] Sleep timer functions
- [ ] Favorites can be added/removed
- [ ] Dark mode toggles
- [ ] Search filters work
- [ ] Profile saves preferences
- [ ] Admin can upload content

## 🐛 Known Issues & Future Enhancements

### Future Features 🚀
- [ ] Playlists
- [ ] Social sharing
- [ ] Parental controls
- [ ] Activity tracking
- [ ] Personalized recommendations
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Mobile app

### Known Limitations
- Single audio playback (no queues yet)
- No video content (audio-only by design)
- Limited to uploaded content

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with ❤️ for peaceful bedtimes
- Inspired by the need for calming technology for children
- Thanks to all contributors and testers

## 📧 Contact & Support

- **GitHub Issues**: Report bugs and request features
- **Email**: support@timekids.local
- **Documentation**: See [SETUP.md](./SETUP.md) for detailed guides

## 🌟 Show Your Support

If you find TimeKids helpful, please:
- ⭐ Star this repository
- 🐦 Share on social media
- 💬 Leave feedback
- 🤝 Contribute improvements

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com)
- [Supabase Documentation](https://supabase.com/docs)
- [MDN Web Docs](https://developer.mozilla.org)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

<p align="center">
  <strong>Making bedtime peaceful for children everywhere.</strong><br>
  <em>Sweet dreams start here. 🌙</em>
</p>

---

**Last Updated:** March 2024
**Version:** 1.0.0
**Status:** ✅ Production Ready
