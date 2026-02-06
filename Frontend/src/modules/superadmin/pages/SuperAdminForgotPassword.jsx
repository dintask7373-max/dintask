import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, KeyRound, Lock, CheckCircle2, Shield, Zap, Terminal } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const SuperAdminForgotPassword = () => {
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

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
        toast.success(`Recall cipher sent to ${email}`);
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (!otp || otp.length < 4) {
            toast.error('Invalid OTP');
            return;
        }
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        setStep(2);
        toast.success('Root Identity Verified');
    };

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
        toast.success('Access keys restored');
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-slate-950 font-sans">
            {/* Brand Side - Exact match with Admin */}
            <div className="hidden md:flex md:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="relative z-10 text-white space-y-6 max-w-md">
                    <div className="h-14 w-14 rounded-2xl bg-primary-600 flex items-center justify-center mb-6 shadow-xl shadow-primary-900/30">
                        <img src="/dintask-logo.png" alt="DinTask" className="h-9 w-9 object-contain" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">Security & Recovery.</h1>
                    <p className="text-slate-400 text-lg">Follow the encrypted recovery protocol to restore your master access safely.</p>
                </div>
            </div>

            {/* Recovery Side */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Account Recovery</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                            {step === 0 && 'Enter your root email to initiate recall.'}
                            {step === 1 && 'Authentication code sent to your inbox.'}
                            {step === 2 && 'Set a new secure master password.'}
                            {step === 3 && 'Access successfully restored.'}
                        </p>
                    </div>

                    <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
                        <CardContent className="pt-10 pb-10 px-6 space-y-6">
                            <AnimatePresence mode="wait">
                                {step === 0 && (
                                    <motion.form key="s0" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onSubmit={handleSendOTP} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Root Email</Label>
                                            <Input id="email" type="email" placeholder="root@dintask.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-lg" />
                                        </div>
                                        <Button type="submit" className="w-full h-11 text-base font-black bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-900/20" disabled={isLoading}>
                                            {isLoading ? 'Processing...' : 'Send Recovery Code'}
                                        </Button>
                                    </motion.form>
                                )}

                                {step === 1 && (
                                    <motion.form key="s1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onSubmit={handleVerifyOTP} className="space-y-4">
                                        <div className="space-y-2 text-center">
                                            <Label className="text-slate-500 font-medium">Verify 6-digit code</Label>
                                            <Input id="otp" placeholder="• • • • • •" value={otp} onChange={(e) => setOtp(e.target.value)} className="h-14 text-center text-3xl font-black tracking-[0.5em] rounded-xl bg-slate-50 border-none" maxLength={6} />
                                        </div>
                                        <Button type="submit" className="w-full h-11 text-base font-black bg-primary-600 hover:bg-primary-700 text-white" disabled={isLoading}>
                                            {isLoading ? 'Verifying...' : 'Authenticate'}
                                        </Button>
                                        <button type="button" onClick={() => setStep(0)} className="w-full text-xs font-bold text-slate-400 hover:text-primary-600 uppercase tracking-widest">Resend Cipher</button>
                                    </motion.form>
                                )}

                                {step === 2 && (
                                    <motion.form key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onSubmit={handleResetPassword} className="space-y-4">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="new-pass">New Password</Label>
                                                <Input id="new-pass" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-11 rounded-lg" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirm-pass">Confirm Hash</Label>
                                                <Input id="confirm-pass" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-11 rounded-lg" />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full h-11 text-base font-black bg-primary-600 hover:bg-primary-700 text-white" disabled={isLoading}>
                                            {isLoading ? 'Syncing Key...' : 'Commit System Over-ride'}
                                        </Button>
                                    </motion.form>
                                )}

                                {step === 3 && (
                                    <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
                                        <div className="size-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 mx-auto flex items-center justify-center">
                                            <CheckCircle2 size={40} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase italic tracking-tighter">Protocol Restored</h3>
                                            <p className="text-slate-500 text-xs mt-1 font-medium uppercase tracking-widest">Master access key re-synchronized.</p>
                                        </div>
                                        <Button onClick={() => navigate('/superadmin/login')} className="w-full h-11 text-base font-black bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-lg">Return to Terminal</Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {step !== 3 && (
                                <div className="text-center pt-2 border-t border-slate-100 flex items-center justify-center gap-2">
                                    <Link to="/superadmin/login" className="text-xs font-bold text-slate-400 hover:text-primary-600 uppercase tracking-widest flex items-center gap-2">
                                        <ArrowLeft size={14} /> Back to Sign In
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <p className="text-center text-xs text-slate-400 font-mono italic">
                        RECOVERY TERMINAL &copy; 2026 DINTASK
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminForgotPassword;
