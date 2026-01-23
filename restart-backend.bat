@echo off
echo.
echo ========================================
echo   Restarting Backend Server
echo ========================================
echo.

REM Kill any existing node processes
echo Stopping any running servers...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo.
echo Starting backend server with updated configuration...
echo.

cd backend
start "HR Portal Backend" cmd /k "node src/server.js"

echo.
echo ✓ Backend server started!
echo ✓ Check the backend window for logs
echo ✓ Server running on http://localhost:5000
echo.
echo Press any key to exit...
pause >nul
