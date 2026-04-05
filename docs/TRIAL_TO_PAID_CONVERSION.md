# Trial to Paid Conversion System

## Overview

This document describes the system for converting free trial users to paid subscriptions by prompting them to add payment methods before trial expiry.

## Current Trial System

### How Free Trial Works
1. **No Payment Required**: Users activate trial without entering payment details
2. **Duration**: 7 days (configurable by admin)
3. **Plan**: Contractor Plus access
4. **One-time**: Users can only activate trial once (tracked via `trial_activated_at`)
5. **Payment Method**: Set to "trial" (no Razorpay subscription)

### Trial Expiry Behavior
- When trial expires, `subscription_status` changes to "expired"
- User loses access to premium features
- User must manually purchase a paid plan

## Proposed Enhancement: Payment Method Prompt

### Goals
1. Prompt users to add payment method **2 days before trial expiry**
2. Allow smooth conversion to paid subscription
3. If user ignores prompt, trial expires normally
4. User can still purchase later

### Implementation Strategy

#### 1. **Trial Expiry Notifications**

**Backend: Scheduled Job**
- Run daily check for trials expiring in 2 days
- Send notification to users via:
  - In-app notification
  - Email reminder
  - Dashboard banner

**Database Field Addition**
```javascript
// Add to User model
{
  "trial_payment_prompt_sent": false,  // Track if prompt was sent
  "trial_payment_prompt_dismissed": false,  // User dismissed the prompt
}
```

#### 2. **Payment Method Setup Flow**

**Option A: Razorpay Subscription (Recommended)**
- User clicks "Add Payment Method" from prompt
- Redirect to Razorpay subscription creation
- User enters card details
- Razorpay creates subscription (starts after trial ends)
- Trial continues, auto-converts on expiry

**Option B: Manual Payment Setup**
- User adds payment method to Razorpay
- No immediate charge
- On trial expiry, system creates subscription
- First charge happens automatically

#### 3. **User Experience Flow**

```
Day 1-5: Trial Active
  └─ User uses platform normally

Day 5 (2 days before expiry):
  ├─ Dashboard banner appears: "Trial ending in 2 days - Add payment method for seamless renewal"
  ├─ In-app notification sent
  └─ Email reminder sent

User Actions:
  ├─ Option 1: Click "Add Payment Method"
  │   ├─ Redirect to Razorpay subscription setup
  │   ├─ Enter card details
  │   ├─ Subscription created (starts on Day 7)
  │   └─ Trial continues → Auto-converts to paid
  │
  ├─ Option 2: Click "Remind Me Later"
  │   ├─ Prompt shown again next day (Day 6)
  │   └─ Final reminder on Day 7 (expiry day)
  │
  └─ Option 3: Dismiss/Ignore
      ├─ Trial expires on Day 7
      ├─ Status: "expired"
      └─ User must manually purchase plan

Day 7 (Trial Expiry):
  ├─ If payment method added: Auto-convert to paid subscription
  │   ├─ Razorpay charges first payment
  │   ├─ Subscription becomes active
  │   └─ User continues without interruption
  │
  └─ If no payment method: Trial expires
      ├─ Access revoked
      ├─ Show "Renew Subscription" page
      └─ User must manually purchase
```

#### 4. **Dashboard Banner Component**

**Location**: Shown on all pages when trial is expiring soon

**Design**:
```
┌────────────────────────────────────────────────────────────┐
│ ⚠️  Your trial ends in 2 days!                             │
│                                                             │
│ Add a payment method now for seamless renewal to           │
│ Contractor Plus (₹799/month)                               │
│                                                             │
│ [Add Payment Method]  [Remind Me Later]  [×]              │
└────────────────────────────────────────────────────────────┘
```

**Behavior**:
- Shows 2 days before expiry
- Sticky at top of dashboard
- Dismissible (but reappears on next login)
- Click "Add Payment Method" → Razorpay subscription flow
- Click "Remind Me Later" → Hide for 24 hours
- Click "×" → Dismiss for current session

#### 5. **Email Notifications**

