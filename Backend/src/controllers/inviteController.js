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

        const message = `You have been invited to join ${companyName} on DinTask as a ${role.charAt(0).toUpperCase() + role.slice(1)}.\n\nPlease click the following link to create your account and join the workspace:\n${inviteUrl}\n\nIf you were not expecting this invitation, please ignore this email.`;

        const html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #3b82f6; color: #ffffff; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Invitation to Join</h1>
            </div>
            <div style="padding: 30px;">
              <p>Hello,</p>
              <p>You have been invited to join <strong>${companyName}</strong> on <strong>DinTask</strong> as a ${role.charAt(0).toUpperCase() + role.slice(1)}.</p>
              
              <p>Click the button below to set up your account and join the workspace:</p>
              
              <div style="margin: 30px 0; text-align: center;">
                <a href="${inviteUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Join Workspace</a>
              </div>

              <p style="font-size: 14px; color: #6b7280;">
                If you're having trouble clicking the button, copy and paste the URL below into your web browser:<br>
                <a href="${inviteUrl}" style="color: #3b82f6; word-break: break-all;">${inviteUrl}</a>
              </p>

              <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">If you were not expecting this, please ignore this email.</p>
            </div>
            <div style="background-color: #f3f4f6; color: #6b7280; padding: 20px; text-align: center; font-size: 12px;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} DinTask Team. All rights reserved.</p>
            </div>
          </div>
        `;

        try {
            await sendEmail({
                email,
                subject: `Invitation to join ${companyName} on DinTask`,
                message,
                html
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
