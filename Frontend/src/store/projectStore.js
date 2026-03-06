import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';

const useProjectStore = create((set, get) => ({
  projects: [],
  projectPagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  },
  currentProject: null,
  loading: false,
  error: null,

  // Fetch Projects (for current user)
  fetchProjects: async (params = {}) => {
    set({ loading: true });
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);

      const res = await api(`/projects?${queryParams.toString()}`);
      if (res.success) {
        set({
          projects: res.data,
          projectPagination: res.pagination || { page: 1, limit: 10, total: 0, pages: 1 },
          loading: false
        });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error("Failed to fetch projects", error);
    }
  },

  // Get Single Project
  fetchProject: async (id) => {
    set({ loading: true });
    try {
      const res = await api(`/projects/${id}`);
      if (res.success) {
        set({ currentProject: res.data, loading: false });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch project details");
    }
  },

  // Update Project Status
  updateProjectStatus: async (id, status) => {
    try {
      const res = await api(`/projects/${id}`, {
        method: 'PUT',
        body: { status }
      });
      if (res.success) {
        set(state => ({
          projects: state.projects.map(p => p._id === id ? { ...p, status } : p),
          currentProject: state.currentProject?._id === id ? { ...state.currentProject, status } : state.currentProject
        }));
        get().fetchProjects(); // Re-fetch to sync lists and stats

        // Background re-fetch for global state synchronization
        import('./adminStore').then(m => m.default.getState().fetchDashboardStats())
          .catch(err => console.error("Background sync error:", err));

        toast.success('Project status updated');
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  },

  deleteProject: async (id) => {
    try {
      const res = await api(`/projects/${id}`, { method: 'DELETE' });
      if (res.success) {
        set(state => ({
          projects: state.projects.filter(p => (p._id || p.id) !== id)
        }));
        get().fetchProjects(); // Re-fetch to sync lists and stats
        toast.success("Project and associated tasks purged successfully");
        return true;
      }
    } catch (error) {
      toast.error("Failed to delete project");
      return false;
    }
  }

}));

export default useProjectStore;
