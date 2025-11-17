# Registration Testing Guide

## ✅ Registration is Now Working!

### Backend API Test (Confirmed Working)
```bash
curl -X POST https://careerlink-52.preview.emergentagent.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "role": "jobseeker"}'
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "role": "jobseeker",
    "credits_free": 200
  }
}
```

## How to Register via Frontend

1. **Visit Registration Page:**
   - Go to: `https://careerlink-52.preview.emergentagent.com/auth/register`

2. **Fill the Form:**
   - Select Role: Job Seeker, Employer, or Interviewer
   - Enter Email: Your valid email address
   - Enter Phone (optional): Your phone number

3. **Click "Create Account"**
   - You'll see a success message
   - Automatically receive signup bonus credits:
     - Job Seeker: 200 credits
     - Employer: 10,000 credits
     - Interviewer: 500 credits

4. **Redirect to Login**
   - After 2 seconds, you'll be redirected to login page

## Recent Fixes Applied

✅ **CORS Configuration**: Moved CORS middleware to correct position
✅ **API Client**: Added better error handling and SSR compatibility
✅ **Next.js Suspense**: Wrapped searchParams in Suspense for proper hydration
✅ **Frontend URL**: Updated backend to use production URL for magic links
✅ **Error Messages**: Enhanced error display in forms

## Login Flow

1. **Request Magic Link:**
   - Go to `/auth/login`
   - Enter registered email
   - Click "Send Magic Link"

2. **Check Email:**
   - Open your email inbox
   - Find email from: contact@bisgensolutions.com
   - Click the magic link

3. **Auto Login:**
   - Magic link will verify and log you in
   - Redirect to your dashboard based on role

## Test Accounts

You can register with any email. Here are some test examples:

- **Job Seeker**: `jobseeker@test.com`
- **Employer**: `employer@test.com`
- **Interviewer**: `interviewer@test.com`
- **Super Admin** (Already exists): `contact@bisgensolutions.com`

## Troubleshooting

### If Registration Still Fails:

1. **Check Browser Console:**
   - Press F12 > Console tab
   - Look for any red error messages
   - Share the error with me

2. **Check Network Tab:**
   - F12 > Network tab
   - Click "Create Account"
   - Look for `/api/auth/register` request
   - Check if it's 200 OK or error

3. **Try Different Browser:**
   - Chrome (recommended)
   - Firefox
   - Safari

4. **Clear Cache:**
   - Clear browser cache and cookies
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Common Issues:

**Email Already Exists:**
- Error: "Email already registered"
- Solution: Use a different email or login instead

**Phone Already Exists:**
- Error: "Phone number already registered"
- Solution: Use a different phone number or leave it empty

**Network Error:**
- Error: "Failed to register"
- Solution: Check internet connection, refresh page

## Next Steps After Registration

1. **Login** with magic link
2. **View Dashboard** with your credits
3. **Explore Features** based on your role
4. **Complete Profile** (Coming in Iteration 2)

## Support

If you still face issues after trying the above steps, please share:
- The exact error message
- Browser console screenshot
- Network tab screenshot (F12 > Network)

I'll help you debug immediately!
