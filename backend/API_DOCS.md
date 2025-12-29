# HR Portal API - Complete Endpoint Reference

Base URL: `http://localhost:5000/api`

## Authentication Required

All endpoints (except login/register) require a valid JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "employee"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@hr-portal.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "username": "admin",
    "email": "admin@hr-portal.com",
    "role": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer YOUR_TOKEN
```

### Update User Details
```http
PUT /auth/updatedetails
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "username": "new_username",
  "email": "newemail@example.com"
}
```

### Update Password
```http
PUT /auth/updatepassword
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer YOUR_TOKEN
```

---

## 👥 User Management (Admin Only)

### Get All Users
```http
GET /users?page=1&limit=10&search=john&role=employee&isActive=true
Authorization: Bearer ADMIN_TOKEN
```

### Get User by ID
```http
GET /users/:id
Authorization: Bearer ADMIN_TOKEN
```

### Create User
```http
POST /users
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "username": "jane_doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "hr",
  "employeeId": "employee_id_here"
}
```

### Update User
```http
PUT /users/:id
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "username": "updated_username",
  "role": "manager",
  "isActive": true
}
```

### Delete User
```http
DELETE /users/:id
Authorization: Bearer ADMIN_TOKEN
```

### Toggle User Status
```http
PATCH /users/:id/toggle-status
Authorization: Bearer ADMIN_TOKEN
```

### Reset User Password
```http
PATCH /users/:id/reset-password
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "newPassword": "newpassword123"
}
```

### Get User Statistics
```http
GET /users/stats/overview
Authorization: Bearer ADMIN_TOKEN
```

---

## 👨‍💼 Employee Management

### Get All Employees
```http
GET /employees?page=1&limit=10&search=john&department=Engineering&status=Active
Authorization: Bearer YOUR_TOKEN
```

### Get Employee by ID
```http
GET /employees/:id
Authorization: Bearer YOUR_TOKEN
```

### Create Employee (Admin/HR)
```http
POST /employees
Authorization: Bearer ADMIN_OR_HR_TOKEN
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-15",
  "gender": "Male",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "department": "Engineering",
  "position": "Software Engineer",
  "employmentType": "Full-time",
  "joiningDate": "2024-01-01",
  "salary": 75000,
  "salaryType": "Annual",
  "createUserAccount": true,
  "password": "employee123"
}
```

### Update Employee (Admin/HR)
```http
PUT /employees/:id
Authorization: Bearer ADMIN_OR_HR_TOKEN
Content-Type: application/json

{
  "position": "Senior Software Engineer",
  "salary": 85000,
  "status": "Active"
}
```

### Delete Employee (Admin/HR)
```http
DELETE /employees/:id
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

### Get Employee Statistics
```http
GET /employees/stats/overview
Authorization: Bearer YOUR_TOKEN
```

---

## ⏰ Attendance Management

### Get Attendance Records
```http
GET /attendance?page=1&limit=10&employeeId=xxx&startDate=2024-01-01&endDate=2024-01-31&status=Present
Authorization: Bearer YOUR_TOKEN
```

### Check In
```http
POST /attendance/check-in
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "employeeId": "employee_id_here",
  "location": {
    "lat": 40.7128,
    "lng": -74.0060
  }
}
```

### Check Out
```http
POST /attendance/check-out
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "employeeId": "employee_id_here",
  "location": {
    "lat": 40.7128,
    "lng": -74.0060
  }
}
```

### Get Employee Attendance
```http
GET /attendance/employee/:employeeId?month=1&year=2024
Authorization: Bearer YOUR_TOKEN
```

### Get Attendance Summary
```http
GET /attendance/summary/stats
Authorization: Bearer YOUR_TOKEN
```

### Update Attendance (Admin/HR)
```http
PUT /attendance/:id
Authorization: Bearer ADMIN_OR_HR_TOKEN
Content-Type: application/json

{
  "status": "Present",
  "notes": "Corrected attendance"
}
```

---

## 🏖️ Leave Management

