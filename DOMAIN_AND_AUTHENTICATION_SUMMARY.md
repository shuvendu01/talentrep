# TalentHub - Domain Configuration & Authentication Summary

## 🌐 Domain Structure

Your TalentHub application is configured with **two separate domains**:

### Frontend Domain:
```
https://talenthub.bisgensolutions.com
```
- **Purpose:** User interface (Next.js application)
- **Runs on:** Port 3000 (internal)
- **Accessible to:** Public users
- **Configuration:** `/app/frontend/.env`

### Backend API Domain:
```
https://talenthubapi.bisgensolutions.com
```
- **Purpose:** REST API (FastAPI application)
- **Runs on:** Port 8001 (internal)
- **Accessible to:** Frontend + mobile apps + third-party clients
- **Configuration:** `/app/backend/.env`
- **API Documentation:** 
  - Swagger UI: https://talenthubapi.bisgensolutions.com/api/docs
  - ReDoc: https://talenthubapi.bisgensolutions.com/api/redoc

---

## 🔑 Two-Layer Authentication System

### Layer 1: API Key (X-API-Key Header)
**Purpose:** Prevent unauthorized applications from accessing your API

**Required for:** ALL API requests (except documentation endpoints)

**Configuration:**
```env
# Backend (.env)
API_KEY="your-secure-api-key-here"

# Frontend (.env)
NEXT_PUBLIC_API_KEY="your-secure-api-key-here"  # Must match backend!
```

**Usage:**
```bash
curl -H "X-API-Key: your-secure-api-key-here" \
     https://talenthubapi.bisgensolutions.com/api/jobs/jobs
```

**Excluded Endpoints:** (No API key required)
- `/api/docs` - Swagger UI
- `/api/redoc` - ReDoc documentation
- `/api/openapi.json` - OpenAPI specification

---

### Layer 2: JWT Authorization (Authorization Header)
**Purpose:** Authenticate individual users and provide access to user-specific resources

**Required for:** Protected routes (user profiles, applications, admin functions)

**How to Get JWT Token:**

#### Step 1: Login Request
```bash
POST https://talenthubapi.bisgensolutions.com/api/auth/login

Headers:
  X-API-Key: your-secure-api-key-here
  Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Step 2: Login Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlci11dWlkIiwicm9sZSI6ImpvYl9zZWVrZXIiLCJleHAiOjE3MDkwMDAwMDB9.signature",
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

#### Step 3: Use Token in Protected Requests
```bash
GET https://talenthubapi.bisgensolutions.com/api/auth/me

Headers:
  X-API-Key: your-secure-api-key-here
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 Complete Header Requirements by Route Type

### 1. Public Routes (API Key Only)
Routes that don't require user authentication:

```
✓ POST /api/auth/login          - Login
✓ POST /api/auth/register       - Register new user
✓ GET  /api/jobs/jobs           - Browse jobs
✓ GET  /api/jobs/jobs/{id}      - View job details
✓ GET  /api/companies           - List companies
```

**Required Headers:**
```
X-API-Key: your-secure-api-key-here
Content-Type: application/json
```

**Example:**
```bash
curl -X GET "https://talenthubapi.bisgensolutions.com/api/jobs/jobs?location=Bangalore" \
  -H "X-API-Key: your-secure-api-key-here"
```

---

### 2. Protected Routes (API Key + JWT Token)
Routes that require user authentication:

```
🔒 GET  /api/auth/me                    - Get current user info
🔒 GET  /api/profiles/jobseeker/profile - Get/update job seeker profile
🔒 GET  /api/profiles/employer/profile  - Get/update employer profile
🔒 POST /api/jobs/applications          - Apply to job
🔒 GET  /api/jobs/applications/my-applications - View my applications
🔒 GET  /api/credits/balance            - Check credit balance
🔒 GET  /api/credits/transactions       - View transaction history
🔒 POST /api/contacts/reveal            - Reveal candidate contact
🔒 POST /api/interviews/requests        - Request interview
🔒 GET  /api/sessions/active            - View active sessions
🔒 GET  /api/login-history              - View login history
🔒 POST /api/sessions/logout            - Logout session
```

**Required Headers:**
```
X-API-Key: your-secure-api-key-here
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Example:**
```bash
curl -X GET "https://talenthubapi.bisgensolutions.com/api/auth/me" \
  -H "X-API-Key: your-secure-api-key-here" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. Admin-Only Routes (API Key + Admin JWT Token)
Routes that require admin role:

