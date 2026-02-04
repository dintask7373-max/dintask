import mongoose from 'mongoose';

const salesSchema = new mongoose.Schema({
    client: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    salesRepId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    // New fields for Deal Pipeline
    dealId: {
        type: String,
        required: true,
        unique: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    deadline: {
        type: Date
    },
    dealStage: {
        type: String,
        enum: ['new', 'contacted', 'proposal', 'negotiation', 'closed', 'won', 'lost'],
        default: 'new'
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model('Sales', salesSchema);
