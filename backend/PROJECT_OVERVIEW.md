# HR Portal Backend - Complete Project Documentation

## 📖 Project Overview

This is a **complete, production-ready HR Management Portal Backend** built with:
- **Framework**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, Rate Limiting, Input Validation
- **File Management**: Multer for uploads
- **Logging**: Morgan HTTP logger
- **Performance**: Compression middleware

---

## 🎯 Features

### Core Features
✅ **User Authentication & Authorization**
- User registration and login
- JWT-based authentication
- Role-based access control (Admin, HR, Manager, Employee)
- Password hashing with bcryptjs
- Session management

✅ **Employee Management**
- Complete employee profiles
- Employee directory
- Department and position management
- Employment type tracking
- Employee statistics and analytics

✅ **Attendance System**
- Check-in/Check-out tracking
- Daily attendance records
- Attendance status management
- Attendance analytics and reports

✅ **Leave Management**
- Multiple leave types (Sick, Casual, Annual, Maternity, etc.)
- Leave request workflow
- Approval/Rejection system
- Half-day leave support
- Leave balance tracking

✅ **Payroll Management**
- Salary calculation
- Deductions management
- Tax calculations
- Payroll processing
- Payment history and records

✅ **Performance Management**
- Employee performance reviews
- Rating system
- Feedback mechanism
- Goal tracking
- Performance analytics

✅ **Interview Management**
- Candidate tracking
- Interview scheduling
- Interview feedback
- Candidate evaluation
- Hiring pipeline management

✅ **Document Management**
- Document upload and storage
- Employee documents
- Contract management
- File classification

✅ **Announcements & Updates**
- Company announcements
- Priority-based notifications
- Validity date management
- Category-based filtering

✅ **Holiday Management**
- Holiday calendar
- Company holidays
- Holiday tracking
- Leave calculation based on holidays

✅ **Analytics & Reporting**
- Dashboard overview
- Employee statistics
- Attendance analytics
- Payroll analytics
- Department-wise reports

---

## 🗄️ Database Models

### 1. **User Model**
```
- username (unique)
- email (unique)
- password (hashed)
- role (admin, hr, manager, employee)
- employeeId (reference)
- isActive
- lastLogin
- createdAt, updatedAt
```

### 2. **Employee Model**
```
- employeeCode (unique)
- firstName, lastName
- email (unique)
- phone
- dateOfBirth
- gender
- address (street, city, state, zipCode, country)
- department
- position
- employmentType
- joiningDate
- salary
- manager (reference)
- createdAt, updatedAt
```

### 3. **Attendance Model**
```
- employee (reference)
- checkInTime
- checkOutTime
- status (present, absent, leave, weekend, holiday)
- date
- workHours
- remarks
- createdAt, updatedAt
```

### 4. **Leave Model**
```
- employee (reference)
- leaveType
- startDate, endDate
- numberOfDays
- reason
- status (pending, approved, rejected, cancelled)
- approvedBy (reference)
- approvedDate
- rejectionReason
- isHalfDay
- halfDaySession
- attachment
- createdAt, updatedAt
```

### 5. **Payroll Model**
```
- employee (reference)
- baseSalary
- grossSalary
- deductions (tax, insurance, other)
- netSalary
- paymentMonth
- paymentStatus
- paymentDate
- remarks
- createdAt, updatedAt
```

### 6. **Performance Model**
```
- employee (reference)
- manager (reference)
- reviewPeriod
- rating
- feedback
- strengths []
- areasForImprovement []
- goals []
- createdAt, updatedAt
```

### 7. **Interview Model**
```
- candidateName
- candidateEmail
- candidatePhone
- position
- interviewDate
- interviewTime
- interviewer (reference)
- status (scheduled, completed, cancelled)
- feedback
- rating
- createdAt, updatedAt
```

### 8. **Document Model**
```
- documentName
- documentType
- employee (reference)
- fileUrl
- uploadedBy (reference)
- uploadDate
- expiryDate
- createdAt, updatedAt
```

### 9. **Announcement Model**
```
- title
- content
- category
- priority (low, medium, high)
- createdBy (reference)
- validFrom, validUntil
- createdAt, updatedAt
```

