#!/usr/bin/env python3
"""
Debug plans query issue
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import json

load_dotenv()

MONGODB_URL = os.getenv("MONGO_URL", os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
DB_NAME = os.getenv("DB_NAME", "guestworker")

async def debug_plans():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    print("Testing queries...")
    print()
    
    # Test 1: Find all plans
    all_plans = await db.subscription_plans.find({}).to_list(100)
    print(f"1. Total plans (no filter): {len(all_plans)}")
    
    # Test 2: Find with is_active: True
    active_plans_1 = await db.subscription_plans.find({"is_active": True}).to_list(100)
    print(f"2. Plans with is_active=True: {len(active_plans_1)}")
    
    # Test 3: Find all regardless of is_active
    print(f"3. All plans regardless of is_active status")
    
    # Test 4: Check actual values
    for plan in all_plans:
        is_active_value = plan.get("is_active")
        print(f"\nPlan: {plan.get('name')}")
        print(f"  is_active value: {is_active_value} (type: {type(is_active_value).__name__})")
        print(f"  is_active == True: {is_active_value == True}")
        print(f"  is_active == true: {is_active_value == True}")
        print(f"  bool(is_active): {bool(is_active_value)}")
    
    # Test 5: Query like the API endpoint
    plans_sorted = await db.subscription_plans.find(
        {"is_active": True},
        {"_id": 0}
    ).sort("price", 1).to_list(100)
    
    print(f"\n4. Plans from API query (is_active=True, sorted by price): {len(plans_sorted)}")
    
    if len(plans_sorted) > 0:
        print("\nFirst plan sample:")
        print(json.dumps(plans_sorted[0], indent=2, default=str))
    
    client.close()

if __name__ == "__main__":
    asyncio.run(debug_plans())

