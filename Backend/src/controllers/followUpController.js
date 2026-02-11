const FollowUp = require('../models/FollowUp');
const Lead = require('../models/Lead');

// @desc    Get follow-ups for a lead or all follow-ups for user
// @route   GET /api/v1/follow-ups
// @access  Private
exports.getFollowUps = async (req, res) => {
    try {
        let query = {};

        // Determine adminId based on role
        if (req.user.role === 'admin') {
            query.adminId = req.user.id;
        } else {
            query.adminId = req.user.adminId;
        }

        // If sales rep, only show their follow-ups
        if (req.user.role === 'sales' || req.user.role === 'sales_executive') {
            query.salesRepId = req.user.id;
        }

        // Filter by lead if provided
        if (req.query.leadId) {
            query.leadId = req.query.leadId;
        }

        const followUps = await FollowUp.find(query)
            .populate('leadId', 'name company email')
            .populate('salesRepId', 'name email')
            .sort({ scheduledAt: 1 });

        res.status(200).json({ success: true, count: followUps.length, data: followUps });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Create follow-up
// @route   POST /api/v1/follow-ups
// @access  Private
exports.createFollowUp = async (req, res) => {
    try {
        // Determine adminId based on role
        if (req.user.role === 'admin') {
            req.body.adminId = req.user.id;
        } else {
            req.body.adminId = req.user.adminId;
        }

        // If Sales Executive, verify the lead belongs to them
        if (req.user.role === 'sales' || req.user.role === 'sales_executive') {
            const lead = await Lead.findById(req.body.leadId);
            if (!lead) {
                return res.status(404).json({ success: false, error: 'Lead not found' });
            }
            if (lead.owner.toString() !== req.user.id) {
                return res.status(403).json({ success: false, error: 'Not authorized to create follow-up for this lead' });
            }
            req.body.salesRepId = req.user.id;
        }
        // If Admin, allow assigning to specific sales rep, else default to self
        else if (req.user.role === 'admin') {
            if (req.body.salesRepId) {
                // Optional: Validate salesRepId exists and is part of the workspace
            } else {
                req.body.salesRepId = req.user.id;
            }
        } else {
            // Fallback for other roles if any
            req.body.salesRepId = req.user.id;
        }

        const followUp = await FollowUp.create(req.body);

        res.status(201).json({ success: true, data: followUp });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update follow-up
// @route   PUT /api/v1/follow-ups/:id
// @access  Private
exports.updateFollowUp = async (req, res) => {
    try {
        let followUp = await FollowUp.findById(req.params.id);

        if (!followUp) {
            return res.status(404).json({ success: false, error: 'Follow-up not found' });
        }

        // Check ownership
        if (followUp.salesRepId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        followUp = await FollowUp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: followUp });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete follow-up
// @route   DELETE /api/v1/follow-ups/:id
// @access  Private
exports.deleteFollowUp = async (req, res) => {
    try {
        const followUp = await FollowUp.findById(req.params.id);

        if (!followUp) {
            return res.status(404).json({ success: false, error: 'Follow-up not found' });
        }

        // Check ownership
        if (followUp.salesRepId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        await followUp.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
