const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const SystemIntel = require('./src/models/SystemIntel');

dotenv.config();

const defaultData = [
    {
        role: 'Admin',
        title: 'Strategic Command',
        process: 'Infrastructure Oversight -> Resource Allocation -> Performance Intelligence',
        flow: [
            'Manage entire workspace hierarchy (Managers, Sales, Employees)',
            'Oversee global subscription and billing infrastructure',
            'Analyze enterprise-level reports and analytics',
            'Execute high-level system configurations and security protocols'
        ],
        features: ['Fleet Management', 'Billing Core', 'Global Analytics', 'Secure Comms'],
        icon: 'Shield'
    },
    {
        role: 'Manager',
        title: 'Execution Orchestrator',
        process: 'Project Definition -> Task Delegation -> Velocity Monitoring',
        flow: [
            'Create and manage complex project roadmaps',
            'Intelligent task distribution to team subordinates',
            'Real-time tracking of team progress and sprint velocity',
            'Generate departmental performance reports'
        ],
        features: ['Project Ops', 'Task Delegation', 'Team Pulse', 'Sprint Reports'],
        icon: 'Briefcase'
    },
    {
        role: 'Sales',
        title: 'Revenue Architect',
        process: 'Lead Acquisition -> Deal Negotiation -> Conversion Success',
        flow: [
            'Full lifecycle Deal & Client Relationship Management',
            'Navigate tactical CRM Pipeline (Leads to Closed-Won)',
            'Monitor revenue velocity and performance targets',
            'Automated follow-up protocols and scheduling'
        ],
        features: ['Deal Pipeline', 'Client Matrix', 'Revenue Intel', 'Schedule Sync'],
        icon: 'BarChart3'
    },
    {
        role: 'Employee',
        title: 'Operational Specialist',
        process: 'Personal Backlog -> Task Execution -> Progress Deployment',
        flow: [
            'Manage personal task backlog and priorities',
            'Execute assigned operational objectives',
            'Update personal performance metrics and daily logs',
            'Engage with team synchronization protocols'
        ],
        features: ['Task Home', 'Personal Notes', 'Activity Log', 'Sync Portal'],
        icon: 'Users'
    },
    {
        role: 'SuperAdmin',
        title: 'Root Commander',
        process: 'System Initialization -> Global Governance -> Platform Intelligence',
        flow: [
            'Complete authority over platform-wide configurations',
            'Manage all enterprise accounts and subscription plans',
            'Monitor global system health and security audits',
            'Analyze aggregate platform performance and growth'
        ],
        features: ['Root Access', 'Plan Factory', 'Global Metrics', 'Audit logs'],
        icon: 'ShieldCheck'
    }
];

const seedIntel = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected for seeding intel...');

        await SystemIntel.deleteMany();
        await SystemIntel.insertMany(defaultData);

        console.log('System Intel seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding intel:', error);
        process.exit(1);
    }
};

seedIntel();
