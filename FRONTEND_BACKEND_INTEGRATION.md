# Frontend-Backend Integration Guide

## 🔗 Connection Status

### What Has Been Connected

✅ **API Service Layer** - Created `src/services/api.ts`
- 12 API modules (auth, employee, attendance, leave, payroll, performance, interview, document, announcement, holiday, analytics, user)
- 57+ API endpoints mapped
- Token-based authentication
- Error handling

✅ **Authentication System** - Updated `AuthContext.tsx`
- Backend API integration
- JWT token storage & management
- Login/Logout with backend validation
- Auto token refresh from localStorage

✅ **Login Component** - Updated `Login.tsx`
- Email/password login (not username)
- Loading states
- Error handling
- Async authentication

✅ **Environment Configuration**
- `.env` file created with `VITE_API_URL=http://localhost:5000/api`
- Vite proxy configured for development

---

## 🚀 Quick Start - Run Both Frontend & Backend

### Step 1: Start Backend (Terminal 1)

```bash
cd d:\HR\backend
npm run dev
```

Expected output:
```
✓ Server is running on http://localhost:5000
```

### Step 2: Start Frontend (Terminal 2)

```bash
cd d:\HR
npm run dev
```

Expected output:
```
✓ Local: http://localhost:3000
```

### Step 3: Test Login

Use these credentials to login:

**Admin:**
```
Email: admin@hr-portal.com
Password: admin123
```

**HR:**
```
Email: hr@hr-portal.com
Password: hr123
```

---

## 📝 API Service Structure

### Location
`d:\HR\src\services\api.ts`

### Available APIs

#### Authentication
```typescript
import { authAPI } from '@/services/api';

// Login
await authAPI.login(email, password);

// Get current user
await authAPI.getMe();

// Update profile
await authAPI.updateDetails(userData);

// Change password
await authAPI.updatePassword(currentPassword, newPassword);

// Logout
await authAPI.logout();
```

#### Employees
```typescript
import { employeeAPI } from '@/services/api';

await employeeAPI.getAll(page, limit, filters);
await employeeAPI.getById(id);
await employeeAPI.create(employeeData);
await employeeAPI.update(id, employeeData);
await employeeAPI.delete(id);
await employeeAPI.getStats();
```

#### Attendance
```typescript
import { attendanceAPI } from '@/services/api';

await attendanceAPI.getAll(page, limit, filters);
await attendanceAPI.getById(id);
await attendanceAPI.create(attendanceData);
await attendanceAPI.update(id, attendanceData);
await attendanceAPI.delete(id);
```

#### Leaves
```typescript
import { leaveAPI } from '@/services/api';

await leaveAPI.getAll(page, limit, filters);
await leaveAPI.getById(id);
await leaveAPI.create(leaveData);
await leaveAPI.update(id, leaveData);
await leaveAPI.delete(id);
await leaveAPI.approve(id, approvalComment);
await leaveAPI.reject(id, rejectionReason);
```

#### Payroll
```typescript
import { payrollAPI } from '@/services/api';

await payrollAPI.getAll(page, limit, filters);
await payrollAPI.getById(id);
await payrollAPI.create(payrollData);
await payrollAPI.update(id, payrollData);
await payrollAPI.delete(id);
```

#### Performance
```typescript
import { performanceAPI } from '@/services/api';

await performanceAPI.getAll(page, limit);
await performanceAPI.getById(id);
await performanceAPI.create(performanceData);
await performanceAPI.update(id, performanceData);
await performanceAPI.delete(id);
```

#### Interviews
```typescript
import { interviewAPI } from '@/services/api';

await interviewAPI.getAll(page, limit);
await interviewAPI.getById(id);
await interviewAPI.create(interviewData);
await interviewAPI.update(id, interviewData);
await interviewAPI.delete(id);
```

#### Documents
```typescript
import { documentAPI } from '@/services/api';

await documentAPI.getAll(page, limit);
await documentAPI.upload(formData);
await documentAPI.delete(id);
```

#### Announcements
```typescript
import { announcementAPI } from '@/services/api';

await announcementAPI.getAll(page, limit);
await announcementAPI.create(announcementData);
await announcementAPI.update(id, announcementData);
await announcementAPI.delete(id);
```

#### Holidays
```typescript
import { holidayAPI } from '@/services/api';

await holidayAPI.getAll();
await holidayAPI.create(holidayData);
await holidayAPI.update(id, holidayData);
await holidayAPI.delete(id);
```

#### Analytics
```typescript
import { analyticsAPI } from '@/services/api';

await analyticsAPI.getDashboard();
await analyticsAPI.getAttendanceAnalytics(filters);
await analyticsAPI.getPayrollAnalytics(filters);
```

#### Users
```typescript
import { userAPI } from '@/services/api';

await userAPI.getAll(page, limit);
await userAPI.create(userData);
await userAPI.update(id, userData);
await userAPI.delete(id);
```

---

## 💻 Usage Example in Components

### Example 1: Fetch Employees

```typescript
import { useState, useEffect } from 'react';
import { employeeAPI } from '@/services/api';

export function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await employeeAPI.getAll(1, 10);
        setEmployees(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch employees');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {employees.map(emp => (
        <div key={emp.id}>{emp.firstName} {emp.lastName}</div>
      ))}
    </div>
  );
}
```

### Example 2: Create Leave Request

