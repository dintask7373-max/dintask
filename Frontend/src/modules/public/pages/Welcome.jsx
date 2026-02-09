import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    ShieldCheck,
    ArrowRight,
    Info,
    X,
    LayoutGrid,
    Briefcase,
    Users,
    BarChart3,
    Shield,
    CheckCircle2,
    Clock,
    Zap
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';
import useSuperAdminStore from '@/store/superAdminStore';

const Welcome = () => {
    const navigate = useNavigate();
    const [showIntel, setShowIntel] = useState(false);
    const { systemIntel, fetchSystemIntel } = useSuperAdminStore();

    useEffect(() => {
        fetchSystemIntel();
    }, []);

    const baseModuleDetails = [
        {
            role: 'Admin',
            icon: Shield,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            title: 'Strategic Command',
            process: 'Infrastructure Oversight -> Resource Allocation -> Performance Intelligence',
            flow: [
                'Manage entire workspace hierarchy (Managers, Sales, Employees)',
                'Oversee global subscription and billing infrastructure',
                'Analyze enterprise-level reports and analytics',
                'Execute high-level system configurations and security protocols'
            ],
            features: ['Fleet Management', 'Billing Core', 'Global Analytics', 'Secure Comms']
        },
        {
            role: 'Manager',
            icon: Briefcase,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            title: 'Execution Orchestrator',
            process: 'Project Definition -> Task Delegation -> Velocity Monitoring',
            flow: [
                'Create and manage complex project roadmaps',
                'Intelligent task distribution to team subordinates',
                'Real-time tracking of team progress and sprint velocity',
                'Generate departmental performance reports'
            ],
            features: ['Project Ops', 'Task Delegation', 'Team Pulse', 'Sprint Reports']
        },
        {
            role: 'Sales',
            icon: BarChart3,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            title: 'Revenue Architect',
            process: 'Lead Acquisition -> Deal Negotiation -> Conversion Success',
            flow: [
                'Full lifecycle Deal & Client Relationship Management',
                'Navigate tactical CRM Pipeline (Leads to Closed-Won)',
                'Monitor revenue velocity and performance targets',
                'Automated follow-up protocols and scheduling'
            ],
            features: ['Deal Pipeline', 'Client Matrix', 'Revenue Intel', 'Schedule Sync']
        },
        {
            role: 'Employee',
            icon: Users,
            color: 'text-primary-500',
            bg: 'bg-primary-500/10',
            title: 'Operational Specialist',
            process: 'Personal Backlog -> Task Execution -> Progress Deployment',
            flow: [
                'Manage personal task backlog and priorities',
                'Execute assigned operational objectives',
                'Update personal performance metrics and daily logs',
                'Engage with team synchronization protocols'
            ],
            features: ['Task Home', 'Personal Notes', 'Activity Log', 'Sync Portal']
        },
        {
            role: 'SuperAdmin',
            icon: ShieldCheck,
            color: 'text-purple-600',
            bg: 'bg-purple-600/10',
            title: 'Root Commander',
            process: 'System Initialization -> Global Governance -> Platform Intelligence',
            flow: [
                'Complete authority over platform-wide configurations',
                'Manage all enterprise accounts and subscription plans',
                'Monitor global system health and security audits',
                'Analyze aggregate platform performance and growth'
            ],
            features: ['Root Access', 'Plan Factory', 'Global Metrics', 'Audit logs']
        }
    ];

    // Merge dynamic intel into base details
    const moduleDetails = baseModuleDetails.map(base => {
        const dynamic = systemIntel?.find(item => item.role === base.role);
        if (!dynamic) return base;

        return {
            ...base,
            ...dynamic,
            icon: base.icon // Force keep the static frontend icon component
        };
    });

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
            style={{
                backgroundImage: 'url("/WLCOMPAGE .png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                fontFamily: '"Plus Jakarta Sans", sans-serif'
            }}
        >
            {/* Subtle Gradient Overlay for dynamic contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>

            {/* Top-Right Controls */}
            <div className="absolute top-6 right-6 md:top-12 md:right-12 z-50 flex items-center gap-3 md:gap-5">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                >
                    <button
                        onClick={() => setShowIntel(true)}
                        className="size-10 md:size-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-2xl group"
                    >
                        <Info size={20} className="md:size-24 group-hover:rotate-12 transition-transform" />
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-white/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            Sector Intel
                        </span>
                    </button>
                </motion.div>
            </div>

            {/* Top-Left Branding */}
            <motion.div
                initial={{ opacity: 0, x: -20, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8 }}
                onClick={() => navigate('/')}
                className="absolute top-0 -left-2 z-50 flex items-center gap-1 cursor-pointer group p-0"
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img
                        src="/dintask-logo.png"
                        alt="DinTask"
                        className="h-20 md:h-28 w-auto object-contain drop-shadow-2xl group-hover:scale-105 transition-transform"
                    />
                </div>
                <span className="text-lg md:text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Din<span className="text-primary-400">Task</span>
                </span>
            </motion.div>

            <div className="relative z-10 w-full max-w-2xl px-6 text-center">
                {/* Welcome Text */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 1 }}
                    className="mb-8 md:mb-14"
                >
                    <h1 className="text-5xl md:text-8xl font-black text-white mb-4 md:mb-6 tracking-tighter drop-shadow-[0_8px_30px_rgba(0,0,0,0.5)] leading-[0.9]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        Welcome <span className="block text-primary-400 text-3xl md:text-5xl mt-2 md:mt-4 font-extrabold uppercase tracking-[0.25em] drop-shadow-md">Home Base</span>
                    </h1>
                    <p className="text-white text-lg md:text-2xl font-semibold max-w-xl mx-auto drop-shadow-[0_2px_8_rgba(0,0,0,0.8)] leading-relaxed italic opacity-90 px-4">
                        Maximize operational efficiency with tactical precision.
                    </p>
                </motion.div>

                {/* Action Buttons */}
                <div className="grid gap-3 sm:gap-6 sm:grid-cols-2 max-w-lg mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                    >
                        <Button
                            onClick={() => navigate('/employee/login')}
                            className="w-full h-14 md:h-20 bg-white/95 text-slate-900 hover:bg-white rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center gap-0.5 md:gap-1 group transition-all duration-500 border-none shadow-[0_10px_30px_rgba(0,0,0,0.2)] md:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-2xl hover:-translate-y-1 active:scale-95 backdrop-blur-md"
                        >
                            <div className="flex items-center gap-2">
                                <User size={18} className="text-primary-600 md:size-6" />
                                <span className="font-extrabold uppercase tracking-[0.15em] text-xs md:text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>Employee Portal</span>
                            </div>
                            <span className="text-[9px] md:text-[11px] font-bold text-slate-500 uppercase tracking-tighter flex items-center gap-1 opacity-80 group-hover:opacity-100 italic">
                                Access Workspace <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform md:size-3" />
                            </span>
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                    >
                        <Button
                            onClick={() => navigate('/sales/login')}
                            className="w-full h-14 md:h-20 bg-primary-600 text-white hover:bg-primary-500 rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center gap-0.5 md:gap-1 group transition-all duration-500 border-none shadow-[0_10px_30px_rgba(99,116,242,0.2)] md:shadow-[0_20px_50px_rgba(99,116,242,0.3)] hover:shadow-2xl hover:-translate-y-1 active:scale-95"
                        >
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={18} className="md:size-6" />
                                <span className="font-extrabold uppercase tracking-[0.15em] text-xs md:text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>Sales Portal</span>
                            </div>
                            <span className="text-[9px] md:text-[11px] font-bold text-primary-200 uppercase tracking-tighter flex items-center gap-1 opacity-80 group-hover:opacity-100 italic">
                                Tactical Login <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform md:size-3" />
                            </span>
                        </Button>
                    </motion.div>
                </div>

                {/* Footer Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1 }}
                    className="mt-12 md:mt-20"
                >
                    <button
                        onClick={() => navigate('/')}
                        className="text-white/60 hover:text-white text-sm font-black uppercase tracking-[0.4em] transition-all hover:tracking-[0.5em] drop-shadow-md"
                        style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                        [ Visit Website ]
                    </button>
                </motion.div>
            </div>

            {/* System Intel Overlay */}
            <AnimatePresence>
                {showIntel && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-white/98 dark:bg-slate-950/95 backdrop-blur-3xl overflow-y-auto px-6 py-12 transition-colors duration-500"
                    >
                        <div className="max-w-6xl mx-auto">
                            {/* Overlay Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-14 border-b border-slate-200 dark:border-white/10 pb-6 md:pb-10 gap-6 md:gap-4 px-2 relative">
                                <div className="space-y-2 md:space-y-1 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-5">
                                        <LayoutGrid className="text-primary-600 dark:text-primary-500 size-10 md:size-14" />
                                        <h2 className="text-3xl sm:text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                                            Infrastructure <span className="text-primary-600 dark:text-primary-500">Intel</span>
                                        </h2>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.15em] md:tracking-[0.3em] text-[8px] sm:text-[10px] md:text-xs max-w-md md:max-w-none mx-auto md:mx-0">
                                        DinTask Neural Framework v4.0 • Strategic Module Breakdown
                                    </p>
                                </div>
                                <div className="flex items-center gap-6 md:gap-10 self-center md:self-auto shrink-0 transition-all">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setShowIntel(false);
                                            navigate('/');
                                        }}
                                        className="text-slate-900 dark:text-white text-[10px] md:text-xs font-black uppercase tracking-[0.3em] flex flex-col items-start gap-1 group relative transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Zap size={14} className="text-primary-600 dark:text-primary-400" />
                                            <span>Visit Website</span>
                                        </div>
                                        <div className="h-[2px] w-full bg-primary-600/60 dark:bg-primary-500/60 group-hover:bg-primary-600 dark:group-hover:bg-primary-500 transition-colors" />
                                    </motion.button>
                                </div>

                                {/* Absolute Close Button */}
                                <button
                                    onClick={() => setShowIntel(false)}
                                    className="absolute -top-2 -right-2 md:top-0 md:right-0 p-2 text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-all group"
                                >
                                    <X className="size-6 md:size-8 group-hover:rotate-90 transition-transform duration-300" />
                                </button>
                            </div>

                            {/* Role Grid */}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                {moduleDetails.map((module, idx) => (
                                    <motion.div
                                        key={module.role}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 + 0.2 }}
                                        className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[2.5rem] p-8 flex flex-col items-start gap-6 group hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-all hover:-translate-y-2 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] dark:shadow-none"
                                    >
                                        <div className={cn("size-16 rounded-3xl flex items-center justify-center", module.bg)}>
                                            <module.icon className={cn("size-8", module.color)} />
                                        </div>

                                        <div className="space-y-1">
                                            <span className={cn("text-[10px] font-black uppercase tracking-widest", module.color)}>
                                                {module.role} Entity
                                            </span>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                                {module.title}
                                            </h3>
                                        </div>

                                        <div className="space-y-4 w-full">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Zap size={10} className="text-amber-500" /> Tactical Process
                                                </p>
                                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 italic leading-relaxed">
                                                    {module.process}
                                                </p>
                                            </div>

                                            <div className="h-px w-full bg-slate-100 dark:bg-white/10" />

                                            <div className="space-y-3">
                                                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Core Workflow</p>
                                                <ul className="space-y-2">
                                                    {module.flow.map((item, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
                                                            <CheckCircle2 size={12} className={cn("mt-0.5 shrink-0", module.color)} />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="pt-4 flex flex-wrap gap-2">
                                                {module.features.map((f, i) => (
                                                    <span key={i} className="px-2 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                        {f}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-6 w-full">
                                            <Button
                                                className={cn(
                                                    "w-full h-11 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 text-white border-none shadow-lg",
                                                    module.role === 'Admin' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' :
                                                        module.role === 'Manager' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20' :
                                                            module.role === 'Sales' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' :
                                                                'bg-primary-600 hover:bg-primary-700 shadow-primary-500/20'
                                                )}
                                                onClick={() => {
                                                    setShowIntel(false);
                                                    navigate(`/${module.role.toLowerCase()}/login`);
                                                }}
                                            >
                                                Initialize Access
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* System Status Footer */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="mt-16 flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-[2rem] bg-primary-50 dark:bg-primary-600/10 border border-primary-100 dark:border-primary-600/20 shadow-sm"
                            >
                                <div className="flex items-center gap-4 text-center md:text-left">
                                    <div className="size-12 rounded-full bg-primary-600 flex items-center justify-center text-white animate-pulse shadow-lg shadow-primary-500/30">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">System Operational Integrity: 100%</p>
                                        <p className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em]">All tactical modules verified and synchronized for deployment</p>
                                    </div>
                                </div>
                                <div className="text-[9px] font-mono text-slate-400 dark:text-primary-400/60 uppercase tracking-widest">
                                    Cipher: DT-SEC-BETA-004-99
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 p-12 hidden lg:block">
                <div className="size-24 border-t-2 border-r-2 border-white/20 rounded-tr-[3rem]"></div>
            </div>
            <div className="absolute bottom-0 left-0 p-12 hidden lg:block">
                <div className="size-24 border-b-2 border-l-2 border-white/20 rounded-bl-[3rem]"></div>
            </div>
        </div>
    );
};

export default Welcome;
