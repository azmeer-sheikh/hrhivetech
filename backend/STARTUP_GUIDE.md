# HR Portal Backend - Complete Setup & Installation Guide

## Overview
This is a full-featured HR Management Portal Backend built with Node.js, Express.js, and MongoDB. It includes comprehensive APIs for employee management, attendance tracking, leave management, payroll, performance reviews, interviews, and more.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (v4.4 or higher)
- Git

### Installation Steps

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the values in `.env` file:
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/hr-portal
   JWT_SECRET=your_secure_secret_key
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB:**
   ```bash
   # For Windows
   mongod
   
   # For macOS/Linux
   brew services start mongodb-community
   ```

5. **Seed sample data (optional):**
   ```bash
   npm run seed
   ```

6. **Start the backend server:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The server will be available at `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/             # Business logic for each route
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── attendanceController.js
│   │   ├── leaveController.js
│   │   ├── payrollController.js
│   │   ├── performanceController.js
│   │   ├── interviewController.js
│   │   ├── announcementController.js
│   │   ├── documentController.js
│   │   ├── holidayController.js
│   │   ├── analyticsController.js
│   │   └── userController.js
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js
│   │   ├── Employee.js
│   │   ├── Attendance.js
│   │   ├── Leave.js
│   │   ├── Payroll.js
│   │   ├── Performance.js
│   │   ├── Interview.js
│   │   ├── Announcement.js
│   │   ├── Document.js
│   │   └── Holiday.js
│   ├── routes/                  # API endpoints
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── leaveRoutes.js
│   │   ├── payrollRoutes.js
│   │   ├── performanceRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── announcementRoutes.js
│   │   ├── documentRoutes.js
│   │   ├── holidayRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── userRoutes.js
│   ├── middleware/              # Custom middleware functions
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── utils/
│   │   └── helpers.js
│   └── server.js                # Express app setup
├── seed.js                      # Database seeding script
├── .env                         # Environment variables
├── .env.example                 # Example env file
├── .gitignore
├── package.json
└── README.md
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Register**: POST `/api/auth/register`
   ```json
   {
     "username": "john_doe",
     "email": "john@example.com",
     "password": "password123",
     "role": "employee"
   }
   ```

2. **Login**: POST `/api/auth/login`
   ```json
   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```

3. **Protected Routes**: Add token to Authorization header
   ```
   Authorization: Bearer <your_jwt_token>
   ```

## 📚 API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/logout` - Logout user

### Employee Management
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get specific employee
- `POST /api/employees` - Create employee (Admin/HR only)
- `PUT /api/employees/:id` - Update employee (Admin/HR only)
- `DELETE /api/employees/:id` - Delete employee (Admin/HR only)
- `GET /api/employees/stats/overview` - Get employee statistics

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/:id` - Get specific record
- `PUT /api/attendance/:id` - Update attendance
- `DELETE /api/attendance/:id` - Delete record

### Leave Management
- `GET /api/leaves` - Get all leave requests
- `POST /api/leaves` - Create leave request
- `GET /api/leaves/:id` - Get specific leave request
- `PUT /api/leaves/:id` - Update leave request
- `DELETE /api/leaves/:id` - Cancel leave request
- `PUT /api/leaves/:id/approve` - Approve leave (Manager/Admin)
- `PUT /api/leaves/:id/reject` - Reject leave (Manager/Admin)

### Payroll
- `GET /api/payroll` - Get payroll records
- `POST /api/payroll` - Create payroll
- `GET /api/payroll/:id` - Get specific payroll
- `PUT /api/payroll/:id` - Update payroll
- `DELETE /api/payroll/:id` - Delete payroll

### Performance Management
- `GET /api/performance` - Get performance reviews
- `POST /api/performance` - Create review
- `GET /api/performance/:id` - Get specific review
- `PUT /api/performance/:id` - Update review
- `DELETE /api/performance/:id` - Delete review

### Interviews
- `GET /api/interviews` - Get all interviews
- `POST /api/interviews` - Create interview
- `GET /api/interviews/:id` - Get specific interview
- `PUT /api/interviews/:id` - Update interview
- `DELETE /api/interviews/:id` - Delete interview

### Documents
- `GET /api/documents` - Get all documents
- `POST /api/documents` - Upload document
- `DELETE /api/documents/:id` - Delete document

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement (Admin/HR)
- `PUT /api/announcements/:id` - Update announcement (Admin/HR)
- `DELETE /api/announcements/:id` - Delete announcement (Admin/HR)

### Holidays
- `GET /api/holidays` - Get holidays
- `POST /api/holidays` - Create holiday (Admin only)
- `PUT /api/holidays/:id` - Update holiday (Admin only)
- `DELETE /api/holidays/:id` - Delete holiday (Admin only)

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard data
- `GET /api/analytics/attendance` - Get attendance analytics
- `GET /api/analytics/payroll` - Get payroll analytics

### Users
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

## 🛡️ Security Features

- **JWT Authentication**: Token-based authentication
- **Password Hashing**: Bcryptjs for secure password storage
- **CORS**: Cross-Origin Resource Sharing configured
- **Helmet**: Security headers middleware
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Express-validator for request validation
- **Error Handling**: Comprehensive error handling middleware

## 🗄️ Database Models

### User Model
- username, email, password
- role (admin, hr, manager, employee)
- employeeId reference
- isActive status
- lastLogin, timestamps

### Employee Model
- Basic info (firstName, lastName, email, phone)
- Date of birth, gender, address
- Department, position, employment type
- Joining date, manager reference

### Attendance Model
- Employee reference
- Check-in, check-out times
- Status (present, absent, leave, weekend, holiday)
- Date, remarks

### Leave Model
- Employee reference
- Leave type, status
- From/To dates
- Reason, attachments
- Approved by, rejection reason

### Payroll Model
- Employee reference
- Salary details
- Deductions, net pay
- Payment date, status

### Performance Model
- Employee reference
- Manager reference
- Rating, feedback
- Review period

### Interview Model
- Candidate info
- Position, date, status
- Interviewer reference
- Feedback, rating

## 🚀 Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/hr-portal

# JWT
JWT_SECRET=your_very_secure_secret_key
JWT_EXPIRE=7d

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_password

# Frontend
FRONTEND_URL=http://localhost:5173
```

## 📦 Dependencies

### Core Dependencies
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **dotenv**: Environment variables
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **cors**: CORS middleware
- **helmet**: Security headers
- **express-rate-limit**: API rate limiting
- **compression**: Response compression
- **morgan**: HTTP logging
- **express-validator**: Input validation
- **multer**: File uploads
- **nodemailer**: Email sending
- **moment**: Date manipulation
- **uuid**: Unique ID generation

### Dev Dependencies
- **nodemon**: Auto-reload during development
- **jest**: Testing framework

## 🧪 Testing

To test the API endpoints, you can use:

1. **Postman**: Import the provided API collection
2. **cURL**: Use command-line requests
3. **Thunder Client**: VS Code extension
4. **REST Client**: VS Code extension

Example cURL request:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hr-portal.com",
    "password": "admin123"
  }'
```

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify MongoDB is accessible on the configured port

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Dependencies Installation Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📖 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Authentication](https://jwt.io/)

## 🤝 Support

For issues or questions:
1. Check the API_DOCS.md for detailed endpoint documentation
2. Review the error messages carefully
3. Check MongoDB is running
4. Verify environment variables are set correctly

## 📝 License

This project is licensed under the ISC License.

---

**Happy Coding!** 🎉
