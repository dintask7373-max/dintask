const mongoose = require('mongoose');

const PartnerPayoutSchema = new mongoose.Schema({
    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partner',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    transactionRef: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'paid'
    },
    paidAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('PartnerPayout', PartnerPayoutSchema);
