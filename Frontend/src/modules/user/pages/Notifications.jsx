import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { Switch } from "@/shared/components/ui/switch";
import { Card, CardContent } from '@/shared/components/ui/card';
import { fadeInUp } from '@/shared/utils/animations';

const Notifications = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen pb-32">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="flex items-center p-4 justify-between max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-lg font-bold">Notifications</h2>
                    <div className="w-10"></div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 pt-8 space-y-12">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Notification Settings</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Customize how and where you receive updates about your tasks, mentions, and account security.
                    </p>
                </motion.div>

                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                        <Bell size={40} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">All caught up!</h3>
                        <p className="text-sm text-slate-400 max-w-xs mx-auto">Your notification preferences are managed by your workspace administrator.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
