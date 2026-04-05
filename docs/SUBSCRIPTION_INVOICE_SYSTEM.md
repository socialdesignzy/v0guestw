# Subscription Invoice Generation System

## 📋 Overview

The subscription invoice system allows users to view and print professional invoices for all their subscription payments, including:
- **Razorpay Payments** - One-time and auto-renewal subscription payments
- **Activation Keys** - Both paid and complimentary activation keys

---

## ✅ Features Implemented

### **1. Invoice Generation for All Payment Types**

#### **Razorpay Payments**
- ✅ One-time subscription payments
- ✅ Auto-renewal subscription payments (marked as "Auto-Renewal")
- ✅ Shows Razorpay Payment ID
- ✅ Displays GST breakdown (18%)
- ✅ Professional invoice format

#### **Activation Key Payments**
- ✅ **Paid Keys** - Shows actual amount paid
- ✅ **Complimentary Keys** - Shows ₹0.00 with "Complimentary" badge
- ✅ Displays activation key code
- ✅ Admin can mark keys as paid/unpaid during creation

### **2. Invoice Details**

Each invoice includes:
- **Invoice Number** - Unique identifier (e.g., INV-A1B2C3D4)
- **Invoice Date** - Transaction date
- **Payment Status** - Paid or Complimentary
- **Customer Details** - Name, email, phone
- **Payment Method** - Razorpay, Razorpay Subscription, or Activation Key
- **Plan Details** - Plan name and duration
- **Amount Breakdown** - Base amount, GST (if applicable), total
- **Payment ID** - For Razorpay transactions

### **3. Professional Design**
- ✅ Company branding (GuestWorker logo)
- ✅ Watermark for authenticity
- ✅ Print-friendly layout
- ✅ Status badges (Paid/Complimentary)
- ✅ GST compliance (18% GST breakdown)

---

## 🔧 Backend Implementation

### **Database Changes**

#### **Activation Keys Collection**
```javascript
{
  "id": "key-123",
  "key": "ABCD-EFGH-IJKL-MNOP",
  "plan": "Contractor Plus",
  "duration_days": 30,
  "is_paid": true,  // NEW: Whether this key was sold
  "price": 799,     // NEW: Price if paid
  "max_uses": 1,
  "current_uses": 0,
  "is_active": true,
  "notes": "Sold to customer XYZ",
  "created_by": "admin-id",
  "created_at": "2026-03-16T00:00:00Z"
}
```

#### **Payment Orders Collection**
```javascript
{
  "id": "payment-123",
  "contractor_id": "user-123",
  "plan_name": "Contractor Plus",
  "amount": 799,
  "status": "paid",
  "payment_method": "activation_key",  // or "razorpay" or "razorpay_subscription"
  "activation_key": "ABCD-EFGH-IJKL-MNOP",
  "is_paid": true,  // NEW: For activation keys
  "duration_days": 30,
  "razorpay_payment_id": "pay_xxxxx",  // For Razorpay payments
  "is_renewal": false,  // For subscription renewals
  "created_at": "2026-03-16T00:00:00Z"
}
```

### **API Endpoints**

#### **Generate Invoice**
```http
GET /api/subscription/invoice/{transaction_id}
Authorization: Cookie (auth_token)

Response: HTML invoice (ready to print)
```

**Example:**
```
GET /api/subscription/invoice/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

Returns a fully formatted HTML invoice that can be:
- Viewed in browser
- Printed directly
- Saved as PDF (via browser print → Save as PDF)

---

## 🎨 Invoice Appearance

### **Paid Razorpay Payment Invoice**
```
┌─────────────────────────────────────────────┐
│           GuestWorker                       │
│                                             │
│      SUBSCRIPTION INVOICE                   │
│   Invoice Number: INV-A1B2C3D4             │
│   Date: 16-03-2026                         │
│   [Paid Badge]                             │
├─────────────────────────────────────────────┤
│ Billed To:              Payment Details:    │
│ John Doe                Method: Razorpay    │
│ john@example.com        Payment ID: pay_xxx │
│ +91 9876543210          Status: Paid        │
├─────────────────────────────────────────────┤
│ Description      Duration    Amount (₹)     │
│ Contractor Plus  30 days     ₹677.12        │
│ GST (18%)                    ₹121.88        │
│ Total Amount                 ₹799.00        │
├─────────────────────────────────────────────┤
│ Thank you for your subscription!            │
│ This is a computer-generated invoice        │
└─────────────────────────────────────────────┘
```

### **Complimentary Activation Key Invoice**
```
┌─────────────────────────────────────────────┐
│           GuestWorker                       │
│                                             │
│      SUBSCRIPTION INVOICE                   │
│   Invoice Number: INV-B2C3D4E5             │
│   Date: 16-03-2026                         │
│   [Complimentary Badge]                    │
├─────────────────────────────────────────────┤
│ Billed To:              Payment Details:    │
│ Jane Smith              Method: Activation  │
│ jane@example.com        Key (ABCD-EFGH...)  │
│                         Status: Complimentary│
├─────────────────────────────────────────────┤
│ Description      Duration    Amount (₹)     │
│ Contractor Pro   30 days     ₹0.00          │
│ Total Amount                 ₹0.00          │
├─────────────────────────────────────────────┤
│ Thank you for your subscription!            │
└─────────────────────────────────────────────┘
```

---

## 👨‍💼 Admin Panel - Activation Key Creation

### **Creating Paid Activation Keys**

When admin creates an activation key, they can now specify:

```javascript
{
  "plan": "Contractor Plus",
  "max_uses": 1,
  "duration_days": 30,
  "is_paid": true,      // ✅ NEW: Check this for paid keys
  "price": 799,         // ✅ NEW: Enter the price
  "notes": "Sold to ABC Corp"
}
```

### **Creating Complimentary Keys**

For free/promotional keys:

```javascript
{
  "plan": "Contractor Plus",
  "max_uses": 1,
  "duration_days": 30,
  "is_paid": false,     // ✅ Leave unchecked for free keys
  "price": 0,           // ✅ Price will be 0
  "notes": "Promotional key for partner"
}
```

### **Admin Panel UI Updates Needed**

The admin activation key creation form should include:

```jsx
<FormGroup>
  <Label>
    <Checkbox 
      checked={isPaid} 
      onChange={(e) => setIsPaid(e.target.checked)}
    />
    Paid Key (Check if this key was sold)
  </Label>
