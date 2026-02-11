const express = require('express');
const router = express.Router();
const LandingPageContent = require('../models/LandingPageContent');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get All Landing Page Content
// @route   GET /api/v1/landing-page/content
// @access  Public
router.get('/content', async (req, res) => {
    try {
        let content = await LandingPageContent.findOne();
        if (!content) {
            content = await LandingPageContent.create({});
        }
        res.status(200).json({ success: true, data: content });
    } catch (error) {
        console.error('Get Landing Page Content Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Update Landing Page Section
// @route   PUT /api/v1/landing-page/update
// @access  Private (SuperAdmin)
router.put('/update', protect, authorize('superadmin', 'superadmin_staff', 'super_admin'), async (req, res) => {
    try {
        const { section, data } = req.body;

        if (!section || !data) {
            return res.status(400).json({ success: false, message: 'Missing section or data' });
        }

        let content = await LandingPageContent.findOne();
        if (!content) {
            content = await LandingPageContent.create({});
        }

        // Validate Section
        const validSections = ['hero', 'features', 'strategic_options', 'tactical_preview'];
        if (!validSections.includes(section)) {
            return res.status(400).json({ success: false, message: 'Invalid section' });
        }

        // Update Logic
        if (section === 'hero') {
            content.hero = { ...content.hero, ...data };
        } else if (section === 'features') {
            // Expect data to be an object: { modules: [...] } or array directly? Let's assume object wrapper from frontend
            if (data.modules) content.features.modules = data.modules;
            else content.features = data; // Fallback
        } else if (section === 'strategic_options') {
            if (data.options) content.strategic_options.options = data.options;
            else content.strategic_options = data;
        } else if (section === 'tactical_preview') {
            if (data.tacticalTitle) content.tactical_preview.tacticalTitle = data.tacticalTitle;
            if (data.tacticalSubtitle) content.tactical_preview.tacticalSubtitle = data.tacticalSubtitle;
            if (data.showcaseImages) content.tactical_preview.showcaseImages = data.showcaseImages;
        }

        await content.save();

        res.status(200).json({ success: true, data: content });
    } catch (error) {
        console.error('Update Landing Page Content Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
