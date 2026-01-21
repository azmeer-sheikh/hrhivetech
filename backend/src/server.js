require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const { startQueueProcessor } = require('./utils/emailJobQueue');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const documentRoutes = require('./routes/documentRoutes');
const holidayRoutes = require('./routes/holidayRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const queueRoutes = require('./routes/queueRoutes');

// Connect to database
connectDB();

// Start email job queue processor
startQueueProcessor();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
  xFrameOptions: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'https://hrhivetech-production.up.railway.app'
];

// Enhanced CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl requests, Postman)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed origins or Railway domains
    const isAllowed = allowedOrigins.some(allowed => 
      allowed.toLowerCase() === origin.toLowerCase()
    );
    
    // Allow all Railway subdomains
    const isRailway = origin.includes('.railway.app') || origin.includes('.up.railway.app');
    
    if (isAllowed || isRailway) return callback(null, true);
    
    // In production, allow all origins temporarily for debugging
    if (process.env.NODE_ENV === 'production') {
      console.log(`⚠️  Allowing origin in production: ${origin}`);
      return callback(null, true);
    }
    
    // Log denied origins in development
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error(`Origin ${origin} not allowed by CORS policy`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Static file serving with explicit CORS and header permissions
app.use('/uploads', (req, res, next) => {
  // Allow any origin to access uploaded files
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Log all requests in production for debugging
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API info route
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HR Portal API',
    version: '1.0.0',
    baseUrl: 'http://localhost:5000/api',
    endpoints: {
      auth: '/api/auth',
      employees: '/api/employees',
      attendance: '/api/attendance',
      leaves: '/api/leaves',
      payroll: '/api/payroll',
      performance: '/api/performance',
      interviews: '/api/interviews',
      documents: '/api/documents',
      holidays: '/api/holidays',
      announcements: '/api/announcements',
      analytics: '/api/analytics',
      users: '/api/users'
    },
    documentation: 'See API_DOCS.md for complete documentation'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/queue', queueRoutes);

// Serve frontend static files - check if dist folder exists
const frontendPath = path.join(__dirname, '../../dist');
const fs = require('fs');

if (fs.existsSync(frontendPath)) {
  console.log('✅ Serving frontend from:', frontendPath);
  app.use(express.static(frontendPath));
  
  // Handle client-side routing - send all non-API requests to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(404).json({ message: 'Frontend not found' });
      }
    });
  });
} else {
  console.warn('⚠️  Frontend dist folder not found at:', frontendPath);
  console.warn('⚠️  Running in API-only mode');
  
  // 404 handler when frontend not built
  app.use((req, res) => {
    res.status(404).json({ 
      message: 'Route not found',
      note: 'Frontend not built. Run "npm run build" to build the frontend.',
      availableEndpoints: ['/api/auth', '/api/employees', '/api/attendance', '/health']
    });
  });
}

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
