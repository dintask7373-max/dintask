import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { Shield, Lock, Briefcase, KeyRound, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const SuperAdminRegister = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        masterKey: '',
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

    const handleRegister = async (e) => {
        e.preventDefault();
        const { fullName, email, password, confirmPassword, masterKey } = formData;

        if (!fullName || !email || !password || !confirmPassword || !masterKey) {
            toast.error('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords mismatch');
            return;
        }

        setLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('System Administrator Profile Created');
            navigate('/superadmin/login');
        } catch {
            toast.error('Initialization Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-slate-950 font-sans">
            {/* Brand Side - Exact match with Admin */}
            <div className="hidden md:flex md:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="relative z-10 text-white space-y-6 max-w-md">
                    <div className="h-14 w-14 rounded-2xl bg-primary-600 flex items-center justify-center mb-6 shadow-xl shadow-primary-900/30">
                        <img src="/dintask-logo.png" alt="DinTask" className="h-9 w-9 object-contain" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">System initialization.</h1>
                    <p className="text-slate-400 text-lg">Create a new root-level administrator identity for the master control platform.</p>
                </div>
            </div>

            {/* Register Side */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center md:text-left space-y-2">
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                            Initialize <span className="text-primary-600">Root</span>
                        </h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Master Identity Creation Protocol</p>
                    </div>

                    <Card className="border-2 border-slate-100 shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                        <CardContent className="pt-10 pb-10 px-8 space-y-8">
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">System Architect Name</Label>
                                    <Input
                                        id="fullName"
                                        placeholder="EX: ROOT OPERATOR"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="h-14 rounded-2xl bg-slate-50 border-none dark:bg-slate-800 font-bold focus-visible:ring-primary-500/20 text-xs"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Protocol Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="ROOT@DINTASK.EXE"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="h-14 rounded-2xl bg-slate-50 border-none dark:bg-slate-800 font-bold focus-visible:ring-primary-500/20 text-xs"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="masterKey" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">System Master Key</Label>
                                    <Input
                                        id="masterKey"
                                        placeholder="MASTER-KEY-XXXX"
                                        value={formData.masterKey}
                                        onChange={handleChange}
                                        className="h-14 rounded-2xl bg-slate-50 border-none dark:bg-slate-800 font-bold focus-visible:ring-primary-500/20 text-xs"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="h-14 rounded-2xl bg-slate-50 border-none dark:bg-slate-800 font-bold focus-visible:ring-primary-500/20 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirm</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="h-14 rounded-2xl bg-slate-50 border-none dark:bg-slate-800 font-bold focus-visible:ring-primary-500/20 text-xs"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-14 text-[10px] font-black uppercase tracking-[0.2em] bg-primary-600 hover:bg-primary-700 text-white shadow-xl shadow-primary-900/20 rounded-2xl active:scale-95 transition-all mt-4"
                                    disabled={loading}
                                >
                                    {loading ? 'INITIALIZING PROTOCOL...' : 'COMMENCE IDENTITY CREATION'}
                                </Button>
                            </form>

                            <div className="text-center pt-2 border-t border-slate-100 flex items-center justify-center gap-2">
                                <span className="text-xs text-slate-500">Identity Active?</span>
                                <Link to="/superadmin/login" className="text-xs font-bold text-primary-600 hover:text-primary-500 uppercase tracking-tight underline decoration-2 underline-offset-4">
                                    Sign In
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <p className="text-center text-xs text-slate-400 font-mono">
                        SYSTEM TERMINAL &copy; 2026 DINTASK
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminRegister;
