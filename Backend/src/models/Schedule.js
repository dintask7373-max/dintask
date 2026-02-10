const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  agenda: {
    type: String,
    trim: true
  },
  meetingLink: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['meeting', 'call', 'review', 'other', 'task', 'deadline'],
    default: 'meeting'
  },
  date: {
    type: Date,
    required: [true, 'Please add a date']
  },
  time: {
    type: String,
    required: [true, 'Please add a start time']
  },
  endTime: {
    type: String
  },
  location: {
    type: String,
    default: 'Remote'
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
    required: true
  },
  participants: [
    {
      userId: {
        type: mongoose.Schema.ObjectId,
        required: true
      },
      userType: {
        type: String,
        required: true,
        enum: ['Admin', 'Manager', 'Employee', 'SalesExecutive']
      },
      name: String, // Denormalized for quick UI display
      email: String
    }
  ],
  status: {
    type: String,
    enum: ['scheduled', 'cancelled', 'completed'],
    default: 'scheduled'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
