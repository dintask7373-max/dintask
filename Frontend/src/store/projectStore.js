import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';

const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  // Fetch Projects (for current user)
  fetchProjects: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/projects');
      if (res.data.success) {
        set({ projects: res.data.data, loading: false });
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
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        set({ currentProject: res.data.data, loading: false });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch project details");
    }
  },

  // Update Project Status
  updateProjectStatus: async (id, status) => {
    try {
      const res = await api.put(`/projects/${id}`, { status });
      if (res.data.success) {
        set(state => ({
          projects: state.projects.map(p => p._id === id ? { ...p, status } : p),
          currentProject: state.currentProject?._id === id ? { ...state.currentProject, status } : state.currentProject
        }));
        toast.success("Project status updated");
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  }

}));

export default useProjectStore;
