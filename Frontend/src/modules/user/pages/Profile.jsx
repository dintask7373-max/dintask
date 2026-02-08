import React, { useState, useEffect } from 'react';
import {
    Save,
    Bell,
    Moon,
    AlertCircle,
    User,
    Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import useAuthStore from '@/store/authStore';
import { toast } from 'sonner';
import { cn } from '@/shared/utils/cn';

const EmployeeProfile = () => {
    const { user, updateProfile, changePassword } = useAuthStore();

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phoneNumber: '+1 (555) 123-4567'
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
                phoneNumber: user.phoneNumber || user.phone || '+1 (555) 123-4567'
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
                phoneNumber: profileData.phoneNumber
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
        <div className="space-y-4 sm:space-y-6 pb-12 transition-all duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-3">
                    <div className="lg:hidden size-9 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                        <img src="/dintask-logo.png" alt="DinTask" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                            System <span className="text-primary-600">Preferences</span>
                        </h1>
                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-1 leading-none">
                            Identity & security parameters
                        </p>
                    </div>
                </div>
                <Button className="h-9 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20 text-white gap-2" onClick={handleProfileUpdate} disabled={isLoading}>
                    <Save size={14} /> {isLoading ? 'SAVING...' : 'SAVE'}
                </Button>
            </div>

            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                {/* Profile Matrix */}
                <div className="space-y-4 sm:space-y-6">
                    <Card className="border-none shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="py-5 px-8 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Public Identity</CardTitle>
                                <CardDescription className="text-[8px] font-black text-slate-300 uppercase italic">Force-wide recognition data</CardDescription>
                            </div>
                            <User size={18} className="text-primary-500" />
                        </CardHeader>
                        <CardContent className="p-6 sm:p-8 space-y-6">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                                    <Input
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="h-11 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-bold text-sm px-4"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Email</Label>
                                    <Input
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="h-11 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-bold text-sm px-4"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Mobile Number</Label>
                                    <Input
                                        value={profileData.phoneNumber}
                                        onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                                        className="h-11 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-bold text-sm px-4"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="py-5 px-8 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security Encryption</CardTitle>
                                <CardDescription className="text-[8px] font-black text-slate-300 uppercase italic">Credential rotation & access keys</CardDescription>
                            </div>
                            <Shield size={18} className="text-amber-500" />
                        </CardHeader>
                        <CardContent className="p-6 sm:p-8 space-y-6">
                            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 items-end">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Cipher</Label>
                                    <Input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} placeholder="••••••••" className="h-11 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-bold text-sm px-4" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">New Sequence</Label>
                                    <Input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} placeholder="••••••••" className="h-11 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-bold text-sm px-4" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Sequence</Label>
                                    <Input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} placeholder="••••••••" className="h-11 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-bold text-sm px-4" />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button className="h-9 px-5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black text-[9px] uppercase tracking-widest" onClick={handlePasswordChange} disabled={isLoading}>ROTATE KEYS</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;
