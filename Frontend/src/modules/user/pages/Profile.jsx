import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Save,
    Bell,
    Moon,
    AlertCircle,
    User,
    Shield,
    LogOut
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
    const { user, updateProfile, changePassword, logout } = useAuthStore();
    const navigate = useNavigate();

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

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
            toast.success("Identity session terminated");
        } catch (error) {
            toast.error("Logout protocol failed");
        }
    };


    // Default Profile View
    return (
        <div className="min-h-screen w-full bg-white dark:bg-slate-950 relative flex flex-col items-center justify-start font-sans overflow-x-hidden pb-20">
            {/* Enhanced Background Visibility */}
            <div className="absolute inset-0 h-[480px] z-0 overflow-hidden">
                <img
                    src="/WLCOMPAGE .png"
                    alt="Background"
                    className="w-full h-full object-cover object-center opacity-70 dark:opacity-30 translate-y-[-10%]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-white dark:from-slate-950/40 dark:via-slate-950/80 dark:to-slate-950" />
            </div>

            {/* Profile Content Content */}
            <div className="w-full max-w-[600px] mt-12 px-6 relative z-10 space-y-8">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            My Profile
                        </h1>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Identity & security settings
                        </p>
                    </div>
                    <Button
                        className="h-10 px-6 rounded-2xl font-bold bg-[#4461f2] hover:bg-[#3451e2] shadow-lg shadow-[#4461f2]/20 text-white gap-2"
                        onClick={handleProfileUpdate}
                        disabled={isLoading}
                    >
                        <Save size={16} /> {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>

                {/* Profile Matrix */}
                <div className="space-y-6">
                    <Card className="border-none shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="py-6 px-10 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Personal Information</CardTitle>
                                <CardDescription className="text-[10px] font-bold text-slate-300 italic">Manage your public identity</CardDescription>
                            </div>
                            <User size={20} className="text-[#4461f2]" />
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
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</Label>
                                    <Input
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="h-12 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm px-5 focus:bg-white transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Phone Number</Label>
                                    <Input
                                        value={profileData.phoneNumber}
                                        onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
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
                                <CardDescription className="text-[10px] font-bold text-slate-300 italic">Credential rotation & access keys</CardDescription>
                            </div>
                            <Shield size={20} className="text-amber-500" />
                        </CardHeader>
                        <CardContent className="p-8 sm:p-10 space-y-6">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Current Password</Label>
                                    <Input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} placeholder="••••••••" className="h-12 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm px-5" />
                                </div>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">New Password</Label>
                                        <Input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} placeholder="••••••••" className="h-12 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm px-5" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Confirm New Password</Label>
                                        <Input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} placeholder="••••••••" className="h-12 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm px-5" />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button className="h-11 px-8 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 font-bold text-xs uppercase tracking-widest transition-all active:scale-95" onClick={handlePasswordChange} disabled={isLoading}>
                                        Rotate Keys
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Logout Section */}
                    <div className="pt-4 pb-10 flex justify-center">
                        <Button
                            variant="ghost"
                            className="w-full h-14 rounded-3xl font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all gap-3 border border-red-100 dark:border-red-950/30"
                            onClick={handleLogout}
                        >
                            <LogOut size={20} /> Terminate Session (Logout)
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;
