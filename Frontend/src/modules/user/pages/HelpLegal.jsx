import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, FileText, HelpCircle, Shield, Info, BookOpen, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

import { Card, CardContent } from '@/shared/components/ui/card';
import { fadeInUp } from '@/shared/utils/animations';

const HelpLegal = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: 'Support',
            items: [
                { icon: <HelpCircle className="text-blue-500" />, label: 'Help Center', sub: 'Guides and tutorials', path: '/employee/profile/help/center' },
            ]
        },
        {
            title: 'Legal',
            items: [
                { icon: <Shield className="text-amber-500" />, label: 'Privacy Policy', sub: 'How we handle your data', path: '/employee/profile/help/privacy' },
                { icon: <FileText className="text-slate-500" />, label: 'Terms of Service', sub: 'Rules for using DinTask', path: '/employee/profile/help/terms' },
            ]
        }
    ];

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen pb-32">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="flex items-center p-4 justify-between max-w-[480px] mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-lg font-bold">Help & Legal</h2>
                    <div className="w-10"></div>
                </div>
            </div>

            <div className="max-w-[480px] mx-auto px-6 pt-4 space-y-8">
                {sections.map((section, idx) => (
                    <motion.div
                        key={idx}
                        variants={fadeInUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="space-y-4"
                    >
                        <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">{section.title}</h3>
                        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                            <CardContent className="p-0 divide-y divide-slate-50 dark:divide-slate-800">
                                {section.items.map((item, i) => (
                                    <div
                                        key={i}
                                        onClick={() => navigate(item.path)}
                                        className="flex items-center justify-between p-4 active:bg-slate-50 dark:active:bg-slate-800 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{item.sub}</p>
                                            </div>
                                        </div>
                                        <ExternalLink size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}

                <div className="text-center pt-8">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Designed with ❤️ for Teams</p>
                    <p className="text-[10px] text-slate-400">DinTask CRM Version 1.0.4</p>
                </div>
            </div>
        </div>
    );
};

export default HelpLegal;
