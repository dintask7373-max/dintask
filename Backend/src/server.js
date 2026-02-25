<<<<<<< HEAD
=======
const express = require('express');
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
const app = require('./app');
const initSubscriptionCron = require('./utils/subscriptionCron');

const PORT = process.env.PORT || 5000;

// Initialize Cron Jobs
initSubscriptionCron();

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Socket.io initialization
<<<<<<< HEAD
const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
=======
const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ["http://localhost:5173", "http://localhost:3000"];
const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: allowedOrigins,
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
    methods: ["GET", "POST"]
  }
});

const setupChatSocket = require('./chatSocket');
setupChatSocket(io);

const setupSupportSocket = require('./supportSocket');
setupSupportSocket(io);

<<<<<<< HEAD
// Make io accessible in controllers
=======
// Make io accessible globally ....
global.io = io;
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
app.set('io', io);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
