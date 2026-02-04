import mongoose from 'mongoose';

const salesTargetSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['individual', 'team'],
        required: true
    },
    period: {
        type: String,
        enum: ['monthly', 'quarterly', 'yearly'],
        required: true
    },
    dealsTarget: {
        type: Number,
        default: 0
    },
    clientsTarget: {
        type: Number,
        default: 0
    },
    assignedTo: {
        // Can be a specific User ID (for individual) or generic 'team'
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true,
        default: new Date().getFullYear()
    }
}, {
    timestamps: true
});

// Compound index to ensure unique targets per type/period/assignee/year
salesTargetSchema.index({ type: 1, period: 1, assignedTo: 1, year: 1 }, { unique: true });

export default mongoose.model('SalesTarget', salesTargetSchema);