```
👨‍💼 GET    /api/admin/users              - List all users
👨‍💼 GET    /api/admin/users/{id}         - Get user details
👨‍💼 PUT    /api/admin/users/{id}         - Update user
👨‍💼 DELETE /api/admin/users/{id}         - Delete user
👨‍💼 POST   /api/admin/users/{id}/ban     - Ban user
👨‍💼 GET    /api/admin/login-history      - All users login history
👨‍💼 DELETE /api/admin/sessions/{user_id} - Force logout user
👨‍💼 GET    /api/credits/admin/transactions - All credit transactions
👨‍💼 POST   /api/credits/admin/add-credits  - Add credits to user
👨‍💼 POST   /api/credits/admin/deduct-credits - Deduct credits from user
```

**Required Headers:**
```
X-API-Key: your-secure-api-key-here
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json
```

**Note:** The JWT token must belong to a user with `role: "admin"`

**Example:**
```bash
curl -X GET "https://talenthubapi.bisgensolutions.com/api/admin/users?page=1&limit=20" \
  -H "X-API-Key: your-secure-api-key-here" \
  -H "Authorization: Bearer <admin-jwt-token>"
```

---

## 🔄 Complete Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  1. USER VISITS FRONTEND                                         │
│     https://talenthub.bisgensolutions.com                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. USER CLICKS LOGIN                                            │
│     Frontend shows login form                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. FRONTEND SENDS LOGIN REQUEST                                 │
│     POST https://talenthubapi.bisgensolutions.com/api/auth/login│
│     Headers:                                                     │
│       X-API-Key: <from NEXT_PUBLIC_API_KEY>                     │
│     Body:                                                        │
│       { email, password }                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. BACKEND VALIDATES API KEY (Middleware)                       │
│     ✓ API key valid → Continue                                   │
│     ✗ API key invalid → Return 401/403                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. BACKEND VALIDATES CREDENTIALS                                │
│     ✓ Credentials valid → Generate JWT token                    │
│     ✗ Credentials invalid → Return 401                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. BACKEND RETURNS JWT TOKEN                                    │
│     Response:                                                    │
│     {                                                            │
│       access_token: "eyJhbGci...",                              │
│       user: { id, email, role, ... }                            │
│     }                                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. FRONTEND STORES TOKEN                                        │
│     localStorage.setItem('authToken', access_token)             │
│     localStorage.setItem('user', JSON.stringify(user))          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  8. USER PERFORMS PROTECTED ACTION (e.g., Apply to Job)         │
│     Frontend sends request with BOTH headers                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  9. FRONTEND SENDS PROTECTED REQUEST                             │
│     POST https://talenthubapi.bisgensolutions.com/api/jobs/     │
│          applications                                            │
│     Headers:                                                     │
│       X-API-Key: <from env>                                     │
│       Authorization: Bearer <from localStorage>                 │
│     Body:                                                        │
│       { job_id, cover_letter }                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  10. BACKEND VALIDATES BOTH                                      │
│      ✓ API key valid (middleware)                               │
│      ✓ JWT token valid (route handler)                          │
│      ✓ User exists and authorized                               │
│      → Process request                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  11. SUCCESS RESPONSE                                            │
│      Job application created                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Answer to Your Questions

### Q1: Can we call backend with https://talenthubapi.bisgensolutions.com?
**Answer:** ✅ YES! This is now configured.

**Configuration Updated:**
- Backend accessible at: `https://talenthubapi.bisgensolutions.com`
- Frontend accessible at: `https://talenthub.bisgensolutions.com`
- Environment files updated with correct domains

---

### Q2: Are password-protected pages secured with authorization key?
**Answer:** ✅ YES! They use JWT token in Authorization header.

**How it works:**
1. **Login API** (`POST /api/auth/login`) returns JWT token
2. **JWT Token** is stored in localStorage
3. **Protected routes** require this token in `Authorization: Bearer <token>` header
4. **Backend validates** the token for each protected request
5. **Invalid/expired token** = User redirected to login

**Example:**
```javascript
// Frontend automatically adds Authorization header
const response = await api.get('/auth/me');

// Under the hood, it sends:
// Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Q3: Which API returns the authorization key?
**Answer:** The **Login API** returns the JWT token (authorization key).

**API Endpoint:**
```
POST https://talenthubapi.bisgensolutions.com/api/auth/login
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlci11dWlkIiwicm9sZSI6ImpvYl9zZWVrZXIiLCJleHAiOjE3MDkwMDAwMDB9.signature",
  "token_type": "bearer",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "job_seeker"
  }
}
```

**The `access_token` field IS the authorization key!**

---

### Q4: How is the authorization key used in headers?
**Answer:** Include it in the `Authorization` header with `Bearer` prefix.

**Header Format:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Complete Request Example:**
```bash
curl -X GET "https://talenthubapi.bisgensolutions.com/api/auth/me" \
  -H "X-API-Key: your-api-key-here" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Frontend Implementation (Automatic):**
