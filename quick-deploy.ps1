Write-Host "🚀 MIS Analytics Platform - Deploy to Render" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

Write-Host ""
Write-Host "📂 Your code is already on GitHub at:" -ForegroundColor Blue
Write-Host "https://github.com/chethanwizo/MSI.git" -ForegroundColor Cyan

Write-Host ""
Write-Host "✅ Code is ready for deployment!" -ForegroundColor Green

Write-Host ""
Write-Host "🎯 Deployment Steps:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. 🌐 Create Web Service on Render:" -ForegroundColor Magenta
Write-Host "   • Go to https://render.com" -ForegroundColor White
Write-Host "   • Sign up/Login with GitHub" -ForegroundColor White
Write-Host "   • Click 'New +' → 'Web Service'" -ForegroundColor White
Write-Host "   • Connect GitHub repo: chethanwizo/MSI" -ForegroundColor White
Write-Host "   • Name: mis-analytics-backend" -ForegroundColor White
Write-Host "   • Runtime: Node" -ForegroundColor White
Write-Host "   • Build Command: cd backend && npm install && npx prisma generate" -ForegroundColor White
Write-Host "   • Start Command: cd backend && npm start" -ForegroundColor White
Write-Host "   • Plan: Free" -ForegroundColor White
Write-Host ""

Write-Host "2. 🔧 Set Environment Variables in Render:" -ForegroundColor Magenta
Write-Host "   NODE_ENV=production" -ForegroundColor White
Write-Host "   PORT=10000" -ForegroundColor White
Write-Host "   DATABASE_URL=postgresql://postgres:Ertfgh5500@db.tcepvwfzvfinimywvkfa.supabase.co:5432/postgres" -ForegroundColor Cyan
Write-Host "   JWT_SECRET=mis-analytics-platform-super-secret-jwt-key-2024-production-render" -ForegroundColor White
Write-Host "   JWT_EXPIRES_IN=7d" -ForegroundColor White
Write-Host "   MAX_FILE_SIZE=10485760" -ForegroundColor White
Write-Host "   UPLOAD_DIR=uploads" -ForegroundColor White
Write-Host "   FRONTEND_URL=https://your-vercel-app.vercel.app" -ForegroundColor Yellow
Write-Host ""

Write-Host "3. 🚀 Deploy Backend:" -ForegroundColor Magenta
Write-Host "   • Click 'Create Web Service'" -ForegroundColor White
Write-Host "   • Wait for deployment (5-10 minutes)" -ForegroundColor White
Write-Host "   • Go to Shell tab and run: npm run render:setup" -ForegroundColor White
Write-Host ""

Write-Host "4. 🌐 Deploy Frontend to Vercel:" -ForegroundColor Magenta
Write-Host "   Run these commands:" -ForegroundColor White
Write-Host "   npm install -g vercel" -ForegroundColor Cyan
Write-Host "   vercel login" -ForegroundColor Cyan
Write-Host "   cd frontend" -ForegroundColor Cyan
Write-Host "   vercel" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Then set environment variable in Vercel dashboard:" -ForegroundColor White
Write-Host "   NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com/api" -ForegroundColor Yellow
Write-Host ""

Write-Host "5. 🔗 Update CORS:" -ForegroundColor Magenta
Write-Host "   • Get your Vercel URL" -ForegroundColor White
Write-Host "   • Update FRONTEND_URL in Render environment variables" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Your platform will be live at:" -ForegroundColor Green
Write-Host "Backend: https://your-service.onrender.com" -ForegroundColor Cyan
Write-Host "Frontend: https://your-app.vercel.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "Default login: admin@example.com / password123" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 For detailed instructions, see: RENDER_DEPLOYMENT.md" -ForegroundColor Blue