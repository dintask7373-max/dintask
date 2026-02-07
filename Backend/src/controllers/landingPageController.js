const LandingPageContent = require('../models/LandingPageContent');

// Get all landing page content (public)
exports.getAllContent = async (req, res) => {
    try {
        const content = await LandingPageContent.find({ isActive: true });
        res.json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching content', error: error.message });
    }
};

// Get content by section (public)
exports.getContentBySection = async (req, res) => {
    try {
        const { section } = req.params;
        const content = await LandingPageContent.findOne({ section, isActive: true });

        if (!content) {
            return res.status(404).json({ success: false, message: 'Section not found' });
        }

        res.json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching content', error: error.message });
    }
};

// Update content by section (superadmin only)
exports.updateContentBySection = async (req, res) => {
    try {
        const { section } = req.params;
        const updateData = { ...req.body, lastUpdatedBy: req.user.id };

        let content = await LandingPageContent.findOne({ section });

        if (!content) {
            // Create new section content if it doesn't exist
            content = await LandingPageContent.create({ section, ...updateData });
        } else {
            // Update existing content
            content = await LandingPageContent.findOneAndUpdate(
                { section },
                updateData,
                { new: true, runValidators: true }
            );
        }

        res.json({ success: true, message: 'Content updated successfully', data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating content', error: error.message });
    }
};

// Delete section content (superadmin only)
exports.deleteContentBySection = async (req, res) => {
    try {
        const { section } = req.params;
        const content = await LandingPageContent.findOneAndDelete({ section });

        if (!content) {
            return res.status(404).json({ success: false, message: 'Section not found' });
        }

        res.json({ success: true, message: 'Content deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting content', error: error.message });
    }
};

// Initialize default content (superadmin only)
exports.initializeDefaultContent = async (req, res) => {
    try {
        const defaultContent = [
            {
                section: 'hero',
                heroTitle: 'Your work,\nPowered by\nour life\'s work.',
                heroSubtitle: 'An all-in-one workspace designed to break down silos and boost efficiency. Experience total control over your business operations.',
                heroVideoUrl: '/meeting-animation.mp4',
            },
            {
                section: 'features',
                modules: [
                    {
                        id: 'admin',
                        title: 'Admin Console',
                        description: 'Centralized control center to manage managers, employees, and overall system health.',
                        icon: 'ShieldCheck',
                        color: 'from-blue-600 to-indigo-600',
                        features: ['Manager Oversight', 'Employee Directory', 'System Analytics', 'Permission Controls']
                    },
                    {
                        id: 'manager',
                        title: 'Manager Station',
                        description: 'Powerful tools for task delegation, team progress monitoring, and schedule management.',
                        icon: 'LayoutDashboard',
                        color: 'from-purple-600 to-pink-600',
                        features: ['Task Delegation', 'Performance Metrics', 'Team Chat', 'Real-time Sync']
                    },
                    {
                        id: 'employee',
                        title: 'Employee Portal',
                        description: 'Personalized task dashboard designed for maximum productivity and focus.',
                        icon: 'Target',
                        color: 'from-emerald-500 to-teal-600',
                        features: ['Task List', 'Calendar Sync', 'Personal Notes', 'Quick Actions']
                    },
                    {
                        id: 'sales',
                        title: 'Sales & CRM',
                        description: 'Track leads, manage pipelines, and close deals with our integrated CRM suite.',
                        icon: 'Briefcase',
                        color: 'from-amber-500 to-orange-600',
                        features: ['Lead Management', 'Sales Pipeline', 'Follow-up Scheduler', 'Client Portal']
                    }
                ]
            },
            {
                section: 'strategic_options',
                strategicOptions: [
                    {
                        id: '01',
                        title: 'OPTIONS 01',
                        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                        icon: 'Search',
                        color: 'text-[#8bc34a]',
                        bgColor: 'bg-[#8bc34a]',
                        borderColor: 'border-[#8bc34a]'
                    },
                    {
                        id: '02',
                        title: 'OPTIONS 02',
                        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                        icon: 'Lightbulb',
                        color: 'text-[#00BFA5]',
                        bgColor: 'bg-[#00BFA5]',
                        borderColor: 'border-[#00BFA5]'
                    },
                    {
                        id: '03',
                        title: 'OPTIONS 03',
                        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                        icon: 'Target',
                        color: 'text-[#0288D1]',
                        bgColor: 'bg-[#0288D1]',
                        borderColor: 'border-[#0288D1]'
                    }
                ]
            },
            {
                section: 'tactical_preview',
                tacticalTitle: 'The Tactical Interface.',
                tacticalSubtitle: 'Tactical Preview',
                tacticalVideoUrl: '/team-meeting-animation.mp4',
                showcaseImages: [
                    '/src/assets/dashboard_1.png',
                    '/src/assets/dashboard_2.png',
                    '/src/assets/dashboard_3.png'
                ]
            },
            {
                section: 'testimonial',
                testimonialBadge: 'All-in-one suite',
                testimonialTitle: 'DinTask One',
                testimonialSubtitle: 'The operating system for business.',
                testimonialDescription: 'Run your entire business on DinTask with our unified cloud software, designed to help you break down silos between departments and increase organizational efficiency.',
                testimonialCtaText: 'TRY DINTASK ONE',
                testimonialQuote: 'You can be a startup, mid-sized company, or an enterprise - DinTask One is a boon for all. It transformed our workflow across India.',
                testimonialAuthorName: 'Rishi Sir',
                testimonialAuthorRole: 'Founder & CEO, DinTask',
                testimonialAuthorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rishi',
                testimonialBgColor: '#ffcc00'
            },
            {
                section: 'pricing',
                pricingTitle: 'Flexible Plans & Pricing',
                pricingDescription: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry and has been the standard ever since.',
                pricingBgColor: '#6374f2',
                plans: [
                    {
                        name: 'Free',
                        price: '$0',
                        duration: 'Forever',
                        description: 'Everything you need to get started.',
                        features: ['Personal Tasks', 'Basic Calendar', 'Storage 5GB', '1 Workspace'],
                        cta: 'Get Started',
                        variant: 'outline',
                        popular: false
                    },
                    {
                        name: 'Pro',
                        price: '$12',
                        duration: 'member / month',
                        description: 'Perfect for growing teams.',
                        features: ['Everything in Free', 'Advanced CRM', 'Google SSO', 'Unlimited Storage'],
                        cta: 'Upgrade Now',
                        variant: 'default',
                        popular: true
                    },
                    {
                        name: 'Pro Plus',
                        price: '$29',
                        duration: 'member / month',
                        description: 'Advanced tactical operations.',
                        features: ['Everything in Pro', 'Custom Branding', 'Priority Support', 'Advanced API'],
                        cta: 'Go Pro Plus',
                        variant: 'default',
                        popular: false
                    },
                    {
                        name: 'Enterprise',
                        price: 'Custom',
                        duration: 'for large scale',
                        description: 'For organizations needing more.',
                        features: ['Everything in Pro Plus', 'Dedicated Manager', 'SLA Support', 'SSO & SCIM'],
                        cta: 'Contact Sales',
                        variant: 'outline',
                        popular: false
                    }
                ]
            },
            {
                section: 'demo_cta',
                demoTitle: 'Ready to experience the Command Center?',
                demoDescription: 'Join thousands of managers who have optimized their workforce with DinTask\'s integrated suite.',
                demoCtaPrimary: 'START FREE TRIAL',
                demoCtaSecondary: 'BOOK A DEMO',
                demoBgColor: '#1e293b'
            },
            {
                section: 'footer',
                footerDescription: 'Empowering teams with tactical workspace solutions since 2026. Built by engineers, for engineers.',
                footerCopyright: '© 2026 DinTask Inc. All rights reserved.',
                footerLogoUrl: '/dintask-logo.png',
                footerLinks: [
                    { title: 'Product', links: ['Features', 'Pricing'] },
                    { title: 'Company', links: ['About', 'Contact'] },
                    { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies'] }
                ]
            }
        ];

        // Delete existing content
        await LandingPageContent.deleteMany({});

        // Insert default content
        await LandingPageContent.insertMany(defaultContent.map(content => ({
            ...content,
            lastUpdatedBy: req.user.id
        })));

        res.json({ success: true, message: 'Default content initialized successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error initializing content', error: error.message });
    }
};
