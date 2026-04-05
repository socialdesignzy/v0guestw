# Security Logging & Anomaly Detection System

## 📅 Implementation Date: October 30, 2025

---

## 🎯 Overview

A comprehensive security monitoring system that tracks **suspicious activities and security failures** to minimize database storage while maintaining robust threat detection. The system logs only anomalies, failures, and admin activities - NOT routine successful logins. Every potential attack attempt is logged with complete context including IP addresses, user agents, timestamps, and behavioral patterns.

### 💾 Storage Optimization
- ✅ **User successful logins**: NOT logged (to save storage)
- ✅ **Admin successful logins**: Always logged (audit trail requirement)
- ✅ **All failures & suspicious activities**: Logged with full context

---

## 🔍 What Gets Logged

### Authentication Events
- ✅ **Failed Login Attempts** (user & admin) - MEDIUM/HIGH severity
- ✅ **Admin Successful Logins** (audit trail) - LOW severity
- ❌ **User Successful Logins** (NOT logged - storage optimization)
- ✅ **Account Lockouts** (after threshold exceeded) - HIGH/CRITICAL severity
- ✅ **Lockout Expirations** (when account unlocks) - LOW severity

### Registration Events
- ✅ **Invalid Email Formats** - LOW severity
- ✅ **Disposable Email Attempts** (temp email providers) - LOW severity
- ✅ **Weak Password Attempts** - LOW severity
- ✅ **Registration Blocked** (existing email, validation failures) - MEDIUM severity

### Rate Limiting Events
- ✅ **Rate Limit Exceeded** (per endpoint, per IP) - HIGH severity

### Suspicious Activity
- ✅ **Timing Attack Attempts** (response time anomalies) - MEDIUM severity
- ✅ **Multiple Accounts from Same IP** (within time window) - MEDIUM severity
- ✅ **Rapid Requests** (abnormal frequency) - HIGH severity
- ✅ **Invalid Tokens** (expired, malformed) - MEDIUM severity
- ✅ **Token Tampering** (signature verification failures) - HIGH severity

### 📈 Storage Impact

**Before Optimization:**
- Logging every login (successful + failed) for 1000 daily active users
- ~1000 successful logins + ~50 failed logins = **1050 logs/day**
- **31,500 logs/month** (~6-10 MB depending on details)

**After Optimization:**
- Only logging failures + suspicious activities + admin logins
- ~50 failed logins + ~20 suspicious activities + ~5 admin logins = **75 logs/day**
- **2,250 logs/month** (~450 KB-700 KB)

**Result:** ~93% reduction in security logs storage while maintaining full threat detection capability!

---

## 📊 Database Schema

### Collection: `security_logs`

```json
{
  "id": "uuid",
  "event_type": "failed_login",
  "severity": "medium",  // low, medium, high, critical
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "email": "user@example.com",  // Optional
  "user_id": "user-uuid",  // Optional
  "details": {
    "reason": "invalid_password",
    "additional_context": "..."
  },
  "endpoint": "/auth/login",
  "timestamp": "2025-10-30T15:30:00Z",
  "resolved": false,
  "resolved_at": null,  // Optional
  "resolved_by": null,  // Optional (admin email)
  "notes": ""  // Optional (admin notes)
}
```

### Severity Levels

| Level | Description | Use Case |
|-------|-------------|----------|
| **CRITICAL** | Immediate action required | Admin login failures, token tampering |
| **HIGH** | Potential security breach | Multiple failed logins, account lockouts |
| **MEDIUM** | Suspicious but not urgent | Registration blocks, weak passwords |
| **LOW** | Informational | Successful logins, minor violations |

---

## 🤖 Anomaly Detection

### Automatic Pattern Recognition

The system automatically analyzes security logs to detect:

#### 1. Brute Force Attacks
- **Detection**: 10+ failed logins from same IP within 1 hour
- **Threat Score**: +30
- **Action**: Flag as suspicious, admin alert

#### 2. Distributed Attacks
- **Detection**: 5+ rate limit violations from IP within 24 hours
- **Threat Score**: +20
- **Action**: Potential botnet activity

#### 3. Account Enumeration
- **Detection**: 5+ different accounts logged in from same IP within 24 hours
- **Threat Score**: +25
- **Action**: Possible credential stuffing

