#!/usr/bin/env python3
"""
Script to add razorpay_plan_id field to subscription plans in MongoDB.
Run this after creating Razorpay subscription plans in the dashboard.

Usage:
    python3 add_razorpay_plan_ids.py
"""

import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv('app/backend/.env')

# MongoDB connection
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/guestworker')

def main():
    print("🔧 Adding Razorpay Plan IDs to Subscription Plans")
    print("=" * 60)
    
    # Connect to MongoDB
    try:
        client = MongoClient(MONGODB_URI)
        db = client.get_database()
        print(f"✅ Connected to MongoDB: {db.name}")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        sys.exit(1)
    
    # Get all active plans
    plans = list(db.subscription_plans.find({"is_active": True}))
    
    if not plans:
        print("\n⚠️  No active plans found in database.")
        print("Please create plans first using the admin panel or seed script.")
        sys.exit(0)
    
    print(f"\n📋 Found {len(plans)} active plan(s):\n")
    
    # Display plans and prompt for Razorpay Plan IDs
    updates = []
    
    for i, plan in enumerate(plans, 1):
        plan_name = plan.get('name', 'Unknown')
        plan_price = plan.get('price', 0)
        current_razorpay_id = plan.get('razorpay_plan_id', '')
        
        print(f"{i}. {plan_name} - ₹{plan_price}/month")
        if current_razorpay_id:
            print(f"   Current Razorpay Plan ID: {current_razorpay_id}")
        
        # Prompt for Razorpay Plan ID
        print(f"\n   Enter Razorpay Plan ID for '{plan_name}'")
        print(f"   (Get this from Razorpay Dashboard → Subscriptions → Plans)")
        print(f"   Format: plan_xxxxxxxxxxxxx")
        print(f"   Press Enter to skip or keep current value")
        
        razorpay_plan_id = input(f"   Razorpay Plan ID: ").strip()
        
        if razorpay_plan_id:
            # Validate format
            if not razorpay_plan_id.startswith('plan_'):
                print(f"   ⚠️  Warning: Plan ID should start with 'plan_'")
                confirm = input(f"   Continue anyway? (y/n): ").strip().lower()
                if confirm != 'y':
                    razorpay_plan_id = ''
            
            if razorpay_plan_id:
                updates.append({
                    'plan_id': plan['id'],
                    'plan_name': plan_name,
                    'razorpay_plan_id': razorpay_plan_id
                })
        
        print()
    
    # Confirm updates
    if not updates:
        print("❌ No updates to apply. Exiting.")
        sys.exit(0)
    
    print("\n" + "=" * 60)
    print("📝 Summary of Updates:")
    print("=" * 60)
    
    for update in updates:
        print(f"  • {update['plan_name']}")
        print(f"    Razorpay Plan ID: {update['razorpay_plan_id']}")
    
    print("\n" + "=" * 60)
    confirm = input("Apply these updates? (yes/no): ").strip().lower()
    
    if confirm != 'yes':
        print("❌ Updates cancelled.")
        sys.exit(0)
    
    # Apply updates
    print("\n🔄 Applying updates...")
    
    for update in updates:
        try:
            result = db.subscription_plans.update_one(
                {"id": update['plan_id']},
                {
                    "$set": {
                        "razorpay_plan_id": update['razorpay_plan_id'],
                        "auto_renewal": True
                    }
                }
            )
            
            if result.modified_count > 0:
                print(f"  ✅ Updated: {update['plan_name']}")
            else:
                print(f"  ⚠️  No changes: {update['plan_name']}")
                
        except Exception as e:
            print(f"  ❌ Failed to update {update['plan_name']}: {e}")
    
    print("\n" + "=" * 60)
    print("✅ Update complete!")
    print("=" * 60)
    
    # Verify updates
    print("\n🔍 Verifying updates...")
    updated_plans = list(db.subscription_plans.find(
        {"razorpay_plan_id": {"$exists": True, "$ne": ""}},
        {"name": 1, "razorpay_plan_id": 1, "auto_renewal": 1, "_id": 0}
    ))
    
    if updated_plans:
        print(f"\n✅ {len(updated_plans)} plan(s) now have Razorpay Plan IDs:\n")
        for plan in updated_plans:
            print(f"  • {plan['name']}")
            print(f"    Razorpay Plan ID: {plan.get('razorpay_plan_id')}")
            print(f"    Auto-renewal: {plan.get('auto_renewal', False)}")
            print()
    
    print("=" * 60)
    print("🎉 Setup Complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Configure webhook URL in Razorpay Dashboard")
    print("2. Test subscription creation on /pricing page")
    print("3. Monitor webhook events in Razorpay Dashboard")
    print("\nSee docs/RAZORPAY_AUTO_RENEWAL_SETUP.md for detailed instructions.")
    
    client.close()

if __name__ == "__main__":
    main()
