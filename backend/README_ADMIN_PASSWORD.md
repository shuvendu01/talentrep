# Admin Password Reset Guide

## Quick Start

### Reset Admin Password
```bash
cd /app/backend
source venv/bin/activate
python reset_admin_password.py
```

### Interactive Prompts:
1. **Enter admin email** (press Enter for default: contact@bisgensolutions.com)
2. **Enter new password** (minimum 6 characters)
3. **Confirm password**

### Example Session:
```
============================================================
TalentHub - Admin Password Reset
============================================================

Enter admin email (default: contact@bisgensolutions.com): 

Enter new password:
New password: ********
Confirm password: ********

🔌 Connecting to MongoDB: mongodb://localhost:27017

✅ Success: Password updated for admin 'contact@bisgensolutions.com'

You can now login with:
  Email: contact@bisgensolutions.com
  Password: ********
```

## Alternative: Create New Admin

If you need to create a new admin user:

```bash
cd /app/backend
source venv/bin/activate
python setup_admin.py
```

## Troubleshooting

### Error: Admin user not found
```bash
# List all admin users
python reset_admin_password.py
# Then enter an email that exists
```

### Error: User is not an admin
The user exists but doesn't have admin role. You need to:
1. Use the correct admin email
2. Or manually update the user role in MongoDB:

```bash
mongosh
> use talenthub
> db.users.updateOne(
    {email: "your-email@example.com"},
    {$set: {role: "admin"}}
  )
```

### Error: bcrypt not installed
```bash
cd /app/backend
source venv/bin/activate
pip install bcrypt
```

### Error: Cannot connect to MongoDB
Check if MongoDB is running:
```bash
sudo systemctl status mongod
sudo systemctl start mongod
```

## Default Admin Credentials

After installation, the default admin account is:
- **Email:** contact@bisgensolutions.com
- **Password:** Admin@123#

**⚠️ IMPORTANT:** Change this password immediately in production!

## Password Requirements

- Minimum length: 6 characters
- No maximum length
- Can include letters, numbers, and special characters
- Case-sensitive

## Security Notes

1. **Always use strong passwords in production**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Avoid common words or patterns

2. **Never commit passwords to git**
   - Keep .env files private
   - Don't share passwords via email/chat

3. **Regular password rotation**
   - Change admin password every 90 days
   - Keep track of password changes

## For Production Deployment

Add this to your deployment checklist:

```bash
# 1. Deploy application
# 2. Immediately reset admin password
cd /var/www/talenthub/backend
source venv/bin/activate
python reset_admin_password.py

# 3. Document the new password securely (use password manager)
# 4. Test admin login
# 5. Disable default admin if you created a new one
```

## Multiple Admin Accounts

To add more admin users:

```bash
# Option 1: Register as normal user, then update role
mongosh
> use talenthub
> db.users.updateOne(
    {email: "newadmin@example.com"},
    {$set: {role: "admin"}}
  )

# Option 2: Use admin panel
# Login as admin → Users → Edit user → Change role to "admin"
```

## Script Location

- **Script:** `/app/backend/reset_admin_password.py`
- **Setup Script:** `/app/backend/setup_admin.py`

## Need Help?

If you encounter issues:
1. Check MongoDB is running: `sudo systemctl status mongod`
2. Check environment variables: `cat /app/backend/.env`
3. Check logs: `tail -100 /var/log/talenthub/backend.err.log`
4. Verify database name and connection string in `.env`
