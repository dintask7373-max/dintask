const Testimonial = require('../models/Testimonial');

// Create a new testimonial (Public)
exports.createTestimonial = async (req, res) => {
    try {
        const { name, role, testimonial, rating, image } = req.body;

        const newTestimonial = await Testimonial.create({
            name,
            role,
            testimonial,
            rating: rating || 5,
            image,
            isApproved: false // Default to pending approval
        });

        res.status(201).json({
            success: true,
            message: 'Testimonial submitted successfully and is pending approval.',
            data: newTestimonial
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error submitting testimonial',
            error: error.message
        });
    }
};

// Get all testimonials (SuperAdmin)
exports.getAllTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.json({ success: true, count: testimonials.length, data: testimonials });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching testimonials', error: error.message });
    }
};

// Get approved testimonials (Public Landing Page)
exports.getApprovedTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find({ isApproved: true }).sort({ highlighted: -1, createdAt: -1 });
        res.json({ success: true, count: testimonials.length, data: testimonials });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching approved testimonials', error: error.message });
    }
};

// Approve/Reject testimonial (SuperAdmin)
exports.updateTestimonialStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isApproved } = req.body;

        const testimonial = await Testimonial.findByIdAndUpdate(
            id,
            { isApproved },
            { new: true, runValidators: true }
        );

        if (!testimonial) {
            return res.status(404).json({ success: false, message: 'Testimonial not found' });
        }

        res.json({ success: true, message: `Testimonial ${isApproved ? 'approved' : 'rejected'}`, data: testimonial });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating testimonial status', error: error.message });
    }
};

// Highlight testimonial (SuperAdmin)
exports.toggleHighlight = async (req, res) => {
    try {
        const { id } = req.params;
        const testimonial = await Testimonial.findById(id);

        if (!testimonial) {
            return res.status(404).json({ success: false, message: 'Testimonial not found' });
        }

        // Toggle highlight
        testimonial.highlighted = !testimonial.highlighted;
        await testimonial.save();

        res.json({ success: true, message: `Testimonial highlight ${testimonial.highlighted ? 'enabled' : 'disabled'}`, data: testimonial });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error toggling highlight', error: error.message });
    }
};

// Delete testimonial (SuperAdmin)
exports.deleteTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const testimonial = await Testimonial.findByIdAndDelete(id);

        if (!testimonial) {
            return res.status(404).json({ success: false, message: 'Testimonial not found' });
        }

        res.json({ success: true, message: 'Testimonial deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting testimonial', error: error.message });
    }
};
