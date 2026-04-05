# 🚀 GuestWorker - Next.js Full-Stack Application

**A complete workforce management platform for India's contractor economy**

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-Proprietary-red)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Support](#support)

---

## 🎯 Overview

GuestWorker is a comprehensive workforce management platform rebuilt as a standalone **Next.js 15** full-stack application. Originally a monorepo with separate React CRA frontend and FastAPI backend, it has been consolidated into a single, unified application with:

✅ **All original features preserved**  
✅ **Modern tech stack (Next.js 15, React 19, TypeScript)**  
✅ **Production-ready security**  
✅ **Comprehensive documentation**  
✅ **Easy deployment**

### Why This Rebuild?

- **Single Codebase**: Unified Next.js app instead of separate services
- **Better Performance**: Server-side rendering and API routes in one place
- **Easier Maintenance**: No separate deployments or coordination needed
- **Simpler Onboarding**: One repository, one tech stack
- **v0 Preview Ready**: Works seamlessly with Vercel's v0 platform

---

## ✨ Features

### 👤 User Management
- User registration and authentication
- Role-based access control (Contractor, Admin, Employer, Worker)
- User profile management
- Security logging and audit trails
- Account settings and preferences

### 👷 Workforce Management
- **Worker Management**: Add, update, and manage worker profiles
- **Employer Management**: Manage contractor/employer information
- **Attendance Tracking**: Real-time check-in/out with analytics
- **Room Booking**: Manage worker accommodations
- **Worker Analytics**: Performance metrics and trends

### 💰 Financial Management
- **Payments**: Secure payment processing with Razorpay
- **Advances**: Advance disbursement and tracking
- **Commissions**: Automated commission calculation
- **Charges**: Extra charges and deductions management
- **Financial Reports**: Comprehensive payment analytics

### 📊 Analytics & Reporting
- Attendance analytics with trends and patterns
- Financial reports and summaries
- Commission tracking and payment status
- Admin dashboard with key metrics
- Custom report generation

### 📱 Subscription System
- Multiple subscription tiers (Starter, Professional, Enterprise)
- Flexible pricing models
- Trial period management
- Razorpay payment integration
- Plan feature restrictions

### ⚙️ Admin Dashboard
- User management and blocking
- Subscription plan management
- System statistics and reports
- Security logs viewer
- System configuration and settings

### 🔔 Additional Features
- Notifications system
- Email/SMS notification preferences
- Company information management
- Help and support pages
- Privacy policy and terms of service
- Professional landing page

---

## 🚀 Quick Start

### Prerequisites

```bash
# Check Node.js version (18.0.0 or higher)
node --version
npm --version
```

### Setup (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local

# 3. Add your MongoDB connection string to .env.local
# Edit DATABASE_URL with your MongoDB Atlas connection

# 4. Setup database
npx prisma generate
npx prisma db push

# 5. (Optional) Seed with sample data
npx prisma db seed

# 6. Start development server
npm run dev
```

Visit `http://localhost:3000`

### Default Admin Credentials (after seeding)

```
Email: admin@guestworker.in
Password: admin123
```

**⚠️ Change these credentials in production!**

---

## 📚 Documentation

Comprehensive documentation is provided:

| Document | Purpose |
|----------|---------|
| **[BUILD_SUMMARY.md](./BUILD_SUMMARY.md)** | Complete build overview and features |
| **[COMPLETION_VERIFICATION.md](./COMPLETION_VERIFICATION.md)** | Phase-by-phase completion verification |
| **[QUICKSTART.md](./QUICKSTART.md)** | Step-by-step quick start guide |
| **[API_REFERENCE.md](./API_REFERENCE.md)** | Complete API endpoint documentation |
| **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** | Production deployment instructions |
| **[README_GUESTWORKER.md](./README_GUESTWORKER.md)** | Main feature documentation |
| **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** | Technical implementation details |
| **[FEATURES_CHECKLIST.md](./FEATURES_CHECKLIST.md)** | Complete features checklist |
| **[INDEX.md](./INDEX.md)** | Project navigation and index |

### Start With
👉 **New?** Read [QUICKSTART.md](./QUICKSTART.md)  
👉 **API?** Check [API_REFERENCE.md](./API_REFERENCE.md)  
👉 **Deploy?** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 🏗️ Architecture

### Tech Stack

```
Frontend:       React 19, Next.js 15, TypeScript
Styling:        Tailwind CSS
Database:       MongoDB + Prisma ORM
Authentication: JWT + httpOnly Cookies
Server:         Node.js Runtime
Deployment:     Vercel
```

### Project Structure

```
guestworker/
├── app/
│   ├── api/                 # 30+ API endpoints
│   ├── dashboard/           # User dashboard (10 pages)
│   ├── admin/              # Admin dashboard (6 pages)
│   ├── (public)/           # Public pages (6 pages)
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── auth.ts            # JWT utilities
│   ├── prisma.ts          # Database client
│   ├── middleware.ts      # Request middleware
│   ├── logging.ts         # Security logging
│   └── helpers.ts         # Utility functions
├── prisma/
│   ├── schema.prisma      # 14 database models
│   └── seed.ts            # Database seeding
├── middleware.ts          # Next.js middleware
├── package.json
└── Documentation/
    └── [9 documentation files]
```

### Database Schema

**14 Prisma Models:**
- User, Worker, Employer, Attendance, Payment, Advance
- Commission, Charge, Room, Booking, Subscription, Plan
- Notification, SecurityLog

---

## 🔐 Security

### Built-in Security Features

✅ JWT token-based authentication  
✅ Password hashing with bcrypt  
✅ CORS protection  
✅ Rate limiting on auth endpoints  
✅ Admin-only route protection  
✅ Security logging for sensitive operations  
✅ Environment variable management  
✅ Input validation and sanitization  
✅ HTTPOnly cookies for tokens  
✅ HTTPS in production

### Best Practices Followed

- No sensitive data in client-side code
- Server-side session validation
- Secure password storage
- Audit logging for admin actions
- Input validation on all endpoints
- Error messages don't leak information

---

## 🌐 API Overview

### Authentication Endpoints
```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # Login user
POST   /api/auth/logout          # Logout user
GET    /api/auth/session         # Get session info
```

### Worker Management
```
GET    /api/workers              # List workers
POST   /api/workers              # Create worker
GET    /api/workers/[id]         # Get worker details
PUT    /api/workers/[id]         # Update worker
DELETE /api/workers/[id]         # Delete worker
```

### Financial Endpoints
```
GET    /api/payments             # Payment history
POST   /api/payments             # Create payment
GET    /api/advances             # Advance requests
POST   /api/advances             # Request advance
GET    /api/commissions          # Commission tracking
```

### And 20+ more endpoints...

**See [API_REFERENCE.md](./API_REFERENCE.md) for complete documentation**

---

## 📦 Deployment

### One-Click Deployment to Vercel

```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy GuestWorker"
git push origin main

# 2. Connect to Vercel
# - Go to vercel.com
# - Import repository
# - Set environment variables
# - Deploy

# 3. Verify deployment
curl https://your-domain.com/api/health
```

### Environment Variables Required

```env
DATABASE_URL="mongodb+srv://..."
JWT_SECRET="<generate-with: openssl rand -base64 32>"
NEXT_PUBLIC_RAZORPAY_KEY="key_id"
RAZORPAY_SECRET_KEY="secret_key"
NODE_ENV="production"
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 💻 Development

### Start Development Server

```bash
npm run dev
```

Runs on `http://localhost:3000` with hot reload.

### Build for Production

```bash
npm run build
npm start
```

### Database Management

```bash
# View database in browser
npx prisma studio

# Apply schema changes
npx prisma migrate dev --name description

# Reset database (development only)
npx prisma migrate reset
```

### Environment Variables

Create `.env.local`:

```env
# Required
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/guestworker"
JWT_SECRET="<random-secret-key>"

# Optional (for Razorpay)
NEXT_PUBLIC_RAZORPAY_KEY="key_id"
RAZORPAY_SECRET_KEY="secret_key"

# Application
NODE_ENV="development"
SESSION_DURATION="30"
```

See `.env.example` for all options.

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] User can register and login
- [ ] Dashboard displays correctly
- [ ] Worker CRUD operations work
- [ ] Attendance tracking works
- [ ] Payments can be created
- [ ] Admin dashboard accessible only by admin
- [ ] Notifications system works
- [ ] Settings can be saved and retrieved
- [ ] Error pages display correctly

