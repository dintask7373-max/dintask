const express = require('express');
const router = express.Router();
<<<<<<< HEAD
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
=======
const {
    getHeroContent,
    updateHeroContent,
    getPlatformContent,
    updatePlatformContent,
    getFaqsContent,
    updateFaqsContent,
    getTacticalContent,
    updateTacticalContent,
    getFooterCtaContent,
    updateFooterCtaContent,
    getPrivacyPolicy,
    updatePrivacyPolicy,
    getTermsOfService,
    updateTermsOfService,
    getCookiePolicy,
    updateCookiePolicy
} = require('../controllers/landingPageController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Hero Routes
router.get('/hero', getHeroContent);
router.put('/hero', protect, authorize('superadmin', 'super_admin'), updateHeroContent);

// Platform Routes
router.get('/platform', getPlatformContent);
router.put('/platform', protect, authorize('superadmin', 'super_admin'), upload.single('authorImage'), updatePlatformContent);

// FAQ Routes
router.get('/faqs', getFaqsContent);
router.put('/faqs', protect, authorize('superadmin', 'super_admin'), updateFaqsContent);

// Tactical Routes
router.get('/tactical', getTacticalContent);
router.put('/tactical', protect, authorize('superadmin', 'super_admin'), upload.fields([
    { name: 'image_0', maxCount: 1 },
    { name: 'image_1', maxCount: 1 },
    { name: 'image_2', maxCount: 1 }
]), updateTacticalContent);

// Footer CTA Routes
router.get('/footer-cta', getFooterCtaContent);
router.put('/footer-cta', protect, authorize('superadmin', 'super_admin'), upload.fields([
    { name: 'image_0', maxCount: 1 },
    { name: 'image_1', maxCount: 1 },
    { name: 'image_2', maxCount: 1 },
    { name: 'image_3', maxCount: 1 }
]), updateFooterCtaContent);

// Privacy Policy Routes
router.get('/privacy_policy', getPrivacyPolicy);
router.put('/privacy_policy', protect, authorize('superadmin', 'super_admin'), updatePrivacyPolicy);

// Terms of Service Routes
router.get('/terms_service', getTermsOfService);
router.put('/terms_service', protect, authorize('superadmin', 'super_admin'), updateTermsOfService);

// Cookie Policy Routes
router.get('/cookie_policy', getCookiePolicy);
router.put('/cookie_policy', protect, authorize('superadmin', 'super_admin'), updateCookiePolicy);
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94

module.exports = router;
