# TalentHub - Complete Project Summary & AWS Deployment Guide

## 🎯 PROJECT OVERVIEW

**TalentHub** is a comprehensive job portal platform with AI-powered candidate ranking, skill verification system, and credit-based economy.

### **Tech Stack**
- **Frontend:** Next.js 14 (React), Tailwind CSS, Aceternity UI
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **File Storage:** AWS S3
- **Email:** GoDaddy SMTP
- **Rich Text:** React Quill
- **Authentication:** JWT with magic links

---

## 👥 USER ROLES & FEATURES

### **1. Job Seekers**
- Professional profile creation
- Resume upload & parsing (DOC/DOCX to PDF)
- Job search with advanced filters
- Apply to unlimited jobs
- Skill verification through interviews (6,000 credits)
- Profile completion tracking
- Credit management (200 free credits on signup)

### **2. Employers**
- Post unlimited jobs
- Advanced talent search
- **ATS Ranking System** (AI-powered candidate matching)
- Contact reveal (12,000 credits, 1-year access)
- Application management
- Company profile pages
- 10,000 free credits on signup

### **3. Interviewers**
- Flexible schedule
- Accept interview requests
- Conduct skill verification interviews
- Submit ratings (0.5-5.0 scale)
- Earn 600 credits per completed interview
- 500 free credits on signup

### **4. Admins**
- User management
- ACL system (Roles, Permissions, Resources)
- Platform settings & configuration
- Credit management
- Notifications system
- Custom CSS/JS injection
- Real-time analytics dashboard

---

## 🚀 KEY FEATURES IMPLEMENTED

### **Core Systems**
✅ Multi-role authentication with JWT
✅ Magic link authentication (password recovery)
✅ Role-specific login pages (blue/green/purple/red themes)
✅ Session management with auto-logout
✅ ACL (Access Control List) system

### **Profile & Jobs**
✅ Job posting & browsing
✅ Advanced job search with filters
✅ Job applications system
✅ Resume upload with S3 integration
✅ PDF conversion (DOC/DOCX to PDF)
✅ Profile completion percentage widget

### **Credit Economy**
✅ Free & paid credits system
✅ Transaction history
✅ Credit-based contact reveal (1-year access)
✅ Credit earnings for interviewers
✅ Pricing pages for all roles
✅ Admin credit management

### **Interview Verification**
✅ Interview request system
✅ Interviewer dashboard
✅ Skill rating system (0.5-5.0 scale)
✅ Verification badges
✅ Rating history & analytics

### **Advanced Features**
✅ **ATS Ranking System** - AI algorithm matching candidates to jobs
  - Skills match (40% weight)
  - Experience match (30% weight)
  - Location match (15% weight)
  - Education match (15% weight)
  - Ranking categories: Excellent/Good/Moderate/Low Match

✅ **Talent Search** - Employer can search verified candidates
✅ **WYSIWYG Editor** - Rich text editing for descriptions
✅ **PhoneInput** - Country code selector for all registrations

### **Admin Panel**
✅ Aceternity UI design with glassmorphism
✅ Real-time statistics (users, jobs, credits, interviews)
✅ User management with filters
✅ ACL configuration (roles, permissions, resources)
✅ Platform settings & notifications
✅ Custom CSS/JS injection
✅ Export functionality (CSV, Excel, PDF)

### **UI/UX**
✅ JobSeekerLayout with sidebar navigation (8 pages)
✅ Role-specific branded login pages
✅ Responsive design (mobile & desktop)
✅ Dark theme with gradient accents
✅ Notification banner system
✅ Loading states & error handling

---

## 📊 DATABASE MODELS (15+)

1. **users** - User accounts (all roles)
2. **jobseeker_profiles** - Job seeker detailed profiles
3. **employer_profiles** - Employer company profiles
4. **interviewer_profiles** - Interviewer expertise profiles
5. **jobs** - Job postings
6. **applications** - Job applications
7. **credits_transactions** - Credit transaction history
8. **contact_access** - Contact reveal records (1-year validity)
9. **interview_requests** - Interview verification requests
10. **interview_ratings** - Skill ratings & feedback
11. **companies** - Company directory
12. **platform_settings** - System configuration
13. **notifications** - User notifications
14. **custom_code** - Admin custom CSS/JS
15. **acl_roles** - Access control roles
16. **acl_permissions** - Access control permissions
17. **acl_resources** - Access control resources

