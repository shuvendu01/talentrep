# TalentHub - AWS Frontend Fix Guide

Complete guide to fix the CSS error on your AWS production server.

---

## 🚨 Problem

Frontend showing blank page with error:
```
ModuleParseError: Module parse failed: Unexpected character '@' (1:0)
> @tailwind base;
```

**Root Causes:**
1. Tailwind config has wrong content paths (CRA paths instead of Next.js paths)
2. Missing/incorrect PostCSS configuration
3. Conflicting CRA configuration files
4. Wrong API URL in build

---

## 🔧 Solution: Two Methods

### Method 1: Automated Fix Script (Recommended)

#### Step 1: Upload Fix Script to AWS Server
```bash
# From your local machine, upload the script
scp -i ~/path/to/your-key.pem /app/FIX_AWS_FRONTEND.sh ubuntu@YOUR_SERVER_IP:/tmp/

# SSH into your server
ssh -i ~/path/to/your-key.pem ubuntu@YOUR_SERVER_IP

# Move script to project directory
sudo mv /tmp/FIX_AWS_FRONTEND.sh /var/www/talenthub/
cd /var/www/talenthub
```

#### Step 2: Update Script Path (if needed)
```bash
# Edit the script if your project is not in /var/www/talenthub
sudo nano FIX_AWS_FRONTEND.sh

# Find this line and update if needed:
PROJECT_DIR="/var/www/talenthub"  # Change to your actual path
```

#### Step 3: Run the Script
```bash
cd /var/www/talenthub
sudo bash FIX_AWS_FRONTEND.sh
```

The script will:
- ✅ Stop frontend service
- ✅ Clean build cache
- ✅ Backup conflicting files
- ✅ Create correct PostCSS config
- ✅ Fix Tailwind content paths
- ✅ Remove invalid scripts
- ✅ Verify .env file
- ✅ Install dependencies
- ✅ Build frontend
- ✅ Start frontend service
- ✅ Test the frontend

---

### Method 2: Manual Fix (if script fails)

#### Step 1: SSH into Your Server
```bash
ssh -i ~/path/to/your-key.pem ubuntu@YOUR_SERVER_IP
cd /var/www/talenthub/frontend
```

#### Step 2: Stop Frontend
```bash
sudo supervisorctl stop frontend
```

#### Step 3: Clean Cache
```bash
rm -rf .next node_modules/.cache
```

#### Step 4: Backup Conflicting Files
```bash
# Backup CRA config (if exists)
if [ -f "craco.config.js" ]; then
    mv craco.config.js craco.config.js.backup
fi

# Backup old PostCSS config
if [ -f "postcss.config.js" ]; then
    mv postcss.config.js postcss.config.js.backup
fi
```

#### Step 5: Create New PostCSS Config
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
```

#### Step 6: Fix Tailwind Config
```bash
# Backup first
cp tailwind.config.js tailwind.config.js.backup

# Edit the file
sudo nano tailwind.config.js
```

Find this section:
```javascript
content: [
  "./src/**/*.{js,jsx,ts,tsx}",
  "./public/index.html"
],
```

Change it to:
```javascript
content: [
  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
],
```

Save with: `Ctrl+X`, then `Y`, then `Enter`

#### Step 7: Fix package.json
```bash
# Backup first
cp package.json package.json.backup

# Edit the file
sudo nano package.json
```

Find the "scripts" section and **remove** this line:
```json
"watch": "./node_modules/.bin/webpack --watch --config webpack.dev.js"
```

Should look like:
```json
"scripts": {
  "dev": "next dev -p 3000",
  "build": "next build",
  "start": "next dev -p 3000",
  "lint": "next lint"
},
```

Save with: `Ctrl+X`, then `Y`, then `Enter`

#### Step 8: Verify .env File
```bash
cat .env
```

**CRITICAL:** Ensure it has:
```env
NEXT_PUBLIC_BACKEND_URL=https://talenthubapi.bisgensolutions.com
REACT_APP_BACKEND_URL=https://talenthubapi.bisgensolutions.com
NEXT_PUBLIC_API_KEY=your-api-key-here
```

If wrong or missing, edit:
```bash
sudo nano .env
```

Add the correct values, then save.

#### Step 9: Install Dependencies
```bash
yarn install
```

#### Step 10: Build Frontend
```bash
NODE_ENV=production yarn build
```

Watch for:
- ✅ "Compiled successfully"
- ✅ "API URL: https://talenthubapi.bisgensolutions.com"
- ❌ Any errors (stop and fix)

#### Step 11: Start Frontend
```bash
sudo supervisorctl start frontend
sleep 5
sudo supervisorctl status frontend
```

Should show: `frontend RUNNING`

#### Step 12: Test
```bash
# Test locally
curl http://localhost:3000 | head -20

# Check logs
tail -50 /var/log/supervisor/frontend.out.log
tail -50 /var/log/supervisor/frontend.err.log
```

---

## 🧪 Verification Checklist

### 1. Service Status
```bash
sudo supervisorctl status
```
✅ Expected: `frontend RUNNING`

### 2. Build Logs
```bash
tail -100 /var/log/supervisor/frontend.out.log
```
✅ Expected: "✓ Ready in Xms"
❌ Check for: Any CSS errors

### 3. Error Logs
```bash
tail -100 /var/log/supervisor/frontend.err.log
```
✅ Expected: No new CSS errors
❌ Ignore: Old errors before restart

### 4. Test Homepage
```bash
curl http://localhost:3000 | grep -i "talenthub"
```
✅ Expected: HTML with "TalentHub"

### 5. Test CSS Loading
```bash
curl http://localhost:3000/_next/static/css/app/layout.css | grep tailwind
```
✅ Expected: "tailwindcss v3.4.18"

### 6. Browser Test
Open in browser: `https://talenthub.bisgensolutions.com`
- ✅ Page loads without blank screen
- ✅ Styles applied correctly
- ✅ No console errors (F12 → Console)

