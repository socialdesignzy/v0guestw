# Razorpay Plan Setup Guide for Trial-to-Paid Conversion

## 🎯 Problem

When users try to add payment method during trial, they get error:
> "This plan doesn't support auto-renewal"

This happens because your subscription plans in the database don't have `razorpay_plan_id` configured.

---

## ✅ Solution

You need to:
1. Create subscription plans in Razorpay Dashboard
2. Add the Razorpay Plan IDs to your database plans

---

## 📋 Step-by-Step Instructions

### **Step 1: Create Plans in Razorpay Dashboard**

1. **Login to Razorpay Dashboard**
   - Go to: https://dashboard.razorpay.com/
   - Login with your credentials

2. **Navigate to Subscriptions**
   - Click on **Subscriptions** in the left menu
   - Click on **Plans**
   - Or go directly to: https://dashboard.razorpay.com/app/subscriptions/plans

3. **Create a New Plan**
   - Click **"Create Plan"** button
   
4. **Fill in Plan Details**
   
   **For Contractor Plus:**
   ```
   Plan Name: Contractor Plus
   Billing Amount: 799 (in rupees)
   Billing Interval: 1 month
   Description: Monthly subscription for Contractor Plus plan
   ```
   
   **For Contractor Pro:**
   ```
   Plan Name: Contractor Pro
   Billing Amount: 1499 (in rupees)
   Billing Interval: 1 month
   Description: Monthly subscription for Contractor Pro plan
   ```

5. **Save the Plan**
   - Click **"Create Plan"**
   - Razorpay will generate a Plan ID (starts with `plan_`)
   - **COPY THIS PLAN ID** - you'll need it in the next step

6. **Repeat for all plans**
   - Create plans for each subscription tier you offer

---

### **Step 2: Update Database with Razorpay Plan IDs**

#### **Option A: Using the Python Script (Recommended)**

1. **Open the script**
   ```bash
   cd /Users/anoopsunny/Documents/GuestWorker/app/backend
   nano add_razorpay_plan_ids.py
   ```

2. **Update the mapping** (around line 38)
   ```python
   razorpay_plan_mapping = {
       "Contractor Plus": "plan_XXXXXXXXXXXXXXXX",  # Replace with actual ID
       "Contractor Pro": "plan_YYYYYYYYYYYYYYYY",   # Replace with actual ID
   }
   ```
   
   Replace `plan_XXXXXXXXXXXXXXXX` with the actual Plan ID from Razorpay Dashboard.
   
   Example:
   ```python
   razorpay_plan_mapping = {
       "Contractor Plus": "plan_MNbxyz123456789",
       "Contractor Pro": "plan_MNbxyz987654321",
   }
   ```

3. **Run the script**
   ```bash
   python add_razorpay_plan_ids.py
   ```

4. **Verify the output**
   - Script will show which plans were updated
   - Verify the Razorpay Plan IDs are correct

#### **Option B: Manual Database Update**

If you prefer to update manually using MongoDB:

```javascript
// Connect to your MongoDB database
use guestworker

// Update Contractor Plus plan
db.subscription_plans.updateOne(
  { "name": "Contractor Plus" },
  { $set: { "razorpay_plan_id": "plan_MNbxyz123456789" } }
)

// Update Contractor Pro plan
db.subscription_plans.updateOne(
  { "name": "Contractor Pro" },
  { $set: { "razorpay_plan_id": "plan_MNbxyz987654321" } }
)

// Verify the updates
db.subscription_plans.find(
  { "razorpay_plan_id": { $exists: true } },
  { "name": 1, "razorpay_plan_id": 1, "_id": 0 }
)
```

---

### **Step 3: Verify the Setup**

1. **Check database**
   ```bash
   cd /Users/anoopsunny/Documents/GuestWorker/app/backend
   python check_plans.py
   ```
   
   Look for `razorpay_plan_id` field in the output.

2. **Test the trial conversion flow**
   - Activate a trial account
   - Click "Add Payment Method" in notification or Manage Subscription
   - Select a plan in the dialog
   - Click "Add Payment Method"
   - Should succeed without errors

