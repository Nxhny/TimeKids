# TimeKids - Development Guide

## 🎯 Project Overview

TimeKids is a full-stack MVC application designed to provide calming audio content for children at bedtime. The application emphasizes simplicity, security, and a soothing user experience.

## 🏗️ Architecture Principles

### MVC Pattern
- **Models** (`models/`): Pure data access using Supabase queries
- **Controllers** (`controllers/`): Business logic and request handling
- **Views** (`views/`): HTML templates served by Express
- **Routes** (`routes/`): Connect HTTP requests to controllers

### Separation of Concerns
- Each module has a single responsibility
- Services abstract external dependencies
- Controllers don't directly touch the database
- Views don't contain business logic

## 📚 Module Breakdown

### Services (`services/supabaseClient.js`)
Initializes and exposes Supabase client. Always use this module for database access.

```javascript
import { supabase } from './services/supabaseClient.js';

// In models
const { data, error } = await supabase
  .from('audio_content')
  .select('*');
```

### Models (Data Access Layer)

**audioModel.js**
- `getAllAudio()` - Fetch with filtering
- `getAudioById()` - Single audio
- `getAudioByType()` - Filter by type
- `getCategories()` - Get unique categories
- `searchAudio()` - Full-text search

**favoritesModel.js**
- `getUserFavorites()` - Get user's saved items
- `isFavorited()` - Check favorite status
- `addFavorite()` - Save to favorites
- `removeFavorite()` - Remove from favorites

### Controllers (Business Logic)

Each controller has methods matching API endpoints:

```javascript
// In audioController.js
class AudioController {
  static async getAllAudio(req, res) {
    // 1. Extract and validate query params
    // 2. Call model
    // 3. Return formatted response
  }
}
```

### Routes (API Endpoints)

```javascript
// in routes/audio.js
router.get('/', AudioController.getAllAudio);
router.get('/:id', AudioController.getAudioById);
```

## 🔄 Data Flow Example

### User adds audio to favorites:

```
Browser → /api/favorites (POST)
   ↓
Server receives request
   ↓
favoritesController.addFavorite()
   ↓
1. Validates user is authenticated (req.session.userId)
2. Validates audio exists (AudioModel.getAudioById)
3. Calls FavoritesModel.addFavorite()
   ↓
Model inserts into database
   ↓
Response returned to browser
   ↓
updateFavoriteButton() called
```

## 🛠️ Development Workflow

### Adding a New Feature

#### 1. Define the data model
```javascript
// In models/exampleModel.js
static async getExample(id) {
  const { data, error } = await supabase
    .from('examples')
    .select('*')
    .eq('id', id);
  return data;
}
```

#### 2. Create business logic
```javascript
// In controllers/exampleController.js
static async getExample(req, res) {
  const { id } = req.params;
  const data = await ExampleModel.getExample(id);
  res.json({ success: true, data });
}
```

#### 3. Define route
```javascript
// In routes/example.js
router.get('/:id', ExampleController.getExample);
```

#### 4. Register route
```javascript
// In server.js
app.use('/api/example', exampleRoutes);
```

#### 5. Call from frontend
```javascript
// In public/js/pageScript.js
const data = await API.request('/example/123');
```

## 📝 Coding Standards

### JavaScript
- Use ES6 modules (`import`/`export`)
- Add JSDoc comments for functions
- Use `const` by default, `let` when needed
- Avoid `var`
- Use arrow functions for callbacks
- Use meaningful variable names

### SQL
- Use parameterized queries (Supabase handles this)
- Add comments for complex logic
- Create indexes for frequently queried columns
- Use appropriate data types

### CSS
- Use CSS variables for colors/spacing
- Follow BEM naming for classes
- Use mobile-first approach
- Ensure sufficient contrast (WCAG AA)

### HTML
- Use semantic tags (`<main>`, `<article>`, etc.)
- Add proper `alt` text to images
- Use `<label>` for form inputs
- Include `aria-` attributes where needed

## 🔐 Security Checklist

- [ ] All inputs validated on server
- [ ] Authentication required for protected routes
- [ ] RLS policies enabled on database
- [ ] Session secrets strong and secure
- [ ] HTTPS enforced in production
- [ ] No sensitive data in logs
- [ ] API keys not exposed in frontend
- [ ] CORS configured properly

