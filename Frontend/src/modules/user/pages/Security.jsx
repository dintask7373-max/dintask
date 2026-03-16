import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, EyeOff, CheckCircle2, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import useAuthStore from '@/store/authStore';
import { cn } from '@/shared/utils/cn';
import { fadeInUp } from '@/shared/utils/animations';

const Security = () => {
    const navigate = useNavigate();
    const { deleteAccount, changePassword } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const toggleVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);

        try {
            await changePassword(formData.currentPassword, formData.newPassword);
            toast.success('Security protocol updated');
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            toast.error('Failed to update credentials');
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

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen pb-32 font-sans">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="flex items-center p-4 justify-between max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-lg font-bold">Security & Privacy</h2>
                    <div className="w-10"></div>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-6 pt-12 space-y-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
                    <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-2 shadow-inner">
                        <Lock size={36} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Security Vault</h3>
                    <p className="text-sm text-slate-400 font-medium max-w-[280px] mx-auto">Keep your account guarded with a strong, complex password.</p>
                </motion.div>

                <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-none bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden p-10 border border-slate-100/50 dark:border-slate-800/50">
                    <form onSubmit={handlePasswordChange} className="space-y-8">
                        {/* Current Password */}
                        <div className="space-y-3">
                            <Label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-[0.15em]">Current Cipher</Label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                                <Input
                                    type={showPasswords.current ? "text" : "password"}
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="pl-14 pr-14 h-16 bg-slate-50 dark:bg-slate-800/40 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-slate-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleVisibility('current')}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                                >
                                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-800 w-full opacity-50" />

                        {/* New Password */}
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-[0.15em]">New Sequence</Label>
                                <div className="relative group">
                                    <Shield className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                                    <Input
                                        type={showPasswords.new ? "text" : "password"}
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        placeholder="••••••••"
                                        className="pl-14 pr-14 h-16 bg-slate-50 dark:bg-slate-800/40 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-slate-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleVisibility('new')}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                                    >
                                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {formData.newPassword.length > 0 && formData.newPassword.length < 8 && (
                                    <p className="text-[10px] text-red-500 font-bold ml-1 mt-1">Requires 8+ characters</p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-[0.15em]">Verify Sequence</Label>
                                <div className="relative group">
                                    <Shield className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                                    <Input
                                        type={showPasswords.confirm ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        placeholder="••••••••"
                                        className="pl-14 pr-14 h-16 bg-slate-50 dark:bg-slate-800/40 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-slate-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleVisibility('confirm')}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                                    >
                                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                                    <p className="text-[10px] text-red-500 font-bold ml-1 mt-1">Keys do not match</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-16 bg-slate-900 border-none shadow-xl hover:bg-black text-white dark:bg-white dark:text-slate-900 font-black text-base uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                            >
                                <AnimatePresence mode="wait">
                                    {isLoading ? (
                                        <motion.div
                                            key="loading"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex items-center gap-2"
                                        >
                                            <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>ENCRYPTING...</span>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="idle"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex items-center gap-2"
                                        >
                                            <Shield size={20} className="group-hover:scale-125 transition-transform" />
                                            <span>ROTATE SECURITY KEY</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Danger Zone */}
                <Card className="border-none shadow-xl bg-red-50/30 dark:bg-red-950/20 rounded-[3rem] overflow-hidden border border-red-100 dark:border-red-900/40 p-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500">Danger Zone</h4>
                            <p className="text-[10px] font-bold text-red-400 italic mt-1 uppercase">Irreversible account actions</p>
                        </div>
                        <AlertTriangle size={24} className="text-red-500 opacity-50" />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-red-100 dark:border-red-900/20">
                        <div className="space-y-1 text-center sm:text-left text-wrap max-w-xs">
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Delete Account</p>
                            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                Permanently remove your operational identity and data. This action is absolute.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            className="h-14 px-10 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-red-500/20 w-full sm:w-auto"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            <Trash2 size={18} className="mr-2" /> Delete Permanently
                        </Button>
                    </div>
                </Card>

                {/* Delete Confirmation Modal */}
                <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                    <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl bg-white dark:bg-slate-900 p-0 overflow-hidden">
                        <div className="p-10 pb-0">
                            <div className="size-20 rounded-[2rem] bg-red-50 dark:bg-red-950/30 text-red-600 flex items-center justify-center mx-auto mb-8">
                                <AlertTriangle size={40} />
                            </div>
                            <DialogTitle className="text-2xl font-black text-center text-slate-900 dark:text-white tracking-tight uppercase italic">
                                Identity Erasure
                            </DialogTitle>
                            <DialogDescription className="text-center text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pt-4 leading-relaxed px-4">
                                Are you certain you want to erase your operational profile? This action is absolute and cannot be reversed.
                            </DialogDescription>
                        </div>
                        <DialogFooter className="p-10 flex flex-col sm:flex-row gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteAccount}
                                className="flex-1 h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-95"
                                disabled={isDeleting}
                            >
                                {isDeleting ? "ERASING..." : "CONFIRM ERASURE"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-[11px] text-slate-400 font-medium"
                >
                    Lost access? <button className="text-primary font-black hover:underline tracking-tight">Generate recovery bypass link</button>
                </motion.p>
            </div>
        </div>
    );
};

export default Security;
