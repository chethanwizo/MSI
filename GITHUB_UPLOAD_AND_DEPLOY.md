# 🚀 GitHub Upload & Railway Deployment Guide

## Step 1: Upload to GitHub

### 1.1 Initialize Git Repository
```bash
# Navigate to your project directory
cd "C:\Users\Ai\ai pro\excel auto"

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: MIS & Bank Dump Analytics Platform"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New repository" (green button)
3. Repository name: `mis-bank-dump-analytics`
4. Description: `MIS & Bank Dump Analytics Platform with ARN-based mapping`
5. Set to **Public** or **Private** (your choice)
6. **DO NOT** initialize with README (we already have one)
7. Click "Create repository"

### 1.3 Connect Local Repository to GitHub
```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/mis-bank-dump-analytics.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend to Railway

### 2.1 Install Railway CLI
```bash
# Install Railway CLI globally
npm install -g @railway/cli
```

### 2.2 Login to Railway
```bash
# Login to Railway (will open browser)
railway login
```

### 2.3 Create New Railway Project
```bash
# Create new project from GitHub
railway init

# Or link existing project
railway link
```

### 2.4 Set Environment Variables
```bash
# Set all required environment variables
railway variables set DATABASE_URL="postgresql://postgres:Ertfgh5500@db.tcepvwfzvfinimywvkfa.supabase.co:5432/postgres"
railway variables set JWT_SECRET="mis-analytics-platform-super-secret-jwt-key-2024-production"
railway variables set JWT_EXPIRES_IN="7d"
railway variables set NODE_ENV="production"
railway variables set PORT="5000"
railway variables set MAX_FILE_SIZE="10485760"
railway variables set UPLOAD_DIR="uploads"
railway variables set FRONTEND_URL="https://your-app.vercel.app"
```

### 2.5 Deploy to Railway
```bash
# Deploy the application
railway up

# Check deployment status
railway status

# View logs
railway logs
```

### 2.6 Setup Database
```bash
# Run database setup after deployment
railway run npm run railway:setup
```

### 2.7 Get Railway URL
After deployment, Railway will provide a URL like:
`https://mis-bank-dump-analytics-production.railway.app`

Copy this URL - you'll need it for the frontend!

## Step 3: Deploy Frontend to Vercel

### 3.1 Install Vercel CLI
```bash
# Install Vercel CLI globally
npm install -g vercel
```

### 3.2 Login to Vercel
```bash
# Login to Vercel (will open browser)
vercel login
```

### 3.3 Deploy Frontend
```bash
# Navigate to frontend directory
cd frontend

# Deploy to Vercel
vercel

# Follow the prompts:
# - Link to existing project? No
# - What's your project's name? mis-bank-dump-analytics
# - In which directory is your code located? ./
```

### 3.4 Set Environment Variables in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to "Settings" → "Environment Variables"
4. Add:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-railway-app.railway.app/api`
   - **Environment**: Production, Preview, Development

### 3.5 Redeploy Frontend
```bash
# Redeploy to apply environment variables
vercel --prod
```

## Step 4: Update CORS Configuration

### 4.1 Get Your Vercel URL
After deployment, Vercel will provide a URL like:
`https://mis-bank-dump-analytics.vercel.app`

### 4.2 Update Railway Environment
```bash
# Update FRONTEND_URL with your Vercel URL
railway variables set FRONTEND_URL="https://mis-bank-dump-analytics.vercel.app"
```

## Step 5: Test Your Deployment

### 5.1 Test Backend Health
```bash
# Test backend health endpoint
curl https://your-railway-app.railway.app/health
```

### 5.2 Test Frontend
1. Visit your Vercel URL
2. Try logging in with: `admin@example.com` / `password123`
3. Test file upload functionality
4. Check dashboard charts

## Step 6: Custom Domains (Optional)

### 6.1 Railway Custom Domain
1. Go to Railway dashboard
2. Select your project
3. Go to "Settings" → "Domains"
4. Add your custom domain
5. Update DNS records as instructed

### 6.2 Vercel Custom Domain
1. Go to Vercel dashboard
2. Select your project
3. Go to "Settings" → "Domains"
4. Add your custom domain
5. Update DNS records as instructed

## 🎯 Final URLs

After successful deployment, you'll have:

- **GitHub Repository**: `https://github.com/YOUR_USERNAME/mis-bank-dump-analytics`
- **Backend API**: `https://your-railway-app.railway.app`
- **Frontend App**: `https://your-vercel-app.vercel.app`

## 🔧 Environment Variables Summary

### Railway (Backend)
```
DATABASE_URL=postgresql://postgres:Ertfgh5500@db.tcepvwfzvfinimywvkfa.supabase.co:5432/postgres
JWT_SECRET=mis-analytics-platform-super-secret-jwt-key-2024-production
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=5000
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Vercel (Frontend)
```
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app/api
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails on Railway**
   ```bash
   railway logs
   railway up --detach
   ```

2. **CORS Errors**
   - Ensure FRONTEND_URL matches your Vercel domain exactly
   - No trailing slashes in URLs

3. **Database Connection Issues**
   ```bash
   railway run npx prisma db pull
   ```

4. **Environment Variables Not Working**
   - Check spelling and case sensitivity
   - Redeploy after setting variables

## 🎉 Success!

Your MIS & Bank Dump Analytics Platform is now live!

**Default Login Credentials:**
- Email: `admin@example.com`
- Password: `password123`

**⚠️ IMPORTANT: Change the default password after first login!**

## 📞 Support

If you encounter any issues:
1. Check the logs: `railway logs`
2. Verify environment variables
3. Test database connectivity
4. Check GitHub repository for latest code

---

**Your platform is now live and ready for production use! 🚀**