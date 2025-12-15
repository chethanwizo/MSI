# 🚀 Quick Deploy Commands

Copy and paste these commands in order:

## 1. Upload to GitHub
```bash
# Initialize and upload to GitHub
git init
git add .
git commit -m "Initial commit: MIS & Bank Dump Analytics Platform"

# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/mis-bank-dump-analytics.git
git branch -M main
git push -u origin main
```

## 2. Deploy Backend to Railway
```bash
# Install and login to Railway
npm install -g @railway/cli
railway login

# Initialize Railway project
railway init

# Set environment variables
railway variables set DATABASE_URL="postgresql://postgres:Ertfgh5500@db.tcepvwfzvfinimywvkfa.supabase.co:5432/postgres"
railway variables set JWT_SECRET="mis-analytics-platform-super-secret-jwt-key-2024-production"
railway variables set JWT_EXPIRES_IN="7d"
railway variables set NODE_ENV="production"
railway variables set PORT="5000"
railway variables set MAX_FILE_SIZE="10485760"
railway variables set UPLOAD_DIR="uploads"
railway variables set FRONTEND_URL="https://your-app.vercel.app"

# Deploy
railway up

# Setup database
railway run npm run railway:setup
```

## 3. Deploy Frontend to Vercel
```bash
# Install and login to Vercel
npm install -g vercel
vercel login

# Deploy frontend
cd frontend
vercel

# Set environment variable in Vercel dashboard:
# NEXT_PUBLIC_API_URL = https://your-railway-app.railway.app/api
```

## 4. Update CORS
```bash
# Update Railway with your Vercel URL
railway variables set FRONTEND_URL="https://your-vercel-app.vercel.app"
```

## 5. Test Deployment
```bash
# Test backend
curl https://your-railway-app.railway.app/health

# Visit your Vercel URL and login with:
# admin@example.com / password123
```

**That's it! Your platform is now live! 🎉**