"""
Reset Admin Password Script
Usage: python reset_admin_password.py
"""
import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import getpass
import sys

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Hash password function (same as in utils/auth.py)
def hash_password(password: str) -> str:
    import bcrypt
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def reset_admin_password():
    """Reset admin password"""
    print("=" * 60)
    print("TalentHub - Admin Password Reset")
    print("=" * 60)
    print()
    
    # Get admin email
    admin_email = input("Enter admin email (default: contact@bisgensolutions.com): ").strip()
    if not admin_email:
        admin_email = "contact@bisgensolutions.com"
    
    # Get new password
    print("\nEnter new password:")
    new_password = getpass.getpass("New password: ")
    confirm_password = getpass.getpass("Confirm password: ")
    
    if new_password != confirm_password:
        print("\n❌ Error: Passwords do not match!")
        sys.exit(1)
    
    if len(new_password) < 6:
        print("\n❌ Error: Password must be at least 6 characters!")
        sys.exit(1)
    
    # Connect to database
    try:
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'talenthub')
        
        print(f"\n🔌 Connecting to MongoDB: {mongo_url}")
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        
        # Check if admin exists
        admin_user = await db.users.find_one({'email': admin_email})
        
        if not admin_user:
            print(f"\n❌ Error: Admin user '{admin_email}' not found!")
            print("\nAvailable admin users:")
            admins = await db.users.find({'role': 'admin'}, {'_id': 0, 'email': 1}).to_list(10)
            if admins:
                for admin in admins:
                    print(f"  - {admin['email']}")
            else:
                print("  No admin users found in database!")
            client.close()
            sys.exit(1)
        
        # Check if user is admin
        if admin_user.get('role') != 'admin':
            print(f"\n❌ Error: User '{admin_email}' is not an admin!")
            print(f"User role: {admin_user.get('role')}")
            client.close()
            sys.exit(1)
        
        # Hash new password
        password_hash = hash_password(new_password)
        
        # Update password
        result = await db.users.update_one(
            {'email': admin_email},
            {'$set': {'password_hash': password_hash}}
        )
        
        if result.modified_count > 0:
            print(f"\n✅ Success: Password updated for admin '{admin_email}'")
            print("\nYou can now login with:")
            print(f"  Email: {admin_email}")
            print(f"  Password: {new_password}")
        else:
            print(f"\n⚠️  Warning: No changes made (password might be the same)")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    # Check if bcrypt is installed
    try:
        import bcrypt
    except ImportError:
        print("❌ Error: bcrypt not installed!")
        print("Install it with: pip install bcrypt")
        sys.exit(1)
    
    # Run async function
    asyncio.run(reset_admin_password())
