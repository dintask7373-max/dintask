const mongoose = require('mongoose');
const Manager = require('./src/models/Manager');

const diag = async () => {
    try {
        const mongoUri = 'mongodb+srv://dintask:dintask@cluster0.4yj1waj.mongodb.net/?appName=Cluster0';
        await mongoose.connect(mongoUri);

        const allManagers = await Manager.find({});
        console.log(`Found ${allManagers.length} managers`);

        allManagers.forEach(m => {
            console.log(`MGR:${m.email}|STATUS:${m.status}|ROLE:${m.role}|ADMIN:${m.adminId}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

diag();
