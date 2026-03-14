import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { Briefcase, KeyRound, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import AuthLayout from '@/shared/components/layout/AuthLayout';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, loading, error, isAuthenticated, role, checkEmail } = useAuthStore();
    const navigate = useNavigate();

    const handleEmailBlur = async () => {
        if (!email) return;
        const result = await checkEmail(email, 'admin');
        if (result.success) {
            if (!result.exists) {
                setEmailError('Email not found in our records');
                toast.error('Identity Mismatch: This email is not registered');
            } else if (result.role && result.role !== 'admin') {
                // Check for normalized roles
                let normRole = result.role;
                if (normRole === 'sales_executive') normRole = 'sales';

                setEmailError(`Registered as ${normRole.toUpperCase()}`);
                toast.error(`Wrong Portal: This email is registered as a ${normRole.toUpperCase()}. Please use the correct login page.`);
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

    const handleLogin = async (e) => {
        e.preventDefault();

        if (emailError) {
            toast.error(emailError);
            return;
        }

        const result = await login(email, password, 'admin');
        if (result.success) {
            toast.success('Access Granted');
            navigate('/admin');
        } else {
            toast.error(result.error || 'Authentication failed');
        }
    };

    return (
        <AuthLayout
            brandTitle="Manage your team with confidence."
            brandSubtitle="Streamline operations, track performance, and boost productivity with DinTask for Business."
            formTitle="Admin Portal"
            formSubtitle="Please sign in to access your administrative dashboard."
        >
            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Work Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="admin@company.com"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailError('');
                        }}
                        onBlur={handleEmailBlur}
                        autoComplete="email"
                        className={`h-12 rounded-xl bg-slate-50 border-none dark:bg-slate-800 font-bold focus-visible:ring-primary-500/20 text-xs ${emailError ? 'ring-2 ring-red-500/50' : ''}`}
                    />
                    {emailError && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{emailError}</p>}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <Label htmlFor="password" title="password" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Password</Label>
                        <a href="/admin/forgot-password" size="sm" className="text-[10px] font-black text-primary-600 hover:text-primary-500 uppercase tracking-tight">
                            Reset Password
                        </a>
                    </div>
                    <div className="relative group/pass">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            className="h-12 rounded-xl bg-slate-50 border-none dark:bg-slate-800 font-bold focus-visible:ring-primary-500/20 text-xs w-full pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors p-1"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 text-[10px] font-black uppercase tracking-[0.2em] bg-primary-600 hover:bg-primary-700 text-white shadow-xl shadow-primary-900/20 rounded-xl active:scale-95 transition-all"
                    disabled={loading}
                >
                    {loading ? 'Authenticating...' : 'Secure Sign In'}
                </Button>
            </form>

            <div className="text-center pt-2 space-y-4">


                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Need a platform for your team?</span>
                    <Link to="/admin/register" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 hover:text-primary-700 underline decoration-2 underline-offset-4">
                        Register Now
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
};

export default AdminLogin;
