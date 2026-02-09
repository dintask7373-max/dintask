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
                toast.success('Team created successfully');
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
                toast.success('Team deleted successfully');
            }
        } catch (error) {
            toast.error('Failed to delete team');
        }
    },
}));

export default useTeamStore;
