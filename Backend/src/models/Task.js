const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a task title']
  },
  description: {
    type: String
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Tasks must be linked to a Mission Project']
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  subTasks: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    progress: { type: Number, default: 0 }
  }],
  statusNotes: { type: String },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manager'
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'review', 'overdue'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  deadline: {
    type: Date
  },
  progress: {
    type: Number,
    default: 0
  },
  labels: [String],
  attachments: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  submissionNote: {
    type: String
  },
  activityLog: [{
    user: { type: mongoose.Schema.Types.ObjectId, refPath: 'activityLog.userModel' },
    userModel: { type: String, enum: ['Admin', 'Manager', 'Employee', 'SalesExecutive'] },
    action: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
