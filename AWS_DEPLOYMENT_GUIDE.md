# TalentHub - AWS Lightsail Deployment Guide

Complete step-by-step guide to deploy TalentHub on AWS Lightsail with custom domain.

---

## 📋 Prerequisites

- AWS Lightsail account
- Domain name (talenthub.bisgensolutions.com)
- SSH client
- Basic Linux command knowledge

---

## 🚀 Step 1: Create AWS Lightsail Instance

### 1.1 Launch Instance
1. Login to AWS Lightsail Console
2. Click "Create instance"
3. Select **Instance location**: Choose region closest to your users (e.g., Mumbai - ap-south-1)
4. Select **Platform**: Linux/Unix
5. Select **Blueprint**: OS Only → Ubuntu 22.04 LTS
6. Choose instance plan:
   - **Minimum**: 2 GB RAM, 2 vCPUs, 60 GB SSD ($12/month)
   - **Recommended**: 4 GB RAM, 2 vCPUs, 80 GB SSD ($24/month)
7. Name your instance: `talenthub-production`
8. Click "Create instance"

### 1.2 Configure Networking
1. Go to instance → Networking tab
2. Add firewall rules:
   ```
   Application    Protocol    Port Range
   SSH            TCP         22
   HTTP           TCP         80
   HTTPS          TCP         443
   Custom         TCP         8001        (Backend API)
   Custom         TCP         3000        (Frontend - optional for testing)
   Custom         TCP         27017       (MongoDB - only from localhost)
   ```

---

## 🔌 Step 2: Connect to Instance

### 2.1 SSH Connection
```bash
# Download SSH key from Lightsail console
chmod 400 ~/Downloads/LightsailDefaultKey-ap-south-1.pem

# Connect to instance
ssh -i ~/Downloads/LightsailDefaultKey-ap-south-1.pem ubuntu@YOUR_INSTANCE_PUBLIC_IP
```

---

## 📦 Step 3: Install Dependencies

### 3.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 3.2 Install Node.js 18+
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version

# Install Yarn globally
sudo npm install -g yarn
```

### 3.3 Install Python 3.10+
```bash
# Ubuntu 22.04 comes with Python 3.10
python3 --version  # Should show 3.10.x

# Install pip and venv
sudo apt install -y python3-pip python3-venv
```

### 3.4 Install MongoDB 6.0
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse\" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update and install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

### 3.5 Install Nginx
```bash
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3.6 Install Supervisor
```bash
sudo apt install -y supervisor

# Start Supervisor
sudo systemctl start supervisor
sudo systemctl enable supervisor
```

### 3.7 Install Additional Tools
```bash
# For document conversion (resume parsing)
sudo apt install -y unoconv libreoffice-writer

# For PDF processing
sudo apt install -y poppler-utils

# Build essentials
sudo apt install -y build-essential
```

---

## 📁 Step 4: Setup Application

### 4.1 Create Application Directory
```bash
sudo mkdir -p /var/www/talenthub
sudo chown -R $USER:$USER /var/www/talenthub
cd /var/www/talenthub
```

### 4.2 Clone or Upload Code
```bash
# Option 1: Using Git
git clone YOUR_REPOSITORY_URL .

# Option 2: Using SCP (from your local machine)
scp -i ~/Downloads/LightsailDefaultKey.pem -r /path/to/talenthub/* ubuntu@YOUR_IP:/var/www/talenthub/
```

---

## ⚙️ Step 5: Configure Backend

### 5.1 Setup Python Virtual Environment
```bash
cd /var/www/talenthub/backend
python3 -m venv venv
source venv/bin/activate
```

### 5.2 Install Python Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 5.3 Configure Backend Environment
```bash
# Copy production env template
cp .env.production .env

# Edit .env file
nano .env
```

