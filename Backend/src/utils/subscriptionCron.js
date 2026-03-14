const cron = require('node-cron');
const Admin = require('../models/Admin');
const Notification = require('../models/Notification');
const sendEmail = require('./sendEmail');

const checkSubscriptionExpiry = async () => {
  console.log('Running subscription expiry check...');

  const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const frontendUrl = rawFrontendUrl.split(',')[0].trim();

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    const oneDayFromNow = new Date(today);
    oneDayFromNow.setDate(today.getDate() + 1);

    // Find admins expiring in 3 days
    const expiringIn3Days = await Admin.find({
      subscriptionExpiry: {
        $gte: threeDaysFromNow,
        $lt: new Date(threeDaysFromNow.getTime() + 24 * 60 * 60 * 1000)
      },
      subscriptionStatus: 'active'
    });

    for (const admin of expiringIn3Days) {
      const message = `Hi ${admin.name},\n\nYour subscription for ${admin.companyName} is expiring in 3 days. Please renew it to continue enjoying our services without interruption.\n\nRegards,\nTeam DinTask`;

      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #3b82f6; color: #ffffff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Subscription Reminder</h1>
          </div>
          <div style="padding: 30px;">
            <p>Hi <strong>${admin.name}</strong>,</p>
            <p>Your subscription for <strong>${admin.companyName}</strong> is expiring in <strong>3 days</strong>.</p>
            
            <p>Please renew it to continue enjoying our services without interruption. Your work and data are important to us!</p>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="${frontendUrl}/billing" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Renew Now</a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Best regards,<br>Team DinTask</p>
          </div>
        </div>
      `;

      // Email
      await sendEmail({
        email: admin.email,
        subject: 'Subscription Expiring Soon - DinTask',
        message,
        html
      });

      // In-app Notification
      try {
        await Notification.create({
          recipient: admin._id,
          sender: admin._id,
          adminId: admin._id,
          type: 'subscription_alert',
          title: 'Subscription Expiring Soon',
          message: 'Your plan will expire in 3 days. Renew now to avoid service interruption.',
          link: '/billing'
        });
      } catch (err) { console.error('Cron Notify Error:', err); }
    }

    // Find admins expiring in 1 day
    const expiringIn1Day = await Admin.find({
      subscriptionExpiry: {
        $gte: oneDayFromNow,
        $lt: new Date(oneDayFromNow.getTime() + 24 * 60 * 60 * 1000)
      },
      subscriptionStatus: 'active'
    });

    for (const admin of expiringIn1Day) {
      const message = `Hi ${admin.name},\n\nYour subscription for ${admin.companyName} is expiring tomorrow. Please renew it now to avoid any disruption.\n\nRegards,\nTeam DinTask`;

      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #f59e0b; color: #ffffff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Subscription Expiring Tomorrow</h1>
          </div>
          <div style="padding: 30px;">
            <p>Hi <strong>${admin.name}</strong>,</p>
            <p>Your subscription for <strong>${admin.companyName}</strong> is expiring <strong>tomorrow</strong>.</p>
            
            <p>Please renew it now to avoid any disruption to your workspace and team access.</p>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="${frontendUrl}/billing" style="display: inline-block; background-color: #f59e0b; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Renew Now</a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Best regards,<br>Team DinTask</p>
          </div>
        </div>
      `;

      // Email
      await sendEmail({
        email: admin.email,
        subject: 'Subscription Expiring Tomorrow - DinTask',
        message,
        html
      });

      // In-app Notification
      try {
        await Notification.create({
          recipient: admin._id,
          sender: admin._id,
          adminId: admin._id,
          type: 'subscription_alert',
          title: 'Subscription Expiring Tomorrow',
          message: 'Your plan will expire tomorrow. Final reminder to renew!',
          link: '/billing'
        });
      } catch (err) { console.error('Cron Notify Error:', err); }
    }

    // Find admins expiring in 2 days (New Requirement)
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(today.getDate() + 2);

    const expiringIn2Days = await Admin.find({
      subscriptionExpiry: {
        $gte: twoDaysFromNow,
        $lt: new Date(twoDaysFromNow.getTime() + 24 * 60 * 60 * 1000)
      },
      subscriptionStatus: 'active'
    });

    for (const admin of expiringIn2Days) {
      // Find Managers for this admin to notify them as well
      const Manager = require('../models/Manager');
      const managers = await Manager.find({ adminId: admin._id, status: 'active' }).select('_id');

      const recipients = [admin._id, ...managers.map(m => m._id)];

      for (const recipientId of recipients) {
        try {
          await Notification.create({
            recipient: recipientId,
            sender: admin._id,
            adminId: admin._id,
            type: 'general',
            title: 'Subscription Expiring in 2 Days',
            message: `Reminder: The subscription for ${admin.companyName} will expire in 2 days. Please ensure renewal to avoid service disruption.`,
            link: '/billing'
          });
        } catch (err) { console.error('2-Day Notification Error:', err); }
      }
    }

    // Find admins expiring today (expired)
    const expiringToday = await Admin.find({
      subscriptionExpiry: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      subscriptionStatus: 'active'
    });

    for (const admin of expiringToday) {
      admin.subscriptionStatus = 'expired';
      await admin.save();

      const message = `Hi ${admin.name},\n\nYour subscription for ${admin.companyName} has expired today. Your team access has been limited. Please renew your subscription to restore full access.\n\nRegards,\nTeam DinTask`;

      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #ef4444; color: #ffffff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Subscription Expired</h1>
          </div>
          <div style="padding: 30px;">
            <p>Hi <strong>${admin.name}</strong>,</p>
            <p>Your subscription for <strong>${admin.companyName}</strong> has <strong>expired today</strong>.</p>
            
            <p>Your team access has been limited. Please renew your subscription immediately to restore full access and resume operations.</p>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="${frontendUrl}/billing" style="display: inline-block; background-color: #ef4444; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Renew Subscription</a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Best regards,<br>Team DinTask</p>
          </div>
        </div>
      `;

      // Email
      await sendEmail({
        email: admin.email,
        subject: 'Subscription Expired - DinTask',
        message,
        html
      });

      // In-app Notification
      try {
        await Notification.create({
          recipient: admin._id,
          sender: admin._id,
          adminId: admin._id,
          type: 'subscription_alert',
          title: 'Subscription Expired!',
          message: 'Your workspace access is now limited. Please renew your plan immediately.',
          link: '/billing'
        });
      } catch (err) { console.error('Cron Notify Error:', err); }
    }

    console.log(`Cron job completed. Notified ${expiringIn3Days.length + expiringIn1Day.length + expiringToday.length} admins.`);
  } catch (err) {
    console.error('Error in subscription cron job:', err);
  }
};

// Run every day at midnight
const initSubscriptionCron = () => {
  cron.schedule('0 0 * * *', () => {
    checkSubscriptionExpiry();
  });

  // Also run once on startup for debugging/initial check
  // checkSubscriptionExpiry(); 
};

module.exports = initSubscriptionCron;
