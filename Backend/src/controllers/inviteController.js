const sendEmail = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');

const checkUserLimit = require('../utils/checkUserLimit');

// @desc    Send invitation to team member
// @route   POST /api/v1/invite
// @access  Private (Admin)
exports.sendInvite = async (req, res, next) => {
    try {
        const { email, role } = req.body;
        const adminId = req.user.id;
        const companyName = req.user.companyName || 'Our Company';

        if (!email || !role) {
            return next(new ErrorResponse('Please provide email and role', 400));
        }

        // Check user limit before sending invite
        const limitCheck = await checkUserLimit(adminId);
        if (!limitCheck.allowed) {
            return next(new ErrorResponse(limitCheck.error, 403));
        }

        // Determine frontend URL based on environment (should be in env vars ideally)
        // Assuming localhost:5173 for dev, need to handle prod later
        const origin = req.headers.origin || 'http://localhost:5173';

        // Construct registration URL
        // e.g. http://localhost:5173/employee/register?adminId=123&email=test@a.com
        const inviteUrl = `${origin}/${role}/register?adminId=${adminId}&email=${email}`;

        const message = `
            You have been invited to join ${companyName} on DinTask.
            
            Role: ${role.charAt(0).toUpperCase() + role.slice(1)}
            
            Please click the following link to create your account and join the workspace:
            ${inviteUrl}
            
            If you were not expecting this invitation, please ignore this email.
        `;

        try {
            await sendEmail({
                email,
                subject: `Invitation to join ${companyName} on DinTask`,
                message
            });

            res.status(200).json({
                success: true,
                data: 'Email sent'
            });
        } catch (err) {
            console.error(err);
            return next(new ErrorResponse('Email could not be sent', 500));
        }

    } catch (err) {
        next(err);
    }
};
