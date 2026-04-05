# Platform Revenue Tracking System

## Overview

The platform revenue tracking system monitors and displays all revenue generated from subscriptions, including:
- **Razorpay one-time payments** - Direct subscription purchases
- **Razorpay subscriptions** - Auto-renewal recurring payments
- **Paid activation keys** - Pre-paid activation keys sold to customers

## How It Works

### 1. Revenue Sources

#### Razorpay Payments
When a user purchases a subscription via Razorpay, the payment is recorded in the `payment_orders` collection with:
- `payment_method`: "razorpay" or "razorpay_subscription"
- `amount`: The actual amount paid (in rupees)
- `status`: "success" for completed payments
- `razorpay_payment_id`: Razorpay payment ID for tracking
- `razorpay_order_id`: Razorpay order ID

#### Paid Activation Keys
When an admin creates an activation key with the "Paid" toggle enabled:

1. **Key Creation** (`/admin/activation-keys/generate`):
   - Admin marks the key as `is_paid: true`
   - The key is stored with this flag in the `activation_keys` collection

2. **Key Redemption** (`/subscription/activate`):
   - When a user redeems a paid activation key:
   - System fetches the plan price from `subscription_plans` collection
   - Creates a transaction record in `payment_orders` with:
     - `payment_method`: "activation_key"
     - `amount`: Actual plan price (e.g., ₹799 for Contractor Plus)
     - `is_paid`: true
     - `activation_key`: The key code
     - `status`: "success"

3. **Revenue Recording**:
   - The transaction is automatically counted as platform revenue
   - Appears in the admin revenue dashboard
   - Shows in the user's payment/invoice history

### 2. Admin Revenue Dashboard

**Location**: `/admin/platform-revenue`

**Features**:
- **Total Revenue Summary**: Shows total revenue across all payment methods
- **Revenue by Method**: Breakdown by Razorpay, Razorpay Subscription, and Paid Activation Keys
- **Detailed Transaction List**: All revenue records with user details
- **Filters**: Filter by payment method
- **Export**: Download CSV of all revenue records
- **Razorpay Links**: Direct links to Razorpay dashboard for payment verification

**API Endpoint**: `GET /api/admin/platform-revenue`

**Query Parameters**:
- `payment_method`: Filter by "razorpay", "razorpay_subscription", or "activation_key"
- `skip`: Pagination offset
- `limit`: Number of records per page

### 3. User Payment History

**Location**: `/manage-subscription` (Payment History section)

**What Users See**:
- All their transactions including:
  - Razorpay payments with amounts
  - Paid activation keys with amounts (marked as "Paid")
  - Free activation keys (amount: ₹0)
  - Trial activations
  - Extension keys

**Transaction Details**:
- Date and time
- Description (e.g., "Activated with Key - Contractor Plus (Paid)")
- Amount paid
- Payment method
- Status
- Download invoice option

### 4. Invoice Generation

**Endpoint**: `GET /api/subscription/invoice/{transaction_id}`

**Generates HTML invoices for**:
- Razorpay payments
- Razorpay subscriptions
- **Paid activation keys** (shows actual amount paid)

**Invoice includes**:
- Invoice number
- User details
- Payment method and details
- Plan name and duration
- Amount paid
- Payment status (Paid/Complimentary)

## Database Schema

### payment_orders Collection

```javascript
{
  "id": "uuid",
  "contractor_id": "user_id",
  "plan_name": "Contractor Plus",
  "amount": 799,  // Actual amount in rupees
  "status": "success",
  "payment_method": "activation_key", // or "razorpay" or "razorpay_subscription"
  "activation_key": "XXXX-XXXX-XXXX-XXXX", // Only for activation keys
  "is_paid": true,  // Only for activation keys - indicates if it was a paid key
  "duration_days": 30,
  "razorpay_order_id": null,  // For Razorpay payments
  "razorpay_payment_id": null,  // For Razorpay payments
  "created_at": "2024-01-15T10:30:00Z"
}
```

### activation_keys Collection

```javascript
{
  "id": "uuid",
  "key": "XXXX-XXXX-XXXX-XXXX",
  "plan": "Contractor Plus",
  "max_uses": 1,
  "current_uses": 0,
  "duration_days": 30,
  "is_active": true,
  "is_paid": true,  // NEW: Indicates this key was sold
  "notes": "Sold to customer ABC",
  "created_by": "admin_id",
  "created_at": "2024-01-15T10:00:00Z",
  "used_by": []
}
```

## Admin Workflow

### Creating a Paid Activation Key

1. Navigate to `/admin/activation-keys`
2. Click "Generate Key"
3. Fill in the form:
   - **Plan Name**: Select the plan (e.g., Contractor Plus)
   - **Max Uses**: Usually 1 for paid keys
   - **Duration**: Plan duration in days
   - **Payment**: Select **"Paid"** radio button
   - **Notes**: Optional notes (e.g., "Sold to John Doe")
4. Click "Generate"
5. Share the key with the customer who paid

### Viewing Revenue

