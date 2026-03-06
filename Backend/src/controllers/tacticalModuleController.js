const TacticalModule = require('../models/TacticalModule');

// Default initial data
const defaultModules = [
    {
        moduleId: 'admin',
        title: 'Admin Console',
        description: 'Centralized control center to manage managers, employees, and overall system health.',
        icon: 'ShieldCheck',
        image: 'https://res.cloudinary.com/djaq2196e/image/upload/v1707560001/dashboard_1_placeholder.png',
        themeColor: 'blue',
        targetAudience: 'For System Admins & Owners',
        detailedFeatures: ['Manager Oversight', 'Employee Directory', 'System Analytics', 'Permission Controls', 'Global Settings'],
        tags: ['Management', 'Security', 'Control', 'Dashboard']
    },
    {
        moduleId: 'manager',
        title: 'Manager Station',
        description: 'Powerful tools for task delegation, team progress monitoring, and schedule management.',
        icon: 'LayoutDashboard',
        image: 'https://res.cloudinary.com/djaq2196e/image/upload/v1707560002/dashboard_2_placeholder.png',
        themeColor: 'purple',
        targetAudience: 'For Team Leads & Managers',
        detailedFeatures: ['Task Delegation', 'Performance Metrics', 'Team Chat', 'Real-time Sync', 'Leave Approvals'],
        tags: ['Leadership', 'Strategy', 'Oversight', 'Planning']
    },
    {
        moduleId: 'employee',
        title: 'Employee Portal',
        description: 'Personalized task dashboard designed for maximum productivity and focus.',
        icon: 'Target',
        image: 'https://res.cloudinary.com/djaq2196e/image/upload/v1707560003/dashboard_3_placeholder.png',
        themeColor: 'amber',
        targetAudience: 'For Individual Contributors',
        detailedFeatures: ['Task List', 'Calendar Sync', 'Personal Notes', 'Quick Actions', 'Time Tracking'],
        tags: ['Productivity', 'Focus', 'Tasks', 'Goals']
    },
    {
        moduleId: 'sales',
        title: 'Sales & CRM',
        description: 'Track leads, manage pipelines, and close deals with our integrated CRM suite.',
        icon: 'Briefcase',
        image: 'https://res.cloudinary.com/djaq2196e/image/upload/v1707560001/dashboard_1_placeholder.png',
        themeColor: 'emerald',
        targetAudience: 'For Sales Teams & Leaders',
        detailedFeatures: ['Lead Management', 'Sales Pipeline', 'Follow-up Scheduler', 'Client Portal', 'Deal Forecasting'],
        tags: ['Leads', 'Deals', 'Revenue', 'Growth']
    }
];

// @desc    Get all tactical modules
// @route   GET /api/v1/tactical-modules
// @access  Public
exports.getModules = async (req, res, next) => {
    try {
        let modules = await TacticalModule.find().sort({ createdAt: 1 });

        if (modules.length === 0) {
            modules = await TacticalModule.insertMany(defaultModules);
        }

        // Fix order manually just in case
        const order = ['admin', 'manager', 'employee', 'sales'];
        modules.sort((a, b) => order.indexOf(a.moduleId) - order.indexOf(b.moduleId));

        res.status(200).json({
            success: true,
            data: modules
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a tactical module
// @route   PUT /api/v1/tactical-modules/:moduleId (using moduleId string like 'admin')
// @access  Private (SuperAdmin)
exports.updateModule = async (req, res, next) => {
    try {
        const { moduleId: docId } = req.params; // Expecting 'admin', 'manager' etc. or _id

        // Find by moduleId string first, fallback to _id if needed
        let tacticalMod = await TacticalModule.findOne({ moduleId: docId });

        if (!tacticalMod) {
            // Maybe user passed _id?
            try {
                tacticalMod = await TacticalModule.findById(docId);
            } catch (e) { }

            if (!tacticalMod) {
                return res.status(404).json({
                    success: false,
                    message: 'Module not found'
                });
            }
        }

        const {
            title,
            description,
            icon,
            themeColor,
            targetAudience,
            detailedFeatures,
            tags
        } = req.body;

        // Update fields if provided
        if (title) tacticalMod.title = title;
        if (description) tacticalMod.description = description;
        if (icon) tacticalMod.icon = icon;
        if (themeColor) tacticalMod.themeColor = themeColor;
        if (targetAudience) tacticalMod.targetAudience = targetAudience;

        // Handle image upload with upload.any()
        if (req.files && req.files.length > 0) {
            const imageFile = req.files.find(f => f.fieldname === 'image');
            if (imageFile) {
                tacticalMod.image = imageFile.path;
            }
        } else if (req.file) {
            // Fallback if upload.single was used
            tacticalMod.image = req.file.path;
        }

        if (detailedFeatures) {
            try {
                // If it's a string, parse it. If it's already an array (from JSON body), use it.
                tacticalMod.detailedFeatures = typeof detailedFeatures === 'string' ? JSON.parse(detailedFeatures) : detailedFeatures;
            } catch (e) {
                console.log('Error parsing detailedFeatures:', e);
            }
        }

        if (tags) {
            try {
                tacticalMod.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            } catch (e) {
                console.log('Error parsing tags:', e);
            }
        }

        await tacticalMod.save();

        res.status(200).json({
            success: true,
            data: tacticalMod,
            message: 'Module updated successfully'
        });
    } catch (error) {
        next(error);
    }
};
