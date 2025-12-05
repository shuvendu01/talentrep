#!/bin/bash

# TalentHub - Fix Frontend on AWS Server
# This script applies all the CSS fixes to your AWS production server

echo "============================================================"
echo "TalentHub - Frontend Fix Script for AWS"
echo "============================================================"
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run with sudo: sudo bash FIX_AWS_FRONTEND.sh"
    exit 1
fi

# Set the project directory
# Modify this if your project is in a different location
PROJECT_DIR="/var/www/talenthub"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Check if directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Frontend directory not found: $FRONTEND_DIR"
    echo "Please update PROJECT_DIR in this script to match your installation path"
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
    mv craco.config.js craco.config.js.backup
    echo "✅ Backed up craco.config.js"
fi

# Backup old postcss.config.js if exists
if [ -f "postcss.config.js" ]; then
    mv postcss.config.js postcss.config.js.backup
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
cp tailwind.config.js tailwind.config.js.backup

# Update the content paths
sed -i.tmp 's|content: \[.*\]|content: [\n    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",\n    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",\n    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",\n  ]|' tailwind.config.js

echo "✅ Updated tailwind.config.js"
echo ""

echo "📝 Step 6: Fixing package.json scripts..."
# Create a backup
cp package.json package.json.backup

# Remove the watch script using a more robust method
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (pkg.scripts && pkg.scripts.watch) {
  delete pkg.scripts.watch;
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  console.log('Removed watch script');
}
"
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
        echo "Please create .env file manually with:"
        echo "NEXT_PUBLIC_BACKEND_URL=https://talenthubapi.bisgensolutions.com"
        echo "NEXT_PUBLIC_API_KEY=your-api-key-here"
    fi
else
    echo "✅ .env file exists"
    echo ""
    echo "Current .env contents:"
    cat .env
    echo ""
    echo "⚠️  Make sure NEXT_PUBLIC_BACKEND_URL=https://talenthubapi.bisgensolutions.com"
fi
echo ""

echo "📦 Step 8: Installing dependencies..."
yarn install
echo "✅ Dependencies installed"
echo ""

echo "🔨 Step 9: Building frontend..."
NODE_ENV=production yarn build
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Check the errors above."
    exit 1
fi
echo ""

echo "🚀 Step 10: Starting frontend service..."
supervisorctl start frontend
sleep 5
supervisorctl status frontend
echo ""

echo "🧪 Step 11: Testing frontend..."
sleep 3
curl -s http://localhost:3000 | head -20
if [ $? -eq 0 ]; then
    echo "✅ Frontend is responding!"
else
    echo "❌ Frontend not responding. Check logs:"
    echo "tail -100 /var/log/supervisor/frontend.err.log"
fi
echo ""

echo "============================================================"
echo "✅ Fix Script Complete!"
echo "============================================================"
echo ""
echo "Next steps:"
echo "1. Check frontend status: sudo supervisorctl status"
echo "2. View logs: tail -f /var/log/supervisor/frontend.out.log"
echo "3. Test in browser: https://talenthub.bisgensolutions.com"
echo ""
echo "If issues persist:"
echo "- Check .env has correct API URL (https://talenthubapi.bisgensolutions.com)"
echo "- Check logs: tail -100 /var/log/supervisor/frontend.err.log"
echo "- Verify DNS points to your server IP"
echo ""
