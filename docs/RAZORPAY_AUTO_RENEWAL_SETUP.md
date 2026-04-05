# Razorpay Auto-Renewal Subscription Setup Guide

## 🎯 Overview

This guide explains how to set up **complete auto-renewal subscriptions** using Razorpay's Subscription API. Once configured, users will be automatically charged every month without manual intervention.

---

## ✅ What's Been Implemented

### **Backend Changes**

1. **New Database Fields** (User Model)
   - `razorpay_subscription_id` - Stores Razorpay subscription ID
   - `auto_renew` - Boolean flag for auto-renewal status
   - `payment_method` - Now supports `"razorpay_subscription"` value

2. **New API Endpoints**
   - `POST /api/payment/create-subscription` - Creates Razorpay subscription
   - `POST /api/payment/verify-subscription` - Verifies subscription payment

3. **Enhanced Endpoints**
   - `POST /api/subscription/cancel` - Now cancels Razorpay subscription via API
   - `POST /api/payment/webhook` - Handles subscription events (charged, cancelled, paused, resumed)

4. **New Database Collection**
   - `razorpay_subscriptions` - Tracks all subscription records

### **Webhook Events Supported**
- `subscription.charged` - Auto-renewal payment successful (extends subscription)
- `subscription.cancelled` - Subscription cancelled
- `subscription.paused` - Subscription paused
- `subscription.resumed` - Subscription resumed
- `subscription.completed` - Subscription completed

---

## 🚀 Setup Instructions

### **Step 1: Create Razorpay Subscription Plans**

1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Subscriptions** → **Plans**
3. Click **Create Plan**

#### **Example: Contractor Plus Plan**
```
Plan Name: Contractor Plus - Monthly
Billing Amount: ₹79900 (in paise = ₹799)
Billing Interval: Every 1 Month
Billing Cycles: Leave empty (infinite)
Description: Monthly subscription for Contractor Plus
Trial Period: 0 days (or set if needed)
```

4. Click **Create** and copy the **Plan ID** (e.g., `plan_NXXXXXXXXXXXXx`)

#### **Repeat for Each Plan**
- Contractor Plus: `plan_xxxxxxxxxxxxx`
- Contractor Pro: `plan_yyyyyyyyyyyyy`
- Enterprise: `plan_zzzzzzzzzzzzz`

---

### **Step 2: Update Database Plans**

Add `razorpay_plan_id` to your subscription plans in MongoDB:

```javascript
// Connect to MongoDB
use guestworker

// Update Contractor Plus plan
db.subscription_plans.updateOne(
  { name: "Contractor Plus" },
  { 
    $set: { 
      razorpay_plan_id: "plan_xxxxxxxxxxxxx",  // Your actual plan ID
      auto_renewal: true
    } 
  }
)

// Update Contractor Pro plan
db.subscription_plans.updateOne(
  { name: "Contractor Pro" },
  { 
    $set: { 
      razorpay_plan_id: "plan_yyyyyyyyyyyyy",  // Your actual plan ID
      auto_renewal: true
    } 
  }
)

// Verify updates
db.subscription_plans.find({}, { name: 1, razorpay_plan_id: 1, auto_renewal: 1 })
```

---

### **Step 3: Configure Environment Variables**

Ensure your `.env` file has:

