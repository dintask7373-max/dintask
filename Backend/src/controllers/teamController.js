const Team = require('../models/Team');
const Manager = require('../models/Manager');
<<<<<<< HEAD
const ErrorResponse = require('../utils/errorResponse');

=======
const Employee = require('../models/Employee');
const ErrorResponse = require('../utils/errorResponse');

// Helper: Validate that all provided member IDs are Employees (not Sales Executives or any other role)
const validateEmployeeMembers = async (memberIds) => {
    if (!memberIds || memberIds.length === 0) return { valid: true, invalidIds: [] };

    const found = await Employee.find({ _id: { $in: memberIds } }).select('_id');
    const foundIds = found.map(e => e._id.toString());
    const invalidIds = memberIds.filter(id => !foundIds.includes(id.toString()));

    return {
        valid: invalidIds.length === 0,
        invalidIds
    };
};

>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
// @desc    Create a new team
// @route   POST /api/v1/teams
// @access  Private (Manager)
exports.createTeam = async (req, res, next) => {
    try {
        const { name, members, description } = req.body;

        // Get manager's adminId
        const manager = await Manager.findById(req.user.id);
        if (!manager) {
            return next(new ErrorResponse('Manager record not found', 404));
        }

<<<<<<< HEAD
=======
        // --- VALIDATION: Only Employees can be team members ---
        if (members && members.length > 0) {
            const { valid, invalidIds } = await validateEmployeeMembers(members);
            if (!valid) {
                return next(new ErrorResponse(
                    `Only Employees can be added to teams. ${invalidIds.length} invalid member(s) found (Sales Executives or non-employees are not allowed).`,
                    400
                ));
            }
        }

>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
        const team = await Team.create({
            name,
            members,
            description,
            managerId: req.user.id,
            adminId: manager.adminId
        });

<<<<<<< HEAD
=======
        // -- NOTIFICATION: New Team Created (all members are employees) --
        if (members && members.length > 0) {
            const Notification = require('../models/Notification');
            const notifications = members.map(memberId => ({
                recipient: memberId,
                sender: req.user.id,
                adminId: manager.adminId,
                type: 'general',
                title: 'Assigned to New Team',
                message: `You have been added to the team: "${name}" by Manager ${req.user.name}.`,
                link: '/employee'
            }));
            await Notification.insertMany(notifications);
        }

>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
        res.status(201).json({
            success: true,
            data: team
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all teams for logged in manager
// @route   GET /api/v1/teams
// @access  Private (Manager)
exports.getMyTeams = async (req, res, next) => {
    try {
        const teams = await Team.find({ managerId: req.user.id }).populate('members', 'name email profileImage role');

        res.status(200).json({
            success: true,
            count: teams.length,
            data: teams
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update a team
// @route   PUT /api/v1/teams/:id
// @access  Private (Manager)
exports.updateTeam = async (req, res, next) => {
    try {
        let team = await Team.findById(req.params.id);

        if (!team) {
            return next(new ErrorResponse('Team not found', 404));
        }

        // Ensure manager owns the team
        if (team.managerId.toString() !== req.user.id) {
            return next(new ErrorResponse('Not authorized to update this team', 403));
        }

<<<<<<< HEAD
=======
        // --- VALIDATION: Only Employees can be team members ---
        if (req.body.members && req.body.members.length > 0) {
            const { valid, invalidIds } = await validateEmployeeMembers(req.body.members);
            if (!valid) {
                return next(new ErrorResponse(
                    `Only Employees can be added to teams. ${invalidIds.length} invalid member(s) found (Sales Executives or non-employees are not allowed).`,
                    400
                ));
            }
        }

        const oldMembers = team.members.map(m => m.toString());

>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
        team = await Team.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('members', 'name email profileImage role');

<<<<<<< HEAD
=======
        // -- NOTIFICATION: New Members Added (all members are employees) --
        if (req.body.members) {
            const newMemberIds = req.body.members.filter(id => !oldMembers.includes(id.toString()));
            if (newMemberIds.length > 0) {
                const Notification = require('../models/Notification');
                const manager = await Manager.findById(req.user.id);

                const notifications = newMemberIds.map(memberId => ({
                    recipient: memberId,
                    sender: req.user.id,
                    adminId: manager.adminId,
                    type: 'general',
                    title: 'Joined a Team',
                    message: `You have been added to the team: "${team.name}" by Manager ${req.user.name}.`,
                    link: '/employee'
                }));
                await Notification.insertMany(notifications);
            }
        }

>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
        res.status(200).json({
            success: true,
            data: team
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a team
// @route   DELETE /api/v1/teams/:id
// @access  Private (Manager)
exports.deleteTeam = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return next(new ErrorResponse('Team not found', 404));
        }

        // Ensure manager owns the team
<<<<<<< HEAD
        if (team.managerId.toString() !== req.user.id) {
            return next(new ErrorResponse('Not authorized to delete this team', 403));
        }

        await Team.findByIdAndDelete(req.params.id);

=======
        const memberIds = team.members.map(m => m._id || m);
        const teamName = team.name;
        const adminId = team.adminId;

        await Team.findByIdAndDelete(req.params.id);

        // -- NOTIFICATION: Team Disbanded (all members are employees) --
        if (memberIds.length > 0) {
            const Notification = require('../models/Notification');
            const notifications = memberIds.map(memberId => ({
                recipient: memberId,
                sender: req.user.id,
                adminId: adminId,
                type: 'general',
                title: 'Team Disbanded',
                message: `The team "${teamName}" you were part of has been disbanded by the Manager.`,
                link: '/employee'
            }));
            await Notification.insertMany(notifications);
        }

>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};
