import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { ShieldCheck, LogIn, Lock } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const SalesLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error, isAuthenticated, role } = useAuthStore();
    const navigate = useNavigate();

    // Auto-redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && role === 'sales') {
            navigate('/sales');
        }
    }, [isAuthenticated, role, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
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
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] size-[40%] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] size-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <Card className="w-full max-w-[420px] border-none shadow-2xl shadow-primary-500/10 bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden relative z-10">
                <div className="h-2 bg-gradient-to-r from-primary-600 to-blue-600 w-full" />

                <CardHeader className="text-center space-y-2 pt-10 pb-6">
                    <div className="flex justify-center mb-6">
                        <div className="size-16 rounded-[1.5rem] bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center p-3 relative group">
                            <div className="absolute inset-0 bg-primary-500/20 rounded-[1.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <img src="/dintask-logo.png" alt="DinTask" className="size-full object-contain relative z-10" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                        Sales <span className="text-primary-600">Portal</span>
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Strategic CRM Infrastructure
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Identifier</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="sales@dintask.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 bg-slate-50 border-none rounded-xl font-bold text-sm px-5"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <Label htmlFor="password" text-slate-400 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Key</Label>
                                <a href="/sales/forgot-password" className="text-[9px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-500">
                                    Lost Key?
                                </a>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 bg-slate-50 border-none rounded-xl font-bold text-sm px-5"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 text-xs font-black uppercase tracking-[0.2em] transition-all bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-500/20 rounded-xl"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Decrypting...
                                </div>
                            ) : (
                                <><LogIn size={18} className="mr-2" /> Verify Access</>
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col space-y-5 p-8 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="w-full space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tactical Links</span>
                            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm flex flex-col items-center justify-center text-center group transition-all hover:bg-slate-50">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">New Operator?</p>
                                <Link to="/sales/register" className="text-xs font-black text-primary-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                                    Establish Link
                                </Link>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center text-center">
                                <span className="text-[8px] uppercase font-black tracking-[0.3em] text-primary-500 mb-1">Simulated Access</span>
                                <span className="text-[10px] font-mono font-bold text-slate-300">sales@dintask.com / sales123</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-[8px] font-bold text-slate-400 text-center uppercase tracking-widest">
                        Protected by DinTask Neural Firewall v4.0
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default SalesLogin;
