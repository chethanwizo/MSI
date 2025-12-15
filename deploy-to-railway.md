# 🚀 Deploy MIS Analytics Platform to Railway

## Prerequisites
- Railway account (sign up at railway.app)
- Git repository pushed to GitHub/GitLab
- Supabase database (already configured)

## Step 1: Install Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
```

## Step 2: Deploy Backend to Railway

```bash
# Navigate to project root
cd /path/to/your/project

# Initialize Railway project
railway init

# Link to existing project (if you have one) or create new
railway link

# Set environment variables
railway variables set DATABASE_URL="postgresql://postgres:Ertfgh5500@db.tcepvwfzvfinimywvkfa.supabase.co:5432/postgres"
railway variables set JWT_SECRET="your-super-secret-jwt-key-for-mis-analytics-platform-production-2024-railway"
railway variables set JWT_EXPIRES_IN="7d"
railway variables set NODE_ENV="production"
railway variables set PORT="5000"
railway variables set FRONTEND_URL="https://your-frontend-domain.vercel.app"
railway variables set MAX_FILE_SIZE="10485760"
railway variables set UPLOAD_DIR="uploads"

# Deploy to Railway
railway up
```

## Step 3: Setup Database

```bash
# Run database setup after deployment
railway run npm run railway:setup
```

## Step 4: Get Railway Backend URL

After deployment, Railway will provide you with a URL like:
`https://your-app-name.railway.app`

Copy this URL - you'll need it for the frontend deployment.

## Step 5: Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variable in Vercel dashboard
# Go to your project settings and add:
# NEXT_PUBLIC_API_URL = https://your-app-name.railway.app/api
```

## Step 6: Update CORS Configuration

After getting your Vercel frontend URL, update the Railway environment variable:

```bash
# Update FRONTEND_URL with your Vercel URL
railway variables set FRONTEND_URL="https://your-frontend-name.vercel.app"
```

## Step 7: Test Deployment

1. Visit your Vercel frontend URL
2. Try logging in with: `admin@example.com` / `password123`
3. Test file upload functionality
4. Check dashboard charts

## Environment Variables Summary

### Railway (Backend)
```
DATABASE_URL=postgresql://postgres:Ertfgh5500@db.tcepvwfzvfinimywvkfa.supabase.co:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-for-mis-analytics-platform-production-2024-railway
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-name.vercel.app
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

### Vercel (Frontend)
```
NEXT_PUBLIC_API_URL=https://your-app-name.railway.app/api
```

## Troubleshooting

### Common Issues

1. **Build Fails on Railway**
   ```bash
   # Check logs
   railway logs
   
   # Redeploy
   railway up --detach
   ```

2. **Database Connection Issues**
   ```bash
   # Test database connection
   railway run npx prisma db pull
   ```

3. **CORS Errors**
   - Ensure FRONTEND_URL matches your Vercel domain exactly
   - Check both Railway and Vercel environment variables

4. **File Upload Issues**
   - Railway has ephemeral storage
   - Files are deleted on restart
   - Consider using cloud storage for production

### Health Check

Test your deployment:
```bash
# Check backend health
curl https://your-app-name.railway.app/health

# Check API endpoints
curl https://your-app-name.railway.app/api/auth/me
```

## Production Considerations

1. **File Storage**: Railway uses ephemeral storage. For production, consider:
   - AWS S3
   - Cloudinary
   - Railway Volumes (persistent storage)

2. **Database Backups**: Your Supabase database includes automatic backups

3. **Monitoring**: Railway provides built-in monitoring and logs

4. **Custom Domain**: You can add a custom domain in Railway dashboard

## Success! 🎉

Your MIS Analytics Platform is now live on:
- **Backend**: https://your-app-name.railway.app
- **Frontend**: https://your-frontend-name.vercel.app

Default login credentials:
- Email: `admin@example.com`
- Password: `password123`

**Remember to change the default password after first login!**