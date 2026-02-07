import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';

const useTicketStore = create((set, get) => ({
    tickets: [],
    loading: false,
    error: null,

    fetchTickets: async () => {
        set({ loading: true, error: null });
        try {
            const res = await api('/support-tickets');
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
    }
}));

export default useTicketStore;