---

## 🔍 Troubleshooting

### **Error: "This plan doesn't support auto-renewal"**

**Cause**: Plan doesn't have `razorpay_plan_id` in database

**Solution**:
1. Check if plan has `razorpay_plan_id`:
   ```bash
   python check_plans.py
   ```
2. If missing, follow Step 2 above to add it

### **Error: "Invalid plan_id"**

**Cause**: Wrong Razorpay Plan ID or plan doesn't exist in Razorpay

**Solution**:
1. Verify Plan ID in Razorpay Dashboard
2. Make sure you copied the full ID (starts with `plan_`)
3. Check for typos

### **Plans not showing in trial conversion dialog**

**Cause**: Plans filtered to only show those with `razorpay_plan_id`

**Solution**:
1. Add `razorpay_plan_id` to all plans you want to offer
2. Only plans with Razorpay Plan IDs will show in trial conversion

---

## 📊 Database Schema

After setup, your plans should look like:

```javascript
{
  "id": "uuid-here",
  "name": "Contractor Plus",
  "description": "Perfect for small to medium contractors",
  "price": 799,
  "duration_days": 30,
  "is_active": true,
  "razorpay_plan_id": "plan_MNbxyz123456789",  // ← This is required!
  "max_workers": null,
  "max_employers": null,
  "features": [...],
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## 🎯 What Happens After Setup

Once `razorpay_plan_id` is configured:

1. **Trial users can add payment method**
   - Plans with Razorpay Plan ID show in dialog
   - User selects plan
   - Backend creates Razorpay subscription
   - Subscription starts when trial ends

2. **Automatic conversion**
   - When trial expires
   - Razorpay charges first payment
   - User subscription becomes active
   - No service interruption

3. **Recurring payments**
   - Razorpay handles monthly renewals
   - Auto-charges every month
   - User can cancel anytime

---

## 📝 Important Notes

### **Test Mode vs Live Mode**

- **Test Mode**: Use test Plan IDs (start with `plan_`)
- **Live Mode**: Use live Plan IDs (also start with `plan_`)
- Make sure you're using the correct mode in your Razorpay keys

### **Plan Pricing Must Match**

- Razorpay plan price must match database plan price
- Example: If database says ₹799, Razorpay plan must be ₹799
- Mismatched prices will cause confusion

### **Plan Names Don't Have to Match**

- Database plan name: "Contractor Plus"
- Razorpay plan name: Can be anything
- Only the Plan ID matters for linking

---

## 🚀 Quick Start Commands

```bash
# 1. Navigate to backend directory
cd /Users/anoopsunny/Documents/GuestWorker/app/backend

# 2. Check current plans
python check_plans.py

# 3. Edit the script with your Razorpay Plan IDs
nano add_razorpay_plan_ids.py

# 4. Run the update script
python add_razorpay_plan_ids.py

# 5. Verify the updates
python check_plans.py
```

---

## ✅ Verification Checklist

After completing setup:

- [ ] Created plans in Razorpay Dashboard
- [ ] Copied Razorpay Plan IDs
- [ ] Updated `add_razorpay_plan_ids.py` with correct IDs
- [ ] Ran the update script
- [ ] Verified plans have `razorpay_plan_id` in database
- [ ] Tested trial conversion flow
- [ ] Plans show in trial conversion dialog
- [ ] Payment setup completes without errors

---

## 📞 Need Help?

If you're still having issues:

1. Check Razorpay Dashboard for plan status
2. Verify Plan IDs are correct (no typos)
3. Check MongoDB for `razorpay_plan_id` field
4. Review backend logs for error messages
5. Test with Razorpay test mode first

---

## 🎉 Success!

Once setup is complete, your trial-to-paid conversion flow will work seamlessly:

✅ Users can add payment from Day 1  
✅ Automatic conversion when trial ends  
✅ Recurring monthly payments  
✅ No service interruption  
✅ Professional user experience  

Your conversion rate should increase significantly! 🚀