## 🎨 UI Component Guidelines

### Creating Audio Card
```javascript
const card = UI.createAudioCard(audio, isFavorited);
// Returns: <div class="audio-card">...</div>
```

### Showing Notifications
```javascript
UI.toast('Success message', 'success', 3000);
UI.toast('Error message', 'error', 3000);
UI.toast('Info message', 'info', 3000);
```

### Formatting Time
```javascript
const formatted = UI.formatTime(150); // "2:30"
```

## 🧪 Testing Approach

### Manual Testing
1. User registration and login
2. Audio playback functionality
3. Sleep timer execution
4. Favorites save/remove
5. Theme switching
6. Responsive layouts

### API Testing
```bash
# Test audio endpoint
curl http://localhost:3000/api/audio

# Test with filters
curl "http://localhost:3000/api/audio?type=lullaby"

# Test search
curl "http://localhost:3000/api/audio/search?q=rain"
```

## 🚀 Performance Optimization

### Frontend
- Lazy load images
- Minimize CSS/JS
- Use CSS variables for theming (no reflows)
- Cache API responses when appropriate

### Backend
- Add database indexes
- Paginate large queries
- Use query parameters efficiently
- Cache static files

### Database
- Indexes on frequently queried columns
- Proper data types
- Archive old data if needed

## 📊 Monitoring & Logging

### Console Logging
```javascript
// Info
console.log('User logged in:', user.id);

// Errors
console.error('Database error:', error);

// Debugging
console.log('State:', { user, theme });
```

### Error Handling
Always wrap async operations:
```javascript
try {
  const data = await API.request('/endpoint');
  // Process data
} catch (error) {
  console.error('Error:', error);
  UI.toast('Something went wrong', 'error');
}
```

## 🔄 Version Control

### Commit Message Format
```
[Type] Brief description

Longer description if needed.

- Changed X
- Added Y
- Fixed Z
```

Types: `[Feature]`, `[Fix]`, `[Docs]`, `[Refactor]`

## 📦 Dependencies

### Core
- `express` - Web framework
- `@supabase/supabase-js` - Database client
- `dotenv` - Environment variables
- `cors` - CORS middleware
- `helmet` - Security headers
- `express-session` - Session management

### Development
- `nodemon` - Auto-reload

## 🆘 Troubleshooting

### Common Issues

**Audio won't play**
- Check audio_url in database
- Verify Supabase Storage permissions
- Check browser console for errors

**Favorites not saving**
- Verify user authentication
- Check RLS policies
- Look for database constraint errors

**Styles not loading**
- Clear browser cache
- Check CSS file paths
- Verify CSS variables defined

**Database connection fails**
- Check SUPABASE_URL
- Verify SUPABASE_ANON_KEY
- Check internet connection

## 📚 Additional Resources

### Internal Documentation
- [Setup Guide](./SETUP.md) - Installation instructions
- [README](./README.md) - Project overview
- [Database Schema](./database/schema.sql) - Database structure

### External Resources
- [Express.js](https://expressjs.com) - Web framework
- [Supabase](https://supabase.com/docs) - Backend service
- [MDN Web Docs](https://developer.mozilla.org) - Web standards
- [JavaScript.info](https://javascript.info) - JS tutorials

## 🎓 Learning Path

1. **Beginner**: Set up and run the app locally
2. **Intermediate**: Add a new audio category
3. **Advanced**: Create a new feature (e.g., playlists)
4. **Expert**: Optimize performance and security

## 💡 Tips & Tricks

### Quick API Testing
```javascript
// In browser console
const result = await API.audio.getAll();
console.log(result);
```

### Quick Theme Toggle
```javascript
Theme.toggle();
```

### Quick Player Control
```javascript
AudioPlayer.play(audioObject);
AudioPlayer.togglePlay();
AudioPlayer.setSleepTimer(10);
```

## 🎯 Best Practices Checklist

- [ ] DRY principle - Don't Repeat Yourself
- [ ] Single Responsibility - One job per function
- [ ] Error handling - Always handle errors
- [ ] Input validation - Validate on server
- [ ] Security first - Assume malicious input
- [ ] Performance aware - Optimize queries
- [ ] User experience - Make it intuitive
- [ ] Accessibility - Include everyone

---

**Happy developing! Remember: When in doubt, make the user smile. 🌙**
