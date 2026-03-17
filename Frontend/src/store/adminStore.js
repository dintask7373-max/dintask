import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1`;

// Helper to get token from persisted auth storage
const getAuthToken = () => {
    try {
        const authStorage = localStorage.getItem('dintask-auth-storage');
        if (authStorage) {
            const parsed = JSON.parse(authStorage);
            return parsed.state?.token;
        }
    } catch (error) {
        console.error('Error reading auth token:', error);
    }
    return null;
};

const useAdminStore = create((set) => ({
    dashboardStats: null,
    revenueChartData: null,
    pipelineChartData: null,
    projectHealthChartData: null,
    actionableLists: null,
    loading: false,
    error: null,

    // Fetch Dashboard Statistics
    fetchDashboardStats: async () => {
        set({ loading: true, error: null });
        try {
            const token = getAuthToken();

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get(`${API_URL}/admin/dashboard-stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                set({ dashboardStats: response.data.data, loading: false });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch dashboard stats';
            set({ error: errorMessage, loading: false });
            // Silence background sync error
            console.warn('Silent background sync failure:', errorMessage);
        }
    },

    // Fetch Revenue Chart Data
    fetchRevenueChart: async (period = 6) => {
        try {
            const token = getAuthToken();
            if (!token) return;

            const response = await axios.get(`${API_URL}/admin/dashboard-charts/revenue?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                set({ revenueChartData: response.data.data });
            }
        } catch (error) {
            console.error('Failed to fetch revenue chart:', error);
        }
    },

    // Fetch Sales Pipeline Chart Data
    fetchPipelineChart: async () => {
        try {
            const token = getAuthToken();
            if (!token) return;

            const response = await axios.get(`${API_URL}/admin/dashboard-charts/pipeline`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                set({ pipelineChartData: response.data.data });
            }
        } catch (error) {
            console.error('Failed to fetch pipeline chart:', error);
        }
    },

    // Fetch Project Health Chart Data
    fetchProjectHealthChart: async () => {
        try {
            const token = getAuthToken();
            if (!token) return;

            const response = await axios.get(`${API_URL}/admin/dashboard-charts/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                set({ projectHealthChartData: response.data.data });
            }
        } catch (error) {
            console.error('Failed to fetch project health chart:', error);
        }
    },

    // Fetch Actionable Lists
    fetchActionableLists: async () => {
        try {
            const token = getAuthToken();
            if (!token) return;

            const response = await axios.get(`${API_URL}/admin/dashboard-actionable-lists`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                set({ actionableLists: response.data.data });
            }
        } catch (error) {
            console.error('Failed to fetch actionable lists:', error);
        }
    },

    // Optimistic update for actionable items
    updateActionableTicket: (ticketId, updates) => {
        set((state) => {
            if (!state.actionableLists) return state;

            // If the status is changing to Resolved or Closed, remove it from the Open Tickets list
            // also update the counts in dashboardStats
            const isRemoving = updates.status && ['Resolved', 'Closed'].includes(updates.status);

            let newOpenTickets = state.actionableLists.openTickets;
            let newPendingActions = state.dashboardStats?.pendingActions || 0;
            let newOpenTicketsCount = state.dashboardStats?.breakdown?.openTickets || 0;

            if (isRemoving) {
                const ticketExists = newOpenTickets.some(t => t._id === ticketId);
                if (ticketExists) {
                    newOpenTickets = newOpenTickets.filter(t => t._id !== ticketId);
                    newPendingActions = Math.max(0, newPendingActions - 1);
                    newOpenTicketsCount = Math.max(0, newOpenTicketsCount - 1);
                }
            } else {
                newOpenTickets = newOpenTickets.map((t) =>
                    t._id === ticketId ? { ...t, ...updates } : t
                );
            }

            return {
                dashboardStats: state.dashboardStats ? {
                    ...state.dashboardStats,
                    pendingActions: newPendingActions,
                    breakdown: {
                        ...state.dashboardStats.breakdown,
                        openTickets: newOpenTicketsCount
                    }
                } : state.dashboardStats,
                actionableLists: {
                    ...state.actionableLists,
                    openTickets: newOpenTickets
                }
            };
        });
    },

    // Clear dashboard stats
    clearDashboardStats: () => set({
        dashboardStats: null,
        revenueChartData: null,
        pipelineChartData: null,
        projectHealthChartData: null,
        actionableLists: null,
        error: null
    }),

    // Send Workspace Announcement
    sendAnnouncement: async (announcementData) => {
        set({ loading: true, error: null });
        try {
            const token = getAuthToken();
            if (!token) throw new Error('Authentication required');

            const response = await axios.post(`${API_URL}/admin/announcement`, announcementData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                set({ loading: false });
                toast.success('Announcement broadcasted successfully');
                return true;
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to send announcement';
            set({ error: errorMessage, loading: false });
            toast.error(errorMessage);
            return false;
        }
    }
}));

export default useAdminStore;
