const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // Using dynamic ref behavior is complex in Mongoose for a simple feature.
    // We'll just store the ID and the role in the controller if needed, 
    // but for personal notes, we usually just need to know WHO owns it.
  },
  userRole: {
    type: String,
    required: true,
    enum: ['admin', 'employee', 'manager', 'sales', 'superadmin']
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add some content']
  },
  category: {
    type: String,
    default: 'General'
  },
  color: {
    type: String,
    default: 'bg-white'
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Note', NoteSchema);
