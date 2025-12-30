# Pre-Startup Verification Checklist

Use this checklist before starting the application to ensure everything is configured correctly.

## System Requirements

- [ ] Node.js 16+ installed: `node --version`
- [ ] npm installed: `npm --version`
- [ ] MongoDB running: `mongosh` should connect
- [ ] Port 5000 available (backend)
- [ ] Port 5173/3000 available (frontend)
- [ ] Ports 27017 available (MongoDB)

## Backend Verification

### Environment File
- [ ] File exists: `d:\HR\backend\.env`
- [ ] Contains PORT=5000
- [ ] Contains NODE_ENV=development
- [ ] Contains MONGODB_URI configured
- [ ] Contains JWT_SECRET configured
- [ ] Contains FRONTEND_URL=http://localhost:5173

### Dependencies
- [ ] Run: `cd d:\HR\backend && npm install`
- [ ] No error messages during install
- [ ] `node_modules` folder exists

### Server Configuration
- [ ] File: `d:\HR\backend\src\server.js`
- [ ] CORS origins include localhost:5173 ✓
- [ ] CORS origins include localhost:3000 ✓
- [ ] CORS origins include localhost:3001 ✓
- [ ] Rate limiting enabled ✓
- [ ] Compression enabled ✓
- [ ] All routes imported and registered ✓

### Routes
- [ ] Auth routes: `d:\HR\backend\src\routes\authRoutes.js` ✓
- [ ] Employee routes: `d:\HR\backend\src\routes\employeeRoutes.js` ✓
- [ ] Attendance routes: `d:\HR\backend\src\routes\attendanceRoutes.js` ✓
- [ ] Leave routes: `d:\HR\backend\src\routes\leaveRoutes.js` ✓
- [ ] Payroll routes: `d:\HR\backend\src\routes\payrollRoutes.js` ✓
- [ ] Performance routes: `d:\HR\backend\src\routes\performanceRoutes.js` ✓
- [ ] Document routes: `d:\HR\backend\src\routes\documentRoutes.js` ✓
- [ ] Holiday routes: `d:\HR\backend\src\routes\holidayRoutes.js` ✓
- [ ] Announcement routes: `d:\HR\backend\src\routes\announcementRoutes.js` ✓
- [ ] Analytics routes: `d:\HR\backend\src\routes\analyticsRoutes.js` ✓
- [ ] User routes: `d:\HR\backend\src\routes\userRoutes.js` ✓

## Frontend Verification

### Environment File
- [ ] File exists: `d:\HR\.env`
- [ ] Contains VITE_API_URL=http://localhost:5000/api

### Dependencies
- [ ] Run: `cd d:\HR && npm install`
- [ ] No error messages during install
- [ ] `node_modules` folder exists

### Configuration
- [ ] File: `d:\HR\vite.config.ts`
- [ ] Vite dev server configured ✓
- [ ] Proxy configured for /api routes ✓
- [ ] Port configuration set ✓

### API Service
- [ ] File: `d:\HR\src\services\api.ts`
- [ ] Uses VITE_API_URL environment variable ✓
- [ ] Has error handling for 401 errors ✓
- [ ] Has error handling for 403 errors ✓
- [ ] Has error handling for 404 errors ✓
- [ ] Has error handling for network errors ✓
- [ ] Authorization header properly configured ✓

### Authentication
- [ ] File: `d:\HR\src\components\AuthContext.tsx`
- [ ] Login function implemented ✓
- [ ] Logout function implemented ✓
- [ ] Token stored in localStorage ✓
- [ ] User data stored in localStorage ✓

## MongoDB Verification

### Connection
- [ ] MongoDB service running
- [ ] Can connect with: `mongosh "mongodb://localhost:27017"`
- [ ] Database `hr-portal` exists (will be created on first run)

### Collections
Run these commands in mongosh:
```javascript
use hr-portal
db.collections.find() // Should show collections after first run
db.stats() // Should show database stats
```

## Integration Points Verification

### CORS
- [ ] Backend allows Frontend origin
- [ ] Credentials enabled in CORS
- [ ] All HTTP methods allowed (GET, POST, PUT, DELETE, PATCH)
- [ ] Authorization header in allowed headers

### JWT Token Flow
- [ ] Frontend stores token in localStorage
- [ ] Frontend includes token in Authorization header
- [ ] Backend verifies token signature
- [ ] Backend validates token expiration
- [ ] Backend checks user is active

