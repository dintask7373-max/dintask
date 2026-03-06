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
        const { leadId, type, scheduledAt } = req.body;

        if (!leadId) {
            return res.status(400).json({ success: false, error: 'Please select a valid Lead for tracking' });
        }

        if (!type || !['Call', 'Meeting', 'Email', 'WhatsApp'].includes(type)) {
            return res.status(400).json({ success: false, error: 'Invalid interaction type selected' });
        }

        if (!scheduledAt) {
            return res.status(400).json({ success: false, error: 'Mandatory: Please specify the temporal window for this sync' });
        }

        const syncDate = new Date(scheduledAt);
        if (isNaN(syncDate.getTime())) {
            return res.status(400).json({ success: false, error: 'Invalid temporal format' });
        }

        // Only enforce future dates for NEW "Scheduled" follow-ups
        // Note: For migrations or manual logging of past events, we might relax this, 
        // but for fresh commands, we want to ensure focus on future ops.
        if (req.body.status === 'Scheduled' && syncDate < new Date()) {
            return res.status(400).json({ success: false, error: 'Temporal Anomaly: Cannot schedule synchronization in the past' });
        }

        // If Sales Executive, verify the lead belongs to them
        if (req.user.role === 'sales' || req.user.role === 'sales_executive') {
            const lead = await Lead.findById(leadId);
            if (!lead) {
                return res.status(404).json({ success: false, error: 'Lead not found' });
            }
            if (lead.owner.toString() !== req.user.id) {
                return res.status(403).json({ success: false, error: 'Not authorized to create follow-up for this lead' });
            }
            req.body.salesRepId = req.user.id;
            req.body.adminId = lead.adminId;
        }
        // If Admin, allow assigning to specific sales rep, else default to self
        else if (req.user.role === 'admin') {
            const lead = await Lead.findById(leadId);
            if (!lead) {
                return res.status(404).json({ success: false, error: 'Lead not found' });
            }
            req.body.adminId = lead.adminId || req.user.id;

            if (req.body.salesRepId) {
                // Optional: Validate salesRepId exists and is part of the workspace
            } else {
                req.body.salesRepId = req.user.id;
            }
        } else {
            // Fallback for other roles if any
            const lead = await Lead.findById(leadId);
            if (lead) {
                req.body.adminId = lead.adminId;
            }
            req.body.salesRepId = req.user.id;
        }

        const followUp = await FollowUp.create(req.body);

        // Notify Sales Rep if Admin creates a follow-up for them
        if (req.user.role === 'admin' && req.body.salesRepId && req.body.salesRepId !== req.user.id) {
            try {
                const Notification = require('../models/Notification');
                const lead = await Lead.findById(leadId);
                await Notification.create({
                    recipient: req.body.salesRepId,
                    sender: req.user.id,
                    adminId: req.user.id, // Admin's ID is the workspace ID
                    type: 'general',
                    title: 'New Follow-up Scheduled',
                    message: `Admin scheduled a ${type} for lead "${lead?.name || 'Unknown'}" on ${new Date(scheduledAt).toLocaleString()}.`,
                    link: '/sales/follow-ups'
                });
            } catch (err) {
                console.error('Follow-up Notification Error:', err);
            }
        }

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
