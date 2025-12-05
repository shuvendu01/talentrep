# Manual Fix Steps for AWS Server
## Path: /www/wwwroot/talenthub/app/frontend/

Follow these steps **exactly** on your AWS server to fix the CSS error.

---

## Step 1: SSH into Your Server

```bash
ssh root@YOUR_SERVER_IP
# Or: ssh ubuntu@YOUR_SERVER_IP
```

---

## Step 2: Navigate to Frontend Directory

```bash
cd /www/wwwroot/talenthub/app/frontend
pwd
# Should show: /www/wwwroot/talenthub/app/frontend
```

---

## Step 3: Stop Frontend Service

```bash
supervisorctl stop frontend
# Should show: frontend: stopped
```

---

## Step 4: Clean Build Cache

```bash
rm -rf .next node_modules/.cache
ls -la .next  # Should show: No such file or directory
```

---

## Step 5: Backup Conflicting Files

```bash
# Check if craco.config.js exists
if [ -f "craco.config.js" ]; then
    mv craco.config.js craco.config.js.backup
    echo "Backed up craco.config.js"
fi

# Check if old postcss.config.js exists
if [ -f "postcss.config.js" ]; then
    mv postcss.config.js postcss.config.js.backup
    echo "Backed up postcss.config.js"
fi
```

---

## Step 6: Create New PostCSS Config

```bash
cat > postcss.config.mjs << 'EOF'
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
EOF

# Verify it was created
ls -la postcss.config.mjs
cat postcss.config.mjs
```

---

## Step 7: Fix Tailwind Config

```bash
# Backup first
cp tailwind.config.js tailwind.config.js.backup

# Edit the file
nano tailwind.config.js
```

**Find this section:**
```javascript
content: [
  "./src/**/*.{js,jsx,ts,tsx}",
  "./public/index.html"
],
```

**Change it to:**
```javascript
content: [
  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
],
```

**Save and exit:**
- Press `Ctrl+X`
- Press `Y` (yes)
- Press `Enter`

**Verify the change:**
```bash
grep -A 5 "content:" tailwind.config.js
```

---

## Step 8: Fix package.json

```bash
# Backup first
cp package.json package.json.backup

# Edit the file
nano package.json
```

**Find the "scripts" section and REMOVE this line:**
```json
"watch": "./node_modules/.bin/webpack --watch --config webpack.dev.js",
```

**The scripts section should look like:**
```json
"scripts": {
  "dev": "next dev -p 3000",
  "build": "next build",
  "start": "next dev -p 3000",
  "lint": "next lint"
},
```

**Save and exit:**
- Press `Ctrl+X`
- Press `Y` (yes)
- Press `Enter`

---

## Step 9: Verify/Create .env File

```bash
cat .env
```

**If file doesn't exist or has wrong content, create it:**

```bash
nano .env
```

**Add this content:**
```env
NEXT_PUBLIC_BACKEND_URL=https://talenthubapi.bisgensolutions.com
REACT_APP_BACKEND_URL=https://talenthubapi.bisgensolutions.com
NEXT_PUBLIC_API_KEY=talenthub-api-key-dev-2025-change-in-production
WDS_SOCKET_PORT=443
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
```

**IMPORTANT:** Replace `NEXT_PUBLIC_API_KEY` with your actual API key (must match backend)

**Save and exit:**
- Press `Ctrl+X`
- Press `Y`
- Press `Enter`

**Verify:**
```bash
cat .env | grep BACKEND_URL
# Should show: NEXT_PUBLIC_BACKEND_URL=https://talenthubapi.bisgensolutions.com
```

---

## Step 10: Install Dependencies

```bash
yarn install
# Wait for installation to complete
```

---

## Step 11: Build Frontend

```bash
NODE_ENV=production yarn build
```

**Watch for:**
- ✅ "✓ Compiled successfully"
- ✅ "API URL: https://talenthubapi.bisgensolutions.com"
- ❌ Any errors (stop and report them)

