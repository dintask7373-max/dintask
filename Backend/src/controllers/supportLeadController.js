const SupportLead = require('../models/SupportLead');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Submit a new support/business inquiry lead
// @route   POST /api/v1/support/lead
// @access  Public
exports.submitLead = async (req, res, next) => {
    try {
        const {
            name,
            businessEmail,
            phone,
            companyName,
            jobTitle,
            companySize,
            industry,
            requirements
        } = req.body;

        const lead = await SupportLead.create({
            name,
            businessEmail,
            phone,
            companyName,
            jobTitle,
            companySize,
            industry,
            requirements
        });

        res.status(201).json({
            success: true,
            message: 'Support request submitted successfully',
            data: lead
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all support leads
// @route   GET /api/v1/admin/support-leads
// @access  Private (Super Admin)
exports.getLeads = async (req, res, next) => {
    try {
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const total = await SupportLead.countDocuments();

        const leads = await SupportLead.find()
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: leads.length,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: leads
        });
    } catch (err) {
        next(err);
    }
};
