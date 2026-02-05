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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative overflow-hidden font-sans">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-600" />
            <div className="absolute -top-24 -left-24 size-96 bg-primary-600/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 size-96 bg-indigo-600/5 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[400px] z-10"
            >
                <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white/20">
                    <CardHeader className="text-center space-y-1 pt-10 pb-6 px-8">
                        <div className="flex justify-center mb-6">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full scale-150 group-hover:bg-primary-500/30 transition-all" />
                                <div className="relative p-4 rounded-[2rem] bg-white dark:bg-slate-800 shadow-2xl border border-slate-50 dark:border-slate-800 transition-transform group-hover:scale-110">
                                    {step === 0 && <Mail className="w-10 h-10 text-primary-600" />}
                                    {step === 1 && <KeyRound className="w-10 h-10 text-amber-500" />}
                                    {step === 2 && <Lock className="w-10 h-10 text-rose-500" />}
                                    {step === 3 && <CheckCircle2 className="w-10 h-10 text-emerald-500" />}
                                </div>
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
                            {step === 0 && 'Recall'} {step === 1 && 'Verify'} {step === 2 && 'Set'} {step === 3 && 'Access'} <span className="text-primary-600">{step === 3 ? 'RESTORED' : 'Protocol'}</span>
                        </CardTitle>
                        <CardDescription className="text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] italic mt-2">
                            [{step === 0 && 'IDENTITY_CONFIRMATION'} {step === 1 && 'CIPHER_AUTHENTICATION'} {step === 2 && 'NEW_KEY_GENERATION'} {step === 3 && 'SYNC_COMPLETE'}]
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 px-8 pb-8">
                        {/* Step 0: Email Input */}
                        {step === 0 && (
                            <form onSubmit={handleSendOTP} className="space-y-5">
                                <div className="space-y-2 text-left">
                                    <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Force Identity (Email)</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="SYNC@DINTASK.SOL"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-12 pl-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold text-xs uppercase"
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-[10px] font-black uppercase tracking-[0.2em] transition-all bg-slate-900 hover:bg-primary-600 text-white dark:bg-white dark:text-slate-900 rounded-2xl shadow-xl shadow-slate-900/10"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'DISPATCHING...' : <><Zap size={14} className="mr-2 fill-current" /> Initialize Recall</>}
                                </Button>
                            </form>
                        )}

                        {/* Step 1: OTP Input */}
                        {step === 1 && (
                            <form onSubmit={handleVerifyOTP} className="space-y-5 text-left">
                                <div className="bg-primary-50 dark:bg-primary-900/10 p-3.5 rounded-2xl border border-primary-100 flex items-center gap-3">
                                    <Shield className="size-4 text-primary-600 shrink-0" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-primary-700">Code uplinked to: <span className="italic">{email}</span></p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="otp" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Transmission OTP</Label>
                                    <div className="relative group">
                                        <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <Input
                                            id="otp"
                                            type="text"
                                            placeholder="â€¢ â€¢ â€¢ â€¢ â€¢ â€¢"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="h-12 pl-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-black text-lg tracking-[0.3em] uppercase text-center"
                                            maxLength={6}
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-[10px] font-black uppercase tracking-[0.2em] transition-all bg-slate-900 hover:bg-primary-600 text-white dark:bg-white dark:text-slate-900 rounded-2xl shadow-xl shadow-slate-900/10"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'VALIDATING...' : 'Verify Transmission'}
                                </Button>
                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => setStep(0)}
                                        className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-600"
                                    >
                                        [ RE-INPUT IDENTITY ]
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Step 2: New Password Input */}
                        {step === 2 && (
                            <form onSubmit={handleResetPassword} className="space-y-5 text-left">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-pass" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">New Primary Key</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                            <Input
                                                id="new-pass"
                                                type="password"
                                                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="h-12 pl-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold text-xs"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-pass" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Verify Sequence</Label>
                                        <div className="relative group">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                            <Input
                                                id="confirm-pass"
                                                type="password"
                                                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="h-12 pl-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-[10px] font-black uppercase tracking-[0.2em] transition-all bg-slate-900 hover:bg-primary-600 text-white dark:bg-white dark:text-slate-900 rounded-2xl shadow-xl shadow-slate-900/10"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'UPDATING CORE...' : 'Commit New Cipher'}
                                </Button>
                            </form>
                        )}

                        {/* Step 3: Success */}
                        {step === 3 && (
                            <div className="space-y-8">
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-[2rem] border border-emerald-100 flex flex-col items-center gap-4">
                                    <div className="size-12 rounded-2xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center">
                                        <CheckCircle2 className="size-6 text-emerald-500" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-emerald-700 leading-relaxed text-center italic">
                                        Security protocol updated successfully. Neural link restored. Access verified.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => navigate(returnPath)}
                                    className="w-full h-12 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl shadow-2xl"
                                >
                                    <ArrowLeft size={16} className="mr-2" /> Resume Operation
                                </Button>
                            </div>
                        )}
                    </CardContent>

                    {step !== 3 && (
                        <CardFooter className="px-8 py-6 bg-slate-50/30 dark:bg-slate-900/50 border-t border-slate-50 dark:border-slate-800/50 flex justify-center">
                            <button
                                onClick={() => navigate(returnPath)}
                                className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-2"
                            >
                                <ArrowLeft size={10} /> ABORT_RECALL
                            </button>
                        </CardFooter>
                    )}
                </Card>
                <div className="mt-8 flex justify-center items-center gap-3 text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-40">
                    <Shield size={12} /> SECURE_RECOVERY_PROTOCOL_V4.2
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
