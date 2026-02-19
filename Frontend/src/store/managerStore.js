import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';

const useManagerStore = create((set, get) => ({
    managers: [],
    allManagers: [], // Full list for dropdowns
    employeePerformance: [], // Performance metrics data
    loading: false,
    error: null,
    managerPagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
    },

    fetchManagers: async (params = {}) => {
        set({ loading: true });
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.search) queryParams.append('search', params.search);

            const res = await api(`/admin/managers?${queryParams.toString()}`);
            if (res.success) {
                set({
                    managers: res.data,
                    managerPagination: res.pagination || { page: 1, limit: 10, total: 0, pages: 1 },
                    loading: false
                });
            }
        } catch (error) {
            console.error("Fetch Managers Error", error);
            set({ loading: false, error: error.message });
        }
    },

    fetchAllManagers: async () => {
        try {
            // Fetch with high limit to get all managers for dropdowns
            const res = await api('/admin/managers?limit=1000');
            if (res.success) {
                set({ allManagers: res.data });
            }
        } catch (error) {
            console.error("Fetch All Managers Error", error);
        }
    },

    addManager: async (managerData) => {
        set({ loading: true });
        try {
            const res = await api('/admin/add-member', {
                method: 'POST',
                body: { ...managerData, role: 'manager' }
            });

            if (res.success) {
                set((state) => ({
                    managers: [...state.managers, res.data],
                    loading: false
                }));
                get().fetchManagers(); // Re-fetch to sync pagination and lists

                // Background re-fetches for global state synchronization
                Promise.all([
                    import('./adminStore').then(m => m.default.getState().fetchDashboardStats()),
                    import('./employeeStore').then(m => m.default.getState().fetchSubscriptionLimit())
                ]).catch(err => console.error("Background sync error:", err));

                toast.success('Manager added successfully');
                return true;
            }
        } catch (error) {
            console.error("Add Manager Error", error);
            toast.error(error.message || 'Failed to add manager');
            set({ loading: false });
            return false;
        }
    },

    updateManager: async (id, updatedData) => {
        set({ loading: true });
        try {
            const res = await api(`/admin/users/${id}`, {
                method: 'PUT',
                body: { ...updatedData, originRole: 'manager' }
            });

            if (res.success) {
                set((state) => ({
                    managers: state.managers.map((m) => (m._id === id ? res.data : m)),
                    loading: false
                }));
                get().fetchManagers();

                // Background re-fetches for global state synchronization
                Promise.all([
                    import('./adminStore').then(m => m.default.getState().fetchDashboardStats()),
                    import('./employeeStore').then(m => m.default.getState().fetchSubscriptionLimit())
                ]).catch(err => console.error("Background sync error:", err));

                toast.success('Manager updated successfully');
                return true;
            }
        } catch (error) {
            console.error("Update Manager Error", error);
            toast.error(error.message || 'Failed to update manager');
            set({ loading: false });
            return false;
        }
    },

    deleteManager: async (id) => {
        try {
            const res = await api(`/admin/users/${id}`, {
                method: 'DELETE',
                body: { role: 'manager' }
            });

            if (res.success) {
                set((state) => ({
                    managers: state.managers.filter((m) => m._id !== id),
                }));
                get().fetchManagers(); // Re-fetch to sync pagination and lists

                // Background re-fetches for global state synchronization
                Promise.all([
                    import('./adminStore').then(m => m.default.getState().fetchDashboardStats()),
                    import('./employeeStore').then(m => m.default.getState().fetchSubscriptionLimit())
                ]).catch(err => console.error("Background sync error:", err));

                toast.success('Manager deleted');
            }
        } catch (error) {
            console.error("Delete Manager Error", error);
            toast.error(error.message || 'Failed to delete manager');
        }
    },

    fetchEmployeePerformance: async () => {
        set({ loading: true });
        try {
            const res = await api('/manager/performance/employees');
            if (res.success) {
                set({
                    employeePerformance: res.data,
                    loading: false
                });
            }
        } catch (error) {
            console.error("Fetch Employee Performance Error", error);
            set({ loading: false, error: error.message });
        }
    },

    getManagerByEmail: (email) => {
        return get().managers.find(m => m.email === email);
    }
}));

export default useManagerStore;
