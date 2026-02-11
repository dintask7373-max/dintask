import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

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
            toast.error(errorMessage);
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

    // Clear dashboard stats
    clearDashboardStats: () => set({
        dashboardStats: null,
        revenueChartData: null,
        pipelineChartData: null,
        projectHealthChartData: null,
        error: null
    })
}));

export default useAdminStore;
