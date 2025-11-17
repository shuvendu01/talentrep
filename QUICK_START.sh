#!/bin/bash

# ===============================================
# TalentHub - Quick Start Setup Script
# For Ubuntu 20.04/22.04 on AWS
# ===============================================

echo "=========================================="
echo "   TalentHub Quick Start Setup"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

echo "✓ Running as root"
echo ""

# Update system
echo "Step 1/10: Updating system..."
apt update && apt upgrade -y
echo "✓ System updated"
echo ""

# Install Python
echo "Step 2/10: Installing Python..."
apt install python3 python3-pip python3-venv -y
echo "✓ Python installed"
echo ""

# Install Node.js and Yarn
echo "Step 3/10: Installing Node.js and Yarn..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install nodejs -y
npm install -g yarn
echo "✓ Node.js and Yarn installed"
echo ""

# Install MongoDB
echo "Step 4/10: Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install mongodb-org -y
systemctl start mongod
systemctl enable mongod
echo "✓ MongoDB installed and started"
echo ""

# Install Nginx
echo "Step 5/10: Installing Nginx..."
apt install nginx -y
systemctl start nginx
systemctl enable nginx
echo "✓ Nginx installed and started"
echo ""

# Install Supervisor
echo "Step 6/10: Installing Supervisor..."
apt install supervisor -y
systemctl start supervisor
systemctl enable supervisor
echo "✓ Supervisor installed and started"
echo ""

# Install LibreOffice for PDF conversion
echo "Step 7/10: Installing LibreOffice (PDF conversion)..."
apt install unoconv libreoffice -y
echo "✓ LibreOffice installed"
echo ""

# Create app directory
echo "Step 8/10: Creating application directory..."
mkdir -p /var/www/talenthub
mkdir -p /var/log/talenthub
chown -R www-data:www-data /var/log/talenthub
echo "✓ Directories created"
echo ""

# Setup Firewall
echo "Step 9/10: Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable
echo "✓ Firewall configured"
echo ""

# Install Certbot for SSL
echo "Step 10/10: Installing Certbot (SSL)..."
apt install certbot python3-certbot-nginx -y
echo "✓ Certbot installed"
echo ""

echo "=========================================="
echo "   Setup Complete! ✓"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Upload your TalentHub project to /var/www/talenthub"
echo "2. Copy .env.example files and configure them:"
echo "   - /var/www/talenthub/backend/.env"
echo "   - /var/www/talenthub/frontend/.env"
echo "3. Follow DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
echo "Quick commands:"
echo "  - Check status: sudo supervisorctl status"
echo "  - View logs: sudo tail -f /var/log/talenthub/backend.out.log"
echo "  - Restart services: sudo supervisorctl restart all"
echo ""
