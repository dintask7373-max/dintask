const mongoose = require('mongoose');

const PartnerDocumentSchema = new mongoose.Schema({
    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partner',
        required: true
    },
    documentType: {
        type: String,
        required: true // PAN, GST, Registration, Agreement, etc.
    },
    fileUrl: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('PartnerDocument', PartnerDocumentSchema);
