# Quick Start Guide

## Local Development

### 1. Backend (Port 8000)
```bash
cd app/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example .env
# Edit .env with your MongoDB connection
uvicorn server:app --reload
```

### 2. Frontend (Port 3000)
```bash
cd app/frontend
npm install
cp env.example .env
# Edit .env: REACT_APP_API_URL=http://localhost:8000
npm start
```

### 3. Marketing Site (Port 3001) - Optional
```bash
cd marketing/website
npm install
npm run dev
```

## Production Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

**Quick Summary:**
1. Deploy backend to Render → `api.guestworker.app`
2. Deploy frontend to Vercel → `app.guestworker.app`
3. Deploy marketing to Vercel → `guestworker.in`
4. Configure DNS records
5. Set environment variables

## Environment Variables

### Backend (`app/backend/.env`)
```env
MONGO_URL=mongodb://localhost:27017/guestworker
DB_NAME=guestworker
JWT_SECRET_KEY=your-secret-key
COOKIE_SECURE=false  # true in production
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (`app/frontend/.env`)
```env
REACT_APP_API_URL=http://localhost:8000
```

## API Documentation

Once backend is running:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Troubleshooting

**CORS Errors:**
- Check `ALLOWED_ORIGINS` in backend `.env`
- Ensure frontend URL is in the list

**API Connection Failed:**
- Verify `REACT_APP_API_URL` is set correctly
- Check backend is running on port 8000
- Check browser console for errors

**Build Errors:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check Node.js version (18+)

