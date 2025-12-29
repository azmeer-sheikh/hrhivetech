# HR Portal Backend - Quick Reference Guide

## ⚡ Quick Start (2 Minutes)

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Start MongoDB (separate terminal)
mongod

# 4. Start development server
npm run dev

# 5. Server runs on http://localhost:5000
```

---

## 🔧 Common Commands

```bash
# Development
npm run dev          # Start with hot-reload (nodemon)

# Production
npm start            # Start without hot-reload

# Database
npm run seed         # Seed sample data

# Testing
npm test             # Run tests (when configured)
```

---

## 📚 Files & Folders Quick Map

| Path | Purpose |
|------|---------|
| `src/server.js` | Main Express server |
| `src/config/database.js` | MongoDB connection |
| `src/models/` | Data models (10 files) |
| `src/controllers/` | Business logic (12 files) |
| `src/routes/` | API endpoints (12 files) |
| `src/middleware/` | Auth, error handling, validation |
| `src/utils/helpers.js` | Utility functions |
| `seed.js` | Database seeding |
| `.env` | Environment variables |

---

## 🔐 Default Test Credentials

```
Admin Account:
- Email: admin@hr-portal.com
- Password: admin123
- Role: admin

HR Account:
- Email: hr@hr-portal.com
- Password: hr123
- Role: hr

(After running: npm run seed)
```

---

## 🌐 API Base URL

```
http://localhost:5000/api
```

---

## 🔌 All API Endpoints (57+)

### Authentication (6)
```
POST   /auth/register          - Register user
POST   /auth/login             - Login user
GET    /auth/me                - Get current user
PUT    /auth/updatedetails     - Update profile
PUT    /auth/updatepassword    - Change password
POST   /auth/logout            - Logout
```

### Employees (6)
```
GET    /employees              - Get all employees
GET    /employees/stats/overview - Get statistics
GET    /employees/:id          - Get single employee
POST   /employees              - Create employee (Admin/HR)
PUT    /employees/:id          - Update employee (Admin/HR)
DELETE /employees/:id          - Delete employee (Admin/HR)
```

### Attendance (5)
```
GET    /attendance             - Get records
GET    /attendance/:id         - Get single record
POST   /attendance             - Mark attendance
PUT    /attendance/:id         - Update record
DELETE /attendance/:id         - Delete record
```

### Leaves (7)
```
GET    /leaves                 - Get all requests
GET    /leaves/:id             - Get single request
POST   /leaves                 - Create request
PUT    /leaves/:id             - Update request
DELETE /leaves/:id             - Cancel request
PUT    /leaves/:id/approve     - Approve (Manager/Admin)
PUT    /leaves/:id/reject      - Reject (Manager/Admin)
```

### Payroll (5)
```
GET    /payroll                - Get records
GET    /payroll/:id            - Get single record
POST   /payroll                - Create payroll
PUT    /payroll/:id            - Update payroll
DELETE /payroll/:id            - Delete payroll
```

### Performance (5)
```
GET    /performance            - Get reviews
GET    /performance/:id        - Get single review
POST   /performance            - Create review
PUT    /performance/:id        - Update review
DELETE /performance/:id        - Delete review
```

### Interviews (5)
```
GET    /interviews             - Get all interviews
GET    /interviews/:id         - Get single interview
POST   /interviews             - Create interview
PUT    /interviews/:id         - Update interview
DELETE /interviews/:id         - Delete interview
```

### Documents (3)
```
GET    /documents              - Get all documents
POST   /documents              - Upload document
DELETE /documents/:id          - Delete document
```

### Announcements (4)
```
GET    /announcements          - Get all
POST   /announcements          - Create (Admin/HR)
PUT    /announcements/:id      - Update (Admin/HR)
DELETE /announcements/:id      - Delete (Admin/HR)
```

### Holidays (4)
```
GET    /holidays               - Get holidays
POST   /holidays               - Create (Admin)
PUT    /holidays/:id           - Update (Admin)
DELETE /holidays/:id           - Delete (Admin)
```

### Analytics (3)
```
GET    /analytics/dashboard    - Dashboard data
GET    /analytics/attendance   - Attendance analytics
GET    /analytics/payroll      - Payroll analytics
```

### Users (4)
```
GET    /users                  - Get all (Admin)
POST   /users                  - Create (Admin)
PUT    /users/:id              - Update (Admin)
DELETE /users/:id              - Delete (Admin)
```

---

## 🔑 Authentication Header

```
Authorization: Bearer <your_jwt_token>
```

Example:
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:5000/api/auth/me
```

