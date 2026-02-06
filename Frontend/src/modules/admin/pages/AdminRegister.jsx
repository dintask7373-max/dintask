import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { Building2, UserPlus, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const AdminRegister = () => {
    const [formData, setFormData] = useState({
        companyName: '',
        adminName: '',
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

    const handleRegister = async (e) => {
        e.preventDefault();
        const { companyName, adminName, email, password, confirmPassword } = formData;

        if (!companyName || !adminName || !email || !password || !confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            // Simulate API registration
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Business Account Created! Please Login.');
            navigate('/admin/login');
        } catch {
            toast.error('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-slate-950 font-sans">
            {/* Brand Side - Reusing style for consistency */}
            <div className="hidden md:flex md:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="relative z-10 text-white space-y-6 max-w-md">
                    <div className="h-14 w-14 rounded-2xl bg-primary-600 flex items-center justify-center mb-6 shadow-xl shadow-primary-900/30">
                        <img src="/dintask-logo.png" alt="DinTask" className="h-9 w-9 object-contain" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">Scale your business with confidence.</h1>
                    <p className="text-slate-400 text-lg">Create your administrator account and start onboarding your team with DinTask for Business.</p>

                    <div className="pt-8 space-y-4">
                        {[
                            { icon: ShieldCheck, text: 'Enterprise Grade Security' },
                            { icon: Building2, text: 'Multi-Department Management' },
                            { icon: UserPlus, text: 'Seamless Team Onboarding' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-slate-300">
                                <item.icon className="text-primary-500" size={20} />
                                <span className="text-sm font-bold">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Register Side */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Join DinTask</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Setup your organization's workspace and start your tactical journey.</p>
                    </div>

                    <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
                        <CardContent className="pt-8 pb-8 px-6 space-y-4">
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Company Name</Label>
                                    <Input
                                        id="companyName"
                                        placeholder="Tech Solutions Inc."
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        className="h-11 rounded-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="adminName">Admin Full Name</Label>
                                    <Input
                                        id="adminName"
                                        placeholder="John Boss"
                                        value={formData.adminName}
                                        onChange={handleChange}
                                        className="h-11 rounded-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Work Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@company.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="h-11 rounded-lg"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="h-11 rounded-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="h-11 rounded-lg"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 text-base font-black bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-900/20"
                                    disabled={loading}
                                >
                                    {loading ? 'Creating Workspace...' : 'Create Admin Account'}
                                </Button>
                            </form>

                            <div className="text-center pt-2 border-t border-slate-100 flex items-center justify-center gap-2">
                                <span className="text-xs text-slate-500">Already a Partner?</span>
                                <Link to="/admin/login" className="text-xs font-bold text-primary-600 hover:text-primary-500 uppercase tracking-tight">
                                    Sign In
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
