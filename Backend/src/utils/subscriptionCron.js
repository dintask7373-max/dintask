const cron = require('node-cron');
const Admin = require('../models/Admin');
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
      await sendEmail({
        email: admin.email,
        subject: 'Subscription Expiring Soon - DinTask',
        message: `Hi ${admin.name},\n\nYour subscription for ${admin.companyName} is expiring in 3 days. Please renew it to continue enjoying our services without interruption.\n\nRegards,\nTeam DinTask`
      });
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
      await sendEmail({
        email: admin.email,
        subject: 'Subscription Expiring Tomorrow - DinTask',
        message: `Hi ${admin.name},\n\nYour subscription for ${admin.companyName} is expiring tomorrow. Please renew it now to avoid any disruption.\n\nRegards,\nTeam DinTask`
      });
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

      await sendEmail({
        email: admin.email,
        subject: 'Subscription Expired - DinTask',
        message: `Hi ${admin.name},\n\nYour subscription for ${admin.companyName} has expired today. Your team access has been limited. Please renew your subscription to restore full access.\n\nRegards,\nTeam DinTask`
      });
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