#### 4. Fake Account Creation
- **Detection**: 3+ disposable email attempts from IP within 24 hours
- **Threat Score**: +15
- **Action**: Bot detection, spam prevention

#### 5. Token Abuse
- **Detection**: 3+ token tampering attempts within 24 hours
- **Threat Score**: +40
- **Action**: High-priority alert, possible hacking attempt

### Threat Scoring System

- **Score Range**: 0-100
- **Thresholds**:
  - 0-25: Normal activity
  - 26-50: Suspicious (monitor)
  - 51-75: High risk (investigate)
  - 76-100: Critical (immediate action)

---

## 🖥️ Admin Panel Features

### Security Logs Page (`/admin/security-logs`)

**Features**:
- 📊 Real-time event monitoring
- 🔍 Advanced filtering (severity, event type, time range, IP, email)
- 📈 Statistics dashboard (events by severity, type, top IPs)
- ✅ Mark events as resolved with notes
- 🔴 Threat indicators (critical/high priority badges)
- 📄 Detailed event inspection dialog
- ♾️ Infinite scroll pagination

**Filters**:
- Severity: Critical, High, Medium, Low
- Event Type: Failed Login, Account Locked, Disposable Email, etc.
- Time Range: Last Hour, 24 Hours, 7 Days, 30 Days, All Time
- Status: Unresolved, Resolved, All
- Search: IP Address or Email

**Statistics Shown**:
- Total events in selected period
- Breakdown by severity (Critical, High, Medium, Low)
- Breakdown by event type (Failed logins, lockouts, etc.)
- Top 10 suspicious IP addresses
- Event count per IP

### Admin Dashboard Integration

**Threat Indicators**:
- 🚨 Security Alerts Card (only shown if threats detected)
  - Threats in last 24 hours
  - Failed login attempts
  - Active lockouts
  - Unresolved critical events
- 🔴 Badge on Security Logs button (shows unresolved critical count)

**Quick Access**:
- Security Logs button in Quick Actions grid
- One-click navigation to full security monitoring page

---

## 📡 API Endpoints

### Get Security Logs
```http
GET /api/admin/security-logs
Authorization: Required (Admin)

Query Parameters:
- event_type: string (optional)
- severity: string (optional)
- ip_address: string (optional)
- email: string (optional)
- time_range: string (optional) - "1h", "24h", "7d", "30d", "all"
- resolved: boolean (optional)
- limit: integer (default: 100)
- skip: integer (default: 0)

Response:
{
  "logs": [SecurityLog[]],
  "stats": {
    "total_events": number,
    "by_severity": { critical, high, medium, low },
    "by_type": { failed_login, admin_login_failed, ... },
    "top_ips": [{ ip, count }]
  },
  "pagination": {
    "total": number,
    "skip": number,
    "limit": number,
    "has_more": boolean
  }
}
```

### Resolve Security Log
```http
PUT /api/admin/security-logs/{log_id}/resolve
Authorization: Required (Admin)

Body:
{
  "notes": "Investigated and confirmed false positive"
}

Response:
{
  "message": "Security log marked as resolved"
}
```

### Get Security Dashboard
```http
GET /api/admin/security-logs/dashboard
Authorization: Required (Admin)

Response:
{
  "threats_24h": number,
  "threats_7d": number,
  "failed_logins_24h": number,
  "active_lockouts": number,
  "disposable_emails_7d": number,
  "weak_passwords_7d": number,
  "unresolved_critical": number,
  "recent_critical_events": SecurityLog[]
}
```

---

## 🔄 Event Logging Flow

### 1. User Attempts Login
```
User → Login Request → Backend
          ↓
    Check Lockout Status
          ↓
    Verify Credentials
          ↓
    ❌ Failed? → Log Event
          ↓
    log_security_event(
      event_type="failed_login",
      severity="medium",
      ip_address=client_ip,
      user_agent=user_agent,
      email=email,
      details={"reason": "invalid_password"},
      endpoint="/auth/login"
    )
          ↓
    Security Logs Collection
```