1. Navigate to `/admin/platform-revenue`
2. View summary cards showing:
   - Total revenue
   - Revenue by payment method
3. Filter transactions by payment method if needed
4. Click on Razorpay payment IDs to view in Razorpay dashboard
5. Export CSV for accounting/reporting

### Managing Revenue Records

- **Delete Single Record**: Click trash icon on any record
- **Delete All Records**: Click "Delete all" button (use with caution)

## User Workflow

### Redeeming a Paid Activation Key

1. User receives activation key from admin
2. Navigate to `/pricing` or `/activate`
3. Enter the activation key
4. System:
   - Validates the key
   - Fetches plan price from database
   - Creates revenue record with actual amount
   - Activates subscription
   - Shows in payment history with amount

### Viewing Payment History

1. Navigate to `/manage-subscription`
2. Scroll to "Payment History & Invoices" section
3. View all transactions with amounts
4. Download invoices for paid transactions
5. Export payment history as CSV

## Revenue Calculation

### How Amounts are Determined

1. **Razorpay Payments**: Amount from Razorpay transaction
2. **Razorpay Subscriptions**: Amount from subscription charge
3. **Paid Activation Keys**: 
   - Fetched from `subscription_plans` collection based on plan name
   - Example: "Contractor Plus" → ₹799
   - Fallback to stored price in key if plan not found

### Revenue Totals

The admin dashboard calculates:
- **Total Revenue**: Sum of all successful transactions
- **By Method**:
  - Razorpay (one-time): Sum of `payment_method: "razorpay"`
  - Razorpay (Recurring): Sum of `payment_method: "razorpay_subscription"`
  - Activation Key (Paid): Sum of `payment_method: "activation_key"` where `is_paid: true`

## API Endpoints

### Admin Endpoints

```
GET    /api/admin/platform-revenue
       Query: payment_method, skip, limit
       Returns: Total revenue, breakdown by method, transaction list

DELETE /api/admin/platform-revenue/{record_id}
       Deletes a single revenue record

DELETE /api/admin/platform-revenue
       Deletes all revenue records
```

### User Endpoints

```
GET    /api/subscription/transactions
       Returns: User's transaction history with amounts

GET    /api/subscription/invoice/{transaction_id}
       Returns: HTML invoice for the transaction
```

### Activation Key Endpoints

```
POST   /api/admin/activation-keys/generate
       Body: { plan, max_uses, duration_days, notes, is_paid }
       Creates a new activation key

POST   /api/subscription/activate
       Body: { key }
       Redeems activation key and records revenue if paid
```

## Important Notes

### For Admins

1. **Always mark keys as "Paid"** when customer has paid for them
2. **Revenue is recorded when key is redeemed**, not when created
3. **Plan prices** must be configured in the subscription plans database
4. **No refunds** - Deleting a revenue record doesn't refund the customer

### For Developers

1. **Price lookup**: System fetches current plan price when key is redeemed
2. **Transaction integrity**: All revenue records are in `payment_orders` collection
3. **Backward compatibility**: Existing free keys continue to work (amount: 0)
4. **Invoice generation**: Works for all payment methods including paid keys

## Testing

### Test Paid Activation Key Flow

1. Create a subscription plan (if not exists):
   - Name: "Test Plan"
   - Price: 100
   - Duration: 30 days

2. Generate a paid activation key:
   - Plan: "Test Plan"
   - Paid: Yes
   - Max uses: 1

3. Redeem the key as a user:
   - Should activate subscription
   - Should create revenue record with amount: 100
   - Should appear in payment history with ₹100

4. Verify in admin dashboard:
   - Total revenue should increase by ₹100
   - "Activation Key (Paid)" should show ₹100
   - Transaction should be listed with user details

5. Generate invoice:
   - Should show amount: ₹100
   - Should show "Paid" status
   - Should include activation key code

## Troubleshooting

### Revenue not showing for activation key

**Check**:
1. Was the key marked as "Paid" when created?
2. Has the key been redeemed by a user?
3. Does the plan exist in `subscription_plans` collection?
4. Check `payment_orders` collection for the transaction

### Amount showing as ₹0 for paid key

**Possible causes**:
1. Key was not marked as `is_paid: true`
2. Plan not found in database (check plan name matches exactly)
3. Plan has price: 0 in database

**Solution**:
- Verify plan exists: `db.subscription_plans.findOne({name: "Contractor Plus"})`
- Check key: `db.activation_keys.findOne({key: "XXXX-XXXX-XXXX-XXXX"})`
- Verify transaction: `db.payment_orders.findOne({activation_key: "XXXX-XXXX-XXXX-XXXX"})`

### Invoice not generating

**Check**:
1. Transaction exists in `payment_orders` collection
2. Transaction belongs to the requesting user
3. Transaction ID is correct

## Future Enhancements

Potential improvements:
- Revenue analytics with charts and graphs
- Monthly/yearly revenue reports
- Revenue forecasting
- Automatic reconciliation with Razorpay
- Refund management
- Commission tracking for resellers
- Multi-currency support
