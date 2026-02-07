const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  mobile: {
    type: String,
    required: [true, 'Please add a mobile number']
  },
  company: {
    type: String
  },
  source: {
    type: String, // 'Website', 'Call', 'Referral', 'Manual'
    default: 'Manual'
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Meeting Done', 'Proposal Sent', 'Won', 'Lost'],
    default: 'New'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesExecutive',
    required: false
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  amount: {
    type: Number,
    default: 0
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  deadline: {
    type: Date
  },
  notes: {
    type: String
  },
  // Flow fields
  approvalStatus: {
    type: String,
    enum: ['none', 'pending_project', 'approved_project', 'rejected'],
    default: 'none'
  },
  projectRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Lead', LeadSchema);
