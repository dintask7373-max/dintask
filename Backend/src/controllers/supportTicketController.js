const SupportTicket = require('../models/SupportTicket');
const ErrorResponse = require('../utils/errorResponse');
const Admin = require('../models/Admin');
const Notification = require('../models/Notification');
const SuperAdmin = require('../models/SuperAdmin');
const mongoose = require('mongoose');

// Helper to generate Ticket ID
const generateTicketId = () => {
    return '#TKT-' + Math.floor(100000 + Math.random() * 900000); // Simple 6 digit ID
};

// @desc    Create a new support ticket
// @route   POST /api/v1/support-tickets
// @access  Private
exports.createTicket = async (req, res, next) => {
    try {
        const { title, description, type, priority, attachments } = req.body;

        let companyId = null;
        let isEscalatedToSuperAdmin = false;
        let assignedPartnerId = null;

        const userRole = (req.user.role || '').toLowerCase();
        const isAdmin = userRole === 'admin';
        const isStaff = ['employee', 'manager', 'sales', 'sales_executive'].includes(userRole);

        console.log(`[SupportTicket] createTicket - User: ${req.user.name}, Role: ${userRole}, PartnerID: ${req.user.partnerId}`);

        if (isAdmin) {
            companyId = req.user.id;

            // Check if this admin has a partner
            if (req.user.partnerId && req.user.partnerId.toString() !== '') {
                assignedPartnerId = req.user.partnerId;
                isEscalatedToSuperAdmin = false;
                console.log(`[SupportTicket] Routing to Partner: ${assignedPartnerId}`);
            } else {
                // Direct client (no partner), goes to SuperAdmin
                isEscalatedToSuperAdmin = true;
                console.log(`[SupportTicket] No partner found. Escalating to SuperAdmin.`);
            }
        } else if (isStaff) {
            companyId = req.user.adminId;
            isEscalatedToSuperAdmin = false;
            // Note: Staff tickets go to their own Workspace Admin first
        }

        if (!companyId) {
            return next(new ErrorResponse('Company configuration error. Cannot route ticket.', 500));
        }

        const ticket = await SupportTicket.create({
            ticketId: generateTicketId(),
            title,
            description,
            type,
            priority,
            attachments,
            creator: req.user.id,
            creatorModel: isAdmin ? 'Admin' : (userRole === 'manager' ? 'Manager' : (userRole.includes('sales') ? 'SalesExecutive' : 'Employee')),
            companyId,
            assignedPartnerId,
            isEscalatedToSuperAdmin
        });

        console.log(`[SupportTicket] Ticket created: ${ticket.ticketId}, isEscalated: ${ticket.isEscalatedToSuperAdmin}, assignedPartner: ${ticket.assignedPartnerId}`);

        // Create Persistent Notification
        try {
            if (ticket.isEscalatedToSuperAdmin) {
                const superAdmins = await SuperAdmin.find({ role: { $in: ['superadmin', 'superadmin_staff', 'super_admin'] } });
                const notifications = superAdmins.map(sa => ({
                    recipient: sa._id,
                    sender: req.user.id,
                    type: 'support_ticket',
                    title: 'New Support Escalation',
                    message: `Admin ${req.user.name} has raised a new escalation: ${ticket.title}`,
                    link: `/superadmin/support`
                }));
                if (notifications.length > 0) await Notification.insertMany(notifications);
            } else if (ticket.assignedPartnerId) {
                await Notification.create({
                    recipient: ticket.assignedPartnerId,
                    sender: req.user.id,
                    type: 'support_ticket',
                    title: 'New Client Ticket',
                    message: `Your client ${req.user.name} raised a ticket: ${ticket.title}`,
                    link: `/partner/support`
                });
            } else {
                await Notification.create({
                    recipient: ticket.companyId,
                    sender: req.user.id,
                    type: 'support_ticket',
                    title: 'New Support Ticket',
                    message: `${req.user.name} raised a ticket: ${ticket.title}`,
                    link: `/support`
                });
            }
        } catch (err) {
            console.error('Notification Error:', err);
        }

        const populatedTicket = await SupportTicket.findById(ticket._id)
            .populate('creator', 'name email role phoneNumber')
            .populate('companyId', 'companyName');

        // Emit socket event for real-time updates
        if (global.io) {
            const ticketObj = populatedTicket.toObject();
            
            // Emit to Company Room (Admins/Managers)
            global.io.to(ticket.companyId.toString()).emit('new_support_ticket', ticketObj);
            
            // Emit to SuperAdmin Room if escalated
            if (ticket.isEscalatedToSuperAdmin) {
                global.io.to('superadmin_room').emit('new_support_ticket', ticketObj);
            }
        }

        res.status(201).json({ success: true, data: populatedTicket });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all tickets (Role based visibility)
// @route   GET /api/v1/support-tickets
// @access  Private
exports.getTickets = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const search = req.query.search;

        const userRole = (req.user.role || '').toLowerCase();
        let match = {};

        if (['superadmin', 'superadmin_staff', 'super_admin'].includes(userRole)) {
            // Super Admin sees all escalated tickets OR ALL tickets created by Admins (higher level oversight)
            match = {
                $or: [
                    { isEscalatedToSuperAdmin: true },
                    { creatorModel: 'Admin' }
                ]
            };
        } else if (userRole === 'partner') {
            match = { assignedPartnerId: req.user.id, isEscalatedToSuperAdmin: false };
        } else if (userRole === 'admin') {
            match = req.query.scope === 'my' ? { creator: req.user.id } : { companyId: req.user.id };
        } else {
            match = { creator: req.user.id };
        }

        console.log(`[SupportTicket] getTickets - User: ${req.user.name}, Role: ${userRole}, Match:`, JSON.stringify(match));

        if (req.query.status && req.query.status !== 'All') match.status = req.query.status;
        if (req.query.priority && req.query.priority !== 'All') match.priority = req.query.priority;
        if (search) {
            match.$or = match.$or || [];
            match.$or.push(
                { title: { $regex: search, $options: 'i' } },
                { ticketId: { $regex: search, $options: 'i' } }
            );
        }

        const total = await SupportTicket.countDocuments(match);
        const tickets = await SupportTicket.find(match)
            .populate('creator', 'name email role phoneNumber')
            .populate('companyId', 'companyName')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: tickets.length,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            data: tickets
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete ticket
// @route   DELETE /api/v1/support-tickets/:id
exports.deleteTicket = async (req, res, next) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) return next(new ErrorResponse('Ticket not found', 404));
        const userRole = (req.user.role || '').toLowerCase();
        if (!['superadmin', 'superadmin_staff', 'super_admin'].includes(userRole)) {
            return next(new ErrorResponse('Not authorized', 403));
        }
        await ticket.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single ticket
exports.getTicket = async (req, res, next) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id)
            .populate('creator', 'name email role phoneNumber')
            .populate('companyId', 'companyName');
        if (!ticket) return next(new ErrorResponse('Ticket not found', 404));

        // Access logic
        const userRole = (req.user.role || '').toLowerCase();
        if (!['superadmin', 'superadmin_staff', 'super_admin'].includes(userRole)) {
            if (userRole === 'partner') {
                if (ticket.assignedPartnerId?.toString() !== req.user.id.toString()) return next(new ErrorResponse('Not authorized', 401));
            } else {
                const compId = userRole === 'admin' ? req.user.id : req.user.adminId;
                if (ticket.companyId.toString() !== compId.toString()) return next(new ErrorResponse('Not authorized', 401));
            }
        }
        res.status(200).json({ success: true, data: ticket });
    } catch (err) {
        next(err);
    }
};

