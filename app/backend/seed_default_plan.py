#!/usr/bin/env python3
"""
Seed the default Contractor Plan into the database.
This script should be run once to add the default plan.
After that, admins can edit it from the Plan Management page.
"""

import asyncio
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = "guestworker"

async def seed_default_plan():
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    print("🔌 Connected to MongoDB")
    
    # Check if plan already exists
    existing_plan = await db.subscription_plans.find_one({"name": "Contractor Plan"})
    
    if existing_plan:
        print("⚠️  'Contractor Plan' already exists in database")
        print(f"   Plan ID: {existing_plan['id']}")
        print(f"   Price: ₹{existing_plan['price']}")
        print(f"   Status: {'Active' if existing_plan.get('is_active') else 'Inactive'}")
        print("\n✅ No action needed. You can edit this plan from Admin Panel > Plan Management")
        return
    
    # Define the default Contractor Plan
    contractor_plan = {
        "id": str(uuid.uuid4()),
        "name": "Contractor Plan",
        "price": 799,
        "duration_days": 30,
        "features": [
            "Track unlimited workers",
            "Manage multiple employers",
            "Dual attendance tracking",
            "Payment & wage management",
            "Advance tracking & settlements",
            "Export to Excel/PDF",
            "Dashboard analytics",
            "Mobile responsive"
        ],
        "description": "Perfect for individual contractors",
        "is_active": True,
        "created_by": "system",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Insert the plan
    result = await db.subscription_plans.insert_one(contractor_plan)
    
    print("✅ Successfully created 'Contractor Plan'!")
    print(f"   Plan ID: {contractor_plan['id']}")
    print(f"   Price: ₹{contractor_plan['price']}/month")
    print(f"   Duration: {contractor_plan['duration_days']} days")
    print(f"   Features: {len(contractor_plan['features'])} features")
    print(f"   Status: Active")
    print("\n🎉 The plan is now available on the pricing page!")
    print("📝 Admins can edit this plan from: Admin Panel > Plan Management")
    print("🔄 Any changes made in admin panel will automatically reflect on the pricing page")
    
    client.close()

if __name__ == "__main__":
    print("=" * 60)
    print("  GuestWorker - Default Plan Seeder")
    print("=" * 60)
    print()
    
    asyncio.run(seed_default_plan())
    
    print()
    print("=" * 60)
    print("  Done!")
    print("=" * 60)

