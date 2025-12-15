# 🚀 Quick Render Deployment Commands

Your code is already on GitHub: `https://github.com/chethanwizo/MSI.git`

## Step 1: Create Web Service on Render
1. Click "New +" → "Web Service"
2. Connect GitHub repo: `chethanwizo/MSI`
3. Configure:
   - Name: `mis-analytics-backend`
   - Runtime: Node
   - Build Command: `cd backend && npm install && npx prisma generate`
   - Start Command: `cd backend && npm start`
   - Plan: Free

## Step 2: Set Environment Variables (Using Existing Supabase Database)
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres:Ertfgh5500@db.tcepvwfzvfinimywvkfa.supabase.co:5432/postgres
JWT_SECRET=mis-analytics-platform-super-secret-jwt-key-2024-production-render
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
FRONTEND_URL=https://your-vercel-app.vercel.app
```

## Step 3: Deploy Backend
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Go to Shell tab and run: `npm run render:setup`

## Step 4: Deploy Frontend to Vercel
```bash
npm install -g vercel
vercel login
cd frontend
vercel
```

Set environment variable in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com/api
```

## Step 5: Update CORS
Update `FRONTEND_URL` in Render with your Vercel URL

## 🎉 Done!
- Backend: `https://your-service.onrender.com`
- Frontend: `https://your-app.vercel.app`
- Login: `admin@example.com` / `password123`