import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

const Privacy = () => {
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
                        <img src="/src/assets/dintask_logo_-removebg-preview.png" alt="DinTask" className="h-8 w-8" />
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
                        <Shield size={32} />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4"
                    >
                        Privacy Policy
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
                            title="01 / Introduction"
                            content="At DinTask, your privacy is our priority. This Privacy Policy explains how we collect, use, and protect your information when you use our tactical workspace solutions. We are committed to maintaining the highest standards of data security and transparency."
                        />
                        <Section
                            title="02 / Information Collection"
                            content="We collect information that you provide directly to us when you create an account, such as your name, email address, and company details. We also collect data related to your usage of the platform to provide a personalized and efficient experience."
                        />
                        <Section
                            title="03 / Data Security"
                            content="We implement military-grade encryption (v4.2) and industry-leading security protocols to safeguard your data. Your information is stored on secure servers with restricted access, ensuring that your business intelligence remains confidential."
                        />
                        <Section
                            title="04 / Information Sharing"
                            content="DinTask does not sell or lease your personal information to third parties. We may share data with trusted service providers who assist us in operating our platform, provided they adhere to strict confidentiality agreements."
                        />
                        <Section
                            title="05 / Your Rights"
                            content="You have the right to access, update, or delete your personal information at any time. If you wish to exercise these rights, please contact our support team through the integrated chat or email."
                        />
                    </div>
                </motion.div>

                <div className="mt-20 p-10 bg-primary-600 rounded-[2rem] text-white text-center">
                    <h3 className="text-2xl font-black mb-4">Have questions about your privacy?</h3>
                    <p className="text-primary-100 mb-8 font-medium">Our tactical support team is here to help you understand our data practices.</p>
                    <Button
                        onClick={() => navigate('/contact')}
                        className="bg-white text-primary-600 hover:bg-slate-50 font-black uppercase tracking-widest px-8 rounded-xl h-12"
                    >
                        Contact Support
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

export default Privacy;
