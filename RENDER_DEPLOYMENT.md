# 🚀 Deploy MIS Analytics Platform to Render

## Step 1: Push Code to GitHub (Already Done)

Your code is already at: `https://github.com/chethanwizo/MSI.git`

## Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub account
3. Connect your GitHub account

### 2.2 Create Web Service (Using Existing Supabase Database)
1. In Render dashboard, click "New +"
2. Select "Web Service"
3. Connect your GitHub repository: `chethanwizo/MSI`
4. Configure:
   - **Name**: `mis-analytics-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: `Node`
   - **Build Command**: `cd backend && npm install && npx prisma generate`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

### 2.3 Set Environment Variables
In the web service settings, add these environment variables (using your existing Supabase database):

```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres:Ertfgh5500@db.tcepvwfzvfinimywvkfa.supabase.co:5432/postgres
JWT_SECRET=mis-analytics-platform-super-secret-jwt-key-2024-production-render
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
FRONTEND_URL=https://your-frontend.vercel.app
```

### 2.4 Deploy
1. Click "Create Web Service"
2. Render will automatically deploy your backend
3. Wait for deployment to complete (5-10 minutes)
4. Your backend will be available at: `https://your-service-name.onrender.com`

### 2.5 Setup Database (Using Existing Supabase Database)
After deployment, run database setup:
1. Go to your web service dashboard
2. Click "Shell" tab
3. Run: `npm run render:setup`

**Note**: This will use your existing Supabase database with all your current data (1,053 applications, 31 employees, etc.)

## Step 3: Deploy Frontend to Vercel

### 3.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 3.2 Login to Vercel
```bash
vercel login
```

### 3.3 Deploy Frontend
```bash
cd frontend
vercel
```

Follow the prompts:
- Link to existing project? **No**
- Project name: `mis-analytics-frontend`
- Directory: `./`

### 3.4 Set Environment Variables in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to "Settings" → "Environment Variables"
4. Add:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-render-service.onrender.com/api`
   - **Environment**: Production, Preview, Development

### 3.5 Redeploy Frontend
```bash
vercel --prod
```

## Step 4: Update CORS Configuration

### 4.1 Get Your Vercel URL
After deployment, you'll get a URL like: `https://mis-analytics-frontend.vercel.app`

### 4.2 Update Render Environment Variable
1. Go to your Render web service dashboard
2. Go to "Environment" tab
3. Update `FRONTEND_URL` to your Vercel URL
4. Save changes (this will trigger a redeploy)

## Step 5: Test Your Deployment

### 5.1 Test Backend
Visit: `https://your-render-service.onrender.com/health`

### 5.2 Test Frontend
1. Visit your Vercel URL
2. Login with: `admin@example.com` / `password123`
3. Test file upload functionality
4. Check dashboard charts

## 🎯 Final Configuration

### Render Environment Variables
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres:Ertfgh5500@db.tcepvwfzvfinimywvkfa.supabase.co:5432/postgres
JWT_SECRET=mis-analytics-platform-super-secret-jwt-key-2024-production-render
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
FRONTEND_URL=https://mis-analytics-frontend.vercel.app
```

### Vercel Environment Variables
```
NEXT_PUBLIC_API_URL=https://mis-analytics-backend.onrender.com/api
```

## 🚨 Important Notes

### Render Free Tier Limitations
- **Sleep Mode**: Free services sleep after 15 minutes of inactivity
- **Cold Starts**: First request after sleep takes 30-60 seconds
- **Build Time**: 10 minute build timeout
- **Storage**: Ephemeral (files deleted on restart)

### Database Considerations
- Using existing Supabase PostgreSQL database
- All your current data will be preserved (1,053 applications, 31 employees)
- Supabase free tier: 500MB storage, excellent performance
- Automatic backups included with Supabase

### Performance Tips
- Keep your service active with uptime monitoring
- Consider upgrading to paid plan for production use
- Use external file storage (AWS S3) for uploaded files

## 🔧 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in package.json
   - Verify build command is correct

2. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Check database is running
   - Ensure IP whitelist includes Render IPs

3. **CORS Errors**
   - Verify FRONTEND_URL matches Vercel domain exactly
   - No trailing slashes in URLs
   - Redeploy after changing environment variables

4. **Service Won't Start**
   - Check start command: `cd backend && npm start`
   - Verify PORT environment variable is set to 10000
   - Check application logs

### Debug Commands
```bash
# Check service status
curl https://your-service.onrender.com/health

# View logs in Render dashboard
# Go to your service → Logs tab
```

## 🎉 Success!

Your MIS Analytics Platform is now live on:
- **Backend**: `https://your-render-service.onrender.com`
- **Frontend**: `https://your-vercel-app.vercel.app`
- **Database**: Render PostgreSQL

**Default Login**: `admin@example.com` / `password123`

**⚠️ Remember to change the default password!**

## 📈 Next Steps

1. **Custom Domain**: Add custom domain in Render/Vercel dashboards
2. **Monitoring**: Set up uptime monitoring to prevent sleep
3. **Backups**: Configure database backup strategy
4. **Scaling**: Consider paid plans for production workloads

---

**Your MIS Analytics Platform is now live and ready for production use! 🚀**