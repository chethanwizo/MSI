# Deployment Guide

This guide covers deploying the MIS Analytics Platform to production environments.

## 🚀 Deployment Architecture

```
Frontend (Vercel) → Backend (Railway/Render) → Database (PostgreSQL)
```

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- Domain name (optional)
- Environment variables configured

## 🗄️ Database Setup

### Option 1: Railway PostgreSQL
1. Create Railway account
2. Create new project
3. Add PostgreSQL service
4. Copy connection string

### Option 2: Supabase
1. Create Supabase account
2. Create new project
3. Go to Settings → Database
4. Copy connection string

### Option 3: AWS RDS
1. Create RDS PostgreSQL instance
2. Configure security groups
3. Create database and user
4. Get connection string

## 🔧 Backend Deployment (Railway)

### 1. Prepare Backend
```bash
cd backend
npm install
npm run build
```

### 2. Deploy to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Set environment variables
railway variables set DATABASE_URL="your-postgres-connection-string"
railway variables set JWT_SECRET="your-super-secret-jwt-key"
railway variables set NODE_ENV="production"
railway variables set PORT="5000"

# Deploy
railway up
```

### 3. Environment Variables
Set these in Railway dashboard:
```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.vercel.app
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

### 4. Database Migration
```bash
# Run migrations after deployment
railway run npx prisma db push
railway run npx prisma generate
```

## 🌐 Frontend Deployment (Vercel)

### 1. Prepare Frontend
```bash
cd frontend
npm install
npm run build
```

### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### 3. Environment Variables
Set in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app/api
```

### 4. Domain Configuration
- Add custom domain in Vercel dashboard
- Configure DNS records
- SSL certificate is automatic

## 🔧 Alternative Backend Deployment (Render)

### 1. Create Render Account
- Go to render.com
- Connect GitHub repository

### 2. Create Web Service
- Select repository
- Set build command: `cd backend && npm install`
- Set start command: `cd backend && npm start`

### 3. Environment Variables
Set in Render dashboard:
```
DATABASE_URL=your-postgres-connection-string
JWT_SECRET=your-jwt-secret
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

## 🔒 Security Configuration

### 1. CORS Setup
Ensure backend CORS is configured for production:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### 2. Environment Variables
- Never commit `.env` files
- Use strong JWT secrets (32+ characters)
- Use secure database passwords
- Enable SSL for database connections

### 3. Rate Limiting
Configure appropriate rate limits:
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // requests per window
});
```

## 📊 Database Initialization

### 1. Create Admin User
After deployment, create an admin user:
```bash
# Connect to your deployed backend
curl -X POST https://your-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "secure-password",
    "name": "Admin User",
    "role": "admin"
  }'
```

### 2. Test Upload
1. Login to the platform
2. Upload a sample MIS file
3. Upload a sample Bank Dump file
4. Verify data processing

## 🔍 Monitoring & Logging

### 1. Application Monitoring
- Use Railway/Render built-in monitoring
- Set up error tracking (Sentry)
- Monitor database performance

### 2. Log Management
```javascript
// Production logging
if (process.env.NODE_ENV === 'production') {
  console.log = () => {}; // Disable console.log
  // Use proper logging service
}
```

### 3. Health Checks
Backend includes health check endpoint:
```
GET /health
```

## 🔄 CI/CD Pipeline

### 1. GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: railway up
```

### 2. Automatic Deployments
- Vercel: Auto-deploys on git push
- Railway: Auto-deploys on git push
- Render: Auto-deploys on git push

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check connection string format
   - Verify database is accessible
   - Check firewall settings

2. **CORS Errors**
   - Verify FRONTEND_URL environment variable
   - Check CORS configuration
   - Ensure domains match exactly

3. **File Upload Fails**
   - Check file size limits
   - Verify upload directory permissions
   - Check disk space

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

### Debug Commands
```bash
# Check backend logs
railway logs

# Check database connection
railway run npx prisma db pull

# Test API endpoints
curl https://your-backend.railway.app/health
```

## 📈 Performance Optimization

### 1. Database Optimization
- Add indexes for frequently queried columns
- Use connection pooling
- Monitor query performance

### 2. Frontend Optimization
- Enable Next.js image optimization
- Use CDN for static assets
- Implement proper caching headers

### 3. Backend Optimization
- Use compression middleware
- Implement response caching
- Optimize file upload handling

## 🔐 Backup Strategy

### 1. Database Backups
- Enable automated backups on your database provider
- Test backup restoration process
- Store backups in multiple locations

### 2. File Backups
- Backup uploaded files regularly
- Consider cloud storage integration
- Implement file retention policies

## 📞 Support

For deployment issues:
1. Check logs first
2. Verify environment variables
3. Test database connectivity
4. Contact support if needed

---

**Deployment completed! Your MIS Analytics Platform is now live! 🎉**