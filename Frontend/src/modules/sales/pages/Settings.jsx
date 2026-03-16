import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Palette, Globe, Lock, Save, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { toast } from 'sonner';
import useAuthStore from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

const SalesSettings = () => {
    const { user, updateProfile, changePassword, deleteAccount } = useAuthStore();
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
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
                phone: user.phoneNumber || user.phone || '',
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

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const success = await deleteAccount();
            if (success) {
                toast.success("Account deleted permanently");
                navigate('/welcome');
            } else {
                toast.error("Account termination failed");
            }
        } catch (error) {
            toast.error("An error occurred during account deletion");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
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
                                    <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mobile Number</Label>
                                    <Input
                                        type="tel"
                                        placeholder="+91 9876543210"
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

                    {/* Danger Zone */}
                    <Card className="border-2 border-red-100 shadow-xl shadow-red-200/50 bg-gradient-to-br from-white to-red-50/10 dark:from-slate-900 dark:to-red-900/5 rounded-2xl sm:rounded-[2rem] overflow-hidden">
                        <CardHeader className="py-4 sm:py-6 px-5 sm:px-8 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-red-500">Danger Zone</CardTitle>
                                <CardDescription className="text-[8px] sm:text-[10px] font-black text-red-300 italic uppercase">Irreversible account actions</CardDescription>
                            </div>
                            <AlertTriangle size={18} className="text-red-500 shrink-0" />
                        </CardHeader>
                        <CardContent className="p-5 sm:p-8 space-y-6">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="space-y-1 text-center sm:text-left">
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Delete Account</h4>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest max-w-sm">
                                        Permanently remove your operational identity and data.
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    className="h-11 px-8 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-red-500/20 w-full sm:w-auto"
                                    onClick={() => setShowDeleteModal(true)}
                                >
                                    <Trash2 size={16} className="mr-2" /> Delete Permanently
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Delete Confirmation Modal */}
                    <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl bg-white dark:bg-slate-900 p-0 overflow-hidden">
                            <div className="p-8 pb-0">
                                <div className="size-16 rounded-3xl bg-red-50 dark:bg-red-950/30 text-red-600 flex items-center justify-center mx-auto mb-6">
                                    <AlertTriangle size={36} />
                                </div>
                                <DialogTitle className="text-2xl font-black text-center text-slate-900 dark:text-white tracking-tight uppercase italic">
                                    Identity Erasure
                                </DialogTitle>
                                <DialogDescription className="text-center text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pt-3 leading-relaxed">
                                    Are you certain you want to erase your operational profile? This action is absolute and cannot be reversed.
                                </DialogDescription>
                            </div>
                            <DialogFooter className="p-8 flex flex-col sm:flex-row gap-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteAccount}
                                    className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-95"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? "DELETING..." : "CONFIRM ERASURE"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default SalesSettings;
