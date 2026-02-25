const cron = require('node-cron');
const Admin = require('../models/Admin');
<<<<<<< HEAD
=======
const Notification = require('../models/Notification');
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
const sendEmail = require('./sendEmail');

const checkSubscriptionExpiry = async () => {
  console.log('Running subscription expiry check...');

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
<<<<<<< HEAD
=======
      // Email
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
      await sendEmail({
        email: admin.email,
        subject: 'Subscription Expiring Soon - DinTask',
        message: `Hi ${admin.name},\n\nYour subscription for ${admin.companyName} is expiring in 3 days. Please renew it to continue enjoying our services without interruption.\n\nRegards,\nTeam DinTask`
      });
<<<<<<< HEAD
=======

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
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
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
<<<<<<< HEAD
=======
      // Email
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
      await sendEmail({
        email: admin.email,
        subject: 'Subscription Expiring Tomorrow - DinTask',
        message: `Hi ${admin.name},\n\nYour subscription for ${admin.companyName} is expiring tomorrow. Please renew it now to avoid any disruption.\n\nRegards,\nTeam DinTask`
      });
<<<<<<< HEAD
=======

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
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
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

<<<<<<< HEAD
=======
      // Email
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
      await sendEmail({
        email: admin.email,
        subject: 'Subscription Expired - DinTask',
        message: `Hi ${admin.name},\n\nYour subscription for ${admin.companyName} has expired today. Your team access has been limited. Please renew your subscription to restore full access.\n\nRegards,\nTeam DinTask`
      });
<<<<<<< HEAD
=======

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
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
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
