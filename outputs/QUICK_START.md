# TimeKids - Quick Start Guide

Get up and running with TimeKids in minutes!

## ⚡ 5-Minute Quick Start

### 1. Clone & Setup (2 minutes)

```bash
# Clone project
git clone https://github.com/yourusername/timekids.git
cd timekids

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 2. Configure Supabase (2 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy credentials from **Settings → API**:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`

4. Edit `.env`:
```bash
nano .env
# Paste your credentials
```

### 3. Setup Database (1 minute)

1. In Supabase, go to **SQL Editor**
2. Create new query
3. Copy-paste contents of `database/schema.sql`
4. Run query

### 4. Start App

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 🔑 First Steps

### Create Test Account

1. Visit `/signup`
2. Enter test credentials
3. Check your email (if configured)
4. Login

### Test Features

- [ ] Browse audio on dashboard
- [ ] Play a track
- [ ] Add to favorites
- [ ] Set sleep timer
- [ ] Toggle dark mode

### Explore Admin

1. Make yourself admin in Supabase (modify user)
2. Visit `/admin`
3. Upload audio content
4. View statistics

---

## 📁 Project Structure Quick Ref

```
timekids/
├── server.js                 ← Start here
├── package.json              ← Dependencies
├── .env.example              ← Configuration
│
├── models/                   ← Database queries
├── controllers/              ← Business logic
├── routes/                   ← API endpoints
│
├── views/                    ← HTML pages
├── public/css/               ← Stylesheets
├── public/js/                ← Frontend logic
│
├── database/schema.sql       ← Database setup
│
└── *.md files               ← Documentation
```

---

## 🎯 Common Tasks

### Add Audio Content

**Via Admin Panel:**
1. Go to `/admin`
2. Click "Upload Audio"
3. Fill in details
4. Submit

**Via Direct URL:**
```javascript
// In browser console
const audio = {
  title: "My Song",
  type: "lullaby",
  category: "Calm",
  audio_url: "https://example.com/song.mp3",
  duration: 300
};

await API.request('/admin/audio', {
  method: 'POST',
  body: JSON.stringify(audio)
});
```

### Add User as Admin

In Supabase SQL Editor:
```sql
-- Create user role (if not exists)
ALTER TABLE auth.users ADD COLUMN role VARCHAR(50) DEFAULT 'user';

-- Make specific user admin
UPDATE auth.users 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

### Debug Audio Playback

```javascript
// In browser console
console.log(AudioPlayer.currentAudio);
console.log(AudioPlayer.audio); // HTML5 audio element
console.log(AudioPlayer.isPlaying);
```

### Clear Cache

```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 🔗 Quick Links

| Resource | Link |
|----------|------|
| **Setup Full Guide** | [SETUP.md](./SETUP.md) |
| **API Documentation** | [API.md](./API.md) |
| **Deployment Guide** | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| **Security Guide** | [SECURITY.md](./SECURITY.md) |
| **Architecture** | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| **Development Guide** | [PROJECT_GUIDE.md](./PROJECT_GUIDE.md) |
| **File Listing** | [FILE_MANIFEST.md](./FILE_MANIFEST.md) |

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find what's using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### Supabase Connection Error

```bash
# Check credentials
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Test connection
curl $SUPABASE_URL/rest/v1/audio_content
```

### Audio Won't Play

1. Check audio URL is valid
2. Verify file exists in Storage
3. Check browser console for CORS errors
4. Ensure SUPABASE_URL is correct

### Dark Mode Not Working

```javascript
// Force toggle
Theme.toggle();

// Reset to light
localStorage.setItem('darkMode', 'false');
Theme.init();
```

---

## 📚 Learning Path

### Beginner (First Day)
- [ ] Read README.md
- [ ] Run SETUP.md
- [ ] Test basic features
- [ ] Add sample content

### Intermediate (First Week)
- [ ] Read ARCHITECTURE.md
- [ ] Review code in `/models` and `/controllers`
- [ ] Understand API flows
- [ ] Make small customization

### Advanced (Ongoing)
- [ ] Read PROJECT_GUIDE.md
- [ ] Deploy to production
- [ ] Add new features
- [ ] Optimize performance

---

## 🚀 Next Steps

### Deploy to Production

```bash
# Heroku (easiest)
heroku create your-app
git push heroku main

# See DEPLOYMENT.md for other options
```

