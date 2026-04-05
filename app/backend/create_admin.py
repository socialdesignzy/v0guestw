"""
DEPRECATED: This script is no longer needed.
Admin account is now automatically created on server startup from environment variables.

To create admin account:
1. Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file
2. Start the server - admin will be created automatically if it doesn't exist

This provides better security as credentials are never hardcoded.
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone

# Load .env from the same directory as this script
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin():
    """
    Create admin account from environment variables.
    SECURITY: Uses ADMIN_EMAIL and ADMIN_PASSWORD from .env file.
    """
    admin_email = os.environ.get('ADMIN_EMAIL')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    
    if not admin_email or not admin_password:
        print("❌ ERROR: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env file")
        print("Example:")
        print("  ADMIN_EMAIL=admin@yourdomain.com")
        print("  ADMIN_PASSWORD=YourSecurePassword123!")
        return
    
    if len(admin_password) < 8:
        print("❌ ERROR: ADMIN_PASSWORD must be at least 8 characters long")
        return
    
    mongo_url = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/guestworker')
    client = AsyncIOMotorClient(mongo_url)
    db = client['guestworker']
    
    # Check if admin already exists
    existing = await db.admins.find_one({'email': admin_email})
    if existing:
        print(f"⚠️  Admin user already exists: {admin_email}")
        client.close()
        return
    
    # Create admin user
    admin = {
        'id': 'admin-' + os.urandom(8).hex(),
        'email': admin_email,
        'name': 'System Admin',
        'password': pwd_context.hash(admin_password),
        'role': 'admin',
        'created_at': datetime.now(timezone.utc).isoformat(),
        'is_active': True,
        'must_change_password': True
    }
    
    await db.admins.insert_one(admin)
    print("✅ Admin user created successfully!")
    print(f"   Email: {admin_email}")
    print("   Password: (from ADMIN_PASSWORD env var)")
    print("   ⚠️  IMPORTANT: Change password after first login!")
    
    client.close()

if __name__ == '__main__':
    print("=" * 60)
    print("ADMIN ACCOUNT CREATION")
    print("=" * 60)
    asyncio.run(create_admin())
