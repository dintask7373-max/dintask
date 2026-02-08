import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { User, LogIn } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const EmployeeLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error, isAuthenticated, role } = useAuthStore();
    const navigate = useNavigate();

    // Auto-redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && role === 'employee') {
            navigate('/employee');
        }
    }, [isAuthenticated, role, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        const result = await login(email, password, 'employee');
        if (result.success) {
            toast.success('Welcome back!');
            navigate('/employee');
        } else {
            if (result.error && result.error.includes('pending approval')) {
                navigate('/pending-approval');
            } else {
                toast.error(result.error || 'Login failed');
            }
        }
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

            {/* Premium Sign In Card */}
            <div className="w-full max-w-[440px] -mt-24 px-4 relative z-10 pb-20">
                <div className="bg-white rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] p-10 md:p-12 border border-white/40">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Sign in</h1>
                        <p className="text-slate-400 text-xs font-medium italic">Enter your credentials to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
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

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 px-5 bg-slate-50 border-slate-100 rounded-xl text-slate-900 font-medium text-sm placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-[#4461f2]/10 transition-all duration-200"
                            />
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center group cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="size-4 rounded border-slate-200 text-[#4461f2] focus:ring-[#4461f2] transition-all cursor-pointer"
                                />
                                <span className="ml-2.5 text-[11px] font-semibold text-slate-500 group-hover:text-slate-700 transition-colors uppercase tracking-wide">Remember</span>
                            </label>
                            <Link to="/employee/forgot-password" size="sm" className="text-[11px] font-bold text-[#4461f2] hover:underline uppercase tracking-wide">
                                Forgot?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-sm font-bold bg-[#4461f2] hover:bg-[#3451e2] text-white rounded-xl shadow-lg shadow-[#4461f2]/20 transition-all active:scale-[0.98] mt-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                "Sign in"
                            )}
                        </Button>
                    </form>

                    <div className="text-center mt-10">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                            No account? <Link to="/employee/register" className="text-[#4461f2] hover:underline ml-1 font-bold">Register</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeLogin;
