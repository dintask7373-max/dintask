import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send, KeyRound, Lock, CheckCircle2, Shield, Zap, Terminal } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/utils/cn';

import useAuthStore from '@/store/authStore';

const ForgotPassword = ({ returnPath = '/employee/login' }) => {
    // Steps: 0 = Email, 1 = Success
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState('');
    const { forgotPassword, loading, error, clearError } = useAuthStore();

    const navigate = useNavigate();

    // Determine role based on returnPath
    const getRoleFromPath = () => {
        if (returnPath.includes('/admin')) return 'admin';
        if (returnPath.includes('/manager')) return 'manager';
        if (returnPath.includes('/sales')) return 'sales';
        if (returnPath.includes('/superadmin')) return 'superadmin';
        return 'employee';
    };

    const handleSendResetLink = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Identity required');
            return;
        }

        const role = getRoleFromPath();
        const result = await forgotPassword(email, role);

        if (result.success) {
            setStep(1);
            toast.success(`Encrypted reset link dispatched to ${email}`);
        } else {
            toast.error(result.error || 'Failed to initiate recovery');
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-slate-950 font-sans">
            {/* Brand Side */}
            <div className="hidden md:flex md:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="relative z-10 text-white space-y-6 max-w-md">
                    <div className="h-14 w-14 rounded-2xl bg-primary-600 flex items-center justify-center mb-6 shadow-xl shadow-primary-900/30">
                        <img src="/dintask-logo.png" alt="DinTask" className="h-9 w-9 object-contain" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">Security & Identity Management</h1>
                    <p className="text-slate-400 text-lg">Regain access to your tactical workspace through our encrypted recovery protocol.</p>

                    <div className="pt-8 grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <Shield className="text-primary-400 mb-2" size={20} />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Hardened</h3>
                            <p className="text-[10px] text-slate-500">End-to-end encryption for all recovery steps.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <Zap className="text-amber-400 mb-2" size={20} />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Swift</h3>
                            <p className="text-[10px] text-slate-500">Real-time OTP delivery via secure channels.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Side */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
                {/* Decorative element for mobile */}
                <div className="md:hidden absolute top-0 left-0 w-full h-1 bg-primary-600 shadow-[0_0_20px_rgba(99,116,242,0.5)]" />

                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="text-center md:text-left">
                        <button
                            onClick={() => step > 0 ? setStep(step - 1) : navigate(returnPath)}
                            className="group mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-600 transition-colors"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            {step === 0 ? 'Back to Login' : 'Previous Step'}
                        </button>

                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                            {step === 0 && 'Identity Recovery'}
                            {step === 1 && 'Cipher Dispatched'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            {step === 0 && 'Provide your linked work email to initiate reset.'}
                            {step === 1 && 'A secure recovery link has been sent to your primary inbox.'}
                        </p>
                    </div>

                    <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
                        <CardContent className="pt-8 pb-8 px-8 space-y-6">
                            {/* Step 0: Email Input */}
                            {step === 0 && (
                                <form onSubmit={handleSendResetLink} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Work Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="admin@company.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-sm font-black bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-primary-900/20"
                                        disabled={loading}
                                    >
                                        {loading ? 'Dispatching...' : 'Initiate Recovery'}
                                    </Button>
                                </form>
                            )}

                            {/* Step 1: Success */}
                            {step === 1 && (
                                <div className="space-y-6 text-center py-4">
                                    <div className="flex justify-center">
                                        <div className="size-20 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-bounce">
                                            <CheckCircle2 size={40} />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Dispatch Success</h3>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 italic leading-relaxed">
                                        Please check your email <b>{email}</b> for instructions to reset your password. The link will expire in 10 minutes.
                                    </p>
                                    <Button
                                        onClick={() => navigate(returnPath)}
                                        className="w-full h-12 text-sm font-black bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg"
                                    >
                                        Return to Secure Portal
                                    </Button>
                                </div>
                            )}

                            {step < 2 && (
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <Terminal className="text-primary-500 animate-pulse" size={14} />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            L2 Identity Recovery Tunnel ACTIVE
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                        &copy; 2026 DinTask Inc. Recovery Node • DT-REC-009
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
