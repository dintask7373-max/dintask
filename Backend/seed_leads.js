const mongoose = require('mongoose');
const Lead = require('./src/models/Lead');
const SalesExecutive = require('./src/models/SalesExecutive');
require('dotenv').config();

const uri = 'mongodb+srv://dintask:dintask@cluster0.4yj1waj.mongodb.net/?appName=Cluster0';
const adminId = '698c217d82f7c34a56741a03'; // mayank

mongoose.connect(uri)
    .then(async () => {
        console.log('Connected to DB');

        // Find the executive for this admin
        const exec = await SalesExecutive.findOne({ adminId });
        if (!exec) {
            console.log('No executive found to assign leads to.');
            process.exit(1);
        }

        console.log('Found Executive:', exec.name, exec._id);

        // Create sample leads
        const leads = [];
        const statuses = ['New', 'Contacted', 'Meeting Done', 'Proposal Sent', 'Won', 'Lost'];

        for (let i = 0; i < 20; i++) {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const amount = status === 'Won' || status === 'Proposal Sent' ? Math.floor(Math.random() * 50000) + 10000 : 0;

            leads.push({
                name: `Sample Lead ${i + 1}`,
                email: `lead${i}@example.com`,
                phone: `98765432${i.toString().padStart(2, '0')}`,
                company: `Company ${i + 1}`,
                status: status,
                source: 'Website',
                priority: 'medium',
                amount: amount,
                owner: exec._id,
                adminId: adminId,
                createdAt: new Date()
            });
        }

        await Lead.insertMany(leads);
        console.log(`Seeded ${leads.length} leads successfully.`);

        process.exit(0);
    })
    .catch(err => {
        console.error('Validation Error:', err.message);
        if (err.errors) {
            Object.keys(err.errors).forEach(key => {
                console.error(`- ${key}: ${err.errors[key].message}`);
            });
        }
        process.exit(1);
    });
