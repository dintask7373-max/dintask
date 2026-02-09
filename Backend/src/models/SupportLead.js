const mongoose = require('mongoose');

const SupportLeadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name']
    },
    businessEmail: {
        type: String,
        required: [true, 'Please provide your business email']
    },
    phone: {
        type: String,
        required: [true, 'Please provide your phone number']
    },
    companyName: {
        type: String,
        required: [true, 'Please provide company name']
    },
    jobTitle: {
        type: String,
        required: false // Optional for Pricing/Register leads
    },
    companySize: {
        type: String,
        required: false, // Optional
        enum: [
            '1-10 Employees',
            '11-50 Employees',
            '51-200 Employees',
            '201-500 Employees',
            '500+ Employees'
        ]
    },
    industry: {
        type: String,
        required: false, // Optional
        enum: [
            'Technology',
            'Finance',
            'Healthcare',
            'Education',
            'Manufacturing',
            'Others'
        ]
    },
    requirements: {
        type: String
    },
    interestedPlan: {
        type: String // e.g., 'Starter', 'Pro', 'Enterprise'
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'converted', 'closed', 'replied', 'archived'],
        default: 'new'
    },
    source: {
        type: String,
        default: 'contact_form' // 'contact_form' or 'pricing_page'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SupportLead', SupportLeadSchema);