```bash
# Razorpay Credentials
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

**Important**: Use `rzp_live_*` for production, `rzp_test_*` for testing.

---

### **Step 4: Configure Webhook URL**

1. Go to Razorpay Dashboard → **Settings** → **Webhooks**
2. Click **Add Webhook URL**
3. Enter your webhook URL:
   ```
   https://api.guestworker.app/api/payment/webhook
   ```
   (Replace with your actual domain)

4. Select these events:
   - ✅ `payment.captured`
   - ✅ `payment.failed`
   - ✅ `subscription.charged` ⭐ (Most important for auto-renewal)
   - ✅ `subscription.cancelled`
   - ✅ `subscription.paused`
   - ✅ `subscription.resumed`
   - ✅ `subscription.completed`

5. Enter **Webhook Secret** (same as in `.env`)
6. Click **Create Webhook**

---

## 🔄 How Auto-Renewal Works

### **Initial Subscription**

1. User selects a plan on pricing page
2. Frontend checks if `plan.razorpay_plan_id` exists
3. If yes → Calls `api.createSubscription({ plan_id })`
4. Backend creates Razorpay subscription
5. User completes payment via Razorpay checkout
6. Frontend calls `api.verifySubscriptionPayment()`
7. Backend activates subscription with `auto_renew: true`

### **Monthly Renewal (Automatic)**

1. Razorpay automatically charges user on renewal date
2. Razorpay sends `subscription.charged` webhook
3. Backend receives webhook:
   - Extends `subscription_end_date` by 30 days
   - Creates payment record with `is_renewal: true`
   - User continues to have access
4. User receives email from Razorpay (automatic)

### **Cancellation**

1. User clicks "Cancel Subscription" in dashboard
2. Frontend calls `api.cancelSubscription()`
3. Backend:
   - Calls Razorpay API to cancel subscription
   - Sets `auto_renew: false`
   - Sets `subscription_status: "cancelled"`
4. User retains access until current period ends
5. No further charges occur

---

## 📊 Database Schema

### **Users Collection**
```javascript
{
  "id": "user-123",
  "email": "user@example.com",
  "subscription_plan": "Contractor Plus",
  "subscription_status": "active",
  "subscription_end_date": "2026-04-16T00:00:00Z",
  "payment_method": "razorpay_subscription",
  "razorpay_subscription_id": "sub_xxxxxxxxxxxxx",  // NEW
  "auto_renew": true,  // NEW
  "created_at": "2026-03-16T00:00:00Z"
}
```

### **Subscription Plans Collection**
```javascript
{
  "id": "plan-123",
  "name": "Contractor Plus",
  "price": 799,
  "duration_days": 30,
  "razorpay_plan_id": "plan_xxxxxxxxxxxxx",  // NEW - Required for auto-renewal
  "auto_renewal": true,  // NEW
  "is_active": true,
  "features": [...]
}
```

### **Razorpay Subscriptions Collection** (NEW)
```javascript
{
  "id": "sub-record-123",
  "contractor_id": "user-123",
  "razorpay_subscription_id": "sub_xxxxxxxxxxxxx",
  "razorpay_plan_id": "plan_xxxxxxxxxxxxx",
  "plan_name": "Contractor Plus",
  "amount": 799,
  "currency": "INR",
  "status": "active",  // created, authenticated, active, paused, cancelled, completed
  "duration_days": 30,
  "created_at": "2026-03-16T00:00:00Z"
}
```

### **Payment Orders Collection**
```javascript
{
  "id": "payment-123",
  "contractor_id": "user-123",
  "razorpay_subscription_id": "sub_xxxxxxxxxxxxx",
  "razorpay_payment_id": "pay_xxxxxxxxxxxxx",
  "amount": 799,
  "status": "paid",
  "payment_method": "razorpay_subscription",
  "plan_name": "Contractor Plus",
  "is_renewal": true,  // NEW - Indicates auto-renewal payment
  "created_at": "2026-04-16T00:00:00Z"
}
```

---

## 🧪 Testing

### **Test Mode Setup**

1. Use Razorpay test credentials:
   ```bash
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=test_secret_key
   ```

2. Create test plans in Razorpay Dashboard (Test Mode)

3. Use test cards:
   - Success: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date

### **Test Scenarios**

#### **1. New Subscription**
```bash
# User flow
1. Register/Login
2. Go to /pricing
3. Select plan with auto-renewal
4. Complete payment
5. Verify: subscription_status = "active", auto_renew = true
```

#### **2. Auto-Renewal (Simulate)**
```bash
# Manually trigger webhook (Razorpay Dashboard → Webhooks → Test)
Event: subscription.charged
Payload: { subscription_id: "sub_xxxxx", payment_id: "pay_xxxxx" }

# Verify:
- subscription_end_date extended by 30 days
- New payment record created with is_renewal: true
```

#### **3. Cancellation**
```bash
# User flow
1. Go to /manage-subscription
2. Click "Cancel Subscription"
3. Verify: auto_renew = false, subscription_status = "cancelled"
4. Verify: User still has access until end date
```

---

## 🔍 Monitoring & Logs

### **Check Subscription Status**
```javascript
// MongoDB query
db.users.find(
  { auto_renew: true },
  { email: 1, subscription_plan: 1, subscription_end_date: 1, razorpay_subscription_id: 1 }
)
```

### **View Renewal Payments**
```javascript
db.payment_orders.find(
  { is_renewal: true },
  { contractor_id: 1, amount: 1, created_at: 1 }
).sort({ created_at: -1 })
```

### **Backend Logs**
```bash
# Successful renewal
Webhook: Subscription renewed for sub_xxxxx, new end: 2026-05-16T00:00:00Z

