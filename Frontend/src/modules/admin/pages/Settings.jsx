import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    User,
    Bell,
    Shield,
    Palette,
    Lock,
    Mail,
    Smartphone,
    Check,
    Save,
    Eye,
    EyeOff,
    RefreshCw,
    Camera
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from "@/shared/components/ui/switch";
import { Separator } from "@/shared/components/ui/separator";
import useAuthStore from '@/store/authStore';
import { fadeInUp, staggerContainer } from '@/shared/utils/animations';
import { cn } from '@/shared/utils/cn';

const Settings = () => {
    const { user, updateProfile, changePassword } = useAuthStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'profile';
    const [isSaving, setIsSaving] = useState(false);

    // Form States
    const [profileForm, setProfileForm] = useState({ name: '', email: '' });
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

    useEffect(() => {
        if (user) {
            setProfileForm({ name: user.name, email: user.email });
        }
    }, [user]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const success = await updateProfile(profileForm);
        setIsSaving(false);
        if (success) toast.success('Profile updated successfully');
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
            toast.error('Please fill all password fields');
            return;
        }
        if (passwordForm.new !== passwordForm.confirm) {
            toast.error('New passwords do not match');
            return;
        }
        if (passwordForm.new.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsSaving(true);
        const success = await changePassword(passwordForm.current, passwordForm.new);
        setIsSaving(false);

        if (success) {
            toast.success('Password changed successfully');
            setPasswordForm({ current: '', new: '', confirm: '' });
        }
    };

    const tabs = [
        { id: 'profile', icon: User, label: 'Profile' },
        { id: 'security', icon: Shield, label: 'Security' },
        { id: 'appearance', icon: Palette, label: 'Appearance' },
    ];

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-8 pb-20 max-w-5xl mx-auto"
        >
            {/* Header */}
            <motion.div variants={fadeInUp} className="flex items-center gap-3 px-1 sm:px-0">
                <div className="lg:hidden w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                    <img src="/src/assets/dintask_logo_-removebg-preview.png" alt="DinTask" className="h-full w-full object-cover" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Admin <span className="text-primary-600">Settings</span></h1>
                    <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Manage your workspace identity and security credentials.</p>
                </div>
            </motion.div>

            {/* Tab Navigation */}
            <motion.div variants={fadeInUp} className="flex gap-1 sm:gap-2 overflow-x-auto no-scrollbar bg-white dark:bg-slate-900 p-1.5 sm:p-2 rounded-2xl sm:rounded-[2rem] shadow-sm border border-slate-50 dark:border-slate-800/50">
                {tabs.map((tab) => (
                    <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? 'default' : 'ghost'}
                        onClick={() => setSearchParams({ tab: tab.id })}
                        className={cn(
                            "flex-1 h-9 sm:h-10 rounded-xl gap-2 font-black transition-all text-[9px] sm:text-xs uppercase tracking-[0.1em]",
                            activeTab === tab.id
                                ? "bg-primary-600 shadow-md shadow-primary-500/20 text-white"
                                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                    >
                        <tab.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </Button>
                ))}
            </motion.div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'profile' && (
                        <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-5 sm:p-8 pb-0">
                                <CardTitle className="text-lg sm:text-2xl font-black uppercase tracking-tight">Public Profile</CardTitle>
                                <CardDescription className="text-[10px] sm:text-sm font-bold text-slate-400">Basic information about your admin account</CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 sm:p-8 space-y-6 sm:space-y-8">
                                <div className="flex items-center gap-4 sm:gap-6">
                                    <div className="relative group">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-primary-100 dark:bg-slate-800 flex items-center justify-center text-xl sm:text-2xl font-black text-primary-600">
                                            {user?.name?.charAt(0)}
                                        </div>
                                        <button className="absolute -bottom-1 -right-1 p-1 sm:p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-md border border-slate-100 dark:border-slate-600">
                                            <Camera size={12} className="sm:w-3.5 sm:h-3.5" />
                                        </button>
                                    </div>
                                    <div className="space-y-0.5 sm:space-y-1">
                                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white capitalize">{user?.name}</h3>
                                        <p className="text-[8px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">Admin Owner</p>
                                    </div>
                                </div>

                                <Separator />

                                <form onSubmit={handleProfileSubmit} className="space-y-4 sm:space-y-6">
                                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                                        <div className="space-y-1.5 sm:space-y-2">
                                            <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                                            <div className="relative">
                                                <User size={16} className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 sm:w-[18px] sm:h-[18px]" />
                                                <Input
                                                    value={profileForm.name}
                                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                    className="pl-10 sm:pl-12 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50 border-none dark:bg-slate-800 font-bold focus:ring-primary-500/20 text-xs sm:text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 sm:space-y-2">
                                            <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</Label>
                                            <div className="relative">
                                                <Mail size={16} className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 sm:w-[18px] sm:h-[18px]" />
                                                <Input
                                                    value={profileForm.email}
                                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                                    className="pl-10 sm:pl-12 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50 border-none dark:bg-slate-800 font-bold text-xs sm:text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button type="submit" disabled={isSaving} className="w-full sm:w-auto h-10 sm:h-11 px-6 rounded-xl font-black bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/10 text-[9px] sm:text-[10px] uppercase tracking-widest">
                                            {isSaving ? <RefreshCw className="animate-spin mr-2" size={14} /> : <Save className="mr-2" size={14} />}
                                            Update Profile
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'security' && (
                        <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem]">
                            <CardHeader className="p-5 sm:p-8 pb-0">
                                <CardTitle className="text-lg sm:text-2xl font-black uppercase tracking-tight">Security</CardTitle>
                                <CardDescription className="text-[10px] sm:text-sm font-bold text-slate-400">Secure your account with a strong password</CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 sm:p-8">
                                <form onSubmit={handlePasswordSubmit} className="space-y-4 sm:space-y-6 max-w-2xl">
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Password</Label>
                                        <div className="relative">
                                            <Lock size={16} className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 sm:w-[18px] sm:h-[18px]" />
                                            <Input
                                                type={showPasswords.current ? "text" : "password"}
                                                value={passwordForm.current}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                                className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50 border-none dark:bg-slate-800 font-bold text-xs sm:text-sm"
                                            />
                                            <button type="button" onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })} className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                                        <div className="space-y-1.5 sm:space-y-2">
                                            <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Password</Label>
                                            <div className="relative">
                                                <Lock size={16} className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 sm:w-[18px] sm:h-[18px]" />
                                                <Input
                                                    type={showPasswords.new ? "text" : "password"}
                                                    value={passwordForm.new}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                                    className="pl-10 sm:pl-12 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50 border-none dark:bg-slate-800 font-bold text-xs sm:text-sm"
                                                />
                                                <button type="button" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })} className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                    {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 sm:space-y-2">
                                            <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm New Password</Label>
                                            <div className="relative">
                                                <Lock size={16} className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 sm:w-[18px] sm:h-[18px]" />
                                                <Input
                                                    type={showPasswords.confirm ? "text" : "password"}
                                                    value={passwordForm.confirm}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                                    className="pl-10 sm:pl-12 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50 border-none dark:bg-slate-800 font-bold text-xs sm:text-sm"
                                                />
                                                <button type="button" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                    {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button type="submit" disabled={isSaving} className="w-full sm:w-auto h-10 sm:h-11 px-8 rounded-xl font-black bg-slate-900 dark:bg-white dark:text-slate-900 shadow-lg transition-all text-[9px] sm:text-[10px] uppercase tracking-widest">
                                            {isSaving ? <RefreshCw className="animate-spin mr-2" size={14} /> : <Shield className="mr-2" size={14} />}
                                            Update Password
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}


                    {activeTab === 'appearance' && (
                        <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-5 sm:p-8">
                                <CardTitle className="text-lg sm:text-2xl font-black uppercase tracking-tight">Theme Customization</CardTitle>
                                <CardDescription className="text-[10px] sm:text-sm font-bold text-slate-400">Choose your preferred dashboard style</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-8 pt-0">
                                <div className="grid grid-cols-2 gap-3 sm:gap-6">
                                    <div
                                        onClick={() => document.documentElement.classList.remove('dark')}
                                        className={cn(
                                            "p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border-2 sm:border-4 cursor-pointer transition-all group relative",
                                            !document.documentElement.classList.contains('dark')
                                                ? "border-primary-500 bg-primary-50/30 dark:bg-primary-900/10"
                                                : "border-slate-50 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                                        )}
                                    >
                                        <div className="aspect-[4/3] sm:aspect-video bg-white shadow-inner rounded-xl sm:rounded-2xl mb-3 sm:mb-4 flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-slate-100/50" />
                                            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white shadow-sm z-10 flex items-center justify-center">
                                                <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-slate-100" />
                                            </div>
                                            {!document.documentElement.classList.contains('dark') && (
                                                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-4 h-4 sm:w-6 sm:h-6 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg">
                                                    <Check size={10} strokeWidth={4} className="sm:size-3.5" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-center font-black uppercase tracking-[0.1em] text-[8px] sm:text-xs text-slate-500 dark:text-slate-400">Light Mode</p>
                                    </div>
                                    <div
                                        onClick={() => document.documentElement.classList.add('dark')}
                                        className={cn(
                                            "p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border-2 sm:border-4 cursor-pointer transition-all group relative",
                                            document.documentElement.classList.contains('dark')
                                                ? "border-primary-500 bg-primary-900/10"
                                                : "border-slate-50 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                                        )}
                                    >
                                        <div className="aspect-[4/3] sm:aspect-video bg-slate-900 shadow-inner rounded-xl sm:rounded-2xl mb-3 sm:mb-4 flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-slate-800" />
                                            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-slate-900 shadow-sm z-10 flex items-center justify-center border border-slate-700">
                                                <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-slate-800" />
                                            </div>
                                            {document.documentElement.classList.contains('dark') && (
                                                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-4 h-4 sm:w-6 sm:h-6 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg">
                                                    <Check size={10} strokeWidth={4} className="sm:size-3.5" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-center font-black uppercase tracking-[0.1em] text-[8px] sm:text-xs text-slate-400">Dark Mode</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};

export default Settings;
