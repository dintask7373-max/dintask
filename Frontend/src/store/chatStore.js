import { create } from 'zustand';
import apiRequest from '@/lib/api';
import socketService from '@/services/socket';

const useChatStore = create((set, get) => ({
    conversations: [],
    activeConversation: null,
    messages: [],
    loading: false,
    onlineUsers: [],

    setOnlineUsers: (users) => set({ onlineUsers: users }),

    fetchConversations: async () => {
        set({ loading: true });
        try {
            const response = await apiRequest('/chat');
            if (response.success) {
                set({ conversations: response.data });
            }
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            set({ loading: false });
        }
    },

    setActiveConversation: (conversation) => {
        set({ activeConversation: conversation });
        if (conversation) {
            get().fetchMessages(conversation._id);
            socketService.joinChat(conversation._id);
        }
    },

    fetchMessages: async (conversationId) => {
        set({ loading: true });
        try {
            const response = await apiRequest(`/chat/messages/${conversationId}`);
            if (response.success) {
                set({ messages: response.data });
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            set({ loading: false });
        }
    },

    sendMessage: async (content, conversationId, senderId, senderModel, participants) => {
        try {
            const response = await apiRequest('/chat/message', {
                method: 'POST',
                body: { content, conversationId, senderModel }
            });

            if (response.success) {
                const newMessage = response.data;
                set((state) => ({
                    messages: [...state.messages, newMessage]
                }));

                // Emit socket event
                socketService.sendMessage({
                    ...newMessage,
                    participants // Array of participant user IDs
                });

                // Update conversation list last message
                get().fetchConversations();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    },

    addMessage: (message) => {
        const { messages, activeConversation } = get();

        // Check if message already exists in state (by _id)
        const messageExists = messages.some(m => m._id === message._id);
        if (messageExists) return;

        // Only add message if it belongs to active conversation
        const msgConvId = message.conversationId?._id || message.conversationId;
        if (activeConversation && msgConvId === activeConversation._id) {
            set({ messages: [...messages, message] });
        }

        // Always refresh conversations to update last message/unread count
        get().fetchConversations();
    },

    accessOrCreateChat: async (userId, userModel, workspaceId) => {
        set({ loading: true });
        try {
            const response = await apiRequest('/chat', {
                method: 'POST',
                body: { userId, userModel, workspaceId }
            });
            if (response.success) {
                const conversation = response.data;
                set((state) => {
                    const exists = state.conversations.find(c => c._id === conversation._id);
                    return {
                        conversations: exists ? state.conversations : [conversation, ...state.conversations],
                        activeConversation: conversation
                    };
                });
                get().fetchMessages(conversation._id);
                socketService.joinChat(conversation._id);
                return conversation;
            }
        } catch (error) {
            console.error('Failed to access/create chat:', error);
        } finally {
            set({ loading: false });
        }
    }
}));

export default useChatStore;
