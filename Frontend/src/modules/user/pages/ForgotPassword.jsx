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
        <div className="min-h-screen w-full bg-slate-50 relative flex flex-col items-center justify-start font-sans overflow-x-hidden">
            {/* Horizontal Top Background */}
            <div className="w-full h-[320px] relative overflow-hidden">
                <img
                    src="/WLCOMPAGE .png"
                    alt="Background"
                    className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
            </div>

            {/* Premium Forgot Password Card */}
            <div className="w-full max-w-[440px] -mt-24 px-4 relative z-10 pb-20">
                <div className="bg-white rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] p-10 md:p-12 border border-white/40">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">
                            {step === 0 && 'Reset'}
                            {step === 1 && 'Verify'}
                            {step === 2 && 'New Key'}
                            {step === 3 && 'Restored'}
                        </h1>
                        <p className="text-slate-400 text-xs font-medium italic">
                            {step === 0 && 'Confirm your identity'}
                            {step === 1 && 'Enter verification code'}
                            {step === 2 && 'Create new credentials'}
                            {step === 3 && 'Password successfully updated'}
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Step 0: Email Input */}
                        {step === 0 && (
                            <form onSubmit={handleSendOTP} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 px-5 bg-slate-50 border-slate-100 rounded-xl text-slate-900 font-medium text-sm placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-[#4461f2]/10 transition-all duration-200"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-sm font-bold bg-[#4461f2] hover:bg-[#3451e2] text-white rounded-xl shadow-lg shadow-[#4461f2]/20 transition-all active:scale-[0.98] mt-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Processing...' : 'Send Recovery Code'}
                                </Button>
                            </form>
                        )}

                        {/* Step 1: OTP Input */}
                        {step === 1 && (
                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="otp" className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Verification Code</Label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="• • • • • •"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="h-12 px-5 bg-slate-50 border-slate-100 rounded-xl text-slate-900 font-bold text-xl tracking-[0.4em] text-center placeholder:text-slate-200 focus:bg-white focus:ring-2 focus:ring-[#4461f2]/10 transition-all duration-200"
                                        maxLength={6}
                                    />
                                    <p className="text-[10px] text-center text-slate-400 mt-2 font-bold uppercase tracking-wider italic">Sent to: {email}</p>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-sm font-bold bg-[#4461f2] hover:bg-[#3451e2] text-white rounded-xl shadow-lg shadow-[#4461f2]/20 transition-all active:scale-[0.98] mt-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Verifying...' : 'Verify Access'}
                                </Button>
                                <button type="button" onClick={() => setStep(0)} className="w-full text-center text-[11px] font-bold text-slate-400 hover:text-[#4461f2] uppercase tracking-[0.15em]">
                                    Use Different ID
                                </button>
                            </form>
                        )}

                        {/* Step 2: New Password Input */}
                        {step === 2 && (
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-pass" className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">New Password</Label>
                                        <Input
                                            id="new-pass"
                                            type="password"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="h-12 px-5 bg-slate-50 border-slate-100 rounded-xl text-slate-900 font-medium text-sm placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-[#4461f2]/10 transition-all duration-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-pass" className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Confirm Password</Label>
                                        <Input
                                            id="confirm-pass"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="h-12 px-5 bg-slate-50 border-slate-100 rounded-xl text-slate-900 font-medium text-sm placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-[#4461f2]/10 transition-all duration-200"
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-sm font-bold bg-[#4461f2] hover:bg-[#3451e2] text-white rounded-xl shadow-lg shadow-[#4461f2]/20 transition-all active:scale-[0.98] mt-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Updating...' : 'Set New Credentials'}
                                </Button>
                            </form>
                        )}

                        {/* Step 3: Success */}
                        {step === 3 && (
                            <div className="space-y-8 text-center">
                                <div className="py-4 flex justify-center">
                                    <div className="size-20 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]">
                                        <CheckCircle2 size={40} />
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-slate-500 max-w-[280px] mx-auto italic leading-relaxed">
                                    Your account security has been restored. You can now sign in with your new password.
                                </p>
                                <Button
                                    onClick={() => navigate(returnPath)}
                                    className="w-full h-12 text-sm font-bold bg-[#4461f2] hover:bg-[#3451e2] text-white rounded-xl shadow-lg shadow-[#4461f2]/20 transition-all active:scale-[0.98]"
                                >
                                    Return to Sign In
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 text-center text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em] italic">
                        Access Security Protocol ACTIVE
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
