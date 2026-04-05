# Promotions/Offers API Endpoints
# This file contains all promotion-related endpoints for admin management

from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
import uuid

# Note: These endpoints will be imported into server.py
# Dependencies like get_current_admin, db, etc. will be available from server.py

async def get_eligible_users_for_category(category: str, custom_user_ids: List[str] = None):
    """Get list of user IDs eligible for a promotion based on category"""
    query: Dict[str, Any] = {}
    
    if category == "all":
        query = {}
    elif category == "free_users":
        query = {"subscription_plan": {"$in": ["none", "free"]}}
    elif category == "trial_users":
        query = {"subscription_status": "trial"}
    elif category == "paid_users":
        query = {"subscription_status": "active"}
    elif category == "cancelled_users":
        # Users who cancelled their subscription
        query = {"subscription_status": "cancelled"}
    elif category == "expired_trial":
        # Users whose trial has expired
        query = {
            "subscription_status": {"$in": ["none", "free"]},
            "trial_activated_at": {"$exists": True}
        }
    elif category == "low_activity":
        # Users who haven't logged in for 7+ days
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
        query = {"last_login": {"$lt": seven_days_ago.isoformat()}}
    elif category == "custom_users":
        if not custom_user_ids:
            return []
        query = {"id": {"$in": custom_user_ids}}
    else:
        return []
    
    return query

async def calculate_promotional_price(original_price: float, discount_type: str, discount_value: float):
    """Calculate the promotional price based on discount type"""
    if discount_type == "percentage":
        discount_amount = original_price * (discount_value / 100)
        return round(original_price - discount_amount, 2)
    elif discount_type == "fixed_amount":
        return max(0, round(original_price - discount_value, 2))
    elif discount_type == "custom_price":
        return round(discount_value, 2)
    return original_price

# Endpoints to be added to server.py:

# @api_router.post("/admin/promotions/create", dependencies=[Depends(get_current_admin)])
# async def create_promotion(promotion: PromotionCreate):
#     """Create a new promotion/offer"""
#     promotion_id = str(uuid.uuid4())
#     now = datetime.now(timezone.utc)
#     
#     # Get eligible users
#     user_query = await get_eligible_users_for_category(
#         promotion.target_category, 
#         promotion.custom_user_ids
#     )
#     
#     eligible_users = await db.users.find(user_query, {"_id": 0, "id": 1, "email": 1}).to_list(100000)
#     user_ids = [u["id"] for u in eligible_users]
#     
#     # Create promotion document
#     promotion_doc = {
#         "id": promotion_id,
#         "name": promotion.name,
#         "description": promotion.description,
#         "discount_type": promotion.discount_type,
#         "discount_value": promotion.discount_value,
#         "target_category": promotion.target_category,
#         "custom_user_ids": promotion.custom_user_ids or [],
#         "plan_targets": promotion.plan_targets or [],
#         "valid_from": promotion.valid_from.isoformat(),
#         "valid_until": promotion.valid_until.isoformat(),
#         "max_uses": promotion.max_uses,
#         "current_uses": 0,
#         "eligible_user_ids": user_ids,
#         "active": promotion.active,
#         "created_at": now.isoformat(),
#         "updated_at": now.isoformat()
#     }
#     
#     await db.promotions.insert_one(promotion_doc)
#     
#     # Send notifications if enabled
#     if promotion.send_notification and user_ids:
#         notification_title = promotion.notification_title or f"Special Offer: {promotion.name}"
#         notification_message = promotion.notification_message or promotion.description
#         
#         notification_docs = [
#             {
#                 "id": str(uuid.uuid4()),
#                 "user_id": uid,
#                 "title": notification_title,
#                 "message": notification_message,
#                 "type": "promo",
#                 "action_url": "/pricing",
#                 "action_label": "View Offer",
#                 "promotion_id": promotion_id,
#                 "read": False,
#                 "created_at": now
#             }
#             for uid in user_ids
#         ]
#         
#         if notification_docs:
#             await db.notifications.insert_many(notification_docs)
#     
#     return {
#         "promotion_id": promotion_id,
#         "eligible_users": len(user_ids),
#         "notifications_sent": len(user_ids) if promotion.send_notification else 0
#     }

# @api_router.get("/admin/promotions/list", dependencies=[Depends(get_current_admin)])
# async def list_promotions(active_only: bool = False):
#     """List all promotions"""
#     query = {"active": True} if active_only else {}
#     promotions = await db.promotions.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
#     return {"promotions": promotions}

# @api_router.put("/admin/promotions/{promotion_id}", dependencies=[Depends(get_current_admin)])
# async def update_promotion(promotion_id: str, update: PromotionUpdate):
#     """Update an existing promotion"""
#     update_data = {k: v for k, v in update.dict(exclude_unset=True).items() if v is not None}
#     
#     if update_data:
#         update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
#         await db.promotions.update_one({"id": promotion_id}, {"$set": update_data})
#     
#     return {"message": "Promotion updated successfully"}

# @api_router.delete("/admin/promotions/{promotion_id}", dependencies=[Depends(get_current_admin)])
# async def delete_promotion(promotion_id: str):
#     """Delete a promotion"""
#     await db.promotions.delete_one({"id": promotion_id})
#     await db.notifications.delete_many({"promotion_id": promotion_id})
#     return {"message": "Promotion deleted successfully"}

# @api_router.get("/promotions/my-offers")
# async def get_my_promotions(current_user: User = Depends(get_current_user)):
#     """Get active promotions for current user"""
#     now = datetime.now(timezone.utc)
#     
#     promotions = await db.promotions.find({
#         "active": True,
#         "eligible_user_ids": current_user.id,
#         "valid_from": {"$lte": now.isoformat()},
#         "valid_until": {"$gte": now.isoformat()}
#     }, {"_id": 0}).to_list(100)
#     
#     # Filter out promotions that have reached max uses
#     valid_promotions = [
#         p for p in promotions 
#         if p.get("max_uses") is None or p.get("current_uses", 0) < p.get("max_uses")
#     ]
#     
#     return {"promotions": valid_promotions}

# @api_router.get("/promotions/calculate-price")
# async def calculate_promotional_pricing(plan: str, current_user: User = Depends(get_current_user)):
#     """Calculate promotional price for a plan"""
#     now = datetime.now(timezone.utc)
#     
#     # Get active promotions for this user and plan
#     promotions = await db.promotions.find({
#         "active": True,
#         "eligible_user_ids": current_user.id,
#         "valid_from": {"$lte": now.isoformat()},
#         "valid_until": {"$gte": now.isoformat()},
#         "$or": [
#             {"plan_targets": []},
#             {"plan_targets": plan}
#         ]
#     }, {"_id": 0}).sort("discount_value", -1).to_list(1)
#     
#     if not promotions:
#         return {"has_promotion": False, "original_price": None, "promotional_price": None}
#     
#     promotion = promotions[0]
#     
#     # Get original price based on plan
#     plan_prices = {
#         "Basic": 299,
#         "Standard": 499,
#         "Premium": 799
#     }
#     
#     original_price = plan_prices.get(plan, 0)
#     promotional_price = await calculate_promotional_price(
#         original_price,
#         promotion["discount_type"],
#         promotion["discount_value"]
#     )
#     
#     return {
#         "has_promotion": True,
#         "promotion_id": promotion["id"],
#         "promotion_name": promotion["name"],
#         "original_price": original_price,
#         "promotional_price": promotional_price,
#         "discount_type": promotion["discount_type"],
#         "discount_value": promotion["discount_value"],
#         "valid_until": promotion["valid_until"]
#     }
