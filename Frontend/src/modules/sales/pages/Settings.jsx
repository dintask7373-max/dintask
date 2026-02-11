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
        <div className="min-h-screen w-full bg-white dark:bg-slate-950 relative flex flex-col items-center justify-start font-sans overflow-x-hidden pb-12">
            {/* Background Image Removed as per request */}

            {/* Profile Content */}
            <div className="w-full max-w-2xl mt-6 sm:mt-12 px-4 sm:px-6 relative z-10 space-y-6 sm:space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">
                            Settings <span className="text-primary-600">Sync</span>
                        </h1>
                        <p className="text-[9px] sm:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] italic">
                            Operational Identity & security
                        </p>
                    </div>
                    <Button
                        className="h-10 px-6 rounded-xl font-black bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-500/20 text-white gap-2 text-[10px] uppercase tracking-widest w-full sm:w-auto"
                        onClick={handleProfileUpdate}
                        disabled={isLoading}
                    >
                        <Save size={14} /> {isLoading ? 'Syncing...' : 'Apply Changes'}
                    </Button>
                </div>

                <div className="space-y-6 sm:space-y-8">
                    {/* Profile Matrix */}
                    <Card className="border-2 border-primary-100 shadow-xl shadow-primary-200/50 bg-gradient-to-br from-white to-primary-50/10 dark:from-slate-900 dark:to-primary-900/5 rounded-2xl sm:rounded-[2rem] overflow-hidden">
                        <CardHeader className="py-4 sm:py-6 px-5 sm:px-8 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Public Identity</CardTitle>
                                <CardDescription className="text-[8px] sm:text-[10px] font-black text-slate-300 italic uppercase">Operational identification data</CardDescription>
                            </div>
                            <User size={18} className="text-primary-500 shrink-0" />
                        </CardHeader>
                        <CardContent className="p-5 sm:p-8 space-y-5 sm:space-y-6">
                            <div className="grid gap-5 sm:gap-6">
                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Designation</Label>
                                    <Input
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="h-11 sm:h-12 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-xl font-black text-xs sm:text-sm px-4 sm:px-5 focus:bg-white transition-all shadow-inner shadow-slate-100 dark:shadow-none"
                                    />
                                </div>
                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Communication Hub</Label>
                                    <Input
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="h-11 sm:h-12 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-xl font-black text-xs sm:text-sm px-4 sm:px-5 focus:bg-white transition-all shadow-inner shadow-slate-100 dark:shadow-none"
                                    />
                                </div>
                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Direct Link (Mobile)</Label>
                                    <Input
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="h-11 sm:h-12 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-xl font-black text-xs sm:text-sm px-4 sm:px-5 focus:bg-white transition-all shadow-inner shadow-slate-100 dark:shadow-none"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-100 shadow-xl shadow-blue-200/50 bg-gradient-to-br from-white to-blue-50/10 dark:from-slate-900 dark:to-blue-900/5 rounded-2xl sm:rounded-[2rem] overflow-hidden">
                        <CardHeader className="py-4 sm:py-6 px-5 sm:px-8 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Security Encryption</CardTitle>
                                <CardDescription className="text-[8px] sm:text-[10px] font-black text-slate-300 italic uppercase">Credential rotation protocol</CardDescription>
                            </div>
                            <Shield size={18} className="text-blue-500 shrink-0" />
                        </CardHeader>
                        <CardContent className="p-5 sm:p-8 space-y-5 sm:space-y-6">
                            <div className="space-y-5 sm:space-y-6">
                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Cipher</Label>
                                    <Input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} placeholder="••••••••" className="h-11 sm:h-12 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-xl font-black text-xs sm:text-sm px-4 sm:px-5 shadow-inner shadow-slate-100 dark:shadow-none" />
                                </div>
                                <div className="grid gap-5 sm:gap-6 sm:grid-cols-2">
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Sequence</Label>
                                        <Input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} placeholder="••••••••" className="h-11 sm:h-12 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-xl font-black text-xs sm:text-sm px-4 sm:px-5 shadow-inner shadow-slate-100 dark:shadow-none" />
                                    </div>
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Verify Sequence</Label>
                                        <Input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} placeholder="••••••••" className="h-11 sm:h-12 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-xl font-black text-xs sm:text-sm px-4 sm:px-5 shadow-inner shadow-slate-100 dark:shadow-none" />
                                    </div>
                                </div>
                                <div className="flex pt-2">
                                    <Button className="h-11 px-8 rounded-xl bg-slate-900 border-none shadow-xl hover:bg-black text-white dark:bg-white dark:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 w-full sm:w-auto" onClick={handlePasswordChange} disabled={isLoading}>
                                        Rotate Security Key
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
