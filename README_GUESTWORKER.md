# GuestWorker - Workforce Management Platform

A comprehensive Next.js full-stack application for managing contractors, workers, employers, room bookings, attendance tracking, and payments.

## Features

- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Worker Management**: Add, manage, and track worker profiles with documentation
- **Employer Management**: Manage multiple employers and their relationships
- **Room Booking System**: Create and manage room bookings for workers
- **Attendance Tracking**: Track worker attendance with analytics and reporting
- **Payment Processing**: Secure payments via Razorpay integration
- **Subscription Management**: Flexible subscription plans with trial periods
- **Admin Dashboard**: Comprehensive admin panel for platform management
- **Reports & Analytics**: Visualizations and insights with Recharts
- **Security**: Security logging, brute force protection, and audit trails

## Tech Stack

- **Frontend & Backend**: Next.js 15 + React 19
- **Database**: MongoDB + Prisma ORM
- **Authentication**: JWT with HTTP-only cookies
- **Payments**: Razorpay SDK
- **UI**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts for data visualization
- **Password Security**: bcryptjs for hashing

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- MongoDB database (local or Atlas)
- Razorpay account (for payment integration)

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repo-url>
   cd guestworker
   pnpm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with:
   - `DATABASE_URL`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Your Razorpay credentials
   - `NEXT_PUBLIC_APP_URL`: Your app URL

3. **Set up the database**:
   ```bash
   pnpm run prisma:push
   pnpm run prisma:seed
   ```

4. **Run the development server**:
   ```bash
   pnpm dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── api/
│   ├── auth/          # Authentication endpoints
│   ├── workers/       # Worker management API
│   ├── employers/     # Employer management API
│   ├── rooms/         # Room management API
│   ├── attendance/    # Attendance tracking API
│   ├── bookings/      # Room booking API
│   ├── payments/      # Payment processing API
│   └── subscriptions/ # Subscription management API
├── dashboard/         # Protected dashboard routes
├── admin/            # Admin-only routes
├── login/            # Authentication pages
├── pricing/          # Subscription & pricing page
└── help/             # Help & documentation pages

lib/
├── auth.ts           # JWT & session management
├── prisma.ts         # Prisma client singleton
├── helpers.ts        # Utility functions
├── logging.ts        # Security & audit logging
└── middleware.ts     # Route protection middleware

prisma/
├── schema.prisma     # Database schema
└── seed.ts           # Database seeding script
```

## Database Schema

The application includes models for:
- **Users**: Authentication & user profiles
- **Contractor**: Contractor business information
- **Employer**: Employer profiles
- **Worker**: Worker details & employment records
- **Room**: Accommodation management
- **Booking**: Room booking records
- **Attendance**: Daily attendance tracking
- **Payment**: Payment transactions
- **Subscription**: Plan subscriptions
- **Plan**: Available subscription plans
- And more... (Advance, Commission, SecurityLog, etc.)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session

### Workers
- `GET /api/workers` - List contractor's workers
- `POST /api/workers` - Add new worker
- `GET /api/workers/[id]` - Get worker details
- `PATCH /api/workers/[id]` - Update worker

### Other Resources
- `GET/POST /api/employers` - Employer management
- `GET/POST /api/rooms` - Room management
- `GET/POST /api/bookings` - Room bookings
- `GET/POST /api/attendance` - Attendance tracking
- `GET/POST /api/payments` - Payment records
- `GET/POST /api/subscriptions` - Subscription management

## Role-Based Access Control

- **Admin**: Full platform access
- **Contractor**: Can manage workers, employers, rooms, bookings, attendance, and payments
- **Employer**: Can view workers and bookings
- **Worker**: Can view personal details and earnings

## Security Features

- **Password Security**: bcryptjs hashing with salt rounds
- **Brute Force Protection**: Account locking after 5 failed attempts
- **Security Logging**: All user actions logged with IP addresses
- **HTTP-Only Cookies**: Secure token storage
- **Role-Based Middleware**: Protected routes enforced at API level
- **Audit Trail**: All admin actions tracked in AdminLog

## Deployment

The application is ready for deployment on Vercel:

```bash
pnpm run build
pnpm start
```

## Contributing

Contributions are welcome! Please feel free to submit pull requests.

## License

MIT License - See LICENSE file for details

## Support

For support, please contact support@guestworker.in or visit the Help Center at `/help`.
