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
        required: [true, 'Please provide your job title']
    },
    companySize: {
        type: String,
        required: [true, 'Please select company size'],
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
        required: [true, 'Please select industry'],
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
    status: {
        type: String,
        enum: ['new', 'contacted', 'converted', 'closed'],
        default: 'new'
    },
    source: {
        type: String,
        default: 'support_form'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SupportLead', SupportLeadSchema);