**Update `.env` with production values:**
```env
# MongoDB Configuration
MONGO_URL=\"mongodb://localhost:27017\"
DB_NAME=\"talenthub\"

# CORS Configuration
CORS_ORIGINS=\"https://talenthub.bisgensolutions.com\"

# Frontend URL
FRONTEND_URL=\"https://talenthub.bisgensolutions.com\"

# JWT Configuration
JWT_SECRET_KEY=\"YOUR_SECURE_RANDOM_STRING_MIN_32_CHARS_HERE\"
JWT_REFRESH_SECRET_KEY=\"ANOTHER_SECURE_RANDOM_STRING_MIN_32_CHARS_HERE\"
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30

# API Key (MUST match frontend)
API_KEY=\"YOUR_SECURE_API_KEY_HERE\"

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=\"your_aws_access_key\"
AWS_SECRET_ACCESS_KEY=\"your_aws_secret_key\"
AWS_REGION=\"ap-south-1\"
S3_BUCKET_NAME=\"talenthub-resumes\"

# Email Configuration (GoDaddy SMTP)
SMTP_HOST=\"smtpout.secureserver.net\"
SMTP_PORT=465
SMTP_USER=\"noreply@bisgensolutions.com\"
SMTP_PASSWORD=\"your_email_password\"
SMTP_FROM=\"noreply@bisgensolutions.com\"
```

**Generate secure keys:**
```bash
# Generate JWT secrets
python3 -c \"import secrets; print(secrets.token_urlsafe(32))\"  # Use for JWT_SECRET_KEY
python3 -c \"import secrets; print(secrets.token_urlsafe(32))\"  # Use for JWT_REFRESH_SECRET_KEY

# Generate API key
python3 -c \"import secrets; print(secrets.token_urlsafe(48))\"  # Use for API_KEY
```

### 5.4 Setup Admin User
```bash
# Create admin user
python3 setup_admin.py
```

---

## 🎨 Step 6: Configure Frontend

### 6.1 Install Frontend Dependencies
```bash
cd /var/www/talenthub/frontend
yarn install
```

### 6.2 Configure Frontend Environment
```bash
# Copy production env template
cp .env.production .env

# Edit .env file
nano .env
```

**Update `.env` with production values:**
```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=https://talenthubapi.bisgensolutions.com
REACT_APP_BACKEND_URL=https://talenthubapi.bisgensolutions.com

# API Key (MUST match backend API_KEY)
NEXT_PUBLIC_API_KEY=\"YOUR_SECURE_API_KEY_HERE\"

# WebSocket Port
WDS_SOCKET_PORT=443

# Feature Flags
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
```

### 6.3 Build Frontend (Optional for Production)
```bash
# Build Next.js for production
yarn build

# Note: We'll use development mode for now with supervisor
```

---

## 🔧 Step 7: Configure Supervisor

### 7.1 Create Supervisor Config
```bash
sudo nano /etc/supervisor/conf.d/talenthub.conf
```

**Add this configuration:**
```ini
[program:talenthub-backend]
command=/var/www/talenthub/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001 --workers 2
directory=/var/www/talenthub/backend
autostart=true
autorestart=true
stderr_logfile=/var/log/talenthub/backend.err.log
stdout_logfile=/var/log/talenthub/backend.out.log
user=ubuntu
environment=PATH=\"/var/www/talenthub/backend/venv/bin\"

[program:talenthub-frontend]
command=/usr/bin/yarn start
directory=/var/www/talenthub/frontend
autostart=true
autorestart=true
stderr_logfile=/var/log/talenthub/frontend.err.log
stdout_logfile=/var/log/talenthub/frontend.out.log
user=ubuntu
environment=PATH=\"/usr/bin:/bin\",NODE_ENV=\"production\",PORT=\"3000\"
```

### 7.2 Create Log Directory
```bash
sudo mkdir -p /var/log/talenthub
sudo chown -R ubuntu:ubuntu /var/log/talenthub
```

### 7.3 Reload and Start Services
```bash
# Reload supervisor configuration
sudo supervisorctl reread
sudo supervisorctl update

# Start services
sudo supervisorctl start talenthub-backend
sudo supervisorctl start talenthub-frontend

# Check status
sudo supervisorctl status
```

---

## 🌐 Step 8: Configure Nginx

### 8.1 Create Nginx Configuration

We'll configure TWO domains:
- **Frontend:** https://talenthub.bisgensolutions.com (Next.js on port 3000)
- **Backend API:** https://talenthubapi.bisgensolutions.com (FastAPI on port 8001)

#### Create Frontend Configuration:
```bash
sudo nano /etc/nginx/sites-available/talenthub-frontend
```

