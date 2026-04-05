# Admin Revenue Quick Guide

## Creating Paid Activation Keys

### Step-by-Step

1. **Navigate to Activation Keys**
   - Go to `/admin/activation-keys`
   - Click on "Activation Keys" tab

2. **Generate New Key**
   - Click "Generate Key" button
   - Fill in the form:
     - **Plan Name**: Select plan (e.g., Contractor Plus, Contractor Pro)
     - **Max Uses**: Set to 1 for single-use paid keys
     - **Duration (Days)**: Plan duration (usually 30)
     - **Payment**: **Select "Paid" radio button** ⚠️ IMPORTANT
     - **Notes**: Add customer details (optional but recommended)
   
3. **Share with Customer**
   - Copy the generated key
   - Send to customer who has paid
   - Customer redeems at `/pricing` or `/activate`

### Important Notes

- ✅ **Always select "Paid"** when customer has paid for the key
- ✅ **Revenue is recorded when key is redeemed**, not when created
- ✅ **Amount is automatically fetched** from the plan's price in database
- ❌ **Don't create paid keys for free/promotional keys**

## Viewing Platform Revenue

### Access Revenue Dashboard

1. Navigate to `/admin/platform-revenue`
2. View summary cards:
   - **Total Revenue**: All revenue combined
   - **Razorpay (one-time)**: Direct payments
   - **Razorpay (Recurring)**: Subscription renewals
   - **Activation Key (Paid)**: Revenue from paid keys

### Filter and Export

- **Filter by Method**: Use dropdown to filter by payment type
- **Export CSV**: Click "Export CSV" for accounting records
- **View in Razorpay**: Click payment IDs to open in Razorpay dashboard

### Transaction Details

Each transaction shows:
- Date and time
- User name and email
- Amount (₹)
- Payment method
- Plan name
- Razorpay IDs (for Razorpay payments)
- Activation key (for key redemptions)

## Revenue Tracking Flow

```
Admin Creates Paid Key → Customer Pays → Admin Shares Key → 
Customer Redeems Key → System Records Revenue → 
Shows in Revenue Dashboard & User's Payment History
```

## Common Scenarios

### Scenario 1: Selling Activation Keys

**Customer wants to buy Contractor Plus (₹799)**

1. Customer pays ₹799 via bank transfer/UPI
2. Admin creates activation key:
   - Plan: Contractor Plus
   - Paid: **Yes**
   - Notes: "Sold to [Customer Name] - Paid via UPI"
3. Share key with customer
4. Customer redeems key
5. ✅ Revenue of ₹799 appears in dashboard

### Scenario 2: Promotional/Free Keys

**Giving free trial or promotional access**

1. Admin creates activation key:
   - Plan: Contractor Plus
   - Paid: **No** (or leave unchecked)
   - Notes: "Promotional key for [reason]"
2. Share key with user
3. User redeems key
4. ✅ No revenue recorded (amount: ₹0)

### Scenario 3: Bulk Key Sales

**Selling multiple keys to a reseller**

1. Create multiple paid keys (one per customer)
2. Mark each as "Paid"
3. Track in notes: "Reseller batch #1"
4. Revenue recorded as each key is redeemed
5. Monitor redemption in activation keys page

## Verification Checklist

### Before Sharing a Paid Key

- [ ] Customer has paid the full amount
- [ ] Key is marked as "Paid" in system
- [ ] Correct plan selected
- [ ] Notes added for tracking
- [ ] Key is active (toggle is green)

### After Key Redemption

- [ ] Revenue appears in platform revenue dashboard
- [ ] Amount matches plan price
- [ ] User's payment history shows the transaction
- [ ] Invoice can be generated for the transaction

## Troubleshooting

### Key shows ₹0 revenue even though marked as paid

**Check:**
1. Is the plan configured in subscription plans?
2. Does the plan have a price set?
3. Was the key actually marked as "Paid" when created?

**Fix:**
- Verify plan: Go to `/admin/plans` and check plan exists with correct price
- Check key: Go to `/admin/activation-keys` and verify "Paid" badge shows

### Revenue not appearing in dashboard

**Possible reasons:**
1. Key hasn't been redeemed yet (check "Used By" column)
2. Key was marked as "Not paid"
3. Transaction failed during redemption

**Fix:**
- Check if key is used: Look for user in "Used By" column
- Verify payment_orders collection in database
- Check user's payment history

### Customer can't redeem key

**Common issues:**
1. Key is inactive (toggle off)
2. Key has reached max uses
3. User already used this key
4. User has active subscription

**Fix:**
- Toggle key to active
- Check current_uses vs max_uses
- Verify user hasn't used this key before

## Best Practices

### Record Keeping

1. **Always add notes** when creating paid keys
   - Include customer name
   - Payment method (UPI/Bank Transfer/etc.)
   - Date of payment
   - Any special terms

2. **Export revenue reports regularly**
   - Monthly CSV exports for accounting
   - Reconcile with bank statements
   - Track payment method distribution

3. **Monitor key redemption**
   - Check which keys are unused
   - Follow up with customers who haven't redeemed
   - Deactivate keys if payment is refunded

### Security

1. **Never share keys publicly**
2. **One key per customer** for paid keys
3. **Deactivate keys immediately** if payment fails/refunded
4. **Regular audits** of revenue vs keys created

## Quick Reference

### Plan Prices (Default)

- **Contractor Plus**: ₹799/month
- **Contractor Pro**: ₹1,499/month
- **Enterprise**: Custom pricing

*Note: Verify current prices in `/admin/plans`*

### Key Status Indicators

- 🟢 **Active** - Key can be redeemed
- 🔴 **Inactive** - Key cannot be redeemed
- 🟡 **Exhausted** - All uses consumed
- 💰 **Paid** - Revenue will be recorded on redemption

### Revenue Dashboard Shortcuts

- **Filter Paid Keys**: Select "Activation Key (Paid)" from dropdown
- **View Razorpay**: Click payment ID to open in Razorpay dashboard
- **Quick Export**: Click "Export CSV" for instant download
- **Delete Record**: Use trash icon (careful - cannot be undone)

## Support

For technical issues or questions:
- Check documentation: `/docs/PLATFORM_REVENUE_TRACKING.md`
- Review database directly if needed
- Contact development team for system issues
