import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';

import AuthLayout from '@/shared/components/layout/AuthLayout';

import { Eye, EyeOff } from 'lucide-react';

const SuperAdminLogin = () => {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [activeTab, setActiveTab] = useState('admin');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, loading, error, isAuthenticated, role, checkEmail } = useAuthStore();
    const navigate = useNavigate();

    const handleEmailBlur = async () => {
        if (!email) return;
        const systemRole = activeTab === 'admin' ? 'superadmin' : 'superadmin_staff';
        const result = await checkEmail(email, systemRole);
        if (result.success) {
            if (!result.exists) {
                setEmailError('System ID not found');
                toast.error('Identity Mismatch: Record not found in master database');
            } else if (result.role && result.role !== systemRole) {
                let normRole = result.role;
                if (normRole === 'sales_executive') normRole = 'sales';
                setEmailError(`Registered as ${normRole.toUpperCase()}`);
                toast.error(`Wrong Portal: This ID is registered as a ${normRole.toUpperCase()}.`);
            } else {
                setEmailError('');
            }
        }
    };

    // Auto-redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && role === 'superadmin') {
            navigate('/superadmin');
        }
    }, [isAuthenticated, role, navigate]);

    const handleLogin = async (e, r) => {
        e.preventDefault();

        if (emailError) {
            toast.error(emailError);
            return;
        }

        // Map UI role to system role
        const systemRole = r === 'admin' ? 'superadmin' : 'superadmin_staff';

        const result = await login(email, password, systemRole);
        if (result.success) {
            toast.success('System Access Granted');
            navigate('/superadmin');
        } else {
            toast.error(result.error || 'Access Denied');
        }
    };

    return (
        <AuthLayout
            brandTitle="Master Control Platform"
            brandSubtitle="Oversee all organizations, manage subscriptions, and monitor system health with the Master Control Platform."
            formTitle="System Portal"
            formSubtitle="Authenticating Root Protocol Access"
            bgImage="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop"
        >
            <Tabs
                defaultValue="admin"
                className="w-full"
                onValueChange={(val) => {
                    setActiveTab(val);
                    setEmailError('');
                }}
            >
                <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-8">
                    <TabsTrigger value="admin" className="rounded-lg h-10 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">Super Admin</TabsTrigger>
                    <TabsTrigger value="employee" className="rounded-lg h-10 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">Operations Staff</TabsTrigger>
                </TabsList>

                <TabsContent value="admin">
                    <form onSubmit={(e) => handleLogin(e, 'admin')} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="admin-email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Administrator Protocol ID</Label>
                            <Input
                                id="admin-email"
                                type="email"
                                placeholder="ROOT@DINTASK.EXE"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setEmailError('');
                                }}
                                onBlur={handleEmailBlur}
                                className={`h-12 px-5 bg-slate-50 border-none dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-bold text-xs focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary-500/10 transition-all duration-200 ${emailError ? 'ring-2 ring-red-500/50' : ''}`}
                            />
                            {emailError && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{emailError}</p>}
                        </div>
                        {/* ... password fields ... */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <Label htmlFor="admin-password" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure Password</Label>
                                <Link to="/superadmin/forgot-password" size="sm" className="text-[10px] font-black text-primary-600 hover:underline uppercase tracking-wide">
                                    Lost?
                                </Link>
                            </div>
                            <div className="relative group/pass">
                                <Input
                                    id="admin-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 px-5 bg-slate-50 border-none dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-bold text-xs focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary-500/10 transition-all duration-200 w-full"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-500 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 text-[10px] font-black uppercase tracking-[0.2em] bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-xl shadow-primary-600/20 active:scale-95 transition-all mt-2 group"
                            disabled={loading}
                        >
                            {loading ? 'MODULATING...' : 'ESTABLISH SECURE LINK'}
                        </Button>
                    </form>
                </TabsContent>

                <TabsContent value="employee">
                    <form onSubmit={(e) => handleLogin(e, 'employee')} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="emp-email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Staff Access Code</Label>
                            <Input
                                id="emp-email"
                                type="email"
                                placeholder="STAFF@DINTASK.COM"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setEmailError('');
                                }}
                                onBlur={handleEmailBlur}
                                className={`h-12 px-5 bg-slate-50 border-none dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-bold text-xs focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary-500/10 transition-all duration-200 ${emailError ? 'ring-2 ring-red-500/50' : ''}`}
                            />
                            {emailError && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{emailError}</p>}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <Label htmlFor="emp-password" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Access Key</Label>
                                <Link to="/superadmin/forgot-password" size="sm" className="text-[10px] font-black text-primary-600 hover:underline uppercase tracking-wide">
                                    Lost?
                                </Link>
                            </div>
                            <div className="relative group/pass">
                                <Input
                                    id="emp-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 px-5 bg-slate-50 border-none dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-bold text-xs focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary-500/10 transition-all duration-200 w-full"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-500 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-900 hover:bg-black text-white rounded-xl shadow-xl shadow-slate-900/20 active:scale-95 transition-all mt-2 group"
                            disabled={loading}
                        >
                            {loading ? 'MODULATING...' : 'ESTABLISH SECURE LINK'}
                        </Button>
                    </form>
                </TabsContent>
            </Tabs>

            <div className="text-center mt-10 space-y-4">
                <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />
                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                    SECURE SYSTEM CONNECTION // 2026 DINTASK
                </p>
            </div>
        </AuthLayout>
    );
};

export default SuperAdminLogin;
