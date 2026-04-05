# Plan Limits Implementation - Complete Guide

## 📋 Overview

The subscription system now includes **plan-based limits** on workers and employers. Users are restricted based on their subscription plan.

## 🎯 New Plans

### 1. Contractor Plus
- **Workers:** Maximum 50
- **Employers:** Maximum 25
- **Trial:** 14-day free trial for all new users
- **Default Price:** ₹799/month

### 2. Contractor Pro
- **Workers:** Maximum 250
- **Employers:** Maximum 100
- **Default Price:** ₹1,499/month

### 3. Enterprise / Estate
- **Workers:** Unlimited
- **Employers:** Unlimited
- **Default Price:** ₹2,999/month

---

## 🗄️ Database Schema Updates

### Subscription Plans Collection

Plans now include `max_workers` and `max_employers` fields:

```javascript
{
  "id": "uuid",
  "name": "Contractor Plus",
  "price": 799,
  "duration_days": 30,
  "max_workers": 50,        // null = unlimited
  "max_employers": 25,      // null = unlimited
  "features": [...],
  "description": "...",
  "is_active": true,
  "created_at": "...",
  "updated_at": "..."
}
```

**Important:** 
- `null` or `undefined` for `max_workers`/`max_employers` means **unlimited**
- Limits are enforced at creation time (when adding workers/employers)

---

## 🔧 Backend Implementation

### 1. Helper Functions

#### `get_plan_limits(plan_name: str) -> dict`
```python
# Location: backend/server.py:1009
async def get_plan_limits(plan_name: str) -> dict:
    """
    Returns:
        {"max_workers": int or None, "max_employers": int or None}
    """
```
- Looks up plan in `subscription_plans` collection
- Falls back to hardcoded limits if plan not found (backward compatibility)

#### `check_worker_limit(current_user: User) -> None`
```python
# Location: backend/server.py:1043
async def check_worker_limit(current_user: User) -> None:
    """
    Checks if user can add more workers.
    Raises HTTPException(403) if limit reached.
    """
```
- Counts current workers
- Compares against plan limit
- Admins bypass all checks

#### `check_employer_limit(current_user: User) -> None`
```python
# Location: backend/server.py:1067
async def check_employer_limit(current_user: User) -> None:
    """
    Checks if user can add more employers.
    Raises HTTPException(403) if limit reached.
    """
```

### 2. Endpoint Updates

#### Worker Creation
```python
# Location: backend/server.py:1370
@api_router.post("/workers")
async def create_worker(...):
    await check_worker_limit(current_user)  # ✅ Added
    # ... rest of creation logic
```

#### Employer Creation
```python
# Location: backend/server.py:1498
@api_router.post("/employers")
async def create_employer(...):
    await check_employer_limit(current_user)  # ✅ Added
    # ... rest of creation logic
```

### 3. New API Endpoints

#### Get Subscription Limits
```http
GET /api/subscription/limits
```

**Response:**
```json
{
  "plan_name": "Contractor Plus",
  "current_workers": 45,
  "current_employers": 20,
  "max_workers": 50,
  "max_employers": 25,
  "worker_limit_reached": false,
  "employer_limit_reached": false
}
```

### 4. Trial Activation Update

Trial now activates **Contractor Plus** plan (not "Contractor Pro Trial"):
```python
# Location: backend/server.py:632
trial_plan = "Contractor Plus"  # ✅ Changed from "Contractor Pro Trial"
```

---

## 🚀 Setup Instructions

### Step 1: Seed Plans

Run the seed script to create the three plans:

```bash
cd /Users/anoopsunny/Documents/GuestWorker
python3 seed_plans.py
```

**Output:**
- ✅ Creates Contractor Plus (50 workers, 25 employers)
- ✅ Creates Contractor Pro (250 workers, 100 employers)
- ✅ Creates Enterprise (unlimited)
- ⚠️  Skips if plans already exist

### Step 2: Restart Backend

The backend code changes are already in place. Just restart:

```bash
cd backend
source venv/bin/activate
python server.py  # or uvicorn server:app --reload
```

### Step 3: Verify

1. **Check plans in database:**
   ```javascript
   // MongoDB shell or Compass
   db.subscription_plans.find({}, {name: 1, max_workers: 1, max_employers: 1})
   ```

2. **Test worker limit:**
   - Create a user with Contractor Plus
   - Try to add 51st worker → Should fail with error

