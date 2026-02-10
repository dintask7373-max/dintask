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

const ManagerLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error, isAuthenticated, role } = useAuthStore();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Parameters incomplete');
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
        <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-slate-950 font-sans">
            {/* Brand Side */}
            <div className="hidden md:flex md:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="relative z-10 text-white space-y-6 max-w-md">
                    <div className="h-14 w-14 rounded-2xl bg-primary-600 flex items-center justify-center mb-6 shadow-xl shadow-primary-900/30">
                        <img src="/dintask-logo.png" alt="DinTask" className="h-9 w-9 object-contain" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">Lead your team to excellence.</h1>
                    <p className="text-slate-400 text-lg">Manage tasks, monitor workspace velocity, and orchestrate project success with the Manager Dashboard.</p>
                </div>
            </div>

            {/* Login Side */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
                {/* Decorative element for mobile */}
                <div className="md:hidden absolute top-0 left-0 w-full h-1 bg-primary-600 shadow-[0_0_20px_rgba(99,116,242,0.5)]" />

                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Manager Portal</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Enter credentials to initialize your management station.</p>
                    </div>

                    <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
                        <CardContent className="pt-8 pb-8 px-8 space-y-6">
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
                                            className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between px-1">
                                        <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security Key</Label>
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
                                            className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-sm font-black bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-primary-900/20 active:scale-95 transition-transform"
                                    disabled={loading}
                                >
                                    {loading ? 'Initializing...' : <><Zap size={16} className="mr-2 fill-current" /> Initialize Session</>}
                                </Button>
                            </form>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-4">
                                    <div className="flex items-center gap-3">
                                        <Shield size={16} className="text-slate-400" />
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                            Demo: <span className="text-slate-700 dark:text-slate-300">manager@dintask.com / manager123</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Not registered?</span>
                                    <Link to="/manager/register" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 hover:text-primary-700 underline decoration-2 underline-offset-4">
                                        Apply for Node
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                        &copy; 2026 DinTask Inc. Management Protocol ACTIVE
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ManagerLogin;
