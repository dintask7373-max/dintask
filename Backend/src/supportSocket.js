const SupportTicket = require('./models/SupportTicket');

/**
 * Setup Socket.io for Support Tickets
 * @param {import('socket.io').Server} io 
 */
const setupSupportSocket = (io) => {
  io.on('connection', (socket) => {
    // console.log('Support Socket Connection:', socket.id);

    // Join a specific ticket room
    socket.on('join_ticket', (ticketId) => {
      if (!ticketId) return;
      socket.join(ticketId);
      console.log(`Socket ${socket.id} joined ticket room: ${ticketId}`);
    });

    // Leave a ticket room
    socket.on('leave_ticket', (ticketId) => {
      if (!ticketId) return;
      socket.leave(ticketId);
      console.log(`Socket ${socket.id} left ticket room: ${ticketId}`);
    });

    // Handle typing events for support
    socket.on('support_typing', ({ ticketId, userName }) => {
      socket.to(ticketId).emit('support_typing', { ticketId, userName });
    });

    socket.on('support_stop_typing', (ticketId) => {
      socket.to(ticketId).emit('support_stop_typing', ticketId);
    });

    socket.on('disconnect', () => {
      // socket.rooms is cleared automatically
    });
  });
};

module.exports = setupSupportSocket;
