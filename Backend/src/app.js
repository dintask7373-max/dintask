const express = require('express');
const path = require('path'); // Core module
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

<<<<<<< HEAD
// Load env vars
=======
// Load env vars check and fix
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
dotenv.config();

// Connect to database
connectDB();

<<<<<<< HEAD
=======
// Initialize Firebase Admin
require('./config/firebase');

>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
const app = express();

// Force restart for history pagination fix

const errorHandler = require('./middleware/error');

// Body parser
app.use(express.json());
<<<<<<< HEAD

// Enable CORS
app.use(cors());
=======
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Enable CORS
// Always include production domains + any extra origins from env
const defaultOrigins = ['https://dintask.com', 'https://www.dintask.com', 'http://localhost:5173', 'http://localhost:3000'];
const envOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(o => o.trim()) : [];
const whitelist = [...new Set([...defaultOrigins, ...envOrigins])];
console.log('CORS whitelist:', whitelist);

// Single cors middleware — handles both preflight OPTIONS and regular requests automatically
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    if (whitelist.some(w => w.replace(/\/$/, '') === cleanOrigin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94

// Routes files
const auth = require('./routes/authRoutes');
const employee = require('./routes/employeeRoutes');
const sales = require('./routes/salesExecutiveRoutes');
const manager = require('./routes/managerRoutes');
const admin = require('./routes/adminRoutes');
const superAdmin = require('./routes/superAdminRoutes');
const support = require('./routes/supportLeadRoutes');
const supportTickets = require('./routes/supportTicketRoutes');
const payment = require('./routes/paymentRoutes');

const testimonials = require('./routes/testimonialRoutes');
<<<<<<< HEAD
const landingPage = require('./routes/landingPageRoutes');
=======

>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
const uploadRoutes = require('./routes/uploadRoutes'); // Import upload routes

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/employee', employee);
app.use('/api/v1/sales', sales);
app.use('/api/v1/manager', manager);
app.use('/api/v1/admin', admin);
app.use('/api/v1/superadmin', superAdmin);
app.use('/api/v1/support', support);
app.use('/api/v1/support-tickets', supportTickets);
app.use('/api/v1/payments', payment);

app.use('/api/v1/testimonials', testimonials);
<<<<<<< HEAD
app.use('/api/v1/landing-page', landingPage);
=======

>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
app.use('/api/v1/upload', uploadRoutes); // Mount upload routes
app.use('/api/v1/crm', require('./routes/crmRoutes')); // New CRM Routes
app.use('/api/v1/projects', require('./routes/projectRoutes')); // Project Routes
app.use('/api/v1/tasks', require('./routes/taskRoutes')); // Task Routes
app.use('/api/v1/teams', require('./routes/teamRoutes')); // Team Routes
app.use('/api/v1/notifications', require('./routes/notificationRoutes')); // Notification Routes
app.use('/api/v1/schedules', require('./routes/scheduleRoutes')); // Schedule Routes

// Serve static assets - Uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/v1/invite', require('./routes/inviteRoutes'));
app.use('/api/v1/system-intel', require('./routes/systemIntelRoutes'));
app.use('/api/v1/follow-ups', require('./routes/followUpRoutes'));
app.use('/api/v1/chat', require('./routes/chatRoutes'));
app.use('/api/v1/notes', require('./routes/noteRoutes'));
<<<<<<< HEAD
=======
app.use('/api/v1/landing-page', require('./routes/landingPageRoutes'));
app.use('/api/v1/tactical-modules', require('./routes/tacticalModuleRoutes'));
app.use('/api/v1/landing-page-plans', require('./routes/pricingRoutes'));
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94

app.use(errorHandler);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to DinTask API' });
});

// Basic Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

module.exports = app;
