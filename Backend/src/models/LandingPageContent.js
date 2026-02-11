const mongoose = require('mongoose');

const LandingPageContentSchema = new mongoose.Schema({
    // Section 1: Hero
    hero: {
        heroBadge: {
            type: String,
            default: "YOUR COMPLETE CRM PLATFORM"
        },
        heroTitle: {
            type: String,
            default: "Five powerful CRM modules to run your entire business."
        },
        heroSubtitle: {
            type: String,
            default: "Access our Sales, Project Management, HR, Finance, and Client Portal modules—all integrated in one platform. Manage your entire business operations without switching between multiple tools. Get started today and transform how you work."
        },
        heroCtaPrimary: {
            type: String,
            default: "Get Started"
        },
        heroCtaSecondary: {
            type: String,
            default: "View Modules"
        }
    },

    // Section 2: Features (Modules)
    features: {
        modules: [{
            title: String,
            description: String,
            icon: String, // lucide-react icon name as string
            features: [String] // Bullet points
        }]
    },

    // Section 3: Strategic Options
    strategic_options: {
        options: [{
            title: String,
            description: String,
            icon: String
        }]
    },

    // Section 4: Tactical Preview
    tactical_preview: {
        tacticalTitle: {
            type: String,
            default: "The Tactical Interface."
        },
        tacticalSubtitle: {
            type: String,
            default: "Tactical Preview"
        },
        showcaseImages: [String] // Array of image URLs
    }
}, { timestamps: true });

module.exports = mongoose.model('LandingPageContent', LandingPageContentSchema);
