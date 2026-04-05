# GuestWorker Deployment Guide

This guide covers deploying GuestWorker to production with the multi-domain architecture.

## Architecture Overview

```
guestworker.in          → Marketing website (Next.js on Vercel)
app.guestworker.app     → React frontend (Vercel)
api.guestworker.app     → FastAPI backend (Render)
admin.guestworker.app   → Same React app, admin routes
```

## Prerequisites

1. **Domain Setup**
   - `guestworker.in` - Root domain
   - `guestworker.app` - Root domain
   - Access to DNS settings for both domains

2. **Accounts**
   - Vercel account (for frontend + marketing)
   - Render account (for backend API)
   - MongoDB Atlas account (or self-hosted MongoDB)

## Step 1: DNS Configuration

### For `guestworker.in`:
Add the following DNS records:

```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP - check Vercel dashboard for current IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### For `guestworker.app`:
Add the following DNS records:

```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)

Type: CNAME
Name: app
Value: cname.vercel-dns.com

Type: CNAME
Name: api
Value: <your-render-service-url>.onrender.com
```

**Note:** Replace `<your-render-service-url>` with your actual Render service URL after deployment.

## Step 2: Backend Deployment (Render)

### 2.1 Prepare Backend

1. Navigate to `app/backend/`
2. Copy `env.example` to `.env` and fill in values:
   ```bash
   cp env.example .env
   ```

3. Update `.env` with production values:
   ```env
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/guestworker
   DB_NAME=guestworker
   JWT_SECRET_KEY=<generate-strong-random-string>
   COOKIE_SECURE=true
   COOKIE_SAMESITE=lax
   ALLOWED_ORIGINS=https://guestworker.app,https://app.guestworker.app,https://guestworker.in
   ```

### 2.2 Deploy to Render

1. **Create a new Web Service:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the service:**
   - **Name:** `guestworker-api`
   - **Root Directory:** `app/backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables:**
   - Go to "Environment" tab
   - Add all variables from your `.env` file
   - **Important:** Set `COOKIE_SECURE=true` for production
   - Set `ALLOWED_ORIGINS` to production domains

4. **Custom Domain:**
   - After deployment, go to "Settings" → "Custom Domain"
   - Add `api.guestworker.app`
   - Update DNS records as instructed by Render

5. **Health Check:**
   - Render will automatically check `/$PORT/health`
   - Ensure your backend has a health endpoint

### 2.3 Verify Backend

After deployment, test the API:
```bash
curl https://api.guestworker.app/health
```

## Step 3: Frontend Deployment (Vercel)

### 3.1 Prepare Frontend

1. Navigate to `app/frontend/`
2. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

3. Update `.env` with production API URL:
   ```env
   REACT_APP_API_URL=https://api.guestworker.app
   NODE_ENV=production
   ```

### 3.2 Deploy to Vercel

1. **Install Vercel CLI** (optional, or use GitHub integration):
   ```bash
   npm i -g vercel
   ```

2. **Deploy from frontend directory:**
   ```bash
   cd app/frontend
   vercel
   ```

   Or connect via GitHub:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - **Root Directory:** `app/frontend`
   - **Framework Preset:** Create React App
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

3. **Set Environment Variables:**
   - In Vercel project settings → "Environment Variables"
   - Add `REACT_APP_API_URL=https://api.guestworker.app`

4. **Custom Domain:**
   - Go to "Settings" → "Domains"
   - Add `app.guestworker.app`
   - Follow DNS instructions

5. **Redeploy:**
   - After adding environment variables, trigger a new deployment

### 3.3 Verify Frontend

Visit `https://app.guestworker.app` and verify:
- Login page loads
- API calls go to `https://api.guestworker.app`
- No CORS errors in browser console

## Step 4: Marketing Website Deployment (Vercel)

### 4.1 Deploy Marketing Site

1. **Create a new Vercel project:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - **Root Directory:** `marketing/website`
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next` (auto-detected)

2. **Custom Domain:**
   - Go to "Settings" → "Domains"
   - Add `guestworker.in`
   - Follow DNS instructions

3. **Verify:**
   - Visit `https://guestworker.in`
   - Check that links point to `app.guestworker.app`

## Step 5: SSL/HTTPS Setup

Both Vercel and Render automatically provide SSL certificates via Let's Encrypt:

- **Vercel:** SSL is automatic when you add custom domains
- **Render:** SSL is automatic for `*.onrender.com` domains, and for custom domains after DNS is configured

**Verify SSL:**
- Check that all domains show a padlock in browser
- Test with: `https://www.ssllabs.com/ssltest/`

## Step 6: Post-Deployment Checklist

- [ ] All domains resolve correctly
- [ ] SSL certificates are active (green padlock)
- [ ] Frontend can connect to backend API
- [ ] No CORS errors in browser console
- [ ] Login/authentication works
- [ ] Cookies are set correctly (check DevTools → Application → Cookies)
- [ ] API endpoints respond correctly
- [ ] Health checks pass
- [ ] Environment variables are set correctly
- [ ] Database connection works
- [ ] Admin routes work (if applicable)

## Step 7: Monitoring & Maintenance

### Health Checks

- **Backend:** `https://api.guestworker.app/health`
- **Frontend:** Vercel provides automatic health monitoring
- **Marketing:** Vercel provides automatic health monitoring

### Logs

- **Backend:** Render Dashboard → Logs
- **Frontend:** Vercel Dashboard → Deployment → Logs
- **Marketing:** Vercel Dashboard → Deployment → Logs

### Common Issues

1. **CORS Errors:**
   - Verify `ALLOWED_ORIGINS` in backend includes all frontend domains
   - Check that `COOKIE_SECURE=true` only when using HTTPS

2. **API Connection Failed:**
   - Verify `REACT_APP_API_URL` is set correctly in Vercel
   - Check that backend is running and accessible
   - Verify DNS for `api.guestworker.app` points to Render

3. **Cookie Issues:**
   - Ensure `COOKIE_SECURE=true` in production
   - Check `COOKIE_SAMESITE` setting
   - Verify domain settings match

## Step 8: CI/CD (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./app/frontend

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        # Render auto-deploys on push, but you can add webhook triggers here
```

## Environment Variables Reference

### Backend (`app/backend/.env`)
- `MONGO_URL` - MongoDB connection string
- `DB_NAME` - Database name
- `JWT_SECRET_KEY` - Secret key for JWT tokens
- `COOKIE_SECURE` - Set to `true` in production
- `COOKIE_SAMESITE` - `lax`, `strict`, or `none`
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins
- `ADMIN_ACTIVATION_KEY` - Admin activation key
- `RAZORPAY_KEY_ID` - Razorpay key (if using)
- `RAZORPAY_KEY_SECRET` - Razorpay secret (if using)

### Frontend (`app/frontend/.env`)
- `REACT_APP_API_URL` - Backend API URL
- `NODE_ENV` - `development` or `production`

## Support

For issues or questions:
1. Check logs in Render/Vercel dashboards
2. Review environment variables
3. Verify DNS configuration
4. Test API endpoints directly

---

**Last Updated:** January 2025