### Get All Leaves
```http
GET /leaves?page=1&limit=10&employeeId=xxx&status=Pending&leaveType=Sick Leave
Authorization: Bearer YOUR_TOKEN
```

### Create Leave Request
```http
POST /leaves
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "employee": "employee_id_here",
  "leaveType": "Sick Leave",
  "startDate": "2024-02-01",
  "endDate": "2024-02-03",
  "reason": "Medical appointment",
  "isHalfDay": false
}
```

### Get Leave by ID
```http
GET /leaves/:id
Authorization: Bearer YOUR_TOKEN
```

### Update Leave
```http
PUT /leaves/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "reason": "Updated reason",
  "endDate": "2024-02-04"
}
```

### Delete Leave
```http
DELETE /leaves/:id
Authorization: Bearer YOUR_TOKEN
```

### Approve Leave (Admin/HR/Manager)
```http
PATCH /leaves/:id/approve
Authorization: Bearer ADMIN_OR_HR_OR_MANAGER_TOKEN
```

### Reject Leave (Admin/HR/Manager)
```http
PATCH /leaves/:id/reject
Authorization: Bearer ADMIN_OR_HR_OR_MANAGER_TOKEN
Content-Type: application/json

{
  "reason": "Insufficient leave balance"
}
```

### Get Leave Balance
```http
GET /leaves/balance/:employeeId
Authorization: Bearer YOUR_TOKEN
```

---

## 💰 Payroll Management (Admin/HR)

### Get All Payroll Records
```http
GET /payroll?page=1&limit=10&employeeId=xxx&month=1&year=2024&status=Paid
Authorization: Bearer YOUR_TOKEN
```

### Create Payroll
```http
POST /payroll
Authorization: Bearer ADMIN_OR_HR_TOKEN
Content-Type: application/json

{
  "employeeId": "employee_id_here",
  "month": 1,
  "year": 2024,
  "baseSalary": 75000,
  "allowances": {
    "houseRent": 10000,
    "transport": 5000,
    "medical": 3000
  },
  "deductions": {
    "tax": 15000,
    "providentFund": 5000
  },
  "overtime": {
    "hours": 10,
    "rate": 50
  },
  "bonus": 5000,
  "paymentMethod": "Bank Transfer"
}
```

### Get Payroll by ID
```http
GET /payroll/:id
Authorization: Bearer YOUR_TOKEN
```

### Update Payroll
```http
PUT /payroll/:id
Authorization: Bearer ADMIN_OR_HR_TOKEN
Content-Type: application/json

{
  "bonus": 8000,
  "status": "Processed"
}
```

### Process Payroll (Mark as Paid)
```http
PATCH /payroll/:id/process
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

### Get Payroll Summary
```http
GET /payroll/summary/stats?month=1&year=2024
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

---

## 📊 Performance Management

### Get All Performance Reviews
```http
GET /performance?page=1&limit=10&employeeId=xxx&reviewType=Annual&status=Completed
Authorization: Bearer YOUR_TOKEN
```

### Create Performance Review (Admin/HR/Manager)
```http
POST /performance
Authorization: Bearer ADMIN_OR_HR_OR_MANAGER_TOKEN
Content-Type: application/json

{
  "employee": "employee_id_here",
  "reviewPeriod": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  },
  "reviewType": "Annual",
  "ratings": {
    "workQuality": 4,
    "productivity": 5,
    "communication": 4,
    "teamwork": 5,
    "punctuality": 4,
    "initiative": 4,
    "leadership": 3,
    "problemSolving": 5
  },
  "strengths": ["Strong technical skills", "Good team player"],
  "areasForImprovement": ["Time management"],
  "achievements": ["Completed major project"],
  "goals": [
    {
      "description": "Learn new technology",
      "deadline": "2024-06-30",
      "status": "Not Started"
    }
  ],
  "comments": "Excellent performance overall"
}
```

### Get Performance Review by ID
```http
GET /performance/:id
Authorization: Bearer YOUR_TOKEN
```

### Get Employee Performance History
```http
GET /performance/employee/:employeeId
Authorization: Bearer YOUR_TOKEN
```