### Error Handling
- [ ] Frontend catches API errors
- [ ] Frontend logs errors to console (in dev mode)
- [ ] Backend returns proper error messages
- [ ] Backend returns correct HTTP status codes
- [ ] Validation errors return 422 status

### Route Ordering
- [ ] `/stats/overview` comes before `/:id` ✓
- [ ] `/summary/stats` comes before `/:id` ✓
- [ ] `/employee/:id` comes before `/:id` ✓
- [ ] `/:id/download` comes before `/:id` ✓
- [ ] `/:id/approve` comes before `/:id` ✓
- [ ] Special routes before generic parameter routes ✓

## Pre-Startup Debugging

### Test Backend Health
```bash
cd d:\HR\backend
npm run dev
# Wait for: "Server running in development mode on port 5000"
# In another terminal:
curl http://localhost:5000/health
# Should return: {"status":"OK","message":"Server is running"}
```

### Test MongoDB Connection
```bash
# In backend server logs, should see:
# "MongoDB connected successfully"
# or similar success message
```

### Test CORS
```bash
# After frontend starts, check browser console for API calls
# Should see: 📡 API Request: GET http://localhost:5000/api/...
# Not: CORS error
```

### Test Authentication
```bash
# Open browser DevTools (F12)
# Try to login with credentials
# Should see token in localStorage: localStorage.getItem('authToken')
# Should see user data in localStorage: JSON.parse(localStorage.getItem('currentUser'))
```

## Common Pre-Startup Issues

### Node modules not installed
```bash
# Solution:
cd d:\HR\backend && npm install
cd d:\HR && npm install
```

### Port already in use
```bash
# Find process using port:
netstat -ano | findstr :5000  # Backend
netstat -ano | findstr :5173  # Frontend

# Kill process (replace PID):
taskkill /PID <PID> /F
```

### MongoDB connection error
```bash
# Solution 1: Start MongoDB
net start MongoDB  # If installed as service

# Solution 2: Check connection string in .env
# Should be: mongodb://localhost:27017

# Solution 3: Verify MongoDB is listening
netstat -ano | findstr :27017
```

### CORS errors after startup
```bash
# Solution:
# 1. Check FRONTEND_URL in backend .env
# 2. Check VITE_API_URL in frontend .env
# 3. Check allowed origins in server.js
# 4. Restart both servers
```

## Quick Start

Once all checkboxes are verified:

### Option 1: Batch Script (Windows)
```bash
start-dev.bat
```

### Option 2: Manual Start
Terminal 1:
```bash
cd d:\HR\backend
npm run dev
```

Terminal 2:
```bash
cd d:\HR
npm run dev
```

## Verification After Startup

1. **Backend Running**
   - Terminal shows: "Server running on port 5000"
   - Health check returns: {"status":"OK"}

2. **Frontend Running**
   - Browser opens automatically at http://localhost:5173
   - No console errors

3. **API Connection**
   - Browser DevTools Console shows API logs
   - No CORS errors

4. **Authentication**
   - Can login with credentials
   - Token appears in localStorage
   - Can access protected routes

5. **Data Loading**
   - Dashboard loads data
   - Employee list loads
   - Other modules load without errors

## Testing Checklist

After startup, verify functionality:

- [ ] Login works
- [ ] Dashboard loads
- [ ] Employee list loads
- [ ] Can create/edit/delete employees
- [ ] Attendance tracking works
- [ ] Leave requests work
- [ ] Payroll section works
- [ ] Performance reviews work
- [ ] Documents can be uploaded
- [ ] Announcements work
- [ ] Analytics dashboard loads
- [ ] Logout works

## Success Indicators

✅ All if these appear:
- Backend server running on port 5000
- Frontend running on port 5173
- No CORS errors in browser console
- User can login
- Dashboard displays data
- API calls visible in Network tab
- No red errors in console

## Support Resources

- **Troubleshooting**: INTEGRATION_CHECKLIST.md
- **Development**: DEVELOPMENT_GUIDE.md
- **API Testing**: test-integration.ps1 or test-integration.sh
- **API Docs**: backend/API_DOCS.md

---

**Verification Date**: ___________
**Verified By**: ___________
**Status**: [ ] Ready to Start [ ] Issues Found

**Note**: Complete this checklist before reporting any issues.
