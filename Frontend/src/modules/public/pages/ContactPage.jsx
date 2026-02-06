import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    Phone,
    CheckCircle2,
    RefreshCw,
    ArrowLeft,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import useSuperAdminStore from '@/store/superAdminStore';

const ContactPage = () => {
    const navigate = useNavigate();
    const addInquiry = useSuperAdminStore(state => state.addInquiry);

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        businessEmail: '',
        phone: '',
        companyName: '',
        jobTitle: '',
        companySize: '',
        industry: '',
        requirements: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        setTimeout(() => {
            addInquiry({
                ...formData,
                id: `inq-${Date.now()}`,
                date: new Date().toISOString(),
                status: 'new'
            });
            setIsSubmitting(false);
            setIsSubmitted(true);

            setTimeout(() => {
                navigate('/');
            }, 5000);
        }, 1500);
    };

    const steps = [
        { id: 1, title: 'Tell us about your Business', sub: 'Primary contact details' },
        { id: 2, title: 'Tell us about your Business Operations', sub: 'Company & Role info' },
        { id: 3, title: 'Configure your Account Here', sub: 'Final requirements' }
    ];

    return (
        <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 font-sans selection:bg-[#2563EB] selection:text-white flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-6xl flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden min-h-[700px]"
            >
                {/* Left Sidebar - Following Image 4 aesthetic */}
                <div className="w-full md:w-[35%] bg-[#2563EB] p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-16 cursor-pointer" onClick={() => navigate('/')}>
                            <img src="/dintask-logo.png" alt="DinTask" className="h-10 w-10 brightness-0 invert" />
                            <span className="text-2xl font-black tracking-tighter uppercase italic">
                                Din<span className="text-blue-200">Task</span>
                            </span>
                        </div>

                        <div className="space-y-12">
                            {steps.map((step) => (
                                <div key={step.id} className="flex gap-6 relative group">
                                    {/* Line connecting steps */}
                                    {step.id !== 3 && (
                                        <div className={`absolute left-[19px] top-10 w-[2px] h-[calc(100%+20px)] ${currentStep > step.id ? 'bg-white' : 'bg-white/20'}`} />
                                    )}

                                    <div className={`size-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 transition-all duration-300 border-2 ${currentStep >= step.id
                                            ? 'bg-white text-[#2563EB] border-white'
                                            : 'bg-transparent text-white/50 border-white/20'
                                        }`}>
                                        {currentStep > step.id ? <CheckCircle2 size={18} /> : step.id}
                                    </div>

                                    <div>
                                        <h3 className={`text-base font-black tracking-tight leading-tight mb-1 transition-all duration-300 ${currentStep >= step.id ? 'text-white' : 'text-white/40'
                                            }`}>
                                            {step.title}
                                        </h3>
                                        <p className={`text-xs font-bold transition-all duration-300 ${currentStep >= step.id ? 'text-blue-100/70' : 'text-white/20'
                                            }`}>
                                            {step.sub}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 pt-10 border-t border-white/10 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center">
                                <Phone size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Call Us</p>
                                <p className="text-sm font-bold">+91 96738 10691</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center">
                                <Mail size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Email Us</p>
                                <p className="text-sm font-bold">Dintask7373@gmail.com</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Area - Form Content following Image 4 layout */}
                <div className="flex-1 bg-white dark:bg-slate-900 flex flex-col relative">
                    {/* Top Right Header Info */}
                    <div className="absolute top-8 right-10 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:block">
                        Approx Time: 2 Mins
                    </div>

                    {/* Tabs indicator - Purely visual like Image 4 */}
                    <div className="px-10 pt-10 pb-6 flex items-center gap-8 border-b border-slate-50 dark:border-slate-800 overflow-x-auto no-scrollbar">
                        {['General', 'Business', 'Requirements'].map((tab, i) => (
                            <div key={i} className={`text-sm font-black whitespace-nowrap pb-2 border-b-2 transition-all duration-300 ${currentStep === (i + 1)
                                    ? 'text-[#2563EB] border-[#2563EB]'
                                    : 'text-slate-400 border-transparent'
                                }`}>
                                {tab}
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 p-10 overflow-y-auto max-h-[calc(100vh-100px)]">
                        {isSubmitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center space-y-6"
                            >
                                <div className="size-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <CheckCircle2 size={48} />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">COMMUNICATION RECEIVED!</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                                        Our tactical team has received your business requirements. <br />
                                        Expected response window: 12-24 hours.
                                    </p>
                                </div>
                                <Button onClick={() => navigate('/')} className="h-12 px-8 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20">
                                    RETURN TO DASHBOARD
                                </Button>
                            </motion.div>
                        ) : (
                            <form className="space-y-10 max-w-2xl mx-auto">
                                <AnimatePresence mode="wait">
                                    {currentStep === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-8"
                                        >
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Name <span className="text-red-500">*</span></label>
                                                <Input
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="h-12 bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md"
                                                    placeholder="Enter your full name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Business email <span className="text-red-500">*</span></label>
                                                <Input
                                                    name="businessEmail"
                                                    type="email"
                                                    value={formData.businessEmail}
                                                    onChange={handleInputChange}
                                                    className="h-12 bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md"
                                                    placeholder="example@company.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone <span className="text-red-500">*</span></label>
                                                <Input
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="h-12 bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md"
                                                    placeholder="+91 XXXXX XXXXX"
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    {currentStep === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-8"
                                        >
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Company name <span className="text-red-500">*</span></label>
                                                <Input
                                                    name="companyName"
                                                    value={formData.companyName}
                                                    onChange={handleInputChange}
                                                    className="h-12 bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md"
                                                    placeholder="e.g. Acme Corporation"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Job title <span className="text-red-500">*</span></label>
                                                <Input
                                                    name="jobTitle"
                                                    value={formData.jobTitle}
                                                    onChange={handleInputChange}
                                                    className="h-12 bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md"
                                                    placeholder="e.g. Project Manager"
                                                />
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Company size <span className="text-red-500">*</span></label>
                                                    <select
                                                        name="companySize"
                                                        value={formData.companySize}
                                                        onChange={handleInputChange}
                                                        className="w-full h-12 bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 px-4 rounded-md text-sm font-medium focus:ring-1 focus:ring-[#2563EB] outline-none"
                                                    >
                                                        <option value="">Select the range</option>
                                                        <option value="1-10">1-10 Employees</option>
                                                        <option value="11-50">11-50 Employees</option>
                                                        <option value="51-200">51-200 Employees</option>
                                                        <option value="201-500">201-500 Employees</option>
                                                        <option value="500+">500+ Employees</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Industry <span className="text-red-500">*</span></label>
                                                    <select
                                                        name="industry"
                                                        value={formData.industry}
                                                        onChange={handleInputChange}
                                                        className="w-full h-12 bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 px-4 rounded-md text-sm font-medium focus:ring-1 focus:ring-[#2563EB] outline-none"
                                                    >
                                                        <option value="">Select the industry</option>
                                                        <option value="tech">Technology</option>
                                                        <option value="finance">Finance</option>
                                                        <option value="healthcare">Healthcare</option>
                                                        <option value="education">Education</option>
                                                        <option value="manufacturing">Manufacturing</option>
                                                        <option value="others">Others</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {currentStep === 3 && (
                                        <motion.div
                                            key="step3"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-8"
                                        >
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tell us more about your business requirements <span className="text-red-500">*</span></label>
                                                <Textarea
                                                    name="requirements"
                                                    value={formData.requirements}
                                                    onChange={handleInputChange}
                                                    rows={8}
                                                    className="w-full bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 p-4 rounded-md text-sm font-medium focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none resize-none"
                                                    placeholder="Share your specific needs, team size, desired modules..."
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        )}
                    </div>

                    {/* Footer - Dynamic Progress and Navigation like Image 4 */}
                    {!isSubmitted && (
                        <div className="px-10 py-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex flex-col gap-2 w-1/2">
                                <div className="h-2 w-full max-w-[200px] bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: '33.33%' }}
                                        animate={{ width: `${(currentStep / 3) * 100}%` }}
                                        className="h-full bg-[#2563EB]"
                                    />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                    {Math.round((currentStep / 3) * 100)}% COMPLETE
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                {currentStep > 1 && (
                                    <Button
                                        onClick={prevStep}
                                        variant="outline"
                                        className="h-11 px-6 border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all rounded-md"
                                    >
                                        PREVIOUS
                                    </Button>
                                )}
                                {currentStep < 3 ? (
                                    <Button
                                        onClick={nextStep}
                                        className="h-11 px-8 bg-[#2563EB] text-white font-black uppercase text-[10px] tracking-widest hover:bg-[#1d4ed8] transition-all rounded-md flex items-center gap-2 group"
                                    >
                                        NEXT <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="h-11 px-8 bg-[#2563EB] text-white font-black uppercase text-[10px] tracking-widest hover:bg-[#1d4ed8] transition-all rounded-md flex items-center gap-2"
                                    >
                                        {isSubmitting ? <RefreshCw className="animate-spin" size={14} /> : <>SUBMIT REQ <ArrowRight size={14} /></>}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ContactPage;
