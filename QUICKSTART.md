# Quick Start Guide - GuestWorker Next.js

## 5-Minute Setup

### Step 1: Install & Configure
```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Update .env.local with your MongoDB connection
# Keep other values as-is for local testing
```

### Step 2: Initialize Database
```bash
# Push schema to MongoDB
pnpm run prisma:push

# Seed with default plans and content
pnpm run prisma:seed
```

### Step 3: Start Development
```bash
pnpm dev
```

Visit http://localhost:3000

## Testing the Application

### Create Test Account
1. Click "Register" on homepage
2. Fill in:
   - Full Name: John Contractor
   - Email: john@example.com
   - Account Type: Contractor
   - Business Name: J&K Workforce
   - Password: Test@1234
3. Click "Create Account" - you'll be redirected to dashboard

### Explore Features
- **Dashboard**: View your statistics
- **Workers**: Add and manage workers
- **Employers**: Add companies you work with
- **Rooms**: Create accommodation listings
- **Attendance**: Mark daily attendance
- **Payments**: Track transactions
- **Reports**: View analytics and charts

## Key Features to Try

### 1. Add a Worker
1. Go to Dashboard → Workers
2. Click "Add Worker"
3. Fill worker details (name, email, phone, documents)
4. Click "Add Worker"

### 2. Track Attendance
1. Go to Dashboard → Attendance
2. Select worker and employer
3. Mark status (present, absent, half-day)
4. Submit

### 3. Create Room Booking
1. Go to Dashboard → Rooms
2. Create a room (name, capacity, price)
3. Go to Bookings
4. Book room for worker

### 4. View Reports
1. Go to Dashboard → Reports
2. See revenue charts, worker statistics
3. View attendance trends

## Environment Variables Reference

```
DATABASE_URL          # MongoDB connection (required)
JWT_SECRET           # Random string for token signing (required)
RAZORPAY_KEY_ID      # Optional - for payment processing
RAZORPAY_KEY_SECRET  # Optional - for payment processing
NEXT_PUBLIC_APP_URL  # Your app URL (default: http://localhost:3000)
```

## Default Admin Access

After seeding, an admin account is NOT auto-created. To create an admin:

1. Register normally as contractor
2. Manually update in MongoDB:
   ```
   db.users.updateOne(
     { email: "your@email.com" },
     { $set: { role: "admin" } }
   )
   ```

3. Login again - you'll have admin access

## Troubleshooting

### Database Connection Error
- Check MongoDB connection string in .env.local
- Ensure MongoDB is running (if local)
- Check network access if using MongoDB Atlas

### Login Issues
- Clear browser cookies
- Try incognito/private window
- Check console for error messages

### Database Seeding Failed
- Ensure database is empty first: `pnpm run prisma:push` first
- Check MongoDB permissions
- Try: `pnpm run prisma:migrate reset` (⚠️ clears all data)

## API Testing

### Login & Get Session
```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Test@1234"}'

# 2. Get Session (cookies required)
curl -X GET http://localhost:3000/api/auth/session \
  -H "Cookie: auth_token=<your_token>"

# 3. Get Workers
curl -X GET http://localhost:3000/api/workers \
  -H "Cookie: auth_token=<your_token>"
```

## File Structure Quick Reference

```
/app           - Next.js app directory (routes & pages)
/lib           - Utilities (auth, database, helpers)
/prisma        - Database schema & seed
/public        - Static assets
/styles        - Global styles
```

## Development Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm prisma:studio   # Open Prisma Studio (DB GUI)
pnpm prisma:seed     # Run seed script
pnpm prisma:push     # Push schema changes
```

## Deployment Checklist

Before deploying to production:

- [ ] Set PRODUCTION `.env` variables
- [ ] Update JWT_SECRET to random 32+ char string
- [ ] Configure MongoDB Atlas cluster
- [ ] Set up Razorpay production keys
- [ ] Run `pnpm build` locally to verify
- [ ] Set up monitoring/error tracking
- [ ] Configure email service for notifications
- [ ] Test all payment flows
- [ ] Verify database backups configured

## Next Steps

1. **Customize branding**: Update logo, colors in layout
2. **Add email notifications**: Integrate SendGrid/Mailgun
3. **Configure storage**: Add file upload for documents
4. **Set up analytics**: Integrate Google Analytics or Plausible
5. **Mobile app**: Use React Native for mobile version

## Support & Resources

- **Documentation**: See README_GUESTWORKER.md
- **Implementation Summary**: See IMPLEMENTATION_SUMMARY.md
- **Database Schema**: See prisma/schema.prisma
- **API Examples**: Check app/api/* folders

Ready to build! Start with `pnpm dev` 🚀