---

## 📊 Database Models (10)

1. **User** - Users with roles
2. **Employee** - Employee information
3. **Attendance** - Daily attendance records
4. **Leave** - Leave requests
5. **Payroll** - Salary information
6. **Performance** - Performance reviews
7. **Interview** - Interview records
8. **Document** - File uploads
9. **Announcement** - Company announcements
10. **Holiday** - Holiday calendar

---

## 🔒 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **admin** | Full system access |
| **hr** | Employee management, leave approvals |
| **manager** | Team management, leave approvals |
| **employee** | Personal data, leave requests |

---

## 🧪 Testing Endpoints

### Using Postman
1. Import: `HR_Portal_API.postman_collection.json`
2. Set variable `token` after login
3. Run requests

### Using cURL (Login Example)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hr-portal.com",
    "password": "admin123"
  }'
```

### Using REST Client (VS Code)
Create `.http` file:
```http
### Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@hr-portal.com",
  "password": "admin123"
}
```

---

## 📋 Request/Response Examples

### Register
```bash
POST /api/auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "employee"
}
```

### Login
```bash
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "employee",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Create Employee
```bash
POST /api/employees
Authorization: Bearer <admin_or_hr_token>

{
  "employeeCode": "EMP001",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+1234567890",
  "dateOfBirth": "1992-05-20",
  "gender": "Female",
  "department": "Engineering",
  "position": "Software Engineer",
  "joiningDate": "2024-01-15"
}
```

### Create Leave Request
```bash
POST /api/leaves
Authorization: Bearer <employee_token>

{
  "leaveType": "Annual Leave",
  "fromDate": "2024-12-30",
  "toDate": "2025-01-03",
  "reason": "Family vacation"
}
```

---

## 🚨 Common Issues & Solutions

### MongoDB Connection Error
```
Problem: Cannot connect to MongoDB
Solution: 
1. Verify MongoDB is running (mongod)
2. Check MONGODB_URI in .env
3. Ensure MongoDB is on port 27017
```

### Port Already in Use
```
Problem: Port 5000 is in use
Solution:
# Kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :5000
kill -9 <PID>
```

### JWT Token Expired
```
Problem: Token is invalid
Solution:
1. Login again to get new token
2. Update JWT_EXPIRE in .env
3. Verify JWT_SECRET is set
```

### Dependency Issues
```
Problem: npm install fails
Solution:
1. Clear cache: npm cache clean --force
2. Delete node_modules: rm -rf node_modules
3. Reinstall: npm install
```

---

## 📖 Documentation Files

| File | Contents |
|------|----------|
| `README.md` | Project overview |
| `STARTUP_GUIDE.md` | Detailed setup instructions |
| `API_DOCS.md` | API documentation |
| `API_TESTING_GUIDE.md` | Testing examples |
| `PROJECT_OVERVIEW.md` | Complete project details |
| `QUICK_REFERENCE.md` | This file |

---

## 🔄 Development Workflow

1. **Start MongoDB**: `mongod`
2. **Start Server**: `npm run dev`
3. **Test API**: Use Postman or cURL
4. **Check Logs**: Terminal shows Morgan logs
5. **Debug**: Use VS Code debugger or console.log

---

## 🎯 Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hr-portal
JWT_SECRET=your_secure_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_password
```

---

## 📞 Support

1. **Read Documentation**: Check the `.md` files
2. **Check API Docs**: See `API_DOCS.md`
3. **Test with Examples**: Use `API_TESTING_GUIDE.md`
4. **Import Postman**: Use `HR_Portal_API.postman_collection.json`
5. **Check Errors**: Review server logs in terminal

---

## ✅ What You Have

✅ 57+ ready-to-use API endpoints
✅ 10 complete data models
✅ Full authentication & authorization
✅ Comprehensive documentation
✅ Testing guide with examples
✅ Postman collection
✅ Sample data seeding
✅ Production-ready code
✅ Security best practices
✅ Error handling

---

## 🚀 Next Steps

1. Start the server: `npm run dev`
2. Login with test credentials
3. Test endpoints with Postman
4. Review `API_TESTING_GUIDE.md` for examples
5. Connect frontend to backend
6. Customize according to needs

---

**Ready to use!** 🎉

For detailed information, refer to the complete documentation files in the project.

---

*Last Updated: December 29, 2025*
