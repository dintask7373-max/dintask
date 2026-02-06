const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a plan name'],
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  userLimit: {
    type: Number,
    required: [true, 'Please add a user limit']
  },
  features: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Plan', PlanSchema);
