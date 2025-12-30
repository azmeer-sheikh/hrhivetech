# Development Guide - Frontend-Backend Integration

## Overview

This guide covers the complete setup, configuration, and operation of the HR Portal system with full frontend-backend integration.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     HR Portal System                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐         ┌──────────────────────────┐ │
│  │   Frontend (React)   │         │   Backend (Express.js)   │ │
│  │  Port: 5173/3000     │         │   Port: 5000             │ │
│  │  ├─ Components       │         │   ├─ Routes             │ │
│  │  ├─ Services (API)   │◄────────┤   ├─ Controllers        │ │
│  │  ├─ Styles          │   HTTP  │   ├─ Models (Mongoose)  │ │
│  │  └─ Assets          │         │   ├─ Middleware         │ │
│  │                      │         │   └─ Utils              │ │
│  └──────────────────────┘         └──────────────────────────┘ │
│                                              │                  │
│                                              ▼                  │
│                                    ┌──────────────────┐        │
│                                    │  MongoDB         │        │
│                                    │  Port: 27017     │        │
│                                    └──────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Development Environment Setup

### 1. Install Node.js and npm

Download from https://nodejs.org/ (LTS version recommended)

Verify installation:
```bash
node --version
npm --version
```

### 2. Install MongoDB

Option A: Local Installation
- Download from https://www.mongodb.com/try/download/community
- Install and start MongoDB service

Option B: MongoDB Atlas (Cloud)
- Create account at https://www.mongodb.com/cloud/atlas
- Create a cluster and get connection string

### 3. Clone/Setup Project

```bash
cd d:\HR
npm install        # Install frontend dependencies
cd backend
npm install        # Install backend dependencies
```

### 4. Configure Environment Variables

**Backend (.env):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hr-portal
JWT_SECRET=your_development_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
```

## Starting the Application

### Terminal 1: Backend Server

```bash
cd d:\HR\backend
npm run dev
```

Expected output:
```
Server running in development mode on port 5000
✓ MongoDB connected successfully
```

### Terminal 2: Frontend Development Server

```bash
cd d:\HR
npm run dev
```

Expected output:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Access the Application

Open your browser and navigate to:
- Frontend: http://localhost:5173
- API: http://localhost:5000/api
- Health Check: http://localhost:5000/health

## API Integration Flow

### 1. Authentication Flow

```javascript
// User submits login form
┌─────────┐
│ User    │
│ Login   │
└────┬────┘
     │
     ▼
┌──────────────────────────────────────────┐
│ Frontend: AuthContext.login()            │
│ ├─ Validates input                       │
│ ├─ Calls authAPI.login()                 │
│ └─ Stores token in localStorage          │
└────┬─────────────────────────────────────┘
     │ POST /api/auth/login
     ▼
┌──────────────────────────────────────────┐
│ Backend: authController.login()          │
│ ├─ Verifies credentials                  │
│ ├─ Generates JWT token                   │
│ └─ Returns user data + token             │
└──────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────┐
│ Frontend stores:           │
│ ├─ authToken (localStorage)│
│ ├─ currentUser (localStorage)
│ └─ Redirects to dashboard  │
└────────────────────────────┘
```

### 2. Protected API Request Flow

```javascript
// Frontend makes API call
┌─────────────────────────────────┐
│ Frontend: employeeAPI.getAll()  │
│ ├─ Reads token from localStorage│
│ ├─ Adds to Authorization header │
│ └─ Makes fetch request          │
└────┬────────────────────────────┘
     │ GET /api/employees
     │ Authorization: Bearer <token>
     ▼
┌──────────────────────────────────┐
│ Backend: protect middleware      │
│ ├─ Extracts token               │
│ ├─ Verifies JWT signature       │
│ ├─ Loads user from DB           │
│ └─ Passes to controller         │
└────┬──────────────────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│ Backend: employeeController      │
│ ├─ Queries database             │
│ └─ Returns employees list       │
└────┬──────────────────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│ Frontend receives response       │
│ ├─ Parses JSON                  │
│ ├─ Updates component state      │
│ └─ Re-renders with data         │
└──────────────────────────────────┘
```

## Component Communication Pattern

### Example: Employee Management Component

```typescript
// src/components/EmployeeManagement.tsx

import { employeeAPI } from '../services/api';

export function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load employees on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch from backend
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeAPI.getAll(1, 10);
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new employee
  const handleCreate = async (formData) => {
    try {
      const response = await employeeAPI.create(formData);
      setEmployees([...employees, response.data]);
    } catch (error) {
      console.error('Failed to create employee:', error);
    }
  };

  // Update employee
  const handleUpdate = async (id, formData) => {
    try {
      const response = await employeeAPI.update(id, formData);
      setEmployees(employees.map(e => e.id === id ? response.data : e));
    } catch (error) {
      console.error('Failed to update employee:', error);
    }
  };

  // Delete employee
  const handleDelete = async (id) => {
    try {
      await employeeAPI.delete(id);
      setEmployees(employees.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete employee:', error);
    }
  };

  // ... rest of component
}
```

## Debugging Tips

### Browser Console Debugging

```javascript
// In browser console, you can:

