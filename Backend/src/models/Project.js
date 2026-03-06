const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a project name']
  },
  description: {
    type: String
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  clientCompany: {
    type: String
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manager',
    required: true
  },
  salesRep: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesExecutive'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'on_hold', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  deadline: {
    type: Date
  },
  budget: {
    type: Number
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
