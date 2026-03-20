# TimeKids API Reference

Complete documentation of all API endpoints for the TimeKids application.

## 📋 Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Audio Content](#audio-content)
- [Favorites](#favorites)
- [User](#user)
- [Admin](#admin)
- [Error Handling](#error-handling)

---

## Base URL

```
http://localhost:3000/api
```

Production: `https://timekids.app/api`

## Authentication

All protected endpoints require:
- Valid session cookie (`connect.sid`)
- Authenticated user ID in session

### Check Auth Status

```http
GET /auth/status
```

**Response:**
```json
{
  "success": true,
  "isAuthenticated": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

---

## Audio Content

### List All Audio

```http
GET /audio
```

**Query Parameters:**
- `type` (string): "lullaby" or "story"
- `category` (string): Category name
- `search` (string): Search term
- `limit` (integer): Results per page (default: 20)
- `offset` (integer): Pagination offset (default: 0)

**Example:**
```
GET /audio?type=lullaby&category=Calm&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Twinkle Twinkle Little Star",
      "type": "lullaby",
      "category": "Calm",
      "audio_url": "https://...",
      "description": "Classic lullaby",
      "duration": 180,
      "created_at": "2024-03-20T10:30:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "count": 10
  }
}
```

---

### Get Single Audio

```http
GET /audio/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Twinkle Twinkle Little Star",
    "type": "lullaby",
    "category": "Calm",
    "audio_url": "https://...",
    "description": "Classic lullaby",
    "duration": 180,
    "created_at": "2024-03-20T10:30:00Z"
  }
}
```

---

### Get by Type

```http
GET /audio/type/:type
```

**Parameters:**
- `type`: "lullaby" or "story"

**Response:**
```json
{
  "success": true,
  "type": "lullaby",
  "data": [...],
  "count": 25
}
```

---

### Get by Category

```http
GET /audio/category/:category
```

**Response:**
```json
{
  "success": true,
  "category": "Calm",
  "data": [...],
  "count": 12
}
```

---

### Get All Categories

```http
GET /audio/categories
```

**Response:**
```json
{
  "success": true,
  "data": ["Calm", "Nature", "Piano", "Fairytale", "Fantasy"],
  "count": 5
}
```

---

### Search Audio

```http
GET /audio/search?q=rain&type=lullaby
```

**Query Parameters:**
- `q` (string, required): Search term (min 2 chars)
- `type` (string): Filter by type
- `category` (string): Filter by category

**Response:**
```json
{
  "success": true,
  "query": "rain",
  "filters": {
    "type": "lullaby",
    "category": null
  },
  "data": [...],
  "count": 3
}
```

---

## Favorites

All favorite endpoints require authentication.

### Get User's Favorites

```http
GET /favorites
Authorization: Session Cookie
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "favorite-uuid",
      "audio_id": "audio-uuid",
      "created_at": "2024-03-20T10:30:00Z",
      "audio_content": {
        "id": "audio-uuid",
        "title": "Twinkle Twinkle Little Star",
        "type": "lullaby",
        "category": "Calm",
        "audio_url": "https://...",
        "description": "Classic lullaby",
        "duration": 180
      }
    }
  ],
  "count": 5
}
```

---

### Check if Favorited

```http
GET /favorites/check/:audioId
Authorization: Session Cookie
```

**Response:**
```json
{
  "success": true,
  "audioId": "audio-uuid",
  "isFavorited": true
}
```

---

### Add to Favorites

```http
POST /favorites
Authorization: Session Cookie
Content-Type: application/json

{
  "audioId": "audio-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Added to favorites",
  "data": {
    "id": "favorite-uuid",
    "user_id": "user-uuid",
    "audio_id": "audio-uuid",
    "created_at": "2024-03-20T10:30:00Z"
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Already in favorites"
}
```

---

### Remove from Favorites

```http
DELETE /favorites/:audioId
Authorization: Session Cookie
```

**Response:**
```json
{
  "success": true,
  "message": "Removed from favorites",
  "audioId": "audio-uuid"
}
```

---

### Get Favorite Count

```http
GET /favorites/count
Authorization: Session Cookie
```

**Response:**
```json
{
  "success": true,
  "count": 12
}
```

---

### Get Trending Audio

```http
GET /favorites/trending?limit=10
```

**Query Parameters:**
- `limit` (integer): Number of results (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "audioId": "audio-uuid",
      "favoriteCount": 45
    }
  ],
  "count": 10
}
```

---

## User

All user endpoints require authentication.

### Get Profile

```http
GET /user/profile
Authorization: Session Cookie
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

---

### Get Preferences

```http
GET /user/preferences
Authorization: Session Cookie
```

**Response:**
```json
{
  "success": true,
  "preferences": {
    "darkMode": true,
    "soundEnabled": true,
    "volume": 70,
    "autoResume": true
  }
}
```

---

### Save Preferences

```http
POST /user/preferences
Authorization: Session Cookie
Content-Type: application/json

{
  "darkMode": true,
  "soundEnabled": true,
  "volume": 75,
  "autoResume": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Preferences updated",
  "preferences": {
    "darkMode": true,
    "soundEnabled": true,
    "volume": 75,
    "autoResume": true
  }
}
```

---

### Get Listening History

```http
GET /user/history
Authorization: Session Cookie
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "audioId": "audio-uuid",
      "timestamp": "2024-03-20T10:30:00Z"
    }
  ],
  "count": 15
}
```

---

### Add to History

```http
POST /user/history
Authorization: Session Cookie
Content-Type: application/json

