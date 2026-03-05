const mongoose = require('mongoose');

const checkTickets = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/dintask');
        console.log('Connected to MongoDB');

        const SupportTicket = mongoose.model('SupportTicket', new mongoose.Schema({}, { strict: false }));
        const Admin = mongoose.model('Admin', new mongoose.Schema({}, { strict: false }));

        const tickets = await SupportTicket.find({});
        console.log(`Total Tickets Found: ${tickets.length}`);

        for (const ticket of tickets) {
            const admin = await Admin.findById(ticket.companyId);
            console.log('---');
            console.log(`ID: ${ticket.ticketId}`);
            console.log(`Title: ${ticket.title}`);
            console.log(`Creator Model: ${ticket.creatorModel}`);
            console.log(`Is Escalated: ${ticket.isEscalatedToSuperAdmin}`);
            console.log(`Assigned Partner ID: ${ticket.assignedPartnerId}`);
            console.log(`Company Admin: ${admin ? admin.name : 'Unknown'}`);
            console.log(`Company Partner ID: ${admin ? admin.partnerId : 'No Admin Found'}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkTickets();
