const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');

const diag = async () => {
    try {
        const mongoUri = 'mongodb+srv://dintask:dintask@cluster0.4yj1waj.mongodb.net/?appName=Cluster0';
        await mongoose.connect(mongoUri);

        const allAdmins = await Admin.find({});
        console.log(`TOTAL_ADMINS_FOUND:${allAdmins.length}`);

        allAdmins.forEach(a => {
            console.log(`---ADMIN_START---`);
            console.log(`NAME:${a.name}`);
            console.log(`EMAIL:${a.email}`);
            console.log(`ID:${a._id}`);
            console.log(`---ADMIN_END---`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

diag();
