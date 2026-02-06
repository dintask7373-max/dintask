import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import useEmployeeStore from '@/store/employeeStore';
import { ShieldCheck, UserPlus, Link2, User, Mail, Lock, Shield, Zap, Terminal } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const ManagerRegister = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const referralCode = queryParams.get('ref');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const addPendingRequest = useEmployeeStore(state => state.addPendingRequest);

    const handleRegister = async (e) => {
        e.preventDefault();
        const { fullName, email, password, confirmPassword } = formData;

        if (!fullName || !email || !password || !confirmPassword) {
            toast.error('Parameters incomplete');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Hash mismatch');
            return;
        }

        setLoading(true);

        try {
            if (referralCode) {
                addPendingRequest({
                    fullName,
                    email,
                    password,
                    workspaceId: referralCode,
                    role: 'Manager'
                });
                toast.success('Join request sent! Awaiting Admin authorization.');
                navigate('/employee/success-join');
            } else {
                await new Promise(resolve => setTimeout(resolve, 1500));
                toast.success('Manager application submitted. Verify keys below.');
                navigate('/manager/login');
            }
        } catch {
            toast.error('Registration sequence aborted. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative overflow-hidden font-sans">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-600" />
            <div className="absolute -top-24 -left-24 size-96 bg-primary-600/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 size-96 bg-indigo-600/5 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[420px] z-10"
            >
                <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white/20">
                    <CardHeader className="text-center space-y-1 pt-10 pb-6 px-8">
                        <div className="flex justify-center mb-6">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full scale-150 group-hover:bg-primary-500/30 transition-all" />
                                <div className={cn(
                                    "relative p-4 rounded-[2rem] bg-white dark:bg-slate-800 shadow-2xl border transition-all duration-500 group-hover:rotate-6",
                                    referralCode ? "border-emerald-100 dark:border-emerald-900/20 text-emerald-600" : "border-primary-100 dark:border-primary-900/20 text-primary-600"
                                )}>
                                    {referralCode ? <Link2 className="w-10 h-10" /> : <ShieldCheck className="w-10 h-10" />}
                                </div>
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
                            {referralCode ? 'Join' : 'Register'} <span className="text-primary-600">Asset</span>
                        </CardTitle>
                        <CardDescription className="text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] italic mt-2">
                            {referralCode ? (
                                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full">
                                    NODE_UPLINK: {referralCode}
                                </span>
                            ) : '[ NEW_FORCE_APPLICATION ]'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 px-8 pb-8">
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Asset Nomenclature</Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                    <Input
                                        id="fullName"
                                        type="text"
                                        placeholder="FULL_NAME"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="h-11 pl-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold text-xs uppercase"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Force Identity (Email)</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="SYNC@DINTASK.SOL"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="h-11 pl-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold text-xs uppercase"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Key</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="h-11 pl-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold text-xs"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Verify Key</Label>
                                    <div className="relative group">
                                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="h-11 pl-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold text-xs"
                                        />
                                    </div>
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
                                        COMMITTING...
                                    </div>
                                ) : (
                                    <><Zap size={14} className="mr-2 fill-current" /> Register Profile</>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="px-8 py-6 bg-slate-50/30 dark:bg-slate-900/50 border-t border-slate-50 dark:border-slate-800/50 flex justify-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            Already Authenticated? <Link to="/manager/login" className="text-primary-1000 dark:text-primary-400 hover:underline">LOGIN ASSET</Link>
                        </p>
                    </CardFooter>
                </Card>
                <div className="mt-8 flex justify-center items-center gap-3 text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-40">
                    <Terminal size={12} /> PROTOCOL_V4.2_REG_MODULE
                </div>
            </motion.div>
        </div>
    );
};

export default ManagerRegister;
