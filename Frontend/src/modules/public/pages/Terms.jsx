import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
<<<<<<< HEAD
import axios from 'axios';
=======
import apiRequest from '@/lib/api';
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94

const Terms = () => {
    const navigate = useNavigate();
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
<<<<<<< HEAD
                const response = await axios.get('http://localhost:5000/api/v1/landing-page/terms_service');
                if (response.data.success && response.data.data) {
                    setSections(response.data.data.policySections || []);
=======
                const response = await apiRequest('/landing-page/terms_service');
                if (response.success && response.data) {
                    setSections(response.data.policySections || []);
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
                }
            } catch (error) {
                console.error('Error fetching terms:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    return (
<<<<<<< HEAD
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-primary-500 selection:text-white pb-20">
            {/* Header Area */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
=======
        <div className="min-h-screen bg-gradient-to-b from-[#FFEE8C] via-[#FFF9C4] to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-sans selection:bg-primary-500 selection:text-white pb-20">
            {/* Header Area */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
                <div className="max-w-4xl mx-auto px-6 h-24 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <img src="/dintask-logo.png" alt="DinTask" className="h-18 w-18 sm:h-22 sm:w-22 object-contain" />
                        <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
                            Din<span className="text-primary-600">Task</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
<<<<<<< HEAD
            <div className="py-20 px-6 bg-primary-600 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
=======
            <div className="py-20 px-6 relative overflow-hidden border-b border-yellow-200/50 dark:border-slate-800">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
<<<<<<< HEAD
                        className="inline-flex items-center justify-center mb-6 text-white"
=======
                        className="inline-flex items-center justify-center mb-6 text-slate-900 dark:text-white"
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
                    >
                        <FileText size={64} strokeWidth={1.5} className="drop-shadow-lg" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
<<<<<<< HEAD
                        className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-md"
=======
                        className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-4 drop-shadow-sm"
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
                    >
                        Terms of Service
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
<<<<<<< HEAD
                        className="text-primary-100 font-bold uppercase tracking-[0.2em] text-sm"
=======
                        className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-sm"
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
                    >
                        Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {sections.map((section, index) => (
                                <Section
                                    key={index}
                                    title={section.title}
                                    content={section.content}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>

<<<<<<< HEAD
                <div className="mt-20 p-10 bg-slate-900 dark:bg-white rounded-[2rem] text-white dark:text-slate-900 text-center">
=======
                <div className="mt-20 p-10 bg-slate-900 dark:bg-white rounded-[2rem] text-white dark:text-slate-900 text-center shadow-2xl">
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
                    <h3 className="text-2xl font-black mb-4 tracking-tight">Need clarification on our terms?</h3>
                    <p className="text-slate-400 dark:text-slate-500 mb-8 font-medium">Join thousands of companies who trust DinTask's transparent operational framework.</p>
                    <Button
                        onClick={() => navigate('/contact')}
<<<<<<< HEAD
                        className="bg-primary-600 text-white hover:bg-primary-700 font-black uppercase tracking-widest px-8 rounded-xl h-12"
=======
                        className="bg-yellow-400 text-slate-900 hover:bg-yellow-500 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 font-black uppercase tracking-widest px-8 rounded-xl h-12"
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
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
        <p className="text-lg text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-line">
            {content}
        </p>
    </div>
);

export default Terms;
