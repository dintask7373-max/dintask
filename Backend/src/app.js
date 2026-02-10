const express = require('express');
const path = require('path'); // Core module
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Force restart for history pagination fix

const errorHandler = require('./middleware/error');

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

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
const landingPage = require('./routes/landingPageRoutes');
const testimonials = require('./routes/testimonialRoutes');
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
app.use('/api/v1/landing-page', landingPage);
app.use('/api/v1/testimonials', testimonials);
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
