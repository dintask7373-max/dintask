const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
  pricePerMember: {
    type: Number,
    default: 50 // Default price per member
  },
  annualDiscount: {
    type: Number,
    default: 20 // 20% discount for annual plans
  },
  demoDays: {
    type: Number,
    default: 7
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperAdmin'
  }
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema);