### Update Performance Review
```http
PUT /performance/:id
Authorization: Bearer ADMIN_OR_HR_OR_MANAGER_TOKEN
Content-Type: application/json

{
  "status": "Completed",
  "comments": "Updated feedback"
}
```

### Acknowledge Review (Employee)
```http
PATCH /performance/:id/acknowledge
Authorization: Bearer EMPLOYEE_TOKEN
Content-Type: application/json

{
  "employeeComments": "Thank you for the feedback"
}
```

---

## 🎤 Interview Management (Admin/HR)

### Get All Interviews
```http
GET /interviews?page=1&limit=10&status=Scheduled&position=Software Engineer&department=Engineering
Authorization: Bearer YOUR_TOKEN
```

### Schedule Interview
```http
POST /interviews
Authorization: Bearer ADMIN_OR_HR_TOKEN
Content-Type: application/json

{
  "candidateName": "Jane Smith",
  "candidateEmail": "jane.smith@email.com",
  "candidatePhone": "+1234567890",
  "position": "Software Engineer",
  "department": "Engineering",
  "interviewDate": "2024-02-15",
  "interviewTime": "10:00 AM",
  "interviewType": "Video Call",
  "interviewers": ["user_id_1", "user_id_2"],
  "meetingLink": "https://meet.google.com/xxx",
  "experience": 3,
  "expectedSalary": 80000,
  "noticePeriod": "30 days",
  "resume": "https://link-to-resume.pdf"
}
```

### Get Interview by ID
```http
GET /interviews/:id
Authorization: Bearer YOUR_TOKEN
```

### Update Interview
```http
PUT /interviews/:id
Authorization: Bearer ADMIN_OR_HR_TOKEN
Content-Type: application/json

{
  "interviewDate": "2024-02-16",
  "status": "Rescheduled"
}
```

### Update Interview Status
```http
PATCH /interviews/:id/status
Authorization: Bearer ADMIN_OR_HR_OR_MANAGER_TOKEN
Content-Type: application/json

{
  "status": "Completed"
}
```

### Submit Interview Evaluation
```http
PATCH /interviews/:id/evaluate
Authorization: Bearer ADMIN_OR_HR_OR_MANAGER_TOKEN
Content-Type: application/json

{
  "evaluation": {
    "technicalSkills": 4,
    "communication": 5,
    "problemSolving": 4,
    "cultureFit": 5,
    "overallRating": 4.5
  },
  "feedback": "Strong candidate with excellent skills",
  "recommendation": "Strongly Recommended"
}
```

### Get Interview Statistics
```http
GET /interviews/stats/overview
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

---

## 📄 Document Management

### Get All Documents
```http
GET /documents?page=1&limit=10&employeeId=xxx&documentType=Contract&search=offer
Authorization: Bearer YOUR_TOKEN
```

### Upload Document
```http
POST /documents
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Employment Contract",
  "description": "Initial employment contract",
  "documentType": "Contract",
  "fileName": "contract.pdf",
  "fileUrl": "/uploads/documents/contract_123.pdf",
  "fileSize": 524288,
  "mimeType": "application/pdf",
  "employee": "employee_id_here",
  "isConfidential": true,
  "tags": ["contract", "employment"]
}
```

### Get Document by ID
```http
GET /documents/:id
Authorization: Bearer YOUR_TOKEN
```

### Download Document
```http
GET /documents/:id/download
Authorization: Bearer YOUR_TOKEN
```

### Update Document
```http
PUT /documents/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Updated Contract Title",
  "status": "Active"
}
```

### Delete Document
```http
DELETE /documents/:id
Authorization: Bearer YOUR_TOKEN
```

### Get Document Statistics
```http
GET /documents/stats/overview
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

---

## 🎉 Holiday Management (Admin/HR)

### Get All Holidays
```http
GET /holidays?page=1&limit=10&year=2024&type=National Holiday
Authorization: Bearer YOUR_TOKEN
```

