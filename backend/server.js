const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const geneRoutes = require('./routes/genes');
const medicineRoutes = require('./routes/medicines');
const prescriptionRoutes = require('./routes/prescriptions');
const reportRoutes = require('./routes/reports');
const treatmentCaseRoutes = require('./routes/treatmentCases');
const adminRoutes = require('./routes/admin');

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(compression());
app.use(mongoSanitize());
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Auth rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});
app.use('/api/v1/auth', authLimiter);

// CORS configuration - Updated to support multiple frontend ports
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite default
    'http://localhost:3000',  // React default
    'http://localhost:3001',  // Your current frontend port
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    process.env.FRONTEND_URL || 'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || 
    Math.random().toString(36).substring(2, 15);
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);
  
  logger.info(`${req.method} ${req.path}`, {
    correlationId,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/genes', geneRoutes);
app.use('/api/v1/medicines', medicineRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/treatment-cases', treatmentCaseRoutes);
app.use('/api/v1/admin', adminRoutes);
const variationAnalysisRoutes = require('./routes/variationAnalysis');
app.use('/api/v1/variation-analysis', variationAnalysisRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genecura', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('Connected to MongoDB');
})
.catch((error) => {
  logger.error('MongoDB connection error:', error);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = app;
