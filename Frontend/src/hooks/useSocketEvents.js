import { useEffect } from 'react';
import socketService from '@/services/socket';
import useChatStore from '@/store/chatStore';
import useAuthStore from '@/store/authStore';

const useSocketEvents = () => {
    const { isAuthenticated, user } = useAuthStore();
    const { addMessage } = useChatStore();

    useEffect(() => {
        if (isAuthenticated && user) {
            // Connect socket
            socketService.connect(user);

            // Set up listeners
            socketService.onMessageReceived((message) => {
                console.log('New message received via socket:', message);
                addMessage(message);
            });

            return () => {
                // We might not want to disconnect every time this hook unmounts 
                // if it's used in App.jsx. But for safety:
                // socketService.disconnect();
            };
        }
    }, [isAuthenticated, user, addMessage]);
};

export default useSocketEvents;
