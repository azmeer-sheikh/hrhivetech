@echo off
REM Quick Start Script for HR Portal (Windows)
REM This script starts both backend and frontend servers

title HR Portal - Development Servers
color 0A

echo.
echo ========================================
echo   HR Portal - Development Environment
echo ========================================
echo.
echo This script will start both backend and frontend servers.
echo Make sure MongoDB is running before proceeding.
echo.
pause

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MongoDB is running (optional warning)
echo.
echo Checking MongoDB connection...
powershell -Command "$MongoDB = Test-Connection localhost -Count 1 -Quiet -ErrorAction SilentlyContinue; if ($MongoDB) { Write-Host 'MongoDB appears to be running' -ForegroundColor Green } else { Write-Host 'WARNING: MongoDB may not be running. Start it before testing the backend.' -ForegroundColor Yellow }"
echo.

REM Start backend in new window
echo Starting Backend Server...
start "HR Portal Backend" cmd /k "cd /d d:\HR\backend && npm run dev"
timeout /t 3 /nobreak

REM Start frontend in new window
echo Starting Frontend Server...
start "HR Portal Frontend" cmd /k "cd /d d:\HR && npm run dev"

echo.
echo ========================================
echo   Servers Starting...
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo API:      http://localhost:5000/api
echo.
echo The frontend browser window should open automatically.
echo.
echo NOTE: Press Ctrl+C in each window to stop the servers.
echo.
pause
