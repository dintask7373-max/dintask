import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
    socket = null;

    connect(userData) {
        if (this.socket) return;

        this.socket = io(SOCKET_URL, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('Connected to Socket.io server');
            this.socket.emit('setup', userData);
        });

        this.socket.on('connected', () => {
            console.log('Real-time updates enabled');
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinChat(room) {
        if (this.socket) this.socket.emit('join_chat', room);
    }

    sendMessage(messageData) {
        if (this.socket) this.socket.emit('new_message', messageData);
    }

    onMessageReceived(callback) {
        if (this.socket) this.socket.on('message_received', callback);
    }

    emitTyping(room) {
        if (this.socket) this.socket.emit('typing', room);
    }

    emitStopTyping(room) {
        if (this.socket) this.socket.emit('stop_typing', room);
    }

    onTyping(callback) {
        if (this.socket) this.socket.on('typing', callback);
    }

    onStopTyping(callback) {
        if (this.socket) this.socket.on('stop_typing', callback);
    }
}

const socketService = new SocketService();
export default socketService;
