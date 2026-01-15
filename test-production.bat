@echo off
echo Testing Production Build Locally...
echo.

REM Load environment variables from backend\.env
cd backend
for /f "delims=" %%i in ('type .env ^| findstr /v "^#"') do set %%i
cd ..

REM Set production environment
set NODE_ENV=production
set PORT=5000

echo Starting backend server in production mode...
echo MongoDB URI: %MONGODB_URI:~0,30%...
echo.

node backend/src/server.js
