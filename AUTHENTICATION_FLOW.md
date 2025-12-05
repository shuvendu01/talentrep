# TalentHub Authentication & Authorization Flow

Complete guide to understanding the dual authentication system in TalentHub.

---

## 🔐 Two-Layer Security System

TalentHub uses a **two-layer security system**:

1. **API Key Authentication** (X-API-Key header) - For ALL requests
2. **JWT Authorization** (Authorization header) - For protected/user-specific resources

---

## 📊 Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT REQUEST                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: API Key Validation (Middleware)                       │
│  Header: X-API-Key: <your-api-key>                             │
│  ✓ Validates API key                                            │
│  ✗ Returns 401/403 if invalid/missing                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2: JWT Token Validation (Route Level)                    │
│  Header: Authorization: Bearer <jwt-token>                      │
│  ✓ Validates JWT token for protected routes                     │
│  ✗ Returns 401 if invalid/missing (for protected routes)        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: Role-Based Access Control (Optional)                  │
│  ✓ Validates user role for admin/specific routes                │
│  ✗ Returns 403 if insufficient permissions                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  ROUTE HANDLER  │
                    └─────────────────┘
```

---

## 🔑 Layer 1: API Key Authentication

### Purpose:
Prevents unauthorized access to your API from unknown applications/clients.

### Configuration:
- **Backend:** Set `API_KEY` in `.env`
- **Frontend:** Set `NEXT_PUBLIC_API_KEY` in `.env` (must match backend)

### How it works:
1. Every request MUST include `X-API-Key` header
2. Middleware validates the key before processing request
3. If invalid/missing: Returns `401 Unauthorized` or `403 Forbidden`

### Example Request:
```bash
curl -X GET "https://talenthubapi.bisgensolutions.com/api/jobs/jobs" \
  -H "X-API-Key: your-secure-api-key-here"
```

### Excluded Endpoints:
API key is NOT required for documentation endpoints:
- `/api/docs` (Swagger UI)
- `/api/redoc` (ReDoc)
- `/api/openapi.json` (OpenAPI spec)

---

## 🎫 Layer 2: JWT Authorization (User Authentication)

### Purpose:
Identifies and authenticates individual users for protected resources.

### How to Get JWT Token:

#### Step 1: Login
**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Headers Required:**
```
X-API-Key: your-secure-api-key-here
Content-Type: application/json
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "job_seeker",
    "credits_free": 200,
    "credits_paid": 0
  }
}
```

#### Step 2: Store Token
```javascript
// Frontend (JavaScript)
localStorage.setItem('authToken', response.data.access_token);
localStorage.setItem('user', JSON.stringify(response.data.user));
```

#### Step 3: Use Token in Subsequent Requests
**Headers Required:**
```
X-API-Key: your-secure-api-key-here
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## 🔒 Protected Routes & Required Headers

### Public Routes (Only API Key Required):
These routes don't need JWT token, only API key:

```
✓ GET  /api/jobs/jobs           - Browse jobs (X-API-Key only)
✓ GET  /api/jobs/jobs/{id}      - View job details (X-API-Key only)
✓ POST /api/auth/login          - Login (X-API-Key only)
✓ POST /api/auth/register       - Register (X-API-Key only)
✓ GET  /api/companies           - List companies (X-API-Key only)
```

### Protected Routes (API Key + JWT Token):
These routes require BOTH headers:

```
🔒 GET  /api/auth/me                    - Get current user
🔒 GET  /api/profiles/jobseeker/profile - Get/update profile
🔒 POST /api/jobs/applications          - Apply to job
🔒 GET  /api/jobs/applications/my-applications - My applications
🔒 GET  /api/credits/balance            - Check credits
🔒 POST /api/contacts/reveal            - Reveal contact
🔒 POST /api/interviews/requests        - Request interview
🔒 GET  /api/sessions/active            - Active sessions
🔒 GET  /api/login-history              - Login history
```

### Admin-Only Routes (API Key + JWT Token + Admin Role):
These routes require admin role:

```
👨‍💼 GET  /api/admin/users              - User management
👨‍💼 POST /api/admin/users/{id}        - Update user
👨‍💼 GET  /api/admin/login-history      - All login history
👨‍💼 DELETE /api/admin/sessions/{id}   - Force logout user
👨‍💼 GET  /api/credits/admin/transactions - All transactions
```

---

## 📝 Complete Request Examples

### Example 1: Login (Get JWT Token)
```bash
curl -X POST "https://talenthubapi.bisgensolutions.com/api/auth/login" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response includes access_token
```

### Example 2: Get Current User (Protected Route)
```bash
curl -X GET "https://talenthubapi.bisgensolutions.com/api/auth/me" \
  -H "X-API-Key: your-api-key" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Example 3: Browse Jobs (Public Route)
```bash
curl -X GET "https://talenthubapi.bisgensolutions.com/api/jobs/jobs?location=Bangalore&limit=10" \
  -H "X-API-Key: your-api-key"
```

### Example 4: Apply to Job (Protected Route)
```bash
curl -X POST "https://talenthubapi.bisgensolutions.com/api/jobs/applications" \
  -H "X-API-Key: your-api-key" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "job-uuid",
    "cover_letter": "I am interested in this position..."
  }'
```

### Example 5: Admin - View All Users
```bash
curl -X GET "https://talenthubapi.bisgensolutions.com/api/admin/users" \
  -H "X-API-Key: your-api-key" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  
