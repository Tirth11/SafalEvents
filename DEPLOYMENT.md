# Safal-AI Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free tier works)
- PostgreSQL database (Neon, Supabase, Railway, or any Postgres provider)
- Node.js 18+ installed locally

## Quick Deploy to Vercel

### Step 1: Push to GitHub
```bash
# Initialize git if not already
git init
git add .
git commit -m "Initial commit - Safal-AI"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/SafalAI.git
git push -u origin main
```

### Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your GitHub repository `YOUR_USERNAME/SafalAI`
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend-url.com/api`

6. Click **Deploy**

### Step 3: Set Up Database

**Option A: Neon (Free PostgreSQL)**
1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string

**Option B: Supabase (Free PostgreSQL)**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string

### Step 4: Deploy Backend

**Option A: Railway (Recommended)**
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Deploy from GitHub repo
4. Set root directory to `backend`
5. Add environment variables:
   - `DATABASE_URL` = Your PostgreSQL connection string
   - `JWT_SECRET` = A random secret string
   - `PORT` = 3001

**Option B: Render**
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm run start`
5. Add environment variables

### Step 5: Update Frontend Environment
After deploying the backend, update the frontend's `NEXT_PUBLIC_API_URL` in Vercel:
1. Go to your Vercel project
2. Settings > Environment Variables
3. Update `NEXT_PUBLIC_API_URL` to your backend URL
4. Redeploy

## Local Development

### Install Dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

### Set Up Database
```bash
cd backend

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# Then run migrations
npx prisma generate
npx prisma db push
```

### Run Locally
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Health: http://localhost:3001/health

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend (.env)
```
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/safal_ai
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

## Production Checklist

- [ ] Database is set up and accessible
- [ ] Backend deployed and running
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] JWT_SECRET is a strong random string
- [ ] Database migrations run
- [ ] CORS configured for production frontend URL

## Troubleshooting

### Build Fails on Vercel
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility (18+)
- Check build logs for specific errors

### Database Connection Issues
- Verify DATABASE_URL format
- Ensure database is accessible from deployment region
- Check if SSL is required (add `?sslmode=require` to URL)

### API Not Accessible
- Verify backend is running
- Check CORS settings
- Ensure NEXT_PUBLIC_API_URL is correct
