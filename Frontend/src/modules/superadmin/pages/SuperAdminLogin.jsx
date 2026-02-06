import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { Shield, KeyRound } from 'lucide-react';
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
            {/* Brand Side - Exact match with Admin Login */}
            <div className="hidden md:flex md:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="relative z-10 text-white space-y-6 max-w-md">
                    <div className="h-14 w-14 rounded-2xl bg-primary-600 flex items-center justify-center mb-6 shadow-xl shadow-primary-900/30">
                        <img src="/dintask-logo.png" alt="DinTask" className="h-9 w-9 object-contain" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">Master control for your enterprise.</h1>
                    <p className="text-slate-400 text-lg">Oversee all organizations, manage subscriptions, and monitor system health with the Master Control Platform.</p>
                </div>
            </div>

            {/* Login Side */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">System Portal</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Please sign in to access the super admin console.</p>
                    </div>

                    <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
                        <CardContent className="pt-8 pb-8 px-6 space-y-6">
                            <Tabs defaultValue="admin" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg p-1 mb-6">
                                    <TabsTrigger value="admin" className="rounded-md h-9 text-xs font-bold uppercase tracking-tight">Super Admin</TabsTrigger>
                                    <TabsTrigger value="employee" className="rounded-md h-9 text-xs font-bold uppercase tracking-tight">Staff</TabsTrigger>
                                </TabsList>

                                <TabsContent value="admin">
                                    <form onSubmit={(e) => handleLogin(e, 'admin')} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="admin-email">Administrator Email</Label>
                                            <Input
                                                id="admin-email"
                                                type="email"
                                                placeholder="superadmin@dintask.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="h-11 rounded-lg"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="admin-password">Secure Password</Label>
                                                <Link to="/superadmin/forgot-password" size="sm" className="text-xs font-bold text-primary-600 hover:text-primary-500 uppercase tracking-tight">
                                                    Forgot?
                                                </Link>
                                            </div>
                                            <Input
                                                id="admin-password"
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
                                </TabsContent>

                                <TabsContent value="employee">
                                    <form onSubmit={(e) => handleLogin(e, 'employee')} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="emp-email">Staff Email</Label>
                                            <Input
                                                id="emp-email"
                                                type="email"
                                                placeholder="staff@dintask.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="h-11 rounded-lg"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="emp-password">Access Code</Label>
                                                <Link to="/superadmin/forgot-password" size="sm" className="text-xs font-bold text-primary-600 hover:text-primary-500 uppercase tracking-tight">
                                                    Forgot?
                                                </Link>
                                            </div>
                                            <Input
                                                id="emp-password"
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
                                </TabsContent>
                            </Tabs>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2">
                                <span className="text-xs text-slate-500">New Administrator?</span>
                                <Link to="/superadmin/register" className="text-xs font-bold text-primary-600 hover:text-primary-500 uppercase tracking-tight underline decoration-2 underline-offset-4">
                                    Initialize Root
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4 text-center">
                        <div className="inline-block p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-left w-full">
                            <div className="flex items-center gap-3">
                                <KeyRound className="shrink-0 text-slate-400" size={18} />
                                <div className="text-xs w-full">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">Admin</span>
                                        <span className="font-mono text-slate-500">superadmin@dintask.com / super123</span>
                                    </div>
                                    <div className="w-full h-px bg-slate-100 dark:bg-slate-700 my-2" />
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">Staff</span>
                                        <span className="font-mono text-slate-500">staff@dintask.com / staff123</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 font-mono">
                            SECURE SYSTEM CONNECTION // 2026 DINTASK
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
