import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Palette, Globe, Lock, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
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
                phone: user.phoneNumber || user.phone || '+1 (555) 123-4567',
                department: user.department || 'sales'
            });
        }
    }, [user]);

    const handleProfileUpdate = async () => {
        if (!profileData.name || !profileData.email) {
            toast.error("Parameters incomplete");
            return;
        }
        setIsLoading(true);
        try {
            await updateProfile({
                ...profileData,
                phoneNumber: profileData.phone // Backend expects phoneNumber
            });
            toast.success("Synchronized successfully");
        } catch (error) {
            toast.error("Sync failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error("Security fields incomplete");
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Hash mismatch");
            return;
        }

        setIsLoading(true);
        try {
            await changePassword(passwordData.currentPassword, passwordData.newPassword);
            toast.success("Security protocol updated");
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error("Recall failed");
        } finally {
            setIsLoading(false);
        }
    };

    // Default Profile View
    return (
        <div className="min-h-screen w-full bg-slate-50 relative flex flex-col items-center justify-start font-sans overflow-x-hidden pb-12">
            {/* Enhanced Background Visibility matching Employee Profile */}
            <div className="absolute inset-0 h-[480px] z-0 overflow-hidden">
                <img
                    src="/WLCOMPAGE .png"
                    alt="Background"
                    className="w-full h-full object-cover object-center opacity-70 dark:opacity-30 translate-y-[-10%]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50/40 via-slate-50/80 to-slate-50 dark:from-slate-950/40 dark:via-slate-950/80 dark:to-slate-950" />
            </div>

            {/* Profile Content */}
            <div className="w-full max-w-[600px] mt-12 px-6 relative z-10 space-y-8">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                            System <span className="text-primary-600">Preferences</span>
                        </h1>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Identity & security parameters
                        </p>
                    </div>
                    <Button
                        className="h-10 px-6 rounded-2xl font-bold bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/20 text-white gap-2"
                        onClick={handleProfileUpdate}
                        disabled={isLoading}
                    >
                        <Save size={16} /> {isLoading ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>

                <div className="space-y-6">
                    {/* Profile Matrix */}
                    <Card className="border-none shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="py-6 px-10 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Public Identity</CardTitle>
                                <CardDescription className="text-[10px] font-bold text-slate-300 italic uppercase">Force-wide recognition data</CardDescription>
                            </div>
                            <User size={20} className="text-primary-500" />
                        </CardHeader>
                        <CardContent className="p-8 sm:p-10 space-y-6">
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</Label>
                                    <Input
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="h-12 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm px-5 focus:bg-white transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Primary Email</Label>
                                    <Input
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="h-12 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm px-5 focus:bg-white transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Mobile Number</Label>
                                    <Input
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="h-12 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm px-5 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="py-6 px-10 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Security Encryption</CardTitle>
                                <CardDescription className="text-[10px] font-bold text-slate-300 italic uppercase">Credential rotation & access keys</CardDescription>
                            </div>
                            <Shield size={20} className="text-amber-500" />
                        </CardHeader>
                        <CardContent className="p-8 sm:p-10 space-y-6">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Current Cipher</Label>
                                    <Input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} placeholder="••••••••" className="h-12 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm px-5" />
                                </div>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">New Sequence</Label>
                                        <Input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} placeholder="••••••••" className="h-12 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm px-5" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Confirm Sequence</Label>
                                        <Input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} placeholder="••••••••" className="h-12 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm px-5" />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button className="h-11 px-8 rounded-xl bg-slate-900 border-none shadow-sm hover:bg-black text-white dark:bg-white dark:text-slate-900 font-bold text-xs uppercase tracking-widest transition-all active:scale-95" onClick={handlePasswordChange} disabled={isLoading}>
                                        Rotate Keys
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SalesSettings;
