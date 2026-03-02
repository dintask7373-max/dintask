const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const PartnerSchema = new mongoose.Schema({
  name: {
    type: String
  },
  partnerType: {
    type: String,
    enum: ['Individual', 'Company'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'disabled', 'rejected'],
    default: 'pending'
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },

  // Individual Fields
  fullName: String,
  panNumber: String,
  address: String,

  // Company Fields
  companyName: String,
  gstNumber: String,
  companyPan: String,
  authorizedPersonName: String,

  // Common Fields
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },

  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    branchName: String
  },

  commissionType: {
    type: String,
    enum: ['Percentage', 'Fixed', 'Recurring'],
    default: 'Percentage'
  },
  commissionValue: {
    type: Number,
    default: 10 // Default 10% or 10 units
  },

  // Stats
  totalEarnings: {
    type: Number,
    default: 0
  },
  pendingCommission: {
    type: Number,
    default: 0
  },
  paidCommission: {
    type: Number,
    default: 0
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
  role: {
    type: String,
    default: 'partner'
  },
  agreementStatus: {
    type: String,
    enum: ['pending', 'accepted'],
    default: 'pending'
  },
  agreementAcceptedAt: {
    type: Date
  }

}, { timestamps: true });

// Encrypt password using bcrypt
PartnerSchema.pre('save', async function () {
  console.log('[MODEL DEBUG] Partner pre-save hook started');
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
PartnerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
PartnerSchema.methods.getResetPasswordToken = function () {
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

module.exports = mongoose.models.Partner || mongoose.model('Partner', PartnerSchema);
