const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const crypto = require('crypto');

const AdminSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Please add a company name']
  },
  subscriptionPlan: {
    type: String,
    default: 'Starter'
  },
  subscriptionPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  },
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  phoneNumber: String,
  profileImage: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'pending', 'suspended'],
    default: 'active'
  },
  subscriptionExpiry: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

AdminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
AdminSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('Admin', AdminSchema);
