import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/api';
import useTaskStore from './taskStore';
import { toast } from 'sonner';

const useCRMStore = create(
  persist(
    (set, get) => ({
      leads: [],
      salesExecutives: [],
      pendingProjects: [],
      followUps: [], // Added followUps state
      crmStats: null, // Global CRM statistics
      reportData: null, // Sales report data
      loading: false,
      error: null,
      pagination: {
        total: 0,
        pages: 0,
        currentPage: 1,
        limit: 10
      },

      // Sales Pipeline Stages (Configurable)
      pipelineStages: ['New', 'Contacted', 'Meeting Done', 'Proposal Sent', 'Won', 'Lost'],

      // Fetch Leads
      fetchLeads: async (options = {}) => {
        set({ loading: true });
        try {
          const { search = '', status = '', priority = '', page = 1, limit = 100 } = options;
          let url = '/crm';
          const params = new URLSearchParams();
          if (search) params.append('search', search);
          if (status) params.append('status', status);
          if (priority) params.append('priority', priority);
          if (page) params.append('page', page);
          if (limit) params.append('limit', limit);

          const queryString = params.toString();
          if (queryString) url += `?${queryString}`;

          const res = await api(url);
          if (res.success) {
            set({
              leads: res.data,
              pagination: res.pagination || {
                total: res.data.length,
                pages: 1,
                currentPage: 1,
                limit: options.limit || 100
              },
              loading: false,
              error: null
            });
          }
        } catch (error) {
          set({ error: error.message, loading: false });
          toast.error("Failed to fetch leads");
        }
      },

      // Fetch Global CRM Stats
      fetchCRMStats: async () => {
        try {
          const res = await api('/admin/crm/stats');
          if (res.success) {
            set({ crmStats: res.data });
          }
        } catch (error) {
          console.error("Failed to fetch global CRM stats", error);
        }
      },

      // Fetch Sales Executives
      fetchSalesExecutives: async () => {
        try {
          const res = await api('/crm/sales-executives');
          if (res.success) {
            set({ salesExecutives: res.data });
          }
        } catch (error) {
          console.error("Failed to fetch sales execs", error);
        }
      },

      // Fetch Pending Projects
      fetchPendingProjects: async (search = '') => {
        try {
          const url = search ? `/crm/pending-projects?search=${search}` : '/crm/pending-projects';
          const res = await api(url);
          if (res.success) {
            set({ pendingProjects: res.data }); // Store separately or filter from leads
          }
        } catch (error) {
          console.error("Failed to fetch pending projects", error);
        }
      },

      // Add Lead
      addLead: async (leadData) => {
        set({ loading: true });
        try {
          const res = await api('/crm', {
            method: 'POST',
            body: leadData
          });
          if (res.success) {
            const newLead = res.data;
            get().fetchLeads();
            get().fetchCRMStats();

            // Background re-fetch for global state synchronization
            import('./adminStore').then(m => m.default.getState().fetchDashboardStats())
              .catch(err => console.error("Background sync error:", err));

            toast.success("Lead added successfully");
            return newLead;
          }
        } catch (error) {
          set({ error: error.message, loading: false });
          toast.error(error.message || "Failed to add lead");
        }
      },

      // Update Lead
      editLead: async (leadId, leadData) => {
        try {
          const res = await api(`/crm/${leadId}`, {
            method: 'PUT',
            body: leadData
          });
          if (res.success) {
            get().fetchLeads();
            get().fetchCRMStats();

            // Background re-fetch for global state synchronization
            import('./adminStore').then(m => m.default.getState().fetchDashboardStats())
              .catch(err => console.error("Background sync error:", err));

            toast.success("Lead updated");
            return res;
          } else {
            throw new Error(res.error || res.message || "Failed to update lead");
          }
        } catch (error) {
          toast.error(error.message || "Failed to update lead");
          throw error;
        }
      },

      // Delete Lead
      deleteLead: async (leadId) => {
        try {
          const res = await api(`/crm/${leadId}`, {
            method: 'DELETE'
          });
          if (res.success) {
            get().fetchLeads();
            get().fetchCRMStats();

            // Background re-fetch for global state synchronization
            import('./adminStore').then(m => m.default.getState().fetchDashboardStats())
              .catch(err => console.error("Background sync error:", err));

            toast.success("Lead deleted successfully");
          }
        } catch (error) {
          toast.error(error.message || "Failed to delete lead");
        }
      },

      // Bulk Delete Leads
      bulkDeleteLeads: async (leadIds) => {
        try {
          const res = await api('/crm/bulk-delete', {
            method: 'POST',
            body: { ids: leadIds }
          });
          if (res.success) {
            get().fetchLeads();
            get().fetchCRMStats();

            // Background re-fetch for global state synchronization
            import('./adminStore').then(m => m.default.getState().fetchDashboardStats())
              .catch(err => console.error("Background sync error:", err));

            toast.success(res.message || "Leads deleted successfully");
          }
        } catch (error) {
          toast.error(error.message || "Failed to delete some leads");
        }
      },

      // Assign Lead
      assignLead: async (leadId, employeeId) => {
        try {
          const res = await api(`/crm/${leadId}/assign`, {
            method: 'PUT',
            body: { employeeId }
          });
          if (res.success) {
            get().fetchLeads();

            // Background re-fetch for global state synchronization
            import('./adminStore').then(m => m.default.getState().fetchDashboardStats())
              .catch(err => console.error("Background sync error:", err));

            toast.success("Lead assigned");
          }
        } catch (error) {
          toast.error(error.message || "Failed to assign lead");
        }
      },

      // Request Project Conversion
      requestProjectConversion: async (leadId) => {
        try {
          const res = await api(`/crm/${leadId}/request-project`, {
            method: 'PUT'
          });
          if (res.success) {
            get().fetchLeads();
            get().fetchPendingProjects();

            // Background re-fetch for global state synchronization
            import('./adminStore').then(m => m.default.getState().fetchDashboardStats())
              .catch(err => console.error("Background sync error:", err));

            toast.success("Project requested");
          }
        } catch (error) {
          toast.error(error.message || "Failed to request project");
        }
      },

      // Approve Project
      approveProject: async (leadId, managerId) => {
        try {
          const res = await api(`/crm/${leadId}/approve-project`, {
            method: 'POST',
            body: { managerId }
          });
          if (res.success) {
            get().fetchLeads();
            get().fetchPendingProjects();

            // Background re-fetch for global state synchronization
            import('./adminStore').then(m => m.default.getState().fetchDashboardStats())
              .catch(err => console.error("Background sync error:", err));

            toast.success("Project approved and assigned");
          }
        } catch (error) {
          toast.error(error.message || "Failed to approve project");
        }
      },

      // Fetch Follow-ups
      fetchFollowUps: async () => {
        set({ loading: true });
        try {
          const res = await api('/follow-ups');
          if (res.success) {
            set({ followUps: res.data, loading: false });
          }
        } catch (error) {
          set({ error: error.message, loading: false });
          console.error("Failed to fetch follow-ups", error);
        }
      },

      // Fetch Sales Report Data
      fetchSalesReport: async (period = 'month') => {
        set({ loading: true });
        try {
          const res = await api(`/crm/reports?period=${period}`);
          if (res.success) {
            set({ reportData: res.data, loading: false });
          }
        } catch (error) {
          set({ error: error.message, loading: false });
          console.error("Failed to fetch sales report", error);
        }
      },

      // Add Follow-up
      addFollowUp: async (followUpData) => {
        try {
          const res = await api('/follow-ups', {
            method: 'POST',
            body: followUpData
          });
          if (res.success) {
            get().fetchFollowUps();

            // Background re-fetch for global state synchronization
            import('./adminStore').then(m => m.default.getState().fetchDashboardStats())
              .catch(err => console.error("Background sync error:", err));

            toast.success("Follow-up scheduled");
            return res.data;
          }
        } catch (error) {
          toast.error(error.message || "Failed to schedule follow-up");
        }
      },

      // Update Follow-up
      updateFollowUp: async (id, followUpData) => {
        try {
          const res = await api(`/follow-ups/${id}`, {
            method: 'PUT',
            body: followUpData
          });
          if (res.success) {
            get().fetchFollowUps();

            // Background re-fetch for global state synchronization
            import('./adminStore').then(m => m.default.getState().fetchDashboardStats())
              .catch(err => console.error("Background sync error:", err));

            toast.success("Follow-up updated");
          }
        } catch (error) {
          toast.error(error.message || "Failed to update follow-up");
        }
      },

      // Delete Follow-up
      deleteFollowUp: async (id) => {
        try {
          const res = await api(`/follow-ups/${id}`, {
            method: 'DELETE'
          });
          if (res.success) {
            get().fetchFollowUps();

            // Background re-fetch for global state synchronization
            import('./adminStore').then(m => m.default.getState().fetchDashboardStats())
              .catch(err => console.error("Background sync error:", err));

            toast.success("Follow-up deleted");
          }
        } catch (error) {
          toast.error(error.message || "Failed to delete follow-up");
        }
      },

      // Helper: Get Pipeline Data
      getPipelineData: () => {
        const { leads, pipelineStages } = get();
        // Structure: [ { stage: 'New', leads: [...] }, ... ]
        return pipelineStages.map(stage => ({
          stage,
          leads: leads.filter(l => l.status === stage)
        }));
      },

      // Helper: Move Lead (Calls editLead)
      moveLead: async (leadId, fromStage, toStage) => {
        const { leads } = get();
        
        // Find the lead to ensure we have the correct ID for API
        const lead = leads.find(l => l._id === leadId || l.id === leadId);
        if (!lead) return;

        // Optimistic update
        set(state => ({
          leads: state.leads.map(l => (l._id === leadId || l.id === leadId) ? { ...l, status: toStage } : l)
        }));

        const actualId = lead?._id || lead?.id || leadId;

        // API Call
        try {
          await get().editLead(actualId, { status: toStage });
        } catch (err) {
          // Revert if failed
          console.error("Move lead failed", err);
          set(state => ({
            leads: state.leads.map(l => (l._id === leadId || l.id === leadId) ? { ...l, status: fromStage } : l)
          }));
        }
      },

      // Helper: Get Pending Projects (Sync selector from state)
      getPendingProjects: () => {
        return get().leads.filter(lead => lead.status === 'Won' && lead.approvalStatus === 'pending_project');
      }

    }),
    {
      name: 'dintask-crm-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useCRMStore;