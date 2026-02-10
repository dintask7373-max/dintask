import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';

const useManagerStore = create((set, get) => ({
    managers: [],
    allManagers: [], // Full list for dropdowns
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
        // TODO: Implement update API if exists, for now just local or generic update
        // Assuming generic update might not exist yet or varies.
        // For dashboard count, this is less critical.
        // We will keep local update for now or implement if we find the endpoint.
        console.warn("Update Manager API not fully implemented yet");
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
                toast.success('Manager deleted');
            }
        } catch (error) {
            console.error("Delete Manager Error", error);
            toast.error(error.message || 'Failed to delete manager');
        }
    },

    getManagerByEmail: (email) => {
        return get().managers.find(m => m.email === email);
    }
}));

export default useManagerStore;
