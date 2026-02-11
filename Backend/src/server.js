const app = require('./app');
const initSubscriptionCron = require('./utils/subscriptionCron');

const PORT = process.env.PORT || 5000;

// Initialize Cron Jobs
initSubscriptionCron();

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Socket.io initialization
const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const setupChatSocket = require('./chatSocket');
setupChatSocket(io);

const setupSupportSocket = require('./supportSocket');
setupSupportSocket(io);

// Make io accessible in controllers
app.set('io', io);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
