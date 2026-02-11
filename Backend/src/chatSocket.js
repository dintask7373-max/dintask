const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

const setupChatSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('User Connected:', socket.id);

        // Join personal room for notifications and setup
        socket.on('setup', (userData) => {
            const userId = userData?.id || userData?._id;
            if (userId) {
                socket.join(userId);
                console.log(`User joined personal room: ${userId}`);
                socket.emit('connected');
            }
        });

        // Join a specific chat room
        socket.on('join_chat', (room) => {
            socket.join(room);
            console.log('User joined room:', room);
        });

        // Handle typing events
        socket.on('typing', (room) => {
            socket.in(room).emit('typing', room);
        });

        socket.on('stop_typing', (room) => {
            socket.in(room).emit('stop_typing', room);
        });

        // Handle new message
        socket.on('new_message', async (newMessageReceived) => {
            const { conversationId, senderId, senderModel, text, participants } = newMessageReceived;

            if (!conversationId || !senderId || !text) return;

            // Optional: Save to DB here if not already saved via REST API
            // For this design, we will usually save via API first then emit socket, 
            // OR save here. Let's assume we save via API for better error handling/response.
            // But if we want real-time first, we can do it here.

            // Assuming participants is an array of user IDs
            if (!participants || !Array.isArray(participants)) return;

            participants.forEach(participant => {
                const participantId = participant.user || participant; // handle both structures
                if (participantId === senderId) return;

                socket.in(participantId).emit('message_received', newMessageReceived);
            });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User Disconnected:', socket.id);
        });
    });
};

module.exports = setupChatSocket;
