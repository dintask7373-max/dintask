import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import apiRequest from '../lib/api';
import socketService from '@/services/socket';
import { toast } from 'sonner';

const useSuperAdminStore = create(
    persist(
        (set, get) => ({
            admins: [],
            adminPagination: {
                page: 1,
                pages: 1,
                total: 0,
                limit: 10
            },
            historyPagination: {
                page: 1,
                pages: 1,
                total: 0,
                limit: 10
            },
            plans: [],
            stats: {
                totalRevenue: 0,
                activeCompanies: 0,
                avgCompletionRate: 0,
                totalUsers: 0,
                activeUsers: 0,
                monthlyGrowthPercentage: 0
            },
            planDistribution: [],
            revenueTrends: [],
            pendingSupport: [],
            recentInquiries: [],
            systemSettings: {
                platformName: 'DinTask CRM',
                supportEmail: 'support@dintask.com',
                maintenanceMode: false,
                force2FA: true,
                sessionTimeout: 24 // hours
            },
            inquiries: [],
            inquiryPagination: {
                page: 1,
                pages: 1,
                total: 0,
                limit: 10
            },
            roleDistribution: [],
            growthData: [],
            staffMembers: [],
            staffPagination: {
                page: 1,
                pages: 1,
                total: 0,
                limit: 10
            },

            transactions: [],
            subscriptionHistory: [],
            transactionPagination: {
                page: 1,
                pages: 1,
                total: 0,
                limit: 10
            },
            billingStats: {
                totalRevenue: 0,
                activeSubscriptions: 0,
                pendingRefunds: 0,
                churnRate: 0
            },
            systemIntel: [],
            landingPageContent: null,
            privacyContent: null,
            termsContent: null,
            cookieContent: null,
            loading: false,

            fetchLandingPageContent: async () => {
                try {
                    const response = await apiRequest('/landing-page/hero');
                    if (response.success) {
                        set({ landingPageContent: response.data });
                    }
                } catch (err) {
                    console.error('Failed to fetch landing page content:', err);
                }
            },

            updateLandingPageContent: async (data) => {
                try {
                    const response = await apiRequest('/landing-page/hero', {
                        method: 'PUT',
                        body: data
                    });
                    if (response.success) {
                        get().fetchLandingPageContent();
                        return true;
                    }
                } catch (err) {
                    console.error('Failed to update landing page content:', err);
                }
                return false;
            },

            platformContent: null,
            fetchPlatformContent: async () => {
                try {
                    const response = await apiRequest('/landing-page/platform');
                    if (response.success) {
                        set({ platformContent: response.data });
                    }
                } catch (err) {
                    console.error('Failed to fetch platform content:', err);
                }
            },

            updatePlatformContent: async (dataOrFormData) => {
                try {
                    // Check if dataOrFormData is FormData
                    const isFormData = dataOrFormData instanceof FormData;

                    const response = await apiRequest('/landing-page/platform', {
                        method: 'PUT',
                        body: isFormData ? dataOrFormData : dataOrFormData
                    });

                    if (response.success) {
                        get().fetchPlatformContent();
                        return true;
                    }
                } catch (err) {
                    console.error('Failed to update platform content:', err);
                }
                return false;
            },

            faqsContent: [],
            fetchFaqsContent: async () => {
                try {
                    const response = await apiRequest('/landing-page/faqs');
                    if (response.success) {
                        set({ faqsContent: response.data });
                    }
                } catch (err) {
                    console.error('Failed to fetch FAQs content:', err);
                }
            },

            updateFaqsContent: async (faqsData) => {
                try {
                    const response = await apiRequest('/landing-page/faqs', {
                        method: 'PUT',
                        body: { faqs: faqsData }
                    });
                    if (response.success) {
                        get().fetchFaqsContent();
                        return true;
                    }
                } catch (err) {
                    console.error('Failed to update FAQs content:', err);
                }
                return false;
            },

            fetchPrivacyContent: async () => {
                try {
                    const response = await apiRequest('/landing-page/privacy_policy');
                    if (response.success) {
                        set({ privacyContent: response.data });
                    }
                } catch (err) {
                    console.error('Failed to fetch Privacy Policy:', err);
                }
            },

            updatePrivacyPolicy: async (policySections) => {
                try {
                    const response = await apiRequest('/landing-page/privacy_policy', {
                        method: 'PUT',
                        body: { policySections }
                    });
                    if (response.success) {
                        get().fetchPrivacyContent();
                        return true;
                    }
                } catch (err) {
                    console.error('Failed to update Privacy Policy:', err);
                }
                return false;
            },

            fetchTermsContent: async () => {
                try {
                    const response = await apiRequest('/landing-page/terms_service');
                    if (response.success) {
                        set({ termsContent: response.data });
                    }
                } catch (err) {
                    console.error('Failed to fetch Terms:', err);
                }
            },

            updateTermsService: async (policySections) => {
                try {
                    const response = await apiRequest('/landing-page/terms_service', {
                        method: 'PUT',
                        body: { policySections }
                    });
                    if (response.success) {
                        get().fetchTermsContent();
                        return true;
                    }
                } catch (err) {
                    console.error('Failed to update Terms:', err);
                }
                return false;
            },

            fetchCookieContent: async () => {
                try {
                    const response = await apiRequest('/landing-page/cookie_policy');
                    if (response.success) {
                        set({ cookieContent: response.data });
                    }
                } catch (err) {
                    console.error('Failed to fetch Cookie Policy:', err);
                }
            },

            updateCookiePolicy: async (policySections) => {
                try {
                    const response = await apiRequest('/landing-page/cookie_policy', {
                        method: 'PUT',
                        body: { policySections }
                    });
                    if (response.success) {
                        get().fetchCookieContent();
                        return true;
                    }
                } catch (err) {
                    console.error('Failed to update Cookie Policy:', err);
                }
                return false;
            },

            tacticalContent: null,
            fetchTacticalContent: async () => {
                try {
                    const response = await apiRequest('/landing-page/tactical');
                    if (response.success) {
                        set({ tacticalContent: response.data });
                    }
                } catch (err) {
                    console.error('Failed to fetch tactical content:', err);
                }
            },

            updateTacticalContent: async (formData) => {
                try {
                    const response = await apiRequest('/landing-page/tactical', {
                        method: 'PUT',
                        body: formData
                    });

                    if (response.success) {
                        get().fetchTacticalContent();
                        return true;
                    }
                } catch (err) {
                    console.error('Failed to update tactical content:', err);
                }
                return false;
            },

            tacticalModules: [],
            fetchTacticalModules: async () => {
                try {
                    const response = await apiRequest('/tactical-modules');
                    if (response.success) {
                        set({ tacticalModules: response.data });
                    }
                } catch (err) {
                    console.error('Failed to fetch tactical modules:', err);
                }
            },

            updateTacticalModule: async (moduleId, formData) => {
                try {
                    const response = await apiRequest(`/tactical-modules/${moduleId}`, {
                        method: 'PUT',
                        body: formData
                    });

                    if (response.success) {
                        set((state) => ({
                            tacticalModules: state.tacticalModules.map((mod) =>
                                mod.moduleId === moduleId ? response.data : mod
                            )
                        }));
                        return true;
                    }
                } catch (err) {
                    console.error('Failed to update tactical module:', err);
                }
                return false;
            },

            footerCtaContent: null,
            fetchFooterCtaContent: async () => {
                try {
                    const response = await apiRequest('/landing-page/footer-cta');
                    if (response.success) {
                        set({ footerCtaContent: response.data });
                    }
                } catch (err) {
                    console.error('Failed to fetch footer CTA content:', err);
                }
            },

            updateFooterCtaContent: async (formData) => {
                try {
                    const response = await apiRequest('/landing-page/footer-cta', {
                        method: 'PUT',
                        body: formData
                    });

                    if (response.success) {
                        get().fetchFooterCtaContent();
                        return true;
                    }
                } catch (err) {
                    console.error('Failed to update footer CTA content:', err);
                }
                return false;
            },

            pricingPlans: [],
            fetchPricingPlans: async () => {
                try {
                    const response = await apiRequest('/landing-page-plans');
                    if (response.success) {
                        set({ pricingPlans: response.data });
                    }
                } catch (err) {
                    console.error('Failed to fetch pricing plans:', err);
                }
            },

            createPricingPlan: async (planData) => {
                try {
                    const response = await apiRequest('/landing-page-plans', {
                        method: 'POST',
                        body: JSON.stringify(planData),
                        headers: { 'Content-Type': 'application/json' }
                    });
                    if (response.success) {
                        get().fetchPricingPlans();
                        return true;
                    }
                } catch (err) {
                    console.error('Failed to create pricing plan:', err);
                }
                return false;
            },

            updatePricingPlan: async (id, planData) => {
                try {
                    const response = await apiRequest(`/landing-page-plans/${id}`, {
                        method: 'PUT',
                        body: JSON.stringify(planData),
                        headers: { 'Content-Type': 'application/json' }
                    });
                    if (response.success) {
                        get().fetchPricingPlans();
                        return true;
                    }
                } catch (err) {
                    console.error('Failed to update pricing plan:', err);
                }
                return false;
            },

            deletePricingPlan: async (id) => {
                try {
                    const response = await apiRequest(`/landing-page-plans/${id}`, {
                        method: 'DELETE'
                    });
                    if (response.success) {
                        get().fetchPricingPlans();
                        return true;
                    }
                } catch (err) {
                    console.error('Failed to delete pricing plan:', err);
                }
                return false;
            },

            fetchSystemIntel: async () => {
                try {
                    const response = await apiRequest('/system-intel');
                    if (response.success) {
                        set({ systemIntel: response.data });
                    }
                } catch (err) {
                    console.error('Failed to fetch system intel:', err);
                }
            },

            updateSystemIntel: async (role, data) => {
                try {
                    const response = await apiRequest(`/system-intel/${role}`, {
                        method: 'PUT',
                        body: data
                    });
                    if (response.success) {
                        get().fetchSystemIntel();
                        return true;
                    }
                } catch (err) {
                    console.error('Failed to update system intel:', err);
                }
                return false;
            },

            seedSystemIntel: async () => {
                try {
                    const response = await apiRequest('/system-intel/seed', { method: 'POST' });
                    if (response.success) {
                        get().fetchSystemIntel();
                        return true;
                    }
                } catch (err) {
                    console.error('Failed to seed system intel:', err);
                }
                return false;
            },

            fetchAdmins: async (params = {}) => {
                set({ loading: true });
                try {
                    const queryParams = new URLSearchParams();
                    if (params.page) queryParams.append('page', params.page);
                    if (params.limit) queryParams.append('limit', params.limit);
                    if (params.search) queryParams.append('search', params.search);

                    const response = await apiRequest(`/superadmin/admins?${queryParams.toString()}`);
                    if (response.success) {
                        set({
                            admins: response.data,
                            adminPagination: response.pagination || get().adminPagination,
                            loading: false
                        });
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
                                activeCompanies: response.data.activeCompanies || 0
                            }
                        }));
                    }
                } catch (err) {
                    console.error('Failed to fetch dashboard stats:', err);
                }
            },

            fetchPlanDistribution: async () => {
                try {
                    const response = await apiRequest('/superadmin/dashboard/plan-distribution');
                    if (response.success) {
                        set({ planDistribution: response.data });
                    }
                } catch (err) {
                    console.error('Failed to fetch plan distribution:', err);
                }
            },

            fetchPendingSupport: async () => {
                try {
                    const response = await apiRequest('/superadmin/dashboard/pending-support?limit=5');
                    if (response.success) {
                        set({ pendingSupport: response.data });
                    }
                } catch (err) {
                    console.error('Failed to fetch pending support:', err);
                }
            },

            // --- Full Support Module Actions ---
            supportTickets: [],
            fetchSupportTickets: async () => {
                set({ loading: true });
                try {
                    // Backend automatically filters for SuperAdmin (escalated tickets)
                    const response = await apiRequest('/support-tickets');
                    if (response.success) {
                        set({ supportTickets: response.data, loading: false });
                    }
                } catch (err) {
                    console.error('Failed to fetch support tickets:', err);
                    set({ loading: false });
                }
            },

            replyToSupportTicket: async (id, message) => {
                try {
                    const response = await apiRequest(`/support-tickets/${id}`, {
                        method: 'PUT',
                        body: { response: message }
                    });

                    if (response.success) {
                        get().fetchSupportTickets();
                        return true;
                    }
                } catch (err) {
                    console.error('Reply Error:', err);
                }
                return false;
            },

            updateSupportTicketStatus: async (id, status) => {
                try {
                    const response = await apiRequest(`/support-tickets/${id}`, {
                        method: 'PUT',
                        body: { status }
                    });
                    if (response.success) {
                        get().fetchSupportTickets();
                        return true;
                    }
                } catch (err) {
                    console.error('Status Update Error:', err);
                }
                return false;
            },
            // ----------------------------------

            fetchRecentInquiries: async () => {
                try {
                    const response = await apiRequest('/superadmin/dashboard/recent-inquiries?limit=5');
                    if (response.success) {
                        set({ recentInquiries: response.data });
                    }
                } catch (err) {
                    console.error('Failed to fetch recent inquiries:', err);
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

            fetchUserGrowth: async (period = 6) => {
                try {
                    const response = await apiRequest(`/superadmin/dashboard/user-growth?period=${period}`);
                    if (response.success) {
                        set({ growthData: response.data });
                    }
                } catch (err) {
                    console.error('Failed to fetch user growth:', err);
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
                        get().fetchAdmins();

                        // Background re-fetches for global state synchronization
                        Promise.all([
                            get().fetchDashboardStats(),
                            get().fetchRoleDistribution(),
                            get().fetchUserGrowth()
                        ]).catch(err => console.error("Background sync error:", err));

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
                        get().fetchAdmins();

                        // Background re-fetches for global state synchronization
                        Promise.all([
                            get().fetchDashboardStats(),
                            get().fetchRoleDistribution(),
                            get().fetchUserGrowth()
                        ]).catch(err => console.error("Background sync error:", err));

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
                        get().fetchAdmins();

                        // Background re-fetches for global state synchronization
                        Promise.all([
                            get().fetchDashboardStats(),
                            get().fetchRoleDistribution(),
                            get().fetchUserGrowth()
                        ]).catch(err => console.error("Background sync error:", err));

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
                        get().fetchPlans();

                        // Background re-fetches for global state synchronization
                        Promise.all([
                            get().fetchDashboardStats(),
                            get().fetchRoleDistribution(),
                            get().fetchUserGrowth()
                        ]).catch(err => console.error("Background sync error:", err));

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
                        get().fetchPlans();

                        // Background re-fetches for global state synchronization
                        Promise.all([
                            get().fetchDashboardStats(),
                            get().fetchRoleDistribution(),
                            get().fetchUserGrowth()
                        ]).catch(err => console.error("Background sync error:", err));

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
                        get().fetchPlans();

                        // Background re-fetches for global state synchronization
                        Promise.all([
                            get().fetchDashboardStats(),
                            get().fetchRoleDistribution(),
                            get().fetchUserGrowth()
                        ]).catch(err => console.error("Background sync error:", err));

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
                        get().fetchAdmins();

                        // Background re-fetches for global state synchronization
                        Promise.all([
                            get().fetchDashboardStats(),
                            get().fetchRoleDistribution(),
                            get().fetchUserGrowth()
                        ]).catch(err => console.error("Background sync error:", err));

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

            updateInquiryStatus: async (id, status) => {
                try {
                    const response = await apiRequest(`/support/admin/support-leads/${id}`, {
                        method: 'PUT',
                        body: { status }
                    });

                    if (response.success) {
                        get().fetchInquiries();

                        // Background re-fetches for global state synchronization
                        Promise.all([
                            get().fetchDashboardStats(),
                            get().fetchRoleDistribution(),
                            get().fetchUserGrowth()
                        ]).catch(err => console.error("Background sync error:", err));

                        return true;
                    }
                } catch (err) {
                    console.error('Failed to update inquiry status:', err);
                }
                return false;
            },

            fetchInquiries: async (params = {}) => {
                set({ loading: true });
                try {
                    const queryParams = new URLSearchParams();
                    if (params.page) queryParams.append('page', params.page);
                    if (params.limit) queryParams.append('limit', params.limit);
                    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
                    if (params.search) queryParams.append('search', params.search);

                    const response = await apiRequest(`/support/admin/support-leads?${queryParams.toString()}`);
                    if (response.success) {
                        set({
                            inquiries: response.data,
                            inquiryPagination: response.pagination,
                            loading: false
                        });
                    }
                } catch (err) {
                    console.error('Failed to fetch inquiries:', err);
                    set({ loading: false });
                }
            },

            fetchInquiryDetails: async (id) => {
                set({ loading: true });
                try {
                    const response = await apiRequest(`/support/admin/support-leads/${id}`);
                    if (response.success) {
                        set({ loading: false });
                        return response.data;
                    }
                } catch (err) {
                    console.error('Failed to fetch inquiry details:', err);
                    set({ loading: false });
                }
                return null;
            },

            fetchBillingStats: async (period = 6) => {
                try {
                    const response = await apiRequest(`/superadmin/billing/stats?period=${period}`);
                    if (response.success) {
                        set({
                            billingStats: response.data,
                            revenueTrends: response.data.revenueTrends || [],
                            stats: {
                                ...get().stats,
                                totalRevenue: response.data.totalRevenue || 0
                            }
                        });
                    }
                } catch (err) {
                    console.error('Failed to fetch billing stats:', err);
                }
            },

            fetchTransactions: async (params = {}) => {
                // Clear old data if searching to avoid stale results
                if (params.search || params.status) {
                    set({ transactions: [], loading: true });
                } else {
                    set({ loading: true });
                }
                try {
                    const queryParams = new URLSearchParams();
                    if (params.page) queryParams.append('page', params.page);
                    if (params.limit) queryParams.append('limit', params.limit);
                    if (params.search) queryParams.append('search', params.search);
                    if (params.status && params.status !== 'all') queryParams.append('status', params.status);

                    const url = `/superadmin/billing/transactions?${queryParams.toString()}`;
                    console.warn('Fetching URL:', url);
                    const response = await apiRequest(url);
                    if (response.success) {
                        set({
                            transactions: response.data,
                            transactionPagination: response.pagination || { page: 1, pages: 1, total: 0, limit: 10 },
                            loading: false
                        });
                    }
                } catch (err) {
                    console.error('Failed to fetch transactions:', err);
                    set({ loading: false });
                }
            },

            fetchSubscriptionHistory: async (params = {}) => {
                set({ loading: true });
                try {
                    const queryParams = new URLSearchParams();
                    if (params.page) queryParams.append('page', params.page);
                    if (params.limit) queryParams.append('limit', params.limit);
                    if (params.search) queryParams.append('search', params.search);
                    if (params.status && params.status !== 'All') queryParams.append('status', params.status);

                    const url = `/superadmin/subscription-history?${queryParams.toString()}`;
                    console.log('Fetching History URL:', url);
                    const response = await apiRequest(url);

                    if (response.success) {
                        set({
                            subscriptionHistory: response.data,
                            historyPagination: response.pagination || { page: 1, pages: 1, total: 0, limit: 10 },
                            loading: false
                        });
                    }
                } catch (err) {
                    console.error('Failed to fetch subscription history:', err);
                    set({ loading: false });
                }
            },

            // --- Super Admin Staff Management ---
            fetchStaff: async (params = {}) => {
                set({ loading: true });
                try {
                    const queryParams = new URLSearchParams();
                    if (params.page) queryParams.append('page', params.page);
                    if (params.limit) queryParams.append('limit', params.limit);
                    if (params.search) queryParams.append('search', params.search);

                    const response = await apiRequest(`/superadmin/staff?${queryParams.toString()}`);
                    if (response.success) {
                        set({
                            staffMembers: response.data,
                            staffPagination: response.pagination || { page: 1, pages: 1, total: 0, limit: 10 },
                            loading: false
                        });
                    }
                } catch (err) {
                    console.error('Failed to fetch staff:', err);
                    set({ loading: false });
                }
            },

            addStaff: async (staffData) => {
                try {
                    const response = await apiRequest('/superadmin/staff', {
                        method: 'POST',
                        body: staffData
                    });
                    if (response.success) {
                        get().fetchStaff();
                        // Background re-fetches for global state synchronization
                        Promise.all([
                            get().fetchDashboardStats(),
                            get().fetchRoleDistribution(),
                            get().fetchUserGrowth()
                        ]).catch(err => console.error("Background sync error:", err));
                        return true;
                    }
                } catch (err) {
                    console.error('Failed to add staff:', err);
                }
                return false;
            },

            updateStaff: async (id, staffData) => {
                try {
                    const response = await apiRequest(`/superadmin/staff/${id}`, {
                        method: 'PUT',
                        body: staffData
                    });
                    if (response.success) {
                        get().fetchStaff();

                        // Background re-fetches for global state synchronization
                        Promise.all([
                            get().fetchDashboardStats(),
                            get().fetchRoleDistribution(),
                            get().fetchUserGrowth()
                        ]).catch(err => console.error("Background sync error:", err));

                        return true;
                    }
                } catch (err) {
                    console.error('Failed to update staff:', err);
                }
                return false;
            },

            deleteStaff: async (id) => {
                try {
                    const response = await apiRequest(`/superadmin/staff/${id}`, {
                        method: 'DELETE'
                    });
                    if (response.success) {
                        get().fetchStaff();

                        // Background re-fetches for global state synchronization
                        Promise.all([
                            get().fetchDashboardStats(),
                            get().fetchRoleDistribution(),
                            get().fetchUserGrowth()
                        ]).catch(err => console.error("Background sync error:", err));

                        return true;
                    }
                } catch (err) {
                    console.error('Failed to delete staff:', err);
                }
                return false;
            },

            initializeSupportSocket: () => {
                socketService.onSupportResponse(({ ticketId, updatedTicket }) => {
                    set((state) => ({
                        supportTickets: state.supportTickets.map((t) =>
                            t._id === ticketId ? updatedTicket : t
                        )
                    }));
                });

                socketService.onSupportTicket((newTicket) => {
                    // SuperAdmin only cares if it's escalated
                    if (newTicket.isEscalatedToSuperAdmin) {
                        set((state) => ({
                            supportTickets: [newTicket, ...state.supportTickets]
                        }));
                        toast.info(`New escalated ticket: ${newTicket.title}`);
                    }
                });
            },
        }),
        {
            name: 'dintask-superadmin-storage-v4', // Incremented version for history pagination
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);

export default useSuperAdminStore;
