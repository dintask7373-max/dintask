import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { Switch } from "@/shared/components/ui/switch";
import { Card, CardContent } from '@/shared/components/ui/card';
import { fadeInUp } from '@/shared/utils/animations';

import useNotificationStore from '@/store/notificationStore';

const Notifications = () => {
    const navigate = useNavigate();
    const { notifications, fetchNotifications, markAsRead, markAllAsRead, loading } = useNotificationStore();

    React.useEffect(() => {
        fetchNotifications();
    }, []);

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen pb-32">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center p-4 justify-between max-w-4xl mx-auto">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="text-xl font-black uppercase tracking-tight">Notifications</h2>
                    </div>
                    {notifications.some(n => !n.isRead) && (
                        <button
                            onClick={markAllAsRead}
                            className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700"
                        >
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 pt-8 space-y-6">
                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : notifications.length > 0 ? (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <motion.div
                                key={notification._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${notification.isRead
                                        ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-70'
                                        : 'bg-white dark:bg-slate-900 border-primary-100 dark:border-primary-900/30 shadow-sm'
                                    }`}
                            >
                                <div className="flex gap-4">
                                    <div className={`mt-1 size-2 rounded-full shrink-0 ${notification.isRead ? 'bg-slate-300' : 'bg-primary-500'}`} />
                                    <div className="space-y-1">
                                        <h4 className={`text-sm font-bold ${notification.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                            {notification.title}
                                        </h4>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                            {notification.message}
                                        </p>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pt-2">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                            <Bell size={40} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">All caught up!</h3>
                            <p className="text-sm text-slate-400 max-w-xs mx-auto">You have no new notifications.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
