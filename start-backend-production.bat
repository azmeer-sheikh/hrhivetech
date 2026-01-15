@echo off
echo Starting HR Portal Backend Server...
echo.
echo Environment: Production
echo Port: 5000
echo.

cd backend
set NODE_ENV=production
set PORT=5000

node src/server.js