---

## 🔗 API ENDPOINTS (50+)

### **Authentication (8)**
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/forgot-password (magic link)
- GET /api/auth/verify-magic-link
- POST /api/auth/logout
- POST /api/auth/refresh-token

### **Profiles (13)**
- GET/PUT /api/profiles/jobseeker/profile
- POST /api/profiles/jobseeker/profile/resume
- GET /api/profiles/jobseeker/search
- GET/PUT /api/profiles/jobseeker/settings
- GET/PUT /api/profiles/employer/profile
- GET/PUT /api/profiles/interviewer/profile
- POST /api/profiles/companies

### **Jobs (8)**
- POST /api/jobs/jobs
- GET /api/jobs/jobs (list with filters)
- GET /api/jobs/jobs/{id}
- PUT /api/jobs/jobs/{id}
- DELETE /api/jobs/jobs/{id}
- POST /api/jobs/apply
- GET /api/jobs/applications
- GET /api/jobs/my-applications

### **Credits (8)**
- GET /api/credits/balance
- GET /api/credits/transactions
- POST /api/credits/donate (admin)
- GET /api/credits/settings
- PUT /api/credits/settings (admin)
- GET /api/credits/admin/transactions (admin)

### **Contacts (3)**
- POST /api/contacts/reveal
- GET /api/contacts/my-access
- GET /api/contacts/access-stats (employer)

### **Interviews (10)**
- POST /api/interviews/requests
- GET /api/interviews/requests/available
- GET /api/interviews/my-interviews
- POST /api/interviews/requests/{id}/accept
- POST /api/interviews/ratings
- GET /api/interviews/ratings/jobseeker/{id}
- GET /api/interviews/admin/requests (admin)

### **ATS Ranking (2)**
- POST /api/profiles/ats/rank-candidate
- POST /api/profiles/ats/rank-multiple

