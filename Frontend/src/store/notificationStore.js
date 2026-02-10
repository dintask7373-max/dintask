import { create } from 'zustand';
import api from '@/lib/api';

const useNotificationStore = create((set, get) => ({
    notifications: [],
    loading: false,
    error: null,
    unreadCount: 0,

    fetchNotifications: async () => {
        set({ loading: true });
        try {
            const res = await api('/notifications');
            if (res.success) {
                // Count unread
                const unread = res.data.filter(n => !n.isRead).length;
                set({ notifications: res.data, unreadCount: unread, loading: false });
            }
        } catch (error) {
            console.error("Fetch Notifications Error", error);
            set({ loading: false, error: error.message });
        }
    },

    markAsRead: async (id) => {
        try {
            // Optimistic update
            set((state) => {
                const updatedList = state.notifications.map((n) =>
                    n._id === id ? { ...n, isRead: true } : n
                );
                return {
                    notifications: updatedList,
                    unreadCount: updatedList.filter(n => !n.isRead).length
                };
            });

            await api(`/notifications/${id}/read`, { method: 'PUT' });
        } catch (error) {
            console.error("Mark Read Error", error);
        }
    },

    markAllAsRead: async () => {
        try {
            // Optimistic update
            set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
                unreadCount: 0
            }));

            await api('/notifications/read-all', { method: 'PUT' });
        } catch (error) {
            console.error("Mark All Read Error", error);
        }
    },

    deleteNotification: async (id) => {
        try {
            // Optimistic update
            set((state) => {
                const updatedList = state.notifications.filter(n => n._id !== id);
                return {
                    notifications: updatedList,
                    unreadCount: updatedList.filter(n => !n.isRead).length
                };
            });

            await api(`/notifications/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error("Delete Notification Error", error);
        }
    },

    bulkDeleteNotifications: async (ids) => {
        try {
            // Optimistic update
            set((state) => {
                const updatedList = state.notifications.filter(n => !ids.includes(n._id));
                return {
                    notifications: updatedList,
                    unreadCount: updatedList.filter(n => !n.isRead).length
                };
            });

            await api('/notifications/bulk-delete', {
                method: 'POST',
                body: { ids }
            });
        } catch (error) {
            console.error("Bulk Delete Error", error);
        }
    },

    // For real-time updates (if we implement socket later)
    addNotification: (notification) => {
        set((state) => {
            const newList = [notification, ...state.notifications];
            return {
                notifications: newList,
                unreadCount: newList.filter(n => !n.isRead).length
            };
        });
    },
}));

export default useNotificationStore;
