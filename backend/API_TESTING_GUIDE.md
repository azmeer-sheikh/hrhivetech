# API Testing Guide - HR Portal Backend

## Testing the API

### Prerequisites for Testing
- Backend server running on `http://localhost:5000`
- MongoDB running locally
- Sample data seeded (run `npm run seed`)
- Tool: Postman, cURL, or REST Client VS Code extension

---

## 🔐 Authentication Testing

### 1. Register New User
**Method:** POST  
**URL:** `http://localhost:5000/api/auth/register`  
**Headers:** 
```
Content-Type: application/json
```
**Body:**
```json
{
  "username": "employee1",
  "email": "employee1@example.com",
  "password": "password123",
  "role": "employee"
}
```

### 2. Login User
**Method:** POST  
**URL:** `http://localhost:5000/api/auth/login`  
**Headers:** 
```
Content-Type: application/json
```
**Body:**
```json
{
  "email": "admin@hr-portal.com",
  "password": "admin123"
}
```
**Response:**
```json
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

### 3. Get Current User
**Method:** GET  
**URL:** `http://localhost:5000/api/auth/me`  
**Headers:**
```
Authorization: Bearer <your_token_from_login>
Content-Type: application/json
```

### 4. Update User Details
**Method:** PUT  
**URL:** `http://localhost:5000/api/auth/updatedetails`  
**Headers:**
```
Authorization: Bearer <your_token>
Content-Type: application/json
```
**Body:**
```json
{
  "username": "nemusername",
  "email": "newemail@example.com"
}
```

### 5. Update Password
**Method:** PUT  
**URL:** `http://localhost:5000/api/auth/updatepassword`  
**Headers:**
```
Authorization: Bearer <your_token>
Content-Type: application/json
```
**Body:**
```json
{
  "currentPassword": "admin123",
  "newPassword": "newpassword123"
}
```

---

## 👥 Employee Management Testing

### 1. Get All Employees
**Method:** GET  
**URL:** `http://localhost:5000/api/employees`  
**Headers:**
```
Authorization: Bearer <your_token>
Content-Type: application/json
```
**Query Parameters:**
```
?page=1&limit=10&department=Engineering&search=john
```

### 2. Get Employee Statistics
**Method:** GET  
**URL:** `http://localhost:5000/api/employees/stats/overview`  
**Headers:**
```
Authorization: Bearer <your_token>
```

### 3. Get Specific Employee
**Method:** GET  
**URL:** `http://localhost:5000/api/employees/:id`  
**Headers:**
```
Authorization: Bearer <your_token>
```

### 4. Create Employee (Admin/HR only)
**Method:** POST  
**URL:** `http://localhost:5000/api/employees`  
**Headers:**
```
Authorization: Bearer <admin_or_hr_token>
Content-Type: application/json
```
**Body:**
```json
{
  "employeeCode": "EMP001",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+1234567890",
  "dateOfBirth": "1992-05-20",
  "gender": "Female",
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
  "joiningDate": "2024-01-15",
  "salary": 75000
}
```

### 5. Update Employee
**Method:** PUT  
**URL:** `http://localhost:5000/api/employees/:id`  
**Headers:**
```
Authorization: Bearer <admin_or_hr_token>
Content-Type: application/json
```
**Body:**
```json
{
  "position": "Senior Software Engineer",
  "salary": 85000
}
```

### 6. Delete Employee
**Method:** DELETE  
**URL:** `http://localhost:5000/api/employees/:id`  
**Headers:**
```
Authorization: Bearer <admin_or_hr_token>
```

---

## 📋 Attendance Tracking Testing

### 1. Get All Attendance Records
**Method:** GET  
**URL:** `http://localhost:5000/api/attendance`  
**Headers:**
```
Authorization: Bearer <your_token>
```

### 2. Mark Attendance
**Method:** POST  
**URL:** `http://localhost:5000/api/attendance`  
**Headers:**
```
Authorization: Bearer <your_token>
Content-Type: application/json
```
**Body:**
```json
{
  "employeeId": "65abc123def456",
  "checkInTime": "2024-12-29T09:00:00Z",
  "checkOutTime": "2024-12-29T17:30:00Z",
  "status": "present",
  "remarks": "Regular day"
}
```

### 3. Get Specific Attendance Record
**Method:** GET  
**URL:** `http://localhost:5000/api/attendance/:id`  
**Headers:**
```
Authorization: Bearer <your_token>
```

