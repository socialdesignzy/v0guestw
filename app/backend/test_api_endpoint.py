#!/usr/bin/env python3
"""
Test the /api/plans endpoint directly using the same database connection
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import json

load_dotenv('backend/.env')

# Try both env var names
mongo_url = os.getenv('MONGO_URL') or os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
db_name = os.getenv('DB_NAME', 'guestworker')

print(f"Using MongoDB URL: {mongo_url}")
print(f"Using DB Name: {db_name}")
print()

async def test_api_query():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("Testing API endpoint query...")
    print()
    
    # This is the exact query from the API endpoint
    plans = await db.subscription_plans.find(
        {"is_active": True},
        {"_id": 0}
    ).sort("price", 1).to_list(100)
    
    print(f"Found {len(plans)} plans")
    print()
    
    if len(plans) == 0:
        print("❌ No plans found! Checking database...")
        all_plans = await db.subscription_plans.find({}).to_list(100)
        print(f"Total plans in database: {len(all_plans)}")
        
        if len(all_plans) > 0:
            print("\nPlans found but not matching query:")
            for plan in all_plans:
                print(f"  - {plan.get('name')}: is_active={plan.get('is_active')}")
    else:
        print("✅ Plans found:")
        for plan in plans:
            print(f"  - {plan.get('name')}: ₹{plan.get('price')}")
        print()
        print("Full response JSON:")
        print(json.dumps({"plans": plans}, indent=2, default=str))
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_api_query())

