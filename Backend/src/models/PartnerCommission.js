const mongoose = require('mongoose');

const PartnerCommissionSchema = new mongoose.Schema({
    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partner',
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    type: {
        type: String,
        enum: ['Percentage', 'Fixed', 'Recurring'],
        required: true
    },
    payoutId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PartnerPayout'
    }
}, { timestamps: true });

module.exports = mongoose.model('PartnerCommission', PartnerCommissionSchema);
