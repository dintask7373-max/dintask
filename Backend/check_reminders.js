const mongoose = require('mongoose');
const dotenv = require('dotenv');
const FollowUp = require('./src/models/FollowUp');

dotenv.config();

const checkFollowUpState = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const followUps = await FollowUp.find({ status: 'Scheduled' }).sort({ createdAt: -1 }).limit(5);

        console.log('\n--- Scheduled Follow-ups ---');
        followUps.forEach(f => {
            console.log(`ID: ${f._id}`);
            console.log(`Type: ${f.type}`);
            console.log(`Scheduled: ${f.scheduledAt.toLocaleString()}`);
            console.log(`Sent Reminders: ${JSON.stringify(f.sentReminders)}`);
            console.log(`Created At: ${f.createdAt.toLocaleString()}`);
            console.log('---');
        });

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkFollowUpState();