// @desc    Update ticket
exports.updateTicket = async (req, res, next) => {
    try {
        let ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) return next(new ErrorResponse('Ticket not found', 404));

        const userRole = (req.user.role || '').toLowerCase();
        if (!['superadmin', 'superadmin_staff', 'super_admin'].includes(userRole)) {
            if (userRole === 'partner') {
                if (ticket.assignedPartnerId?.toString() !== req.user.id.toString()) return next(new ErrorResponse('Not authorized', 401));
            } else {
                const compId = userRole === 'admin' ? req.user.id : req.user.adminId;
                if (ticket.companyId.toString() !== compId.toString()) return next(new ErrorResponse('Not authorized', 401));
            }
        }

        if (req.body.response) {
            const responderModel = ['superadmin', 'superadmin_staff', 'super_admin'].includes(userRole) ? 'SuperAdmin' :
                userRole === 'admin' ? 'Admin' :
                    userRole === 'partner' ? 'Partner' :
                        userRole.includes('sales') ? 'SalesExecutive' :
                            userRole.charAt(0).toUpperCase() + userRole.slice(1);

            ticket.responses.push({
                responder: req.user.id,
                responderModel,
                message: req.body.response
            });
        }

        if (req.body.status) {
            ticket.status = req.body.status;
            if (['Resolved', 'Closed'].includes(req.body.status)) ticket.resolvedAt = Date.now();
            else ticket.resolvedAt = undefined;
        }
        if (req.body.priority) ticket.priority = req.body.priority;
        if (req.body.isEscalatedToSuperAdmin !== undefined) ticket.isEscalatedToSuperAdmin = req.body.isEscalatedToSuperAdmin;
        if (req.body.rating) ticket.rating = req.body.rating;
        if (req.body.feedback) ticket.feedback = req.body.feedback;

        await ticket.save();

        // Send notification to ticket creator if someone else replied
        if (req.body.response && ticket.creator.toString() !== req.user.id.toString()) {
            try {
                await Notification.create({
                    recipient: ticket.creator,
                    sender: req.user.id,
                    type: 'support_update',
                    title: 'New Support Reply',
                    message: `You have a new reply on your ticket: "${ticket.title}"`,
                    link: '/support',
                    adminId: ticket.companyId
                });
            } catch (notifyErr) {
                console.error('[Support Notification Error]', notifyErr);
            }
        }

        const updated = await SupportTicket.findById(req.params.id).populate('creator').populate('companyId');

        // Emit socket event for real-time updates
        if (global.io) {
            const updatePayload = { 
                ticketId: ticket._id, 
                updatedTicket: updated.toObject() 
            };

            // 1. Emit to the specific ticket room (for those viewing the details)
            global.io.to(ticket._id.toString()).emit('new_support_response', updatePayload);
            
            // 2. Emit to the Company room (for list updates)
            global.io.to(ticket.companyId.toString()).emit('new_support_response', updatePayload);
            
            // 3. Emit to SuperAdmin room (if superadmin needs to see updates in their list)
            global.io.to('superadmin_room').emit('new_support_response', updatePayload);
        }

        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
};

