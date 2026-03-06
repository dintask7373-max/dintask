const mongoose = require('mongoose');

const PartnerReferralSchema = new mongoose.Schema({
    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partner',
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin' // Null until they signup
    },
    referralCode: {
        type: String,
        required: true
    },
    ipAddress: String,
    userAgent: String,
    status: {
        type: String,
        enum: ['Clicked', 'SignedUp', 'Paid'],
        default: 'Clicked'
    }
}, { timestamps: true });

module.exports = mongoose.model('PartnerReferral', PartnerReferralSchema);
