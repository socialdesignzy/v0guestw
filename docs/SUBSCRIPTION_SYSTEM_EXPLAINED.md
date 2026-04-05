# Subscription System - Complete Explanation

## 📊 Database Schema

### User Document Structure (MongoDB `users` collection)

Each user document contains these subscription-related fields:

```javascript
{
  "id": "uuid-string",
  "email": "user@example.com",
  "name": "User Name",
  "role": "contractor" | "admin",
  "is_active": true | false,
  
  // ============ SUBSCRIPTION FIELDS ============
  "subscription_plan": "none" | "Contractor Plan" | "Contractor Pro Trial" | etc.,
  "subscription_status": "inactive" | "active" | "expired" | "suspended" | "cancelled" | "trial",
  "plan_start_date": "2025-01-01T00:00:00Z" | null,  // ISO datetime string
  "plan_end_date": "2025-01-31T23:59:59Z" | null,    // ISO datetime string (null = lifetime)
  "subscription_start_date": "2025-01-01T00:00:00Z" | null,  // Alternative field name
  "subscription_end_date": "2025-01-31T23:59:59Z" | null,    // Alternative field name
  "payment_method": "razorpay" | "activation_key" | null,
  "activation_key": "KEY-XXXX-XXXX" | null,  // If activated via key
  
  "created_at": "2025-01-01T00:00:00Z"
}
```

### Subscription Status Values

| Status | Meaning | Access Level |
|--------|---------|--------------|
| `inactive` | No subscription (default for new users) | ❌ No access |
| `active` | Valid subscription | ✅ Full access |
| `expired` | Subscription period ended | ❌ No access |
| `suspended` | Manually suspended by admin | ❌ No access |
| `cancelled` | User cancelled subscription | ❌ No access |
| `trial` | On trial period | ✅ Full access |

### Subscription Plan Values

| Plan | Description |
|------|-------------|
| `none` | No plan (default) |
| `Contractor Plan` | Standard paid plan |
| `Contractor Pro Trial` | Trial version |
| `enterprise` | Enterprise plan (admin key) |
| `contractor` | Generic contractor plan |

---

## 🔐 Access Control Flow

### Backend Access Control

#### 1. **Authentication Layer** (`get_current_user`)
```python
# Location: backend/server.py:885
async def get_current_user(auth_token: Optional[str] = Cookie(None)):
    """
    Checks:
    1. JWT token exists and is valid
    2. Token not expired
    3. User exists in database
    4. Account is active (is_active = true)
    5. Role matches token
    """
    # Returns User object if all checks pass
```

#### 2. **Subscription Check Layer** (`get_active_subscription_user`)
```python
# Location: backend/server.py:973
async def get_active_subscription_user(current_user: User = Depends(get_current_user)):
    """
    This is the KEY function that enforces subscription access!
    
    Checks:
    1. If user is admin → ✅ Always allowed
    2. If subscription_status != "active" → ❌ Blocked (403 error)
    3. If plan_end_date < now → ❌ Expired (403 error, auto-updates status to "expired")
    
    Used by ALL protected endpoints (workers, employers, attendance, payments, etc.)
    """
    
    # Admin bypass
    if current_user.role == "admin":
        return current_user
    
    # Status check
    if current_user.subscription_status != "active":
        raise HTTPException(403, "Active subscription required")
    
    # Expiry check (with auto-expiration)
    if current_user.plan_end_date:
        if end_date < datetime.now(timezone.utc):
            # Auto-update status to expired
            await db.users.update_one(
                {"id": current_user.id},
                {"$set": {"subscription_status": "expired"}}
            )
            raise HTTPException(403, "Your subscription has expired")
    
    return current_user
```

#### 3. **Endpoint Protection**

