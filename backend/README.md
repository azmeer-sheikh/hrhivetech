# HR Portal Backend API

A comprehensive Node.js/Express.js backend API for HR Management Portal with MongoDB.

## Features

- Employee Management
- Attendance Tracking
- Leave Management
- Payroll Management
- Performance Management
- Interview Management
- Document Management
- User Authentication & Authorization
- Analytics & Reporting
- Announcements & Holidays

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository and navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration

5. Start MongoDB service

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the PORT specified in .env)

## API Documentation

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - Register new user
- GET `/api/auth/me` - Get current user
- POST `/api/auth/logout` - Logout user

### Employees
- GET `/api/employees` - Get all employees
- POST `/api/employees` - Create new employee
- GET `/api/employees/:id` - Get employee by ID
- PUT `/api/employees/:id` - Update employee
- DELETE `/api/employees/:id` - Delete employee

### Attendance
- GET `/api/attendance` - Get attendance records
- POST `/api/attendance/check-in` - Check in
- POST `/api/attendance/check-out` - Check out
- GET `/api/attendance/employee/:id` - Get employee attendance

### Leaves
- GET `/api/leaves` - Get all leave requests
- POST `/api/leaves` - Create leave request
- PUT `/api/leaves/:id` - Update leave request
- DELETE `/api/leaves/:id` - Delete leave request
- PATCH `/api/leaves/:id/approve` - Approve leave
- PATCH `/api/leaves/:id/reject` - Reject leave

### Payroll
- GET `/api/payroll` - Get all payroll records
- POST `/api/payroll` - Create payroll record
- GET `/api/payroll/:id` - Get payroll by ID
- PUT `/api/payroll/:id` - Update payroll
- DELETE `/api/payroll/:id` - Delete payroll

### Performance
- GET `/api/performance` - Get all performance reviews
- POST `/api/performance` - Create performance review
- GET `/api/performance/employee/:id` - Get employee reviews
- PUT `/api/performance/:id` - Update review
- DELETE `/api/performance/:id` - Delete review

### Interviews
- GET `/api/interviews` - Get all interviews
- POST `/api/interviews` - Schedule interview
- PUT `/api/interviews/:id` - Update interview
- DELETE `/api/interviews/:id` - Cancel interview

### Documents
- GET `/api/documents` - Get all documents
- POST `/api/documents` - Upload document
- GET `/api/documents/:id` - Download document
- DELETE `/api/documents/:id` - Delete document

### Holidays
- GET `/api/holidays` - Get all holidays
- POST `/api/holidays` - Create holiday
- PUT `/api/holidays/:id` - Update holiday
- DELETE `/api/holidays/:id` - Delete holiday

### Announcements
- GET `/api/announcements` - Get all announcements
- POST `/api/announcements` - Create announcement
- PUT `/api/announcements/:id` - Update announcement
- DELETE `/api/announcements/:id` - Delete announcement

### Analytics
- GET `/api/analytics/overview` - Get dashboard overview
- GET `/api/analytics/attendance` - Get attendance analytics
- GET `/api/analytics/labor-cost` - Get labor cost analytics

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── attendanceController.js
│   │   ├── leaveController.js
│   │   ├── payrollController.js
│   │   ├── performanceController.js
│   │   ├── interviewController.js
│   │   ├── documentController.js
│   │   ├── holidayController.js
│   │   ├── announcementController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Employee.js
│   │   ├── Attendance.js
│   │   ├── Leave.js
│   │   ├── Payroll.js
│   │   ├── Performance.js
│   │   ├── Interview.js
│   │   ├── Document.js
│   │   ├── Holiday.js
│   │   └── Announcement.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── leaveRoutes.js
│   │   ├── payrollRoutes.js
│   │   ├── performanceRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── documentRoutes.js
│   │   ├── holidayRoutes.js
│   │   ├── announcementRoutes.js
│   │   └── analyticsRoutes.js
│   ├── utils/
│   │   └── helpers.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## License

ISC