### 4. Update Attendance
**Method:** PUT  
**URL:** `http://localhost:5000/api/attendance/:id`  
**Headers:**
```
Authorization: Bearer <your_token>
Content-Type: application/json
```
**Body:**
```json
{
  "checkOutTime": "2024-12-29T18:00:00Z",
  "remarks": "Extended work"
}
```

---

## 🏖️ Leave Management Testing

### 1. Get All Leave Requests
**Method:** GET  
**URL:** `http://localhost:5000/api/leaves`  
**Headers:**
```
Authorization: Bearer <your_token>
```
**Query Parameters:**
```
?status=pending&employeeId=65abc123def456
```

### 2. Create Leave Request
**Method:** POST  
**URL:** `http://localhost:5000/api/leaves`  
**Headers:**
```
Authorization: Bearer <your_token>
Content-Type: application/json
```
**Body:**
```json
{
  "leaveType": "annual",
  "fromDate": "2024-12-30",
  "toDate": "2025-01-03",
  "reason": "Family vacation",
  "contactNumber": "+1234567890"
}
```

### 3. Approve Leave Request
**Method:** PUT  
**URL:** `http://localhost:5000/api/leaves/:id/approve`  
**Headers:**
```
Authorization: Bearer <manager_or_admin_token>
Content-Type: application/json
```
**Body:**
```json
{
  "approvalComment": "Approved"
}
```

### 4. Reject Leave Request
**Method:** PUT  
**URL:** `http://localhost:5000/api/leaves/:id/reject`  
**Headers:**
```
Authorization: Bearer <manager_or_admin_token>
Content-Type: application/json
```
**Body:**
```json
{
  "rejectionReason": "Team is short staffed during this period"
}
```

---

## 💰 Payroll Testing

### 1. Get All Payroll Records
**Method:** GET  
**URL:** `http://localhost:5000/api/payroll`  
**Headers:**
```
Authorization: Bearer <hr_or_admin_token>
```

### 2. Create Payroll
**Method:** POST  
**URL:** `http://localhost:5000/api/payroll`  
**Headers:**
```
Authorization: Bearer <hr_or_admin_token>
Content-Type: application/json
```
**Body:**
```json
{
  "employeeId": "65abc123def456",
  "baseSalary": 75000,
  "grossSalary": 85000,
  "deductions": {
    "tax": 5000,
    "insurance": 2000,
    "other": 1000
  },
  "netSalary": 77000,
  "paymentMonth": "2024-12",
  "paymentStatus": "processed"
}
```

### 3. Get Specific Payroll
**Method:** GET  
**URL:** `http://localhost:5000/api/payroll/:id`  
**Headers:**
```
Authorization: Bearer <hr_or_admin_token>
```

### 4. Update Payroll
**Method:** PUT  
**URL:** `http://localhost:5000/api/payroll/:id`  
**Headers:**
```
Authorization: Bearer <hr_or_admin_token>
Content-Type: application/json
```
**Body:**
```json
{
  "grossSalary": 87000,
  "netSalary": 79000
}
```

---

## ⭐ Performance Reviews Testing

### 1. Get All Performance Reviews
**Method:** GET  
**URL:** `http://localhost:5000/api/performance`  
**Headers:**
```
Authorization: Bearer <your_token>
```

### 2. Create Performance Review
**Method:** POST  
**URL:** `http://localhost:5000/api/performance`  
**Headers:**
```
Authorization: Bearer <manager_token>
Content-Type: application/json
```
**Body:**
```json
{
  "employeeId": "65abc123def456",
  "reviewPeriod": "2024-Q4",
  "rating": 4.5,
  "feedback": "Excellent performance with strong technical skills",
  "strengths": ["Problem solving", "Leadership", "Communication"],
  "areasForImprovement": ["Time management"],
  "goals": ["Complete AWS certification", "Mentor junior developers"]
}
```

### 3. Update Performance Review
**Method:** PUT  
**URL:** `http://localhost:5000/api/performance/:id`  
**Headers:**
```
Authorization: Bearer <manager_token>
Content-Type: application/json
```
**Body:**
```json
{
  "rating": 4.7,
  "feedback": "Updated feedback"
}
```

---

## 🎤 Interview Management Testing

### 1. Get All Interviews
**Method:** GET  
**URL:** `http://localhost:5000/api/interviews`  
**Headers:**
```
Authorization: Bearer <hr_token>
```

### 2. Create Interview
**Method:** POST  
**URL:** `http://localhost:5000/api/interviews`  
**Headers:**
```
Authorization: Bearer <hr_token>
Content-Type: application/json
```
**Body:**
```json
{
  "candidateName": "Alice Johnson",
  "candidateEmail": "alice@example.com",
  "candidatePhone": "+9876543210",
  "position": "Senior Developer",
  "interviewDate": "2025-01-15",
  "interviewTime": "10:00",
  "interviewerName": "John Doe",
  "status": "scheduled"
}
```