### 10. **Holiday Model**
```
- holidayName
- holidayDate
- description
- createdAt, updatedAt
```

---

## 🔌 API Endpoints Summary

### Authentication (6 endpoints)
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- PUT /api/auth/updatedetails
- PUT /api/auth/updatepassword
- POST /api/auth/logout

### Employees (6 endpoints)
- GET /api/employees
- GET /api/employees/stats/overview
- GET /api/employees/:id
- POST /api/employees
- PUT /api/employees/:id
- DELETE /api/employees/:id

### Attendance (5 endpoints)
- GET /api/attendance
- GET /api/attendance/:id
- POST /api/attendance
- PUT /api/attendance/:id
- DELETE /api/attendance/:id

### Leaves (7 endpoints)
- GET /api/leaves
- GET /api/leaves/:id
- POST /api/leaves
- PUT /api/leaves/:id
- DELETE /api/leaves/:id
- PUT /api/leaves/:id/approve
- PUT /api/leaves/:id/reject

### Payroll (5 endpoints)
- GET /api/payroll
- GET /api/payroll/:id
- POST /api/payroll
- PUT /api/payroll/:id
- DELETE /api/payroll/:id

### Performance (5 endpoints)
- GET /api/performance
- GET /api/performance/:id
- POST /api/performance
- PUT /api/performance/:id
- DELETE /api/performance/:id

### Interviews (5 endpoints)
- GET /api/interviews
- GET /api/interviews/:id
- POST /api/interviews
- PUT /api/interviews/:id
- DELETE /api/interviews/:id

### Documents (3 endpoints)
- GET /api/documents
- POST /api/documents
- DELETE /api/documents/:id

### Announcements (4 endpoints)
- GET /api/announcements
- POST /api/announcements
- PUT /api/announcements/:id
- DELETE /api/announcements/:id

### Holidays (4 endpoints)
- GET /api/holidays
- POST /api/holidays
- PUT /api/holidays/:id
- DELETE /api/holidays/:id

### Analytics (3 endpoints)
- GET /api/analytics/dashboard
- GET /api/analytics/attendance
- GET /api/analytics/payroll

### Users (4 endpoints)
- GET /api/users
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id

**Total: 57+ API Endpoints**

---

## 🔐 Authentication & Authorization

### Authentication Flow
1. User registers or logs in
2. Server validates credentials
3. JWT token is generated
4. Client stores token
5. Client sends token in Authorization header for protected routes

### User Roles
- **Admin**: Full system access
- **HR**: HR operations and employee management
- **Manager**: Team management and approvals
- **Employee**: Personal data access and requests

### Protected Routes
- All routes except `/api/auth/register` and `/api/auth/login` require JWT token
- Role-based access control on specific endpoints

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js              # MongoDB connection
│   ├── controllers/                 # Business logic (12 files)
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
│   ├── models/                      # Mongoose schemas (10 files)
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
│   ├── routes/                      # API routes (12 files)
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
│   ├── middleware/                  # Custom middleware (3 files)
│   │   ├── auth.js                 # JWT & authorization
│   │   ├── errorHandler.js         # Error handling
│   │   └── validation.js           # Input validation
│   ├── utils/
│   │   └── helpers.js              # Utility functions
│   └── server.js                    # Express app setup
├── seed.js                          # Database seeding
├── .env                             # Environment variables
├── .env.example                     # Example env file
├── .gitignore
├── package.json                     # Dependencies
├── README.md                        # Main documentation
├── SETUP.md                         # Setup instructions
├── STARTUP_GUIDE.md                 # Detailed startup guide
├── API_DOCS.md                      # API documentation
├── API_TESTING_GUIDE.md             # Testing guide with examples
└── HR_Portal_API.postman_collection.json  # Postman collection
```

---

## 🚀 Getting Started

### 1. Installation
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your settings
# Set MONGODB_URI, JWT_SECRET, PORT, etc.
```

