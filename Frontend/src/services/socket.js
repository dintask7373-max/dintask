import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
    socket = null;
    supportResponseHandler = null;
    supportTicketHandler = null;
    supportTypingHandler = null;
    notificationHandler = null;
    forceLogoutHandler = null;
    pendingTicketJoin = null;

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
            this._registerPendingListeners();
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
        if (this.socket) {
            this.socket.off('message_received');
            this.socket.on('message_received', callback);
        }
    }

    emitTyping(room) {
        if (this.socket) this.socket.emit('typing', room);
    }

    emitStopTyping(room) {
        if (this.socket) this.socket.emit('stop_typing', room);
    }

    onTyping(callback) {
        if (this.socket) {
            this.socket.off('typing');
            this.socket.on('typing', callback);
        }
    }

    onStopTyping(callback) {
        if (this.socket) {
            this.socket.off('stop_typing');
            this.socket.on('stop_typing', callback);
        }
    }

    // Support Ticket Real-time
    joinTicket(ticketId) {
        if (this.socket) {
            this.socket.emit('join_ticket', ticketId);
        } else {
            // Queue for when connected
            this.pendingTicketJoin = ticketId;
        }
    }

    leaveTicket(ticketId) {
        if (this.socket) this.socket.emit('leave_ticket', ticketId);
    }

    onSupportResponse(callback) {
        if (this.socket) {
            this.socket.off('new_support_response');
            this.socket.on('new_support_response', callback);
        } else {
            // Store for delayed registration
            this.supportResponseHandler = callback;
        }
    }

    onSupportTicket(callback) {
        if (this.socket) {
            this.socket.off('new_support_ticket');
            this.socket.on('new_support_ticket', callback);
        } else {
            // Store for delayed registration
            this.supportTicketHandler = callback;
        }
    }

    emitSupportTyping(ticketId, userName) {
        if (this.socket) {
            this.socket.emit('support_typing', { ticketId, userName });
        }
    }

    onSupportTyping(callback) {
        if (this.socket) {
            this.socket.off('support_typing');
            this.socket.on('support_typing', callback);
        } else {
            this.supportTypingHandler = callback;
        }
    }

    onNotificationReceived(callback) {
        if (this.socket) {
            this.socket.off('new_notification');
            this.socket.on('new_notification', callback);
        } else {
            this.notificationHandler = callback;
        }
    }

    onForceLogout(callback) {
        if (this.socket) {
            this.socket.off('forceLogout');
            this.socket.on('forceLogout', callback);
        } else {
            this.forceLogoutHandler = callback;
        }
    }

    // New helper to register pending listeners
    _registerPendingListeners() {
        if (this.supportResponseHandler) this.onSupportResponse(this.supportResponseHandler);
        if (this.supportTicketHandler) this.onSupportTicket(this.supportTicketHandler);
        if (this.supportTypingHandler) this.onSupportTyping(this.supportTypingHandler);
        if (this.notificationHandler) this.onNotificationReceived(this.notificationHandler);
        if (this.forceLogoutHandler) this.onForceLogout(this.forceLogoutHandler);
        
        if (this.pendingTicketJoin) {
            this.joinTicket(this.pendingTicketJoin);
            this.pendingTicketJoin = null;
        }
    }
}

const socketService = new SocketService();
export default socketService;
