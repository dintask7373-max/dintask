const LandingPageContent = require('../models/LandingPageContent');

// @desc    Get Landing Page Content (Hero)
// @route   GET /api/v1/landing-page/hero
// @access  Public
exports.getHeroContent = async (req, res, next) => {
    try {
        let content = await LandingPageContent.findOne();

        if (!content) {
            content = await LandingPageContent.create({});
        }

        res.status(200).json({
            success: true,
            data: content.hero
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update Landing Page Content (Hero)
// @route   PUT /api/v1/landing-page/hero
// @access  Private (SuperAdmin)
exports.updateHeroContent = async (req, res, next) => {
    try {
        const { badge, title, subtitle, ctaPrimary, ctaSecondary } = req.body;

        let content = await LandingPageContent.findOne();

        if (!content) {
            content = await LandingPageContent.create({});
        }

        // Update fields if provided
        if (badge) content.hero.badge = badge;
        if (title) content.hero.title = title;
        if (subtitle) content.hero.subtitle = subtitle;
        if (ctaPrimary) content.hero.ctaPrimary = ctaPrimary;
        if (ctaSecondary) content.hero.ctaSecondary = ctaSecondary;

        await content.save();

        res.status(200).json({
            success: true,
            data: content.hero,
            message: 'Hero section updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Landing Page Content (Platform Section)
// @route   GET /api/v1/landing-page/platform
// @access  Public
exports.getPlatformContent = async (req, res, next) => {
    try {
        let content = await LandingPageContent.findOne();

        if (!content) {
            content = await LandingPageContent.create({});
        }

        res.status(200).json({
            success: true,
            data: content.platformSection
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update Landing Page Content (Platform Section)
// @route   PUT /api/v1/landing-page/platform
// @access  Private (SuperAdmin)
exports.updatePlatformContent = async (req, res, next) => {
    try {
        const { badge, title, subtitle, description, ctaText, quote, authorName, authorRole, authorImage: authorImageUrl } = req.body;
        let imageUrl = authorImageUrl;

        if (req.file) {
            imageUrl = req.file.path;
        }

        let content = await LandingPageContent.findOne();

        if (!content) {
            content = await LandingPageContent.create({});
        }

        // Update fields if provided
        if (badge) content.platformSection.badge = badge;
        if (title) content.platformSection.title = title;
        if (subtitle) content.platformSection.subtitle = subtitle;
        if (description) content.platformSection.description = description;
        if (ctaText) content.platformSection.ctaText = ctaText;
        if (quote) content.platformSection.quote = quote;
        if (authorName) content.platformSection.authorName = authorName;
        if (authorRole) content.platformSection.authorRole = authorRole;
        if (imageUrl) content.platformSection.authorImage = imageUrl;

        await content.save();

        res.status(200).json({
            success: true,
            data: content.platformSection,
            message: 'Platform section updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Landing Page Content (FAQs)
// @route   GET /api/v1/landing-page/faqs
// @access  Public
exports.getFaqsContent = async (req, res, next) => {
    try {
        let content = await LandingPageContent.findOne();

        if (!content) {
            content = await LandingPageContent.create({});
        }

        res.status(200).json({
            success: true,
            data: content.faqs
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update Landing Page Content (FAQs)
// @route   PUT /api/v1/landing-page/faqs
// @access  Private (SuperAdmin)
exports.updateFaqsContent = async (req, res, next) => {
    try {
        const { faqs } = req.body;

        let content = await LandingPageContent.findOne();

        if (!content) {
            content = await LandingPageContent.create({});
        }

        if (faqs && Array.isArray(faqs)) {
            // Ensure we only store valid objects
            content.faqs = faqs.map(faq => ({
                question: faq.question,
                answer: faq.answer
            }));
        }

        await content.save();

        res.status(200).json({
            success: true,
            data: content.faqs,
            message: 'FAQs updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Landing Page Content (Tactical Section)
// @route   GET /api/v1/landing-page/tactical
// @access  Public
exports.getTacticalContent = async (req, res, next) => {
    try {
        let content = await LandingPageContent.findOne();

        if (!content) {
            content = await LandingPageContent.create({});
        }

        res.status(200).json({
            success: true,
            data: content.tacticalSection
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update Landing Page Content (Tactical Section)
// @route   PUT /api/v1/landing-page/tactical
// @access  Private (SuperAdmin)
exports.updateTacticalContent = async (req, res, next) => {
    try {
        const { title, subtitle } = req.body;

        let content = await LandingPageContent.findOne();
        if (!content) {
            content = await LandingPageContent.create({});
        }

        // Initialize images array if it doesn't exist
        if (!content.tacticalSection.images) {
            content.tacticalSection.images = [];
        }

        if (title) content.tacticalSection.title = title;
        if (subtitle) content.tacticalSection.subtitle = subtitle;

        const finalImages = [...(content.tacticalSection.images || [])];

        // Ensure we have 3 slots
        while (finalImages.length < 3) finalImages.push("");

        if (req.files) {
            if (req.files['image_0']) finalImages[0] = req.files['image_0'][0].path;
            if (req.files['image_1']) finalImages[1] = req.files['image_1'][0].path;
            if (req.files['image_2']) finalImages[2] = req.files['image_2'][0].path;
        }

        content.tacticalSection.images = finalImages.slice(0, 3);

        await content.save();

        res.status(200).json({
            success: true,
            data: content.tacticalSection,
            message: 'Tactical section updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Landing Page Content (Footer CTA)
// @route   GET /api/v1/landing-page/footer-cta
// @access  Public
exports.getFooterCtaContent = async (req, res, next) => {
    try {
        let content = await LandingPageContent.findOne();

        if (!content) {
            content = await LandingPageContent.create({});
        }

        res.status(200).json({
            success: true,
            data: content.footerCta
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update Landing Page Content (Footer CTA)
// @route   PUT /api/v1/landing-page/footer-cta
// @access  Private (SuperAdmin)
exports.updateFooterCtaContent = async (req, res, next) => {
    try {
        const { title, description, ctaPrimary, ctaSecondary } = req.body;

        let content = await LandingPageContent.findOne();
        if (!content) {
            content = await LandingPageContent.create({});
        }

        // Initialize object if it doesn't exist (e.g. schema changed)
        if (!content.footerCta) {
            content.footerCta = { images: [] };
        }
        if (!content.footerCta.images) {
            content.footerCta.images = [];
        }

        if (title) content.footerCta.title = title;
        if (description) content.footerCta.description = description;
        if (ctaPrimary) content.footerCta.ctaPrimary = ctaPrimary;
        if (ctaSecondary) content.footerCta.ctaSecondary = ctaSecondary;

        const finalImages = [...(content.footerCta.images || [])];

        // Ensure we have 4 slots (as per frontend usage [0,1,2,3])
        while (finalImages.length < 4) finalImages.push("");

        if (req.files) {
            if (req.files['image_0']) finalImages[0] = req.files['image_0'][0].path;
            if (req.files['image_1']) finalImages[1] = req.files['image_1'][0].path;
            if (req.files['image_2']) finalImages[2] = req.files['image_2'][0].path;
            if (req.files['image_3']) finalImages[3] = req.files['image_3'][0].path;
        }

        content.footerCta.images = finalImages.slice(0, 4);

        await content.save();

        res.status(200).json({
            success: true,
            data: content.footerCta,
            message: 'Footer CTA updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Privacy Policy
// @route   GET /api/v1/landing-page/privacy_policy
// @access  Public
exports.getPrivacyPolicy = async (req, res, next) => {
    try {
        let content = await LandingPageContent.findOne();
        if (!content) content = await LandingPageContent.create({});

        // If privacyPolicy is missing or empty, ensure we return something based on schema defaults
        const policyData = (content.privacyPolicy && content.privacyPolicy.policySections && content.privacyPolicy.policySections.length > 0)
            ? content.privacyPolicy
            : {
                policySections: [
                    { title: "Information Collection", content: "We collect information you provide directly to us when you create an account, use our tactical modules, or communicate with us. This includes your name, email address, and any company data you upload to DinTask." },
                    { title: "How We Use Information", content: "We use the information we collect to maintain and improve our services, develop new modules, and protect DinTask and our users. This allows us to provide a seamless experience across Sales, Project, and HR modules." },
                    { title: "Data Security", content: "We use military-grade encryption to protect your data. However, no security system is impenetrable and we cannot guarantee the security of our database." },
                    { title: "Third-Party Sharing", content: "We do not sell your personal data. We only share information with tactical partners who help us provide our service." }
                ]
            };

        res.status(200).json({
            success: true,
            data: policyData
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update Privacy Policy
// @route   PUT /api/v1/landing-page/privacy_policy
// @access  Private (SuperAdmin)
exports.updatePrivacyPolicy = async (req, res, next) => {
    try {
        const { policySections } = req.body;
        let content = await LandingPageContent.findOne();
        if (!content) content = await LandingPageContent.create({});

        if (policySections) content.privacyPolicy.policySections = policySections;
        await content.save();

        res.status(200).json({
            success: true,
            data: content.privacyPolicy,
            message: 'Privacy Policy updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Terms of Service
// @route   GET /api/v1/landing-page/terms_service
// @access  Public
exports.getTermsOfService = async (req, res, next) => {
    try {
        let content = await LandingPageContent.findOne();
        if (!content) content = await LandingPageContent.create({});

        const termsData = (content.termsService && content.termsService.policySections && content.termsService.policySections.length > 0)
            ? content.termsService
            : {
                policySections: [
                    { title: "Acceptance of Terms", content: "By accessing or using DinTask, you agree to be bound by these terms. If you do not agree, you may not use the platform." },
                    { title: "User Accounts", content: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account." },
                    { title: "Subscription & Billing", content: "Access to certain modules requires a paid subscription. All fees are non-refundable unless otherwise specified." }
                ]
            };

        res.status(200).json({
            success: true,
            data: termsData
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update Terms of Service
// @route   PUT /api/v1/landing-page/terms_service
// @access  Private (SuperAdmin)
exports.updateTermsOfService = async (req, res, next) => {
    try {
        const { policySections } = req.body;
        let content = await LandingPageContent.findOne();
        if (!content) content = await LandingPageContent.create({});

        if (policySections) content.termsService.policySections = policySections;
        await content.save();

        res.status(200).json({
            success: true,
            data: content.termsService,
            message: 'Terms of Service updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Cookie Policy
// @route   GET /api/v1/landing-page/cookie_policy
// @access  Public
exports.getCookiePolicy = async (req, res, next) => {
    try {
        let content = await LandingPageContent.findOne();
        if (!content) content = await LandingPageContent.create({});

        const cookieData = (content.cookiePolicy && content.cookiePolicy.policySections && content.cookiePolicy.policySections.length > 0)
            ? content.cookiePolicy
            : {
                policySections: [
                    { title: "What are Cookies", content: "Cookies are small text files stored on your device that help us provide a better tactical experience." },
                    { title: "How We Use Cookies", content: "We use cookies to remember your login state, preferences, and to analyze how you interact with our platform." }
                ]
            };

        res.status(200).json({
            success: true,
            data: cookieData
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update Cookie Policy
// @route   PUT /api/v1/landing-page/cookie_policy
// @access  Private (SuperAdmin)
exports.updateCookiePolicy = async (req, res, next) => {
    try {
        const { policySections } = req.body;
        let content = await LandingPageContent.findOne();
        if (!content) content = await LandingPageContent.create({});

        if (policySections) content.cookiePolicy.policySections = policySections;
        await content.save();

        res.status(200).json({
            success: true,
            data: content.cookiePolicy,
            message: 'Cookie Policy updated successfully'
        });
    } catch (error) {
        next(error);
    }
};