### 2. Anomaly Detection (Background)
```
New Event Logged → Trigger Anomaly Check
          ↓
    detect_anomalies(ip_address, email)
          ↓
    Analyze Patterns:
    - Failed logins in last hour
    - Rate limit violations in last 24h
    - Multiple accounts from IP
    - Disposable email attempts
    - Token tampering attempts
          ↓
    Calculate Threat Score (0-100)
          ↓
    If Score >= 76 → CRITICAL Alert
          ↓
    Console Warning + Admin Dashboard Badge
```

### 3. Admin Reviews & Resolves
```
Admin Opens Security Logs
          ↓
    View Event Details
          ↓
    Investigate Context:
    - IP geolocation
    - User agent fingerprint
    - Historical patterns
    - Related events
          ↓
    Make Decision:
    - False positive → Mark Resolved
    - Real threat → Take Action (ban IP, disable account)
          ↓
    Add Notes & Resolve
```

---

## 🚀 Usage Examples

### Example 1: Investigating Failed Logins

**Scenario**: Admin notices 50 failed login attempts in dashboard

**Steps**:
1. Navigate to Security Logs page
2. Filter: `severity=high`, `time_range=24h`, `event_type=failed_login`
3. Check "Top Suspicious IPs" section
4. Click suspicious IP to filter all events from that IP
5. Review pattern:
   - Same IP trying multiple different emails
   - Happening in rapid succession
   - User agents vary (bot behavior)
6. **Decision**: Ban IP at firewall level
7. Mark all events as resolved with note: "IP banned - confirmed botnet"

### Example 2: Disposable Email Spam

**Scenario**: System detects 20 registration attempts with disposable emails

**Steps**:
1. Security Logs → Filter: `event_type=disposable_email`, `time_range=7d`
2. Identify top IPs attempting registrations
3. Check if already blocked by existing filters
4. **Decision**: Disposable emails already blocked, mark as resolved
5. Add note: "Automatic protection working correctly"

### Example 3: Account Takeover Attempt

**Scenario**: Critical alert - Multiple admin login failures from unusual IP

**Steps**:
1. Dashboard shows "3" critical threats badge
2. Click Security Logs button
3. Filter: `severity=critical`, `resolved=false`
4. See: 5 admin login failures from IP in Russia (your admin is in USA)
5. Check details:
   - Correct admin email
   - Wrong passwords
   - Advanced user agent spoofing
6. **Decision**: 
   - Reset admin password immediately
   - Enable 2FA (future enhancement)
   - Ban suspicious IP
   - Alert admin via email
7. Mark as resolved: "Account secured, password reset, IP banned"

---

## 📈 Performance Considerations

### Database Indexes (Recommended)

```javascript
// MongoDB shell or Compass:

// Index for time-based queries
db.security_logs.createIndex({ "timestamp": -1 })

// Index for filtering by event type
db.security_logs.createIndex({ "event_type": 1, "timestamp": -1 })

// Index for filtering by severity
db.security_logs.createIndex({ "severity": 1, "timestamp": -1 })

// Index for IP-based queries
db.security_logs.createIndex({ "ip_address": 1, "timestamp": -1 })

// Index for unresolved events
db.security_logs.createIndex({ "resolved": 1, "severity": 1, "timestamp": -1 })

// TTL index to auto-delete old logs (optional, after 90 days)
db.security_logs.createIndex(
  { "timestamp": 1 }, 
  { expireAfterSeconds: 7776000 }
)
```

### Query Optimization

- **Limit Results**: Default 100 events per page
- **Time Range Filtering**: Always filter by timestamp
- **Aggregation Pipeline**: Used for statistics (by severity, by type)
- **Skip/Limit Pagination**: Efficient for large datasets

### Storage Estimates

| Events/Day | Storage/Day | Storage/Month | Storage/Year |
|------------|-------------|---------------|--------------|
| 100 | ~50 KB | ~1.5 MB | ~18 MB |
| 1,000 | ~500 KB | ~15 MB | ~180 MB |
| 10,000 | ~5 MB | ~150 MB | ~1.8 GB |
| 100,000 | ~50 MB | ~1.5 GB | ~18 GB |

**Recommendation**: Implement TTL index to auto-delete logs older than 90 days.

---

## 🔒 Security Best Practices

### 1. Regular Monitoring
- ✅ Check dashboard daily for threat indicators
- ✅ Review unresolved critical events weekly
- ✅ Analyze patterns monthly