</FormGroup>

{isPaid && (
  <FormGroup>
    <Label>Price (₹)</Label>
    <Input 
      type="number" 
      value={price} 
      onChange={(e) => setPrice(e.target.value)}
      placeholder="Enter amount (e.g., 799)"
    />
  </FormGroup>
)}
```

---

## 💻 Frontend Integration

### **Transaction History Page**

Update `ManageSubscription.js` to show invoice download button:

```jsx
{transactions.map((transaction) => (
  <div key={transaction.id} className="transaction-item">
    <div className="transaction-details">
      <p>{transaction.description}</p>
      <p>₹{transaction.amount}</p>
      <p>{transaction.status}</p>
    </div>
    
    {/* Invoice Download Button */}
    <a 
      href={api.generateSubscriptionInvoice(transaction.id)}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-invoice"
    >
      📄 View Invoice
    </a>
  </div>
))}
```

### **Styling**

```css
.btn-invoice {
  display: inline-block;
  padding: 8px 16px;
  background: #4f46e5;
  color: white;
  border-radius: 5px;
  text-decoration: none;
  font-size: 14px;
  transition: background 0.3s;
}

.btn-invoice:hover {
  background: #4338ca;
}
```

---

## 🧪 Testing

### **Test Scenarios**

#### **1. Razorpay Payment Invoice**
```bash
# Steps:
1. User purchases subscription via Razorpay
2. Payment completes successfully
3. Go to Manage Subscription → Transaction History
4. Click "View Invoice" on the transaction
5. Verify:
   - Invoice shows correct amount
   - GST breakdown is correct (18%)
   - Razorpay Payment ID is displayed
   - Status shows "Paid"
   - Invoice is printable
```

#### **2. Paid Activation Key Invoice**
```bash
# Steps:
1. Admin creates activation key with is_paid=true, price=799
2. User redeems the key
3. Go to Transaction History
4. Click "View Invoice"
5. Verify:
   - Amount shows ₹799.00
   - Status shows "Paid"
   - Activation key code is displayed
   - GST breakdown is shown
```

#### **3. Complimentary Activation Key Invoice**
```bash
# Steps:
1. Admin creates activation key with is_paid=false
2. User redeems the key
3. Go to Transaction History
4. Click "View Invoice"
5. Verify:
   - Amount shows ₹0.00
   - Status shows "Complimentary" badge
   - No GST breakdown (since amount is 0)
   - Activation key code is displayed
```

#### **4. Auto-Renewal Invoice**
```bash
# Steps:
1. User subscribes with auto-renewal
2. Wait for monthly renewal (or simulate webhook)
3. Go to Transaction History
4. Click "View Invoice" on renewal payment
5. Verify:
   - Shows "Razorpay Subscription (Auto-Renewal)"
   - Amount is correct
   - is_renewal flag is true
```

---

## 📊 Database Queries

### **Find All Paid Activation Keys**
```javascript
db.activation_keys.find({ is_paid: true })
```

### **Find All Complimentary Keys**
```javascript
db.activation_keys.find({ is_paid: false })
```

### **Get User's Invoiceable Transactions**
```javascript
db.payment_orders.find({
  contractor_id: "user-123",
  status: "paid"
})
```

### **Revenue from Paid Activation Keys**
```javascript
db.activation_keys.aggregate([
  { $match: { is_paid: true, current_uses: { $gt: 0 } } },
  { $group: { _id: null, total: { $sum: "$price" } } }
])
```

---

## 🎯 Use Cases

### **Use Case 1: Corporate Bulk Purchase**
```
Scenario: Company buys 10 activation keys for ₹7,990

