const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SystemIntel = require('./src/models/SystemIntel');
const connectDB = require('./src/config/db');

dotenv.config();

const initialData = [
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
        features: ['Fleet Management', 'Billing Core', 'Global Analytics', 'Secure Comms']
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
        features: ['Project Ops', 'Task Delegation', 'Team Pulse', 'Sprint Reports']
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
        features: ['Deal Pipeline', 'Client Matrix', 'Revenue Intel', 'Schedule Sync']
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
        features: ['Task Home', 'Personal Notes', 'Activity Log', 'Sync Portal']
    }
];

const seedIntel = async () => {
    try {
        await connectDB();

        await SystemIntel.deleteMany();
        await SystemIntel.insertMany(initialData);

        console.log('System Intel Data Seeded Successfully');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedIntel();
