import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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

const ManagerSettings = () => {
    const { user, updateProfile, changePassword } = useAuthStore();
    const location = useLocation();
    const isNotificationsPage = location.pathname.includes('/notifications');

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        department: 'Product Engineering',
        role: 'Lead Manager'
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
                department: user.department || 'Product Engineering',
                role: user.roleTitle || 'Lead Manager'
            });
        }
    }, [user]);

    const handleSaveAll = async () => {
        if (!profileData.name || !profileData.email) {
            toast.error("Parameters incomplete");
            return;
        }

        setIsLoading(true);
        try {
            await updateProfile(profileData);
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

    if (isNotificationsPage) {
        return (
            <div className="space-y-4 sm:space-y-6 pb-12 transition-all duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                    <div className="flex items-center gap-3">
                        <div className="lg:hidden size-9 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                            <img src="/dintask-logo.png" alt="DinTask" className="h-full w-full object-cover" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                                Alert <span className="text-primary-600">Sync</span>
                            </h1>
                            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-1 leading-none">
                                Signal distribution protocols
                            </p>
                        </div>
                    </div>
                    <Button className="h-9 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20 text-white gap-2">
                        <Save size={14} /> SAVE CONFIG
                    </Button>
                </div>

                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                    <Card className="border-none shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                        <CardHeader className="py-4 px-6 border-b border-slate-50 dark:border-slate-800">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Bell size={14} className="text-primary-500" />
                                Primary Transmission
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6 space-y-4">
                            {[
                                { title: 'Direct Intelligence', desc: 'Real-time SMTP transmission', active: true },
                                { title: 'Neural Push', desc: 'Instant desktop/mobile relay', active: true },
                                { title: 'Interface Badging', desc: 'Visual signal indicators', active: false }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                    <div className="text-left">
                                        <h4 className="text-[10px] font-black text-slate-900 dark:text-white leading-none uppercase tracking-widest">{item.title}</h4>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-1">{item.desc}</p>
                                    </div>
                                    <Switch defaultChecked={item.active} className="data-[state=checked]:bg-primary-600" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                        <CardHeader className="py-4 px-6 border-b border-slate-50 dark:border-slate-800">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <AlertCircle size={14} className="text-blue-500" />
                                Activity Triggers
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6 grid gap-4">
                            {[
                                { title: 'Force Deploy', desc: 'Task assignment logs', active: true },
                                { title: 'Neural Links', desc: 'Direct mental mentions', active: true },
                                { title: 'Force Status', desc: 'Daily team output sync', active: true },
                                { title: 'Core Comms', desc: 'System level broadcasts', active: false }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                    <div className="text-left">
                                        <h4 className="text-[10px] font-black text-slate-900 dark:text-white leading-none uppercase tracking-widest">{item.title}</h4>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-1">{item.desc}</p>
                                    </div>
                                    <Switch defaultChecked={item.active} className="data-[state=checked]:bg-primary-600" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                        <CardHeader className="py-4 px-6 border-b border-slate-50 dark:border-slate-800">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Moon size={14} className="text-indigo-500" />
                                Stealth Protocol
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6">
                            <div className="flex items-center justify-between mb-6 p-4 rounded-2xl bg-indigo-50 text-indigo-900">
                                <div className="text-left">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest">Enable Stealth Node</h4>
                                    <p className="text-[8px] font-black uppercase tracking-tighter mt-1 opacity-70">Suppress all non-critical signals</p>
                                </div>
                                <Switch className="data-[state=checked]:bg-indigo-600" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Inception TIME</Label>
                                    <Input type="time" defaultValue="22:00" className="h-10 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-black text-xs px-4" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Termination TIME</Label>
                                    <Input type="time" defaultValue="08:00" className="h-10 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-black text-xs px-4" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

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
                <Button className="h-9 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20 text-white gap-2" onClick={handleSaveAll} disabled={isLoading}>
                    <Save size={14} /> {isLoading ? 'SYNCING...' : 'UPDATING CORE'}
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
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Asset Nomenclature</Label>
                                    <Input
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="h-11 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-bold text-sm px-4"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Neural ID (Email)</Label>
                                    <Input
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="h-11 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-bold text-sm px-4"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Division Sector</Label>
                                    <Input
                                        value={profileData.department}
                                        onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                                        className="h-11 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-bold text-sm px-4"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Operational Rank</Label>
                                    <Input
                                        value={profileData.role}
                                        onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
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

export default ManagerSettings;
