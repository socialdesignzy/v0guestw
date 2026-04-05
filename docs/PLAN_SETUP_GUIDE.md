# Plan Setup Guide - Auto-Renewal Subscription

## 📋 **Current Status**

Your codebase has a **Contractor Plan** defined in `PricingInfo.js` with these details:
- **Name:** Contractor Plan
- **Price:** ₹799/month
- **Duration:** 30 days (monthly)
- **Features:** 8 key features
- **Description:** "Perfect for individual contractors"

---

## 🚀 **Step 1: Add Default Plan to Database**

Run this command to seed the Contractor Plan into your database:

```bash
cd /Users/anoopsunny/Documents/GuestWorker
python3 seed_default_plan.py
```

**What this does:**
- ✅ Creates the "Contractor Plan" in `subscription_plans` collection
- ✅ Sets price to ₹799
- ✅ Adds all 8 features
- ✅ Makes it active and visible on pricing page
- ✅ Allows admin editing from Plan Management page

**After running:**
1. Go to **Admin Panel** → **Plan Management** (`/admin/plans`)
2. You'll see the Contractor Plan
3. Edit price, features, or description anytime
4. Changes automatically reflect on **Pricing Page** (`/pricing`)

---

## 💳 **Step 2: Configure Razorpay for Auto-Renewal**

### **Current Implementation (One-Time Payments)**
Currently, the system uses Razorpay's **Order API** for one-time payments. Users pay ₹799 for 30 days, then must manually renew.

### **For True Auto-Renewal (Recommended)**
You need to switch to Razorpay's **Subscription API**. Here's how:

---

## 🔄 **Option A: Enable Razorpay Subscriptions (Auto-Renewal)**

### **1. Create Razorpay Plan**

Login to Razorpay Dashboard:
1. Go to **Subscriptions** → **Plans**
2. Click **Create Plan**
3. Fill in details:
   - **Plan Name:** Contractor Plan - Monthly
   - **Billing Amount:** ₹79900 (in paise, i.e., ₹799)
   - **Billing Interval:** Every 1 Month
   - **Description:** Monthly subscription for GuestWorker Contractor Plan
   - **Trial Period:** 0 days (or set trial if needed)
4. Copy the **Plan ID** (e.g., `plan_xxxxxxxxxxxxxxx`)

### **2. Update Backend to Use Subscriptions**

Add Razorpay Plan ID to your database plan:

```python
# In seed_default_plan.py or manually update:
contractor_plan = {
    # ... existing fields ...
    "razorpay_plan_id": "plan_xxxxxxxxxxxxxxx",  # ADD THIS
    "auto_renewal": True  # ADD THIS
}
```

### **3. Modify Payment Flow**

Update `backend/server.py` to create **subscriptions** instead of **orders**:

```python
# Instead of client.order.create(), use:
razorpay_subscription = client.subscription.create({
    "plan_id": plan_razorpay_id,  # From database
    "customer_notify": 1,
    "total_count": 0,  # 0 = infinite renewals until cancelled
    "quantity": 1,
    "notes": {
        "contractor_id": current_user.id,
        "plan_type": plan_type
    }
})
```

### **4. Update Frontend Payment Handler**

Modify `PricingPage.js` to handle subscription response:

```javascript
// After successful subscription creation
const options = {
  key: razorpayKeyId,
  subscription_id: subscription_id,  // NOT order_id
  name: 'GuestWorker',
  description: 'Monthly Subscription',
  // ... rest of options
};
```

---

## 📊 **Option B: Keep One-Time Payments (Manual Renewal)**

If you prefer to keep the current implementation where users manually renew each month:

### **What Happens:**
1. User pays ₹799 → Gets 30 days access
2. After 30 days → Subscription expires
3. User must go to pricing page and pay again
4. No automatic charging

### **Pros:**
- ✅ Simpler implementation
- ✅ No recurring billing complaints
- ✅ Users have full control
- ✅ Already working in your code

### **Cons:**
- ❌ Users might forget to renew
- ❌ Potential revenue loss
- ❌ More manual intervention

