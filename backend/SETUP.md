# HR Portal Backend - Quick Start Guide

## Prerequisites
- Node.js v16+ installed
- MongoDB v4.4+ installed and running
- npm or yarn package manager

## Installation Steps

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hr-portal
JWT_SECRET=your_jwt_secret_key_here_change_this
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

**Important:** Change `JWT_SECRET` to a secure random string!

### 4. Start MongoDB
Make sure MongoDB is running on your system:

**Windows:**
```bash
net start MongoDB
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### 5. Seed Database (Optional)
Populate the database with initial data:
```bash
npm run seed
```

This will create:
- Admin user: `admin@hr-portal.com` / `admin123`
- HR user: `hr@hr-portal.com` / `hr123`
- Employee user: `john.doe@hr-portal.com` / `password123`
- Sample employees

### 6. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## Testing the API

### Check Server Health
```bash
curl http://localhost:5000/health
```

### Login Example
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hr-portal.com",
    "password": "admin123"
  }'
```

### Using the Token
After login, use the returned token in the Authorization header:
```bash
curl http://localhost:5000/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/logout` - Logout

### Employees
- `GET /api/employees` - Get all employees (supports pagination, search, filters)
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create employee (admin/hr only)
- `PUT /api/employees/:id` - Update employee (admin/hr only)
- `DELETE /api/employees/:id` - Delete employee (admin/hr only)
- `GET /api/employees/stats/overview` - Get employee statistics

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out
- `GET /api/attendance/employee/:employeeId` - Get employee attendance
- `GET /api/attendance/summary/stats` - Get attendance summary
- `PUT /api/attendance/:id` - Update attendance (admin/hr only)
- `DELETE /api/attendance/:id` - Delete attendance (admin/hr only)

### Leave Management
- `GET /api/leaves` - Get all leave requests
- `POST /api/leaves` - Create leave request
- `GET /api/leaves/:id` - Get leave by ID
- `PUT /api/leaves/:id` - Update leave
- `DELETE /api/leaves/:id` - Delete leave
- `PATCH /api/leaves/:id/approve` - Approve leave (admin/hr/manager)
- `PATCH /api/leaves/:id/reject` - Reject leave (admin/hr/manager)
- `GET /api/leaves/balance/:employeeId` - Get leave balance

### Payroll
- `GET /api/payroll` - Get all payroll records
- `POST /api/payroll` - Create payroll (admin/hr only)
- `GET /api/payroll/:id` - Get payroll by ID
- `PUT /api/payroll/:id` - Update payroll (admin/hr only)
- `DELETE /api/payroll/:id` - Delete payroll (admin/hr only)
- `PATCH /api/payroll/:id/process` - Process payroll (admin/hr only)
- `GET /api/payroll/summary/stats` - Get payroll summary

### Performance Reviews
- `GET /api/performance` - Get all reviews
- `POST /api/performance` - Create review (admin/hr/manager)
- `GET /api/performance/:id` - Get review by ID
- `GET /api/performance/employee/:employeeId` - Get employee performance
- `PUT /api/performance/:id` - Update review (admin/hr/manager)
- `DELETE /api/performance/:id` - Delete review (admin/hr)
- `PATCH /api/performance/:id/acknowledge` - Acknowledge review

### Interviews
- `GET /api/interviews` - Get all interviews
- `POST /api/interviews` - Schedule interview (admin/hr)
- `GET /api/interviews/:id` - Get interview by ID
- `PUT /api/interviews/:id` - Update interview (admin/hr)
- `DELETE /api/interviews/:id` - Cancel interview (admin/hr)
- `PATCH /api/interviews/:id/status` - Update status
- `PATCH /api/interviews/:id/evaluate` - Submit evaluation
- `GET /api/interviews/stats/overview` - Get interview statistics

### Documents
- `GET /api/documents` - Get all documents
- `POST /api/documents` - Upload document
- `GET /api/documents/:id` - Get document by ID
- `GET /api/documents/:id/download` - Download document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/stats/overview` - Get document statistics

### Holidays
- `GET /api/holidays` - Get all holidays
- `POST /api/holidays` - Create holiday (admin/hr)
- `GET /api/holidays/:id` - Get holiday by ID
- `PUT /api/holidays/:id` - Update holiday (admin/hr)
- `DELETE /api/holidays/:id` - Delete holiday (admin/hr)
- `GET /api/holidays/upcoming/list` - Get upcoming holidays
- `GET /api/holidays/stats/overview` - Get holiday statistics

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement (admin/hr)
- `GET /api/announcements/:id` - Get announcement by ID
- `PUT /api/announcements/:id` - Update announcement (admin/hr)
- `DELETE /api/announcements/:id` - Delete announcement (admin/hr)
- `PATCH /api/announcements/:id/pin` - Pin/unpin announcement
- `PATCH /api/announcements/:id/read` - Mark as read
- `GET /api/announcements/stats/overview` - Get statistics

### Analytics
- `GET /api/analytics/overview` - Dashboard overview
- `GET /api/analytics/attendance` - Attendance analytics
- `GET /api/analytics/labor-cost` - Labor cost analytics (admin/hr)
- `GET /api/analytics/performance` - Performance analytics
- `GET /api/analytics/leaves` - Leave analytics

## Common Query Parameters

Most GET endpoints support:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term
- `status` - Filter by status
- `department` - Filter by department

Example:
```
GET /api/employees?page=1&limit=20&search=john&department=Engineering
```

## User Roles & Permissions

### Admin
- Full access to all endpoints
- Can manage users, employees, and all HR functions

### HR
- Manage employees, attendance, leaves, payroll
- Cannot modify admin users

### Manager
- View team information
- Approve/reject leaves and performance reviews
- Limited employee management

### Employee
- View own information
- Submit leave requests
- Check in/out for attendance
- View announcements and holidays

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check connection string in `.env`
- Verify MongoDB is accessible on port 27017

### Port Already in Use
Change the PORT in `.env` file to a different port (e.g., 5001, 8000)

### Authentication Errors
- Ensure JWT_SECRET is set in `.env`
- Check if token is properly included in Authorization header
- Format: `Authorization: Bearer YOUR_TOKEN`

### CORS Issues
Update `FRONTEND_URL` in `.env` to match your frontend URL

## Development Tips

### Using Postman or Thunder Client
1. Create a collection for the HR Portal API
2. Add environment variables for base URL and token
3. Set up authentication to automatically include Bearer token

### Watching Logs
The server uses Morgan for HTTP request logging in development mode.

### Database GUI Tools
- MongoDB Compass (Official)
- Robo 3T
- Studio 3T

Connect to: `mongodb://localhost:27017/hr-portal`

## Next Steps

1. Connect your frontend to the backend API
2. Customize the seed data for your organization
3. Add file upload functionality (multer is already included)
4. Set up email notifications (nodemailer is included)
5. Add additional validation rules as needed
6. Configure production environment settings

## Production Deployment

Before deploying to production:

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Use MongoDB Atlas or similar cloud database
4. Enable HTTPS
5. Set up proper logging
6. Configure rate limiting appropriately
7. Set up backup strategies
8. Use environment variables for sensitive data

## Support

For issues or questions:
- Check the README.md in the backend folder
- Review the API documentation above
- Examine the controller files for detailed logic
- Check MongoDB logs for database issues

## License

ISC
