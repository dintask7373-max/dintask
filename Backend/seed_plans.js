const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Plan = require('./src/models/Plan');
const connectDB = require('./src/config/db');

dotenv.config();

const seedPlans = async () => {
    try {
        await connectDB();

        const freePlan = {
            name: 'Free',
            price: 0,
            userLimit: 10, // Enforcing 10 users limit (Manager + Sales + Employee)
            duration: 36500, // 100 years (effectively forever)
            description: 'Free plan for small teams',
            features: ['Basic Reports', 'Up to 10 Users', 'Email Support'],
            isActive: true
        };

        // Check if exists
        let plan = await Plan.findOne({ name: 'Free' });

        if (plan) {
            plan.userLimit = 10;
            plan.features = freePlan.features;
            await plan.save();
            console.log('Free Plan Updated with 10 user limit');
        } else {
            await Plan.create(freePlan);
            console.log('Free Plan Created');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedPlans();
