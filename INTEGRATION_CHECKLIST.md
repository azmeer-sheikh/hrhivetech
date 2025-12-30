# Frontend-Backend Integration Checklist

## ✅ System Configuration

### Backend Setup (.env)
- [x] PORT set to 5000
- [x] NODE_ENV set to development
- [x] MONGODB_URI configured for local MongoDB
- [x] JWT_SECRET configured
- [x] FRONTEND_URL set to http://localhost:5173 (Vite default)
- [x] CORS configured for multiple ports (5173, 3000, 3001)

### Frontend Setup (.env)
- [x] VITE_API_URL set to http://localhost:5000/api

### Vite Configuration
- [x] Dev server proxy configured for /api routes
- [x] Port set to 3000 (or 5173 for default Vite)

## ✅ Route Configuration

### Employee Routes
- [x] GET /api/employees - List all employees
- [x] GET /api/employees/stats/overview - Employee statistics (before /:id)
- [x] GET /api/employees/:id - Get single employee
- [x] POST /api/employees - Create employee
- [x] PUT /api/employees/:id - Update employee
- [x] DELETE /api/employees/:id - Delete employee

### Attendance Routes
- [x] GET /api/attendance - List attendance
- [x] GET /api/attendance/summary/stats - Attendance stats (before /:id)
- [x] GET /api/attendance/employee/:employeeId - Employee attendance (before /:id)
- [x] POST /api/attendance/check-in - Check in
- [x] POST /api/attendance/check-out - Check out
- [x] GET /api/attendance/:id - Get single record
- [x] PUT /api/attendance/:id - Update attendance
- [x] DELETE /api/attendance/:id - Delete attendance

### Leave Routes
- [x] GET /api/leaves - List leaves
- [x] GET /api/leaves/balance/:employeeId - Leave balance (before /:id)
- [x] POST /api/leaves - Create leave request
- [x] PUT /api/leaves/:id - Update leave
- [x] PUT /api/leaves/:id/approve - Approve leave
- [x] PUT /api/leaves/:id/reject - Reject leave
- [x] DELETE /api/leaves/:id - Delete leave

### Document Routes
- [x] GET /api/documents - List documents
- [x] GET /api/documents/stats/overview - Document stats (before /:id)
- [x] POST /api/documents - Upload document
- [x] GET /api/documents/:id/download - Download document (before /:id)
- [x] GET /api/documents/:id - Get single document
- [x] PUT /api/documents/:id - Update document
- [x] DELETE /api/documents/:id - Delete document

### Performance Routes
- [x] GET /api/performance - List reviews
- [x] GET /api/performance/employee/:employeeId - Employee performance (before /:id)
- [x] POST /api/performance - Create review
- [x] PATCH /api/performance/:id/acknowledge - Acknowledge review (before /:id)
- [x] GET /api/performance/:id - Get single review
- [x] PUT /api/performance/:id - Update review
- [x] DELETE /api/performance/:id - Delete review

## ✅ API Service Configuration

### Error Handling
- [x] Network error detection and user-friendly messages
- [x] 401 Unauthorized handling with token cleanup and redirect
- [x] 403 Forbidden handling
- [x] 404 Not Found handling
- [x] 422 Validation error handling
- [x] 500 Server error handling
- [x] Development mode logging with request/response details

### Headers
- [x] Authorization header with Bearer token
- [x] Content-Type application/json
- [x] CORS headers properly configured

## ✅ Middleware

### Authentication (Auth Middleware)
- [x] JWT token verification
- [x] User activation check
- [x] Token expiration handling
- [x] Proper error responses

### Error Handler
- [x] Mongoose CastError handling
- [x] Mongoose duplicate key handling
- [x] Mongoose validation error handling
- [x] JWT error handling
- [x] Token expiration error handling
- [x] Development mode detailed logging

### CORS
- [x] Support for multiple origins
- [x] Credentials enabled
- [x] All necessary HTTP methods allowed
- [x] Proper headers configuration

## 🚀 Running the Application

### Start Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on: `http://localhost:5000`
API Base URL: `http://localhost:5000/api`

### Start Frontend
```bash
npm install
npm run dev
```
Frontend runs on: `http://localhost:5173` (Vite default)
or `http://localhost:3000` (if port configured differently)

## 🧪 Testing the Integration

### 1. Check Server Health
```bash
curl http://localhost:5000/health
```
Expected response: `{"status":"OK","message":"Server is running"}`

### 2. Test Authentication
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hr-portal.com","password":"password"}'
```

### 3. Test Protected Route
```bash
curl http://localhost:5000/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Check Frontend Connection
- Open browser console (F12) to see API request logs
- Check Network tab to verify requests are reaching backend
- Look for any CORS errors in console

## 🐛 Troubleshooting

### CORS Errors
- Ensure backend FRONTEND_URL matches your frontend port
- Check that frontend is making requests to correct API_URL
- Verify CORS allowed origins include your frontend URL

### 401 Unauthorized Errors
- Check that token is being sent in Authorization header
- Verify JWT_SECRET matches between request and server
- Check that user token is stored in localStorage

### Cannot Connect to Backend
- Ensure backend server is running on port 5000
- Check that VITE_API_URL points to correct backend address
- Verify no firewall blocking the connection

### Route Not Found (404)
- Check endpoint path is correct in API calls
- Ensure routes are defined in backend
- Remember route order matters (specific routes before generic /:id)

### Validation Errors (422)
- Check request body format matches backend expectations
- Ensure all required fields are provided
- Verify data types match schema requirements

## 📊 Monitoring

Enable development logging by checking browser console and terminal:
- **Frontend**: Look for `📡 API Request`, `📊 API Response`, `✅ API Success`, `❌ API Error` messages
- **Backend**: Look for request logs with morgan middleware and error details

## 🔒 Security Notes

- JWT_SECRET should be changed in production
- FRONTEND_URL should match your production frontend URL
- CORS should be restricted to known origins in production
- Never commit real secrets to version control

---

**Last Updated**: December 30, 2025
**Status**: ✅ All Integration Points Verified
