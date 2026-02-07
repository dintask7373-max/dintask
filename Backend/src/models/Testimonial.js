const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    role: {
        type: String,
        required: [true, 'Role/Company is required'],
        trim: true
    },
    image: {
        type: String,
        default: '' // Can be empty, frontend will handle fallback
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 5
    },
    testimonial: {
        type: String,
        required: [true, 'Testimonial text is required'],
        trim: true,
        maxlength: [500, 'Testimonial cannot exceed 500 characters']
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    highlighted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Testimonial', TestimonialSchema);
