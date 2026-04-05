#!/usr/bin/env python3
"""
Update plan prices in the database
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGO_URL", os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
DB_NAME = os.getenv("DB_NAME", "guestworker")

async def update_prices():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    print("🔌 Connected to MongoDB")
    print()
    
    price_updates = {
        "Contractor Plus": 499,
        "Contractor Pro": 999,
        "Enterprise": 1999
    }
    
    for plan_name, new_price in price_updates.items():
        result = await db.subscription_plans.update_one(
            {"name": plan_name},
            {"$set": {"price": new_price}}
        )
        
        if result.modified_count > 0:
            print(f"✅ Updated '{plan_name}' price to ₹{new_price}")
        else:
            plan = await db.subscription_plans.find_one({"name": plan_name})
            if plan:
                print(f"⚠️  '{plan_name}' already has price ₹{plan.get('price')}")
            else:
                print(f"❌ Plan '{plan_name}' not found")
    
    client.close()
    print("\n✅ Done!")

if __name__ == "__main__":
    asyncio.run(update_prices())

