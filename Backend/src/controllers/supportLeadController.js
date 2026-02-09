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
            requirements,
            source,
            interestedPlan
        } = req.body;

        const lead = await SupportLead.create({
            name,
            businessEmail,
            phone,
            companyName,
            jobTitle,
            companySize,
            industry,
            requirements,
            source,
            interestedPlan
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
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const total = await SupportLead.countDocuments();

        // Summary API: Select only necessary fields for the table
        const leads = await SupportLead.find()
            .select('name businessEmail phone companyName interestedPlan status source createdAt')
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

// @desc    Get single lead details
// @route   GET /api/v1/admin/support-leads/:id
// @access  Private (Super Admin)
exports.getLead = async (req, res, next) => {
    try {
        const lead = await SupportLead.findById(req.params.id);

        if (!lead) {
            return next(new ErrorResponse(`Lead not found with id of ${req.params.id}`, 404));
        }

        res.status(200).json({
            success: true,
            data: lead
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update lead status (Mark as replied, archived, etc.)
// @route   PUT /api/v1/admin/support-leads/:id
// @access  Private (Super Admin)
exports.updateLead = async (req, res, next) => {
    try {
        const { status } = req.body;

        // Find lead
        let lead = await SupportLead.findById(req.params.id);

        if (!lead) {
            return next(new ErrorResponse(`Lead not found with id of ${req.params.id}`, 404));
        }

        // Update lead
        lead = await SupportLead.findByIdAndUpdate(req.params.id, { status }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: lead
        });
    } catch (err) {
        next(err);
    }
};