### 3. Update Interview Status
**Method:** PUT  
**URL:** `http://localhost:5000/api/interviews/:id`  
**Headers:**
```
Authorization: Bearer <hr_token>
Content-Type: application/json
```
**Body:**
```json
{
  "status": "completed",
  "feedback": "Great technical knowledge",
  "rating": 4
}
```

---

## 📄 Documents Testing

### 1. Get All Documents
**Method:** GET  
**URL:** `http://localhost:5000/api/documents`  
**Headers:**
```
Authorization: Bearer <your_token>
```

### 2. Upload Document
**Method:** POST  
**URL:** `http://localhost:5000/api/documents`  
**Headers:**
```
Authorization: Bearer <your_token>
Content-Type: multipart/form-data
```
**Form Data:**
```
file: <your_file>
documentType: "contract"
employeeId: "65abc123def456"
```

### 3. Delete Document
**Method:** DELETE  
**URL:** `http://localhost:5000/api/documents/:id`  
**Headers:**
```
Authorization: Bearer <your_token>
```

---

## 📢 Announcements Testing

### 1. Get All Announcements
**Method:** GET  
**URL:** `http://localhost:5000/api/announcements`  
**Headers:**
```
Authorization: Bearer <your_token>
```

### 2. Create Announcement (Admin/HR only)
**Method:** POST  
**URL:** `http://localhost:5000/api/announcements`  
**Headers:**
```
Authorization: Bearer <admin_or_hr_token>
Content-Type: application/json
```
**Body:**
```json
{
  "title": "New Year Holiday Schedule",
  "content": "The office will be closed from Jan 1-3, 2025",
  "category": "holiday",
  "priority": "high",
  "validFrom": "2024-12-29",
  "validUntil": "2025-01-10"
}
```

---

## 📅 Holidays Testing

### 1. Get All Holidays
**Method:** GET  
**URL:** `http://localhost:5000/api/holidays`  
**Headers:**
```
Authorization: Bearer <your_token>
```

### 2. Create Holiday (Admin only)
**Method:** POST  
**URL:** `http://localhost:5000/api/holidays`  
**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```
**Body:**
```json
{
  "holidayName": "New Year",
  "holidayDate": "2025-01-01",
  "description": "New Year celebration"
}
```

---

## 📊 Analytics Testing

### 1. Get Dashboard Data
**Method:** GET  
**URL:** `http://localhost:5000/api/analytics/dashboard`  
**Headers:**
```
Authorization: Bearer <admin_token>
```

### 2. Get Attendance Analytics
**Method:** GET  
**URL:** `http://localhost:5000/api/analytics/attendance`  
**Headers:**
```
Authorization: Bearer <admin_token>
```
**Query Parameters:**
```
?month=2024-12&department=Engineering
```

### 3. Get Payroll Analytics
**Method:** GET  
**URL:** `http://localhost:5000/api/analytics/payroll`  
**Headers:**
```
Authorization: Bearer <admin_token>
```
**Query Parameters:**
```
?month=2024-12
```

---

## 👤 User Management Testing

### 1. Get All Users (Admin only)
**Method:** GET  
**URL:** `http://localhost:5000/api/users`  
**Headers:**
```
Authorization: Bearer <admin_token>
```

### 2. Create User (Admin only)
**Method:** POST  
**URL:** `http://localhost:5000/api/users`  
**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```
**Body:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "hr"
}
```

### 3. Update User (Admin only)
**Method:** PUT  
**URL:** `http://localhost:5000/api/users/:id`  
**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```
**Body:**
```json
{
  "role": "manager",
  "isActive": true
}
```

### 4. Delete User (Admin only)
**Method:** DELETE  
**URL:** `http://localhost:5000/api/users/:id`  
**Headers:**
```
Authorization: Bearer <admin_token>
```

---

## 🧪 Quick Test Sequence

1. **Register/Login** to get a token
2. **Get your profile** to verify authentication
3. **Get employees** to see existing data
4. **Create a leave request**
5. **Check analytics** dashboard
6. **Mark attendance**

---

## 📝 Notes

- Replace `<your_token>` with the actual JWT token from login
- Use different tokens based on user roles (admin, hr, manager, employee)
- All timestamps should be in ISO 8601 format
- Pagination is available on most GET endpoints (use `?page=1&limit=10`)

---

**Happy Testing!** 🚀