### Customize

- [ ] Change colors in `public/css/styles.css`
- [ ] Add your logo to navbar
- [ ] Update sample data
- [ ] Configure email notifications

### Add Features

Popular enhancements:
- [ ] Playlists
- [ ] User profiles with avatars
- [ ] Social sharing
- [ ] Parental controls
- [ ] Offline mode

---

## 📞 Getting Help

### Resources

1. **Documentation** - Check `*.md` files
2. **API Docs** - See [API.md](./API.md)
3. **Code Comments** - Well-commented source
4. **GitHub Issues** - Report bugs

### Common Questions

**Q: How do I add more audio?**
A: Upload via `/admin` panel or API

**Q: How do I change colors?**
A: Edit CSS variables in `public/css/styles.css`

**Q: How do I add 2FA?**
A: See [PROJECT_GUIDE.md](./PROJECT_GUIDE.md)

**Q: How do I deploy?**
A: Follow [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## ✅ Checklist for First Launch

### Pre-Launch
- [ ] Database schema created
- [ ] Test user created
- [ ] Admin user configured
- [ ] Sample audio uploaded
- [ ] Authentication working
- [ ] Email verified
- [ ] Sleep timer tested
- [ ] Dark mode working

### Launch
- [ ] Deploy to production
- [ ] Test all features
- [ ] Monitor error logs
- [ ] Setup backups
- [ ] Enable SSL
- [ ] Configure monitoring

### Post-Launch
- [ ] Share with users
- [ ] Gather feedback
- [ ] Monitor performance
- [ ] Plan improvements
- [ ] Celebrate! 🎉

---

## 🎓 Development Tips

### Useful Commands

```bash
# Development with auto-reload
npm run dev

# Production mode
npm start

# Run database migrations
# (See database/schema.sql)

# Clear cache
rm -rf node_modules && npm install

# Check for updates
npm outdated

# Security audit
npm audit

# View package info
npm ls
```

### Browser Console Shortcuts

```javascript
// Get current user
Auth.user

// Get current audio
AudioPlayer.currentAudio

// Set volume
AudioPlayer.audio.volume = 0.5

// Play test audio
AudioPlayer.play({
  id: 'test',
  title: 'Test',
  type: 'lullaby',
  audio_url: 'https://example.com/test.mp3'
})

// Toggle theme
Theme.toggle()

// Show toast
UI.toast('Hello!', 'success')

// Get API data
const audio = await API.audio.getAll()
console.log(audio)
```

---

## 📊 Performance Tips

### Frontend
- Minimize CSS/JS files
- Cache API responses
- Lazy load images
- Use HTTP/2

### Backend
- Add database indexes
- Implement caching
- Use CDN for static files
- Monitor query performance

### Database
- Regular maintenance
- Backup strategy
- Archive old data
- Monitor connections

---

## 🔒 Quick Security Checklist

Before deploying:
- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] Database RLS enabled
- [ ] Session secret changed
- [ ] CORS configured
- [ ] Input validation enabled
- [ ] Error messages safe
- [ ] Backups scheduled

---

## 🎯 Success Metrics

Track these metrics to measure success:

- **Engagement**
  - Daily active users
  - Average session duration
  - Favorites saved
  - Sleep timers used

- **Performance**
  - Page load time < 2s
  - API response time < 200ms
  - Error rate < 0.1%
  - Uptime > 99.9%

- **User Satisfaction**
  - Rating > 4.5/5
  - Feedback score
  - Retention rate
  - NPS score

---

## 🎉 You're Ready!

You now have a complete, production-ready audio platform for children!

### What's Next?

1. **Run the app** - `npm run dev`
2. **Explore** - Visit http://localhost:3000
3. **Customize** - Make it your own
4. **Deploy** - Share with the world
5. **Improve** - Gather feedback and iterate

---

## 📞 Quick Contact

Need help?
- 📖 Check [SETUP.md](./SETUP.md)
- 🔍 Search documentation
- 💬 Check code comments
- 🐛 Report bugs on GitHub

---

## 🌙 Remember

> Building software for bedtime is about creating moments of peace.
> Every feature should contribute to a calming experience.

**Happy coding! May your app bring sweet dreams to all. 🌙**

---

**Version:** 1.0.0
**Last Updated:** March 2024
**Status:** ✅ Production Ready
