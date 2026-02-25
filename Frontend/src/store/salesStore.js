import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/api';
import { toast } from 'sonner';

const useSalesStore = create(
    persist(
        (set, get) => ({
            salesReps: [],
            salesPagination: {
                page: 1,
                limit: 10,
                total: 0,
                pages: 1
            },
            crmStats: null, // New state for global stats
            loading: false,
            error: null,

            // Sales activities store (Keeping mock for now as requested only for users integration)
            salesActivities: [
                {
                    id: 'ACT001',
                    type: 'call',
                    title: 'Follow-up call with ABC Corp',
                    description: 'Discuss proposal details',
                    clientId: 'C001',
                    dealId: 'D001',
                    salesRepId: 'S001',
                    date: '2026-01-28T14:00:00',
                    duration: '30',
                    outcome: 'positive',
                    createdAt: '2026-01-28T14:30:00'
                }
            ],

            fetchSalesReps: async (params = {}) => {
                set({ loading: true });
                try {
                    const queryParams = new URLSearchParams();
                    if (params.page) queryParams.append('page', params.page);
                    if (params.limit) queryParams.append('limit', params.limit);
                    if (params.search) queryParams.append('search', params.search);

                    const res = await api(`/admin/sales-executives?${queryParams.toString()}`);
                    if (res.success) {
                        const mappedSales = (res.data || []).map(rep => ({
                            ...rep,
                            id: rep._id, // Ensure ID compatibility for UI
                            // Mock stats if not provided by backend yet
                            totalSales: rep.totalSales || 0,
                            activeDeals: rep.activeDeals || 0,
                            conversionRate: rep.conversionRate || 0,
                            status: rep.status || 'active'
                        }));

                        set({
                            salesReps: mappedSales,
                            salesPagination: res.pagination || { page: 1, limit: 10, total: 0, pages: 1 },
                            loading: false
                        });
                    }
                } catch (error) {
                    console.error("Fetch Sales Reps Error", error);
                    set({ loading: false, error: error.message });
                }
            },

            addSalesRep: async (salesRepData) => {
                set({ loading: true });
                try {
                    const res = await api('/admin/add-member', {
                        method: 'POST',
                        body: { ...salesRepData, role: 'sales_executive' }
                    });

                    if (res.success) {
<<<<<<< HEAD
                        set((state) => ({
                            salesReps: [...state.salesReps, {
                                ...res.data,
                                id: res.data._id,
                                totalSales: 0,
                                activeDeals: 0,
                                conversionRate: 0
                            }],
                            loading: false
                        }));
=======
                        get().fetchSalesReps();

                        // Background re-fetch for global state synchronization
                        import('./adminStore').then(m => m.default.getState().fetchDashboardStats())
                            .catch(err => console.error("Background sync error:", err));

>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
                        toast.success('Sales Representative added successfully');
                    }
                } catch (error) {
                    console.error("Add Sales Rep Error", error);
                    toast.error(error.message || 'Failed to add sales rep');
                    set({ loading: false });
                    throw error; // Re-throw so caller can handle
                }
            },

            updateSalesRep: async (salesRepId, updatedData) => {
                try {
                    const res = await api(`/admin/users/${salesRepId}`, {
                        method: 'PUT',
                        body: { ...updatedData, originRole: 'sales_executive' }
                    });
                    if (res.success) {
                        get().fetchSalesReps();

                        // Background re-fetch for global state synchronization
                        import('./adminStore').then(m => m.default.getState().fetchDashboardStats())
                            .catch(err => console.error("Background sync error:", err));

                        toast.success('Sales Representative updated');
                    }
                } catch (error) {
                    console.error("Update Sales Rep Error", error);
                    toast.error(error.message || 'Failed to update sales rep');
                }
            },

            deleteSalesRep: async (salesRepId) => {
                try {
<<<<<<< HEAD
                    await api(`/admin/users/${salesRepId}`, {
                        method: 'DELETE',
                        body: { role: 'sales_executive' }
                    });
                    set((state) => ({
                        salesReps: state.salesReps.filter((salesRep) => salesRep.id !== salesRepId),
                    }));
                    toast.success('Sales Representative removed');
=======
                    const res = await api(`/admin/users/${salesRepId}`, {
                        method: 'DELETE',
                        body: { role: 'sales_executive' }
                    });
                    if (res.success) {
                        get().fetchSalesReps();

                        // Background re-fetch for global state synchronization
                        import('./adminStore').then(m => m.default.getState().fetchDashboardStats())
                            .catch(err => console.error("Background sync error:", err));

                        toast.success('Sales Representative removed');
                    }
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
                } catch (error) {
                    console.error("Delete Sales Rep Error", error);
                    toast.error(error.message || 'Failed to remove sales rep');
                }
            },

            getSalesRepByEmail: (email) => {
                return get().salesReps.find(s => s.email === email);
            },

            getSalesRepById: (id) => {
                return get().salesReps.find(s => s.id === id);
            },

            // Sales activities methods
            addSalesActivity: (activity) => {
                set((state) => ({
                    salesActivities: [
                        ...state.salesActivities,
                        {
                            ...activity,
                            id: `ACT${Date.now()}`,
                            createdAt: new Date().toISOString()
                        }
                    ]
                }));
            },

            updateSalesActivity: (activityId, updatedData) => {
                set((state) => ({
                    salesActivities: state.salesActivities.map((activity) =>
                        activity.id === activityId ? { ...activity, ...updatedData } : activity
                    )
                }));
            },

            deleteSalesActivity: (activityId) => {
                set((state) => ({
                    salesActivities: state.salesActivities.filter((activity) => activity.id !== activityId)
                }));
            },

            getActivitiesByClientId: (clientId) => {
                return get().salesActivities.filter(activity => activity.clientId === clientId);
            },

            getActivitiesByDealId: (dealId) => {
                return get().salesActivities.filter(activity => activity.dealId === dealId);
            },

            getActivitiesBySalesRepId: (salesRepId) => {
                return get().salesActivities.filter(activity => activity.salesRepId === salesRepId);
            },

            getRecentActivities: (limit = 10) => {
                return get().salesActivities
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, limit);
            }
        }),
        {
            name: 'dintask-sales-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);

export default useSalesStore;