3. **Test limits API:**
   ```bash
   curl -X GET http://localhost:8000/api/subscription/limits \
     -H "Cookie: auth_token=YOUR_TOKEN"
   ```

---

## 📊 Error Messages

### Worker Limit Reached
```
HTTP 403
"Worker limit reached. Your plan (Contractor Plus) allows maximum 50 workers. Please upgrade to add more."
```

### Employer Limit Reached
```
HTTP 403
"Employer limit reached. Your plan (Contractor Plus) allows maximum 25 employers. Please upgrade to add more."
```

---

## 🔄 Migration Notes

### Existing Users

**No migration needed!** The system handles backward compatibility:

1. **Users with old plans:**
   - `get_plan_limits()` falls back to hardcoded defaults
   - Unknown plans → Unlimited (for safety)

2. **Users without limits in database:**
   - System checks plan name and applies limits
   - Admin users always have unlimited access

### Updating Existing Plans

If you have existing plans in the database, update them:

```javascript
// MongoDB shell
db.subscription_plans.updateMany(
  { name: "Contractor Plus" },
  { 
    $set: { 
      max_workers: 50,
      max_employers: 25
    }
  }
)
```

---

## 🎨 Frontend Integration (Optional)

### Display Limits in UI

You can show current usage in the Dashboard or Workers/Employers pages:

```javascript
import { api } from '../utils/api';

const [limits, setLimits] = useState(null);

useEffect(() => {
  const fetchLimits = async () => {
    try {
      const response = await api.getSubscriptionLimits();
      setLimits(response.data);
    } catch (error) {
      console.error('Failed to fetch limits', error);
    }
  };
  
  if (user) {
    fetchLimits();
  }
}, [user]);

// Display usage
{limits && (
  <div>
    <p>Workers: {limits.current_workers} / {limits.max_workers || '∞'}</p>
    <p>Employers: {limits.current_employers} / {limits.max_employers || '∞'}</p>
  </div>
)}
```

### Show Warning Before Limit

```javascript
// In Workers.js before showing Add Worker button
{limits && limits.worker_limit_reached && (
  <Alert variant="warning">
    Worker limit reached. Please upgrade to add more workers.
  </Alert>
)}
```

---

## ✅ Testing Checklist

- [ ] Run seed script to create plans
- [ ] Verify plans appear in Admin Panel > Plan Management
- [ ] Create test user with Contractor Plus
- [ ] Try to add 51st worker → Should fail
- [ ] Try to add 26th employer → Should fail
- [ ] Activate trial → Should get Contractor Plus
- [ ] Check `/api/subscription/limits` endpoint
- [ ] Verify admin users have unlimited access
- [ ] Test Enterprise plan (should have unlimited)

---

## 🔍 Troubleshooting

### Plans not showing on pricing page?
- Check `is_active: true` in database
- Verify plans were created successfully

### Limits not enforced?
- Check plan name matches exactly (case-sensitive)
- Verify `max_workers`/`max_employers` are set (not missing)
- Check user's `subscription_plan` field matches plan name

### Trial not activating Contractor Plus?
- Check `activate_trial()` function updated
- Verify trial settings in database

---

## 📝 Summary of Changes

### Backend Files Modified
- ✅ `backend/server.py`:
  - Added `get_plan_limits()` helper
  - Added `check_worker_limit()` helper
  - Added `check_employer_limit()` helper
  - Updated `create_worker()` to check limits
  - Updated `create_employer()` to check limits
  - Updated `activate_trial()` to use Contractor Plus
  - Updated plan creation/update endpoints to accept limits
  - Added `/api/subscription/limits` endpoint

### New Files Created
- ✅ `seed_plans.py` - Seed script for 3 plans

### Frontend Files Modified
- ✅ `frontend/src/utils/api.js` - Added `getSubscriptionLimits()` method

---

## 🎯 Next Steps (Optional Enhancements)

1. **Frontend UI:**
   - Show usage bars on Dashboard
   - Display limit warnings
   - Upgrade prompts when limit reached

2. **Admin Features:**
   - View user usage statistics
   - See which users are near limits
   - Bulk upgrade recommendations

3. **Notifications:**
   - Alert users at 80% of limit
   - Email when limit reached

---

**Implementation Date:** January 2025  
**Status:** ✅ Complete and Ready for Testing

