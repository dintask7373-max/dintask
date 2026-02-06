import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Target,
    ArrowRight,
    ShieldCheck,
    Briefcase,
    ChevronRight,
    CheckCircle2,
    Zap,
    Star,
    Monitor,
    Smartphone,
    Layers,
    Lock,
    Globe,
    Search,
    Lightbulb,
    Menu,
    X
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

const LandingPage = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeModule, setActiveModule] = useState(0);
    const [currentImage, setCurrentImage] = useState(0);

    const showcaseImages = [
        '/src/assets/dashboard_1.png',
        '/src/assets/dashboard_2.png',
        '/src/assets/dashboard_3.png',
    ];

    React.useEffect(() => {
        // Ensure body is scrollable when landing page mounts
        document.body.style.overflow = 'auto';
        document.body.style.overflowX = 'hidden';

        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % showcaseImages.length);
        }, 3000);
        return () => {
            clearInterval(timer);
        };
    }, []);

    const modules = [
        {
            id: 'admin',
            title: 'Admin Console',
            description: 'Centralized control center to manage managers, employees, and overall system health.',
            icon: ShieldCheck,
            color: 'from-blue-600 to-indigo-600',
            features: ['Manager Oversight', 'Employee Directory', 'System Analytics', 'Permission Controls']
        },
        {
            id: 'manager',
            title: 'Manager Station',
            description: 'Powerful tools for task delegation, team progress monitoring, and schedule management.',
            icon: LayoutDashboard,
            color: 'from-purple-600 to-pink-600',
            features: ['Task Delegation', 'Performance Metrics', 'Team Chat', 'Real-time Sync']
        },
        {
            id: 'employee',
            title: 'Employee Portal',
            description: 'Personalized task dashboard designed for maximum productivity and focus.',
            icon: Target,
            color: 'from-emerald-500 to-teal-600',
            features: ['Task List', 'Calendar Sync', 'Personal Notes', 'Quick Actions']
        },
        {
            id: 'sales',
            title: 'Sales & CRM',
            description: 'Track leads, manage pipelines, and close deals with our integrated CRM suite.',
            icon: Briefcase,
            color: 'from-amber-500 to-orange-600',
            features: ['Lead Management', 'Sales Pipeline', 'Follow-up Scheduler', 'Client Portal']
        }
    ];

    const plans = [
        {
            name: "Free",
            price: "$0",
            duration: "Forever",
            description: "Everything you need to get started.",
            features: ["Personal Tasks", "Basic Calendar", "Storage 5GB", "1 Workspace"],
            cta: "Get Started",
            variant: "outline"
        },
        {
            name: "Pro",
            price: "$12",
            duration: "member / month",
            description: "Perfect for growing teams.",
            features: ["Everything in Free", "Advanced CRM", "Google SSO", "Unlimited Storage"],
            cta: "Upgrade Now",
            variant: "default",
            popular: true
        },
        {
            name: "Pro Plus",
            price: "$29",
            duration: "member / month",
            description: "Advanced tactical operations.",
            features: ["Everything in Pro", "Custom Branding", "Priority Support", "Advanced API"],
            cta: "Go Pro Plus",
            variant: "default"
        },
        {
            name: "Enterprise",
            price: "Custom",
            duration: "for large scale",
            description: "For organizations needing more.",
            features: ["Everything in Pro Plus", "Dedicated Manager", "SLA Support", "SSO & SCIM"],
            cta: "Contact Sales",
            variant: "outline"
        }
    ];

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-primary-500 selection:text-white overflow-x-clip">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/dintask-logo.png" alt="DinTask" className="h-24 sm:h-28 w-24 sm:w-28 object-contain" />
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
                        <Button variant="ghost" onClick={() => navigate('/admin/login')} className="font-bold uppercase tracking-widest text-xs">
                            Login
                        </Button>
                        <Button onClick={() => navigate('/admin/login')} className="bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest text-xs h-11 px-8 rounded-xl shadow-lg shadow-primary-500/20">
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
                                <Button variant="outline" onClick={() => navigate('/admin/login')} className="flex-1 h-10 rounded-xl font-black uppercase tracking-wider text-[10px] border-slate-200">
                                    Login
                                </Button>
                                <Button onClick={() => navigate('/admin/login')} className="flex-1 h-10 rounded-xl bg-primary-600 text-white font-black uppercase tracking-wider text-[10px]">
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
                            Your work, <br />
                            <span className="text-primary-600">Powered</span> by <br />
                            our life's work.
                        </h1>
                        <p className="text-[10px] sm:text-xs md:text-base lg:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6 md:mb-12 max-w-lg">
                            An all-in-one workspace designed to break down silos and boost efficiency. Experience total control over your business operations.
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
                                            <button onClick={() => navigate('/admin/login')} className="px-2 sm:px-3 py-1 sm:py-1.5 bg-primary-600 text-white text-[7px] sm:text-[8px] font-black rounded-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-90 uppercase tracking-widest">FREE TRY</button>
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
                                                        <module.icon size={24} />
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

            {/* Strategic Options Section - Based on Reference Image */}
            <section className="py-12 sm:py-24 bg-white dark:bg-slate-950 overflow-x-clip">
                <div className="max-w-7xl mx-auto px-2 sm:px-6">
                    <div className="grid grid-cols-3 gap-2 sm:gap-16 lg:gap-24">
                        {[
                            {
                                id: '01',
                                icon: Search,
                                color: 'text-[#8bc34a]',
                                bg: 'bg-[#8bc34a]',
                                border: 'border-[#8bc34a]',
                            },
                            {
                                id: '02',
                                icon: Lightbulb,
                                color: 'text-[#00BFA5]',
                                bg: 'bg-[#00BFA5]',
                                border: 'border-[#00BFA5]',
                            },
                            {
                                id: '03',
                                icon: Target,
                                color: 'text-[#0288D1]',
                                bg: 'bg-[#0288D1]',
                                border: 'border-[#0288D1]',
                            }
                        ].map((opt, i) => (
                            <motion.div
                                key={opt.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="relative flex items-center justify-center py-4 sm:py-10"
                            >
                                {/* Top-Left Solid Block */}
                                <div className={`absolute top-0 left-0 w-8 sm:w-32 h-8 sm:h-32 ${opt.bg} opacity-100 -z-0`} />

                                {/* Bottom-Right Outlined Frame */}
                                <div className={`absolute bottom-0 right-0 w-12 sm:w-48 h-12 sm:h-48 border-[2px] sm:border-[6px] ${opt.border} -z-0`} />

                                {/* Main White Card */}
                                <Card className="w-full bg-white dark:bg-slate-900 border-none shadow-[0_10px_25px_rgba(0,0,0,0.15)] sm:shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-none relative z-10 px-2 sm:px-6 py-4 sm:py-10 text-center">
                                    <div className={`mb-1 sm:mb-4 flex justify-center ${opt.color}`}>
                                        <opt.icon className="size-4 sm:size-9" strokeWidth={1.5} />
                                    </div>
                                    <h3 className={`text-[6px] sm:text-xl font-black uppercase tracking-widest mb-1 sm:mb-4 ${opt.color}`}>
                                        OPTIONS {opt.id}
                                    </h3>
                                    <p className="text-[5px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                                    </p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Product Slider Section - Refined Tactical Interface */}
            <section id="tactical" className="py-24 bg-white dark:bg-slate-950 overflow-x-clip scroll-mt-20">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Centered Header */}
                    <div className="text-center mb-20">
                        <Badge className="bg-primary-600/10 text-primary-600 border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest mb-4">
                            Tactical Preview
                        </Badge>
                        <h2 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-8 leading-[1.1]">
                            The Tactical <span className="text-primary-600 italic">Interface.</span>
                        </h2>
                        <div className="flex justify-center gap-2">
                            {showcaseImages.map((_, i) => (
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
                                <source src="/team-meeting-animation.mp4" type="video/mp4" />
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
                                                    src={showcaseImages[currentImage]}
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



            {/* Testimonial inspired by Image 1 */}
            <section id="about" className="py-20 bg-[#ffcc00] relative overflow-x-clip">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50, y: 20 }}
                        whileInView={{ opacity: 1, x: 0, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <Badge className="bg-black/10 text-black border-none px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-6">
                            All-in-one suite
                        </Badge>
                        <h2 className="text-5xl lg:text-7xl font-black leading-none tracking-tight text-slate-900 mb-4">
                            DinTask One
                        </h2>
                        <p className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tight">
                            The operating system for business.
                        </p>
                        <p className="text-base text-slate-700 font-medium leading-relaxed max-w-lg mb-8">
                            Run your entire business on DinTask with our unified cloud software, designed to help you break down silos between departments and increase organizational efficiency.
                        </p>
                        <Button className="h-14 px-8 bg-black hover:bg-slate-900 text-white rounded-xl font-black text-base shadow-xl group">
                            TRY DINTASK ONE <ArrowRight className="ml-3 group-hover:translate-x-2" />
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
                                "You can be a startup, mid-sized company, or an enterprise - DinTask One is a boon for all. It transformed our workflow across India."
                            </blockquote>
                            <div className="flex items-center gap-6">
                                <div className="size-16 rounded-full bg-slate-900 overflow-hidden border-4 border-white shadow-xl">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rishi" alt="CEO" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-900">Rishi Sir</h4>
                                    <p className="text-base font-bold text-slate-700 uppercase tracking-tighter">Founder & CEO, DinTask</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>



            {/* Pricing Section */}
            <section id="pricing" className="relative py-16 bg-slate-50 dark:bg-slate-950 overflow-hidden scroll-mt-20">
                {/* Background Two-Tone */}
                < div className="absolute top-0 left-0 w-full h-[50%] bg-[#6374f2] dark:bg-[#4f5ed9]" />

                <div className="max-w-6xl mx-auto px-6 relative z-10 text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-4">
                            Flexible Plans & Pricing
                        </h2>
                        <p className="text-white/80 text-sm max-w-xl mx-auto font-medium opacity-70 leading-relaxed">
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry and has been the standard ever since.
                        </p>
                    </motion.div>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {plans.map((plan, i) => (
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
                                                {plan.name === 'Enterprise' ? 'Custom' : `₹${parseInt(plan.price.replace('$', '')) * 80 || 0}`}
                                            </span>
                                            {plan.name !== 'Enterprise' && (
                                                <span className="text-[7px] sm:text-xs font-medium text-slate-400 uppercase tracking-tighter">/ month</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Features List */}
                                    <div className="space-y-1.5 sm:space-y-3 mb-4 sm:mb-8 flex-1 w-full text-left border-t border-slate-100 dark:border-slate-800 pt-3 sm:pt-6">
                                        {plan.features.map(f => (
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
                                        onClick={() => plan.cta === 'Contact Sales' ? navigate('/contact') : navigate('/employee/register')}
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
                                    Ready to experience the <span className="text-primary-600 italic">Command Center?</span>
                                </h2>
                                <p className="text-xl text-slate-400 dark:text-slate-500 mb-12 max-w-md">
                                    Join thousands of managers who have optimized their workforce with DinTask's integrated suite.
                                </p>
                                <div className="flex flex-row gap-2 sm:gap-4">
                                    <Button onClick={() => navigate('/admin/login')} className="h-10 sm:h-16 px-3 sm:px-10 bg-primary-600 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-lg whitespace-nowrap hover:bg-primary-700 transition-colors">
                                        START FREE TRIAL
                                    </Button>
                                    <Button onClick={() => navigate('/contact')} className="h-10 sm:h-16 px-3 sm:px-10 bg-white text-slate-900 dark:bg-slate-900 dark:text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-lg whitespace-nowrap hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        BOOK A DEMO
                                    </Button>
                                </div>
                            </div>
                            <div className="relative translate-y-8 sm:translate-y-12 lg:translate-x-12">
                                <Monitor className="text-white/10 dark:text-slate-900/5 size-[200px] sm:size-[400px] lg:size-[500px] absolute -right-4 sm:-right-20 -top-24 sm:-top-60" />
                                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <motion.div
                                            key={i}
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 4, delay: i * 0.5, repeat: Infinity }}
                                            className="h-20 sm:h-40 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 p-3 sm:p-6 flex items-end backdrop-blur-sm"
                                        >
                                            <div className="h-1 sm:h-2 w-1/2 bg-white/20 rounded-full" />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 dark:bg-slate-950 pt-32 pb-12 px-6">
                <div className="max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800 pt-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 text-center sm:text-left">
                        <div className="col-span-1 sm:col-span-2 lg:col-span-2 space-y-6 sm:space-y-8 flex flex-col items-center sm:items-start">
                            <div className="flex items-center gap-3">
                                <img src="/dintask-logo.png" alt="DinTask" className="h-16 sm:h-20 w-16 sm:w-20 object-contain" />
                                <span className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white italic uppercase whitespace-nowrap">
                                    Din<span className="text-primary-600">Task</span>
                                </span>
                            </div>
                            <p className="text-slate-500 max-w-sm font-medium leading-relaxed text-sm sm:text-base">
                                Empowering teams with tactical workspace solutions since 2026. Built by engineers, for engineers.
                            </p>
                            <div className="flex gap-4">
                                {/* Icons removed as per user request to only show text links */}
                            </div>
                        </div>

                        {/* Link Columns */}
                        {[
                            { title: 'Product', links: ['Features', 'Pricing'] },
                            { title: 'Company', links: ['About', 'Contact'] },
                            { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies'] }
                        ].map(col => (
                            <div key={col.title} className="flex flex-col items-center sm:items-start">
                                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-6 sm:mb-8">{col.title}</h4>
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
                                                className="text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors"
                                            >
                                                {link}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="mt-24 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            © 2026 DinTask Inc. All rights reserved.
                        </p>
                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                            <Lock size={12} /> Military Grade Encryption v4.2
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
};

const LocksIcon = ({ size }) => <Lock size={size} />;

export default LandingPage;
