import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { Briefcase, KeyRound, User, Building2, Phone } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import api from '@/lib/api';

const AdminRegister = () => {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        companyName: '',
        phoneNumber: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api('/admin/register', {
                method: 'POST',
                body: formData
            });

            if (response.success) {
                toast.success('Registration successful! Logging you in...');
                // Auto login after registration
                const loginSuccess = await login(formData.email, formData.password, 'admin');
                if (loginSuccess) {
                    navigate('/admin');
                } else {
                    navigate('/admin/login');
                }
            } else {
                toast.error(response.message || 'Registration failed');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Registration failed');
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
                    <h1 className="text-4xl font-bold tracking-tight">Start your journey with DinTask.</h1>
                    <p className="text-slate-400 text-lg">Join thousands of companies streamlining their operations and boosting team productivity.</p>
                </div>
            </div>

            {/* Register Side */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Create Admin Account</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Get started with your free trial today.</p>
                    </div>

                    <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
                        <CardContent className="pt-8 pb-8 px-6 space-y-6">
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                        <Input
                                            id="name"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="pl-10 h-11 rounded-lg"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Company Name</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                        <Input
                                            id="companyName"
                                            placeholder="Acme Inc."
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            className="pl-10 h-11 rounded-lg"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Work Email</Label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="admin@company.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="pl-10 h-11 rounded-lg"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                        <Input
                                            id="phoneNumber"
                                            placeholder="+1 (555) 000-0000"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            className="pl-10 h-11 rounded-lg"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="pl-10 h-11 rounded-lg"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 text-base font-black bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-900/20 mt-2"
                                    disabled={loading}
                                >
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </Button>
                            </form>

                            <div className="text-center text-sm">
                                <span className="text-slate-500">Already have an account? </span>
                                <Link to="/admin/login" className="font-bold text-primary-600 hover:text-primary-500">
                                    Sign in
                                </Link>
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

export default AdminRegister;