Admin Action:
1. Create 10 activation keys
2. Set is_paid = true
3. Set price = 799 for each
4. Distribute keys to company

User Action:
1. Redeem activation key
2. View invoice showing ₹799 paid
3. Use for accounting/reimbursement
```

### **Use Case 2: Promotional Campaign**
```
Scenario: Free 30-day trial keys for partners

Admin Action:
1. Create activation keys
2. Set is_paid = false
3. Set price = 0
4. Add note: "Partner promotion"

User Action:
1. Redeem key
2. View invoice showing ₹0.00 (Complimentary)
3. Access full features for 30 days
```

### **Use Case 3: Monthly Subscription**
```
Scenario: User on auto-renewal plan

Month 1:
- User pays ₹799 via Razorpay
- Invoice generated with Payment ID

Month 2:
- Auto-renewal charges ₹799
- New invoice generated (marked as renewal)
- User can download both invoices
```

---

## 🔍 Troubleshooting

### **Issue: Invoice not showing**

**Check:**
1. Transaction exists in `payment_orders` collection
2. Transaction belongs to current user
3. Transaction ID is correct

**Debug:**
```javascript
db.payment_orders.findOne({ id: "transaction-id" })
```

### **Issue: Amount showing as 0 for paid key**

**Check:**
1. Activation key has `is_paid: true`
2. Activation key has `price` field set
3. Transaction record copied `is_paid` and `price` from key

**Fix:**
```javascript
// Update activation key
db.activation_keys.updateOne(
  { key: "ABCD-EFGH-IJKL-MNOP" },
  { $set: { is_paid: true, price: 799 } }
)

// Update transaction record
db.payment_orders.updateOne(
  { activation_key: "ABCD-EFGH-IJKL-MNOP" },
  { $set: { is_paid: true, amount: 799 } }
)
```

### **Issue: GST calculation incorrect**

**Formula:**
```
Base Amount = Total Amount / 1.18
GST Amount = Total Amount - Base Amount

Example:
Total = ₹799
Base = 799 / 1.18 = ₹677.12
GST = 799 - 677.12 = ₹121.88
```

---

## 📝 API Response Examples

### **Razorpay Payment Transaction**
```json
{
  "id": "txn-123",
  "contractor_id": "user-123",
  "plan_name": "Contractor Plus",
  "amount": 799,
  "status": "paid",
  "payment_method": "razorpay",
  "razorpay_payment_id": "pay_xxxxxxxxxxxxx",
  "duration_days": 30,
  "created_at": "2026-03-16T10:30:00Z"
}
```

### **Paid Activation Key Transaction**
```json
{
  "id": "txn-456",
  "contractor_id": "user-456",
  "plan_name": "Contractor Pro",
  "amount": 1299,
  "status": "success",
  "payment_method": "activation_key",
  "activation_key": "ABCD-EFGH-IJKL-MNOP",
  "is_paid": true,
  "duration_days": 30,
  "created_at": "2026-03-16T11:00:00Z"
}
```

### **Complimentary Key Transaction**
```json
{
  "id": "txn-789",
  "contractor_id": "user-789",
  "plan_name": "Contractor Plus",
  "amount": 0,
  "status": "success",
  "payment_method": "activation_key",
  "activation_key": "WXYZ-1234-5678-9012",
  "is_paid": false,
  "duration_days": 30,
  "created_at": "2026-03-16T12:00:00Z"
}
```

---

## ✅ Deployment Checklist

- [ ] Backend changes deployed
- [ ] Database migration for existing activation keys (set is_paid and price)
- [ ] Admin panel updated with is_paid checkbox
- [ ] Frontend transaction history updated with invoice button
- [ ] Test invoice generation for all payment types
- [ ] Verify GST calculations
- [ ] Test print functionality
- [ ] Update user documentation

---

## 🎉 Benefits

### **For Users**
- ✅ Professional invoices for accounting
- ✅ Easy to download and print
- ✅ Clear payment breakdown with GST
- ✅ Proof of payment for reimbursement

### **For Business**
- ✅ Transparent billing
- ✅ GST compliance
- ✅ Professional image
- ✅ Reduced support queries about invoices

### **For Admins**
- ✅ Track paid vs complimentary keys
- ✅ Revenue reporting
- ✅ Audit trail for all transactions

---

## 📞 Support

For invoice-related queries:
- Email: support@guestworker.app
- Invoice format: HTML (printable, can save as PDF)
- GST Rate: 18% (as per Indian tax laws)

---

**Implementation Complete! 🚀**

Users can now view and print professional invoices for all subscription payments, whether paid via Razorpay or activated with keys (paid or complimentary).
