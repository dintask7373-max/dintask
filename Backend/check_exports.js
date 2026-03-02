const controller = require('./src/controllers/partnerController');
console.log('Available Exports:', Object.keys(controller));
console.log('getPartnerCommissions:', typeof controller.getPartnerCommissions);
process.exit(0);
