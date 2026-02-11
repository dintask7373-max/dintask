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
      const res = await api('/projects');
      if (res.success) {
        set({ projects: res.data, loading: false });
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
        toast.success("Project status updated");
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
