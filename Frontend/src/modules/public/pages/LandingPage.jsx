import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Target,
    ArrowRight,
    ShieldCheck,
    Briefcase,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    Zap,
    Star,
    Monitor,
    Smartphone,
    Layers,
    Lock,
    Globe,
    Facebook,
    Twitter,
    Youtube,
    Linkedin,
    Instagram,
    MessageCircle,
    Mail,
    Phone,
    Search,
    Lightbulb,
    Menu,
    X,
    HelpCircle,
    ChevronDown
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import axios from 'axios';

const LandingPage = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeModule, setActiveModule] = useState(0);
    const [currentImage, setCurrentImage] = useState(0);
    const [heroContent, setHeroContent] = useState({
        heroTitle: "Your work,\nPowered by\nour life's work.",
        heroSubtitle: "An all-in-one workspace designed to break down silos and boost efficiency. Experience total control over your business operations."
    });
    const [isAnnual, setIsAnnual] = useState(true);

    // Testimonial Submission States
    const [isSubmitOpen, setIsSubmitOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        testimonial: '',
        rating: 5,
        image: '' // Optional image URL
    });

    const [demoCta, setDemoCta] = useState({
        demoTitle: "Ready to experience the Command Center?",
        demoDescription: "Join thousands of managers who have optimized their workforce with DinTask's integrated suite.",
        demoCtaPrimary: "START FREE TRIAL",
        demoCtaSecondary: "BOOK A DEMO",
        demoFloatingImages: []
    });

    const [tacticalContent, setTacticalContent] = useState({
        tacticalTitle: "The Tactical Interface.",
        tacticalSubtitle: "Tactical Preview",
        showcaseImages: [
            '/src/assets/dashboard_1.png',
            '/src/assets/dashboard_2.png',
            '/src/assets/dashboard_3.png'
        ]
    });

    const [socialContact, setSocialContact] = useState({
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
    });

    const [pricingContent, setPricingContent] = useState({
        pricingTitle: "Flexible Plans & Pricing",
        pricingDescription: "Everything you need to get started with DinTask. Choose the plan that fits your team's needs.",
        pricingBgColor: "#6374f2",
        plans: []
    });

    const [testimonialSection, setTestimonialSection] = useState({
        testimonialBadge: "All-in-one suite",
        testimonialTitle: "DinTask One",
        testimonialSubtitle: "The operating system for business.",
        testimonialDescription: "Run your entire business on DinTask with our unified cloud software.",
        testimonialCtaText: "TRY DINTASK ONE",
        testimonialQuote: "DinTask One is a boon for all. It transformed our workflow.",
        testimonialAuthorName: "Rishi Sir",
        testimonialAuthorRole: "Founder & CEO, DinTask",
        testimonialAuthorImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rishi",
        testimonialBgColor: "#ffcc00"
    });

    const [footerContent, setFooterContent] = useState({
        footerDescription: "Empowering teams with tactical workspace solutions since 2026.",
        footerCopyright: "© 2026 DinTask Inc. All rights reserved.",
        footerLogoUrl: "/dintask-logo.png",
        footerLinks: [
            { title: 'Product', links: ['Features', 'Pricing'] },
            { title: 'Company', links: ['About', 'Contact'] },
            { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies'] }
        ]
    });

    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            id: 1,
            question: "Can I customize the modules to fit my business needs?",
            answer: "Yes, our platform is highly customizable to adapt to your specific business requirements. You can tailor workflows, fields, and permissions to match your unique processes."
        },
        {
            id: 2,
            question: "How do I add team members to the platform?",
            answer: "Adding team members is straightforward. Administrators can invite users via email from the dashboard, assign roles, and manage access levels with just a few clicks."
        },
        {
            id: 3,
            question: "What kind of support do you provide?",
            answer: "We offer comprehensive support including 24/7 email assistance, a detailed knowledge base, and priority support for enterprise clients to ensure your success."
        }
    ];

    const toggleFaq = (index) => {
        setOpenFaq(prev => prev === index ? null : index);
    };

    useEffect(() => {
        // Fetch hero section content from API
        const fetchHeroContent = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/landing-page/hero');
                if (response.data.success && response.data.data) {
                    setHeroContent({
                        heroTitle: response.data.data.heroTitle || heroContent.heroTitle,
                        heroSubtitle: response.data.data.heroSubtitle || heroContent.heroSubtitle
                    });
                }
            } catch (error) {
                console.error('Error fetching hero content:', error);
                // Keep default content if API fails
            }
        };

        // Fetch features/modules content from API
        const fetchModulesContent = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/landing-page/features');
                if (response.data.success && response.data.data && response.data.data.modules) {
                    setModules(response.data.data.modules);
                }
            } catch (error) {
                console.error('Error fetching modules content:', error);
                // Keep default modules if API fails
            }
        };

        // Fetch strategic options content from API
        const fetchStrategicOptions = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/landing-page/strategic_options');
                if (response.data.success && response.data.data && response.data.data.strategicOptions) {
                    setStrategicOptions(response.data.data.strategicOptions);
                }
            } catch (error) {
                console.error('Error fetching strategic options:', error);
                // Keep default strategic options if API fails
            }
        };

        // Fetch testimonials content from API
        const fetchTestimonials = async () => {
            try {
                // Try to fetch approved user testimonials first
                const response = await axios.get('http://localhost:5000/api/v1/testimonials/approved');
                if (response.data.success && response.data.data && response.data.data.length > 0) {
                    setTestimonials(response.data.data);
                } else {
                    // Fallback to landing page config if no user testimonials approved yet
                    const fallback = await axios.get('http://localhost:5000/api/v1/landing-page/testimonial');
                    if (fallback.data.success && fallback.data.data && fallback.data.data.testimonials) {
                        setTestimonials(fallback.data.data.testimonials);
                    }
                }
            } catch (error) {
                console.error('Error fetching testimonials:', error);
                // Keep default if everything fails
            }
        };

        const fetchTacticalContent = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/landing-page/tactical_preview');
                if (response.data.success && response.data.data) {
                    setTacticalContent(prev => ({ ...prev, ...response.data.data }));
                }
            } catch (error) {
                console.error('Error fetching tactical content:', error);
            }
        };

        const fetchDemoCtaContent = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/landing-page/demo_cta');
                if (response.data.success && response.data.data) {
                    setDemoCta(prev => ({ ...prev, ...response.data.data }));
                }
            } catch (error) {
                console.error('Error fetching demo cta:', error);
            }
        };

        const fetchSocialContact = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/landing-page/social_contact');
                if (response.data.success && response.data.data) {
                    setSocialContact(prev => ({ ...prev, ...response.data.data }));
                }
            } catch (error) {
                console.error('Error fetching social/contact:', error);
            }
        };

        const fetchPricingContent = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/landing-page/pricing');
                if (response.data.success && response.data.data) {
                    setPricingContent(prev => ({ ...prev, ...response.data.data }));
                }
            } catch (error) {
                console.error('Error fetching pricing content:', error);
            }
        };

        const fetchTestimonialSection = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/landing-page/testimonial');
                if (response.data.success && response.data.data) {
                    setTestimonialSection(prev => ({ ...prev, ...response.data.data }));
                }
            } catch (error) {
                console.error('Error fetching testimonial section:', error);
            }
        };

        const fetchFooterContent = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/landing-page/footer');
                if (response.data.success && response.data.data) {
                    setFooterContent(prev => ({ ...prev, ...response.data.data }));
                }
            } catch (error) {
                console.error('Error fetching footer content:', error);
            }
        };

        fetchHeroContent();
        fetchModulesContent();
        fetchStrategicOptions();
        fetchTestimonials();
        fetchTacticalContent();
        fetchDemoCtaContent();
        fetchSocialContact();
        fetchPricingContent();
        fetchTestimonialSection();
        fetchFooterContent();

        // Ensure body is scrollable when landing page mounts
        document.body.style.overflow = 'auto';
        document.body.style.overflowX = 'hidden';


    }, []);

    useEffect(() => {
        if (!tacticalContent.showcaseImages || tacticalContent.showcaseImages.length === 0) return;

        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % tacticalContent.showcaseImages.length);
        }, 3000);

        return () => {
            clearInterval(timer);
        };
    }, [tacticalContent.showcaseImages]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingChange = (value) => {
        setFormData(prev => ({ ...prev, rating: value }));
    };

    const handleSubmitTestimonial = async (e) => {
        e.preventDefault();

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            await axios.post('http://localhost:5000/api/v1/testimonials', formData);
            setSubmitStatus('success');
            // Reset form
            setTimeout(() => {
                setFormData({ name: '', role: '', testimonial: '', rating: 5, image: '' });
                setIsSubmitOpen(false);
                setSubmitStatus(null);
            }, 2000);
        } catch (error) {
            console.error('Error submitting testimonial:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const [modules, setModules] = useState([
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
            title: 'Employee Portal',
            description: 'Personalized task dashboard designed for maximum productivity and focus.',
            icon: 'Target',
            color: 'from-yellow-400 to-orange-500',
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
    ]);

    const [strategicOptions, setStrategicOptions] = useState([
        {
            id: '01',
            title: 'OPTIONS 01',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
            icon: 'Search',
            color: 'text-[#8bc34a]',
            bgColor: 'bg-[#8bc34a]',
            borderColor: 'border-[#8bc34a]'
        },
        {
            id: '02',
            title: 'OPTIONS 02',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
            icon: 'Lightbulb',
            color: 'text-yellow-600',
            bgColor: 'bg-[#FFEE8C]',
            borderColor: 'border-yellow-400'
        },
        {
            id: '03',
            title: 'OPTIONS 03',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
            icon: 'Target',
            color: 'text-[#0288D1]',
            bgColor: 'bg-[#0288D1]',
            borderColor: 'border-[#0288D1]'
        }
    ]);

    const [testimonials, setTestimonials] = useState([
        {
            id: 1,
            name: 'Michael Jackson',
            role: 'CEO Of Company',
            image: '/user1.jpg',
            rating: 5,
            testimonial: 'Lorem ipsum is simply dummy text of the Printing industry Lorem ipsum has been industry\'s',
            highlighted: false
        },
        {
            id: 2,
            name: 'Parvez Hossein',
            role: 'CEO Of Company',
            image: '/user2.jpg',
            rating: 5,
            testimonial: 'Lorem ipsum is simply dummy text of the Printing industry Lorem ipsum has been industry\'s',
            highlighted: true
        },
        {
            id: 3,
            name: 'Shoikot Hasan',
            role: 'CEO Of Company',
            image: '/user3.jpg',
            rating: 5,
            testimonial: 'Lorem ipsum is simply dummy text of the Printing industry Lorem ipsum has been industry\'s',
            highlighted: false
        }
    ]);



    // Helper function to map icon names to icon components
    const getIconComponent = (iconName) => {
        const iconMap = {
            'ShieldCheck': ShieldCheck,
            'LayoutDashboard': LayoutDashboard,
            'Target': Target,
            'Briefcase': Briefcase,
            'Users': Users,
            'Search': Search,
            'Lightbulb': Lightbulb,
            'Zap': Zap,
            'Star': Star,
            'Monitor': Monitor,
            'Smartphone': Smartphone,
            'Layers': Layers,
            'Globe': Globe
        };
        return iconMap[iconName] || ShieldCheck; // Default to ShieldCheck if not found
    };

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-primary-500 selection:text-white overflow-x-clip">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 sm:h-20 flex items-center justify-between">
                    <div className="flex items-center">
                        <img
                            src="/dintask-logo.png"
                            alt="DinTask"
                            className="h-12 sm:h-16 w-auto object-contain"
                        />
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-8">
                        {['Features', 'Pricing', 'About', 'Contact'].map((item) => (
                            <button
                                key={item}
                                onClick={() => {
                                    if (item === 'Contact') navigate('/contact');
                                    else if (item === 'About') document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                                    else document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors uppercase tracking-widest"
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <div className="hidden lg:flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate('/admin/login')} className="font-bold uppercase tracking-widest text-xs text-slate-600 hover:text-yellow-600 hover:bg-yellow-50">
                            Login
                        </Button>
                        <Button onClick={() => navigate('/admin/register')} className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black uppercase tracking-widest text-xs h-11 px-8 rounded-xl shadow-lg shadow-yellow-500/20">
                            Try For Free
                        </Button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-slate-600">
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-8 space-y-6"
                        >
                            {['Features', 'Pricing', 'About', 'Contact'].map((item) => (
                                <button
                                    key={item}
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        if (item === 'Contact') navigate('/contact');
                                        else if (item === 'About') document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                                        else document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="block text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest text-center w-full py-2 hover:text-primary-600 transition-colors"
                                >
                                    {item}
                                </button>
                            ))}
                            <div className="pt-4 flex flex-row gap-2">
                                <Button variant="outline" onClick={() => navigate('/admin/login')} className="flex-1 h-10 rounded-xl font-black uppercase tracking-wider text-[10px] border-slate-200 hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200">
                                    Login
                                </Button>
                                <Button onClick={() => navigate('/admin/register')} className="flex-1 h-10 rounded-xl bg-yellow-400 text-slate-900 font-black uppercase tracking-wider text-[10px] hover:bg-yellow-500">
                                    Sign Up
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section */}
            <section className="sticky top-0 h-screen flex flex-col justify-center pt-24 pb-16 md:pt-36 md:pb-24 px-6 bg-gradient-to-b from-[#FFEE8C] via-[#FFF9C4] to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden z-0 transition-all duration-300">
                {/* Background Blobs - Adjusted for Dark Mode */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FFEE8C]/40 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFEE8C] text-slate-900 font-bold text-xs uppercase tracking-widest mb-8 border border-yellow-200/50"
                    >
                        <Star className="size-3 fill-slate-900" />
                        YOUR COMPLETE CRM PLATFORM
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-8"
                    >
                        <span className="text-yellow-600 block sm:inline">Five powerful</span> <span className="text-blue-600">CRM</span> modules to run your entire <span className="relative inline-block mt-2 sm:mt-0">
                            <span className="relative z-10">business.</span>
                            <motion.span
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 0.8, delay: 0.8, ease: "circOut" }}
                                className="absolute bottom-1 sm:bottom-3 left-0 h-3 sm:h-6 bg-[#FFEE8C] -z-0 -rotate-1 rounded-sm"
                            />
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10"
                    >
                        Access our Sales, Project Management, HR, Finance, and Client Portal modules—all integrated in one platform. Manage your entire business operations without switching between multiple tools. Get started today and transform how you work.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Button onClick={() => navigate('/admin/register')} className="h-14 px-12 rounded-lg bg-yellow-400 border border-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold text-lg shadow-sm transition-all hover:scale-105">
                            Get Started
                        </Button>
                        <Button variant="outline" onClick={() => document.getElementById('tactical').scrollIntoView({ behavior: 'smooth' })} className="h-14 px-8 rounded-full border-2 border-slate-200 hover:border-slate-900 text-slate-900 font-bold text-base hover:bg-transparent transition-all">
                            View Modules
                        </Button>
                    </motion.div>
                </div>
            </section>


            <div className="relative z-10 bg-transparent dark:bg-slate-950 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <section id="about" className="py-20 relative overflow-x-clip border-t border-b border-white/50 bg-gradient-to-b from-[#FFEE8C] via-[#FFF9C4] to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50, y: 20 }}
                            whileInView={{ opacity: 1, x: 0, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <Badge className="bg-black/10 text-black border-none px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-6">
                                {testimonialSection.testimonialBadge}
                            </Badge>
                            <h2 className="text-5xl lg:text-7xl font-black leading-none tracking-tight text-slate-900 mb-4">
                                {testimonialSection.testimonialTitle}
                            </h2>
                            <p className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tight">
                                {testimonialSection.testimonialSubtitle}
                            </p>
                            <p className="text-base text-slate-700 font-medium leading-relaxed max-w-lg mb-8">
                                {testimonialSection.testimonialDescription}
                            </p>
                            <Button
                                onClick={() => navigate('/admin/register')}
                                className="h-14 px-8 bg-black hover:bg-slate-900 text-white rounded-xl font-black text-base shadow-xl group"
                            >
                                {testimonialSection.testimonialCtaText} <ArrowRight className="ml-3 group-hover:translate-x-2" />
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="pl-12 border-l border-slate-900/20 py-4 lg:py-12">
                                <span className="text-7xl font-serif text-slate-900 absolute -left-4 top-0 opacity-20">“</span>
                                <blockquote className="text-2xl lg:text-3xl font-black text-slate-900 italic leading-tight mb-8">
                                    "{testimonialSection.testimonialQuote}"
                                </blockquote>
                                <div className="flex items-center gap-6">
                                    <div className="size-16 rounded-full bg-slate-900 overflow-hidden border-4 border-white shadow-xl">
                                        <img src={testimonialSection.testimonialAuthorImage} alt={testimonialSection.testimonialAuthorName} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-slate-900">{testimonialSection.testimonialAuthorName}</h4>
                                        <p className="text-base font-bold text-slate-700 uppercase tracking-tighter">{testimonialSection.testimonialAuthorRole}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>


                {/* Strategic Options Section - Based on Reference Image */}
                <section className="py-12 sm:py-24 bg-gradient-to-b from-[#FFEE8C] via-[#FFF9C4] to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-x-clip">
                    <div className="max-w-7xl mx-auto px-2 sm:px-6">
                        <div className="grid grid-cols-3 gap-2 sm:gap-16 lg:gap-24">
                            {strategicOptions.slice(0, 3).map((opt, i) => {
                                // Static color and icon mapping - NOT from database
                                const staticConfig = [
                                    {
                                        icon: Search,
                                        color: 'text-[#8bc34a]',
                                        bgColor: 'bg-[#8bc34a]',
                                        borderColor: 'border-[#8bc34a]'
                                    },
                                    {
                                        icon: Lightbulb,
                                        color: 'text-[#00BFA5]',
                                        bgColor: 'bg-[#00BFA5]',
                                        borderColor: 'border-[#00BFA5]'
                                    },
                                    {
                                        icon: ShieldCheck,
                                        color: 'text-[#0288D1]',
                                        bgColor: 'bg-[#0288D1]',
                                        borderColor: 'border-[#0288D1]'
                                    }
                                ];

                                const config = staticConfig[i] || staticConfig[0];
                                const IconComponent = config.icon;

                                return (
                                    <motion.div
                                        key={opt.id || i}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.2 }}
                                        className="relative flex items-center justify-center py-4 sm:py-10"
                                    >
                                        {/* Top-Left Solid Block */}
                                        <div className={`absolute top-0 left-0 w-8 sm:w-32 h-8 sm:h-32 ${config.bgColor} opacity-100 -z-0`} />

                                        {/* Bottom-Right Outlined Frame */}
                                        <div className={`absolute bottom-0 right-0 w-12 sm:w-48 h-12 sm:h-48 border-[2px] sm:border-[6px] ${config.borderColor} -z-0`} />

                                        {/* Main White Card */}
                                        <Card className="w-full bg-white dark:bg-slate-900 border-none shadow-[0_10px_25px_rgba(0,0,0,0.15)] sm:shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-none relative z-10 px-2 sm:px-6 py-4 sm:py-10 text-center">
                                            <div className={`mb-1 sm:mb-4 flex justify-center ${config.color}`}>
                                                <IconComponent className="size-4 sm:size-9" strokeWidth={1.5} />
                                            </div>
                                            <h3 className={`text-[6px] sm:text-xl font-black uppercase tracking-widest mb-1 sm:mb-4 ${config.color}`}>
                                                {opt.title}
                                            </h3>
                                            <p className="text-[5px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
                                                {opt.description}
                                            </p>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Five Powerful Modules Section */}
                <section id="tactical" className="py-24 bg-gradient-to-b from-[#FFEE8C] via-[#FFF9C4] to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden scroll-mt-20">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="mb-16 max-w-4xl mx-auto text-center">
                            <Badge className="bg-[#FFEE8C] text-slate-900 border-none px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest mb-6">
                                Your Complete CRM Platform
                            </Badge>
                            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
                                Five <span className="text-yellow-600">powerful</span> modules to <span className="bg-[#FFEE8C] text-slate-900 px-2 py-1 transform -rotate-1 inline-block rounded-md">run your entire business.</span>
                            </h2>
                            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                                Manage sales, projects, HR, finance, and client relationships from one unified platform. All modules work together seamlessly to power your organization.
                            </p>
                        </div>

                        <div className="relative">
                            {/* Module Content */}
                            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                                {/* Left: Content Card */}
                                <motion.div
                                    key={`content-${activeModule}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 lg:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none h-full flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className={`p-3 rounded-xl ${[
                                                'bg-[#FFEE8C] text-slate-900',
                                                'bg-blue-100 text-blue-600',
                                                'bg-purple-100 text-purple-600',
                                                'bg-amber-100 text-amber-600',
                                                'bg-emerald-100 text-emerald-600'
                                            ][activeModule]
                                                }`}>
                                                {React.createElement([Layers, Target, Users, Briefcase, Globe][activeModule], { size: 28 })}
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${[
                                                'bg-[#FFEE8C]/50 text-yellow-800',
                                                'bg-blue-50 text-blue-700',
                                                'bg-purple-50 text-purple-700',
                                                'bg-amber-50 text-amber-700',
                                                'bg-emerald-50 text-emerald-700'
                                            ][activeModule]
                                                }`}>
                                                {[
                                                    'PM Cloud',
                                                    'Sales Cloud',
                                                    'HR Cloud',
                                                    'Finance Cloud',
                                                    'Client Cloud'
                                                ][activeModule]}
                                            </span>
                                        </div>

                                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                                            {[
                                                'Project Delivery Control Tower',
                                                'Sales Pipeline & CRM Engine',
                                                'Human Resource Management',
                                                'Financial Command Center',
                                                'Client Interaction Portal'
                                            ][activeModule]}
                                        </h3>

                                        <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed">
                                            {[
                                                'Manage projects efficiently with milestone tracking, QA workflows, urgent task escalation, testing readiness, and resource planning from a single delivery dashboard.',
                                                'Track leads, manage deals, and automate follow-ups. Visualize your sales funnel and forecast revenue with precision tools designed for high-performing sales teams.',
                                                'Streamline recruitment, onboarding, and employee management. Handle leave requests, performance reviews, and payroll integration in one secure system.',
                                                'Gain total visibility into your financial health. Manage invoices, expenses, and automated billing while generating real-time financial reports.',
                                                'Give your clients a professional gateway to interact with your business. Share updates, files, and get approvals seamlessly.'
                                            ][activeModule]}
                                        </p>

                                        <div className="inline-block bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 text-sm font-semibold mb-8">
                                            {[
                                                'For Program & Project Managers',
                                                'For Sales Teams & Leaders',
                                                'For HR Managers & Admin',
                                                'For Finance Teams & Accountants',
                                                'For Client Success Managers'
                                            ][activeModule]}
                                        </div>

                                        <ul className="space-y-3">
                                            {[
                                                ['Milestone & sprint intelligence', 'Escalation routing across squads', 'Testing readiness heatmaps', 'Resource allocation & planning', 'Real-time progress monitoring'],
                                                ['Lead scoring & qualification', 'Visual pipeline management', 'Automated email sequences', 'Deal forecasting & analytics', 'Contact activity tracking'],
                                                ['Employee self-service portal', 'Automated onboarding workflows', 'Leave & agile attendance', 'Performance OKRs & KPIs', 'Document management vault'],
                                                ['Automated invoice generation', 'Expense tracking & approval', 'P&L analysis dashboard', 'Multi-currency support', 'Tax automation hooks'],
                                                ['Secure file sharing', 'Project status timeline', 'Ticket & support system', 'Contract digital signing', 'Integrated feedback loops']
                                            ][activeModule].map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <div className="mt-1 size-5 rounded-full bg-[#FFEE8C] dark:bg-yellow-900/30 flex items-center justify-center text-slate-900 dark:text-yellow-400 shrink-0">
                                                        <CheckCircle2 size={12} strokeWidth={3} />
                                                    </div>
                                                    <span className="text-slate-700 dark:text-slate-300 font-medium">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>

                                {/* Right: Image */}
                                <div className="relative h-full min-h-[400px] lg:min-h-[600px]">
                                    <AnimatePresence mode='wait'>
                                        <motion.div
                                            key={`image-${activeModule}`}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.05 }}
                                            transition={{ duration: 0.5 }}
                                            className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-2xl"
                                        >
                                            <img
                                                src={[
                                                    '/src/assets/dashboard_1.png',
                                                    '/src/assets/dashboard_2.png',
                                                    '/src/assets/dashboard_3.png',
                                                    '/src/assets/dashboard_1.png',
                                                    '/src/assets/dashboard_2.png'
                                                ][activeModule]}
                                                alt="Module Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

                                            {/* Optional badges on image like reference if needed */}
                                            <div className="absolute bottom-8 left-8 right-8 text-white">
                                                <div className="flex flex-wrap gap-2">
                                                    {[
                                                        ['Engineering', 'Product', 'Sales', 'Marketing'],
                                                        ['Leads', 'Deals', 'Revenue', 'Growth'],
                                                        ['People', 'Culture', 'Growth', 'Talent'],
                                                        ['Assets', 'Liabilities', 'Equity', 'Cashflow'],
                                                        ['Support', 'Success', 'Feedback', 'Retention']
                                                    ][activeModule].map((tag, i) => (
                                                        <span key={i} className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold">{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Pagination Dots */}
                            <div className="flex justify-start gap-3 mt-12">
                                {[0, 1, 2, 3, 4].map((index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveModule(index)}
                                        className={`h-3 rounded-full transition-all duration-300 ${activeModule === index
                                            ? 'w-12 bg-[#FFEE8C] border border-yellow-200'
                                            : 'w-3 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                                            }`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>







                {/* Platform Access Section */}
                <section className="py-12 bg-gradient-to-b from-[#FFEE8C] via-[#FFF9C4] to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-10">
                            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                                Access your CRM anywhere, anytime.
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400">
                                We provide a comprehensive platform with one powerful admin panel and four dedicated mobile apps, all available for direct download from the Play Store. Manage your business from desktop or on-the-go.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    title: "Admin Panel",
                                    description: "Complete web-based control center",
                                    icon: Monitor,
                                    color: "bg-yellow-400",
                                    iconColor: "text-slate-900"
                                },
                                {
                                    title: "Sales App",
                                    description: "Mobile app for sales app",
                                    icon: Target,
                                    color: "bg-blue-500",
                                    iconColor: "text-white"
                                },
                                {
                                    title: "Project Manager",
                                    description: "Mobile app for project manager",
                                    icon: Layers,
                                    color: "bg-purple-500",
                                    iconColor: "text-white"
                                },
                                {
                                    title: "Employee App",
                                    description: "Mobile app for employee app",
                                    icon: Users,
                                    color: "bg-emerald-500",
                                    iconColor: "text-white"
                                }
                            ].map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                        viewport={{ once: true }}
                                        className="group"
                                    >
                                        <div className="bg-white dark:bg-slate-900 border border-[#FFEE8C] dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center text-center h-full hover:shadow-xl transition-all duration-300 hover:border-yellow-400">
                                            <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mb-4 shadow-lg shadow-yellow-100/50 dark:shadow-none transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-2`}>
                                                <Icon className={`w-8 h-8 ${item.iconColor}`} strokeWidth={2} />
                                            </div>

                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-4 max-w-[200px] text-sm">
                                                {item.description}
                                            </p>

                                            <div className="mt-auto">
                                                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FFEE8C]/30 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 font-bold text-xs">
                                                    {index === 0 ? <Monitor size={14} /> : <Smartphone size={14} />}
                                                    {index === 0 ? "Web Access" : "App Access"}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-12 bg-gradient-to-b from-[#FFEE8C] via-[#FFF9C4] to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                    <div className="max-w-7xl mx-auto px-6">
                        {/* Header + Toggle */}
                        <div className="flex flex-col items-center mb-10">
                            <div className="flex items-center gap-4 text-lg font-medium mb-8">
                                <span className={`${!isAnnual ? 'text-yellow-600 font-bold' : 'text-slate-500'} cursor-pointer`} onClick={() => setIsAnnual(false)}>Monthly</span>
                                <button
                                    onClick={() => setIsAnnual(!isAnnual)}
                                    className={`w-14 h-8 flex items-center bg-slate-200 dark:bg-slate-700 rounded-full p-1 transition-colors duration-300 ${isAnnual ? 'bg-yellow-400' : ''}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isAnnual ? 'translate-x-6' : ''}`} />
                                </button>
                                <span className={`${isAnnual ? 'text-yellow-600 font-bold' : 'text-slate-500'} cursor-pointer`} onClick={() => setIsAnnual(true)}>Yearly</span>
                            </div>
                        </div>

                        {/* Pricing Cards Grid */}
                        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {/* Starter Plan */}
                            <div className="border border-yellow-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-xl shadow-yellow-50/50 dark:shadow-none hover:border-yellow-300 transition-all duration-300 relative flex flex-col">
                                <div className="absolute top-6 left-6">
                                    <span className="bg-[#FFEE8C] text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Starter – CRM + HRMS + TMS</span>
                                </div>

                                <div className="mt-8 mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-2">
                                        CRM, HRMS & Task Management for <span className="text-yellow-600">small teams</span>.
                                    </h3>
                                    <div className="flex items-baseline gap-1 mb-1">
                                        <span className="text-3xl font-bold text-yellow-500">₹{isAnnual ? '1,699' : '1,999'}</span>
                                        <span className="text-slate-500 text-sm">/month</span>
                                    </div>
                                    {isAnnual && (
                                        <div className="text-xs text-slate-400 font-medium">
                                            <span className="line-through mr-2">₹23,988/year</span>
                                            <span className="text-emerald-500">Save ₹3,600 with yearly</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mb-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <CheckCircle2 className="text-emerald-500" size={16} /> Best for small teams
                                </div>

                                <div className="space-y-2 mb-4 flex-1">
                                    {['CRM Lead & Client Management', 'Sales Pipeline & Follow-ups', 'HRMS – Employee Management', 'Attendance & Leave Management', 'Basic Payroll Setup', 'Task & Project Management (TMS)', 'Role & Permission Management', 'Reports & Dashboard'].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full border border-yellow-200 flex items-center justify-center text-yellow-600">
                                                <CheckCircle2 size={12} />
                                            </div>
                                            {feature}
                                        </div>
                                    ))}
                                </div>

                                <Button onClick={() => navigate('/register')} variant="outline" className="w-full border-yellow-300 text-yellow-700 hover:bg-[#FFEE8C]/30 hover:text-yellow-800 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-900/20 font-bold py-3 h-auto">
                                    Get Started
                                </Button>
                            </div>

                            {/* Growth Plan - Featured */}
                            <div className="border-2 border-yellow-200 dark:border-yellow-900/50 rounded-2xl p-6 bg-[#FFEE8C]/20 dark:bg-slate-900 shadow-2xl shadow-yellow-100/50 dark:shadow-none relative flex flex-col transform lg:-translate-y-2 transition-all duration-300">
                                <div className="absolute top-6 left-6">
                                    <span className="bg-[#FFEE8C] text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Growth – CRM + HRMS + TMS</span>
                                </div>

                                <div className="mt-8 mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-2">
                                        CRM, HRMS & Task Management for <span className="text-yellow-600">growing businesses</span>.
                                    </h3>
                                    <div className="flex items-baseline gap-1 mb-1">
                                        <span className="text-4xl font-bold text-yellow-500">₹{isAnnual ? '5,999' : '6,999'}</span>
                                        <span className="text-slate-500 text-sm">/month</span>
                                    </div>
                                    {isAnnual && (
                                        <div className="text-xs text-slate-400 font-medium">
                                            <span className="line-through mr-2">₹83,988/year</span>
                                            <span className="text-emerald-500">Save ₹11,999 with yearly</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mb-8 text-xs font-bold text-amber-500 uppercase tracking-widest">
                                    <Zap className="fill-current" size={16} /> Most Popular
                                </div>

                                <div className="space-y-2 mb-4 flex-1">
                                    {['Full CRM with Leads, Deals & Clients', 'Sales Automation & Follow-ups', 'HRMS – Employee, Attendance & Leave', 'Payroll Management', 'Task, Project & Team Tracking', 'Performance & Productivity Reports', 'Multi-role Access Control', 'Centralized Dashboard'].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200 font-medium">
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-slate-900">
                                                <CheckCircle2 size={12} />
                                            </div>
                                            {feature}
                                        </div>
                                    ))}
                                </div>

                                <Button onClick={() => navigate('/register')} className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-3 h-auto shadow-lg shadow-yellow-200 dark:shadow-none border-0">
                                    Get Started
                                </Button>
                            </div>

                            {/* Enterprise Plan */}
                            <div className="border border-yellow-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-xl shadow-yellow-50/50 dark:shadow-none hover:border-yellow-300 transition-all duration-300 relative flex flex-col">
                                <div className="absolute top-6 left-6">
                                    <span className="bg-[#FFEE8C] text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Enterprise – CRM + HRMS + TMS</span>
                                </div>

                                <div className="mt-8 mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-2">
                                        CRM, HRMS & Task Management platform for <span className="text-yellow-600">large organizations</span>.
                                    </h3>
                                    <div className="flex items-baseline gap-1 mb-1">
                                        <span className="text-3xl font-bold text-yellow-500">₹{isAnnual ? '9,999' : '11,999'}</span>
                                        <span className="text-slate-500 text-sm">/month</span>
                                    </div>
                                    {isAnnual && (
                                        <div className="text-xs text-slate-400 font-medium">
                                            <span className="line-through mr-2">₹143,988/year</span>
                                            <span className="text-emerald-500">Save ₹24,000 with yearly</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mb-8 text-xs font-bold text-purple-500 uppercase tracking-widest">
                                    <Star className="fill-current" size={16} /> Best Value
                                </div>

                                <div className="space-y-2 mb-4 flex-1">
                                    {['Advanced CRM & Sales Management', 'Lead, Deal & Client Automation', 'Complete HRMS Suite', 'Attendance, Leave & Payroll', 'Task, Project & Team Management', 'Advanced Reports & Analytics', 'Role-based Permissions', 'Secure & Scalable Architecture'].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full border border-yellow-200 flex items-center justify-center text-yellow-600">
                                                <CheckCircle2 size={12} />
                                            </div>
                                            {feature}
                                        </div>
                                    ))}
                                </div>

                                <Button onClick={() => navigate('/contact')} variant="outline" className="w-full border-yellow-200 text-yellow-600 hover:bg-[#FFEE8C]/30 hover:text-yellow-700 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-900/20 font-bold py-3 h-auto">
                                    Get Started
                                </Button>
                            </div>
                        </div>

                        <div className="mt-16 text-center text-slate-400 text-sm">
                            Need custom features or enterprise support? Contact us for tailored solutions and dedicated assistance.
                        </div>
                    </div>
                </section>

                {/* Demo CTA Section */}
                <section className="py-20 px-6 relative overflow-x-clip bg-gradient-to-b from-[#FFEE8C] via-[#FFF9C4] to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-slate-900 dark:bg-white rounded-[3rem] p-12 lg:p-24 relative overflow-hidden group">
                            <div className="absolute -bottom-20 -right-20 size-80 bg-yellow-500/20 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000" />

                            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                                <div>
                                    <h2 className="text-5xl lg:text-7xl font-black text-white dark:text-slate-900 tracking-tighter mb-8 leading-none">
                                        {demoCta.demoTitle}
                                    </h2>
                                    <p className="text-xl text-slate-400 dark:text-slate-500 mb-12 max-w-md">
                                        {demoCta.demoDescription}
                                    </p>
                                    <div className="flex flex-row gap-2 sm:gap-4">
                                        <Button onClick={() => navigate('/welcome')} className="h-10 sm:h-16 px-3 sm:px-10 bg-yellow-400 text-slate-900 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-lg whitespace-nowrap hover:bg-yellow-500 transition-colors">
                                            {demoCta.demoCtaPrimary}
                                        </Button>
                                        <Button onClick={() => navigate('/contact')} className="h-10 sm:h-16 px-3 sm:px-10 bg-white text-slate-900 dark:bg-slate-900 dark:text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-lg whitespace-nowrap hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            {demoCta.demoCtaSecondary}
                                        </Button>
                                    </div>
                                </div>
                                <div className="relative translate-y-8 sm:translate-y-12 lg:translate-x-12">
                                    <Monitor className="text-white/10 dark:text-slate-900/5 size-[200px] sm:size-[400px] lg:size-[500px] absolute -right-4 sm:-right-20 -top-24 sm:-top-60" />
                                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                        {[0, 1, 2, 3].map(i => (
                                            <motion.div
                                                key={i}
                                                animate={{ y: [0, -10, 0] }}
                                                transition={{ duration: 4, delay: i * 0.5, repeat: Infinity }}
                                                className="h-20 sm:h-40 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 overflow-hidden relative backdrop-blur-sm"
                                            >
                                                {demoCta.demoFloatingImages && demoCta.demoFloatingImages[i] ? (
                                                    <img src={demoCta.demoFloatingImages[i]} alt="Preview" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                                                ) : (
                                                    <div className="absolute inset-0 p-3 sm:p-6 flex items-end">
                                                        <div className="h-1 sm:h-2 w-1/2 bg-white/20 rounded-full" />
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-12 bg-gradient-to-b from-[#FFEE8C] via-[#FFF9C4] to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                    <div className="max-w-6xl mx-auto px-6">
                        {/* Section Title & Dialog */}
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                User <span className="text-yellow-600">Testimonials</span>
                            </h2>
                            <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="link" className="text-slate-500 hover:text-yellow-600 mt-1 text-sm">Share Your Story</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                    <DialogHeader>
                                        <DialogTitle className="text-slate-900 dark:text-white">Share Your Experience</DialogTitle>
                                        <DialogDescription className="text-slate-500 dark:text-slate-400">
                                            Tell us how DinTask has helped your team.
                                        </DialogDescription>
                                    </DialogHeader>

                                    {submitStatus === 'success' ? (
                                        <div className="py-8 text-center text-green-600">
                                            <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                                            <p className="font-medium">Thank you! Your testimonial has been submitted for review.</p>
                                        </div>
                                    ) : submitStatus === 'error' ? (
                                        <div className="py-8 text-center text-red-600">
                                            <p className="font-medium">Something went wrong. Please try again.</p>
                                            <Button variant="link" onClick={() => setSubmitStatus(null)}>Try Again</Button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmitTestimonial} className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Name</Label>
                                                <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="role" className="text-slate-700 dark:text-slate-300">Role / Company</Label>
                                                <Input id="role" name="role" value={formData.role} onChange={handleChange} required className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-slate-700 dark:text-slate-300">Rating</Label>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            size={24}
                                                            className={`cursor-pointer transition-colors ${star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
                                                            onClick={() => handleRatingChange(star)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="testimonial" className="text-slate-700 dark:text-slate-300">Message</Label>
                                                <Textarea id="testimonial" name="testimonial" value={formData.testimonial} onChange={handleChange} required className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 resize-none h-24" />
                                            </div>
                                            <Button type="submit" disabled={isSubmitting} className="bg-yellow-400 hover:bg-yellow-500 text-slate-900">
                                                {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
                                            </Button>
                                        </form>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Testimonials Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {testimonials.slice(0, 3).map((testimonial, index) => (
                                <motion.div
                                    key={testimonial.id || index}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col h-full hover:shadow-xl transition-all duration-300">
                                        {/* Stars & Content */}
                                        <div className="flex-1 mb-4 text-left">
                                            <div className="flex gap-1 mb-3 text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} fill="currentColor" />
                                                ))}
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed italic">
                                                "{testimonial.testimonial || testimonial.message}"
                                            </p>
                                        </div>

                                        {/* Profile - Bottom Right */}
                                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-800/50 mt-auto">
                                            <div className="text-right">
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{testimonial.name}</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{testimonial.role}</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full p-0.5 border border-yellow-400 flex-shrink-0">
                                                <img
                                                    src={testimonial.image || `https://api.dicebear.com/7.x/initials/svg?seed=${testimonial.name}`}
                                                    alt={testimonial.name}
                                                    className="w-full h-full rounded-full object-cover bg-slate-100"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-20 bg-gradient-to-b from-[#FFEE8C] via-[#FFF9C4] to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="p-2 rounded-full bg-teal-50 text-teal-500">
                                    <HelpCircle size={24} />
                                </div>
                                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Frequently asked questions.
                                </h2>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                                Everything you need to know about getting started with our CRM platform.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div
                                    key={faq.id}
                                    className={`border rounded-2xl transition-all duration-300 overflow-hidden ${openFaq === index
                                        ? 'border-yellow-300 bg-[#FFEE8C]/20 dark:bg-yellow-900/10'
                                        : 'border-slate-100 dark:border-slate-800 hover:border-yellow-200 bg-white dark:bg-slate-900'
                                        }`}
                                >
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full flex items-center p-4 sm:p-6 text-left gap-4 sm:gap-6"
                                    >
                                        <div className={`flex-shrink-0 size-8 sm:size-10 rounded-lg flex items-center justify-center font-bold text-sm sm:text-base transition-colors ${openFaq === index ? 'bg-[#FFEE8C] text-slate-900' : 'bg-[#FFEE8C]/50 text-slate-700'
                                            }`}>
                                            {faq.id}
                                        </div>
                                        <span className="flex-1 font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-lg">
                                            {faq.question}
                                        </span>
                                        <div className={`flex-shrink-0 size-8 sm:size-10 rounded-full flex items-center justify-center transition-all duration-300 ${openFaq === index ? 'bg-[#FFEE8C] text-slate-900 rotate-180' : 'bg-[#FFEE8C]/50 text-slate-700'
                                            }`}>
                                            <ChevronDown size={20} />
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {openFaq === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="px-6 pb-6 pt-0 ml-[3.5rem] sm:ml-[4.5rem]">
                                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Support Section */}
                {/* Contact Support Floating Sidebar */}
                <div className="fixed right-6 bottom-6 z-50 flex flex-col gap-4 pointer-events-none">
                    <div className="pointer-events-auto flex flex-col items-end gap-4">
                        <a
                            href={`tel:${socialContact.contactInfo.phone}`}
                            className="flex items-center gap-4 group transition-all"
                        >
                            <div className="hidden group-hover:block bg-white dark:bg-slate-900 py-2 px-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 mr-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Call Us</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">{socialContact.contactInfo.phone}</p>
                            </div>
                            <div className="p-3 sm:p-4 bg-blue-600 rounded-full text-white shadow-lg shadow-blue-600/30 hover:scale-110 hover:shadow-blue-600/50 transition-all duration-300">
                                <Phone size={20} />
                            </div>
                        </a>

                        <a
                            href={`mailto:${socialContact.contactInfo.email}`}
                            className="flex items-center gap-4 group transition-all"
                        >
                            <div className="hidden group-hover:block bg-white dark:bg-slate-900 py-2 px-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 mr-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Email Us</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">{socialContact.contactInfo.email}</p>
                            </div>
                            <div className="p-3 sm:p-4 bg-red-500 rounded-full text-white shadow-lg shadow-red-500/30 hover:scale-110 hover:shadow-red-500/50 transition-all duration-300">
                                <Mail size={20} />
                            </div>
                        </a>

                        <a
                            href={`https://wa.me/${socialContact.contactInfo.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 group transition-all"
                        >
                            <div className="hidden group-hover:block bg-white dark:bg-slate-900 py-2 px-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 mr-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">WhatsApp</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">Chat with us</p>
                            </div>
                            <div className="p-3 sm:p-4 bg-green-500 rounded-full text-white shadow-lg shadow-green-500/30 hover:scale-110 hover:shadow-green-500/50 transition-all duration-300">
                                <MessageCircle size={20} />
                            </div>
                        </a>
                    </div>
                </div>

                <section className="py-20 overflow-hidden relative border-t border-slate-200 dark:border-slate-800 bg-gradient-to-b from-[#FFEE8C] via-[#FFF9C4] to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="flex flex-col items-center gap-12">
                            {/* Main Featured Image - Mac/Device Mockup Style */}
                            <motion.div
                                key={currentImage}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="relative w-full max-w-5xl mx-auto"
                            >
                                {/* Device Frame */}
                                <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
                                    {/* Screen Header */}
                                    <div className="h-8 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-2">
                                        <div className="size-2.5 rounded-full bg-red-500/20" />
                                        <div className="size-2.5 rounded-full bg-yellow-500/20" />
                                        <div className="size-2.5 rounded-full bg-green-500/20" />
                                    </div>
                                    {/* Screen Content */}
                                    <div className="aspect-video relative bg-slate-950">
                                        <img
                                            src={tacticalContent.showcaseImages[currentImage]}
                                            alt="Dashboard Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Overlay Gradient for depth */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/10 to-transparent pointer-events-none" />
                                    </div>
                                </div>


                            </motion.div>

                            {/* Thumbnail Strip */}
                            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 max-w-full w-full justify-start md:justify-center px-4 no-scrollbar">
                                {[
                                    '/src/assets/dashboard_1.png',
                                    '/src/assets/dashboard_2.png',
                                    '/src/assets/dashboard_3.png',
                                    '/src/assets/dashboard_1.png', // Duplicates for demo length
                                    '/src/assets/dashboard_2.png'
                                ].map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImage(idx % tacticalContent.showcaseImages.length)}
                                        className={`relative flex-shrink-0 w-32 sm:w-48 aspect-video rounded-lg overflow-hidden border-2 transition-all duration-300 group ${currentImage === (idx % tacticalContent.showcaseImages.length)
                                            ? 'border-teal-400 ring-4 ring-teal-400/20 scale-105'
                                            : 'border-slate-700 opacity-60 hover:opacity-100 hover:border-slate-500'
                                            }`}
                                    >
                                        <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className={`absolute inset-0 bg-yellow-500/20 transition-opacity duration-300 ${currentImage === (idx % tacticalContent.showcaseImages.length) ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                                            }`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Social Icons Section */}
                <section className="bg-black border-t border-slate-800 py-12 px-6">
                    <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
                        <h3 className="text-white font-bold tracking-widest uppercase text-sm opacity-70">Follow Us</h3>
                        <div className="flex gap-8">
                            <a href={socialContact.socialLinks.facebook || '#'} target={socialContact.socialLinks.facebook !== '#' ? "_blank" : "_self"} rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors transform hover:scale-110 duration-300">
                                <Facebook size={24} />
                            </a>
                            <a href={socialContact.socialLinks.twitter || '#'} target={socialContact.socialLinks.twitter !== '#' ? "_blank" : "_self"} rel="noopener noreferrer" className="text-slate-400 hover:text-sky-400 transition-colors transform hover:scale-110 duration-300">
                                <Twitter size={24} />
                            </a>
                            <a href={socialContact.socialLinks.youtube || '#'} target={socialContact.socialLinks.youtube !== '#' ? "_blank" : "_self"} rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 transition-colors transform hover:scale-110 duration-300">
                                <Youtube size={24} />
                            </a>
                            <a href={socialContact.socialLinks.linkedin || '#'} target={socialContact.socialLinks.linkedin !== '#' ? "_blank" : "_self"} rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors transform hover:scale-110 duration-300">
                                <Linkedin size={24} />
                            </a>
                            <a href={socialContact.socialLinks.instagram || '#'} target={socialContact.socialLinks.instagram !== '#' ? "_blank" : "_self"} rel="noopener noreferrer" className="text-slate-400 hover:text-pink-500 transition-colors transform hover:scale-110 duration-300">
                                <Instagram size={24} />
                            </a>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-black pt-12 pb-12 px-6">
                    <div className="max-w-7xl mx-auto border-t border-slate-700 pt-16">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 text-center sm:text-left">
                            <div className="col-span-1 sm:col-span-2 lg:col-span-2 space-y-6 sm:space-y-8 flex flex-col items-center sm:items-start">
                                <div className="flex items-center gap-3">
                                    <img src={footerContent.footerLogoUrl || "/dintask-logo.png"} alt="DinTask" className="h-24 sm:h-32 w-24 sm:w-32 object-contain" />
                                    <span className="text-4xl font-black tracking-tighter text-white italic uppercase whitespace-nowrap">
                                        Din<span className="text-yellow-400">Task</span>
                                    </span>
                                </div>
                                <p className="text-slate-400 max-w-sm font-medium leading-relaxed text-sm sm:text-base">
                                    {footerContent.footerDescription}
                                </p>
                                <div className="flex gap-4">
                                    {/* Icons removed as per user request to only show text links */}
                                </div>
                            </div>

                            {/* Link Columns */}
                            {(footerContent.footerLinks || []).map((col, i) => (
                                <div key={col.title || i} className="flex flex-col items-center sm:items-start">
                                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-6 sm:mb-8">{col.title}</h4>
                                    <ul className="space-y-4">
                                        {(col.links || []).map((link, j) => (
                                            <li key={link || j}>
                                                <button
                                                    onClick={() => {
                                                        const pathMap = {
                                                            'Privacy': '/privacy',
                                                            'Terms': '/terms',
                                                            'Cookies': '/cookies',
                                                            'Contact': '/contact'
                                                        };
                                                        if (pathMap[link]) {
                                                            navigate(pathMap[link]);
                                                            window.scrollTo(0, 0);
                                                        } else if (link === 'About') {
                                                            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                                                        } else {
                                                            document.getElementById(link.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
                                                        }
                                                    }}
                                                    className="text-sm font-bold text-slate-400 hover:text-primary-600 transition-colors"
                                                >
                                                    {link}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="mt-24 pt-8 border-t border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                {footerContent.footerCopyright}
                            </p>
                            <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                                <Lock size={12} /> Military Grade Encryption v4.2
                            </div>
                        </div>
                    </div>
                </footer>


            </div >
        </main >
    );
};

const LocksIcon = ({ size }) => <Lock size={size} />;

export default LandingPage;
