# Subscription Management API Endpoints

## 📅 Created: October 30, 2025

This document lists all the new subscription management endpoints added to the backend.

---

## 🔑 Extension Keys Management (Admin)

### 1. Generate Extension Key
**POST** `/admin/extension-keys/generate`
- **Auth**: Admin required
- **Body**:
  ```json
  {
    "duration_days": 30,
    "max_uses": 1,
    "notes": "Optional notes",
    "expiry_date": "2025-12-31T23:59:59Z" // Optional
  }
  ```
- **Response**:
  ```json
  {
    "message": "Extension key generated successfully",
    "key": "EXT-ABC12345-XYZ67890",
    "details": {
      "duration_days": 30,
      "max_uses": 1
    }
  }
  ```

### 2. Get All Extension Keys
**GET** `/admin/extension-keys?status=active&skip=0&limit=100`
- **Auth**: Admin required
- **Query Params**:
  - `status`: "active", "inactive", "used", or omit for all
  - `skip`: pagination offset
  - `limit`: results per page
- **Response**:
  ```json
  {
    "keys": [
      {
        "id": "uuid",
        "key": "EXT-ABC12345-XYZ67890",
        "duration_days": 30,
        "max_uses": 1,
        "is_active": true,
        "used": false,
        "used_by": [
          {
            "user_id": "user-uuid",
            "user_email": "user@example.com",
            "days_extended": 30,
            "applied_at": "2025-10-30T12:00:00Z"
          }
        ],
        "created_at": "2025-10-30T10:00:00Z"
      }
    ],
    "total": 10
  }
  ```

### 3. Toggle Extension Key Status
**PUT** `/admin/extension-keys/{key_id}/toggle`
- **Auth**: Admin required
- **Response**: `{"message": "Extension key activated/deactivated successfully"}`

### 4. Delete Extension Key
**DELETE** `/admin/extension-keys/{key_id}`
- **Auth**: Admin required
- **Response**: `{"message": "Extension key deleted successfully"}`

---

## 🎁 Promo/Discount Codes Management (Admin)

### 1. Generate Promo Code
**POST** `/admin/promo-codes/generate`
- **Auth**: Admin required
- **Body**:
  ```json
  {
    "code": "SAVE20", // Optional - auto-generated if not provided
    "discount_type": "percentage", // or "fixed"
    "discount_value": 20,
    "max_uses": 100, // 0 for unlimited
    "description": "20% off first month",
    "expiry_date": "2025-12-31T23:59:59Z" // Optional
  }
  ```
- **Response**:
  ```json
  {
    "message": "Promo code generated successfully",
    "code": "SAVE20",
    "details": {
      "discount_type": "percentage",
      "discount_value": 20,
      "max_uses": 100
    }
  }
  ```

### 2. Get All Promo Codes
**GET** `/admin/promo-codes?status=active&skip=0&limit=100`
- **Auth**: Admin required
- **Query Params**: Same as extension keys
- **Response**:
  ```json
  {
    "promo_codes": [
      {
        "id": "uuid",
        "code": "SAVE20",
        "discount_type": "percentage",
        "discount_value": 20,
        "max_uses": 100,
        "times_used": 25,
        "is_active": true,
        "is_expired": false,
        "is_exhausted": false,
        "description": "20% off first month",
        "created_at": "2025-10-30T10:00:00Z"
      }
    ],
    "total": 5
  }
  ```

### 3. Toggle Promo Code Status
**PUT** `/admin/promo-codes/{promo_id}/toggle`
- **Auth**: Admin required
- **Response**: `{"message": "Promo code activated/deactivated successfully"}`

### 4. Update Promo Code
**PUT** `/admin/promo-codes/{promo_id}`
- **Auth**: Admin required
- **Body**:
  ```json
  {
    "discount_value": 25,
    "max_uses": 150,
    "description": "Updated description",
    "expiry_date": "2025-12-31T23:59:59Z"
  }
  ```
- **Response**: `{"message": "Promo code updated successfully"}`

### 5. Delete Promo Code
**DELETE** `/admin/promo-codes/{promo_id}`
- **Auth**: Admin required
- **Response**: `{"message": "Promo code deleted successfully"}`

---

## 💳 Subscription Plans Management (Admin)

### 1. Create Plan
**POST** `/admin/plans`
- **Auth**: Admin required
- **Body**:
  ```json
  {
    "name": "Professional Plan",
    "price": 999,
    "duration_days": 30,
    "features": ["Unlimited workers", "Email support", "Reports"],
    "description": "Best for growing businesses",
    "is_active": true
  }
  ```
- **Response**:
  ```json
  {
    "message": "Plan created successfully",
    "plan": {
      "id": "plan-uuid",
      "name": "Professional Plan",
      "price": 999,
      "duration_days": 30
    }
  }
  ```

