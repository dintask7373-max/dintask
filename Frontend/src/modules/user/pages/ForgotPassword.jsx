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

const ForgotPassword = ({ returnPath = '/employee/login' }) => {
    // Steps: 0 = Email, 1 = OTP, 2 = New Password, 3 = Success
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // Step 1: Send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Identity required');
            return;
        }
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        setStep(1);
        toast.success(`Cipher sent to ${email}`);
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (!otp || otp.length < 4) {
            toast.error('Invalid OTP length');
            return;
        }
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        setStep(2);
        toast.success('Access Link Verified');
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            toast.error('Parameters incomplete');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Hash mismatch');
            return;
        }
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        setStep(3);
        toast.success('Security protocol updated');
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
                            {step === 1 && 'Confirm Entry'}
                            {step === 2 && 'New Encryption Key'}
                            {step === 3 && 'Access Restored'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            {step === 0 && 'Provide your linked work email to initiate reset.'}
                            {step === 1 && 'A secure cipher has been dispatched to your email.'}
                            {step === 2 && 'Create a strong, unique password for your account.'}
                            {step === 3 && 'Verification protocols complete. Redirecting enabled.'}
                        </p>
                    </div>

                    <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
                        <CardContent className="pt-8 pb-8 px-8 space-y-6">
                            {/* Step 0: Email Input */}
                            {step === 0 && (
                                <form onSubmit={handleSendOTP} className="space-y-4">
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
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Dispatching...' : 'Initiate Recovery'}
                                    </Button>
                                </form>
                            )}

                            {/* Step 1: OTP Input */}
                            {step === 1 && (
                                <form onSubmit={handleVerifyOTP} className="space-y-6">
                                    <div className="space-y-2 text-center">
                                        <Label htmlFor="otp" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Verification Code</Label>
                                        <Input
                                            id="otp"
                                            type="text"
                                            placeholder="••••••"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="h-14 px-5 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-bold text-2xl tracking-[0.4em] text-center"
                                            maxLength={6}
                                        />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-4">
                                            Identity ID: <span className="text-slate-600 dark:text-slate-200 italic">{email}</span>
                                        </p>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-sm font-black bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-primary-900/20"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Decrypting...' : 'Verify Identity'}
                                    </Button>
                                </form>
                            )}

                            {/* Step 2: New Password Input */}
                            {step === 2 && (
                                <form onSubmit={handleResetPassword} className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="new-pass" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">New Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <Input
                                                    id="new-pass"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirm-pass" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirm Identity Key</Label>
                                            <div className="relative">
                                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <Input
                                                    id="confirm-pass"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-sm font-black bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-primary-900/20"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Applying Security...' : 'Commit New Key'}
                                    </Button>
                                </form>
                            )}

                            {/* Step 3: Success */}
                            {step === 3 && (
                                <div className="space-y-6 text-center py-4">
                                    <div className="flex justify-center">
                                        <div className="size-20 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-bounce">
                                            <CheckCircle2 size={40} />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Deployment Success</h3>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 italic leading-relaxed">
                                        Account security protocols updated. Identity verified. You may now proceed to the portal.
                                    </p>
                                    <Button
                                        onClick={() => navigate(returnPath)}
                                        className="w-full h-12 text-sm font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-900/20"
                                    >
                                        Return to Secure Portal
                                    </Button>
                                </div>
                            )}

                            {step < 3 && (
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <Terminal className="text-slate-400 animate-pulse" size={14} />
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