### Create Holiday
```http
POST /holidays
Authorization: Bearer ADMIN_OR_HR_TOKEN
Content-Type: application/json

{
  "name": "New Year's Day",
  "date": "2024-01-01",
  "type": "National Holiday",
  "description": "New Year celebration",
  "isRecurring": true,
  "applicableFor": "All"
}
```

### Get Holiday by ID
```http
GET /holidays/:id
Authorization: Bearer YOUR_TOKEN
```

### Update Holiday
```http
PUT /holidays/:id
Authorization: Bearer ADMIN_OR_HR_TOKEN
Content-Type: application/json

{
  "description": "Updated description",
  "isActive": true
}
```

### Delete Holiday
```http
DELETE /holidays/:id
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

### Get Upcoming Holidays
```http
GET /holidays/upcoming/list
Authorization: Bearer YOUR_TOKEN
```

### Get Holiday Statistics
```http
GET /holidays/stats/overview
Authorization: Bearer YOUR_TOKEN
```

---

## 📢 Announcements (Admin/HR)

### Get All Announcements
```http
GET /announcements?page=1&limit=10&priority=High&type=General
Authorization: Bearer YOUR_TOKEN
```

### Create Announcement
```http
POST /announcements
Authorization: Bearer ADMIN_OR_HR_TOKEN
Content-Type: application/json

{
  "title": "Office Reopening",
  "content": "The office will reopen on Monday...",
  "priority": "High",
  "type": "General",
  "publishDate": "2024-01-15",
  "expiryDate": "2024-02-15",
  "targetAudience": "All Employees",
  "isPinned": true
}
```

### Get Announcement by ID
```http
GET /announcements/:id
Authorization: Bearer YOUR_TOKEN
```

### Update Announcement
```http
PUT /announcements/:id
Authorization: Bearer ADMIN_OR_HR_TOKEN
Content-Type: application/json

{
  "title": "Updated Title",
  "priority": "Urgent"
}
```

### Delete Announcement
```http
DELETE /announcements/:id
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

### Pin/Unpin Announcement
```http
PATCH /announcements/:id/pin
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

### Mark as Read
```http
PATCH /announcements/:id/read
Authorization: Bearer YOUR_TOKEN
```

### Get Announcement Statistics
```http
GET /announcements/stats/overview
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

---

## 📈 Analytics & Reports

### Get Dashboard Overview
```http
GET /analytics/overview
Authorization: Bearer YOUR_TOKEN
```

### Get Attendance Analytics
```http
GET /analytics/attendance?startDate=2024-01-01&endDate=2024-01-31&department=Engineering
Authorization: Bearer YOUR_TOKEN
```

### Get Labor Cost Analytics (Admin/HR)
```http
GET /analytics/labor-cost?year=2024&month=1
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

### Get Performance Analytics
```http
GET /analytics/performance?department=Engineering&year=2024
Authorization: Bearer YOUR_TOKEN
```

### Get Leave Analytics
```http
GET /analytics/leaves?year=2024&department=Engineering
Authorization: Bearer YOUR_TOKEN
```

---

## 🔧 Utility Endpoints

### Health Check
```http
GET /health

Response:
{
  "status": "OK",
  "message": "Server is running"
}
```

---

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here"
}
```

---

## 🔑 Role-Based Access

| Role | Permissions |
|------|------------|
| **Admin** | Full access to all endpoints |
| **HR** | Manage employees, attendance, leaves, payroll, performance, interviews, documents, holidays, announcements |
| **Manager** | View team data, approve/reject leaves, conduct performance reviews, evaluate interviews |
| **Employee** | View own data, submit leave requests, check-in/out, acknowledge reviews |

---

## 📊 Common Query Parameters

Most list endpoints support:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term
- `status` - Filter by status
- `department` - Filter by department
- `startDate` - Filter by start date
- `endDate` - Filter by end date

---

## 🚀 Rate Limiting

- 100 requests per 15 minutes per IP address
- Applies to all `/api/*` endpoints

---

## 🔒 Security Headers

The API uses Helmet.js for security headers and CORS is configured for the frontend URL.

---

For more information, see SETUP.md and README.md files.
