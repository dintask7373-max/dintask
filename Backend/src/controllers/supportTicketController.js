const SupportTicket = require('../models/SupportTicket');
const ErrorResponse = require('../utils/errorResponse');
const Admin = require('../models/Admin');

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

        // Determine hierarchy based on role
        if (req.user.role === 'admin') {
            // Admin creates ticket -> Goes to Super Admin
            companyId = req.user.id;
            isEscalatedToSuperAdmin = true;
        } else {
            // Employee/Manager/Sales creates ticket -> Goes to Admin
            // Admin ID comes from the user's adminId field
            companyId = req.user.adminId;
            isEscalatedToSuperAdmin = false;
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
            creatorModel: req.user.role === 'sales' ? 'SalesExecutive' : req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1), // Capitalize
            companyId,
            isEscalatedToSuperAdmin
        });

        res.status(201).json({
            success: true,
            data: ticket
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all tickets (Role based visibility)
// @route   GET /api/v1/support-tickets
// @access  Private
exports.getTickets = async (req, res, next) => {
    try {
        let query;

        if (req.user.role === 'superadmin') {
            // Super Admin sees ONLY Escalated tickets (from Admins)
            query = SupportTicket.find({ isEscalatedToSuperAdmin: true })
                .populate('creator', 'name email companyName')
                .populate('companyId', 'companyName');
        } else if (req.user.role === 'admin') {
            // Check scope from query
            if (req.query.scope === 'my') {
                // Admin wants to see ONLY tickets they created (e.g. "My Support Tickets")
                query = SupportTicket.find({ creator: req.user.id })
                    .populate('creator', 'name email role');
            } else {
                // Admin sees ALL tickets for their company (Team Support Requests)
                // Exclude their own if needed, or allow all. 
                // Usually "Team Requests" implies tickets from employees.
                // Let's filter for companyId but NOT creator if scope is 'team', or just all.
                query = SupportTicket.find({ companyId: req.user.id })
                    .populate('creator', 'name email role');
            }
        } else {
            // Employees/Managers see ONLY their own tickets
            query = SupportTicket.find({ creator: req.user.id });
        }

        const tickets = await query.sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tickets.length,
            data: tickets
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single ticket
// @route   GET /api/v1/support-tickets/:id
// @access  Private
exports.getTicket = async (req, res, next) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id)
            .populate('creator', 'name email role')
            .populate('companyId', 'companyName');

        if (!ticket) {
            return next(new ErrorResponse('Ticket not found', 404));
        }

        // Access Control
        if (req.user.role !== 'superadmin') {
            // If not super admin, must belong to same company
            if (ticket.companyId.toString() !== (req.user.role === 'admin' ? req.user.id : req.user.adminId).toString()) {
                return next(new ErrorResponse('Not authorized to view this ticket', 401));
            }
        }

        res.status(200).json({
            success: true,
            data: ticket
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update ticket (Status/Response)
// @route   PUT /api/v1/support-tickets/:id
// @access  Private
exports.updateTicket = async (req, res, next) => {
    try {
        let ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return next(new ErrorResponse('Ticket not found', 404));
        }

        // Add Response Logic
        if (req.body.response) {
            ticket.responses.push({
                responder: req.user.id,
                responderModel: req.user.role === 'superadmin' ? 'SuperAdmin' : 'Admin', // Usually Admins respond
                message: req.body.response
            });
        }

        // Update Status/Priority
        if (req.body.status) {
            ticket.status = req.body.status;
            if (['Resolved', 'Closed'].includes(req.body.status) && !ticket.resolvedAt) {
                ticket.resolvedAt = Date.now();
            } else if (['Open', 'Pending'].includes(req.body.status)) {
                ticket.resolvedAt = undefined; // Clear if re-opened
            }
        }
        if (req.body.priority) ticket.priority = req.body.priority;
        if (req.body.isEscalatedToSuperAdmin !== undefined) ticket.isEscalatedToSuperAdmin = req.body.isEscalatedToSuperAdmin;

        await ticket.save();

        res.status(200).json({
            success: true,
            data: ticket
        });
    } catch (err) {
        next(err);
    }
};
// @desc    Get Ticket Stats
// @route   GET /api/v1/support-tickets/stats
// @access  Private
exports.getTicketStats = async (req, res, next) => {
    try {
        let matchStage = {};
        const mongoose = require('mongoose');

        if (req.user.role === 'admin') {
            // Stats for tickets assigned TO this admin (created by potential sub-users)
            // Convert string ID to ObjectId for aggregation if needed, or rely on mongoose casting
            matchStage = {
                companyId: new mongoose.Types.ObjectId(req.user.id),
                creator: { $ne: new mongoose.Types.ObjectId(req.user.id) } // Exclude tickets raised BY admin
            };
        } else if (req.user.role === 'superadmin') {
            matchStage = { isEscalatedToSuperAdmin: true };
        } else {
            // For employees, maybe show their own ticket stats? Or just return zeros.
            matchStage = { creator: new mongoose.Types.ObjectId(req.user.id) };
        }

        const stats = await SupportTicket.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalTickets: { $sum: 1 },
                    resolvedTickets: {
                        $sum: { $cond: [{ $in: ["$status", ["Resolved", "Closed"]] }, 1, 0] }
                    },
                    totalRatedTickets: {
                        $sum: { $cond: [{ $ifNull: ["$rating", false] }, 1, 0] }
                    },
                    sumRating: { $sum: "$rating" },
                    inTimeTickets: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $in: ["$status", ["Resolved", "Closed"]] }, // Must be resolved
                                        { $ne: ["$resolvedAt", null] }, // Must have resolved date
                                        {
                                            $lte: [
                                                { $subtract: ["$resolvedAt", "$createdAt"] },
                                                24 * 60 * 60 * 1000 // 24 Hours in ms
                                            ]
                                        }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const data = stats[0] || { totalTickets: 0, resolvedTickets: 0, totalRatedTickets: 0, sumRating: 0, inTimeTickets: 0 };

        // 1. Avg Feedback
        const avgFeedback = data.totalRatedTickets > 0
            ? (data.sumRating / data.totalRatedTickets).toFixed(1)
            : 0;

        // 2. Resolution Rate
        const resolvedRate = data.totalTickets > 0
            ? Math.round((data.resolvedTickets / data.totalTickets) * 100)
            : 0;

        // 3. In Time Resolution (Based on Resolved Tickets only)
        const inTimeResolution = data.resolvedTickets > 0
            ? Math.round((data.inTimeTickets / data.resolvedTickets) * 100)
            : 0; // Or 100 if no resolved tickets? Usually 0 is safer.

        res.status(200).json({
            success: true,
            data: {
                avgFeedback,
                resolvedRate,
                inTimeResolution,
                totalTickets: data.totalTickets
            }
        });
    } catch (err) {
        next(err);
    }
};
