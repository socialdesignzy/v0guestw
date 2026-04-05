#!/usr/bin/env python3
"""
Check if plans exist in database and verify their structure
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import json

load_dotenv()

MONGODB_URL = os.getenv("MONGO_URL", os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
DB_NAME = os.getenv("DB_NAME", "guestworker")

async def check_plans():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    print("🔌 Connected to MongoDB")
    print()
    
    # Check subscription_plans collection
    plans = await db.subscription_plans.find({}).to_list(100)
    
    print(f"📊 Total plans in database: {len(plans)}")
    print()
    
    if len(plans) == 0:
        print("❌ No plans found in subscription_plans collection!")
        print()
        print("Collections in database:")
        collections = await db.list_collection_names()
        for coll in collections:
            print(f"  - {coll}")
        return
    
    # Show active plans
    active_plans = [p for p in plans if p.get("is_active", False)]
    print(f"✅ Active plans: {len(active_plans)}")
    print()
    
    for plan in plans:
        print(f"📋 Plan: {plan.get('name')}")
        print(f"   ID: {plan.get('id')}")
        print(f"   Price: ₹{plan.get('price')}")
        print(f"   Active: {plan.get('is_active', False)}")
        print(f"   Max Workers: {plan.get('max_workers', 'Not set')}")
        print(f"   Max Employers: {plan.get('max_employers', 'Not set')}")
        print()
    
    # Check if collection exists and has any documents
    count = await db.subscription_plans.count_documents({})
    active_count = await db.subscription_plans.count_documents({"is_active": True})
    
    print(f"📈 Statistics:")
    print(f"   Total plans: {count}")
    print(f"   Active plans: {active_count}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_plans())

