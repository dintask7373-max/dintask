import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';

const useTeamStore = create((set, get) => ({
    teams: [],
    loading: false,
    error: null,

    fetchTeams: async () => {
        set({ loading: true });
        try {
            const res = await api('/teams');
            if (res.success) {
                set({ teams: res.data, loading: false });
            } else {
                set({ error: res.error, loading: false });
            }
        } catch (error) {
            set({ error: error.message, loading: false });
            toast.error('Failed to fetch teams');
        }
    },

    createTeam: async (teamData) => {
        set({ loading: true });
        try {
            const res = await api('/teams', {
                method: 'POST',
                body: teamData,
            });
            if (res.success) {
                set((state) => ({
                    teams: [...state.teams, res.data],
                    loading: false,
                }));
                get().fetchTeams();

                // Background re-fetch for global state synchronization
                import('./adminStore').then(m => m.default.getState().fetchDashboardStats())
                    .catch(err => console.error("Background sync error:", err));

                toast.success(res.message || 'Team created successfully');
                return res.data;
            }
        } catch (error) {
            set({ error: error.message, loading: false });
            toast.error('Failed to create team');
        }
    },

    updateTeam: async (teamId, teamData) => {
        set({ loading: true });
        try {
            const res = await api(`/teams/${teamId}`, {
                method: 'PUT',
                body: teamData,
            });
            if (res.success) {
                set((state) => ({
                    teams: state.teams.map((t) => (t._id === teamId ? res.data : t)),
                    loading: false,
                }));
                get().fetchTeams();

                // Background re-fetch for global state synchronization
                import('./adminStore').then(m => m.default.getState().fetchDashboardStats())
                    .catch(err => console.error("Background sync error:", err));

                toast.success('Team updated successfully');
            }
        } catch (error) {
            set({ error: error.message, loading: false });
            toast.error('Failed to update team');
        }
    },

    deleteTeam: async (teamId) => {
        try {
            const res = await api(`/teams/${teamId}`, {
                method: 'DELETE',
            });
            if (res.success) {
                set((state) => ({
                    teams: state.teams.filter((t) => t._id !== teamId),
                }));
                get().fetchTeams();

                // Background re-fetch for global state synchronization
                import('./adminStore').then(m => m.default.getState().fetchDashboardStats())
                    .catch(err => console.error("Background sync error:", err));

                toast.success('Team deleted successfully');
            }
        } catch (error) {
            toast.error('Failed to delete team');
        }
    },
}));

export default useTeamStore;
