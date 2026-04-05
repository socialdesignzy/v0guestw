#!/usr/bin/env python3
"""
Seed the three subscription plans into the database:
1. Contractor Plus (50 workers, 25 employers) - Includes 14 day trial
2. Contractor Pro (250 workers, 100 employers)
3. Enterprise / Estate (Unlimited workers and employers)

This script should be run once to add these plans.
After that, admins can edit them from the Plan Management page.
"""

import asyncio
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Load from backend/.env file (same as server.py)
load_dotenv('backend/.env')

MONGODB_URL = os.getenv("MONGO_URL", os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
DB_NAME = os.getenv("DB_NAME", "guestworker")

async def seed_plans():
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    print("🔌 Connected to MongoDB")
    print()
    
    plans_to_create = [
        {
            "name": "Contractor Plus",
            "price": 499,  # Default price - can be changed by admin
            "duration_days": 30,
            "max_workers": 50,
            "max_employers": 25,
            "features": [
                "Track up to 50 workers",
                "Manage up to 25 employers",
                "Dual attendance tracking",
                "Payment & wage management",
                "Advance tracking & settlements",
                "Export to Excel/PDF",
                "Dashboard analytics",
                "Mobile responsive",
                "14-day free trial available"
            ],
            "description": "Perfect for small to medium contractors",
            "is_active": True
        },
        {
            "name": "Contractor Pro",
            "price": 999,  # Default price - can be changed by admin
            "duration_days": 30,
            "max_workers": 250,
            "max_employers": 100,
            "features": [
                "Track up to 250 workers",
                "Manage up to 100 employers",
                "Dual attendance tracking",
                "Payment & wage management",
                "Advance tracking & settlements",
                "Export to Excel/PDF",
                "Dashboard analytics",
                "Mobile responsive",
                "Priority support",
                "Advanced reporting"
            ],
            "description": "Ideal for growing businesses",
            "is_active": True
        },
        {
            "name": "Enterprise",
            "price": 1999,  # Default price - can be changed by admin
            "duration_days": 30,
            "max_workers": None,  # Unlimited
            "max_employers": None,  # Unlimited
            "features": [
                "Unlimited workers",
                "Unlimited employers",
                "Dual attendance tracking",
                "Payment & wage management",
                "Advance tracking & settlements",
                "Export to Excel/PDF",
                "Dashboard analytics",
                "Mobile responsive",
                "24/7 Priority support",
                "Advanced reporting",
                "Custom integrations",
                "Dedicated account manager"
            ],
            "description": "For large-scale operations",
            "is_active": True
        }
    ]
    
    created_count = 0
    skipped_count = 0
    
    for plan_data in plans_to_create:
        plan_name = plan_data["name"]
        
        # Check if plan already exists
        existing_plan = await db.subscription_plans.find_one({"name": plan_name})
        
        if existing_plan:
            print(f"⚠️  '{plan_name}' already exists in database")
            print(f"   Plan ID: {existing_plan['id']}")
            print(f"   Price: ₹{existing_plan.get('price', 'N/A')}")
            print(f"   Status: {'Active' if existing_plan.get('is_active') else 'Inactive'}")
            print(f"   Max Workers: {existing_plan.get('max_workers', 'Unlimited')}")
            print(f"   Max Employers: {existing_plan.get('max_employers', 'Unlimited')}")
            print()
            skipped_count += 1
            continue
        
        # Create plan document
        plan_doc = {
            "id": str(uuid.uuid4()),
            "name": plan_name,
            "price": plan_data["price"],
            "duration_days": plan_data["duration_days"],
            "max_workers": plan_data["max_workers"],
            "max_employers": plan_data["max_employers"],
            "features": plan_data["features"],
            "description": plan_data["description"],
            "is_active": plan_data["is_active"],
            "created_by": "system",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Insert the plan
        await db.subscription_plans.insert_one(plan_doc)
        
        print(f"✅ Successfully created '{plan_name}'!")
        print(f"   Plan ID: {plan_doc['id']}")
        print(f"   Price: ₹{plan_doc['price']}/month")
        print(f"   Duration: {plan_doc['duration_days']} days")
        print(f"   Max Workers: {plan_doc['max_workers'] or 'Unlimited'}")
        print(f"   Max Employers: {plan_doc['max_employers'] or 'Unlimited'}")
        print(f"   Features: {len(plan_doc['features'])} features")
        print(f"   Status: Active")
        print()
        created_count += 1
    
    print("=" * 60)
    if created_count > 0:
        print(f"✅ Successfully created {created_count} plan(s)!")
    if skipped_count > 0:
        print(f"⏭️  Skipped {skipped_count} existing plan(s)")
    print()
    print("🎉 The plans are now available on the pricing page!")
    print("📝 Admins can edit these plans from: Admin Panel > Plan Management")
    print("🔄 Any changes made in admin panel will automatically reflect on the pricing page")
    
    client.close()

if __name__ == "__main__":
    print("=" * 60)
    print("  GuestWorker - Subscription Plans Seeder")
    print("=" * 60)
    print()
    
    asyncio.run(seed_plans())
    
    print()
    print("=" * 60)
    print("  Done!")
    print("=" * 60)

