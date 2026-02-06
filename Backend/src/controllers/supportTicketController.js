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
            // Admin sees ALL tickets for their company (Own + Employees)
            // But usually, Admin dashboard for "Support" shows Employee tickets
            // And "My Tickets" shows tickets they sent to Super Admin. 
            // For now, let's return ALL company tickets. Frontend can filter.
            query = SupportTicket.find({ companyId: req.user.id })
                .populate('creator', 'name email role');
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
        if (req.body.status) ticket.status = req.body.status;
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
