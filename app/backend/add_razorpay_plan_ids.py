"""
Script to add Razorpay Plan IDs to subscription plans
Run this to enable auto-renewal for trial-to-paid conversion
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "guestworker")

async def add_razorpay_plan_ids():
    """Add Razorpay plan IDs to existing subscription plans"""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    print("🔌 Connected to MongoDB")
    print(f"📊 Database: {DB_NAME}")
    print()
    
    # Get all plans
    plans = await db.subscription_plans.find({}).to_list(100)
    
    print(f"Found {len(plans)} plans in database")
    print()
    
    if len(plans) == 0:
        print("❌ No plans found! Please create plans first.")
        return
    
    # Razorpay Plan ID mapping
    # IMPORTANT: You need to create these plans in your Razorpay Dashboard first!
    # Go to: https://dashboard.razorpay.com/app/subscriptions/plans
    # Create plans with the same names and prices, then copy the plan IDs here
    
    razorpay_plan_mapping = {
        "Contractor Plus": "plan_XXXXXXXXXXXXXXXX",  # Replace with actual Razorpay plan ID
        "Contractor Pro": "plan_YYYYYYYYYYYYYYYY",   # Replace with actual Razorpay plan ID
    }
    
    print("=" * 60)
    print("IMPORTANT: Update Razorpay Plan IDs")
    print("=" * 60)
    print()
    print("Before running this script, you need to:")
    print("1. Go to https://dashboard.razorpay.com/app/subscriptions/plans")
    print("2. Create subscription plans in Razorpay Dashboard")
    print("3. Copy the plan IDs (they start with 'plan_')")
    print("4. Update the razorpay_plan_mapping in this script")
    print()
    print("Current mapping:")
    for plan_name, plan_id in razorpay_plan_mapping.items():
        print(f"  {plan_name}: {plan_id}")
    print()
    
    # Check if user has updated the plan IDs
    if any("XXXX" in pid or "YYYY" in pid for pid in razorpay_plan_mapping.values()):
        print("⚠️  WARNING: You haven't updated the Razorpay plan IDs yet!")
        print()
        response = input("Do you want to continue anyway? (yes/no): ")
        if response.lower() != 'yes':
            print("❌ Aborted. Please update the plan IDs first.")
            return
    
    print()
    print("Updating plans...")
    print()
    
    updated_count = 0
    skipped_count = 0
    
    for plan in plans:
        plan_name = plan.get("name")
        plan_id = plan.get("id")
        current_razorpay_id = plan.get("razorpay_plan_id")
        
        print(f"📋 Plan: {plan_name}")
        print(f"   ID: {plan_id}")
        print(f"   Price: ₹{plan.get('price', 0)}")
        print(f"   Current Razorpay Plan ID: {current_razorpay_id or 'Not set'}")
        
        # Check if we have a mapping for this plan
        if plan_name in razorpay_plan_mapping:
            new_razorpay_id = razorpay_plan_mapping[plan_name]
            
            if current_razorpay_id == new_razorpay_id:
                print(f"   ✓ Already has correct Razorpay Plan ID")
                skipped_count += 1
            else:
                # Update the plan
                await db.subscription_plans.update_one(
                    {"id": plan_id},
                    {"$set": {"razorpay_plan_id": new_razorpay_id}}
                )
                print(f"   ✅ Updated Razorpay Plan ID to: {new_razorpay_id}")
                updated_count += 1
        else:
            print(f"   ⚠️  No Razorpay Plan ID mapping found for this plan")
            skipped_count += 1
        
        print()
    
    print("=" * 60)
    print(f"✅ Updated: {updated_count} plans")
    print(f"⏭️  Skipped: {skipped_count} plans")
    print("=" * 60)
    print()
    
    # Verify the updates
    print("Verifying updates...")
    print()
    
    plans_with_razorpay = await db.subscription_plans.find(
        {"razorpay_plan_id": {"$exists": True, "$ne": None}}
    ).to_list(100)
    
    print(f"Plans with Razorpay Plan ID: {len(plans_with_razorpay)}")
    for plan in plans_with_razorpay:
        print(f"  ✓ {plan.get('name')}: {plan.get('razorpay_plan_id')}")
    
    print()
    print("🎉 Done!")
    
    client.close()

if __name__ == "__main__":
    print()
    print("=" * 60)
    print("Add Razorpay Plan IDs to Subscription Plans")
    print("=" * 60)
    print()
    
    asyncio.run(add_razorpay_plan_ids())