**Protected Endpoints** (require active subscription):
```python
# ALL of these use: current_user: User = Depends(get_active_subscription_user)

POST   /api/workers              # Create worker
GET    /api/workers              # List workers
PUT    /api/workers/{id}         # Update worker
DELETE /api/workers/{id}         # Delete worker

POST   /api/employers
GET    /api/employers
PUT    /api/employers/{id}
DELETE /api/employers/{id}

POST   /api/attendance/employer
POST   /api/attendance/worker
GET    /api/attendance/...

POST   /api/payments/collect
POST   /api/payments/settle-wage
GET    /api/payments/...

POST   /api/advances
GET    /api/advances
... and 100+ more endpoints
```

**Unprotected Endpoints** (only require authentication):
```python
# Use: current_user: User = Depends(get_current_user) instead

GET  /api/auth/me                    # Get user profile
POST /api/auth/change-password       # Change password
POST /api/messages/send              # Send help message
GET  /api/subscription/transactions  # View transactions
POST /api/auth/redeem-key            # Redeem activation key
```

### Frontend Access Control

#### 1. **Protected Routes** (`ProtectedRoute` component)
```javascript
// Location: frontend/src/App.js:450

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, hasActiveSubscription } = useAuth();

  // Loading state
  if (loading) return <LoadingSpinner />;

  // Not authenticated
  if (!user) return <Navigate to="/login" />;

  // Admin routing
  if (user.role === 'admin') {
    if (requireAdmin) return <Layout>{children}</Layout>;
    return <Navigate to="/admin" />;
  }

  // Subscription check
  if (!hasActiveSubscription()) {
    // Allow access to pricing and account pages
    if (window.location.pathname === '/pricing' || window.location.pathname === '/account') {
      return <Layout>{children}</Layout>;
    }
    // Redirect to pricing page
    return <Navigate to="/pricing" />;
  }

  return <Layout>{children}</Layout>;
}
```

#### 2. **Subscription Check Function**
```javascript
// Location: frontend/src/context/AuthContext.js:57

const hasActiveSubscription = () => {
  if (!user) return false;
  if (user.role === 'admin') return true;  // Admin always has access
  return user.subscription_status === 'active';  // Must be "active"
};
```

---

## 🚀 How Subscriptions Are Activated

### Method 1: Razorpay Payment

#### Step 1: Create Payment Order
```python
# Location: backend/server.py:8840
@api_router.post("/payment/create-order")
async def create_payment_order(order_data: dict, current_user: User = Depends(get_current_user)):
    # Creates Razorpay order
    # Saves order to payment_orders collection with status="pending"
    return {"order_id": "...", "amount": 79900, "currency": "INR"}
```

#### Step 2: Payment Verification
```python
# Location: backend/server.py:8916
@api_router.post("/payment/verify")
async def verify_payment(payment_data: dict, current_user: User = Depends(get_current_user)):
    # Verifies Razorpay payment signature
    # Updates order status to "paid"
    
    # Calculate new end date
    current_end = user.get('subscription_end_date')
    if current_end and current_end > now:
        new_end = current_end + timedelta(days=order['duration_days'])  # Extend
    else:
        new_end = now + timedelta(days=order['duration_days'])  # Start fresh
    
    # UPDATE USER SUBSCRIPTION
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "subscription_plan": order['plan_type'],  # e.g., "Contractor Plan"
            "subscription_status": "active",
            "subscription_start_date": datetime.now(timezone.utc).isoformat(),
            "subscription_end_date": new_end.isoformat()
        }}
    )
```

**Database Update:**
```javascript
// Before
{
  "subscription_plan": "none",
  "subscription_status": "inactive",
  "subscription_end_date": null
}

// After
{
  "subscription_plan": "Contractor Plan",
  "subscription_status": "active",
  "subscription_start_date": "2025-01-15T10:30:00Z",
  "subscription_end_date": "2025-02-14T10:30:00Z",  // +30 days
  "payment_method": "razorpay"
}
```

### Method 2: Activation Key Redemption