// 1. Check token
localStorage.getItem('authToken')

// 2. Check current user
JSON.parse(localStorage.getItem('currentUser'))

// 3. Make API calls directly
fetch('http://localhost:5000/api/employees', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    'Content-Type': 'application/json'
  }
}).then(r => r.json()).then(d => console.log(d))

// 4. Clear storage (for testing)
localStorage.clear()
sessionStorage.clear()
```

### Backend Debugging

```javascript
// Enable detailed logging in server.js
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Already configured
  
  // Add custom logging
  app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.path}`);
    console.log('Query:', req.query);
    console.log('Body:', req.body);
    next();
  });
}

// Check MongoDB connection
console.log('MongoDB URI:', process.env.MONGODB_URI);

// Verify JWT token
const jwt = require('jsonwebtoken');
const token = 'your_token_here';
console.log('Decoded token:', jwt.decode(token));
```

### Network Debugging

Use browser DevTools (F12) → Network tab:
1. Check request URL is correct
2. Verify headers include Authorization token
3. Check response status code
4. Review response body for error messages
5. Check CORS headers in response

## Common Issues and Solutions

### Issue 1: "Cannot POST /api/employees"
**Cause**: Route not registered in backend
**Solution**: 
- Verify route exists in `backend/src/routes/employeeRoutes.js`
- Ensure route is mounted in `backend/src/server.js`
- Restart backend server

### Issue 2: "401 Unauthorized"
**Cause**: Invalid or missing JWT token
**Solution**:
- Check token exists in localStorage
- Verify token is valid (check expiration)
- Re-login to get fresh token
- Check JWT_SECRET matches in .env

### Issue 3: "CORS error: Access denied"
**Cause**: Frontend URL not in CORS allowed list
**Solution**:
- Update FRONTEND_URL in backend .env
- Verify allowed origins list in server.js includes your frontend port
- Restart backend server

### Issue 4: "Cannot connect to localhost:5000"
**Cause**: Backend server not running
**Solution**:
- Run `npm run dev` in backend directory
- Verify port 5000 is not in use
- Check firewall settings
- Review backend error logs

### Issue 5: "MongooseError: Connection refused"
**Cause**: MongoDB not running or wrong connection string
**Solution**:
- Start MongoDB service
- Verify MONGODB_URI in .env
- Test with MongoDB Compass connection
- Check MongoDB is listening on port 27017

## Adding New API Endpoints

### Step 1: Create Backend Route

```javascript
// backend/src/routes/customRoutes.js
const express = require('express');
const router = express.Router();
const { customController } = require('../controllers/customController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', customController.getAll);
router.post('/', customController.create);

module.exports = router;
```

### Step 2: Register in Server

```javascript
// backend/src/server.js
const customRoutes = require('./routes/customRoutes');
app.use('/api/custom', customRoutes);
```

### Step 3: Add Frontend API Service

```typescript
// src/services/api.ts
export const customAPI = {
  getAll: async () => {
    return apiCall('/custom', { method: 'GET' });
  },
  create: async (data: Record<string, any>) => {
    return apiCall('/custom', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
```

### Step 4: Use in Frontend Component

```typescript
// src/components/CustomComponent.tsx
import { customAPI } from '../services/api';

export function CustomComponent() {
  const [data, setData] = useState([]);

  useEffect(() => {
    customAPI.getAll().then(response => setData(response.data));
  }, []);

  return (
    // ... component JSX
  );
}
```

## Performance Optimization

### Frontend Optimization
- Use React.memo for expensive components
- Implement pagination for large lists
- Lazy load images and components
- Minimize bundle size with code splitting
- Use caching strategies for API responses

### Backend Optimization
- Add database indexes on frequently queried fields
- Implement pagination in API responses
- Use compression middleware (already enabled)
- Optimize database queries with lean()
- Implement caching for frequently accessed data

## Testing

### API Testing with cURL

```bash
# Test health check
curl http://localhost:5000/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hr-portal.com","password":"admin123"}'

# Test protected route
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/employees
```

### API Testing with Postman

1. Import `backend/HR_Portal_API.postman_collection.json`
2. Set variables:
   - `base_url`: http://localhost:5000
   - `token`: (auto-set from login)
3. Run requests in collection

## Production Deployment

### Before Deployment

1. **Environment Variables**
   - Update FRONTEND_URL to production domain
   - Use strong JWT_SECRET
   - Configure production database URI
   - Set NODE_ENV=production

2. **Security**
   - Enable HTTPS
   - Restrict CORS origins
   - Implement rate limiting
   - Add input validation
   - Update dependencies

3. **Performance**
   - Enable caching headers
   - Minify and bundle frontend
   - Optimize database queries
   - Use CDN for static assets

4. **Monitoring**
   - Setup error logging
   - Monitor API performance
   - Track server metrics
   - Setup alerts

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Authentication Guide](https://jwt.io/introduction)

---

**Last Updated**: December 30, 2025  
**Version**: 1.0.0
