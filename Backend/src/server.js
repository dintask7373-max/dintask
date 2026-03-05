const express = require('express');
const app = require('./app');
const initSubscriptionCron = require('./utils/subscriptionCron');
const initReminderCron = require('./utils/reminderCron');

const PORT = process.env.PORT || 5000;

// Initialize Cron Jobs
initSubscriptionCron();
initReminderCron();

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Socket.io initialization
const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ["http://localhost:5173", "http://localhost:3000"];
const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

const setupChatSocket = require('./chatSocket');
setupChatSocket(io);

const setupSupportSocket = require('./supportSocket');
setupSupportSocket(io);

// Make io accessible globally ....
global.io = io;
app.set('io', io);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('[UNHANDLED REJECTION] Error details:', err);
  if (err.stack) console.error(err.stack);

  // Don't kill the server for network-related errors (DNS/Timeout/Reset)
  const errorCode = err.code || err.error?.code;
  if (errorCode === 'ENOTFOUND' || errorCode === 'ETIMEDOUT' || errorCode === 'ECONNREFUSED' || errorCode === 'ECONNRESET') {
    console.warn(`⚠️  Non-fatal network error (${errorCode}) detected. Server will NOT restart.`);
    return;
  }

  // Close server & exit process for other fatal errors
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION] Error details:', err);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
