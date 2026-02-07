import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/api';
import { toast } from 'sonner';

const useSalesStore = create(
    persist(
        (set, get) => ({
            salesReps: [],
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

            fetchSalesReps: async () => {
                set({ loading: true });
                try {
                    const res = await api('/admin/users');
                    if (res.success) {
                        const allUsers = res.data || [];
                        // Filter for Sales roles
                        const sales = allUsers.filter(u => u.role === 'sales' || u.role === 'sales_executive');

                        // Map to preserve UI fields that aren't in backend yet (mocking stats)
                        const mappedSales = sales.map(rep => ({
                            ...rep,
                            id: rep._id, // Ensure ID compatibility
                            totalSales: rep.totalSales || 0,
                            activeDeals: rep.activeDeals || 0,
                            conversionRate: rep.conversionRate || 0,
                            status: rep.status || 'active'
                        }));

                        set({ salesReps: mappedSales, loading: false });
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
                        toast.success('Sales Representative added successfully');
                    }
                } catch (error) {
                    console.error("Add Sales Rep Error", error);
                    toast.error(error.message || 'Failed to add sales rep');
                    set({ loading: false });
                    throw error; // Re-throw so caller can handle
                }
            },

            updateSalesRep: (salesRepId, updatedData) => {
                set((state) => ({
                    salesReps: state.salesReps.map((salesRep) =>
                        salesRep.id === salesRepId ? { ...salesRep, ...updatedData } : salesRep
                    ),
                }));
            },

            deleteSalesRep: async (salesRepId) => {
                try {
                    await api(`/admin/users/${salesRepId}`, {
                        method: 'DELETE',
                        body: { role: 'sales_executive' }
                    });
                    set((state) => ({
                        salesReps: state.salesReps.filter((salesRep) => salesRep.id !== salesRepId),
                    }));
                    toast.success('Sales Representative removed');
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