// @desc    Get stats
exports.getTicketStats = async (req, res, next) => {
    try {
        const userRole = (req.user.role || '').toLowerCase();
        let matchStage = {};

        if (userRole === 'admin') {
            matchStage = { companyId: new mongoose.Types.ObjectId(req.user.id), creator: { $ne: new mongoose.Types.ObjectId(req.user.id) } };
        } else if (['superadmin', 'superadmin_staff', 'super_admin'].includes(userRole)) {
            matchStage = { $or: [{ isEscalatedToSuperAdmin: true }, { creatorModel: 'Admin' }] };
        } else {
            matchStage = { creator: new mongoose.Types.ObjectId(req.user.id) };
        }

        const stats = await SupportTicket.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalTickets: { $sum: 1 },
                    resolvedTickets: { $sum: { $cond: [{ $in: ["$status", ["Resolved", "Closed"]] }, 1, 0] } },
                    totalRatedTickets: { $sum: { $cond: [{ $ifNull: ["$rating", false] }, 1, 0] } },
                    sumRating: { $sum: "$rating" },
                    inTimeTickets: {
                        $sum: {
                            $cond: [
                                { $and: [{ $in: ["$status", ["Resolved", "Closed"]] }, { $ne: ["$resolvedAt", null] }, { $lte: [{ $subtract: ["$resolvedAt", "$createdAt"] }, 86400000] }] },
                                1, 0
                            ]
                        }
                    }
                }
            }
        ]);

        const data = stats[0] || { totalTickets: 0, resolvedTickets: 0, totalRatedTickets: 0, sumRating: 0, inTimeTickets: 0 };
        res.status(200).json({
            success: true,
            data: {
                avgFeedback: data.totalRatedTickets > 0 ? (data.sumRating / data.totalRatedTickets).toFixed(1) : 0,
                resolvedRate: data.totalTickets > 0 ? Math.round((data.resolvedTickets / data.totalTickets) * 100) : 0,
                inTimeResolution: data.resolvedTickets > 0 ? Math.round((data.inTimeTickets / data.resolvedTickets) * 100) : 0,
                totalTickets: data.totalTickets
            }
        });
    } catch (err) {
        next(err);
    }
};
