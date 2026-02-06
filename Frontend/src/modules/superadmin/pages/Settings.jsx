import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Shield,
    Settings as SettingsIcon,
    Save,
    RefreshCw,
    Check,
    AlertTriangle,
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Separator } from "@/shared/components/ui/separator";
import { fadeInUp, staggerContainer } from '@/shared/utils/animations';
import { cn } from '@/shared/utils/cn';
import useSuperAdminStore from '@/store/superAdminStore';
import useAuthStore from '@/store/authStore';

const SuperAdminSettings = () => {
    const { user, updateProfile, changePassword } = useAuthStore();
    const { systemSettings, updateSystemSettings } = useSuperAdminStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'profile';

    // States
    const [isSaving, setIsSaving] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

    // Form States
    const [profileForm, setProfileForm] = useState({ name: '', email: '' });
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
    const [systemForm, setSystemForm] = useState({
        platformName: '',
        supportEmail: '',
        maintenanceMode: false
    });

    useEffect(() => {
        if (user) {
            setProfileForm({ name: user.name, email: user.email });
        }
        if (systemSettings) {
            setSystemForm({
                platformName: systemSettings.platformName || '',
                supportEmail: systemSettings.supportEmail || '',
                maintenanceMode: systemSettings.maintenanceMode || false
            });
        }
    }, [user, systemSettings]);

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
        setIsSaving(true);
        const success = await changePassword(passwordForm.current, passwordForm.new);
        setIsSaving(false);
        if (success) {
            toast.success('Password changed successfully');
            setPasswordForm({ current: '', new: '', confirm: '' });
        }
    };

    const handleSystemSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            updateSystemSettings(systemForm);
            setIsSaving(false);
            toast.success('System settings updated globally');
        }, 800);
    };

    const tabs = [
        { id: 'profile', icon: User, label: 'My Account', desc: 'Profile & Identity' },
        { id: 'security', icon: Lock, label: 'Security', desc: 'Password & Protection' },
        { id: 'platform', icon: SettingsIcon, label: 'Platform Settings', desc: 'Global Configuration' },
    ];

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-8 pb-20 max-w-5xl mx-auto"
        >
            {/* Header */}
            <motion.div variants={fadeInUp} className="space-y-1 px-1">
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    Settings & <span className="text-primary-600">Preferences</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Manage your account security and global system configurations.
                </p>
            </motion.div>

            <Tabs value={activeTab} onValueChange={(val) => setSearchParams({ tab: val })} className="w-full">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
                    {/* Navigation Sidebar */}
                    <motion.aside variants={fadeInUp} className="lg:w-72 shrink-0">
                        <TabsList className="flex lg:flex-col h-auto bg-transparent p-0 gap-2 w-full overflow-x-auto lg:overflow-visible no-scrollbar pb-1 lg:pb-0">
                            {tabs.map(tab => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="relative overflow-hidden group justify-center lg:justify-between px-3 py-3 sm:px-5 sm:py-5 h-auto w-auto lg:w-full data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 border border-transparent data-[state=active]:border-slate-100 dark:data-[state=active]:border-slate-800 data-[state=active]:shadow-lg data-[state=active]:shadow-slate-200/40 dark:data-[state=active]:shadow-none rounded-2xl sm:rounded-3xl transition-all text-left shrink-0 lg:shrink"
                                >
                                    <div className="flex items-center gap-3 sm:gap-4 z-10 w-full lg:justify-start justify-center">
                                        <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-data-[state=active]:bg-primary-600 group-data-[state=active]:text-white transition-all duration-300">
                                            <tab.icon size={16} className="sm:w-5 sm:h-5" />
                                        </div>
                                        <div className="hidden lg:block">
                                            <p className="font-black text-xs sm:text-sm text-slate-700 dark:text-slate-200 group-data-[state=active]:text-slate-900 dark:group-data-[state=active]:text-white whitespace-nowrap">{tab.label}</p>
                                            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest group-data-[state=active]:text-primary-600">{tab.desc}</p>
                                        </div>
                                    </div>
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-600 rounded-r-full scale-y-0 group-data-[state=active]:scale-y-100 transition-transform origin-center hidden lg:block" />
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </motion.aside>

                    {/* Content Area */}
                    <main className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            {/* Account Tab */}
                            <TabsContent value="profile" className="m-0 focus-visible:outline-none" key="profile">
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 sm:space-y-6">
                                    <Card className="border-none shadow-lg shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] overflow-hidden">
                                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 p-5 sm:p-8 border-b border-slate-100 dark:border-slate-800">
                                            <CardTitle className="text-lg sm:text-2xl font-black">Account Details</CardTitle>
                                            <CardDescription className="text-xs sm:text-sm font-bold text-slate-400">Update your personal information</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-5 sm:p-8 space-y-6 sm:space-y-8">
                                            <div className="flex items-center gap-4 sm:gap-8">
                                                <div className="relative group">
                                                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-xl sm:text-3xl font-black text-white shadow-xl">
                                                        {user?.name?.charAt(0)}
                                                    </div>
                                                    <button className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 p-1.5 sm:p-2 bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors">
                                                        <Camera size={14} className="sm:w-4 sm:h-4" />
                                                    </button>
                                                </div>
                                                <div className="space-y-0.5 sm:space-y-1">
                                                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white capitalize">{user?.name}</h3>
                                                    <p className="text-[10px] sm:text-sm font-bold text-slate-500 uppercase tracking-widest">Super Administrator</p>
                                                </div>
                                            </div>

                                            <Separator />

                                            <form onSubmit={handleProfileSubmit} className="space-y-4 sm:space-y-6">
                                                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                                                    <div className="space-y-1.5 sm:space-y-2">
                                                        <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</Label>
                                                        <div className="relative">
                                                            <User className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                            <Input
                                                                value={profileForm.name}
                                                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                                className="pl-10 sm:pl-12 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50 border-none dark:bg-slate-800 font-bold focus-visible:ring-primary-500/20 w-full text-xs sm:text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5 sm:space-y-2">
                                                        <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</Label>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                            <Input
                                                                value={profileForm.email}
                                                                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                                                className="pl-10 sm:pl-12 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50 border-none dark:bg-slate-800 font-bold focus-visible:ring-primary-500/20 w-full text-xs sm:text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end pt-2 sm:pt-4">
                                                    <Button type="submit" disabled={isSaving} className="h-11 sm:h-14 w-full sm:w-auto px-6 sm:px-8 rounded-xl sm:rounded-2xl gap-2 font-black bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all active:scale-95 text-xs sm:text-sm">
                                                        {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                                                        Save Profile
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </TabsContent>

                            {/* Security Tab */}
                            <TabsContent value="security" className="m-0 focus-visible:outline-none" key="security">
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 sm:space-y-6">
                                    <Card className="border-none shadow-lg shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem]">
                                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 p-5 sm:p-8 border-b border-slate-100 dark:border-slate-800">
                                            <CardTitle className="text-lg sm:text-2xl font-black">Security Settings</CardTitle>
                                            <CardDescription className="text-xs sm:text-sm font-bold text-slate-400">Manage your password and account security</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-5 sm:p-8">
                                            <form onSubmit={handlePasswordSubmit} className="space-y-6 sm:space-y-8 max-w-2xl">
                                                <div className="space-y-4 sm:space-y-6">
                                                    <div className="space-y-1.5 sm:space-y-2">
                                                        <Label className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Current Password</Label>
                                                        <div className="relative">
                                                            <Lock className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                            <Input
                                                                type={showPasswords.current ? "text" : "password"}
                                                                value={passwordForm.current}
                                                                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                                                className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50 border-none dark:bg-slate-800 font-bold text-xs sm:text-sm"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                                className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                            >
                                                                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                                                        <div className="space-y-1.5 sm:space-y-2">
                                                            <Label className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-slate-500 ml-1">New Password</Label>
                                                            <div className="relative">
                                                                <Lock className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                                <Input
                                                                    type={showPasswords.new ? "text" : "password"}
                                                                    value={passwordForm.new}
                                                                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                                                    className="pl-10 sm:pl-12 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50 border-none dark:bg-slate-800 font-bold text-xs sm:text-sm"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                                    className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                                >
                                                                    {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5 sm:space-y-2">
                                                            <Label className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Confirm New Password</Label>
                                                            <div className="relative">
                                                                <Lock className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                                <Input
                                                                    type={showPasswords.confirm ? "text" : "password"}
                                                                    value={passwordForm.confirm}
                                                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                                                    className="pl-10 sm:pl-12 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50 border-none dark:bg-slate-800 font-bold text-xs sm:text-sm"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                                    className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                                >
                                                                    {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex pt-2 sm:pt-4">
                                                    <Button type="submit" disabled={isSaving} className="h-11 sm:h-14 w-full sm:w-auto px-8 sm:px-10 rounded-xl sm:rounded-2xl gap-2 font-black bg-slate-900 hover:bg-black text-white shadow-xl transition-all active:scale-95 text-xs sm:text-sm">
                                                        {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Shield size={16} />}
                                                        Update Password
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </TabsContent>

                            {/* Platform Tab */}
                            <TabsContent value="platform" className="m-0 focus-visible:outline-none" key="platform">
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 sm:space-y-6">
                                    <Card className="border-none shadow-lg shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem]">
                                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 p-5 sm:p-8 border-b border-slate-100 dark:border-slate-800">
                                            <CardTitle className="text-lg sm:text-2xl font-black">Platform Settings</CardTitle>
                                            <CardDescription className="text-xs sm:text-sm font-bold text-slate-400">Configure global parameters and platform identity</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-5 sm:p-8 space-y-6 sm:space-y-8">
                                            <form onSubmit={handleSystemSubmit} className="space-y-6 sm:space-y-8">
                                                <div className="grid gap-4 sm:gap-8 md:grid-cols-2">
                                                    <div className="space-y-1.5 sm:space-y-2">
                                                        <Label className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Platform Branding Name</Label>
                                                        <div className="relative">
                                                            <SettingsIcon className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                            <Input
                                                                value={systemForm.platformName}
                                                                onChange={(e) => setSystemForm({ ...systemForm, platformName: e.target.value })}
                                                                className="pl-10 sm:pl-12 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50 border-none dark:bg-slate-800 font-bold text-xs sm:text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5 sm:space-y-2">
                                                        <Label className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Global Support Email</Label>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                            <Input
                                                                value={systemForm.supportEmail}
                                                                onChange={(e) => setSystemForm({ ...systemForm, supportEmail: e.target.value })}
                                                                className="pl-10 sm:pl-12 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50 border-none dark:bg-slate-800 font-bold text-xs sm:text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <Separator />

                                                <div className="flex items-center justify-between p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                                                    <div className="space-y-0.5 sm:space-y-1 flex-1">
                                                        <div className="flex items-center gap-2 sm:gap-3">
                                                            <div className="p-1.5 sm:p-2 bg-amber-200 dark:bg-amber-800 rounded-lg text-amber-700 dark:text-amber-300">
                                                                <AlertTriangle size={14} className="sm:w-4 sm:h-4" />
                                                            </div>
                                                            <Label className="text-amber-900 dark:text-amber-500 text-sm sm:text-lg font-black">Maintenance Mode</Label>
                                                        </div>
                                                        <p className="text-[10px] sm:text-sm font-bold text-amber-700/80 dark:text-amber-500/70 ml-8 sm:ml-11 max-w-[200px] sm:max-w-none">
                                                            Stop all traffic and show maintenance page to all users except super admins.
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={systemForm.maintenanceMode}
                                                        onCheckedChange={(checked) => setSystemForm({ ...systemForm, maintenanceMode: checked })}
                                                        className="data-[state=checked]:bg-amber-600 scale-75 sm:scale-100"
                                                    />
                                                </div>

                                                <div className="flex justify-end pt-2 sm:pt-4">
                                                    <Button type="submit" disabled={isSaving} className="h-11 sm:h-14 w-full sm:w-auto px-6 sm:px-8 rounded-xl sm:rounded-2xl gap-2 font-black bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-500/20 transition-all active:scale-95 text-xs sm:text-sm">
                                                        {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Check size={16} />}
                                                        Apply Global Changes
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </TabsContent>
                        </AnimatePresence>
                    </main>
                </div>
            </Tabs>
        </motion.div>
    );
};

export default SuperAdminSettings;
