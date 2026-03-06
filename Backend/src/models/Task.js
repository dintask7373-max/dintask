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
    ref: 'Project'
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'assignedToModel'
  }],
  assignedToModel: {
    type: String,
    enum: ['Employee', 'Manager'],
    default: 'Employee'
  },
  subTasks: [{
    user: { type: mongoose.Schema.Types.ObjectId, refPath: 'subTasks.userModel' },
    userModel: { type: String, enum: ['Employee', 'Manager'], default: 'Employee' },
    status: { type: String, enum: ['pending', 'in_progress', 'completed', 'review'], default: 'pending' },
    progress: { type: Number, default: 0 }
  }],
  statusNotes: { type: String },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'assignedByModel'
  },
  assignedByModel: {
    type: String,
    enum: ['Admin', 'Manager'],
    default: 'Manager'
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
  recurrence: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'none'],
      default: 'none'
    },
    interval: {
      type: Number,
      default: 1
    },
    endDate: Date,
    nextRun: Date
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
  },
  overdueNotified: {
    type: Boolean,
    default: false
  },
  sentReminders: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