{
  "audioId": "audio-uuid",
  "timestamp": "2024-03-20T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "History updated"
}
```

---

## Admin

All admin endpoints require:
- Authentication
- Admin role

### Get Statistics

```http
GET /admin/stats
Authorization: Session Cookie (Admin Only)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAudio": 50,
    "lullabies": 30,
    "stories": 20,
    "categories": 8
  }
}
```

---

### Create Audio Content

```http
POST /admin/audio
Authorization: Session Cookie (Admin Only)
Content-Type: application/json

{
  "title": "New Lullaby",
  "type": "lullaby",
  "category": "Calm",
  "audio_url": "https://...",
  "description": "A beautiful lullaby",
  "duration": 300
}
```

**Response:**
```json
{
  "success": true,
  "message": "Audio content created",
  "data": {
    "id": "new-audio-uuid",
    "title": "New Lullaby",
    "type": "lullaby",
    "category": "Calm",
    "audio_url": "https://...",
    "description": "A beautiful lullaby",
    "duration": 300,
    "created_at": "2024-03-20T10:30:00Z"
  }
}
```

---

### Update Audio Content

```http
PUT /admin/audio/:id
Authorization: Session Cookie (Admin Only)
Content-Type: application/json

{
  "title": "Updated Title",
  "category": "Nature",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Audio content updated",
  "data": {
    "id": "audio-uuid",
    "title": "Updated Title",
    ...
  }
}
```

---

### Delete Audio Content

```http
DELETE /admin/audio/:id
Authorization: Session Cookie (Admin Only)
```

**Response:**
```json
{
  "success": true,
  "message": "Audio content deleted"
}
```

---

### Upload Audio File

```http
POST /admin/upload
Authorization: Session Cookie (Admin Only)
Content-Type: multipart/form-data

[File data]
```

**Note:** Requires multer middleware configuration

---

## Authentication Endpoints

### Sign Up

```http
POST /auth/signup
Content-Type: application/json

{
  "name": "User Name",
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Signup successful. Please check your email to confirm.",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  }
}
```

---

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name"
  },
  "session": {
    "accessToken": "eyJ..."
  }
}
```

---

### Logout

```http
POST /auth/logout
Authorization: Session Cookie
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "status": 400
}
```

### HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Permission denied |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Already exists |
| 500 | Internal Server Error |

### Common Errors

**Not Authenticated:**
```json
{
  "success": false,
  "error": "Not authenticated",
  "status": 401
}
```

**Not Authorized:**
```json
{
  "success": false,
  "error": "Admin access required",
  "status": 403
}
```

**Validation Error:**
```json
{
  "success": false,
  "error": "Email and password are required",
  "status": 400
}
```

---

## Rate Limiting

Currently no rate limiting implemented. For production, implement:
- 100 requests per hour per IP
- 1000 requests per hour per user
- Exponential backoff for retries

---

## Pagination

List endpoints support pagination:

**Parameters:**
- `limit`: Items per page (default: 20, max: 100)
- `offset`: Number of items to skip (default: 0)

**Example:**
```
GET /audio?limit=20&offset=40
```

Returns items 40-59.

---

## Caching Headers

Recommended cache settings:

```
Public Resources (audio content):
  Cache-Control: public, max-age=3600

User Resources (favorites, history):
  Cache-Control: private, max-age=300

Admin Resources:
  Cache-Control: no-cache, no-store
```

---

## CORS Headers

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type
```

---

## Testing Endpoints

### Using cURL

```bash
# Get all audio
curl http://localhost:3000/api/audio

# Search
curl "http://localhost:3000/api/audio/search?q=rain"

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get favorites (authenticated)
curl http://localhost:3000/api/favorites \
  -H "Cookie: connect.sid=..."
```

### Using JavaScript

```javascript
// GET request
const response = await fetch('/api/audio/categories');
const data = await response.json();

// POST request
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
```

---

**Last Updated:** March 2024
**API Version:** 1.0.0
**Status:** ✅ Complete
