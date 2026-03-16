const mongoose = require('mongoose');
const FollowUp = require('./src/models/FollowUp');

console.log('FollowUp Status Enum:', FollowUp.schema.path('status').enumValues);
process.exit(0);
