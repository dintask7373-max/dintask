import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import useEmployeeStore from '@/store/employeeStore';
import useAuthStore from '@/store/authStore';
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
    const adminId = queryParams.get('adminId');
    const inviteEmail = queryParams.get('email');

    const { register } = useAuthStore();
    const addPendingRequest = useEmployeeStore(state => state.addPendingRequest);

    const [formData, setFormData] = useState({
        fullName: '',
        email: inviteEmail || '',
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (inviteEmail) {
            setFormData(prev => ({ ...prev, email: inviteEmail }));
        }
    }, [inviteEmail]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

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
            if (adminId) {
                // Direct registration via Invite
                const response = await register({
                    name: fullName,
                    email,
                    password,
                    role: 'manager',
                    adminId
                });

                if (response?.success) {
                    if (response.user?.status === 'pending') {
                        navigate('/pending-approval');
                    } else {
                        toast.success('Manager application submitted. Verify keys below.');
                        navigate('/manager/login');
                    }
                }
            } else if (referralCode) {
                const success = await addPendingRequest({
                    fullName,
                    email,
                    password,
                    workspaceId: referralCode,
                    role: 'Manager'
                });
                if (success) {
                    navigate('/employee/success-join');
                }
            } else {
                toast.error("Process Terminated. Invitation or Link required.");
            }
        } catch {
            toast.error('Registration sequence aborted. Try again.');
        } finally {
            setLoading(false);
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
                    <h1 className="text-4xl font-bold tracking-tight">Deploy your leadership potential.</h1>
                    <p className="text-slate-400 text-lg">Join the DinTask ecosystem to orchestrate teams, manage complex workflows, and drive organizational success.</p>
                </div>
            </div>

            {/* Form Side */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
                {/* Decorative element for mobile */}
                <div className="md:hidden absolute top-0 left-0 w-full h-1 bg-primary-600 shadow-[0_0_20px_rgba(99,116,242,0.5)]" />

                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                            {referralCode ? 'Join Workspace' : adminId ? 'Accept Invite' : 'Manager Registration'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            {referralCode ? `Initiating uplink to node: ${referralCode}` : adminId ? 'Secure invitation accepted. Build your profile.' : 'Create your credentials to join the force.'}
                        </p>
                    </div>

                    <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
                        <CardContent className="pt-8 pb-8 px-8 space-y-6">
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Asset Nomenclature</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <Input
                                            id="fullName"
                                            type="text"
                                            placeholder="FULL NAME"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Work Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="manager@company.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            readOnly={!!inviteEmail}
                                            className={cn(
                                                "h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800",
                                                inviteEmail && "opacity-70 cursor-not-allowed"
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Security Key</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="••••"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Verify Key</Label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                placeholder="••••"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-sm font-black bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-primary-900/20 active:scale-95 transition-transform"
                                    disabled={loading}
                                >
                                    {loading ? 'Registering...' : <><Zap size={16} className="mr-2 fill-current" /> Register Profile</>}
                                </Button>
                            </form>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Already a manager?</span>
                                <Link to="/manager/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 hover:text-primary-700 underline decoration-2 underline-offset-4">
                                    Login Asset
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                        &copy; 2026 DinTask Inc. Protocol V4.2_REG_MODULE
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ManagerRegister;
