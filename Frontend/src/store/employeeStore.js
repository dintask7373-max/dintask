import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';

const useEmployeeStore = create((set, get) => ({
    employees: [],
    pendingRequests: [],
    loading: false,
    subscriptionLimit: null, // Will be fetched from backend
    limitStatus: {
        allowed: true,
        current: 0,
        limit: 0,
        remaining: 0,
        breakdown: { managers: 0, salesExecutives: 0, employees: 0 }
    },

    fetchSubscriptionLimit: async () => {
        try {
            const res = await api('/admin/subscription-limit');
            if (res.success) {
                set({
                    limitStatus: res.data,
                    subscriptionLimit: res.data.limit
                });
                return res.data;
            }
        } catch (error) {
            console.error("Fetch Subscription Limit Error", error);
            return null;
        }
    },

    fetchEmployees: async () => {
        set({ loading: true });
        try {
            const res = await api('/admin/users');
            if (res.success) {
                const allUsers = res.data || [];

                // Store ALL users (employees, managers, sales executives) 
                // Components will filter based on role as needed
                set({ employees: allUsers, loading: false });
            }
        } catch (error) {
            console.error("Fetch Employees Error", error);
            set({ loading: false });
        }
    },

    fetchPendingRequests: async () => {
        try {
            const res = await api('/admin/join-requests');
            if (res.success) {
                set({ pendingRequests: res.data || [] });
            }
        } catch (error) {
            console.error("Fetch Pending Requests Error", error);
        }
    },

    addEmployee: async (employeeData) => {
        set({ loading: true });
        try {
            // Use the "Direct Add" endpoint which sets status='active'
            const res = await api('/admin/add-member', {
                method: 'POST',
                body: employeeData
            });

            if (res.success) {
                set((state) => ({
                    employees: [...state.employees, res.data],
                    loading: false
                }));
                toast.success('Team member added successfully');
                return true;
            }
        } catch (error) {
            console.error("Add Employee Error", error);
            toast.error(error.message || 'Failed to add member');
            set({ loading: false });
            throw error;
        }
    },

    approveRequest: async (id, role) => {
        try {
            const res = await api(`/admin/join-requests/${id}/approve`, {
                method: 'PUT',
                body: { role } // Role is required by backend to find the collection
            });

            if (res.success) {
                set((state) => ({
                    pendingRequests: state.pendingRequests.filter(r => r._id !== id),
                    employees: [...state.employees, res.data]
                }));
                return true;
            }
        } catch (error) {
            console.error("Approve Request Error", error);
            toast.error(error.message || 'Failed to approve');
            return false;
        }
    },

    rejectRequest: async (id, role) => {
        try {
            await api(`/admin/join-requests/${id}/reject`, {
                method: 'PUT',
                body: { role }
            });
            set((state) => ({
                pendingRequests: state.pendingRequests.filter(r => r._id !== id)
            }));
            return true;
        } catch (error) {
            console.error("Reject Request Error", error);
            toast.error(error.message || 'Failed to reject');
            return false;
        }
    },

    deleteEmployee: async (id, role) => {
        try {
            await api(`/admin/users/${id}`, {
                method: 'DELETE',
                body: { role }
            });
            set((state) => ({
                employees: state.employees.filter((emp) => emp._id !== id),
            }));
            toast.success('User deleted');
        } catch (error) {
            console.error("Delete User Error", error);
            toast.error(error.message || 'Failed to delete');
        }
    },

    addPendingRequest: async (requestData) => {
        set({ loading: true });
        try {
            // Map workspaceId to adminId for the backend register endpoint
            // and normalize role
            const registrationData = {
                name: requestData.fullName,
                email: requestData.email,
                password: requestData.password,
                role: requestData.role?.toLowerCase() === 'sales' ? 'sales_executive' : requestData.role?.toLowerCase(),
                adminId: requestData.workspaceId
            };

            const res = await api('/auth/register', {
                method: 'POST',
                body: registrationData
            });

            if (res.success) {
                toast.success('Join request sent! Awaiting Admin approval.');
                set({ loading: false });
                return true;
            }
        } catch (error) {
            console.error("Add Pending Request Error", error);
            toast.error(error.message || 'Failed to send join request');
            set({ loading: false });
            throw error;
        }
    }
}));

export default useEmployeeStore;