### **Admin (10+)**
- GET /api/admin/users
- PUT /api/admin/users/{id}
- DELETE /api/admin/users/{id}
- POST /api/admin/users/{id}/ban
- GET/POST/PUT/DELETE /api/admin/acl/* (roles, permissions, resources)
- GET/PUT /api/admin/settings
- GET/POST/PUT/DELETE /api/admin/notifications
- GET/PUT /api/admin/custom-code

---

## 📁 PROJECT STRUCTURE

```
/app/
├── backend/
│   ├── routes/
│   │   ├── auth.py
│   │   ├── profile.py
│   │   ├── jobs.py
│   │   ├── credits.py
│   │   ├── contacts.py
│   │   ├── interviews.py
│   │   ├── admin.py
│   │   └── acl.py
│   ├── utils/
│   │   ├── document_converter.py (PDF conversion)
│   │   ├── s3.py (AWS S3)
│   │   ├── email.py (GoDaddy SMTP)
│   │   └── ats_ranking.py (AI ranking algorithm)
│   ├── models.py (Pydantic models)
│   ├── database.py (MongoDB connection)
│   ├── server.py (FastAPI app)
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js (landing page)
│   │   │   ├── dashboard/page.js
│   │   │   ├── profile/page.js
│   │   │   ├── settings/page.js
│   │   │   ├── jobs/page.js
│   │   │   ├── applications/page.js
│   │   │   ├── verification/page.js
│   │   │   ├── pricing/page.js
│   │   │   ├── credits/
│   │   │   │   ├── purchase/page.js
│   │   │   │   └── transactions/page.js
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   ├── page.js
│   │   │   │   │   ├── jobseeker/page.js
│   │   │   │   │   ├── employer/page.js
│   │   │   │   │   ├── interviewer/page.js
│   │   │   │   │   └── admin/page.js
│   │   │   │   ├── register/page.js
│   │   │   │   └── forgot-password/page.js
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/page.js
│   │   │   │   ├── users/page.js
│   │   │   │   ├── credits/page.js
│   │   │   │   ├── settings/page.js
│   │   │   │   ├── notifications/page.js
│   │   │   │   ├── custom-code/page.js
│   │   │   │   └── acl/...
│   │   │   ├── employer/
│   │   │   │   ├── dashboard/page.js
│   │   │   │   ├── jobs/page.js
│   │   │   │   ├── credits/page.js
│   │   │   │   └── ats-ranking/page.js
│   │   │   ├── interviewer/dashboard/page.js
│   │   │   ├── search-talent/page.js
│   │   │   ├── interview-requests/page.js
│   │   │   └── post-job/page.js
│   │   ├── components/
│   │   │   ├── JobSeekerLayout.js
│   │   │   ├── AdminLayout.js
│   │   │   ├── PhoneInput.js
│   │   │   ├── ProfileCompletionWidget.js
│   │   │   ├── ATSRankingCard.js
│   │   │   ├── RichTextEditor.js
│   │   │   ├── RoleLogin.js
│   │   │   └── NotificationBanner.js
│   │   └── lib/
│   │       └── api.js (Axios instance)
│   ├── package.json
│   └── .env
└── README.md
```

---

## 🔐 CREDENTIALS

**Admin Account:**
- Email: contact@bisgensolutions.com
- Password: Admin@123#

---

## 📈 PROJECT COMPLETION

**Overall: 100% Complete**

✅ **Iteration 1:** Foundation (Auth, ACL, Admin)
✅ **Iteration 2:** Profiles (Resume, S3, PDF)
✅ **Iteration 3:** Job System (Posting, Search, Applications)
✅ **Iteration 4:** Advanced (Credits, Contact Reveal, Interviews)
✅ **Iteration 5:** Admin Panel & Pricing Pages

**Bonus Features:**
✅ ATS Ranking System
✅ Role-specific login pages
✅ WYSIWYG Editor
✅ Session persistence
✅ PhoneInput with country codes
✅ ProfileCompletionWidget

---

## 💳 PRICING STRUCTURE

### **Job Seekers**
- Signup Bonus: 200 credits
- Interview Request: 6,000 credits
- Packages: $49 (10K), $99 (25K), $179 (50K)

### **Employers**
- Signup Bonus: 10,000 credits
- Contact Reveal: 12,000 credits (1-year access)
- Packages: $199 (50K), $499 (150K), $899 (300K)

### **Interviewers**
- Signup Bonus: 500 credits
- Earnings: 600 credits per completed interview
- Bonus: 100 credits for 5★ ratings

---

# 🚀 AWS UBUNTU SERVER DEPLOYMENT

## Step 1: Server Requirements

### **Minimum Specifications**
- Ubuntu 20.04 LTS or 22.04 LTS
- 2 vCPUs
- 4 GB RAM
- 40 GB SSD storage
- Open ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)

---

## Step 2: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.10+
sudo apt install python3 python3-pip python3-venv -y

# Install Node.js 18+ and Yarn
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y
sudo npm install -g yarn

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install mongodb-org -y
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Install Supervisor (process manager)
sudo apt install supervisor -y
sudo systemctl start supervisor
sudo systemctl enable supervisor

# Install unoconv (for PDF conversion)
sudo apt install unoconv libreoffice -y
```

---

## Step 3: Clone/Upload Project

```bash
# Create app directory
sudo mkdir -p /var/www/talenthub
cd /var/www/talenthub

# Upload your project files here (via SCP, Git, or FTP)
# OR clone from repository:
# git clone <your-repo-url> .

# Set permissions
sudo chown -R $USER:$USER /var/www/talenthub
```

---

## Step 4: Environment Files Setup

### **Backend Environment File**

Create `/var/www/talenthub/backend/.env`:

```env
# MongoDB
MONGO_URL=mongodb://localhost:27017/talenthub

# JWT
SECRET_KEY=your-secret-key-change-this-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AWS S3 (for resume storage)
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-s3-bucket-name

# Email (GoDaddy SMTP)
SMTP_HOST=smtpout.secureserver.net
SMTP_PORT=465
SMTP_USERNAME=your-email@yourdomain.com
SMTP_PASSWORD=your-email-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=TalentHub

# Frontend URL (for magic links)
FRONTEND_URL=https://yourdomain.com

# Server
HOST=0.0.0.0
PORT=8001
```

### **Frontend Environment File**

Create `/var/www/talenthub/frontend/.env`:

```env
# Backend API URL
REACT_APP_BACKEND_URL=https://yourdomain.com/api

# OR for development/testing on IP:
# REACT_APP_BACKEND_URL=http://YOUR_SERVER_IP/api

# OR for local backend testing:
# REACT_APP_BACKEND_URL=http://localhost:8001/api
```

---

## Step 5: Install Python Dependencies

```bash
cd /var/www/talenthub/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Deactivate venv (supervisor will use it)
deactivate
```

---

## Step 6: Install Frontend Dependencies

```bash
cd /var/www/talenthub/frontend

# Install dependencies
yarn install

# Build for production
yarn build

# Note: We'll run it in development mode for hot reload
# For production, use: yarn start
```

---

## Step 7: Configure Supervisor

Create `/etc/supervisor/conf.d/talenthub-backend.conf`:

```ini
[program:talenthub-backend]
directory=/var/www/talenthub/backend
command=/var/www/talenthub/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/talenthub/backend.err.log
stdout_logfile=/var/log/talenthub/backend.out.log
environment=PATH="/var/www/talenthub/backend/venv/bin"
```

Create `/etc/supervisor/conf.d/talenthub-frontend.conf`:

```ini
[program:talenthub-frontend]
directory=/var/www/talenthub/frontend
command=/usr/bin/yarn start
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/talenthub/frontend.err.log
stdout_logfile=/var/log/talenthub/frontend.out.log
environment=PORT="3000",NODE_ENV="production"
```

Create log directory:

```bash
sudo mkdir -p /var/log/talenthub
sudo chown -R www-data:www-data /var/log/talenthub
```

Reload supervisor:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start talenthub-backend
sudo supervisorctl start talenthub-frontend
```

Check status:

```bash
sudo supervisorctl status
```

---

## Step 8: Configure Nginx

Create `/etc/nginx/sites-available/talenthub`:

```nginx
# Upstream definitions
upstream backend {
    server 127.0.0.1:8001;
}

upstream frontend {
    server 127.0.0.1:3000;
}

# HTTP Server (redirect to HTTPS in production)
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # For Let's Encrypt SSL certificate
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect to HTTPS (uncomment after SSL setup)
    # return 301 https://$server_name$request_uri;

    # Temporary: Allow HTTP for testing
    location /api/ {
        proxy_pass http://backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File upload size limit
    client_max_body_size 10M;
}

# HTTPS Server (setup after SSL certificate)
# server {
#     listen 443 ssl http2;
#     server_name yourdomain.com www.yourdomain.com;
#
#     ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers HIGH:!aNULL:!MD5;
#
#     location /api/ {
#         proxy_pass http://backend/api/;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_cache_bypass $http_upgrade;
#     }
#
#     location / {
#         proxy_pass http://frontend;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_cache_bypass $http_upgrade;
#     }
#
#     client_max_body_size 10M;
# }
```

Enable site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/talenthub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 9: Setup SSL Certificate (Production)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl status certbot.timer
```

Then uncomment the HTTPS server block in Nginx config and comment out the HTTP temporary section.

---

## Step 10: Database Setup

```bash
# Connect to MongoDB
mongosh

# Create database and admin user
use talenthub

db.createUser({
  user: "talenthubadmin",
  pwd: "your-strong-password",
  roles: [{ role: "readWrite", db: "talenthub" }]
})

exit
```

Update MongoDB URL in backend/.env if using authentication:
```env
MONGO_URL=mongodb://talenthubadmin:your-strong-password@localhost:27017/talenthub
```

---

## Step 11: Create Initial Admin User

```bash
# Activate backend virtual environment
cd /var/www/talenthub/backend
source venv/bin/activate

# Run Python script
python3 << EOF
import requests
import json

url = "http://localhost:8001/api/auth/register"
data = {
    "email": "admin@yourdomain.com",
    "password": "YourSecurePassword123!",
    "role": "admin"
}

response = requests.post(url, json=data)
print(response.json())
EOF

deactivate
```

---

## Step 12: Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (IMPORTANT!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

---

## Step 13: AWS S3 Setup (for Resume Storage)

1. Login to AWS Console
2. Go to S3 → Create Bucket
3. Bucket name: `talenthub-resumes` (or your choice)
4. Region: `us-east-1` (or your preferred region)
5. Uncheck "Block all public access" (we'll use signed URLs)
6. Create bucket

**Create IAM User:**
1. Go to IAM → Users → Add User
2. Name: `talenthub-s3-user`
3. Access type: Programmatic access
4. Attach policy: `AmazonS3FullAccess` (or create custom policy)
5. Save Access Key ID and Secret Access Key
6. Add these to backend/.env

**CORS Configuration for S3 Bucket:**
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["https://yourdomain.com"],
        "ExposeHeaders": ["ETag"]
    }
]
```

---

## Step 14: GoDaddy Email Setup

1. Login to GoDaddy
2. Go to Email → Email & Office → Manage
3. Create email: `noreply@yourdomain.com`
4. Get SMTP settings:
   - Server: `smtpout.secureserver.net`
   - Port: `465` (SSL) or `587` (TLS)
5. Update backend/.env with credentials

---

## Step 15: Verify Deployment

```bash
# Check services
sudo supervisorctl status

# Check logs
sudo tail -f /var/log/talenthub/backend.out.log
sudo tail -f /var/log/talenthub/frontend.out.log

# Test backend
curl http://localhost:8001/api/health

# Test frontend
curl http://localhost:3000
```

**Access Application:**
- Frontend: `http://your-server-ip` or `https://yourdomain.com`
- Backend API: `http://your-server-ip/api` or `https://yourdomain.com/api`

---

## Step 16: Monitoring & Maintenance

### **View Logs**
```bash
# Backend logs
sudo tail -f /var/log/talenthub/backend.out.log
sudo tail -f /var/log/talenthub/backend.err.log

# Frontend logs
sudo tail -f /var/log/talenthub/frontend.out.log
sudo tail -f /var/log/talenthub/frontend.err.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### **Restart Services**
```bash
# Restart backend
sudo supervisorctl restart talenthub-backend

# Restart frontend
sudo supervisorctl restart talenthub-frontend

# Restart Nginx
sudo systemctl restart nginx

# Restart MongoDB
sudo systemctl restart mongod
```

### **Update Application**
```bash
# Pull latest code
cd /var/www/talenthub
git pull

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
deactivate
sudo supervisorctl restart talenthub-backend

# Update frontend
cd ../frontend
yarn install
yarn build
sudo supervisorctl restart talenthub-frontend
```

---

## 🔒 SECURITY CHECKLIST

- [ ] Change default admin password
- [ ] Use strong SECRET_KEY in backend/.env (32+ chars)
- [ ] Enable HTTPS with SSL certificate
- [ ] Setup firewall (UFW)
- [ ] Use environment variables for all secrets
- [ ] Enable MongoDB authentication
- [ ] Setup regular backups (MongoDB + S3)
- [ ] Configure CORS properly
- [ ] Use strong passwords for all accounts
- [ ] Setup monitoring (e.g., Grafana, PM2, CloudWatch)
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`

---

## 📦 BACKUP STRATEGY

### **MongoDB Backup**
```bash
# Create backup script
sudo nano /usr/local/bin/backup-mongodb.sh

#!/bin/bash
mongodump --db talenthub --out /var/backups/mongodb/$(date +%Y%m%d_%H%M%S)
find /var/backups/mongodb/ -type d -mtime +7 -exec rm -rf {} +

# Make executable
sudo chmod +x /usr/local/bin/backup-mongodb.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
0 2 * * * /usr/local/bin/backup-mongodb.sh
```

### **S3 Backup**
- S3 has built-in versioning and backup features
- Enable versioning in S3 bucket settings
- Setup S3 lifecycle policies for old files

---

## 🐛 TROUBLESHOOTING

### **Backend not starting**
```bash
# Check logs
sudo tail -50 /var/log/talenthub/backend.err.log

# Check if port is in use
sudo netstat -tulpn | grep 8001

# Check Python environment
cd /var/www/talenthub/backend
source venv/bin/activate
python3 server.py
```

### **Frontend not building**
```bash
# Check logs
sudo tail -50 /var/log/talenthub/frontend.err.log

# Clear cache and rebuild
cd /var/www/talenthub/frontend
rm -rf .next node_modules
yarn install
yarn build
```

### **MongoDB connection issues**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -50 /var/log/mongodb/mongod.log

# Test connection
mongosh
```

### **Nginx issues**
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -50 /var/log/nginx/error.log

# Restart
sudo systemctl restart nginx
```

---

## 🎉 SUCCESS!

Your TalentHub application should now be live and accessible!

**Default Admin Login:**
- Email: admin@yourdomain.com (or contact@bisgensolutions.com)
- Password: YourSecurePassword123! (or Admin@123#)

---

## 📞 SUPPORT

For issues or questions:
1. Check logs first
2. Review this deployment guide
3. Check GitHub issues (if applicable)
4. Contact support team

---

**Project Status:** 100% Complete ✅  
**Last Updated:** 2025  
**Version:** 1.0.0