---

## 🔍 Troubleshooting

### Issue: Script fails with "Directory not found"
**Solution:** Update PROJECT_DIR in script to match your installation:
```bash
sudo nano FIX_AWS_FRONTEND.sh
# Change: PROJECT_DIR="/var/www/talenthub"
# To your actual path
```

### Issue: Build fails with "Cannot find module"
**Solution:** Reinstall dependencies:
```bash
cd /var/www/talenthub/frontend
rm -rf node_modules
yarn install
yarn build
```

### Issue: Frontend won't start
**Solution:** Check what's using port 3000:
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
sudo supervisorctl start frontend
```

### Issue: Still showing old error
**Solution:** Hard refresh browser:
- Chrome/Firefox: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Clear browser cache completely
- Try incognito/private mode

### Issue: API URL still wrong in build
**Solution:** 
```bash
cd /var/www/talenthub/frontend
cat .env
# Verify: NEXT_PUBLIC_BACKEND_URL=https://talenthubapi.bisgensolutions.com
# If wrong, fix it:
sudo nano .env
# Then rebuild:
yarn build
sudo supervisorctl restart frontend
```

### Issue: Permissions error
**Solution:** Fix ownership:
```bash
sudo chown -R ubuntu:ubuntu /var/www/talenthub
```

---

## 📁 Files Modified Summary

### Created:
- `postcss.config.mjs` - Modern PostCSS config for Next.js

### Backed Up:
- `craco.config.js` → `craco.config.js.backup`
- `postcss.config.js` → `postcss.config.js.backup`
- `tailwind.config.js` → `tailwind.config.js.backup`
- `package.json` → `package.json.backup`

### Modified:
- `tailwind.config.js` - Fixed content paths
- `package.json` - Removed watch script

### Verified:
- `.env` - Correct API URLs

---

## 🚀 Post-Fix Checklist

After fix is applied:

1. ✅ **Test homepage loads**
   ```
   https://talenthub.bisgensolutions.com
   ```

2. ✅ **Test API endpoint**
   ```
   https://talenthubapi.bisgensolutions.com/api/docs
   ```

3. ✅ **Test login flow**
   - Go to login page
   - Enter credentials
   - Verify redirect works

4. ✅ **Check browser console**
   - Open F12 Developer Tools
   - Go to Console tab
   - Should see no CSS errors

5. ✅ **Test navigation**
   - Click through different pages
   - All should load with proper styling

6. ✅ **Mobile test**
   - Test responsive design
   - Check on phone/tablet

---

## 📞 Need Help?

If you're still having issues after following this guide:

1. **Capture logs:**
   ```bash
   tail -200 /var/log/supervisor/frontend.err.log > frontend-error.log
   tail -200 /var/log/supervisor/frontend.out.log > frontend-output.log
   ```

2. **Check file contents:**
   ```bash
   cat /var/www/talenthub/frontend/.env
   cat /var/www/talenthub/frontend/tailwind.config.js
   cat /var/www/talenthub/frontend/postcss.config.mjs
   ```

3. **Verify build output:**
   ```bash
   cd /var/www/talenthub/frontend
   yarn build 2>&1 | tee build.log
   ```

---

## 📋 Quick Commands Reference

```bash
# Stop/Start/Restart
sudo supervisorctl stop frontend
sudo supervisorctl start frontend
sudo supervisorctl restart frontend

# Check status
sudo supervisorctl status

# View logs (live)
tail -f /var/log/supervisor/frontend.out.log
tail -f /var/log/supervisor/frontend.err.log

# View logs (last 100 lines)
tail -100 /var/log/supervisor/frontend.err.log

# Clean and rebuild
cd /var/www/talenthub/frontend
rm -rf .next node_modules/.cache
yarn build
sudo supervisorctl restart frontend

# Test locally
curl http://localhost:3000
curl http://localhost:3000/_next/static/css/app/layout.css | grep tailwind
```

---

## ✅ Expected Result

After applying fixes, you should see:

**Build output:**
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages (45/45)
API URL: https://talenthubapi.bisgensolutions.com ← Correct!
```

**Service status:**
```
frontend RUNNING pid 1234, uptime 0:05:00
```

**Browser:**
- Homepage loads with full styling
- Navigation works
- API calls go to https://talenthubapi.bisgensolutions.com
- No console errors

---

## 🎓 What Was Fixed

**Technical Summary:**

1. **PostCSS Configuration**
   - Moved to `.mjs` format (ES modules)
   - Compatible with Next.js 14

2. **Tailwind Content Paths**
   - Changed from CRA paths to Next.js App Router paths
   - Now correctly scans `src/app/**` directory

3. **Removed CRA Conflicts**
   - Backed up `craco.config.js`
   - Removed webpack watch script

4. **API URL**
   - Verified `.env` has correct subdomain
   - Build now uses `talenthubapi.bisgensolutions.com`

**Why it works now:**
- Next.js can process Tailwind directives correctly
- PostCSS plugin chain executes properly
- No conflicting webpack configurations
- Correct API endpoints configured
