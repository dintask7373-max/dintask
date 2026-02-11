const LandingPageContent = require('../models/LandingPageContent');

// @desc    Get all landing page content
// @route   GET /api/v1/landing-page/content
// @access  Public
exports.getLandingPageContent = async (req, res, next) => {
    try {
        const content = await LandingPageContent.findOne();
        if (!content) {
            // Create default if not exists
            const newContent = await LandingPageContent.create({});
            return res.status(200).json({ success: true, data: newContent });
        }
        res.status(200).json({ success: true, data: content });
    } catch (error) {
        next(error);
    }
};

// @desc    Update specific section
// @route   PUT /api/v1/landing-page/update
// @access  Private (SuperAdmin)
exports.updateSection = async (req, res, next) => {
    try {
        console.log('Update Section Body:', req.body);
        const { section, data } = req.body;

        if (!section || !data) {
            return res.status(400).json({ success: false, message: 'Please provide section and data' });
        }

        let content = await LandingPageContent.findOne();
        if (!content) {
            content = await LandingPageContent.create({});
        }

        // Update the specific section
        // Validate section name against schema paths
        if (!['hero', 'features', 'strategic_options', 'tactical_preview'].includes(section)) {
            return res.status(400).json({ success: false, message: 'Invalid section name' });
        }

        // Direct object update for the section
        // If updating array completely, replace it
        // If updating fields, merge them
        if (section === 'features' || section === 'strategic_options') {
            // These are arrays or complex objects, replace entirely with new data from frontend
            // Ensure frontend sends the complete updated object/array wrapper
            content[section] = data;
        } else {
            // For hero, tactical_preview (simple objects or arrays of strings), replace fields
            // or replace the whole object if structured correctly
            content[section] = { ...content[section], ...data };
        }

        // Specifically handle showcaseImages if passed directly
        if (section === 'tactical_preview' && data.showcaseImages) {
            content[section].showcaseImages = data.showcaseImages;
        }

        await content.save();

        res.status(200).json({ success: true, data: content });
    } catch (error) {
        console.error('Error updating landing page content:', error);
        next(error);
    }
};
