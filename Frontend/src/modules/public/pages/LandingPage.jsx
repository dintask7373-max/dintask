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
    X
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
            color: 'text-[#00BFA5]',
            bgColor: 'bg-[#00BFA5]',
            borderColor: 'border-[#00BFA5]'
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
                <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                    <div className="flex items-center">
                        <img
                            src="/dintask-logo.png"
                            alt="DinTask"
                            className="h-20 sm:h-24 w-auto object-contain"
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
                        <Button variant="ghost" onClick={() => navigate('/welcome')} className="font-bold uppercase tracking-widest text-xs">
                            Login
                        </Button>
                        <Button onClick={() => navigate('/welcome')} className="bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest text-xs h-11 px-8 rounded-xl shadow-lg shadow-primary-500/20">
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
                                <Button variant="outline" onClick={() => navigate('/welcome')} className="flex-1 h-10 rounded-xl font-black uppercase tracking-wider text-[10px] border-slate-200">
                                    Login
                                </Button>
                                <Button onClick={() => navigate('/welcome')} className="flex-1 h-10 rounded-xl bg-primary-600 text-white font-black uppercase tracking-wider text-[10px]">
                                    Sign Up
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section */}
            <section className="pt-20 md:pt-40 pb-12 md:pb-24 px-4 md:px-6 overflow-x-clip bg-white dark:bg-slate-950 relative">
                <div className="max-w-7xl mx-auto grid grid-cols-2 gap-4 sm:gap-12 md:gap-16 lg:gap-24 items-start">
                    {/* Left Side: Strategic Ecosystem Infographic */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="flex flex-col"
                    >

                        <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[0.9] tracking-tighter mb-4 md:mb-8 italic">
                            {heroContent.heroTitle.split('\n').map((line, index) => (
                                <React.Fragment key={index}>
                                    {line.includes('Powered') ? (
                                        <>
                                            {line.split('Powered')[0]}
                                            <span className="text-primary-600">Powered</span>
                                            {line.split('Powered')[1]}
                                        </>
                                    ) : (
                                        line
                                    )}
                                    {index < heroContent.heroTitle.split('\n').length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </h1>
                        <p className="text-[10px] sm:text-xs md:text-base lg:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6 md:mb-12 max-w-lg">
                            {heroContent.heroSubtitle}
                        </p>
                        {/* Strategic Ecosystem Infographic */}
                        <div id="features" className="relative mt-4 md:mt-16 h-[220px] sm:h-[350px] md:h-[520px] w-[250%] md:w-full group scale-[0.4] sm:scale-[0.6] md:scale-[0.8] lg:scale-[0.85] origin-left flex scroll-mt-24">
                            {/* Left Side: The Infographic Core */}
                            <div className="relative w-full md:max-w-[500px]">
                                {/* Infographic Path (Semi-circle) */}
                                <div className="absolute left-[-40px] top-1/2 -translate-y-1/2 w-64 h-[480px] border-[3px] border-dashed border-primary-200 dark:border-primary-900/30 rounded-r-full -z-0" />

                                {/* Digital Core Branding */}
                                <div className="absolute left-[-60px] top-1/2 -translate-y-1/2 z-10">
                                    <div className="size-32 sm:size-44 rounded-full bg-white dark:bg-slate-900 border-[8px] sm:border-[10px] border-slate-50 dark:border-slate-800 shadow-[20px_20px_60px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center text-center p-4 sm:p-6 relative overflow-hidden group/core">
                                        <div className="absolute inset-0 bg-primary-600/5" />
                                        <span className="text-[8px] sm:text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-1 sm:mb-2">Ecosystem</span>
                                        <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-none tracking-tighter italic">Din<span className="text-primary-600">Task</span></span>

                                        <div className="mt-2 sm:mt-4 flex flex-col gap-1 sm:gap-2">
                                            <button onClick={() => navigate('/welcome')} className="px-2 sm:px-3 py-1 sm:py-1.5 bg-primary-600 text-white text-[7px] sm:text-[8px] font-black rounded-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-90 uppercase tracking-widest">FREE TRY</button>
                                            <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="px-2 sm:px-3 py-1 sm:py-1.5 border border-primary-600 text-primary-600 text-[7px] sm:text-[8px] font-black rounded-lg hover:bg-primary-50 dark:hover:bg-slate-800 transition-all active:scale-90 uppercase tracking-widest">BUY NOW</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Tactical Modules - Nodes & Capsules */}
                                <div className="ml-24 h-full flex flex-col justify-between py-10 relative z-10">
                                    {modules.map((module, idx) => (
                                        <div
                                            key={module.id}
                                            className="relative flex items-center"
                                            onMouseEnter={() => setActiveModule(idx)}
                                        >
                                            <motion.button
                                                className={`relative flex items-center gap-8 group/item transition-all duration-500 ${activeModule === idx ? 'translate-x-6' : 'opacity-60 hover:opacity-100 hover:translate-x-2'
                                                    }`}
                                            >
                                                <div className={`absolute left-[-24px] top-1/2 w-20 h-[2px] bg-gradient-to-r ${activeModule === idx ? 'from-primary-600 to-transparent' : 'from-slate-200 dark:from-slate-800 to-transparent'
                                                    } -z-10`} />

                                                <div className={`size-10 sm:size-12 rounded-full flex items-center justify-center text-xs sm:text-sm font-black transition-all duration-700 border-2 relative ${activeModule === idx
                                                    ? 'bg-primary-600 text-white border-primary-400 shadow-[0_0_30px_rgba(99,116,242,0.3)] ring-8 ring-primary-500/5'
                                                    : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'
                                                    }`}>
                                                    0{idx + 1}
                                                </div>

                                                <div className={`flex items-center gap-4 sm:gap-6 px-6 sm:px-10 py-3 sm:py-5 rounded-[2.5rem] transition-all duration-500 w-[240px] sm:w-[320px] md:w-[380px] border-2 relative overflow-hidden ${activeModule === idx
                                                    ? 'bg-primary-600 border-primary-400 shadow-2xl translate-x-1'
                                                    : 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'
                                                    }`}>
                                                    <div className={`size-10 flex items-center justify-center transition-all ${activeModule === idx ? 'text-white' : `text-slate-400`
                                                        }`}>
                                                        {React.createElement(getIconComponent(module.icon), { size: 24 })}
                                                    </div>
                                                    <div className="text-left flex-1">
                                                        <h3 className={`text-xs font-black uppercase tracking-[0.15em] ${activeModule === idx ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{module.title}</h3>
                                                        <AnimatePresence>
                                                            {activeModule === idx && (
                                                                <motion.p
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    className="text-[10px] font-bold text-primary-50 line-clamp-1 mt-1 opacity-80"
                                                                >
                                                                    {module.description}
                                                                </motion.p>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                    {activeModule === idx && <ChevronRight className="text-white/50" size={18} />}
                                                </div>
                                            </motion.button>

                                            {/* Parallel Information - Background Style */}
                                            <AnimatePresence>
                                                {activeModule === idx && (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 10 }}
                                                        className="absolute left-[400px] sm:left-[380px] md:left-[480px] lg:left-[580px] w-[480px] sm:w-[350px] md:w-[450px] lg:w-[450px] block"
                                                    >
                                                        <div className="relative">
                                                            {/* Ghostly Watermark Title */}
                                                            <div className="absolute -top-10 sm:-top-20 -left-6 lg:-left-10 text-[3rem] sm:text-[6rem] lg:text-[10rem] font-black text-slate-100 dark:text-slate-800/20 uppercase tracking-tighter opacity-50 -z-10 pointer-events-none select-none">
                                                                {module.title.split(' ')[0]}
                                                            </div>

                                                            <div className="space-y-3 sm:space-y-6 lg:space-y-8">
                                                                <div className="space-y-1 sm:space-y-3">
                                                                    <div className="flex items-center gap-2 sm:gap-4 mb-1 sm:mb-3">
                                                                        <div className="h-[1px] sm:h-[3px] w-6 lg:w-12 bg-primary-600" />
                                                                        <span className="text-[6px] sm:text-[10px] lg:text-[13px] font-black text-primary-600 uppercase tracking-[0.2em]">TACTICAL SPECS</span>
                                                                    </div>
                                                                    <p className="text-[8px] sm:text-lg lg:text-xl font-bold text-slate-500 dark:text-slate-400 leading-tight uppercase tracking-tight">
                                                                        {module.description}
                                                                    </p>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-y-2 sm:gap-y-4 gap-x-3 sm:gap-x-8">
                                                                    {module.features.map((feat, fIdx) => (
                                                                        <div key={fIdx} className="flex flex-col border-l-2 border-slate-100 dark:border-slate-800 pl-2 lg:pl-4 hover:border-primary-500 transition-colors">
                                                                            <span className="text-[5px] sm:text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5 sm:mb-1.5">0{fIdx + 1}</span>
                                                                            <span className="text-[6px] sm:text-[11px] lg:text-[13px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-tight line-clamp-1">{feat}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Side: Video Content - Restored */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="relative pt-0 sm:pt-6 md:pt-12"
                    >
                        <div className="relative z-10">
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-auto object-contain rounded-2xl sm:rounded-[3rem]"
                            >
                                <source src="/meeting-animation.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Testimonial inspired by Image 1 */}
            <section id="about" className="py-20 relative overflow-x-clip border-t border-b border-white/10" style={{ backgroundColor: testimonialSection.testimonialBgColor }}>
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
                            onClick={() => navigate('/welcome')}
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

            {/* Testimonials Section */}
            <section className="py-12 bg-slate-50 dark:bg-slate-900 border-t border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Section Title */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            User <span className="text-primary-600">Testimonials</span>
                        </h2>

                        <div className="mt-4">
                            <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="rounded-full border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20">Share Your Story</Button>
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
                                            <Button type="submit" disabled={isSubmitting} className="bg-primary-600 hover:bg-primary-700 text-white">
                                                {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
                                            </Button>
                                        </form>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Testimonials with Scroll Buttons */}
                    <div className="relative">
                        {/* Left Scroll Button */}
                        <button
                            onClick={() => {
                                const container = document.getElementById('testimonials-container');
                                container.scrollBy({ left: -350, behavior: 'smooth' });
                            }}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 shadow-lg transition-all hidden md:block"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        {/* Right Scroll Button */}
                        <button
                            onClick={() => {
                                const container = document.getElementById('testimonials-container');
                                container.scrollBy({ left: 350, behavior: 'smooth' });
                            }}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 shadow-lg transition-all hidden md:block"
                        >
                            <ChevronRight size={24} />
                        </button>

                        {/* Scrollable Testimonials */}
                        <div id="testimonials-container" className="overflow-x-auto pb-4 scroll-smooth">
                            <div className="flex gap-6 justify-center px-12 md:px-20">
                                {testimonials.map((testimonial, index) => (
                                    <motion.div
                                        key={testimonial.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex-shrink-0 w-80"
                                    >
                                        <Card className={`p-6 text-center h-full transition-transform duration-300 ${testimonial.highlighted
                                            ? 'bg-primary-600 border-primary-500 shadow-xl scale-105'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg'
                                            }`}>
                                            {/* Profile Image */}
                                            <div className="relative inline-block mb-3">
                                                <div className={`w-20 h-20 rounded-full overflow-hidden border-3 ${testimonial.highlighted
                                                    ? 'border-white'
                                                    : 'border-primary-600'
                                                    } mx-auto`}>
                                                    <img
                                                        src={testimonial.image}
                                                        alt={testimonial.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'https://ui-avatars.com/api/?name=' + testimonial.name + '&size=80&background=random';
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Rating Stars */}
                                            <div className="flex justify-center gap-0.5 mb-2">
                                                {[...Array(testimonial.rating)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={12}
                                                        className={testimonial.highlighted ? 'fill-white text-white' : 'fill-primary-600 text-primary-600'}
                                                    />
                                                ))}
                                            </div>

                                            {/* Name & Role */}
                                            <h3 className={`text-base font-black mb-0.5 ${testimonial.highlighted
                                                ? 'text-white'
                                                : 'text-slate-900 dark:text-white'
                                                }`}>
                                                {testimonial.name}
                                            </h3>
                                            <p className={`text-xs font-medium mb-4 ${testimonial.highlighted
                                                ? 'text-primary-100'
                                                : 'text-slate-500 dark:text-slate-400'
                                                }`}>
                                                {testimonial.role}
                                            </p>

                                            {/* Quote Icon */}
                                            <div className="mb-2">
                                                <span className={`text-4xl font-black ${testimonial.highlighted
                                                    ? 'text-white/20'
                                                    : 'text-primary-600/20'
                                                    }`}>
                                                    &ldquo;
                                                </span>
                                            </div>

                                            {/* Testimonial Text */}
                                            <p className={`text-xs leading-relaxed line-clamp-3 ${testimonial.highlighted
                                                ? 'text-white/90'
                                                : 'text-slate-600 dark:text-slate-300'
                                                }`}>
                                                {testimonial.testimonial}
                                            </p>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Strategic Options Section - Based on Reference Image */}
            <section className="py-12 sm:py-24 bg-white dark:bg-slate-950 overflow-x-clip">
                <div className="max-w-7xl mx-auto px-2 sm:px-6">
                    <div className="grid grid-cols-3 gap-2 sm:gap-16 lg:gap-24">
                        {strategicOptions.map((opt, i) => {
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
                                    key={opt.id}
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

            {/* Product Slider Section - Refined Tactical Interface */}
            <section id="tactical" className="py-24 bg-white dark:bg-slate-950 overflow-x-clip scroll-mt-20">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Centered Header */}
                    <div className="text-center mb-20">
                        <Badge className="bg-primary-600/10 text-primary-600 border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest mb-4">
                            {tacticalContent.tacticalSubtitle}
                        </Badge>
                        <h2 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-8 leading-[1.1]">
                            {tacticalContent.tacticalTitle}
                        </h2>
                        <div className="flex justify-center gap-2">
                            {tacticalContent.showcaseImages.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${currentImage === i ? 'w-10 bg-primary-600' : 'w-3 bg-slate-200 dark:bg-slate-800'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:gap-8 md:gap-16 items-center">
                        {/* Left Side: Video (No background/card) */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative overflow-hidden w-full mx-auto"
                        >
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-auto object-contain mix-blend-multiply dark:mix-blend-normal"
                            >
                                <source src={tacticalContent.tacticalVideoUrl || "/team-meeting-animation.mp4"} type="video/mp4" />
                            </video>
                        </motion.div>

                        <div className="space-y-6">

                            <div className="relative h-[300px] lg:h-[450px] w-full">
                                <AnimatePresence mode='wait'>
                                    <motion.div
                                        key={currentImage}
                                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        className="absolute inset-0 h-full w-full"
                                    >
                                        {/* Browser Frame Style */}
                                        <div className="w-full h-full rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
                                            {/* Handlebar/Header */}
                                            <div className="h-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center px-3 gap-1">
                                                <div className="size-1.5 rounded-full bg-red-400/50" />
                                                <div className="size-1.5 rounded-full bg-amber-400/50" />
                                                <div className="size-1.5 rounded-full bg-emerald-400/50" />
                                            </div>
                                            <div className="relative flex-1 overflow-hidden">
                                                <img
                                                    src={tacticalContent.showcaseImages[currentImage]}
                                                    alt="Dashboard Preview"
                                                    className="w-full h-full object-cover object-top"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-6">
                                                    <div>
                                                        <p className="text-[8px] font-black text-primary-400 uppercase tracking-widest mb-0.5">Module 0{currentImage + 1}</p>
                                                        <h3 className="text-sm font-black text-white italic tracking-tighter">Live System Analytics</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </section>







            {/* Pricing Section */}
            <section id="pricing" className="relative py-16 bg-slate-50 dark:bg-slate-950 overflow-hidden scroll-mt-20">
                {/* Background Two-Tone */}
                < div className="absolute top-0 left-0 w-full h-[50%]" style={{ backgroundColor: pricingContent.pricingBgColor }} />

                <div className="max-w-6xl mx-auto px-6 relative z-10 text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-4">
                            {pricingContent.pricingTitle}
                        </h2>
                        <p className="text-white/80 text-sm max-w-xl mx-auto font-medium opacity-70 leading-relaxed">
                            {pricingContent.pricingDescription}
                        </p>
                    </motion.div>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {(pricingContent.plans || []).map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                        >
                            <Card className={`h-full border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 rounded-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl`}>
                                <CardContent className="px-3 sm:px-6 py-6 sm:py-8 flex flex-col h-full items-center text-center">
                                    {/* Header */}
                                    <h3 className="text-[7px] sm:text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-2 sm:mb-4">{plan.name}</h3>

                                    {/* Enhanced Icon - No Background */}
                                    <div className="mb-3 sm:mb-6 flex items-center justify-center text-primary-600">
                                        {i === 0 && <Users className="size-6 sm:size-10" strokeWidth={1.5} />}
                                        {i === 1 && <Target className="size-6 sm:size-10" strokeWidth={1.5} />}
                                        {i === 2 && <Zap className="size-6 sm:size-10" strokeWidth={1.5} />}
                                        {i === 3 && <Briefcase className="size-6 sm:size-10" strokeWidth={1.5} />}
                                    </div>

                                    {/* Price */}
                                    <div className="mb-3 sm:mb-6">
                                        <div className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1">
                                            <span className="text-sm sm:text-3xl font-bold text-slate-800 dark:text-white">
                                                {plan.name === 'Enterprise' ? 'Custom' : `${plan.price}`}
                                            </span>
                                            {plan.name !== 'Enterprise' && (
                                                <span className="text-[7px] sm:text-xs font-medium text-slate-400 uppercase tracking-tighter">/ {plan.duration || 'month'}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Features List */}
                                    <div className="space-y-1.5 sm:space-y-3 mb-4 sm:mb-8 flex-1 w-full text-left border-t border-slate-100 dark:border-slate-800 pt-3 sm:pt-6">
                                        {(plan.features || []).map(f => (
                                            <div key={f} className="flex items-start gap-1.5 sm:gap-3">
                                                <div className="size-3 sm:size-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                                                    <CheckCircle2 className="size-2 sm:size-[10px]" />
                                                </div>
                                                <span className="text-[8px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-tight">{f}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                        onClick={() => plan.cta === 'Contact Sales' ? navigate('/contact', { state: { plan: 'Enterprise', source: 'pricing_page' } }) : navigate('/welcome')}
                                        variant={plan.variant}
                                        className={`w-full h-8 sm:h-11 rounded-md font-bold text-[7px] sm:text-[10px] uppercase tracking-widest transition-all duration-300 ${plan.popular || i === 0
                                            ? 'bg-[#6374f2] hover:bg-[#4f5ed9] text-white shadow-md'
                                            : 'border border-[#6374f2] sm:border-2 text-[#6374f2] bg-transparent hover:bg-[#6374f2] hover:text-white'
                                            }`}
                                    >
                                        {plan.cta}
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Demo CTA Section */}
            <section className="py-20 px-6 relative overflow-x-clip">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-slate-900 dark:bg-white rounded-[3rem] p-12 lg:p-24 relative overflow-hidden group">
                        <div className="absolute -bottom-20 -right-20 size-80 bg-primary-600/20 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000" />

                        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-5xl lg:text-7xl font-black text-white dark:text-slate-900 tracking-tighter mb-8 leading-none">
                                    {demoCta.demoTitle}
                                </h2>
                                <p className="text-xl text-slate-400 dark:text-slate-500 mb-12 max-w-md">
                                    {demoCta.demoDescription}
                                </p>
                                <div className="flex flex-row gap-2 sm:gap-4">
                                    <Button onClick={() => navigate('/welcome')} className="h-10 sm:h-16 px-3 sm:px-10 bg-primary-600 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-lg whitespace-nowrap hover:bg-primary-700 transition-colors">
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
            <section className="py-12 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Section Title */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            User <span className="text-primary-600">Testimonials</span>
                        </h2>

                        <div className="mt-4">
                            <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="rounded-full border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20">Share Your Story</Button>
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
                                            <Button type="submit" disabled={isSubmitting} className="bg-primary-600 hover:bg-primary-700 text-white">
                                                {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
                                            </Button>
                                        </form>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Testimonials with Scroll Buttons */}
                    <div className="relative">
                        {/* Left Scroll Button */}
                        <button
                            onClick={() => {
                                const container = document.getElementById('testimonials-container');
                                container.scrollBy({ left: -350, behavior: 'smooth' });
                            }}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 shadow-lg transition-all hidden md:block"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        {/* Right Scroll Button */}
                        <button
                            onClick={() => {
                                const container = document.getElementById('testimonials-container');
                                container.scrollBy({ left: 350, behavior: 'smooth' });
                            }}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 shadow-lg transition-all hidden md:block"
                        >
                            <ChevronRight size={24} />
                        </button>

                        {/* Scrollable Testimonials */}
                        <div id="testimonials-container" className="overflow-x-auto pb-4 scroll-smooth">
                            <div className="flex gap-6 justify-center px-12 md:px-20">
                                {testimonials.map((testimonial, index) => (
                                    <motion.div
                                        key={testimonial.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex-shrink-0 w-80"
                                    >
                                        <Card className={`p-6 text-center h-full transition-transform duration-300 ${testimonial.highlighted
                                            ? 'bg-primary-600 border-primary-500 shadow-xl scale-105'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg'
                                            }`}>
                                            {/* Profile Image */}
                                            <div className="relative inline-block mb-3">
                                                <div className={`w-20 h-20 rounded-full overflow-hidden border-3 ${testimonial.highlighted
                                                    ? 'border-white'
                                                    : 'border-primary-600'
                                                    } mx-auto`}>
                                                    <img
                                                        src={testimonial.image}
                                                        alt={testimonial.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'https://ui-avatars.com/api/?name=' + testimonial.name + '&size=80&background=random';
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Rating Stars */}
                                            <div className="flex justify-center gap-0.5 mb-2">
                                                {[...Array(testimonial.rating)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={12}
                                                        className={testimonial.highlighted ? 'fill-white text-white' : 'fill-primary-600 text-primary-600'}
                                                    />
                                                ))}
                                            </div>

                                            {/* Name & Role */}
                                            <h3 className={`text-base font-black mb-0.5 ${testimonial.highlighted
                                                ? 'text-white'
                                                : 'text-slate-900 dark:text-white'
                                                }`}>
                                                {testimonial.name}
                                            </h3>
                                            <p className={`text-xs font-medium mb-4 ${testimonial.highlighted
                                                ? 'text-primary-100'
                                                : 'text-slate-500 dark:text-slate-400'
                                                }`}>
                                                {testimonial.role}
                                            </p>

                                            {/* Quote Icon */}
                                            <div className="mb-2">
                                                <span className={`text-4xl font-black ${testimonial.highlighted
                                                    ? 'text-white/20'
                                                    : 'text-primary-600/20'
                                                    }`}>
                                                    &ldquo;
                                                </span>
                                            </div>

                                            {/* Testimonial Text */}
                                            <p className={`text-xs leading-relaxed line-clamp-3 ${testimonial.highlighted
                                                ? 'text-white/90'
                                                : 'text-slate-600 dark:text-slate-300'
                                                }`}>
                                                {testimonial.testimonial}
                                            </p>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
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
                                    Din<span className="text-primary-600">Task</span>
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
                        {(footerContent.footerLinks || []).map(col => (
                            <div key={col.title} className="flex flex-col items-center sm:items-start">
                                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-6 sm:mb-8">{col.title}</h4>
                                <ul className="space-y-4">
                                    {col.links.map(link => (
                                        <li key={link}>
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

            {/* Fixed Contact Widget */}
            <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 p-3 bg-slate-900/90 backdrop-blur-xl rounded-l-2xl border-l border-t border-b border-slate-700/50 shadow-2xl animate-in slide-in-from-right duration-700">
                <a
                    href={`tel:${socialContact.contactInfo.phone}`}
                    className="p-3 bg-blue-600 rounded-full text-white hover:scale-110 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all duration-300 group relative"
                    title="Call Us"
                >
                    <Phone size={20} className="relative z-10" />
                    <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Call Us
                    </span>
                </a>
                <a
                    href={`mailto:${socialContact.contactInfo.email}`}
                    className="p-3 bg-red-500 rounded-full text-white hover:scale-110 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-300 group relative"
                    title="Email Us"
                >
                    <Mail size={20} className="relative z-10" />
                    <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Email Us
                    </span>
                </a>
                <a
                    href={`https://wa.me/${socialContact.contactInfo.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-green-500 rounded-full text-white hover:scale-110 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all duration-300 group relative"
                    title="WhatsApp"
                >
                    <MessageCircle size={20} className="relative z-10" />
                    <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        WhatsApp
                    </span>
                </a>
            </div>
        </main >
    );
};

const LocksIcon = ({ size }) => <Lock size={size} />;

export default LandingPage;
