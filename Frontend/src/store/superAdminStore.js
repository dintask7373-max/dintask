import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import apiRequest from '../lib/api';

const useSuperAdminStore = create(
    persist(
        (set, get) => ({
            admins: [],
            plans: [],
            stats: {
                totalRevenue: 0,
                activeCompanies: 0,
                avgCompletionRate: 0,
                totalUsers: 0,
                activeUsers: 0,
                monthlyGrowthPercentage: 0
            },
            systemSettings: {
                platformName: 'DinTask CRM',
                supportEmail: 'support@dintask.com',
                maintenanceMode: false,
                force2FA: true,
                sessionTimeout: 24 // hours
            },
            inquiries: [],
            roleDistribution: [],
            growthData: [],
            hourlyActivity: [],
            recentLogins: [],
            transactions: [],
            subscriptionHistory: [],
            billingStats: {
                totalRevenue: 0,
                activeSubscriptions: 0,
                pendingRefunds: 0,
                churnRate: 0
            },
            loading: false,

            fetchAdmins: async () => {
                set({ loading: true });
                try {
                    const response = await apiRequest('/superadmin/admins');
                    if (response.success) {
                        set({ admins: response.data, loading: false });
                    }
                } catch (err) {
                    console.error('Failed to fetch admins:', err);
                    set({ loading: false });
                }
            },

            fetchDashboardStats: async () => {
                try {
                    const response = await apiRequest('/superadmin/dashboard/summary');
                    if (response.success) {
                        set((state) => ({
                            stats: {
                                ...state.stats,
                                totalUsers: response.data.totalUsers,
                                activeUsers: response.data.activeUsers,
                                monthlyGrowthPercentage: response.data.monthlyGrowthPercentage,
                                activeCompanies: response.data.totalUsers
                            }
                        }));
                    }
                } catch (err) {
                    console.error('Failed to fetch dashboard stats:', err);
                }
            },

            fetchRoleDistribution: async () => {
                try {
                    const response = await apiRequest('/superadmin/dashboard/role-distribution');
                    if (response.success) {
                        const dist = response.data;
                        const formatted = [
                            { name: 'Admins', value: dist.admins, color: '#6366f1' },
                            { name: 'Managers', value: dist.managers, color: '#a855f7' },
                            { name: 'Sales', value: dist.sales, color: '#f59e0b' },
                            { name: 'Employees', value: dist.employees, color: '#10b981' }
                        ];
                        set({ roleDistribution: formatted });
                    }
                } catch (err) {
                    console.error('Failed to fetch role distribution:', err);
                }
            },

            fetchUserGrowth: async () => {
                try {
                    const response = await apiRequest('/superadmin/dashboard/user-growth');
                    if (response.success) {
                        set({ growthData: response.data });
                    }
                } catch (err) {
                    console.error('Failed to fetch user growth:', err);
                }
            },

            fetchHourlyActivity: async () => {
                try {
                    const response = await apiRequest('/superadmin/dashboard/hourly-activity');
                    if (response.success) {
                        set({ hourlyActivity: response.data });
                    }
                } catch (err) {
                    console.error('Failed to fetch hourly activity:', err);
                }
            },

            fetchRecentLogins: async () => {
                try {
                    const response = await apiRequest('/superadmin/dashboard/recent-logins');
                    if (response.success) {
                        set({ recentLogins: response.data });
                    }
                } catch (err) {
                    console.error('Failed to fetch recent logins:', err);
                }
            },

            updateSystemSettings: (settings) => {
                set((state) => ({
                    systemSettings: { ...state.systemSettings, ...settings }
                }));
            },

            updateAdminStatus: async (id, status) => {
                try {
                    const response = await apiRequest(`/superadmin/admins/${id}`, {
                        method: 'PUT',
                        body: { subscriptionStatus: status }
                    });
                    if (response.success) {
                        set((state) => ({
                            admins: state.admins.map((adm) =>
                                adm._id === id ? response.data : adm
                            ),
                        }));
                        return true;
                    }
                } catch (err) {
                    console.error('Failed to update admin status:', err);
                }
                return false;
            },

            deleteAdmin: async (id) => {
                try {
                    const response = await apiRequest(`/superadmin/admins/${id}`, { method: 'DELETE' });
                    if (response.success) {
                        set((state) => ({
                            admins: state.admins.filter((adm) => adm._id !== id),
                        }));
                        return true;
                    }
                } catch (err) {
                    console.error('Failed to delete admin:', err);
                }
                return false;
            },

            addAdmin: async (adminData) => {
                try {
                    const response = await apiRequest('/superadmin/admins', {
                        method: 'POST',
                        body: {
                            companyName: adminData.name,
                            name: adminData.owner,
                            email: adminData.email,
                            subscriptionPlan: adminData.plan,
                            subscriptionPlanId: adminData.planId
                        }
                    });
                    if (response.success) {
                        set((state) => ({
                            admins: [response.data, ...state.admins]
                        }));
                        return { success: true };
                    }
                } catch (err) {
                    console.error('Failed to add admin:', err);
                    return { success: false, error: err.message || "Failed to add admin" };
                }
                return { success: false };
            },

            fetchPlans: async () => {
                set({ loading: true });
                try {
                    const response = await apiRequest('/superadmin/plans');
                    if (response.success) {
                        set({ plans: response.data, loading: false });
                    }
                } catch (err) {
                    console.error('Failed to fetch plans:', err);
                    set({ loading: false });
                }
            },

            addPlan: async (newPlan) => {
                try {
                    const response = await apiRequest('/superadmin/plans', {
                        method: 'POST',
                        body: newPlan
                    });
                    if (response.success) {
                        set((state) => ({
                            plans: [...state.plans, response.data]
                        }));
                        return true;
                    }
                } catch (err) {
                    console.error('Failed to add plan:', err);
                }
                return false;
            },

            updatePlan: async (id, updatedPlan) => {
                try {
                    const response = await apiRequest(`/superadmin/plans/${id}`, {
                        method: 'PUT',
                        body: updatedPlan
                    });
                    if (response.success) {
                        set((state) => ({
                            plans: state.plans.map((p) =>
                                p._id === id ? response.data : p
                            ),
                        }));
                        return true;
                    }
                } catch (err) {
                    console.error('Failed to update plan:', err);
                }
                return false;
            },

            deletePlan: async (id) => {
                try {
                    const response = await apiRequest(`/superadmin/plans/${id}`, { method: 'DELETE' });
                    if (response.success) {
                        set((state) => ({
                            plans: state.plans.filter((p) => p._id !== id),
                        }));
                        return true;
                    }
                } catch (err) {
                    console.error('Failed to delete plan:', err);
                }
                return false;
            },

            updateAdminPlan: async (adminId, planId, planName) => {
                try {
                    const response = await apiRequest(`/superadmin/admins/${adminId}/plan`, {
                        method: 'PUT',
                        body: { planId, planName }
                    });
                    if (response.success) {
                        set((state) => ({
                            admins: state.admins.map(adm =>
                                adm._id === adminId ? response.data : adm
                            )
                        }));
                        return true;
                    }
                } catch (err) {
                    console.error('Failed to update admin plan:', err);
                }
                return false;
            },

            addInquiry: (inquiry) => {
                set((state) => ({
                    inquiries: [
                        { ...inquiry, id: `inq-${Date.now()}`, date: new Date().toISOString(), status: 'new' },
                        ...state.inquiries
                    ]
                }));
            },

            updateInquiryStatus: (id, status) => {
                set((state) => ({
                    inquiries: state.inquiries.map((inq) =>
                        inq.id === id ? { ...inq, status } : inq
                    ),
                }));
            },

            fetchBillingStats: async () => {
                try {
                    const response = await apiRequest('/superadmin/billing/stats');
                    if (response.success) {
                        set({ billingStats: response.data });
                    }
                } catch (err) {
                    console.error('Failed to fetch billing stats:', err);
                }
            },

            fetchTransactions: async () => {
                set({ loading: true });
                try {
                    const response = await apiRequest('/superadmin/billing/transactions');
                    if (response.success) {
                        set({ transactions: response.data, loading: false });
                    }
                } catch (err) {
                    console.error('Failed to fetch transactions:', err);
                    set({ loading: false });
                }
            },

            fetchSubscriptionHistory: async () => {
                set({ loading: true });
                try {
                    const response = await apiRequest('/superadmin/subscription-history');
                    if (response.success) {
                        set({ subscriptionHistory: response.data, loading: false });
                    }
                } catch (err) {
                    console.error('Failed to fetch subscription history:', err);
                    set({ loading: false });
                }
            },
        }),
        {
            name: 'dintask-superadmin-storage-v3', // Incremented version
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);

export default useSuperAdminStore;
