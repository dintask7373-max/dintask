const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Manager = require('./src/models/Manager');
const Employee = require('./src/models/Employee');
const Task = require('./src/models/Task');

dotenv.config();

const taskTitles = [
    "Execute Weekly Inventory Audit",
    "Customer Satisfaction Review",
    "Update Client Database",
    "Quarterly Performance Briefing",
    "Streamline Dispatch Documentation",
    "Internal Communications Sync",
    "Product Knowledge Assessment",
    "Strategic Goal Calibration",
    "Operational Efficiency Survey",
    "End-of-Day Sales Reporting"
];

const seedManagerTasks = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const employees = await Employee.find({});
        console.log(`Found ${employees.length} employees. Starting task assignment...`);

        let tasksCreated = 0;

        for (const employee of employees) {
            let managerId = employee.managerId;

            // If employee has no managerId, find the first available manager under the same admin
            if (!managerId) {
                const altManager = await Manager.findOne({ adminId: employee.adminId });
                if (altManager) {
                    managerId = altManager._id;
                }
            }

            if (!managerId) {
                console.warn(`Warning: No manager found for employee ${employee.name} (${employee.email}). Skipping.`);
                continue;
            }

            const title = taskTitles[Math.floor(Math.random() * taskTitles.length)];

            await Task.create({
                title: `${title} - ${employee.name.split(' ')[0]}`,
                description: `This task is assigned by the manager to ensure complete operational synchronization. Please update the progress daily.`,
                assignedTo: [employee._id],
                assignedToModel: 'Employee',
                assignedBy: managerId,
                assignedByModel: 'Manager',
                adminId: employee.adminId,
                status: 'pending',
                priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
                deadline: new Date(Date.now() + (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000),
                labels: ['Operational', 'Manager-Assigned']
            });

            tasksCreated++;
        }

        console.log(`\n--- Seeding Complete ---`);
        console.log(`Total Tasks Created: ${tasksCreated}`);
        console.log(`------------------------\n`);

        await mongoose.connection.close();
        console.log('Done.');
    } catch (error) {
        console.error('Error seeding tasks:', error);
        process.exit(1);
    }
};

seedManagerTasks();
