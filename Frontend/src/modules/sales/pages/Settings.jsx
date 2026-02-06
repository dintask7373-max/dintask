import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Palette, Globe, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { toast } from 'sonner';
import useAuthStore from '@/store/authStore';

const SalesSettings = () => {
    const { user, updateProfile, changePassword } = useAuthStore();

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '+1 (555) 123-4567',
        department: 'sales'
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '+1 (555) 123-4567',
                department: user.department || 'sales'
            });
        }
    }, [user]);

    const handleProfileUpdate = async () => {
        if (!profileData.name || !profileData.email) {
            toast.error("Required fields missing");
            return;
        }
        setIsLoading(true);
        try {
            await updateProfile(profileData);
            toast.success("Profile synchronized");
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error("Password fields required");
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Passwords mismatch");
            return;
        }

        setIsLoading(true);
        try {
            await changePassword(passwordData.currentPassword, passwordData.newPassword);
            toast.success("Security keys updated");
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error("Change failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 pb-10">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-3">
                    <div className="lg:hidden w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                        <img src="/dintask-logo.png" alt="DinTask" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                            System <span className="text-primary-600">Preferences</span>
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                            Configure your environment & security protocols
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                {/* Profile Information */}
                <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                    <CardHeader className="py-3 px-6 border-b border-slate-50 dark:border-slate-800">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2.5">
                            <div className="size-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                                <User size={14} />
                            </div>
                            Identity Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                                <Input
                                    value={profileData.name}
                                    className="h-10 bg-slate-50 border-none dark:bg-slate-800 rounded-xl font-bold text-sm px-4"
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Email</Label>
                                <Input
                                    type="email"
                                    value={profileData.email}
                                    className="h-10 bg-slate-50 border-none dark:bg-slate-800 rounded-xl font-bold text-sm px-4"
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Line</Label>
                                <Input
                                    value={profileData.phone}
                                    className="h-10 bg-slate-50 border-none dark:bg-slate-800 rounded-xl font-bold text-sm px-4"
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Department Sector</Label>
                                <Select
                                    value={profileData.department}
                                    onValueChange={(val) => setProfileData({ ...profileData, department: val })}
                                >
                                    <SelectTrigger className="h-10 bg-slate-50 border-none dark:bg-slate-800 rounded-xl font-bold text-sm px-4 ring-0 focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-2xl">
                                        <SelectItem value="sales" className="text-xs font-bold font-black">Sales & Revenue</SelectItem>
                                        <SelectItem value="marketing" className="text-xs font-bold font-black">Growth Marketing</SelectItem>
                                        <SelectItem value="support" className="text-xs font-bold font-black">Client Success</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2.5 mt-6 pt-5 border-t border-slate-50 dark:border-slate-800">
                            <Button variant="ghost" className="h-9 px-5 rounded-lg font-black text-[9px] uppercase tracking-widest text-slate-400">Abort</Button>
                            <Button
                                onClick={handleProfileUpdate}
                                disabled={isLoading}
                                className="h-9 px-6 rounded-lg bg-primary-600 hover:bg-primary-700 font-black text-[9px] uppercase tracking-widest shadow-lg shadow-primary-500/20 text-white"
                            >
                                {isLoading ? 'Processing...' : 'Sync Profile'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Actions */}
                <Card className="border-none shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden h-fit">
                    <CardHeader className="py-3 px-6 border-b border-slate-50 dark:border-slate-800">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2.5">
                            <div className="size-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                                <Lock size={14} />
                            </div>
                            Security Vault
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 sm:p-6 space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Password</Label>
                                <Input
                                    type="password"
                                    className="h-10 bg-slate-50 border-none dark:bg-slate-800 rounded-xl font-bold text-sm px-4"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">New Password</Label>
                                <Input
                                    type="password"
                                    className="h-10 bg-slate-50 border-none dark:bg-slate-800 rounded-xl font-bold text-sm px-4"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Security Key</Label>
                                <Input
                                    type="password"
                                    className="h-10 bg-slate-50 border-none dark:bg-slate-800 rounded-xl font-bold text-sm px-4"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                />
                            </div>
                            <Button
                                className="w-full h-10 rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 font-black text-[9px] uppercase tracking-widest mt-2"
                                onClick={handlePasswordChange}
                                disabled={isLoading}
                            >
                                Update Security
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Notifications and Preferences */}
            <Card className="border-none shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                <CardHeader className="py-3 px-6 border-b border-slate-50 dark:border-slate-800">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2.5">
                        <div className="size-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                            <Bell size={14} />
                        </div>
                        Communication Protocols
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {[
                            { title: 'Email Alerts', desc: 'Real-time revenue updates', key: 'email' },
                            { title: 'Deal Velocity', desc: 'Notification on stage advance', key: 'deals' },
                            { title: 'Reminders', desc: 'Critical pending actions', key: 'reminders' }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700 gap-3">
                                <div className="space-y-0.5">
                                    <h3 className="text-[10px] sm:text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{item.title}</h3>
                                    <p className="text-[7px] sm:text-[8px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider mt-1 leading-relaxed">{item.desc}</p>
                                </div>
                                <Switch className="data-[state=checked]:bg-primary-600 scale-75 sm:scale-90 align-self-end sm:align-self-auto" defaultChecked />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SalesSettings;
