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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative overflow-hidden font-sans">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-600" />
            <div className="absolute -top-24 -left-24 size-96 bg-primary-600/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 size-96 bg-indigo-600/5 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[400px] z-10"
            >
                <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white/20">
                    <CardHeader className="text-center space-y-1 pt-10 pb-6 px-8">
                        <div className="flex justify-center mb-6">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full scale-150 group-hover:bg-primary-500/30 transition-all" />
                                <div className="relative p-4 rounded-[2rem] bg-white dark:bg-slate-800 shadow-2xl border border-slate-50 dark:border-slate-800 transition-transform group-hover:scale-110">
                                    <img src="/dintask-logo.png" alt="DinTask" className="h-12 w-12 object-contain" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-slate-900 text-white shadow-xl">
                                    <Shield size={14} className="fill-current" />
                                </div>
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
                            Manager <span className="text-primary-600">Access</span>
                        </CardTitle>
                        <CardDescription className="text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] italic">
                            [ INTERNAL_COMMAND_STATION_O1 ]
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 px-8 pb-8">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Force Identity (Email)</Label>
                                <div className="relative group">
                                    <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="SYNC@DINTASK.SOL"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 pl-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold text-xs uppercase tracking-tight placeholder:text-slate-200"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <Label htmlFor="password" className="text-[9px] font-black uppercase tracking-widest text-slate-400">Security Cipher</Label>
                                    <a href="#" className="text-[9px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-500 transition-colors">
                                        RECALL KEY?
                                    </a>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 pl-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold text-xs"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-[10px] font-black uppercase tracking-[0.2em] transition-all bg-slate-900 hover:bg-primary-600 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-primary-600 dark:hover:text-white rounded-2xl shadow-xl shadow-slate-900/10 active:scale-95"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="size-4 animate-spin rounded-full border-2 border-slate-400 border-t-white" />
                                        SYNCHRONIZING...
                                    </div>
                                ) : (
                                    <><Zap size={14} className="mr-2 fill-current" /> Initialize Session</>
                                )}
                            </Button>
                        </form>

                        <div className="flex items-center gap-4 py-2">
                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                            <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">or initialize link</span>
                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 space-y-3 relative group overflow-hidden transition-all hover:bg-primary-50/50">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary-600 transition-all">Tactical Assets</span>
                                <Globe size={11} className="text-slate-300 animate-spin-slow" />
                            </div>
                            <div className="space-y-1.5 relative z-10">
                                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500">
                                    <span>ID: manager@dintask.com</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500">
                                    <span>KEY: manager123</span>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-2 opacity-10 blur-sm pointer-events-none group-hover:scale-150 transition-transform">
                                <img src="/dintask-logo.png" alt="" className="size-16 grayscale" />
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="px-8 py-6 bg-slate-50/30 dark:bg-slate-900/50 border-t border-slate-50 dark:border-slate-800/50 flex justify-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            Force Node Missing? <Link to="/manager/register" className="text-primary-600 dark:text-primary-400 hover:underline">REGISTER ASSET</Link>
                        </p>
                    </CardFooter>
                </Card>
                <div className="mt-8 flex justify-center items-center gap-3 text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-40">
                    <ShieldCheck size={12} /> SECURE_UPLINK_READY_V4.2
                </div>
            </motion.div>
        </div>
    );
};

export default ManagerLogin;
