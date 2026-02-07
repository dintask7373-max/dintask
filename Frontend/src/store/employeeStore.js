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
                const employees = allUsers.filter(u => u.role === 'employee');
                const managers = allUsers.filter(u => u.role === 'manager');
                const sales = allUsers.filter(u => u.role === 'sales' || u.role === 'sales_executive');

                // Store only employees for the Employee Management page
                set({ employees: employees, loading: false });

                // Update other stores if they exist/are imported? 
                // Actually, EmployeeManagement uses separate hooks. 
                // We should probably just use 'employees' (allUsers) as the main list for the table.
                // But for "Reports To" lookup, we need managers.

                // Hack: We will just store everyone in 'employees' for the table.
                // But we need to make sure the "Reports To" lookup works. 
                // We'll expose a computed 'allManagers' from this store or ensure ManagerStore is populated.

                // Ideally, we should dispatch to other stores, but to keep it simple and working:
                // We will rely on 'employees' containing everyone for the list.
                // And we will use the same list to find managers for the "Reports To" column if needed.
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

    // ... other actions if needed ...
}));

export default useEmployeeStore;
