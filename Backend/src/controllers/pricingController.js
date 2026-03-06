const PricingPlan = require('../models/PricingPlan');

// @desc    Get all pricing plans and create defaults if empty
// @route   GET /api/v1/plans/landing-page
// @access  Public
exports.getLandingPagePlans = async (req, res, next) => {
    try {
        let plans = await PricingPlan.find().sort({ order: 1 });

        // Seed default plans if none exist
        if (plans.length === 0) {
            const defaults = [
                {
                    name: "Starter",
                    badge: "Starter – CRM + HRMS + TMS",
                    subtitle: "CRM, HRMS & Task Management for *small teams*.",
                    monthlyPrice: 1999,
                    annualPriceMonthly: 1699,
                    yearlyFakePrice: "₹23,988/year",
                    yearlySaveText: "Save ₹3,600 with yearly",
                    features: ['CRM Lead & Client Management', 'Sales Pipeline & Follow-ups', 'HRMS – Employee Management', 'Attendance & Leave Management', 'Basic Payroll Setup', 'Task & Project Management (TMS)', 'Role & Permission Management', 'Reports & Dashboard'],
                    buttonText: "Get Started",
                    buttonLink: "/register",
                    isPopular: false,
                    isBestValue: true, // Based on 'Best for small teams'
                    highlightColor: "emerald" // CheckCircle2 color
                },
                {
                    name: "Growth",
                    badge: "Growth – CRM + HRMS + TMS",
                    subtitle: "CRM, HRMS & Task Management for *growing businesses*.",
                    monthlyPrice: 6999,
                    annualPriceMonthly: 5999,
                    yearlyFakePrice: "₹83,988/year",
                    yearlySaveText: "Save ₹11,999 with yearly",
                    features: ['Full CRM with Leads, Deals & Clients', 'Sales Automation & Follow-ups', 'HRMS – Employee, Attendance & Leave', 'Payroll Management', 'Task, Project & Team Tracking', 'Performance & Productivity Reports', 'Multi-role Access Control', 'Centralized Dashboard'],
                    buttonText: "Get Started",
                    buttonLink: "/register",
                    isPopular: true,
                    isBestValue: false,
                    highlightColor: "amber",
                    order: 1
                },
                {
                    name: "Enterprise",
                    badge: "Enterprise – CRM + HRMS + TMS",
                    subtitle: "CRM, HRMS & Task Management platform for *large organizations*.",
                    monthlyPrice: 11999,
                    annualPriceMonthly: 9999,
                    yearlyFakePrice: "₹143,988/year",
                    yearlySaveText: "Save ₹24,000 with yearly",
                    features: ['Advanced CRM & Sales Management', 'Lead, Deal & Client Automation', 'Complete HRMS Suite', 'Attendance, Leave & Payroll', 'Task, Project & Team Management', 'Advanced Reports & Analytics', 'Role-based Permissions', 'Secure & Scalable Architecture'],
                    buttonText: "Get Started",
                    buttonLink: "/contact",
                    isPopular: false,
                    isBestValue: true, // Best Value
                    highlightColor: "purple",
                    order: 2
                }
            ];

            plans = await PricingPlan.insertMany(defaults);
        }

        res.status(200).json({
            success: true,
            count: plans.length,
            data: plans
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a pricing plan
// @route   PUT /api/v1/plans/landing-page/:id
// @access  Private (SuperAdmin)
exports.updatePricingPlan = async (req, res, next) => {
    try {
        let plan = await PricingPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ success: false, message: 'Pricing plan not found' });

        plan = await PricingPlan.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: plan
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a pricing plan
// @route   DELETE /api/v1/plans/landing-page/:id
// @access  Private (SuperAdmin)
exports.deletePricingPlan = async (req, res, next) => {
    try {
        await PricingPlan.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Plan deleted' });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a pricing plan
// @route   POST /api/v1/plans/landing-page
// @access  Private (SuperAdmin)
exports.createPricingPlan = async (req, res, next) => {
    try {
        const plan = await PricingPlan.create(req.body);
        res.status(201).json({ success: true, data: plan });
    } catch (error) {
        next(error);
    }
};