### 3. Start MongoDB
```bash
# Windows
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 4. Seed Database (Optional)
```bash
npm run seed
```

### 5. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

### 6. Test API
- Use Postman collection: `HR_Portal_API.postman_collection.json`
- Or refer to `API_TESTING_GUIDE.md` for cURL examples

---

## 🛠️ Middleware Stack

1. **Helmet**: Security headers
2. **CORS**: Cross-origin requests
3. **Morgan**: HTTP logging
4. **Express JSON**: JSON body parsing
5. **Express URLEncoded**: Form data parsing
6. **Compression**: Response compression
7. **Rate Limiter**: API rate limiting
8. **Custom Auth**: JWT verification
9. **Custom Error Handler**: Centralized error handling

---

## 📊 Key Technologies

| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB | NoSQL database |
| Mongoose | ODM for MongoDB |
| JWT | Authentication |
| Bcryptjs | Password hashing |
| Helmet | Security |
| CORS | Cross-origin support |
| Multer | File uploads |
| Morgan | HTTP logging |
| Compression | Response compression |
| Nodemailer | Email sending |
| Moment | Date manipulation |

---

## 🔒 Security Features

✅ **Password Security**
- Passwords hashed with bcryptjs
- Salt rounds: 10

✅ **Authentication**
- JWT-based token authentication
- Token expiration: 7 days (configurable)

✅ **Authorization**
- Role-based access control
- Route-level permission checks

✅ **HTTP Security**
- Helmet for security headers
- CORS configuration
- XSS protection
- CSRF prevention

✅ **Rate Limiting**
- 100 requests per 15 minutes per IP
- Prevents API abuse

✅ **Input Validation**
- Express-validator for input validation
- Data sanitization

---

## 📈 Performance Features

✅ **Response Compression**
✅ **Database Indexing** (via Mongoose)
✅ **Pagination** (on list endpoints)
✅ **Query Optimization**
✅ **Connection Pooling**

---

## 🧪 Testing

### Using Postman
1. Import `HR_Portal_API.postman_collection.json`
2. Set `token` variable after login
3. Run requests

### Using cURL
See `API_TESTING_GUIDE.md` for cURL examples

### Manual Testing
Use REST Client VS Code extension or Thunder Client

---

## 📝 File Structure

### Controllers (12 files, ~2500+ lines)
- Full CRUD operations for each module
- Pagination support
- Error handling
- Business logic

### Models (10 files, ~800+ lines)
- Complete Mongoose schemas
- Validation rules
- Relationships and references
- Timestamps

### Routes (12 files, ~300+ lines)
- RESTful API endpoints
- Middleware integration
- Authentication guards
- Role-based access

### Middleware (3 files, ~200+ lines)
- JWT verification
- Error handling
- Input validation

---

## 🔄 Workflow Example: Leave Request

1. **Employee** creates leave request via `POST /api/leaves`
2. **System** saves request with status "Pending"
3. **Manager** reviews via `GET /api/leaves`
4. **Manager** approves/rejects via `PUT /api/leaves/:id/approve|reject`
5. **System** updates leave balance
6. **Employee** notified of approval status
7. **Analytics** updated with leave data

---

## 📞 Support & Documentation

- **STARTUP_GUIDE.md**: Complete setup instructions
- **API_DOCS.md**: Detailed API documentation
- **API_TESTING_GUIDE.md**: Testing examples with cURL
- **HR_Portal_API.postman_collection.json**: Postman collection

---

## ✅ What's Included

✅ 57+ API endpoints
✅ 10 data models
✅ 12 controllers with full CRUD
✅ 12 route files
✅ Authentication & authorization
✅ Error handling
✅ Input validation
✅ Database seeding
✅ Complete documentation
✅ Testing guide
✅ Postman collection
✅ Production-ready code
✅ Security best practices

---

## 🎓 Learning Resource

This project demonstrates:
- RESTful API design
- Node.js best practices
- Express.js middleware
- MongoDB schema design
- JWT authentication
- Role-based access control
- Error handling patterns
- Code organization
- Security implementations

---

## 📄 License

ISC License

---

**Built with ❤️ for HR Management**

Start your HR Portal journey: `npm run dev`

---

## Quick Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Seed database
npm run seed

# Run tests (when available)
npm test
```

---

**Happy Coding!** 🚀

For questions or issues, refer to the detailed documentation files included in the project.
