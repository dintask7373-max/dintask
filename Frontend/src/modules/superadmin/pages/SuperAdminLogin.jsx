import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { Shield, Lock, Briefcase, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';

const SuperAdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleLogin = async (e, role) => {
        e.preventDefault();

        // Map UI role to system role
        const systemRole = role === 'admin' ? 'superadmin' : 'superadmin_employee';

        const success = await login(email, password, systemRole);
        if (success) {
            toast.success('System Access Granted');
            navigate('/superadmin');
        } else {
            toast.error(error || 'Access Denied');
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-slate-950 font-sans">
            {/* Brand Side */}
            <div className="hidden md:flex md:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/90 to-primary-900/40" />

                <div className="relative z-10 text-white space-y-6 max-w-md">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center mb-6 shadow-2xl shadow-primary-900/50">
                        <img src="/src/assets/dintask_logo_-removebg-preview.png" alt="DinTask" className="h-10 w-10 object-contain" />
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter">
                        Master Control <br />
                        <span className="text-primary-500">Platform.</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed">
                        Complete oversight of all tenants, subscriptions, and system health from a single centralized dashboard.
                    </p>

                    <div className="pt-8 flex gap-4 text-xs font-mono text-slate-500">
                        <div className="px-3 py-1 bg-slate-800/50 rounded border border-slate-700">SYS.VER 2.4.0</div>
                        <div className="px-3 py-1 bg-slate-800/50 rounded border border-slate-700 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            OPERATIONAL
                        </div>
                    </div>
                </div>
            </div>

            {/* Login Side */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">System Authentication</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Verify credentials to access the super admin console.</p>
                    </div>

                    <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
                        <CardContent className="pt-8 pb-8 px-6 space-y-6">
                            <Tabs defaultValue="admin" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-950 rounded-lg p-1 mb-8">
                                    <TabsTrigger
                                        value="admin"
                                        className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary-600 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider transition-all"
                                    >
                                        Super Admin
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="employee"
                                        className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider transition-all"
                                    >
                                        Staff Portal
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="admin" className="mt-0 space-y-4">
                                    <form onSubmit={(e) => handleLogin(e, 'admin')} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="admin-email">Administrator ID</Label>
                                            <Input
                                                id="admin-email"
                                                type="email"
                                                placeholder="superadmin@dintask.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="h-11 rounded-lg bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-primary-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="admin-password">Secure Key</Label>
                                                <a href="/superadmin/forgot-password" className="text-xs font-medium text-primary-600 hover:text-primary-500">
                                                    Forgot Key?
                                                </a>
                                            </div>
                                            <Input
                                                id="admin-password"
                                                type="password"
                                                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="h-11 rounded-lg bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-primary-500"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-11 text-base font-bold bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white shadow-lg shadow-primary-900/20"
                                            disabled={loading}
                                        >
                                            {loading ? 'Verifying Identity...' : 'Authenticate Access'}
                                        </Button>
                                    </form>
                                </TabsContent>

                                <TabsContent value="employee" className="mt-0 space-y-4">
                                    <form onSubmit={(e) => handleLogin(e, 'employee')} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="emp-email">Staff ID</Label>
                                            <Input
                                                id="emp-email"
                                                type="email"
                                                placeholder="staff@dintask.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="h-11 rounded-lg bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="emp-password">Access Code</Label>
                                                <a href="/superadmin/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-500">
                                                    Forgot Code?
                                                </a>
                                            </div>
                                            <Input
                                                id="emp-password"
                                                type="password"
                                                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="h-11 rounded-lg bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-11 text-base font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-900/20"
                                            disabled={loading}
                                        >
                                            {loading ? 'Verifying Identity...' : 'Staff Login'}
                                        </Button>
                                    </form>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-2">
                        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <KeyRound className="shrink-0 text-slate-400" size={18} />
                                <div className="text-xs w-full">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">Admin Access</span>
                                        <span className="font-mono text-slate-500">superadmin@dintask.com / super123</span>
                                    </div>
                                    <div className="w-full h-px bg-slate-100 dark:bg-slate-800 my-2" />
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">Staff Access</span>
                                        <span className="font-mono text-slate-500">staff@dintask.com / staff123</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-[10px] text-slate-400 font-mono mt-4">
                            SECURE CONNECTION // 2026 DINTASK INC.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
