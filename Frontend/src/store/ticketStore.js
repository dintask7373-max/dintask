import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useTicketStore = create(
    persist(
        (set, get) => ({
            tickets: [
                {
                    id: 'TIC-101',
                    senderId: '103',
                    senderName: 'Chirag J',
                    senderRole: 'employee',
                    receiverRole: 'admin',
                    companyId: 'adm-1', // Assuming connection to Tech Solutions Inc.
                    subject: 'Vite Build Error',
                    description: 'The local build fails whenever I add a new lucide-react icon.',
                    category: 'Technical',
                    priority: 'High',
                    status: 'Open',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'TIC-102',
                    senderId: 'admin',
                    senderName: 'Boss Admin',
                    senderRole: 'admin',
                    receiverRole: 'superadmin',
                    companyId: 'adm-1',
                    subject: 'Billing discrepancy for Jan-2026',
                    description: 'The invoice shows 10 employees but we only have 4 active.',
                    category: 'Billing',
                    priority: 'Medium',
                    status: 'Pending',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'TIC-103',
                    senderId: 'S001',
                    senderName: 'John Sales',
                    senderRole: 'sales',
                    receiverRole: 'admin',
                    companyId: 'adm-1',
                    subject: 'Lead Export issue',
                    description: 'Cannot export leads to CSV from the dashboard.',
                    category: 'Technical',
                    priority: 'Low',
                    status: 'Open',
                    createdAt: new Date().toISOString()
                }
            ],

            addTicket: (ticketData) => {
                set((state) => ({
                    tickets: [
                        {
                            ...ticketData,
                            id: `TIC-${Math.floor(Math.random() * 10000)}`,
                            createdAt: new Date().toISOString(),
                            status: 'Open'
                        },
                        ...state.tickets
                    ]
                }));
            },

            updateTicketStatus: (id, status) => {
                set((state) => ({
                    tickets: state.tickets.map((t) =>
                        t.id === id ? { ...t, status } : t
                    )
                }));
            },

            getTicketsForUser: (userId) => {
                return get().tickets.filter(t => t.senderId === userId);
            },

            getTicketsByReceiver: (role) => {
                return get().tickets.filter(t => t.receiverRole === role);
            }
        }),
        {
            name: 'dintask-ticket-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);

export default useTicketStore;
