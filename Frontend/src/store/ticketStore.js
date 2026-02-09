import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';

const useTicketStore = create((set, get) => ({
    tickets: [],
    loading: false,
    error: null,

    stats: {
        avgFeedback: 0,
        resolvedRate: 0,
        inTimeResolution: 0
    },

    fetchTicketStats: async () => {
        try {
            const res = await api('/support-tickets/stats');
            if (res.success) {
                set({ stats: res.data });
            }
        } catch (err) {
            console.error("Fetch Stats Error:", err);
        }
    },

    fetchTickets: async (scope = 'all') => {
        set({ loading: true, error: null });
        try {
            const query = scope ? `?scope=${scope}` : '';
            const res = await api(`/support-tickets${query}`);
            set({ tickets: res.data || [], loading: false });
        } catch (err) {
            console.error("Fetch Tickets Error:", err);
            set({ error: err.message, loading: false });
            // toast.error(err.message || 'Failed to fetch tickets'); 
        }
    },

    addTicket: async (ticketData) => {
        set({ loading: true });
        try {
            // Map frontend fields to backend fields
            const payload = {
                title: ticketData.subject,
                description: ticketData.description,
                type: ticketData.category,
                priority: ticketData.priority,
                // attachments: ticketData.attachments 
            };

            const res = await api('/support-tickets', {
                method: 'POST',
                body: payload
            });

            set((state) => ({
                tickets: [res.data, ...state.tickets],
                loading: false
            }));
            toast.success('Ticket created successfully');
            return true;
        } catch (err) {
            console.error("Create Ticket Error:", err);
            toast.error(err.message || 'Failed to create ticket');
            set({ loading: false });
            return false;
        }
    },

    updateTicketStatus: async (id, status) => {
        // Optimistic update
        const originalTickets = get().tickets;
        set((state) => ({
            tickets: state.tickets.map((t) =>
                t._id === id ? { ...t, status } : t
            )
        }));

        try {
            await api(`/support-tickets/${id}`, {
                method: 'PUT',
                body: { status }
            });
            toast.success(`Ticket marked as ${status}`);
        } catch (err) {
            console.error("Update Ticket Error:", err);
            toast.error(err.message || 'Failed to update ticket');
            // Revert
            set({ tickets: originalTickets });
        }
    },

    replyToTicket: async (id, message) => {
        try {
            const res = await api(`/support-tickets/${id}`, {
                method: 'PUT',
                body: { response: message }
            });

            // Update local state with the returned updated ticket
            set((state) => ({
                tickets: state.tickets.map((t) =>
                    t._id === id ? res.data : t // Backend returns fully populated updated ticket
                )
            }));

            toast.success('Reply sent successfully');
            return true;
        } catch (err) {
            console.error("Reply Error:", err);
            toast.error(err.message || 'Failed to send reply');
            return false;
        }
    },

    escalateTicket: async (id) => {
        try {
            const res = await api(`/support-tickets/${id}`, {
                method: 'PUT',
                body: { isEscalatedToSuperAdmin: true, status: 'Escalated' }
            });

            set((state) => ({
                tickets: state.tickets.map((t) =>
                    t._id === id ? res.data : t
                )
            }));

            toast.success('Ticket escalated to Super Admin');
            return true;
        } catch (err) {
            console.error("Escalation Error:", err);
            toast.error(err.message || 'Failed to escalate ticket');
            return false;
        }
    }
}));

export default useTicketStore;