**If build succeeds, you should see:**
```
✓ Generating static pages (45/45)
API URL: https://talenthubapi.bisgensolutions.com  ← This must be CORRECT!
```

---

## Step 12: Start Frontend Service

```bash
supervisorctl start frontend
sleep 5
supervisorctl status frontend
```

**Should show:**
```
frontend                         RUNNING   pid 12345, uptime 0:00:05
```

---

## Step 13: Test Frontend

```bash
# Test locally
curl http://localhost:3000 | head -50

# Should show HTML with TalentHub, NOT the error
```

---

## Step 14: Check Logs

```bash
# Check for errors
tail -50 /var/log/supervisor/frontend.err.log

# Check output
tail -50 /var/log/supervisor/frontend.out.log
```

---

## Step 15: Browser Test

1. Open browser: `https://talenthub.bisgensolutions.com`
2. **Hard refresh:** `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
3. Check if page loads with styling (not blank)
4. Open Developer Tools (F12) → Console → Check for errors

---

## Verification Checklist

Run these commands and verify:

```bash
# 1. Check PostCSS config exists
ls -la postcss.config.mjs
# Should show: postcss.config.mjs

# 2. Check Tailwind content paths
grep -A 5 "content:" tailwind.config.js
# Should show the three paths with src/pages, src/components, src/app

# 3. Check .env has correct API URL
grep BACKEND_URL .env
# Should show: https://talenthubapi.bisgensolutions.com

# 4. Check service is running
supervisorctl status frontend
# Should show: RUNNING

# 5. Test CSS loads
curl http://localhost:3000/_next/static/css/app/layout.css | grep tailwind
# Should show: tailwindcss v3.4.18
```

---

## Troubleshooting

### Issue: Build still fails with CSS error
**Check:**
```bash
ls -la postcss.config.mjs
cat postcss.config.mjs
```

If file doesn't exist or is empty, recreate it (Step 6)

### Issue: Build shows wrong API URL
**Check .env:**
```bash
cat .env
```

Make sure it says `https://talenthubapi.bisgensolutions.com` (with "api" subdomain)

### Issue: Frontend won't start
**Check port 3000:**
```bash
lsof -i :3000
# If something is using it:
kill -9 <PID>
supervisorctl start frontend
```

### Issue: Browser still shows error
1. Clear browser cache completely
2. Hard refresh: `Ctrl+Shift+R`
3. Try incognito/private mode
4. Check if you're on the right URL

### Issue: Permission errors
```bash
chown -R www:www /www/wwwroot/talenthub
# Or if user is 'ubuntu':
chown -R ubuntu:ubuntu /www/wwwroot/talenthub
```

---

## Files Modified Summary

✅ Created:
- `postcss.config.mjs` - New PostCSS config

✅ Modified:
- `tailwind.config.js` - Fixed content paths
- `package.json` - Removed watch script
- `.env` - Verified/created with correct values

✅ Backed up:
- `craco.config.js.backup`
- `postcss.config.js.backup`
- `tailwind.config.js.backup`
- `package.json.backup`

✅ Cleaned:
- `.next/` directory
- `node_modules/.cache/` directory

---

## Expected Result

After all steps:

1. ✅ `supervisorctl status` shows frontend RUNNING
2. ✅ Build output shows correct API URL
3. ✅ Browser loads page with styling (not blank)
4. ✅ No CSS errors in console
5. ✅ Tailwind CSS v3.4.18 loaded

---

## Quick Rollback

If something goes wrong and you want to rollback:

```bash
cd /www/wwwroot/talenthub/app/frontend

# Restore backups
mv tailwind.config.js.backup tailwind.config.js
mv package.json.backup package.json
mv postcss.config.js.backup postcss.config.js
rm postcss.config.mjs

# Rebuild
yarn build
supervisorctl restart frontend
```
