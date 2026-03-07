import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { ShieldCheck, LogIn, Lock, Shield, Zap, Terminal, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/utils/cn';

import AuthLayout from '@/shared/components/layout/AuthLayout';

const ManagerLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error, isAuthenticated, role } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('status') === 'suspended') {
            toast.error("Account suspended by Superadmin", {
                duration: 6000
            });
        }
    }, []);

    // Auto-redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && role === 'manager') {
            navigate('/manager');
        }
    }, [isAuthenticated, role, navigate]);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Parameters incomplete');
            return;
        }

        if (!validateEmail(email)) {
            toast.error('Please enter a valid work email');
            return;
        }

        const result = await login(email, password, 'manager');
        if (result.success) {
            toast.success('Manager force-access verified');
            navigate('/manager');
        } else {
            if (result.error && result.error.includes('pending approval')) {
                navigate('/pending-approval');
            } else {
                toast.error(result.error || 'Authentication sequence failed');
            }
        }
    };

    return (
        <AuthLayout
            brandTitle="Lead your team to excellence."
            brandSubtitle="Manage tasks, monitor workspace velocity, and orchestrate project success with the Manager Dashboard."
            formTitle="Manager Portal"
            formSubtitle="Enter credentials to initialize your management station."
        >
            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Work Email</Label>
                    <div className="relative">
                        <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            id="email"
                            type="email"
                            placeholder="manager@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            className="h-12 pl-11 rounded-xl bg-slate-50 border-none dark:bg-slate-800 font-bold focus-visible:ring-primary-500/20 text-xs text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <Label htmlFor="password" title="password" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security Key</Label>
                        <Link to="/manager/forgot-password" size="sm" className="text-[10px] font-black text-primary-600 hover:text-primary-500 uppercase tracking-tight">
                            Recall Key?
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            className="h-12 pl-11 rounded-xl bg-slate-50 border-none dark:bg-slate-800 font-bold focus-visible:ring-primary-500/20 text-xs text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 text-[10px] font-black uppercase tracking-[0.2em] bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-primary-900/20 active:scale-95 transition-all"
                    disabled={loading}
                >
                    {loading ? 'Initializing...' : <><Zap size={16} className="mr-2 fill-current" /> Initialize Session</>}
                </Button>
            </form>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">


                <div className="flex items-center justify-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Not registered?</span>
                    <Link to="/manager/register" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 hover:text-primary-700 underline decoration-2 underline-offset-4">
                        Apply for Node
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
};

export default ManagerLogin;