```python
# Location: backend/server.py:8029
@api_router.post("/auth/redeem-key")
async def redeem_activation_key(key_data: dict, current_user: User = Depends(get_current_user)):
    # Find activation key
    key = await db.activation_keys.find_one({"key": activation_code})
    
    # Validate key (active, not maxed out, user hasn't used it)
    
    # Calculate end date (extend if active, start fresh if expired)
    current_status = user_from_db.get('subscription_status', 'inactive')
    if current_status in ['expired', 'suspended', 'inactive']:
        new_end = datetime.now(timezone.utc) + timedelta(days=key.get('duration_days', 30))
    elif current_end > now:
        new_end = current_end + timedelta(days=key.get('duration_days', 30))  # Extend
    else:
        new_end = datetime.now(timezone.utc) + timedelta(days=key.get('duration_days', 30))
    
    # UPDATE USER SUBSCRIPTION
    await db.users.update_one(
        {"id": current_user.id},
        {
            "$set": {
                "subscription_plan": key.get('plan'),  # From activation key
                "subscription_status": "active",
                "subscription_end_date": new_end.isoformat(),
                "plan_end_date": new_end.isoformat(),
                "plan_start_date": datetime.now(timezone.utc).isoformat(),
                "payment_method": "activation_key"
            }
        }
    )
    
    # Update key usage tracking
    await db.activation_keys.update_one(
        {"key": activation_code},
        {
            "$inc": {"current_uses": 1},
            "$push": {"used_by": current_user.id}
        }
    )
```

### Method 3: Trial Activation

```python
# Location: backend/server.py:632
@api_router.post("/subscription/activate-trial")
async def activate_trial(current_user: User = Depends(get_current_user)):
    # Check if already active or on trial
    if current_user.subscription_status in ["active", "trial"]:
        raise HTTPException(400, "Trial already used or subscription active")
    
    # Get trial settings from database
    trial_settings = await db.trial_settings.find_one({"is_active": True})
    duration_days = trial_settings.get('duration_days', 14)
    
    now = datetime.now(timezone.utc)
    end = now + timedelta(days=duration_days)
    
    # UPDATE USER SUBSCRIPTION
    await db.users.update_one(
        {"id": current_user.id},
        {
            "$set": {
                "subscription_plan": "Contractor Pro Trial",
                "subscription_status": "active",  # Note: status is "active", not "trial"
                "subscription_start_date": now.isoformat(),
                "subscription_end_date": end.isoformat()
            }
        }
    )
```

### Method 4: Admin Key (Lifetime Access)

```python
# Location: backend/server.py:1266
@api_router.post("/auth/activate-plan")
async def activate_plan(data: ActivatePlan, current_user: User = Depends(get_current_user)):
    if data.activation_key != ADMIN_ACTIVATION_KEY:  # "GW-ADMIN-2025-SECURE-KEY"
        raise HTTPException(400, "Invalid activation key")
    
    # LIFETIME ACCESS - no end date
    await db.users.update_one(
        {"id": current_user.id},
        {
            "$set": {
                "subscription_plan": "contractor",
                "subscription_status": "active",
                "plan_start_date": datetime.now(timezone.utc).isoformat(),
                "plan_end_date": None  # NULL = lifetime access
            }
        }
    )
```

---

## 🔄 Auto-Expiration Logic

### Backend Auto-Expiration
Every time `get_active_subscription_user()` is called (on every protected endpoint request), it checks:

```python
if current_user.plan_end_date:
    end_date = parse_datetime(current_user.plan_end_date)
    if end_date < datetime.now(timezone.utc):
        # AUTO-UPDATE to expired
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {"subscription_status": "expired"}}
        )
        raise HTTPException(403, "Your subscription has expired")
```

**This means:**
- ✅ Expiration is checked on every API call
- ✅ Status is automatically updated to "expired"
- ✅ No cron job needed - real-time expiration

### Frontend Expiration Handling
The frontend checks subscription status on every page load via `AuthContext.fetchUser()`:

```javascript
// Location: frontend/src/context/AuthContext.js:19
const fetchUser = async () => {
  const response = await axios.get(`${API}/auth/me`);
  setUser(response.data);  // Contains current subscription_status
};
```

If status is "expired", `hasActiveSubscription()` returns `false`, and user is redirected to `/pricing`.

---

## 📝 Example: Complete User Journey

### 1. New User Registration
```javascript
// Database after registration
{
  "id": "user-123",
  "email": "newuser@example.com",
  "subscription_plan": "none",
  "subscription_status": "inactive",
  "plan_start_date": null,
  "plan_end_date": null
}
```
**Access:** ❌ Can only access `/login`, `/register`, `/pricing`, `/pricing-info`

### 2. User Activates Trial
```javascript
// After POST /api/subscription/activate-trial
{
  "subscription_plan": "Contractor Pro Trial",
  "subscription_status": "active",
  "plan_start_date": "2025-01-15T10:00:00Z",
  "plan_end_date": "2025-01-29T10:00:00Z"  // +14 days
}
```
**Access:** ✅ Full access to all features

### 3. User Pays via Razorpay
```javascript
// After payment verification
{
  "subscription_plan": "Contractor Plan",
  "subscription_status": "active",
  "plan_start_date": "2025-01-15T10:00:00Z",
  "plan_end_date": "2025-02-14T10:00:00Z",  // Extended by 30 days
  "payment_method": "razorpay"
}
```
**Access:** ✅ Full access, subscription extended

### 4. Subscription Expires
```javascript
// After plan_end_date passes and user makes API call
{
  "subscription_plan": "Contractor Plan",
  "subscription_status": "expired",  // Auto-updated by backend
  "plan_end_date": "2025-02-14T10:00:00Z"  // In the past
}
```
**Access:** ❌ Redirected to `/pricing`, API returns 403 errors

### 5. User Redeems Activation Key
```javascript
// After POST /api/auth/redeem-key
{
  "subscription_plan": "Contractor Plan",
  "subscription_status": "active",
  "plan_start_date": "2025-02-15T10:00:00Z",  // Fresh start
  "plan_end_date": "2025-03-17T10:00:00Z",  // +30 days from now
  "payment_method": "activation_key"
}
```
**Access:** ✅ Full access restored

---

## 🎯 Key Takeaways

1. **Subscription is stored in user document** with 4 main fields:
   - `subscription_plan`: Plan name
   - `subscription_status`: Current status ("active" = access granted)
   - `plan_start_date`: When subscription started
   - `plan_end_date`: When subscription ends (null = lifetime)

2. **Access is checked at TWO levels:**
   - **Backend:** `get_active_subscription_user()` on every protected endpoint
   - **Frontend:** `hasActiveSubscription()` in route protection

3. **Expiration is automatic:**
   - Checked on every API call
   - Status auto-updates to "expired"
   - No manual intervention needed

4. **Admin users bypass all checks:**
   - `role === "admin"` → Always has access
   - No subscription required

5. **Status values:**
   - Only `subscription_status === "active"` grants access
   - All other statuses (`inactive`, `expired`, `suspended`, etc.) block access

---

## 🔍 Quick Reference

### Check if user has access:
```python
# Backend
user.subscription_status == "active" and (
    user.plan_end_date is None or 
    user.plan_end_date > datetime.now(timezone.utc)
)
```

```javascript
// Frontend
user.subscription_status === 'active'
```

### Activate subscription:
```python
await db.users.update_one(
    {"id": user_id},
    {"$set": {
        "subscription_plan": "Contractor Plan",
        "subscription_status": "active",
        "subscription_start_date": now.isoformat(),
        "subscription_end_date": (now + timedelta(days=30)).isoformat()
    }}
)
```

### Deactivate/Expire subscription:
```python
await db.users.update_one(
    {"id": user_id},
    {"$set": {"subscription_status": "expired"}}
)
```

