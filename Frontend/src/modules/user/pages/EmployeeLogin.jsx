import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { User, LogIn } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import AuthLayout from '@/shared/components/layout/AuthLayout';

const EmployeeLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // OTP State
    const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const { login, sendOtp, verifyOtp, loading, error, isAuthenticated, role, checkEmail } = useAuthStore();
    const [emailError, setEmailError] = useState('');
    const navigate = useNavigate();

    const handleEmailBlur = async () => {
        if (!email || loginMethod !== 'password') return;
        const result = await checkEmail(email, 'employee');
        if (result.success) {
            if (!result.exists) {
                setEmailError('Personnel email not found');
                toast.error('Identity Mismatch: Record not found');
            } else if (result.role && result.role !== 'employee') {
                let normRole = result.role;
                if (normRole === 'sales_executive') normRole = 'sales';
                setEmailError(`Registered as ${normRole.toUpperCase()}`);
                toast.error(`Wrong Portal: This email belongs to a ${normRole.toUpperCase()}.`);
            } else {
                setEmailError('');
            }
        }
    };
 
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('status') === 'suspended') {
            toast.error("Account suspended by Superadmin", {
                duration: 6000
            });
        }
    }, []);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (loginMethod === 'password') {
            if (emailError) {
                toast.error(emailError);
                return;
            }
            if (!email || !password) {
                toast.error('Tactical credentials required');
                return;
            }

            if (!validateEmail(email)) {
                toast.error('Please enter a valid personnel email');
                return;
            }

            const result = await login(email, password, 'employee');
            if (result.success) {
                toast.success('Personnel verified');
                navigate('/employee/dashboard');
            } else {
                if (result.error && result.error.includes('pending approval')) {
                    navigate('/pending-approval');
                } else {
                    toast.error(result.error || 'Identity verification failed');
                }
            }
        } else {
            // ... OTP flow ...
            if (!phone) {
                toast.error('Mobile uplink required');
                return;
            }

            if (!otpSent) {
                const result = await sendOtp(phone, 'employee');
                if (result && result.success) {
                    setOtpSent(true);
                    toast.success('Transmission sent. Verify code.');
                } else {
                    toast.error(result?.error || 'Link establishment failed');
                }
            } else {
                if (!otp) {
                    toast.error('Input access code');
                    return;
                }
                const result = await verifyOtp(phone, otp, 'employee');
                if (result && result.success) {
                    toast.success('Access Granted');
                    navigate('/employee/dashboard');
                } else {
                    if (result?.error && result.error.includes('pending approval')) {
                        navigate('/pending-approval');
                    } else {
                        toast.error(result?.error || 'Verification failed');
                    }
                }
            }
        }
    };

    return (
        <AuthLayout
            brandTitle="Workforce Operations Portal"
            brandSubtitle="Access your tactical task board, manage your schedule, and stay connected with your team."
            formTitle="Employee Login"
            formSubtitle="Sign in to initialize your field operations dashboard."
            bgImage="/WLCOMPAGE .png"
        >
            {/* Method Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
                <button
                    type="button"
                    onClick={() => { setLoginMethod('password'); setEmailError(''); }}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${loginMethod === 'password' ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Standard
                </button>
                <button
                    type="button"
                    onClick={() => { setLoginMethod('otp'); setEmailError(''); }}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${loginMethod === 'otp' ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Mobile Link
                </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                {loginMethod === 'password' ? (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Personnel Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setEmailError('');
                                }}
                                onBlur={handleEmailBlur}
                                autoComplete="email"
                                className={`h-12 px-5 bg-slate-50 border-none dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-bold text-xs focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary-500/10 transition-all duration-200 ${emailError ? 'ring-2 ring-red-500/50' : ''}`}
                            />
                            {emailError && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{emailError}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <Label htmlFor="password" title="password" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Access Key</Label>
                                <a href="/employee/forgot-password" size="sm" className="text-[10px] font-black text-primary-600 hover:underline uppercase tracking-wide">
                                    Lost?
                                </a>
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

                        <div className="flex items-center px-1">
                            <label className="flex items-center group cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="size-4 rounded border-slate-200 text-primary-600 focus:ring-primary-600 transition-all cursor-pointer"
                                />
                                <span className="ml-2.5 text-[10px] font-black text-slate-500 group-hover:text-slate-700 transition-colors uppercase tracking-widest">Keep Connected</span>
                            </label>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Uplink Number</Label>
                            <Input
                                id="phone"
                                type="text"
                                placeholder="91XXXXXXXX"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={otpSent}
                                className="h-12 px-5 bg-slate-50 border-none dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-bold text-xs focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary-500/10 transition-all duration-200"
                            />
                        </div>
                        {otpSent && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <Label htmlFor="otp" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Verification Code</Label>
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
                            <span>Processing...</span>
                        </div>
                    ) : (
                        <><LogIn size={16} className="mr-2 group-hover:translate-x-1 transition-transform" /> {loginMethod === 'password' ? 'Verify Personnel' : (otpSent ? 'Confirm Link' : 'Establish Link')}</>
                    )}
                </Button>
            </form>

            <div className="text-center mt-10 space-y-4">
                <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Need Help? <Link to="/employee/contact-support" className="text-primary-600 hover:underline ml-1 font-bold">Contact Node Admin</Link>
                </p>
                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                    Secure Terminal Access v4.2.1
                </p>
            </div>
        </AuthLayout>
    );
};

export default EmployeeLogin;
