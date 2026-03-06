const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const EmployeeSchema = new mongoose.Schema({
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
    default: 'https://res.cloudinary.com/demo/image/upload/v1574026613/profile.jpg'
  },
  role: {
    type: String,
    default: 'employee'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Admin ID is required to link this user to a workspace']
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manager'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'rejected'],
    default: 'pending'
  },
  fcmToken: {
    app: {
      type: String,
      default: ''
    },
    web: {
      type: String,
      default: ''
    }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

EmployeeSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

EmployeeSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
EmployeeSchema.methods.getResetPasswordToken = function () {
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

module.exports = mongoose.model('Employee', EmployeeSchema);
