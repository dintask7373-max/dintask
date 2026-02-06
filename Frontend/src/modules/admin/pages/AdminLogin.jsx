import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { Briefcase, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const success = await login(email, password, 'admin');
        if (success) {
            toast.success('Access Granted');
            navigate('/admin');
        } else {
            toast.error(error || 'Authentication failed');
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
                    <h1 className="text-4xl font-bold tracking-tight">Manage your team with confidence.</h1>
                    <p className="text-slate-400 text-lg">Streamline operations, track performance, and boost productivity with DinTask for Business.</p>
                </div>
            </div>

            {/* Login Side */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Portal</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Please sign in to access your administrative dashboard.</p>
                    </div>

                    <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
                        <CardContent className="pt-8 pb-8 px-6 space-y-6">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Work Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-11 rounded-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <a href="/admin/forgot-password" className="text-xs font-bold text-primary-600 hover:text-primary-500 uppercase tracking-tight">
                                            Reset Password
                                        </a>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-11 rounded-lg"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 text-base font-black bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-900/20"
                                    disabled={loading}
                                >
                                    {loading ? 'Authenticating...' : 'Secure Sign In'}
                                </Button>
                            </form>

                            <div className="text-center pt-2 space-y-4">
                                <div className="inline-block p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-left w-full">
                                    <div className="flex items-center gap-3 text-xs">
                                        <KeyRound className="shrink-0 text-slate-400" size={16} />
                                        <div>
                                            <span className="block font-bold text-slate-700 dark:text-slate-300">Demo Admin Access</span>
                                            <span className="font-mono text-slate-500">admin@dintask.com / admin123</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Need a platform for your team?</span>
                                    <Link to="/admin/register" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 hover:text-primary-700 underline decoration-2 underline-offset-4">
                                        Register Now
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <p className="text-center text-xs text-slate-400">
                        &copy; 2026 DinTask Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