### 2. Get All Plans (Admin View)
**GET** `/admin/plans?include_inactive=false`
- **Auth**: Admin required
- **Response**:
  ```json
  {
    "plans": [
      {
        "id": "plan-uuid",
        "name": "Professional Plan",
        "price": 999,
        "duration_days": 30,
        "features": ["Unlimited workers", "Email support"],
        "description": "Best for growing businesses",
        "is_active": true,
        "subscriber_count": 150,
        "created_at": "2025-10-30T10:00:00Z"
      }
    ]
  }
  ```

### 3. Get Active Plans (Public)
**GET** `/plans`
- **Auth**: None (public endpoint)
- **Response**: Same as admin but only active plans, sorted by price

### 4. Update Plan
**PUT** `/admin/plans/{plan_id}`
- **Auth**: Admin required
- **Body**: Any fields from create plan (partial update supported)
- **Response**: `{"message": "Plan updated successfully"}`

### 5. Delete Plan
**DELETE** `/admin/plans/{plan_id}`
- **Auth**: Admin required
- **Note**: Cannot delete if users are subscribed to it
- **Response**: `{"message": "Plan deleted successfully"}`
- **Error**: `{"detail": "Cannot delete plan: 150 active subscribers are using this plan"}`

---

## 👤 User Subscription Endpoints

### 1. Get My Transactions
**GET** `/subscription/transactions`
- **Auth**: User required
- **Returns**: 
  - Razorpay payment orders
  - Activation key usage
  - Extension key usage history
- **Response**:
  ```json
  [
    {
      "id": "trans-uuid",
      "description": "Subscription Payment - Monthly Plan",
      "amount": 999,
      "payment_method": "razorpay",
      "payment_method_label": "Razorpay",
      "status": "success",
      "created_at": "2025-10-30T12:00:00Z"
    },
    {
      "id": "key_abc123",
      "description": "Activated with Key - Contractor Plan",
      "amount": 0,
      "payment_method": "activation_key",
      "status": "success",
      "created_at": "2025-10-15T10:00:00Z"
    }
  ]
  ```

### 2. Apply Extension Key
**POST** `/subscription/apply-extension-key`
- **Auth**: User required
- **Body**:
  ```json
  {
    "key": "EXT-ABC12345-XYZ67890"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Successfully extended subscription by 30 days",
    "new_end_date": "2025-12-30T23:59:59Z",
    "days_extended": 30
  }
  ```

### 3. Cancel Subscription
**POST** `/subscription/cancel`
- **Auth**: User required
- **Response**:
  ```json
  {
    "message": "Subscription cancelled successfully. You will retain access until your current period ends.",
    "access_until": "2025-11-30T23:59:59Z"
  }
  ```

### 4. Apply Promo Code
**POST** `/subscription/apply-promo`
- **Auth**: User required
- **Body**:
  ```json
  {
    "code": "SAVE20"
  }
  ```
- **Response**:
  ```json
  {
    "valid": true,
    "code": "SAVE20",
    "discount_type": "percentage",
    "discount_value": 20,
    "description": "20% off first month"
  }
  ```

---

## 📊 Database Collections

### New Collections Created:

1. **`extension_keys`**
   - Stores validity extension keys
   - Fields: id, key, duration_days, max_uses, is_active, used, notes, expiry_date, created_by, created_at

2. **`extension_key_usage`**
   - Tracks who used which extension key
   - Fields: id, user_id, user_email, extension_key, days_extended, previous_end_date, new_end_date, applied_at

3. **`promo_codes`**
   - Stores discount/promo codes
   - Fields: id, code, discount_type, discount_value, max_uses, times_used, used_by[], is_active, description, expiry_date, created_by, created_at

4. **`subscription_plans`**
   - Stores subscription plan details
   - Fields: id, name, price, duration_days, features[], description, is_active, created_by, created_at, updated_at

---

## 🔒 Security Features

- ✅ All admin endpoints require admin authentication
- ✅ User endpoints require user authentication
- ✅ Input validation on all endpoints
- ✅ Promo code uniqueness check
- ✅ Plan name uniqueness check
- ✅ Cannot delete plans with active subscribers
- ✅ Expiry date validation for keys and promo codes
- ✅ Usage limit tracking and validation

---

## 🧪 Testing Endpoints

Use tools like Postman or curl:

```bash
# Example: Generate extension key (admin)
curl -X POST http://localhost:8000/api/admin/extension-keys/generate \
  -H "Content-Type: application/json" \
  -d '{
    "duration_days": 30,
    "max_uses": 1,
    "notes": "Test key"
  }'

# Example: Apply promo code (user)
curl -X POST http://localhost:8000/api/subscription/apply-promo \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SAVE20"
  }'
```

---

## ✅ Summary

**Total New Endpoints**: 18
- Extension Keys: 4 endpoints
- Promo Codes: 5 endpoints
- Plans: 5 endpoints
- User Subscription: 4 endpoints

All endpoints are production-ready and include proper error handling!

