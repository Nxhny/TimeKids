# TimeKids - Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER BROWSER (Client)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Frontend Layer (MVC View)                   │   │
│  │                                                          │   │
│  │  HTML Pages                                              │   │
│  │  ├── index.html (Landing)                               │   │
│  │  ├── dashboard.html                                     │   │
│  │  ├── player.html                                        │   │
│  │  └── [Other pages]                                      │   │
│  │                                                          │   │
│  │  JavaScript Modules                                      │   │
│  │  ├── app.js (API calls, Auth)                           │   │
│  │  ├── audioPlayer.js (Player logic)                      │   │
│  │  └── [Page-specific logic]                              │   │
│  │                                                          │   │
│  │  CSS Stylesheets                                         │   │
│  │  ├── styles.css (Global)                                │   │
│  │  ├── [page-specific CSS]                                │   │
│  │  └── theme (dark/light)                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│           ↓ HTTP Requests    ↑ JSON Responses                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  NODE.JS/EXPRESS SERVER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              API Routes (/api/*)                        │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  /auth        → AuthController                          │   │
│  │  /audio       → AudioController                         │   │
│  │  /favorites   → FavoritesController                     │   │
│  │  /user        → UserController                          │   │
│  │  /admin       → AdminController                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                        ↓ Calls                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Controllers                                │   │
│  │  (Validate input, Business logic, Format response)     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                        ↓ Uses                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Models                                     │   │
│  │  (Database queries, Data access)                       │   │
│  │  ├── AudioModel                                         │   │
│  │  ├── FavoritesModel                                     │   │
│  │  └── [Other models]                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                        ↓ Uses                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Services                                  │   │
│  │  (External integrations, Utilities)                    │   │
│  │  └── supabaseClient                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│           ↓ Network Requests    ↑ JSON Data                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     SUPABASE BACKEND                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Authentication                             │   │
│  │  (Email/Password, Session management)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                        │   │
│  │  ├── audio_content table                                │   │
│  │  ├── favorites table                                    │   │
│  │  └── RLS policies                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Storage (S3-compatible)                    │   │
│  │  └── audio-files bucket                                 │   │
│  │      ├── MP3 files                                      │   │
│  │      └── Public URLs                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### User Authentication Flow

```
User enters credentials
        ↓
Form validation (client)
        ↓
POST /api/auth/login
        ↓
AuthController.login()
        ↓
Supabase.auth.signIn()
        ↓
✓ User authenticated
        ↓
Session created
        ↓
Redirect to dashboard
```

### Audio Playback Flow

```
User clicks "Play"
        ↓
Load audio element with URL
        ↓
HTML5 <audio> element
        ↓
Playback controls available
        ↓
Listen to events (play, pause, ended)
        ↓
Update UI (progress bar, time)
        ↓
Audio finishes or user stops
```

### Favorites Save Flow

```
User clicks heart icon
        ↓
GET /api/favorites/check/:audioId (check status)
        ↓
If not favorited:
    POST /api/favorites { audioId }
        ↓
    FavoritesController.addFavorite()
        ↓
    FavoritesModel.addFavorite()
        ↓
    Insert into favorites table
        ↓
    ✓ Success response
        ↓
    Update heart icon UI
```

## Component Interaction

### Session State Flow

```
Page Load
    ↓
app.js initializes
    ↓
Auth.init()
    ↓
GET /api/auth/status
    ↓
Server checks session
    ↓
Return { isAuthenticated, user }
    ↓
Update Auth object
    ↓
Update UI (show/hide auth buttons)
    ↓
Page ready
```

### Theme Management Flow

```
Page Load
    ↓
Theme.init()
    ↓
Check localStorage for preference
    ↓
If none, check system preference
    ↓
Apply theme (add/remove dark-mode class)
    ↓
Update CSS variables
    ↓
User clicks theme toggle
    ↓
Theme.toggle()
    ↓
Update localStorage
    ↓
Re-apply styles (instant, no page reload)
```

## Request/Response Pattern

### Audio List Request

```javascript
// Frontend
const data = await API.audio.getAll({
  type: 'lullaby',
  category: 'Calm',
  limit: 20,
  offset: 0
});

// Server
GET /api/audio?type=lullaby&category=Calm&limit=20&offset=0

// Response
{
  success: true,
  data: [
    {
      id: 'uuid',
      title: 'Lullaby Name',
      type: 'lullaby',
      category: 'Calm',
      audio_url: 'https://...',
      duration: 300
    },
    // ... more items
  ],
  pagination: {
    limit: 20,
    offset: 0,
    count: 20
  }
}
```

## Security Architecture

### Authentication Layer
```
Request
    ↓
Session Cookie present?
    ├─ No → Redirect to /login
    └─ Yes → Continue
    ↓
req.session.userId set?
    ├─ No → Return 401 Unauthorized
    └─ Yes → Continue
    ↓
User authorized for resource?
    ├─ No → Return 403 Forbidden
    └─ Yes → Process request
    ↓
Response
```

### Database Security (RLS)
```
Query request
    ↓
User authenticated?
    ├─ No → Only public tables accessible
    └─ Yes → Continue
    ↓
RLS policies evaluated
    ├─ SELECT: Can user read this data?
    ├─ INSERT: Can user create this data?
    ├─ UPDATE: Can user modify this data?
    └─ DELETE: Can user remove this data?
    ↓
Only matching rows returned
```

## Error Handling Flow

```
Operation attempted
    ↓
Error occurs
    ↓
Caught by try-catch
    ↓
Log error (server-side)
    ↓
Return error response
    ↓
Frontend catches error
    ↓
UI shows error message (toast)
    ↓
User informed, can retry
```

## State Management

### Frontend State
```
Auth State
├── user object
├── isAuthenticated boolean
└── userRole string

Player State
├── currentAudio object
├── isPlaying boolean
├── currentTime seconds
├── duration seconds
├── volume percentage
├── repeatMode string
└── sleepTimer object

UI State
├── darkMode boolean
├── preferences object
└── cache objects
```

### Server-Side State
```
Session State
├── userId
├── userEmail
├── userName
├── userRole
└── preferences

Request Context
├── Authenticated user ID
├── Request method
├── Request parameters
└── Response status
```

## Cache Strategy

### Frontend Caching
```
API Response
    ↓
Store in memory (JavaScript variable)
    ↓
Cache duration expires?
    ├─ No → Use cached data
    └─ Yes → Fetch fresh data
    ↓
Update cache
```

### Browser Caching
```
Static assets (CSS, JS, images)
    ↓
Set cache headers (ETag, Cache-Control)
    ↓
Browser stores locally
    ↓
Subsequent requests check validity
    ↓
304 Not Modified = use cache
    ↓
200 OK = download new version
```

## Scalability Considerations

### Database Indexes
```
Frequently queried columns:
├── audio_content.type
├── audio_content.category
├── audio_content.created_at
├── favorites.user_id
└── favorites.audio_id
```

### Pagination
```
Large datasets paginated:
├── Default limit: 20 items
├── Max limit: 100 items
├── Offset-based pagination
└── Sort by created_at DESC
```

### Session Management
```
Session storage:
├── Server-side: Session data
├── Client-side: Session cookie
├── TTL: 24 hours
└── Secure, HttpOnly flags
```

## Performance Optimization

### Frontend
- Lazy load images on scroll
- Minimize initial bundle size
- Use CSS variables (no reflows on theme)
- Cache API responses
- Debounce search input

### Backend
- Query pagination
- Database indexes
- Static file compression
- Connection pooling
- Rate limiting

### Database
- Indexed columns
- Optimized queries
- Proper data types
- Archive old data

## Deployment Architecture

```
┌──────────────────────────────────────────┐
│  Client (Browser, Mobile)                │
└────────────────┬─────────────────────────┘
                 │ HTTPS
        ┌────────▼─────────┐
        │ Load Balancer    │
        │ (Optional)       │
        └────────┬─────────┘
                 │
        ┌────────▼──────────────┐
        │ Node.js App Server(s) │
        │ (Can scale multiple)  │
        └────────┬──────────────┘
                 │
        ┌────────▼──────────────┐
        │ Supabase (Managed)    │
        │ ├── PostgreSQL        │
        │ ├── Auth              │
        │ └── Storage           │
        └───────────────────────┘
```

---

**Key Principles:**
- ✅ Separation of Concerns
- ✅ Single Responsibility
- ✅ DRY (Don't Repeat Yourself)
- ✅ Security First
- ✅ User Experience
- ✅ Performance Aware
