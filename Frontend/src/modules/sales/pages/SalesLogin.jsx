import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { ShieldCheck, LogIn, Lock, Zap } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import AuthLayout from '@/shared/components/layout/AuthLayout';

const SalesLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // OTP State
    const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const { login, sendOtp, verifyOtp, loading, error, isAuthenticated, role } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loginMethod === 'password') {
            if (!email || !password) {
                toast.error('Tactical credentials required');
                return;
            }

            const result = await login(email, password, 'sales');
            if (result.success) {
                toast.success('Sales access verified');
                navigate('/sales');
            } else {
                if (result.error && result.error.includes('pending approval')) {
                    navigate('/pending-approval');
                } else {
                    toast.error(result.error || 'Authentication failure');
                }
            }
        } else {
            // OTP Flow
            if (!phone) {
                toast.error('Tactical comms required');
                return;
            }

            if (!otpSent) {
                const result = await sendOtp(phone, 'sales');
                if (result && result.success) {
                    setOtpSent(true);
                    toast.success('Signal established. Enter code.');
                } else {
                    toast.error(result?.error || 'Signal lost');
                }
            } else {
                if (!otp) {
                    toast.error('Enter access code');
                    return;
                }
                const result = await verifyOtp(phone, otp, 'sales');
                if (result && result.success) {
                    toast.success('Access Granted');
                    navigate('/sales');
                } else {
                    if (result?.error && result.error.includes('pending approval')) {
                        navigate('/pending-approval');
                    } else {
                        toast.error(result?.error || 'Access Denied');
                    }
                }
            }
        }
    };

    return (
        <AuthLayout
            brandTitle="Strategic CRM Infrastructure"
            brandSubtitle="Empower your sales force with real-time intelligence, automated lead tracking, and performance analytics."
            formTitle="Sales Terminal"
            formSubtitle="Authorization required to establish secure uplink"
            bgImage="/WLCOMPAGE .png"
        >
            <div className="mb-6">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => setLoginMethod('password')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${loginMethod === 'password' ? 'bg-white dark:bg-slate-900 shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Lock size={14} /> Password
                    </button>
                    <button
                        onClick={() => setLoginMethod('otp')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${loginMethod === 'otp' ? 'bg-white dark:bg-slate-900 shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Zap size={14} /> Secure Link
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {loginMethod === 'password' ? (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Operator ID</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="operator@dintask.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="username"
                                className="h-12 px-5 bg-slate-50 border-none dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-bold text-xs focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary-500/10 transition-all duration-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Access Key</Label>
                                <Link to="/sales/forgot-password" size="sm" className="text-[10px] font-black text-primary-600 hover:underline uppercase tracking-wide">
                                    Lost?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                className="h-12 px-5 bg-slate-50 border-none dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-bold text-xs focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary-500/10 transition-all duration-200"
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Uplink Number</Label>
                            <Input
                                id="phone"
                                type="text"
                                placeholder="9876543210"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={otpSent}
                                className="h-12 px-5 bg-slate-50 border-none dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-bold text-xs focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary-500/10 transition-all duration-200"
                            />
                        </div>
                        {otpSent && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <Label htmlFor="otp" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Access Code</Label>
                                    <button
                                        type="button"
                                        onClick={() => { setOtpSent(false); setOtp(''); }}
                                        className="text-[10px] text-primary-600 font-black uppercase hover:underline"
                                    >
                                        Resync
                                    </button>
                                </div>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="XXXXXX"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="h-12 px-5 bg-slate-50 border-none dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-bold text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary-500/10 transition-all duration-200 tracking-widest text-center text-lg"
                                />
                            </div>
                        )}
                    </>
                )}

                <Button
                    type="submit"
                    className="w-full h-12 text-[10px] font-black uppercase tracking-[0.2em] bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-xl shadow-primary-600/20 active:scale-95 transition-all mt-2 group"
                    disabled={loading}
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Establishing...</span>
                        </div>
                    ) : (
                        <><LogIn size={16} className="mr-2 group-hover:translate-x-1 transition-transform" /> {loginMethod === 'password' ? 'Verify Access' : (otpSent ? 'Confirm Uplink' : 'Request Uplink')}</>
                    )}
                </Button>
            </form>

            <div className="text-center mt-10 space-y-4">
                <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    New Operator? <Link to="/sales/register" className="text-primary-600 hover:underline ml-1 font-bold">Establish Link</Link>
                </p>
                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                    Protected by DinTask Neural Firewall v4.0
                </p>
            </div>
        </AuthLayout>
    );
};

export default SalesLogin;
