import { useEffect } from 'react';
import socketService from '@/services/socket';
import useChatStore from '@/store/chatStore';
import useAuthStore from '@/store/authStore';
import useTicketStore from '@/store/ticketStore';
import useNotificationStore from '@/store/notificationStore';
import { toast } from 'sonner';

const useSocketEvents = () => {
    const { isAuthenticated, user } = useAuthStore();
    const { addMessage } = useChatStore();
    const { addNotification } = useNotificationStore();

    const { initializeSocket } = useTicketStore();

    useEffect(() => {
        if (isAuthenticated && user) {
            // Connect socket
            socketService.connect(user);

            // Set up chat listeners
            socketService.onMessageReceived((message) => {
                console.log('New message received via socket:', message);
                addMessage(message);
            });

            // Set up notification listener
            socketService.onNotificationReceived((notification) => {
                console.log('New notification received via socket:', notification);

                // USER REQUIREMENT: Admin should NOT receive task-related notifications
                const isTaskRelated = ['task_assigned', 'task_overdue'].includes(notification.type);
                const isAdmin = user.role === 'admin';

                if (isAdmin && isTaskRelated) {
                    console.log('Filtered task notification for Admin');
                    return;
                }

                addNotification(notification);

                // Show toast for everyone EXCEPT Superadmins (as per preference)
                const isSuperAdmin = ['superadmin', 'superadmin_staff', 'super_admin'].includes(user.role);
                if (!isSuperAdmin) {
                    toast.info(notification.title, {
                        description: notification.message,
                    });
                }
            });

            // Set up support ticket listeners globally
            initializeSocket(user._id || user.id);

            return () => {
                // Cleanup handled inside service for some events, 
                // but we can explicitly nullify if needed.
            };
        }
    }, [isAuthenticated, user, addMessage, addNotification, initializeSocket]);
};

export default useSocketEvents;