```javascript
// File: /app/frontend/src/lib/api.js
// This is done automatically!

api.interceptors.request.use(
  (config) => {
    // Add API key
    config.headers['X-API-Key'] = process.env.NEXT_PUBLIC_API_KEY;
    
    // Add JWT token if user is logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  }
);

// Usage (headers added automatically):
const response = await api.get('/auth/me');
```

---

## 📝 Environment Files Configuration

### Backend: `/app/backend/.env`
```env
# MongoDB
MONGO_URL="mongodb://localhost:27017"
DB_NAME="talenthub"

# CORS (Allow frontend domain)
CORS_ORIGINS="https://talenthub.bisgensolutions.com"

# URLs
FRONTEND_URL="https://talenthub.bisgensolutions.com"
BACKEND_URL="https://talenthubapi.bisgensolutions.com"

# JWT Configuration (for Authorization header)
JWT_SECRET_KEY="your-secure-random-string-32-chars"
JWT_REFRESH_SECRET_KEY="another-secure-random-string-32-chars"
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30

# API Key (for X-API-Key header)
API_KEY="your-secure-api-key-here"
```

### Frontend: `/app/frontend/.env`
```env
# Backend API URL (subdomain)
NEXT_PUBLIC_BACKEND_URL=https://talenthubapi.bisgensolutions.com
REACT_APP_BACKEND_URL=https://talenthubapi.bisgensolutions.com

# API Key (must match backend!)
NEXT_PUBLIC_API_KEY="your-secure-api-key-here"
```

---

## 🚀 DNS Configuration Required

Add TWO A records in your domain DNS:

```
Type: A Record
Host: talenthub
Value: <YOUR_LIGHTSAIL_PUBLIC_IP>
TTL: 3600

Type: A Record
Host: talenthubapi
Value: <YOUR_LIGHTSAIL_PUBLIC_IP>
TTL: 3600
```

---

## 🧪 Testing Guide

### Test 1: Frontend Accessible
```bash
curl https://talenthub.bisgensolutions.com
# Should return HTML
```

### Test 2: Backend API Accessible
```bash
curl https://talenthubapi.bisgensolutions.com/api/docs
# Should return Swagger UI HTML
```

### Test 3: API Key Required
```bash
# Without API key (should fail)
curl https://talenthubapi.bisgensolutions.com/api/jobs/jobs

# With API key (should work)
curl -H "X-API-Key: your-api-key" \
     https://talenthubapi.bisgensolutions.com/api/jobs/jobs
```

### Test 4: JWT Authorization
```bash
# Login to get token
curl -X POST "https://talenthubapi.bisgensolutions.com/api/auth/login" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use token for protected route
curl -X GET "https://talenthubapi.bisgensolutions.com/api/auth/me" \
  -H "X-API-Key: your-api-key" \
  -H "Authorization: Bearer <token-from-login>"
```

---

## 📚 Related Documentation

- **Full Authentication Flow:** `/app/AUTHENTICATION_FLOW.md`
- **AWS Deployment Guide:** `/app/AWS_DEPLOYMENT_GUIDE.md`
- **Swagger UI:** https://talenthubapi.bisgensolutions.com/api/docs (after deployment)

---

## ✅ Summary

✓ **Two Domains Configured:**
  - Frontend: https://talenthub.bisgensolutions.com
  - Backend API: https://talenthubapi.bisgensolutions.com

✓ **Two-Layer Security:**
  - Layer 1: API Key (X-API-Key header) for ALL requests
  - Layer 2: JWT Token (Authorization header) for protected routes

✓ **Authorization Key:**
  - Returned by: `POST /api/auth/login`
  - Field name: `access_token`
  - Used in: `Authorization: Bearer <access_token>` header

✓ **Protected Routes:**
  - Require BOTH headers: X-API-Key + Authorization
  - JWT token identifies and authenticates the user
  - Role-based access control for admin routes

✓ **Environment Files:**
  - Updated with correct domain structure
  - Production templates ready at `.env.production`
