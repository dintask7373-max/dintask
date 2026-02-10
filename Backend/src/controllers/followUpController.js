const FollowUp = require('../models/FollowUp');
const Lead = require('../models/Lead');

// @desc    Get follow-ups for a lead or all follow-ups for user
// @route   GET /api/v1/follow-ups
// @access  Private
exports.getFollowUps = async (req, res) => {
    try {
        let query = { adminId: req.user.adminId };

        // If sales rep, only show their follow-ups
        if (req.user.role === 'sales') {
            query.salesRepId = req.user.id;
        }

        // Filter by lead if provided
        if (req.query.leadId) {
            query.leadId = req.query.leadId;
        }

        const followUps = await FollowUp.find(query)
            .populate('leadId', 'name company email')
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
        req.body.adminId = req.user.adminId;
        req.body.salesRepId = req.user.id; // Automatically assign to creator

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
