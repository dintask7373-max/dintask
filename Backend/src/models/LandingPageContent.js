const mongoose = require('mongoose');

const LandingPageContentSchema = new mongoose.Schema({
    // Section identifiers
    section: {
        type: String,
        required: true,
        unique: true,
        enum: [
            'hero',
            'features',
            'strategic_options',
            'tactical_preview',
            'testimonial',
            'pricing',
            'demo_cta',
            'footer',
            'social_contact',
            'privacy_policy',
            'terms_service',
            'cookie_policy'
        ]
    },

    // Policy Content (for Privacy, Terms, Cookies)
    policySections: [{
        title: String,
        content: String
    }],
    lastUpdated: { type: Date },

    // Hero Section
    heroTitle: { type: String },
    heroSubtitle: { type: String },
    heroVideoUrl: { type: String },

    // Features/Modules (Array of modules)
    modules: [{
        id: String,
        title: String,
        description: String,
        icon: String,
        color: String,
        features: [String]
    }],

    // Strategic Options (3 cards)
    strategicOptions: [{
        id: String,
        title: String,
        description: String,
        icon: String,
        color: String,
        bgColor: String,
        borderColor: String
    }],

    // Tactical Preview
    tacticalTitle: { type: String },
    tacticalSubtitle: { type: String },
    tacticalVideoUrl: { type: String },
    showcaseImages: [String],

    // Testimonial Section
    testimonialBadge: { type: String },
    testimonialTitle: { type: String },
    testimonialSubtitle: { type: String },
    testimonialDescription: { type: String },
    testimonialCtaText: { type: String },
    testimonialQuote: { type: String },
    testimonialAuthorName: { type: String },
    testimonialAuthorRole: { type: String },
    testimonialAuthorImage: { type: String },
    testimonialBgColor: { type: String },

    // Pricing Plans
    plans: [{
        name: String,
        price: String,
        duration: String,
        description: String,
        features: [String],
        cta: String,
        variant: String,
        popular: Boolean
    }],
    pricingTitle: { type: String },
    pricingDescription: { type: String },
    pricingBgColor: { type: String },

    // Demo CTA Section
    demoTitle: { type: String },
    demoDescription: { type: String },
    demoCtaPrimary: { type: String },
    demoCtaSecondary: { type: String },
    demoBgColor: { type: String },
    demoFloatingImages: [String], // Array of 4 image URLs

    // Footer
    footerDescription: { type: String },
    footerCopyright: { type: String },
    footerLogoUrl: { type: String },
    footerLinks: [{
        title: String,
        links: [String]
    }],

    // Social and Contact
    socialLinks: {
        facebook: String,
        twitter: String,
        youtube: String,
        linkedin: String,
        instagram: String
    },
    contactInfo: {
        phone: String,
        email: String,
        whatsapp: String
    },

    // Metadata
    isActive: { type: Boolean, default: true },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true
});

module.exports = mongoose.model('LandingPageContent', LandingPageContentSchema);
