import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';

const useScheduleStore = create((set, get) => ({
    schedules: [],
    participants: [], // Potential members (Managers, Employees, Sales)
    loading: false,
    error: null,

    fetchSchedules: async () => {
        set({ loading: true });
        try {
            const res = await api('/schedules');
            if (res.success) {
                set({ schedules: res.data, loading: false, error: null });
            }
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error("Failed to fetch schedules:", error);
        }
    },

    fetchParticipants: async () => {
        try {
            const res = await api('/schedules/participants');
            if (res.success) {
                set({ participants: res.data });
            }
        } catch (error) {
            console.error("Failed to fetch participants:", error);
        }
    },

    addScheduleEvent: async (eventData) => {
        set({ loading: true });
        try {
            const res = await api('/schedules', {
                method: 'POST',
                body: eventData
            });
            if (res.success) {
                set((state) => ({
                    schedules: [...state.schedules, res.data],
                    loading: false
                }));
                toast.success('Event scheduled successfully');
                return res.data;
            }
        } catch (error) {
            set({ loading: false });
            toast.error(error.message || 'Failed to schedule event');
            throw error;
        }
    },

    updateScheduleEvent: async (eventId, updatedData) => {
        try {
            const res = await api(`/schedules/${eventId}`, {
                method: 'PUT',
                body: updatedData
            });
            if (res.success) {
                set((state) => ({
                    schedules: state.schedules.map((event) =>
                        event._id === eventId ? res.data : event
                    ),
                }));
                toast.success('Event updated');
            }
        } catch (error) {
            toast.error(error.message || 'Update failed');
        }
    },

    deleteScheduleEvent: async (eventId) => {
        try {
            const res = await api(`/schedules/${eventId}`, {
                method: 'DELETE'
            });
            if (res.success) {
                set((state) => ({
                    schedules: state.schedules.filter((event) => (event._id || event.id) !== eventId),
                }));
                toast.success('Event removed');
            }
        } catch (error) {
            toast.error(error.message || 'Deletion failed');
        }
    }
}));

export default useScheduleStore;
