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
<<<<<<< HEAD
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
=======
    status: { type: String, enum: ['pending', 'in_progress', 'completed', 'review'], default: 'pending' },
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
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
<<<<<<< HEAD
=======
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
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
  activityLog: [{
    user: { type: mongoose.Schema.Types.ObjectId, refPath: 'activityLog.userModel' },
    userModel: { type: String, enum: ['Admin', 'Manager', 'Employee', 'SalesExecutive'] },
    action: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
<<<<<<< HEAD
=======
  },
  overdueNotified: {
    type: Boolean,
    default: false
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
