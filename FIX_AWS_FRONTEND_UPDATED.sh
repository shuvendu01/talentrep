#!/bin/bash

# TalentHub - Fix Frontend on AWS Server
# Updated for path: /www/wwwroot/talenthub/app/frontend

echo "============================================================"
echo "TalentHub - Frontend Fix Script for AWS"
echo "============================================================"
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run with sudo: sudo bash FIX_AWS_FRONTEND_UPDATED.sh"
    exit 1
fi

# Set the project directory (UPDATED PATH)
PROJECT_DIR="/www/wwwroot/talenthub/app"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Check if directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Frontend directory not found: $FRONTEND_DIR"
    exit 1
fi

echo "📁 Project directory: $PROJECT_DIR"
echo "📁 Frontend directory: $FRONTEND_DIR"
echo ""

# Navigate to frontend directory
cd "$FRONTEND_DIR" || exit 1

echo "🛑 Step 1: Stopping frontend service..."
supervisorctl stop frontend
echo "✅ Frontend stopped"
echo ""

echo "🗑️  Step 2: Cleaning build cache..."
rm -rf .next node_modules/.cache
echo "✅ Cache cleaned"
echo ""

echo "📝 Step 3: Backing up conflicting files..."
# Backup craco.config.js if exists
if [ -f "craco.config.js" ]; then
    mv craco.config.js craco.config.js.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backed up craco.config.js"
fi

# Backup old postcss.config.js if exists
if [ -f "postcss.config.js" ]; then
    mv postcss.config.js postcss.config.js.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backed up postcss.config.js"
fi
echo ""

echo "📝 Step 4: Creating postcss.config.mjs..."
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
echo "✅ Created postcss.config.mjs"
echo ""

echo "📝 Step 5: Fixing tailwind.config.js..."
# Create a backup
cp tailwind.config.js tailwind.config.js.backup.$(date +%Y%m%d_%H%M%S)

# Use node to properly update the file
node << 'NODESCRIPT'
const fs = require('fs');
let config = fs.readFileSync('tailwind.config.js', 'utf8');

// Replace the content array
config = config.replace(
  /content:\s*\[[\s\S]*?\],/,
  `content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],`
);

fs.writeFileSync('tailwind.config.js', config);
console.log('Tailwind config updated');
NODESCRIPT

echo "✅ Updated tailwind.config.js"
echo ""

echo "📝 Step 6: Fixing package.json scripts..."
# Create a backup
cp package.json package.json.backup.$(date +%Y%m%d_%H%M%S)

# Remove the watch script
node << 'NODESCRIPT'
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (pkg.scripts && pkg.scripts.watch) {
  delete pkg.scripts.watch;
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  console.log('Removed watch script');
}
NODESCRIPT

echo "✅ Fixed package.json"
echo ""

echo "📝 Step 7: Verifying .env file..."
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found, creating from .env.production..."
    if [ -f ".env.production" ]; then
        cp .env.production .env
        echo "✅ Created .env from .env.production"
    else
        echo "❌ No .env.production found either!"
        echo "Creating basic .env file..."
        cat > .env << 'ENVEOF'
NEXT_PUBLIC_BACKEND_URL=https://talenthubapi.bisgensolutions.com
REACT_APP_BACKEND_URL=https://talenthubapi.bisgensolutions.com
NEXT_PUBLIC_API_KEY=your-api-key-here
WDS_SOCKET_PORT=443
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
ENVEOF
        echo "⚠️  IMPORTANT: Update NEXT_PUBLIC_API_KEY in .env file!"
    fi
else
    echo "✅ .env file exists"
fi

echo ""
echo "Current .env contents:"
cat .env
echo ""
echo "⚠️  VERIFY: NEXT_PUBLIC_BACKEND_URL=https://talenthubapi.bisgensolutions.com"
echo "⚠️  VERIFY: NEXT_PUBLIC_API_KEY is set correctly"
echo ""

echo "📦 Step 8: Installing dependencies..."
yarn install --frozen-lockfile || yarn install
echo "✅ Dependencies installed"
echo ""

echo "🗑️  Step 9: Clean cache one more time..."
rm -rf .next node_modules/.cache
echo "✅ Cache cleaned again"
echo ""

echo "🔨 Step 10: Building frontend..."
NODE_ENV=production yarn build
BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Exit code: $BUILD_EXIT_CODE"
    echo ""
    echo "Check the errors above. Common issues:"
    echo "1. Wrong API URL in .env"
    echo "2. Missing API key"
    echo "3. PostCSS config not created properly"
    echo ""
    exit 1
fi
echo ""

echo "🚀 Step 11: Starting frontend service..."
supervisorctl start frontend
sleep 5
supervisorctl status frontend
echo ""

echo "🧪 Step 12: Testing frontend..."
sleep 3

echo "Testing if server responds..."
curl -s http://localhost:3000 > /tmp/frontend-test.html 2>&1
if [ $? -eq 0 ]; then
    if grep -q "TalentHub" /tmp/frontend-test.html; then
        echo "✅ Frontend is responding with content!"
    else
        echo "⚠️  Frontend responding but content might be wrong"
        echo "First 200 chars:"
        head -c 200 /tmp/frontend-test.html
    fi
else
    echo "❌ Frontend not responding. Check logs:"
    echo "tail -100 /var/log/supervisor/frontend.err.log"
fi
rm -f /tmp/frontend-test.html
echo ""

echo "============================================================"
echo "✅ Fix Script Complete!"
echo "============================================================"
echo ""
echo "Next steps:"
echo "1. Check frontend status: sudo supervisorctl status"
echo "2. View logs: tail -f /var/log/supervisor/frontend.out.log"
echo "3. Test in browser: https://talenthub.bisgensolutions.com"
echo "4. Hard refresh browser: Ctrl+Shift+R or clear cache"
echo ""
echo "If issues persist:"
echo "- Verify .env has correct values"
echo "- Check logs: tail -100 /var/log/supervisor/frontend.err.log"
echo "- Restart: sudo supervisorctl restart frontend"
echo ""
