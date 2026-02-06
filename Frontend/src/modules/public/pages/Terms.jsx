import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

const Terms = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-primary-500 selection:text-white pb-20">
            {/* Header Area */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <img src="/dintask-logo.png" alt="DinTask" className="h-8 w-8" />
                        <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
                            Din<span className="text-primary-600">Task</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="py-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center justify-center size-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 mb-6"
                    >
                        <FileText size={32} />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4"
                    >
                        Terms of Service
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 dark:text-slate-400 font-medium uppercase tracking-[0.2em] text-xs"
                    >
                        Last Updated: February 6, 2026
                    </motion.p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-6 pt-16">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="prose prose-slate dark:prose-invert max-w-none"
                >
                    <div className="space-y-12">
                        <Section
                            title="01 / Agreement to Terms"
                            content="By accessing or using DinTask, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our platform. These terms apply to all visitors, users, and others who access the service."
                        />
                        <Section
                            title="02 / Use of the Platform"
                            content="DinTask is designed for professional business use. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to use the platform in compliance with all applicable laws."
                        />
                        <Section
                            title="03 / Intellectual Property"
                            content="The platform and its original content, features, and functionality are and will remain the exclusive property of DinTask and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent."
                        />
                        <Section
                            title="04 / Technical Limitations"
                            content="While we strive for 100% uptime, you acknowledge that technical issues may occur. We reserve the right to perform maintenance and updates to improve the platform's tactical performance, which may result in temporary unavailability."
                        />
                        <Section
                            title="05 / Termination"
                            content="We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the platform will immediately cease."
                        />
                    </div>
                </motion.div>

                <div className="mt-20 p-10 bg-slate-900 dark:bg-white rounded-[2rem] text-white dark:text-slate-900 text-center">
                    <h3 className="text-2xl font-black mb-4 tracking-tight">Need clarification on our terms?</h3>
                    <p className="text-slate-400 dark:text-slate-500 mb-8 font-medium">Join thousands of companies who trust DinTask's transparent operational framework.</p>
                    <Button
                        onClick={() => navigate('/contact')}
                        className="bg-primary-600 text-white hover:bg-primary-700 font-black uppercase tracking-widest px-8 rounded-xl h-12"
                    >
                        Speak to Sales
                    </Button>
                </div>
            </div>
        </div>
    );
};

const Section = ({ title, content }) => (
    <div className="space-y-4">
        <h2 className="text-xs font-black text-primary-600 uppercase tracking-[0.3em]">{title}</h2>
        <p className="text-lg text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
            {content}
        </p>
    </div>
);

export default Terms;
