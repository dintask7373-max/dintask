const cron = require('node-cron');
const Task = require('../models/Task');
const FollowUp = require('../models/FollowUp');
const Notification = require('../models/Notification');

const REMINDER_STAGES = [
    { label: '2_days', hours: 48 },
    { label: '1_day', hours: 24 },
    { label: 'same_day', hours: 12 }, // Used to trigger if on same day
    { label: '1_hour', minutes: 60 },
    { label: '5_mins', minutes: 5 }
];

const checkAndSendReminders = async () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    try {
        console.log(`[Reminder Heartbeat] Cron active at ${now.toLocaleString()}`);

        // 1. Process Tasks
        const tasks = await Task.find({
            status: { $nin: ['completed', 'overdue'] },
            deadline: { $gt: oneHourAgo }
        });

        if (tasks.length > 0) {
            console.log(`[Reminder] Processing ${tasks.length} tasks...`);
            await Promise.all(tasks.map(task => processItemReminders(task, 'Task').catch(e => console.error(`Error in task ${task._id}:`, e))));
        }

        // 2. Process Follow-ups
        const followUps = await FollowUp.find({
            status: 'Scheduled',
            scheduledAt: { $gt: oneHourAgo }
        });

        if (followUps.length > 0) {
            console.log(`[Reminder] Processing ${followUps.length} follow-ups...`);
            await Promise.all(followUps.map(fu => processItemReminders(fu, 'FollowUp').catch(e => console.error(`Error in follow-up ${fu._id}:`, e))));
        }

    } catch (err) {
        console.error('Error in reminders check:', err);
    }
};

const processItemReminders = async (item, modelName) => {
    const now = new Date();
    const deadline = modelName === 'Task' ? item.deadline : item.scheduledAt;
    const diffMs = deadline - now;
    const diffMins = diffMs / (1000 * 60);

    // Calculate Stage Eligibility
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDay = new Date(deadline);
    deadlineDay.setHours(0, 0, 0, 0);
    const daysDiff = Math.round((deadlineDay - today) / (1000 * 60 * 60 * 24));

    const eligibleStages = [];

    // 1. Check Day-based stages
    if (daysDiff === 2) eligibleStages.push('2_days');
    if (daysDiff === 1) eligibleStages.push('1_day');
    if (daysDiff <= 0) eligibleStages.push('same_day'); // Includes passed items for today

    // 2. Check Minute-based stages (Higher precision)
    if (diffMins <= 60 && diffMins > 0) eligibleStages.push('1_hour');
    if (diffMins <= 5 && diffMins > 0) eligibleStages.push('5_mins');

    // 3. Trigger any that haven't been sent
    let modified = false;
    for (const stage of eligibleStages) {
        if (!item.sentReminders.includes(stage)) {
            // Check if we should really send same_day if it's already very close to deadline
            // (e.g. if item created at 17:33, send both same_day and 1_hour immediately)
            console.log(`[Reminder Stage Match] ${modelName} ${item._id} matches stage ${stage} (DiffMins: ${diffMins.toFixed(1)}, DaysDiff: ${daysDiff})`);

            await triggerNotification(item, modelName, stage);
            item.sentReminders.push(stage);
            modified = true;
        }
    }

    if (modified) {
        item.markModified('sentReminders');
        await item.save();
    }
};

const triggerNotification = async (item, modelName, stage) => {
    try {
        const recipients = modelName === 'Task' ? item.assignedTo : [item.salesRepId];
        const sender = modelName === 'Task' ? item.assignedBy : item.adminId;
        const urgency = (stage === '5_mins' || stage === '1_hour') ? 'URGENT: ' : '';
        const title = `${urgency}Reminder for ${modelName}`;

        const timeText = stage.replace('_', ' ');
        const message = `Reminder (${timeText}): "${item.title || (modelName === 'FollowUp' ? item.type + ' Follow-up' : '')}" is scheduled for ${new Date(modelName === 'Task' ? item.deadline : item.scheduledAt).toLocaleString()}.`;

        const link = modelName === 'Task'
            ? (item.assignedToModel === 'Manager' ? '/manager/my-tasks' : `/employee/tasks/${item._id}`)
            : '/sales/deals';

        const notifPromises = recipients.map(recipient =>
            Notification.create({
                recipient,
                sender,
                adminId: item.adminId,
                type: modelName === 'Task' ? 'task_assigned' : 'general',
                category: 'task',
                title,
                message,
                link
            })
        );

        await Promise.all(notifPromises);
        console.log(`[Reminder] Successfully sent ${stage} reminder for ${modelName} ID: ${item._id}`);
    } catch (e) {
        console.error(`[Reminder Error] Failed to trigger notification for ${modelName} ${item._id}:`, e.message);
    }
};

const initReminderCron = () => {
    console.log('[Reminder Cron] Initializing multi-stage reminder system...');
    // Run every minute
    cron.schedule('* * * * *', () => {
        checkAndSendReminders();
    });
};

module.exports = initReminderCron;
