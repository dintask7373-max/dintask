import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { User, LogIn } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const EmployeeLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error, isAuthenticated, role } = useAuthStore();
    const navigate = useNavigate();

    // Auto-redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && role === 'employee') {
            navigate('/employee');
        }
    }, [isAuthenticated, role, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        const result = await login(email, password, 'employee');
        if (result.success) {
            toast.success('Welcome back!');
            navigate('/employee');
        } else {
            if (result.error && result.error.includes('pending approval')) {
                navigate('/pending-approval');
            } else {
                toast.error(result.error || 'Login failed');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans">
            <Card className="w-full max-w-sm border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
                <div className="h-2 bg-primary-500 w-full" />
                <CardHeader className="text-center space-y-1 pt-8">
                    <div className="flex justify-center mb-6">
                        <img src="/dintask-logo.png" alt="DinTask" className="h-20 w-20 object-contain" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Employee Login
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">
                        Access your task dashboard
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="employee@dintask.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <a href="/employee/forgot-password" className="text-xs font-medium text-primary-600 hover:text-primary-500">
                                    Forgot password?
                                </a>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] bg-primary-600 hover:bg-primary-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Logging in...
                                </div>
                            ) : (
                                <><LogIn size={18} className="mr-2" /> Sign In</>
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pb-6 border-t border-slate-100 dark:border-slate-800 pt-6 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="text-center w-full flex flex-col gap-3">
                        <p className="text-xs text-slate-500">
                            Don't have an account? <Link to="/employee/register" className="font-bold text-slate-900 dark:text-white hover:underline">Create Account</Link>
                        </p>
                        <div className="flex items-center gap-2 py-2">
                            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or</span>
                            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
                        </div>
                        <Link to="/sales/login" className="w-full">
                            <Button variant="outline" className="w-full h-10 border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white dark:hover:bg-slate-800">
                                Login as Sales
                            </Button>
                        </Link>
                    </div>
                    <div className="w-full p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Demo Credentials</span>
                        <span className="text-xs font-mono text-slate-600 dark:text-slate-300">employee@dintask.com / emp123</span>
                    </div>
                </CardFooter>
            </Card>
        </div >
    );
};

export default EmployeeLogin;
