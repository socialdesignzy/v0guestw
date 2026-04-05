# GuestWorker API Reference

Complete API endpoint documentation for the GuestWorker Next.js application.

## Base URL
All API requests should be made to the base URL of your deployed application.

## Authentication
Most endpoints require authentication via JWT token stored in httpOnly cookies. Include credentials in requests.

---

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "userType": "contractor" | "admin"
}
```

**Response:** `{ user: User, token: string }`

### POST /api/auth/login
Login to existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:** `{ user: User, token: string }`

### POST /api/auth/logout
Logout current session.

**Response:** `{ success: true }`

### GET /api/auth/session
Get current authenticated user session.

**Response:** `{ user: User }`

---

## User Endpoints

### GET /api/users/profile
Get current user profile.

**Response:** `{ user: User }`

### PUT /api/users/profile
Update user profile.

**Request Body:** Partial User object

**Response:** `{ user: User }`

### POST /api/users/settings
Save user settings.

**Request Body:**
```json
{
  "companyName": "Company Name",
  "phone": "+91XXXXXXXXXX",
  "address": "Address",
  "emailNotifications": true,
  "smsNotifications": false,
  "theme": "light"
}
```

**Response:** `{ success: true, settings: Object }`

### GET /api/users/settings
Get user settings.

**Response:** `{ settings: Object }`

---

## Worker Endpoints

### GET /api/workers
List all workers.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

**Response:** `{ workers: Worker[], total: number }`

### POST /api/workers
Create new worker.

**Request Body:**
```json
{
  "name": "Worker Name",
  "phone": "+91XXXXXXXXXX",
  "address": "Address",
  "position": "Laborer",
  "salary": 500
}
```

**Response:** `{ worker: Worker }`

### GET /api/workers/[id]
Get worker details.

**Response:** `{ worker: Worker }`

### PUT /api/workers/[id]
Update worker.

**Response:** `{ worker: Worker }`

### DELETE /api/workers/[id]
Delete worker.

**Response:** `{ success: true }`

---

## Attendance Endpoints

### GET /api/attendance
Get attendance records.

**Query Parameters:**
- `workerId`: Filter by worker
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `page`: Page number

**Response:** `{ attendance: Attendance[], total: number }`

### POST /api/attendance
Log attendance.

**Request Body:**
```json
{
  "workerId": "id",
  "status": "present" | "absent" | "leave",
  "timestamp": "2024-01-01T09:00:00Z"
}
```

**Response:** `{ attendance: Attendance }`

### PUT /api/attendance/[id]
Update attendance record.

**Response:** `{ attendance: Attendance }`

---

## Payment Endpoints

### GET /api/payments
Get payment history.

**Query Parameters:**
- `workerId`: Filter by worker
- `status`: Filter by status
- `page`: Page number

**Response:** `{ payments: Payment[], total: number }`

### POST /api/payments
Create payment.

**Request Body:**
```json
{
  "workerId": "id",
  "amount": 5000,
  "type": "salary" | "advance" | "bonus",
  "razorpayOrderId": "order_id"
}
```

**Response:** `{ payment: Payment }`

### PUT /api/payments/[id]
Update payment status.

**Request Body:**
```json
{
  "status": "pending" | "completed" | "failed"
}
```

**Response:** `{ payment: Payment }`

---

## Advance Endpoints

### GET /api/advances
Get advance requests.

**Response:** `{ advances: Advance[] }`

### POST /api/advances
Request advance.

**Request Body:**
```json
{
  "workerId": "id",
  "amount": 2000,
  "reason": "Personal emergency"
}
```

**Response:** `{ advance: Advance }`

### PUT /api/advances/[id]
Update advance status.

**Response:** `{ advance: Advance }`

---

## Commission Endpoints

### GET /api/commissions
Get commission records.

**Query Parameters:**
- `status`: Filter by status
- `page`: Page number

**Response:** `{ commissions: Commission[] }`

### POST /api/commissions
Create commission.

**Request Body:**
```json
{
  "workerId": "id",
  "amount": 500,
  "rate": 5,
  "period": "2024-01"
}
```

**Response:** `{ commission: Commission }`

### PUT /api/commissions/[id]
Update commission.

**Response:** `{ commission: Commission }`

---

## Charge Endpoints

### GET /api/charges
Get charges.

**Response:** `{ charges: Charge[] }`

### POST /api/charges
Create charge.

**Request Body:**
```json
{
  "workerId": "id",
  "amount": 500,
  "reason": "Damage to equipment",
  "date": "2024-01-01"
}
```

**Response:** `{ charge: Charge }`

---

## Room Endpoints

### GET /api/rooms
Get rooms.

**Response:** `{ rooms: Room[] }`

### POST /api/rooms
Create room.

**Request Body:**
```json
{
  "roomNumber": "101",
  "capacity": 4,
  "rentPerMonth": 2000
}
```

**Response:** `{ room: Room }`

### PUT /api/rooms/[id]
Update room.

**Response:** `{ room: Room }`

---

## Booking Endpoints

### GET /api/bookings
Get room bookings.

**Response:** `{ bookings: Booking[] }`

### POST /api/bookings
Create booking.

**Request Body:**
```json
{
  "workerId": "id",
  "roomId": "id",
  "checkInDate": "2024-01-01",
  "checkOutDate": "2024-02-01"
}
```

**Response:** `{ booking: Booking }`

### PUT /api/bookings/[id]
Update booking.

**Response:** `{ booking: Booking }`

---

## Subscription Endpoints

### GET /api/subscriptions
Get subscription plans.

**Response:** `{ plans: SubscriptionPlan[] }`

### POST /api/subscriptions
Create subscription.

**Request Body:**
```json
{
  "planId": "id",
  "paymentMethod": "razorpay"
}
```

**Response:** `{ subscription: Subscription }`

### GET /api/subscriptions/current
Get current subscription.

**Response:** `{ subscription: Subscription }`

---

## Employer Endpoints

### GET /api/employers
Get employers.

**Response:** `{ employers: Employer[] }`

### POST /api/employers
Create employer.

**Request Body:**
```json
{
  "name": "Employer Name",
  "phone": "+91XXXXXXXXXX",
  "address": "Address"
}
```

**Response:** `{ employer: Employer }`

---

## Notification Endpoints

### GET /api/notifications
Get notifications.

**Response:** `{ notifications: Notification[] }`

### POST /api/notifications
Create notification.

**Request Body:**
```json
{
  "title": "Notification Title",
  "message": "Notification message",
  "type": "info" | "warning" | "error"
}
```

**Response:** `{ notification: Notification }`

### PUT /api/notifications/[id]
Update notification (mark as read).

**Request Body:**
```json
{
  "read": true
}
```

**Response:** `{ notification: Notification }`

### DELETE /api/notifications/[id]
Delete notification.

**Response:** `{ success: true }`

---

## Admin Endpoints

### GET /api/admin/users
List all users (admin only).

**Response:** `{ users: User[], total: number }`

### POST /api/admin/users/[id]/block
Block user (admin only).

**Response:** `{ success: true }`

### GET /api/admin/stats
Get admin statistics.

**Response:**
```json
{
  "totalUsers": 100,
  "totalWorkers": 500,
  "totalEmployers": 50,
  "activeSubscriptions": 30,
  "totalRevenue": 50000,
  "monthlyRevenue": 5000
}
```

### GET /api/admin/settings
Get system settings (admin only).

**Response:** `{ settings: Object }`

### POST /api/admin/settings
Update system settings (admin only).

**Response:** `{ success: true, settings: Object }`

---

## Error Responses

### 400 Bad Request
Invalid request format or missing required fields.

**Response:**
```json
{
  "error": "Error message"
}
```

### 401 Unauthorized
Missing or invalid authentication token.

**Response:**
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
User lacks permission for this action.

**Response:**
```json
{
  "error": "Forbidden"
}
```

### 404 Not Found
Resource not found.

**Response:**
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
Server error occurred.

**Response:**
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting
API requests are rate-limited to 100 requests per minute per user.

## Pagination
List endpoints support pagination via `page` and `limit` query parameters.

Default limit: 20, Maximum limit: 100

## Timestamps
All timestamps are in ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`

## Currency
All monetary values are in Indian Rupees (₹).
