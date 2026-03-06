const mongoose = require('mongoose');

const PricingPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    badge: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: true
    },
    monthlyPrice: {
        type: Number,
        required: true
    },
    annualPriceMonthly: { // The price per month when billed annually
        type: Number,
        required: true
    },
    yearlyFakePrice: { // The crossed out price
        type: String,
        default: ""
    },
    yearlySaveText: {
        type: String,
        default: ""
    },
    features: {
        type: [String],
        default: []
    },
    buttonText: {
        type: String,
        default: "Get Started"
    },
    buttonLink: {
        type: String,
        default: "/register"
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    isBestValue: {
        type: Boolean,
        default: false
    },
    highlightColor: {
        type: String, // e.g., "yellow", "purple"
        default: "yellow"
    },
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('PricingPlan', PricingPlanSchema);