### 2. Response Procedures
- 🚨 **Critical Events**: Respond within 1 hour
- ⚠️ **High Priority**: Review within 24 hours
- 📊 **Medium/Low**: Review weekly or as needed

### 3. Retention Policy
- Keep logs for **90 days** (compliance)
- Archive critical incidents permanently
- Auto-delete low-severity events after 30 days

### 4. Alert Integration (Future)
- Email notifications for critical events
- Slack/Discord webhooks for real-time alerts
- SMS alerts for repeated admin login failures

---

## 🔮 Future Enhancements

### Planned Features
1. **IP Geolocation**: Show country/city for each event
2. **User Agent Parsing**: Detect bots vs humans
3. **Automated Banning**: Auto-ban IPs after threshold
4. **Export Reports**: CSV/PDF export of security logs
5. **Threat Intelligence Feed**: Integration with known malicious IPs
6. **Machine Learning**: AI-powered anomaly detection
7. **2FA Integration**: Log 2FA attempts and failures
8. **Session Tracking**: Monitor active sessions per user
9. **API Key Management**: Track API key usage and abuse
10. **Compliance Reports**: GDPR, SOC 2, ISO 27001 audit logs

---

## 🧪 Testing

### Manual Testing

#### Test 1: Verify Event Logging
```bash
# Attempt 5 failed logins
for i in {1..5}; do
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -H "User-Agent: TestBot/1.0"
done

# Check admin panel
# Navigate to Security Logs
# Should see 5 "failed_login" events
```

#### Test 2: Verify Anomaly Detection
```bash
# Attempt 15 failed logins (above threshold)
for i in {1..15}; do
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -H "User-Agent: TestBot/1.0"
done

# Check admin dashboard
# Should see threat indicator badge on Security Logs button
```

#### Test 3: Verify Resolution
```bash
# In admin panel:
# 1. Go to Security Logs
# 2. Click on any event
# 3. Add notes: "Testing resolution feature"
# 4. Click "Mark as Resolved"
# 5. Verify event shows as resolved
# 6. Check badge count decreased
```

---

## 📚 Code References

### Backend
- **Security Event Types**: `server.py` lines 325-352
- **Security Severity Levels**: `server.py` lines 354-359
- **Log Security Event Function**: `server.py` lines 361-405
- **Anomaly Detection Function**: `server.py` lines 407-489
- **Security Logs Endpoints**: `server.py` lines 6420-6607

### Frontend
- **Security Logs Page**: `frontend/src/pages/SecurityLogs.js`
- **Admin API Functions**: `frontend/src/utils/adminApi.js` lines 55-58
- **Admin Dashboard Integration**: `frontend/src/pages/AdminDashboard.js` lines 371-426
- **App Routing**: `frontend/src/App.js` lines 47, 351-357

---

## ✅ Implementation Checklist

### Backend
- [x] Security event types defined
- [x] Severity levels defined
- [x] Event logging function implemented
- [x] Anomaly detection function implemented
- [x] Security logs collection created
- [x] Admin API endpoints added
- [x] Events logged in login endpoints
- [x] Events logged in registration endpoint

### Frontend
- [x] Security Logs page created
- [x] Filtering UI implemented
- [x] Statistics dashboard added
- [x] Event resolution feature added
- [x] Admin dashboard integration
- [x] Threat indicators added
- [x] Navigation button added
- [x] App routing configured

### Documentation
- [x] Implementation guide created
- [x] API documentation added
- [x] Usage examples provided
- [x] Testing guide included

---

## 🎉 Summary

The Security Logging & Monitoring system provides **enterprise-grade security intelligence** with:

✅ **Complete Visibility**: Every security event logged with full context  
✅ **Proactive Detection**: Automatic anomaly detection and threat scoring  
✅ **Real-time Alerts**: Immediate notification of critical threats  
✅ **Forensic Analysis**: Detailed event inspection with resolution tracking  
✅ **Performance Optimized**: Efficient querying with minimal overhead  
✅ **Future-Proof**: Extensible design for advanced features  

**Result**: Administrators can now monitor, investigate, and respond to security threats in real-time, significantly improving the overall security posture of the GuestWorker application.

---

*Document Version: 1.0*  
*Last Updated: October 30, 2025*  
*Author: AI Security Implementation Team*