### **To Implement:**
- ✅ **Already done!** Just run the seed script
- ✅ Payment flow already set up
- ✅ No code changes needed

---

## 🎯 **Step 3: How It Works After Setup**

### **For Admins:**
1. **View Plan:** Go to `/admin/plans`
2. **Edit Price:** Change from ₹799 to any amount
3. **Edit Features:** Add/remove features
4. **Edit Description:** Update marketing copy
5. **Toggle Active:** Hide/show plan on pricing page
6. **Auto-Sync:** All changes appear instantly on pricing page

### **For Users:**
1. **View Pricing:** Go to `/pricing`
2. **See Plan:** Dynamically loaded from database
3. **Apply Promo:** Enter discount code (first month only)
4. **Pay:** Razorpay integration
5. **Auto-Renew:** If configured with Subscription API
   - Razorpay automatically charges every 30 days
   - User gets email notification before charge
   - User can cancel anytime from `/manage-subscription`

---

## 🔧 **Step 4: Test the Setup**

### **1. Seed the Plan**
```bash
python3 seed_default_plan.py
```

### **2. Check Admin Panel**
```
Login as admin → /admin/plans
You should see: Contractor Plan (₹799, Active)
```

### **3. Check Pricing Page**
```
Go to /pricing
You should see: Contractor Plan card with ₹799 price
```

### **4. Test Editing**
```
Admin Panel → Edit plan → Change price to ₹899
Refresh /pricing → Should show ₹899
```

### **5. Test Payment** (if Razorpay configured)
```
Register → Go to /pricing → Click "Pay via Razorpay"
Should open Razorpay checkout with correct price
```

---

## 📝 **Important Notes**

### **Database Collections Used:**
- `subscription_plans` - Stores plan details (editable by admin)
- `payment_orders` - Stores one-time payment records
- `users` - Stores user subscription status

### **Auto-Renewal Behavior:**
**With Subscription API (Option A):**
- ✅ Razorpay auto-charges every 30 days
- ✅ User receives reminder emails
- ✅ User can cancel anytime
- ✅ Handles failed payments gracefully
- ✅ Webhooks notify your system

**With Order API (Current - Option B):**
- ⚠️ One-time payment only
- ⚠️ User must manually renew after 30 days
- ⚠️ System sends expiry reminders (you need to implement)

### **Promo Codes:**
- ✅ Apply to **first month only**
- ✅ Normal price from second month onwards
- ✅ Works with both one-time and recurring

---

## 🎉 **Quick Start (Recommended Path)**

**For immediate deployment:**

```bash
# 1. Seed the plan
python3 seed_default_plan.py

# 2. Configure Razorpay in admin panel
# Login → Admin Dashboard → Payment Gateway
# Enter your Razorpay Key ID, Secret, Webhook Secret

# 3. Test the flow
# Register → /pricing → Try payment
```

**Your pricing page will now:**
- ✅ Show Contractor Plan at ₹799
- ✅ Allow promo code application
- ✅ Process payments via Razorpay
- ✅ Reflect admin edits in real-time

**For full auto-renewal:**
- Follow **Option A** above
- Create Razorpay subscription plan
- Update payment endpoints
- Test subscription flow

---

## 📞 **Need Help?**

- **Razorpay Subscription Docs:** https://razorpay.com/docs/api/subscriptions/
- **Testing Subscriptions:** Use Razorpay test mode
- **Webhooks:** Set up webhook URL for payment notifications

---

## ✅ **Checklist**

- [ ] Run `python3 seed_default_plan.py`
- [ ] Verify plan in Admin Panel (`/admin/plans`)
- [ ] Check plan appears on Pricing Page (`/pricing`)
- [ ] Configure Razorpay credentials in Admin Panel
- [ ] Test payment flow with test credentials
- [ ] Decide: One-time or Auto-renewal?
- [ ] If auto-renewal: Create Razorpay plan + update code
- [ ] Test promo code application
- [ ] Test plan editing in admin panel
- [ ] Verify edits reflect on pricing page

---

**You're all set! The plan will automatically appear on the pricing page and admins can manage it easily.** 🚀