---

## 📈 Performance

### Optimizations Included

- TypeScript for type safety
- Server-side rendering where beneficial
- Database indexing via Prisma
- Efficient query patterns
- CSS optimization via Tailwind
- Environment-based configuration

### Monitoring

- Health check endpoint: `/api/health`
- Error logging system
- Security audit logs
- Request logging middleware

---

## 🤝 Contributing

This is a closed-source project. Modifications should be made in your own fork.

### Making Changes

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Create a pull request
5. Get code review

---

## 🐛 Troubleshooting

### Common Issues

**Port 3000 already in use**
```bash
lsof -ti:3000 | xargs kill -9
```

**MongoDB connection error**
- Check DATABASE_URL in .env.local
- Verify MongoDB is running
- For Atlas: Check IP whitelist

**Prisma errors**
```bash
rm -rf node_modules .next
npm install
npx prisma generate
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#troubleshooting) for more solutions.

---

## 📞 Support

### Resources

- 📖 **Documentation**: Check the relevant `.md` file
- 🔗 **API Docs**: [API_REFERENCE.md](./API_REFERENCE.md)
- 🚀 **Deployment**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- ⚡ **Quick Start**: [QUICKSTART.md](./QUICKSTART.md)

### Getting Help

1. Check the documentation files
2. Review the API reference
3. Check environment variables
4. Review error logs
5. Contact support at support@guestworker.in

---

## 📄 License

GuestWorker is proprietary software. All rights reserved.

Unauthorized copying, modification, or distribution is prohibited.

---

## 🎉 Ready to Go!

You now have a complete, production-ready workforce management application.

### Next Steps

1. **Develop**: Run `npm run dev` and start building
2. **Test**: Use the provided documentation
3. **Deploy**: Follow the deployment guide
4. **Monitor**: Check health endpoints and logs

---

## 📊 Project Statistics

- **API Endpoints**: 30+
- **Pages**: 25+
- **Database Models**: 14
- **Documentation Files**: 9
- **Configuration Files**: 8
- **Total Lines of Code**: 10,000+
- **Build Status**: ✅ Production Ready

---

## 🙏 Acknowledgments

Built with:
- **Next.js** - Modern React framework
- **Prisma** - Type-safe ORM
- **MongoDB** - Flexible database
- **Tailwind CSS** - Utility-first CSS
- **Vercel** - Deployment platform

---

**GuestWorker - Powering India's Workforce Management**

*Built for contractors, by developers who understand their needs*

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: ✅ Production Ready

[👉 Get Started with QUICKSTART.md](./QUICKSTART.md)