# Cancellation
Razorpay subscription sub_xxxxx cancelled for user user-123
```

---

## 🚨 Troubleshooting

### **Issue: Subscription not auto-renewing**

**Check:**
1. Plan has `razorpay_plan_id` in database
2. User has `razorpay_subscription_id` in database
3. Webhook URL is configured correctly
4. Webhook events include `subscription.charged`
5. Webhook secret matches `.env` file

**Debug:**
```javascript
// Check user
db.users.findOne({ email: "user@example.com" })

// Check subscription
db.razorpay_subscriptions.findOne({ contractor_id: "user-123" })

// Check recent webhooks in Razorpay Dashboard
```

### **Issue: Payment fails but subscription not cancelled**

Razorpay automatically retries failed payments. Check:
- Razorpay Dashboard → Subscriptions → View subscription
- See retry attempts and status

### **Issue: Webhook signature verification fails**

**Solution:**
1. Verify `RAZORPAY_WEBHOOK_SECRET` in `.env` matches Razorpay Dashboard
2. Check webhook logs in Razorpay Dashboard for error details
3. Ensure webhook URL is accessible (not localhost for production)

---

## 📝 API Reference

### **Create Subscription**
```http
POST /api/payment/create-subscription
Authorization: Cookie (auth_token)
Content-Type: application/json

{
  "plan_id": "plan-123"
}

Response:
{
  "subscription_id": "sub_xxxxxxxxxxxxx",
  "plan_name": "Contractor Plus",
  "amount": 799,
  "currency": "INR"
}
```

### **Verify Subscription Payment**
```http
POST /api/payment/verify-subscription
Authorization: Cookie (auth_token)
Content-Type: application/json

{
  "razorpay_payment_id": "pay_xxxxxxxxxxxxx",
  "razorpay_subscription_id": "sub_xxxxxxxxxxxxx",
  "razorpay_signature": "signature_here"
}

Response:
{
  "success": true,
  "message": "Subscription activated successfully with auto-renewal",
  "subscription_end_date": "2026-04-16T00:00:00Z",
  "auto_renew": true,
  "next_billing_date": "2026-04-16T00:00:00Z"
}
```

### **Cancel Subscription**
```http
POST /api/subscription/cancel
Authorization: Cookie (auth_token)

Response:
{
  "message": "Subscription cancelled successfully. You will retain access until your current period ends.",
  "access_until": "2026-04-16T00:00:00Z",
  "auto_renew": false
}
```

---

## ✅ Deployment Checklist

- [ ] Create Razorpay subscription plans (live mode)
- [ ] Copy plan IDs from Razorpay Dashboard
- [ ] Update MongoDB plans with `razorpay_plan_id`
- [ ] Set production environment variables
- [ ] Configure webhook URL in Razorpay Dashboard
- [ ] Enable required webhook events
- [ ] Test subscription creation
- [ ] Test payment verification
- [ ] Test cancellation
- [ ] Monitor first auto-renewal (after 30 days)
- [ ] Set up monitoring/alerts for failed renewals

---

## 🎉 Benefits of Auto-Renewal

### **For Business**
- ✅ Predictable recurring revenue
- ✅ Reduced churn (users don't need to manually renew)
- ✅ Automatic payment retry on failures
- ✅ Better cash flow management

### **For Users**
- ✅ Uninterrupted service
- ✅ No manual renewal needed
- ✅ Email reminders before charging
- ✅ Easy cancellation anytime

---

## 📞 Support

- **Razorpay Docs**: https://razorpay.com/docs/api/subscriptions/
- **Webhook Testing**: https://razorpay.com/docs/webhooks/test/
- **Support**: support@razorpay.com

---

**Implementation Complete! 🚀**

Your system now supports full auto-renewal subscriptions. Users will be automatically charged every month, and you'll receive webhook notifications for all subscription events.
