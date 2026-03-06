import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { Briefcase, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import AuthLayout from '@/shared/components/layout/AuthLayout';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error, isAuthenticated, role } = useAuthStore();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

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
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        className="h-12 rounded-xl bg-slate-50 border-none dark:bg-slate-800 font-bold focus-visible:ring-primary-500/20 text-xs"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <Label htmlFor="password" title="password" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Password</Label>
                        <a href="/admin/forgot-password" size="sm" className="text-[10px] font-black text-primary-600 hover:text-primary-500 uppercase tracking-tight">
                            Reset Password
                        </a>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        className="h-12 rounded-xl bg-slate-50 border-none dark:bg-slate-800 font-bold focus-visible:ring-primary-500/20 text-xs"
                    />
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
                <div className="inline-block p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-left w-full">
                    <div className="flex items-center gap-3 text-xs">
                        <KeyRound className="shrink-0 text-slate-400" size={16} />
                        <div>
                            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight">Demo Admin Access</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300">admin@dintask.com / admin123</span>
                        </div>
                    </div>
                </div>

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
