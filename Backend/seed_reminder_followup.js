const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SalesExecutive = require('./src/models/SalesExecutive');
const Lead = require('./src/models/Lead');
const FollowUp = require('./src/models/FollowUp');

dotenv.config();

const seedReminderFollowUp = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'sales_admin10@example.com';
        const salesRep = await SalesExecutive.findOne({ email });

        if (!salesRep) {
            console.error(`Error: Sales Executive with email ${email} not found.`);
            process.exit(1);
        }

        console.log(`Found Sales Executive: ${salesRep.name} (ID: ${salesRep._id})`);

        // Find or create test lead
        let lead = await Lead.findOne({ salesRepId: salesRep._id });
        if (!lead) {
            lead = await Lead.create({
                name: "Test Multi-Stage Lead",
                email: "multi.stage@example.com",
                phoneNumber: "9876543210",
                status: "Contacted",
                salesRepId: salesRep._id,
                adminId: salesRep.adminId,
                source: "Cold Call"
            });
        }

        console.log(`Using Lead: ${lead.name} (ID: ${lead._id})`);

        // Target: Today at 16:10 (4:10 PM) - This is in the past
        const scheduledAt = new Date();
        scheduledAt.setHours(16, 10, 0, 0);

        console.log(`Targeting Time: ${scheduledAt.toLocaleString()}`);

        const followUp = await FollowUp.create({
            leadId: lead._id,
            salesRepId: salesRep._id,
            adminId: salesRep.adminId,
            type: 'Call',
            scheduledAt: scheduledAt,
            notes: 'PAST REMINDER TEST: Target 16:10. Should trigger "same_day" reminder immediately.',
            status: 'Scheduled',
            sentReminders: []
        });

        console.log(`\n--- Follow-up Created ---`);
        console.log(`ID: ${followUp._id}`);
        console.log(`Scheduled for: ${followUp.scheduledAt.toLocaleString()}`);
        console.log(`Current Time: ${new Date().toLocaleString()}`);
        console.log(`-------------------------\n`);

        await mongoose.connection.close();
        console.log('Done.');
    } catch (error) {
        console.error('Error seeding follow-up:', error);
        process.exit(1);
    }
};

seedReminderFollowUp();
