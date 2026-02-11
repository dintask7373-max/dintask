const mongoose = require('mongoose');
const Manager = require('./src/models/Manager');
const Admin = require('./src/models/Admin');
const dotenv = require('dotenv');

dotenv.config();

const diag = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const admins = await Admin.find({});
        console.log(`Found ${admins.length} admins`);

        const allManagers = await Manager.find({});
        console.log(`Found ${allManagers.length} total managers in DB`);

        allManagers.forEach(m => {
            console.log(`Manager: ${m.name}, Email: ${m.email}, Status: ${m.status}, Role: ${m.role}, AdminId: ${m.adminId}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

diag();
