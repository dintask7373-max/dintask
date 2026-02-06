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
    FileText,
    Mail,
    Smartphone
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Switch } from "@/shared/components/ui/switch";
import { Separator } from "@/shared/components/ui/separator";
import useAuthStore from '@/store/authStore';
import { fadeInUp, staggerContainer, scaleOnTap } from '@/shared/utils/animations';

const EmployeeProfile = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [isSyncing, setIsSyncing] = useState(false);

    const handleLogout = async () => {
        const logoutPromise = new Promise(resolve => setTimeout(resolve, 1000));

        toast.promise(logoutPromise, {
            loading: 'Logging out...',
            success: 'Logged out successfully',
            error: 'Logout failed',
        });

        await logoutPromise;
        logout();
        // The router will likely redirect to /employee/login automatically due to ProtectedRoute
        // but explicit navigation is safer for UX transitions
        // navigate('/employee/login'); 
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
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-1"
            >
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Profile</h2>
                <p className="text-xs text-slate-500 font-medium">Manage your account & settings</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
            >
                <Card className="border-none shadow-md shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-3xl overflow-hidden relative group">
                    <div className="h-20 bg-primary-600 w-full" />
                    <CardContent className="pt-0 -mt-10 px-6 pb-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-3">
                                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                                    <Avatar className="h-20 w-20 ring-4 ring-white dark:ring-slate-900 shadow-xl">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} />
                                        <AvatarFallback className="bg-primary-600 text-white font-black text-xl">{user?.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="absolute bottom-0 right-0 cursor-pointer"
                                >
                                    <div className="h-7 w-7 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
                                        <Camera size={14} className="text-slate-900 dark:text-white" />
                                    </div>
                                </motion.div>
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{user?.name}</h3>
                            <p className="text-xs text-slate-500 font-medium">Employee • Marketing Team</p>

                            <div className="flex gap-4 mt-6 w-full">
                                <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-tighter">Performance</p>
                                    <div className="flex items-center justify-center gap-1.5 font-black text-slate-900 dark:text-white">
                                        <Star size={14} className="text-amber-400 fill-amber-400" />
                                        <span>4.9</span>
                                    </div>
                                </div>
                                <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-tighter">Tasks Monthly</p>
                                    <div className="font-black text-slate-900 dark:text-white">42</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

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

            <div className="text-center pb-8">
                <p className="text-[10px] text-slate-400 font-medium">Version 1.0.4 (Build 82910)</p>
                <p className="text-[10px] text-slate-400">© 2026 DinTask CRM Inc.</p>
            </div>
        </div>
    );
};

export default EmployeeProfile;
