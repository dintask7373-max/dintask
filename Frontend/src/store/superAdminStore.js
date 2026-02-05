import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useSuperAdminStore = create(
    persist(
        (set, get) => ({
            admins: [
                {
                    id: 'adm-1',
                    name: 'Tech Solutions Inc.',
                    owner: 'John Boss',
                    email: 'admin@demo.com',
                    status: 'active',
                    plan: 'Pro Team',
                    employees: 4,
                    tasks: 12,
                    joinedDate: '2025-10-15'
                },
                {
                    id: 'adm-2',
                    name: 'Creative Agency',
                    owner: 'Sarah Boss',
                    email: 'sarah@creative.com',
                    status: 'pending',
                    plan: 'Starter',
                    employees: 1,
                    tasks: 2,
                    joinedDate: '2026-01-02'
                },
                {
                    id: 'adm-3',
                    name: 'Global Logistics',
                    owner: 'Mike Boss',
                    email: 'mike@logistics.com',
                    status: 'suspended',
                    plan: 'Business',
                    employees: 18,
                    tasks: 145,
                    joinedDate: '2025-05-20'
                }
            ],

            plans: [
                { id: 'p1', name: 'Starter', price: 999, limit: 2, isActive: true, features: ['2 Team Members', 'Basic Support', 'CRM Access'] },
                { id: 'p2', name: 'Pro Team', price: 2499, limit: 5, isActive: true, features: ['5 Team Members', 'Priority Support', 'Full CRM', 'Reporting'] },
                { id: 'p3', name: 'Business', price: 4999, limit: 20, isActive: true, features: ['20 Team Members', '24/7 Support', 'Advanced Analytics', 'Custom Labels'] },
                { id: 'p4', name: 'Trial Plan', price: 2499, limit: 5, isActive: true, trialDays: 7, features: ['7 Days Trial', 'Pro Features'] },
                { id: 'p5', name: 'Enterprise', price: 9999, limit: 100, isActive: true, trialDays: 7, features: ['Unlimited Members', 'Custom SSO', '99.9% Uptime'] }
            ],

            stats: {
                totalRevenue: 485000,
                activeCompanies: 12,
                avgCompletionRate: 92
            },

            systemSettings: {
                platformName: 'DinTask CRM',
                supportEmail: 'support@dintask.com',
                maintenanceMode: false,
                force2FA: true,
                sessionTimeout: 24 // hours
            },

            updateSystemSettings: (settings) => {
                set((state) => ({
                    systemSettings: { ...state.systemSettings, ...settings }
                }));
            },

            updateAdminStatus: (id, status) => {
                set((state) => ({
                    admins: state.admins.map((adm) =>
                        adm.id === id ? { ...adm, status } : adm
                    ),
                }));
            },

            deleteAdmin: (id) => {
                set((state) => ({
                    admins: state.admins.filter((adm) => adm.id !== id),
                }));
            },

            addAdmin: (newAdmin) => {
                set((state) => ({
                    admins: [
                        {
                            ...newAdmin,
                            id: `adm-${Date.now()}`,
                            joinedDate: new Date().toISOString().split('T')[0],
                            employees: 0,
                            tasks: 0,
                            status: newAdmin.status || 'pending'
                        },
                        ...state.admins
                    ]
                }));
            },

            addPlan: (newPlan) => {
                set((state) => ({
                    plans: [...state.plans, { ...newPlan, id: `p${Date.now()}` }]
                }));
            },

            updatePlan: (id, updatedPlan) => {
                set((state) => ({
                    plans: state.plans.map((p) =>
                        p.id === id ? { ...p, ...updatedPlan } : p
                    ),
                }));
            },

            deletePlan: (id) => {
                set((state) => ({
                    plans: state.plans.filter((p) => p.id !== id),
                }));
            },
            inquiries: [
                {
                    id: 'inq-1',
                    firstName: 'John',
                    lastName: 'Doe',
                    workEmail: 'john@example.com',
                    phone: '+1 234 567 8900',
                    company: 'Tech Corp',
                    planSelected: 'Enterprise',
                    questions: 'We need custom SSO integration and 500+ seats.',
                    date: new Date(Date.now() - 86400000).toISOString(),
                    status: 'new'
                },
                {
                    id: 'inq-2',
                    firstName: 'Sarah',
                    lastName: 'Smith',
                    workEmail: 'sarah@design.co',
                    phone: '+1 987 654 3210',
                    company: 'Design Studio',
                    planSelected: 'Pro',
                    questions: 'What is the limit for file storage on the Pro plan?',
                    date: new Date(Date.now() - 172800000).toISOString(),
                    status: 'replied'
                },
                {
                    id: 'inq-3',
                    firstName: 'Michael',
                    lastName: 'Brown',
                    workEmail: 'm.brown@global.com',
                    phone: '+44 20 7123 4567',
                    company: 'Global Inc',
                    planSelected: 'Enterprise',
                    questions: 'Looking for multi-region data residency options.',
                    date: new Date(Date.now() - 3600000).toISOString(),
                    status: 'new'
                }
            ],

            addInquiry: (inquiry) => {
                set((state) => ({
                    inquiries: [
                        { ...inquiry, id: `inq-${Date.now()}`, date: new Date().toISOString(), status: 'new' },
                        ...state.inquiries
                    ]
                }));
            },

            updateInquiryStatus: (id, status) => {
                set((state) => ({
                    inquiries: state.inquiries.map((inq) =>
                        inq.id === id ? { ...inq, status } : inq
                    ),
                }));
            },
        }),
        {
            name: 'dintask-superadmin-storage-v2',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);

export default useSuperAdminStore;
