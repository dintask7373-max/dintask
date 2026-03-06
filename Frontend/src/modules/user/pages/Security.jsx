import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/utils/cn';
import { fadeInUp } from '@/shared/utils/animations';

const Security = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
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
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            toast.success('Password updated successfully');
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            toast.error('Failed to update password. Please try again.');
        } finally {
            setIsLoading(false);
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
                            <Label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-[0.15em]">Entry Key (Current)</Label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                                <Input
                                    type={showPasswords.current ? "text" : "password"}
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    placeholder="Enter current password"
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
                                <Label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-[0.15em]">New Security Key</Label>
                                <div className="relative group">
                                    <Shield className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                                    <Input
                                        type={showPasswords.new ? "text" : "password"}
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        placeholder="Min. 8 characters"
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
                                <Label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-[0.15em]">Confirm Key</Label>
                                <div className="relative group">
                                    <Shield className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                                    <Input
                                        type={showPasswords.confirm ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        placeholder="Verify new key"
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
                                className="w-full h-16 bg-primary text-white font-black rounded-3xl shadow-2xl shadow-primary/30 hover:shadow-primary/40 active:scale-[0.98] transition-all text-base uppercase tracking-[0.1em] flex items-center justify-center gap-3 overflow-hidden group"
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
                                            <span>Encrypting...</span>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="idle"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex items-center gap-2"
                                        >
                                            <CheckCircle2 size={20} className="group-hover:scale-125 transition-transform" />
                                            <span>Secure Update</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Button>
                        </div>
                    </form>
                </Card>

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
