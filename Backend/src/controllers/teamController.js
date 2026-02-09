const Team = require('../models/Team');
const Manager = require('../models/Manager');
const ErrorResponse = require('../utils/errorResponse');

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

        const team = await Team.create({
            name,
            members,
            description,
            managerId: req.user.id,
            adminId: manager.adminId
        });

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

        team = await Team.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('members', 'name email profileImage role');

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
        if (team.managerId.toString() !== req.user.id) {
            return next(new ErrorResponse('Not authorized to delete this team', 403));
        }

        await Team.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};
