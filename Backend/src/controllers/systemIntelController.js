const SystemIntel = require('../models/SystemIntel');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all system intel
// @route   GET /api/v1/system-intel
// @access  Public
exports.getSystemIntel = async (req, res, next) => {
    try {
        const intel = await SystemIntel.find();
        res.status(200).json({
            success: true,
            data: intel
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update system intel for a role
// @route   PUT /api/v1/system-intel/:role
// @access  Private/SuperAdmin
exports.updateSystemIntel = async (req, res, next) => {
    try {
        let intel = await SystemIntel.findOne({ role: req.params.role });

        if (!intel) {
            intel = await SystemIntel.create({
                role: req.params.role,
                ...req.body
            });
        } else {
            intel = await SystemIntel.findOneAndUpdate(
                { role: req.params.role },
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );
        }

        res.status(200).json({
            success: true,
            data: intel
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Seed initial system intel data
// @route   POST /api/v1/system-intel/seed
// @access  Private/SuperAdmin
exports.seedSystemIntel = async (req, res, next) => {
    try {
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

        await SystemIntel.deleteMany();
        const intel = await SystemIntel.insertMany(initialData);

        res.status(201).json({
            success: true,
            count: intel.length,
            data: intel
        });
    } catch (err) {
        next(err);
    }
};
