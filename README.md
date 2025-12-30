
  # HR and Payroll Management System

A comprehensive HR Management Portal with integrated frontend and backend services.

## Project Overview

This system consists of:
- **Frontend**: React + TypeScript with Vite (runs on port 5173 or 3000)
- **Backend**: Node.js + Express with MongoDB (runs on port 5000)
- **Database**: MongoDB (local or cloud)

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB running locally on `mongodb://localhost:27017` or configured in `.env`

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend will start on: `http://localhost:5000`
API Base URL: `http://localhost:5000/api`

### Frontend Setup

```bash
npm install
npm run dev
```

Frontend will start on: `http://localhost:5173` (Vite default)

## Configuration

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hr-portal
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Testing the Integration

### Using PowerShell (Windows)
```powershell
.\test-integration.ps1
```

### Using Bash (Linux/Mac)
```bash
bash test-integration.sh
```

### Manual Testing
```bash
# Check if backend is running
curl http://localhost:5000/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hr-portal.com","password":"admin123"}'
```

## API Documentation

### Base URL
`http://localhost:5000/api`

### Main Endpoints

| Module | Endpoints |
|--------|-----------|
| **Auth** | POST /auth/register, /auth/login, GET /auth/me |
| **Employees** | GET /employees, POST /employees, PUT /employees/:id |
| **Attendance** | GET /attendance, POST /attendance/check-in, POST /attendance/check-out |
| **Leaves** | GET /leaves, POST /leaves, PUT /leaves/:id/approve |
| **Payroll** | GET /payroll, POST /payroll, PUT /payroll/:id |
| **Performance** | GET /performance, POST /performance, PUT /performance/:id |
| **Documents** | GET /documents, POST /documents (upload) |
| **Announcements** | GET /announcements, POST /announcements |
| **Holidays** | GET /holidays, POST /holidays |

See [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md) for complete endpoint details.

## Frontend Features

- **Dashboard**: Overview of key HR metrics
- **Employee Management**: CRUD operations for employees
- **Attendance Tracking**: Check-in/out and daily tracking
- **Leave Management**: Request, approve, and track leaves
- **Payroll Management**: Manage salaries and compensation
- **Performance Reviews**: Track employee performance
- **Document Management**: Upload and manage HR documents
- **Announcements**: Company-wide announcements
- **Analytics**: HR analytics and reporting
- **User Management**: User roles and permissions

## Backend Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Admin, HR, Manager, Employee roles
- **Database Models**: Comprehensive MongoDB models for all entities
- **Validation**: Request validation and error handling
- **CORS**: Properly configured for frontend-backend communication
- **Rate Limiting**: API rate limiting for security
- **Error Handling**: Centralized error handling middleware
- **Logging**: Morgan middleware for request logging

## Troubleshooting

### Backend not responding
- Ensure MongoDB is running
- Check if port 5000 is available
- Verify .env configuration
- Check backend logs for errors

### CORS errors
- Verify FRONTEND_URL in backend .env matches your frontend URL
- Check VITE_API_URL in frontend .env
- Ensure API calls use correct base URL

### Cannot login
- Verify user exists in database
- Check JWT_SECRET is configured
- Ensure password is correct

### Route not found (404)
- Check endpoint paths are correct
- Verify routes are registered in backend
- Check network tab in browser console

See [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md) for detailed troubleshooting.

## Project Structure

```
HR/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── server.js       # Express server configuration
│   │   ├── config/         # Database config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, CORS, error handling
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   └── utils/          # Helper functions
│   ├── .env                # Backend environment variables
│   └── package.json
├── src/                    # React Frontend
│   ├── components/         # React components
│   ├── services/          # API service (api.ts)
│   ├── styles/            # CSS styles
│   └── App.tsx            # Main app component
├── .env                    # Frontend environment variables
├── vite.config.ts         # Vite configuration
├── package.json           # Frontend dependencies
└── README.md              # This file
```

## Development

### Key Technologies

**Frontend:**
- React 18+
- TypeScript
- Vite
- Tailwind CSS
- Radix UI Components
- Recharts (Charts)

**Backend:**
- Express.js
- MongoDB + Mongoose
- JWT (Authentication)
- Helmet (Security)
- Morgan (Logging)
- Multer (File Upload)

## Performance Checklist

- [x] CORS properly configured
- [x] Rate limiting enabled
- [x] Compression middleware enabled
- [x] JWT authentication
- [x] Input validation
- [x] Error handling
- [x] Request/response logging
- [x] API request optimization
- [x] Database connection pooling
- [x] Frontend bundle optimization

## Security Notes

- Change JWT_SECRET in production
- Use HTTPS in production
- Update FRONTEND_URL for production environment
- Restrict CORS origins to production domain only
- Implement rate limiting in production
- Keep dependencies updated
- Never commit real secrets to version control

## Support

For issues or questions, refer to:
- [API Documentation](./backend/API_DOCS.md)
- [Integration Checklist](./INTEGRATION_CHECKLIST.md)
- [Setup Guide](./backend/SETUP.md)

## License

ISC

---

**Last Updated**: December 30, 2025  
**Version**: 1.0.0

  