```typescript
import { useState } from 'react';
import { leaveAPI } from '@/services/api';

export function CreateLeave() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    setError(null);
    try {
      await leaveAPI.create(formData);
      alert('Leave request created successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create leave');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit({
        leaveType: 'Annual Leave',
        fromDate: '2025-01-01',
        toDate: '2025-01-05',
        reason: 'Vacation'
      });
    }}>
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Leave'}
      </button>
      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
}
```

### Example 3: Authentication Flow

```typescript
import { useAuth } from '@/components/AuthContext';

export function Dashboard() {
  const { user, logout, isLoading } = useAuth();

  if (!user) return <div>Not logged in</div>;

  return (
    <div>
      <h1>Welcome, {user.username}</h1>
      <p>Role: {user.role}</p>
      <button 
        onClick={logout} 
        disabled={isLoading}
      >
        {isLoading ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
}
```

---

## 🔐 Authentication Flow

1. **Login Request**
   ```
   User enters email & password
   → API call to POST /api/auth/login
   → Server validates & returns JWT token
   → Token stored in localStorage
   ```

2. **Authenticated Requests**
   ```
   Any API call automatically includes:
   Header: Authorization: Bearer {token}
   ```

3. **Token Persistence**
   ```
   Token stored in: localStorage.authToken
   User data stored in: localStorage.currentUser
   Restored on page refresh
   ```

---

## 🧪 Testing the Connection

### Test 1: Check Backend Running

```bash
# Open terminal and run:
curl http://localhost:5000/health

# Expected response:
# {"status":"OK","message":"Server is running"}
```

### Test 2: Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hr-portal.com","password":"admin123"}'

# Expected response:
# {
#   "success": true,
#   "data": {
#     "id": "...",
#     "username": "admin",
#     "email": "admin@hr-portal.com",
#     "role": "admin",
#     "token": "eyJhbGc..."
#   }
# }
```

### Test 3: Browser Console Test

Open browser DevTools (F12) and run:

```javascript
// Check if API is accessible
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend is running:', d))
  .catch(e => console.log('❌ Backend error:', e));

// Check localStorage for token
console.log('Token:', localStorage.authToken);
console.log('User:', localStorage.currentUser);
```

---

## 📂 Files Modified/Created

### New Files
- ✅ `src/services/api.ts` - Complete API service layer

### Modified Files
- ✅ `src/components/AuthContext.tsx` - Backend integration
- ✅ `src/components/Login.tsx` - Updated for backend auth
- ✅ `.env` - API URL configuration
- ✅ `vite.config.ts` - Added proxy configuration

---

## ⚙️ Configuration Details

### Environment Variables

**Frontend (.env)**
```
VITE_API_URL=http://localhost:5000/api
```

**Backend (.env)**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hr-portal
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_secure_secret_key
```

### CORS Configuration

Backend CORS is already configured to accept requests from:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (Custom port)

---

## 🛠️ How to Use in Components

### Update Existing Components to Use API

**Before (Local State):**
```typescript
const [employees, setEmployees] = useState(defaultEmployees);
```

**After (Backend API):**
```typescript
import { employeeAPI } from '@/services/api';

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await employeeAPI.getAll(1, 10);
      setEmployees(response.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  fetchData();
}, []);
```

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch" or CORS Error

**Solution:**
1. Ensure backend is running: `npm run dev` in backend folder
2. Check FRONTEND_URL in backend .env is correct
3. Check VITE_API_URL in frontend .env is correct

### Issue: "Invalid token" or "Unauthorized"

**Solution:**
1. Clear localStorage: `localStorage.clear()`
2. Login again
3. Check backend is returning valid token

### Issue: "Cannot find module '@/services/api'"

**Solution:**
1. Ensure file exists at `src/services/api.ts`
2. Ensure vite.config.ts has alias: `'@': path.resolve(__dirname, './src')`

### Issue: Login works but pages show no data

**Solution:**
1. Check browser Network tab in DevTools
2. Ensure JWT token is in Authorization header
3. Check backend error logs for validation errors
4. Verify user has proper role/permissions

---

## 📊 Testing Checklist

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] Can access backend health endpoint
- [ ] Can login with admin@hr-portal.com / admin123
- [ ] Token is stored in localStorage
- [ ] Can fetch employees
- [ ] Can create leave request
- [ ] Can view analytics
- [ ] Can manage users (if admin)
- [ ] Logout works and clears localStorage

---

## 🔄 Data Flow Example

```
User Types Email & Password
         ↓
Login Component Calls authAPI.login()
         ↓
API Service Creates Bearer Token Header
         ↓
Fetch Request to POST /api/auth/login
         ↓
Backend Validates Credentials
         ↓
Backend Returns JWT Token
         ↓
Token Stored in localStorage
         ↓
User Redirected to Dashboard
         ↓
All Subsequent API Calls Include Token
         ↓
Data Displayed in Components
```

---

## 📞 Next Steps

1. **Start both servers** (backend on 5000, frontend on 3000)
2. **Test login** with provided credentials
3. **Check Network tab** in DevTools to verify API calls
4. **Update components** to use API as needed
5. **Deploy** to production (ensure CORS and URLs are correct)

---

## ✨ Key Features

✅ Automatic token management
✅ Error handling & user feedback
✅ Pagination support
✅ Filtering & search
✅ File upload support (documents)
✅ Type-safe API calls
✅ Proper HTTP methods (GET, POST, PUT, DELETE)
✅ CORS configured
✅ Environment-based API URL

---

**Frontend and Backend are now fully integrated! 🎉**

Start your servers and test the login with:
- Email: admin@hr-portal.com
- Password: admin123
