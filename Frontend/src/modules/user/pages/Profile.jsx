import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Bell,
    Shield,
    LogOut,
    ChevronRight,
    Camera,
    Star,
    Zap,
    HelpCircle,
    FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import useAuthStore from '@/store/authStore';

const EmployeeProfile = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        const logoutPromise = new Promise(resolve => setTimeout(resolve, 1000));

        toast.promise(logoutPromise, {
            loading: 'Logging out...',
            success: 'Logged out successfully',
            error: 'Logout failed',
        });

        await logoutPromise;
        logout();
    };

    const menuItems = [
        { icon: <User size={18} className="text-blue-500" />, label: 'Personal Information', sub: 'Name, email, and phone', path: '/employee/profile/account' },
        { icon: <Bell size={18} className="text-amber-500" />, label: 'Notification Settings', sub: 'App, email & desktop', path: '/employee/profile/notifications' },
        { icon: <Shield size={18} className="text-emerald-500" />, label: 'Security & Password', sub: '2FA and credentials', path: '/employee/profile/security' },
        { icon: <Zap size={18} className="text-purple-500" />, label: 'Workspace Preferences', sub: 'Dark mode and localization', path: '/employee/profile/preferences' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="px-4 pt-6 pb-32 space-y-6">
            {/* Profile Header Card */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="border-none shadow-lg shadow-amber-500/20 dark:shadow-none bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 rounded-3xl overflow-hidden">
                    <CardContent className="p-8">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-4">
                                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                                    <Avatar className="h-24 w-24 ring-4 ring-white/30 shadow-2xl">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} />
                                        <AvatarFallback className="bg-white/20 text-white font-black text-2xl">{user?.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="absolute bottom-0 right-0 cursor-pointer"
                                >
                                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-lg">
                                        <Camera size={16} className="text-primary-600" />
                                    </div>
                                </motion.div>
                            </div>

                            <h3 className="text-xl font-black text-white leading-tight mb-1">{user?.name}</h3>
                            <p className="text-sm text-white/80 font-medium mb-6">Employee • Marketing Team</p>

                            {/* Stats Row */}
                            <div className="flex gap-8 w-full justify-center">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1.5 font-black text-white mb-1">
                                        <Star size={16} className="text-amber-400 fill-amber-400" />
                                        <span className="text-xl">4.9</span>
                                    </div>
                                    <p className="text-xs text-white/70 font-medium">Performance</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-black text-white mb-1">42</p>
                                    <p className="text-xs text-white/70 font-medium">Tasks Monthly</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Settings Section */}
            <motion.div
                className="space-y-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={containerVariants}
            >
                <motion.h3 variants={itemVariants} className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Settings</motion.h3>
                <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                    <CardContent className="p-0 divide-y divide-slate-50 dark:divide-slate-800">
                        {menuItems.map((item, i) => (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                onClick={() => navigate(item.path)}
                                className="flex items-center justify-between p-4 active:bg-slate-50 dark:active:bg-slate-800 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:scale-110 transition-transform duration-300">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</p>
                                        <p className="text-[10px] text-slate-400">{item.sub}</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-slate-300 group-hover:text-primary-500 transition-colors" />
                            </motion.div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Privacy & Support */}
            <motion.div
                className="space-y-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={containerVariants}
            >
                <motion.h3 variants={itemVariants} className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Privacy & Support</motion.h3>
                <div className="grid grid-cols-2 gap-4">
                    <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/employee/profile/help')}>
                        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden p-4 h-full cursor-pointer group">
                            <HelpCircle size={20} className="text-primary-500 mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-xs font-bold">Help Center</p>
                        </Card>
                    </motion.div>
                    <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/employee/profile/help')}>
                        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden p-4 h-full cursor-pointer group">
                            <FileText size={20} className="text-slate-400 mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-xs font-bold">Legal Info</p>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>

            {/* Logout Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
            >
                <Button
                    variant="ghost"
                    className="w-full h-14 rounded-2xl text-red-500 font-bold bg-white dark:bg-slate-900 shadow-sm border-none mb-6 hover:bg-red-50 dark:hover:bg-red-900/10 active:scale-[0.98] transition-all"
                    onClick={handleLogout}
                >
                    <LogOut size={20} className="mr-2" />
                    Sign Out
                </Button>
            </motion.div>

            {/* Footer */}
            <div className="text-center pb-8">
                <p className="text-[10px] text-slate-400 font-medium">Version 1.0.4 (Build 82910)</p>
                <p className="text-[10px] text-slate-400">© 2026 DinTask CRM Inc.</p>
            </div>
        </div>
    );
};

export default EmployeeProfile;