**Add this configuration:**
```nginx
# Redirect HTTP to HTTPS (Frontend)
server {
    listen 80;
    server_name talenthub.bisgensolutions.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server (Frontend)
server {
    listen 443 ssl http2;
    server_name talenthub.bisgensolutions.com;

    # SSL Certificate (will be configured with Certbot)
    ssl_certificate /etc/letsencrypt/live/talenthub.bisgensolutions.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/talenthub.bisgensolutions.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;

    # Client max body size for file uploads
    client_max_body_size 10M;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Create Backend API Configuration:
```bash
sudo nano /etc/nginx/sites-available/talenthub-backend
```

**Add this configuration:**
```nginx
# Redirect HTTP to HTTPS (Backend API)
server {
    listen 80;
    server_name talenthubapi.bisgensolutions.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server (Backend API)
server {
    listen 443 ssl http2;
    server_name talenthubapi.bisgensolutions.com;

    # SSL Certificate (will be configured with Certbot)
    ssl_certificate /etc/letsencrypt/live/talenthubapi.bisgensolutions.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/talenthubapi.bisgensolutions.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Access-Control-Allow-Origin \"https://talenthub.bisgensolutions.com\" always;
    add_header Access-Control-Allow-Methods \"GET, POST, PUT, DELETE, OPTIONS\" always;
    add_header Access-Control-Allow-Headers \"X-API-Key, Authorization, Content-Type\" always;

    # Client max body size for file uploads
    client_max_body_size 10M;

    # Backend API (all routes)
    location / {
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin \"https://talenthub.bisgensolutions.com\" always;
            add_header Access-Control-Allow-Methods \"GET, POST, PUT, DELETE, OPTIONS\" always;
            add_header Access-Control-Allow-Headers \"X-API-Key, Authorization, Content-Type\" always;
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type \"text/plain charset=UTF-8\";
            add_header Content-Length 0;
            return 204;
        }

        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeout for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 8.2 Enable Sites
```bash
# Create symbolic links for both configurations
sudo ln -s /etc/nginx/sites-available/talenthub-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/talenthub-backend /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx (don't restart yet, need SSL first)
```

---

## 🔒 Step 9: Setup SSL Certificate

### 9.1 Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 9.2 Configure Domain DNS
Before running Certbot, ensure BOTH domains DNS are configured:

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add/Update DNS records for BOTH domains:
   ```
   Type: A Record
   Host: talenthub
   Value: YOUR_LIGHTSAIL_PUBLIC_IP
   TTL: 3600
   
   Type: A Record
   Host: talenthubapi
   Value: YOUR_LIGHTSAIL_PUBLIC_IP
   TTL: 3600
   ```
3. Wait 5-10 minutes for DNS propagation
4. Test DNS for both domains:
   ```bash
   nslookup talenthub.bisgensolutions.com
   nslookup talenthubapi.bisgensolutions.com
   ```

### 9.3 Obtain SSL Certificates
```bash
# Obtain certificates for BOTH domains
sudo certbot --nginx -d talenthub.bisgensolutions.com -d talenthubapi.bisgensolutions.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose redirect HTTP to HTTPS (option 2)

# Test auto-renewal
sudo certbot renew --dry-run
```

### 9.4 Reload Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔍 Step 10: Verify Deployment

### 10.1 Check Services
```bash
# Check Supervisor services
sudo supervisorctl status

# Check Nginx
sudo systemctl status nginx

# Check MongoDB
sudo systemctl status mongod

# Check logs
tail -f /var/log/talenthub/backend.out.log
tail -f /var/log/talenthub/frontend.out.log
```

### 10.2 Test Application
1. Open browser: `https://talenthub.bisgensolutions.com`
2. Test API: `https://talenthubapi.bisgensolutions.com/docs`
3. Test API health: `https://talenthubapi.bisgensolutions.com/health`
4. Register a test user
5. Login and test functionality

---

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check logs
tail -100 /var/log/talenthub/backend.err.log

# Common issues:
# 1. MongoDB not running
sudo systemctl start mongod

# 2. Port already in use
sudo lsof -i :8001
sudo kill -9 PID

# 3. Python environment
cd /var/www/talenthub/backend
source venv/bin/activate
python3 -c \"import fastapi; print('OK')\"

# Restart backend
sudo supervisorctl restart talenthub-backend
```

### Frontend Not Starting
```bash
# Check logs
tail -100 /var/log/talenthub/frontend.err.log

# Common issues:
# 1. Node modules not installed
cd /var/www/talenthub/frontend
yarn install

# 2. Port conflict
sudo lsof -i :3000
sudo kill -9 PID

# 3. Build issues
rm -rf .next node_modules/.cache
yarn install

# Restart frontend
sudo supervisorctl restart talenthub-frontend
```

### Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test connection
mongosh
> show dbs
> use talenthub
> db.users.countDocuments()
```

### SSL Certificate Issues
```bash
# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Check Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### API Key Not Working
```bash
# Verify API keys match in both .env files
grep API_KEY /var/www/talenthub/backend/.env
grep NEXT_PUBLIC_API_KEY /var/www/talenthub/frontend/.env

# They MUST be identical!
```

---

## 🔐 Security Best Practices

### 1. Firewall Configuration
```bash
# Use Lightsail firewall rules (already done in Step 1.2)
# Ensure MongoDB (27017) is only accessible from localhost
```

### 2. MongoDB Security
```bash
# Enable MongoDB authentication (optional but recommended)
mongosh
> use admin
> db.createUser({
    user: \"talenthub_admin\",
    pwd: \"SECURE_PASSWORD_HERE\",
    roles: [{ role: \"userAdminAnyDatabase\", db: \"admin\" }]
  })

# Update MongoDB config
sudo nano /etc/mongod.conf
# Add:
security:
  authorization: enabled

# Restart MongoDB
sudo systemctl restart mongod

# Update backend .env
MONGO_URL=\"mongodb://talenthub_admin:SECURE_PASSWORD_HERE@localhost:27017/talenthub?authSource=admin\"
```

### 3. Regular Updates
```bash
# Create update script
sudo nano /usr/local/bin/update-talenthub.sh

#!/bin/bash
cd /var/www/talenthub
git pull
cd backend
source venv/bin/activate
pip install -r requirements.txt
cd ../frontend
yarn install
sudo supervisorctl restart talenthub-backend
sudo supervisorctl restart talenthub-frontend

# Make executable
sudo chmod +x /usr/local/bin/update-talenthub.sh
```

### 4. Backup Script
```bash
# Create backup script
sudo nano /usr/local/bin/backup-talenthub.sh

#!/bin/bash
BACKUP_DIR=\"/var/backups/talenthub\"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --db talenthub --out $BACKUP_DIR/db_$DATE

# Backup files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/talenthub

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

# Make executable
sudo chmod +x /usr/local/bin/backup-talenthub.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
0 2 * * * /usr/local/bin/backup-talenthub.sh
```

---

## 📊 Monitoring

### Log Monitoring
```bash
# Watch all logs
tail -f /var/log/talenthub/*.log

# Watch specific service
tail -f /var/log/talenthub/backend.out.log

# Search for errors
grep -i error /var/log/talenthub/*.log
```

### System Resources
```bash
# Check disk space
df -h

# Check memory
free -h

# Check CPU
htop

# Check running processes
ps aux | grep -E \"(uvicorn|node|mongod)\"
```

---

## 🎉 Deployment Complete!

Your TalentHub application is now live at:
- **Frontend**: https://talenthub.bisgensolutions.com
- **API Docs**: https://talenthub.bisgensolutions.com/api/docs
- **ReDoc**: https://talenthub.bisgensolutions.com/api/redoc

---

## 📞 Support

For issues or questions:
- Email: contact@bisgensolutions.com
- Check logs: `/var/log/talenthub/`
- Supervisor status: `sudo supervisorctl status`

---

## 📝 Quick Commands Reference

```bash
# Restart services
sudo supervisorctl restart talenthub-backend
sudo supervisorctl restart talenthub-frontend
sudo supervisorctl restart all

# Check status
sudo supervisorctl status

# View logs
tail -f /var/log/talenthub/backend.out.log
tail -f /var/log/talenthub/backend.err.log
tail -f /var/log/talenthub/frontend.out.log

# Restart Nginx
sudo systemctl reload nginx

# Restart MongoDB
sudo systemctl restart mongod

# Update SSL certificate
sudo certbot renew

# Backup database
mongodump --db talenthub --out /var/backups/talenthub/$(date +%Y%m%d)
```