# Note: Token must belong to admin user
```

---

## 🔐 Frontend Implementation

### Automatic Header Injection
The frontend (`/app/frontend/src/lib/api.js`) automatically adds both headers:

```javascript
import api from '@/lib/api';

// API key is automatically added to all requests
// JWT token is automatically added if user is logged in

// Example: Get current user
const response = await api.get('/auth/me');

// Example: Apply to job
const response = await api.post('/jobs/applications', {
  job_id: 'job-uuid',
  cover_letter: 'Cover letter text'
});
```

### Manual Header Configuration (if needed):
```javascript
import axios from 'axios';

const response = await axios.get(
  'https://talenthubapi.bisgensolutions.com/api/auth/me',
  {
    headers: {
      'X-API-Key': process.env.NEXT_PUBLIC_API_KEY,
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json'
    }
  }
);
```

---

## 🎯 Quick Reference

### Which Header Do I Need?

| Route Type | X-API-Key | Authorization | Role Check |
|-----------|-----------|---------------|------------|
| Public (jobs, login) | ✓ Required | ✗ Not needed | ✗ No |
| Protected (profile, apply) | ✓ Required | ✓ Required | ✗ No |
| Admin routes | ✓ Required | ✓ Required | ✓ Admin only |

### Header Formats:
```
X-API-Key: your-secure-api-key-here
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### JWT Token Expiry:
- **Access Token:** 60 minutes (default)
- **Refresh Token:** 30 days (default)
- After expiry, user must login again

---

## 🔄 Token Refresh Flow (Future Enhancement)

Current implementation requires re-login after token expiry. For automatic refresh:

```javascript
// Future implementation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        const response = await api.post('/auth/refresh', {
          refresh_token: refreshToken
        });
        localStorage.setItem('authToken', response.data.access_token);
        // Retry original request
        return api.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 🚨 Error Responses

### 401 Unauthorized (Missing/Invalid API Key):
```json
{
  "detail": "API key is required. Please include X-API-Key header.",
  "error_code": "MISSING_API_KEY"
}
```

### 403 Forbidden (Invalid API Key):
```json
{
  "detail": "Invalid API key provided.",
  "error_code": "INVALID_API_KEY"
}
```

### 401 Unauthorized (Missing/Invalid JWT Token):
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden (Insufficient Permissions):
```json
{
  "detail": "Admin access required"
}
```

---

## 📋 Security Best Practices

### 1. API Key Security:
- ✓ Use different API keys for dev/staging/production
- ✓ Never commit API keys to git
- ✓ Rotate API keys periodically
- ✓ Use environment variables

### 2. JWT Token Security:
- ✓ Store tokens in httpOnly cookies (more secure) or localStorage
- ✓ Never share tokens
- ✓ Implement token refresh for better UX
- ✓ Clear tokens on logout

### 3. HTTPS:
- ✓ Always use HTTPS in production
- ✓ Tokens and API keys sent over HTTP can be intercepted

### 4. CORS:
- ✓ Configure CORS to only allow your frontend domain
- ✓ Don't use wildcard (*) in production

---

## 🧪 Testing with Swagger UI

### Access Swagger UI:
```
https://talenthubapi.bisgensolutions.com/api/docs
```

### Using Swagger UI with Authentication:

#### Step 1: Set API Key (Required)
Unfortunately, Swagger UI doesn't have a built-in way to add custom headers like X-API-Key. You have two options:

**Option A: Use browser extensions**
- Install "ModHeader" Chrome extension
- Add header: `X-API-Key: your-api-key`

**Option B: Use Authorize button for JWT**
1. Login via `/api/auth/login` endpoint
2. Copy the `access_token` from response
3. Click "Authorize" button (🔒 icon)
4. Enter: `Bearer <your-token>`
5. Click "Authorize"

**Recommendation:** Use tools like Postman or Thunder Client instead of Swagger UI for full testing with custom headers.

---

## 📱 Mobile App Integration

For mobile apps (React Native, Flutter, etc.):

### Headers Configuration:
```javascript
// React Native example
const API_KEY = 'your-api-key';
const API_URL = 'https://talenthubapi.bisgensolutions.com/api';

// Login
const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  // Store token securely
  await AsyncStorage.setItem('authToken', data.access_token);
  return data;
};

// Protected request
const getProfile = async () => {
  const token = await AsyncStorage.getItem('authToken');
  
  const response = await fetch(`${API_URL}/profiles/jobseeker/profile`, {
    headers: {
      'X-API-Key': API_KEY,
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

---

## 🎓 Summary

**For ALL requests:**
```
X-API-Key: your-secure-api-key
```

**For protected routes (user-specific data):**
```
X-API-Key: your-secure-api-key
Authorization: Bearer <jwt-token-from-login>
```

**For admin routes:**
```
X-API-Key: your-secure-api-key
Authorization: Bearer <admin-jwt-token-from-login>
```

**Which API returns the authorization token?**
- **Login API:** `POST /api/auth/login`
- **Returns:** `access_token` (use as JWT token)
- **Use in:** `Authorization: Bearer <access_token>` header

---

## 📞 Need Help?

- Check Swagger UI: https://talenthubapi.bisgensolutions.com/api/docs
- Review error responses in browser console
- Check backend logs: `tail -f /var/log/talenthub/backend.err.log`