**Email 1: 2 Days Before Expiry**
```
Subject: Your GuestWorker Trial Ends in 2 Days

Hi [Name],

Your free trial of GuestWorker Contractor Plus ends in 2 days.

To continue using all premium features without interruption:
→ Add your payment method now
→ Your subscription will start automatically when trial ends
→ Only ₹799/month

[Add Payment Method]

Questions? Reply to this email.

Thanks,
GuestWorker Team
```

**Email 2: 1 Day Before Expiry**
```
Subject: Last Day! Your Trial Expires Tomorrow

Hi [Name],

This is your final reminder - your trial expires tomorrow.

Add payment method now to avoid service interruption.

[Add Payment Method]
```

**Email 3: Trial Expired (No Payment Added)**
```
Subject: Your Trial Has Expired - Renew Now

Hi [Name],

Your free trial has expired. Your data is safe for 30 days.

Renew now to regain access:

[View Plans & Pricing]
```

#### 6. **Backend Implementation**

**New API Endpoints**:

```python
# Check if user needs payment prompt
@api_router.get("/subscription/trial-status")
async def get_trial_status(current_user: User = Depends(get_current_user)):
    """
    Returns trial status and whether payment prompt should be shown
    """
    if current_user.payment_method != "trial":
        return {"is_trial": False}
    
    # Calculate days remaining
    end_date = datetime.fromisoformat(current_user.plan_end_date)
    now = datetime.now(timezone.utc)
    days_remaining = (end_date - now).days
    
    # Show prompt if 2 days or less remaining
    show_prompt = days_remaining <= 2 and days_remaining >= 0
    
    user_doc = await db.users.find_one({"id": current_user.id})
    prompt_dismissed = user_doc.get("trial_payment_prompt_dismissed", False)
    
    return {
        "is_trial": True,
        "days_remaining": days_remaining,
        "show_payment_prompt": show_prompt and not prompt_dismissed,
        "trial_end_date": current_user.plan_end_date
    }

# Dismiss payment prompt
@api_router.post("/subscription/dismiss-trial-prompt")
async def dismiss_trial_prompt(current_user: User = Depends(get_current_user)):
    """
    User dismissed the payment prompt
    """
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"trial_payment_prompt_dismissed": True}}
    )
    return {"message": "Prompt dismissed"}

# Setup payment method for trial conversion
@api_router.post("/subscription/setup-trial-payment")
async def setup_trial_payment(
    plan_data: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Setup Razorpay subscription to start after trial ends
    """
    if current_user.payment_method != "trial":
        raise HTTPException(status_code=400, detail="Not on trial")
    
    # Get plan details
    plan_id = plan_data.get("plan_id")
    plan = await db.subscription_plans.find_one({"id": plan_id})
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Calculate start date (when trial ends)
    trial_end = datetime.fromisoformat(current_user.plan_end_date)
    
    # Create Razorpay subscription that starts after trial
    razorpay_plan_id = plan.get("razorpay_plan_id")
    
    subscription = razorpay_client.subscription.create({
        "plan_id": razorpay_plan_id,
        "customer_notify": 1,
        "quantity": 1,
        "start_at": int(trial_end.timestamp()),  # Start when trial ends
        "notes": {
            "user_id": current_user.id,
            "email": current_user.email,
            "conversion_type": "trial_to_paid"
        }
    })
    
    # Update user with subscription details
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "razorpay_subscription_id": subscription["id"],
            "auto_renew": True,
            "trial_payment_setup": True,
            "trial_conversion_plan": plan.get("name")
        }}
    )
    
    return {
        "message": "Payment method added successfully",
        "subscription_id": subscription["id"],
        "starts_at": trial_end.isoformat()
    }
```

**Scheduled Job (Daily)**:

```python
# Run this daily via cron job or scheduler
async def send_trial_expiry_notifications():
    """
    Send notifications to users whose trials are expiring in 2 days
    """
    now = datetime.now(timezone.utc)
    two_days_later = now + timedelta(days=2)
    
    # Find users on trial expiring in ~2 days
    users = await db.users.find({
        "payment_method": "trial",
        "subscription_status": "active",
        "plan_end_date": {
            "$gte": two_days_later.isoformat(),
            "$lt": (two_days_later + timedelta(hours=24)).isoformat()
        },
        "trial_payment_prompt_sent": {"$ne": True}
    }).to_list(1000)
    
    for user in users:
        # Send email notification
        await send_trial_expiry_email(user)
        
        # Create in-app notification
        await db.notifications.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "type": "trial_expiring",
            "title": "Trial Ending Soon",
            "message": "Your trial ends in 2 days. Add payment method for seamless renewal.",
            "action_url": "/pricing",
            "created_at": now.isoformat(),
            "read": False
        })
        
        # Mark prompt as sent
        await db.users.update_one(
            {"id": user["id"]},
            {"$set": {"trial_payment_prompt_sent": True}}
        )
```

#### 7. **Frontend Components**

**Trial Expiry Banner** (`TrialExpiryBanner.js`):

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './ui/button';
import { api } from '../utils/api';

export function TrialExpiryBanner() {
  const [trialStatus, setTrialStatus] = useState(null);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkTrialStatus();
  }, []);

  const checkTrialStatus = async () => {
    try {
      const response = await api.getTrialStatus();
      if (response.data.show_payment_prompt) {
        setTrialStatus(response.data);
        setVisible(true);
      }
    } catch (error) {
      console.error('Failed to check trial status:', error);
    }
  };

  const handleAddPayment = () => {
    navigate('/pricing?trial_conversion=true');
  };

  const handleDismiss = async () => {
    try {
      await api.dismissTrialPrompt();
      setVisible(false);
    } catch (error) {
      console.error('Failed to dismiss prompt:', error);
    }
  };

  if (!visible || !trialStatus) return null;

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <AlertTriangle className="h-6 w-6" />
          <div>
            <p className="font-bold text-lg">
              Your trial ends in {trialStatus.days_remaining} day{trialStatus.days_remaining !== 1 ? 's' : ''}!
            </p>
            <p className="text-sm text-white/90">
              Add a payment method now for seamless renewal to Contractor Plus (₹799/month)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleAddPayment}
            className="bg-white text-orange-600 hover:bg-orange-50"
          >
            Add Payment Method
          </Button>
          <button
            onClick={handleDismiss}
            className="text-white hover:text-white/80 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Benefits of This Approach

### For Users
✅ **Seamless Experience**: No service interruption if payment added
✅ **Flexibility**: Can choose to add payment or let trial expire
✅ **Clear Communication**: Multiple reminders before expiry
✅ **No Surprise Charges**: Trial period completes before first charge

### For Business
✅ **Higher Conversion**: Users more likely to convert with easy payment setup
✅ **Reduced Churn**: Smooth transition prevents drop-off
✅ **Better UX**: Professional onboarding experience
✅ **Revenue Optimization**: Automatic conversion increases paid users

## Alternative: Trial with Mandatory Payment

If you want to require payment upfront (like Netflix):

1. **Trial Activation**: User must add card to start trial
2. **No Charge**: Card authorized but not charged during trial
3. **Auto-Convert**: Automatically charges on Day 8
4. **Cancellation**: User can cancel anytime during trial (no charge)

This approach has:
- ✅ Higher conversion rate (80%+ vs 20-30% without card)
- ✅ Automatic revenue on trial end
- ❌ Higher barrier to entry (some users won't start trial)
- ❌ Requires card validation

## Recommended Approach

**Hybrid Model**:
1. Start with **no payment required** (current system)
2. Add **payment prompt 2 days before expiry** (proposed system)
3. Offer **one-click subscription setup** via Razorpay
4. If user adds payment → Auto-convert
5. If user ignores → Trial expires, manual purchase required

This balances:
- Low barrier to entry (no card needed to start)
- High conversion opportunity (easy payment setup)
- User control (can choose to continue or not)

## Implementation Priority

1. **Phase 1**: Trial status API + Frontend banner (1-2 days)
2. **Phase 2**: Email notifications (1 day)
3. **Phase 3**: Razorpay subscription setup for trial conversion (2-3 days)
4. **Phase 4**: Scheduled job for automatic notifications (1 day)
5. **Phase 5**: Analytics and conversion tracking (1 day)

Total: ~1 week for complete implementation
