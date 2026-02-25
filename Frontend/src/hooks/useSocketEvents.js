import { useEffect } from 'react';
import socketService from '@/services/socket';
import useChatStore from '@/store/chatStore';
import useAuthStore from '@/store/authStore';
<<<<<<< HEAD
=======
import useTicketStore from '@/store/ticketStore';
import useNotificationStore from '@/store/notificationStore';
import { toast } from 'sonner';
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94

const useSocketEvents = () => {
    const { isAuthenticated, user } = useAuthStore();
    const { addMessage } = useChatStore();
<<<<<<< HEAD
=======
    const { addNotification } = useNotificationStore();

    const { initializeSocket } = useTicketStore();
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94

    useEffect(() => {
        if (isAuthenticated && user) {
            // Connect socket
            socketService.connect(user);

<<<<<<< HEAD
            // Set up listeners
=======
            // Set up chat listeners
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
            socketService.onMessageReceived((message) => {
                console.log('New message received via socket:', message);
                addMessage(message);
            });

<<<<<<< HEAD
            return () => {
                // We might not want to disconnect every time this hook unmounts 
                // if it's used in App.jsx. But for safety:
                // socketService.disconnect();
            };
        }
    }, [isAuthenticated, user, addMessage]);
=======
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
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
};

export default useSocketEvents;
