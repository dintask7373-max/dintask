const cron = require('node-cron');
const Task = require('../models/Task');
const FollowUp = require('../models/FollowUp');
const Notification = require('../models/Notification');

const sendDeadlineReminders = async () => {
    console.log('Running automated deadline reminders check...');

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const twoDaysFromNow = new Date(today);
        twoDaysFromNow.setDate(today.getDate() + 2);

        const twoDaysRangeStart = new Date(twoDaysFromNow);
        const twoDaysRangeEnd = new Date(twoDaysFromNow);
        twoDaysRangeEnd.setHours(23, 59, 59, 999);

        // 1. Task Reminders
        const tasksToRemind = await Task.find({
            deadline: {
                $gte: twoDaysRangeStart,
                $lte: twoDaysRangeEnd
            },
            status: { $nin: ['completed', 'overdue'] },
            reminderSent: { $ne: true }
        });

        console.log(`Found ${tasksToRemind.length} tasks due in 2 days.`);

        for (const task of tasksToRemind) {
            const notificationPromises = task.assignedTo.map(userId =>
                Notification.create({
                    recipient: userId,
                    sender: task.assignedBy, // Could be Admin or Manager
                    adminId: task.adminId,
                    type: 'task_assigned', // Reusing existing type for simplicity or create 'task_reminder'
                    category: 'task',
                    title: 'Upcoming Task Deadline',
                    message: `Reminder: The task "${task.title}" is due in 2 days.`,
                    link: task.assignedToModel === 'Manager' ? '/manager/my-tasks' : `/employee/tasks/${task._id}`
                })
            );

            await Promise.all(notificationPromises);
            task.reminderSent = true;
            await task.save();
        }

        // 2. Sales Follow-up Reminders
        const followUpsToRemind = await FollowUp.find({
            scheduledAt: {
                $gte: twoDaysRangeStart,
                $lte: twoDaysRangeEnd
            },
            status: 'Scheduled',
            reminderSent: { $ne: true }
        });

        console.log(`Found ${followUpsToRemind.length} sales follow-ups due in 2 days.`);

        for (const followUp of followUpsToRemind) {
            await Notification.create({
                recipient: followUp.salesRepId,
                sender: followUp.adminId, // Typically Admin or System
                adminId: followUp.adminId,
                type: 'general',
                category: 'task',
                title: 'Upcoming Sales Follow-up',
                message: `Reminder: You have a ${followUp.type} follow-up scheduled for 2 days from now.`,
                link: '/sales/follow-ups'
            });

            followUp.reminderSent = true;
            await followUp.save();
        }

        console.log('Automated reminders check completed.');
    } catch (err) {
        console.error('Error in deadline reminders cron job:', err);
    }
};

const initReminderCron = () => {
    // Run every day at 00:01 (1 minute past midnight) to avoid clash with subscription cron
    cron.schedule('1 0 * * *', () => {
        sendDeadlineReminders();
    });

    // For debugging/initial run when server starts (Optional)
    // sendDeadlineReminders();
};

module.exports = initReminderCron;
