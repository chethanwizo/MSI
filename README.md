# MIS & Bank Dump Analytics Platform

A comprehensive web-based platform for analyzing daily MIS Excel files and Bank Dump Excel files with automatic employee-wise segregation using ARN mapping.

## 🚀 Features

### Core Functionality
- **Daily File Uploads**: Upload MIS and Bank Dump Excel files
- **Automatic ARN Mapping**: `MIS.ARN NO` = `DUMP.APPL_REF` (Primary Join Key)
- **Employee-wise Segregation**: Automatic segregation based on MIS employee mapping
- **Raw Data Preservation**: ALL columns from both files preserved in JSONB format
- **Advanced Search**: Search across all data with multiple filters
- **Comprehensive Dashboard**: Real-time analytics and metrics

### Key Business Rules
- ❗ **ARN is the single source of truth**
- ❗ **Never infer employee from dump data**
- ❗ **Employee mapping comes ONLY from MIS**
- ❗ **ALL raw columns are preserved**

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** (React)
- **Tailwind CSS** for styling
- **TypeScript** for type safety
- **React Query** for data fetching
- **Recharts** for analytics visualization

### Backend
- **Node.js** with **Express.js**
- **Prisma ORM** for database operations
- **PostgreSQL** with JSONB for raw data
- **Excel parsing** with `xlsx` library
- **JWT authentication**

### Database Schema
- `employees` - Employee master data
- `applications` - Master application table (ARN-based)
- `mis_raw_data` - Full MIS data preservation (JSONB)
- `dump_raw_data` - Full bank dump preservation (JSONB)
- `application_status` - Structured status data for queries
- `upload_logs` - Upload history and error tracking

## 📥 File Processing Logic

### MIS File Upload
1. Validates required columns (ARN NO, CUSTOMER NAME, EMP NAME)
2. Stores complete row in `mis_raw_data.raw_json`
3. Creates/updates employee records
4. Creates/updates application records with ARN → Employee mapping
5. Updates application status from MIS data

### Bank Dump Upload
1. Validates APPL_REF column exists
2. Stores complete row in `dump_raw_data.raw_json`
3. Maps APPL_REF to existing ARN from applications
4. Updates application status with bank data
5. Marks unmapped records for review

## 🔍 Search & Analytics

### Search Features
- Multi-field search (Employee, ARN, Customer, Mobile, Status)
- Date range filtering
- Status filtering (Approved/Rejected/Pending)
- Expandable JSON viewer for raw data
- Excel export functionality

### Dashboard Metrics
- Total/Approved/Rejected/Pending applications
- Approval rates and trends
- Employee performance comparison
- Rejection reason analysis
- VKYC/BKYC completion funnel
- Data mapping statistics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd mis-analytics-platform
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Setup Backend**
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm run db:generate
npm run db:push
```

4. **Setup Frontend**
```bash
cd frontend
# Create .env.local with your API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

5. **Start Development Servers**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

6. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Initial Setup
1. Register an admin user via API or database
2. Login to the platform
3. Upload MIS file first (establishes ARN → Employee mapping)
4. Upload Bank Dump file (attaches bank data to ARNs)

## 📊 Expected File Formats

### MIS File Columns
```
DATE                 (Optional)
ARN NO              (Required) - Primary key
CUSTOMER NAME       (Required)
MOBILE NO           (Optional)
EMP NAME            (Required) - Establishes employee mapping
VKYC STATUS         (Optional)
BKYC STATUS         (Optional)
DECLINE CODE        (Optional)
FINAL               (Optional)
```

### Bank Dump File Columns
```
APPL_REF            (Required) - Maps to MIS ARN NO
FULL_NAME           (Optional) - Validation only
DECLINE_DESCRIPTION (Optional)
DECLINE_CATEGORY    (Optional)
Activation Status   (Optional)
DECISIN_DT          (Optional)
+ ALL other columns are preserved
```

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (Admin/Viewer)
- File type validation
- File size limits
- Rate limiting
- Input sanitization

## 🚀 Deployment

### 🌐 Production Deployment (Railway + Vercel)

#### Quick Deploy Script

**Windows PowerShell:**
```powershell
# Deploy backend to Railway
.\quick-deploy.ps1
```

**Linux/Mac:**
```bash
# Deploy backend to Railway
./quick-deploy.sh
```

#### Manual Deployment Steps

**1. Deploy Backend to Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init

# Set environment variables
railway variables set DATABASE_URL="your-supabase-connection-string"
railway variables set JWT_SECRET="your-super-secret-jwt-key"
railway variables set NODE_ENV="production"
railway variables set PORT="5000"
railway variables set FRONTEND_URL="https://your-vercel-app.vercel.app"

# Deploy
railway up

# Setup database
railway run npm run railway:setup
```

**2. Deploy Frontend to Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Set environment variable in Vercel dashboard:
# NEXT_PUBLIC_API_URL = https://your-railway-app.railway.app/api
```

**3. Update CORS Configuration**
```bash
# Update Railway with your Vercel URL
railway variables set FRONTEND_URL="https://your-vercel-app.vercel.app"
```

### 📋 Environment Variables

**Railway (Backend):**
```env
DATABASE_URL=postgresql://postgres:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-vercel-app.vercel.app
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

**Vercel (Frontend):**
```env
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app/api
```

### 🔧 Database Options
- **Supabase** (Recommended) - Free tier with 500MB
- **Railway PostgreSQL** - Integrated with Railway
- **AWS RDS** - Enterprise option
- **Render PostgreSQL** - Alternative option

### 📖 Detailed Deployment Guide
See [deploy-to-railway.md](deploy-to-railway.md) for complete step-by-step instructions.

### 🎯 Production Checklist
- ✅ Backend deployed to Railway
- ✅ Frontend deployed to Vercel  
- ✅ Database connected and seeded
- ✅ Environment variables configured
- ✅ CORS settings updated
- ✅ Default admin user created
- ✅ File upload tested
- ✅ Dashboard charts working

**Default Login:** `admin@example.com` / `password123`
**⚠️ Change default password after first login!**

## 📈 Monitoring & Maintenance

### Upload Logs
- All uploads are logged with success/failure status
- Error details are preserved for troubleshooting
- Upload history is accessible via API and UI

### Data Integrity
- Duplicate ARN handling
- Column mismatch alerts
- Unmapped record tracking
- Raw data preservation ensures no data loss

## 🔮 Future Extensions

- Scheduled daily uploads
- Email/WhatsApp MIS reports
- Bank-wise analytics
- SLA & TAT tracking
- Advanced data visualization
- API integrations

## 📝 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### File Upload
- `POST /api/upload/mis` - Upload MIS file
- `POST /api/upload/dump` - Upload bank dump file
- `GET /api/upload/history` - Get upload history

### Dashboard
- `GET /api/dashboard/metrics` - Get dashboard metrics
- `GET /api/dashboard/employee-performance` - Employee stats
- `GET /api/dashboard/rejection-analysis` - Rejection analysis
- `GET /api/dashboard/trends` - Date-wise trends

### Search
- `GET /api/search` - Advanced search
- `GET /api/search/unmapped` - Unmapped records
- `POST /api/search/export` - Export search results

### Employees
- `GET /api/employee` - Get all employees
- `GET /api/employee/:id` - Get employee details
- `GET /api/employee/performance/comparison` - Performance comparison

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for efficient MIS and Bank Dump analytics**