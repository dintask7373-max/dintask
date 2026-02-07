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
            },
            {
                section: 'social_contact',
                socialLinks: {
                    facebook: '#',
                    twitter: '#',
                    youtube: '#',
                    linkedin: '#',
                    instagram: '#'
                },
                contactInfo: {
                    phone: '+919876543210',
                    email: 'contact@dintask.com',
                    whatsapp: '919876543210'
                }
            },
            {
                section: 'privacy_policy',
                policySections: [
                    { title: "01 / Introduction", content: "At DinTask, your privacy is our priority. This Privacy Policy explains how we collect, use, and protect your information when you use our tactical workspace solutions. We are committed to maintaining the highest standards of data security and transparency." },
                    { title: "02 / Information Collection", content: "We collect information that you provide directly to us when you create an account, such as your name, email address, and company details. We also collect data related to your usage of the platform to provide a personalized and efficient experience." },
                    { title: "03 / Data Security", content: "We implement military-grade encryption (v4.2) and industry-leading security protocols to safeguard your data. Your information is stored on secure servers with restricted access, ensuring that your business intelligence remains confidential." },
                    { title: "04 / Information Sharing", content: "DinTask does not sell or lease your personal information to third parties. We may share data with trusted service providers who assist us in operating our platform, provided they adhere to strict confidentiality agreements." },
                    { title: "05 / Your Rights", content: "You have the right to access, update, or delete your personal information at any time. If you wish to exercise these rights, please contact our support team through the integrated chat or email." }
                ]
            },
            {
                section: 'terms_service',
                policySections: [
                    { title: "01 / Agreement to Terms", content: "By accessing or using DinTask, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our platform. These terms apply to all visitors, users, and others who access the service." },
                    { title: "02 / Use of the Platform", content: "DinTask is designed for professional business use. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to use the platform in compliance with all applicable laws." },
                    { title: "03 / Intellectual Property", content: "The platform and its original content, features, and functionality are and will remain the exclusive property of DinTask and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent." },
                    { title: "04 / Technical Limitations", content: "While we strive for 100% uptime, you acknowledge that technical issues may occur. We reserve the right to perform maintenance and updates to improve the platform's tactical performance, which may result in temporary unavailability." },
                    { title: "05 / Termination", content: "We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the platform will immediately cease." }
                ]
            },
            {
                section: 'cookie_policy',
                policySections: [
                    { title: "01 / Use of Cookies", content: "DinTask uses cookies and similar tracking technologies to enhance your tactical experience. Cookies are small data files that are placed on your device to help us recognize you and provide a more personalized workflow." },
                    { title: "02 / Essential Cookies", content: "These cookies are necessary for the platform to function correctly. They enable core features such as secure login, session management, and load balancing. Without these cookies, the platform cannot operate effectively." },
                    { title: "03 / Analytical Cookies", content: "We use analytical cookies to understand how users interact with our platform. This data helps us optimize the user interface and improve the performance of our tactical modules." },
                    { title: "04 / Customization Cookies", content: "These cookies allow the platform to remember your preferences, such as language settings, theme choices, and workspace layouts, providing a more tailored experience every time you log in." },
                    { title: "05 / Managing Cookies", content: "You can control and manage cookies through your browser settings. Please note that disabling certain cookies may impact the functionality and performance of the DinTask platform." }
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
