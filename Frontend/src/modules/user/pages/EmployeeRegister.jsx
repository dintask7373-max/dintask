import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import useEmployeeStore from '@/store/employeeStore';
import { UserPlus, Link2, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const EmployeeRegister = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const referralCode = queryParams.get('ref');
    const adminId = queryParams.get('adminId');
    const inviteEmail = queryParams.get('email');

    const [formData, setFormData] = useState({
        fullName: '',
        email: inviteEmail || '',
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuthStore();
    const addPendingRequest = useEmployeeStore(state => state.addPendingRequest);

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
            toast.error('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
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
                    role: 'employee',
                    adminId
                });

                if (response?.success) {
                    if (response.user?.status === 'pending') {
                        navigate('/pending-approval');
                    } else {
                        toast.success('Account created successfully! Please login.');
                        navigate('/employee/login');
                    }
                }
            } else if (referralCode) {
                // Join via Referal Code (Pending Request)
                addPendingRequest({
                    fullName,
                    email,
                    password,
                    workspaceId: referralCode,
                    role: 'Employee'
                });
                toast.success('Join request sent! Waiting for Admin approval.');
                navigate('/employee/success-join');
            } else {
                // Standalone registration (fallback, though usually employees need an invite or code)
                // For now, assuming direct reg requires adminId or refCode usually, but leaving basic flow
                toast.error("Invitation link or Referral code required.");
            }
        } catch (err) {
            toast.error('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans">
            <Card className="w-full max-w-sm border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
                <div className="h-2 bg-primary-500 w-full" />
                <CardHeader className="text-center space-y-1 pt-8">
                    {referralCode ? (
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center gap-2">
                                <Link2 className="w-8 h-8" />
                            </div>
                        </div>
                    ) : adminId ? (
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center gap-2">
                                <Mail className="w-8 h-8" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600">
                                <UserPlus className="w-8 h-8" />
                            </div>
                        </div>
                    )}
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {referralCode ? 'Join Workspace' : adminId ? 'Accept Invitation' : 'Create Account'}
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">
                        {referralCode ? (
                            <span className="flex items-center justify-center gap-1 text-emerald-600 font-bold dark:text-emerald-400">
                                Workspace ID: {referralCode}
                            </span>
                        ) : adminId ? (
                            'Join your team workspace'
                        ) : 'Join your team workspace'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="employee@dintask.com"
                                value={formData.email}
                                onChange={handleChange}
                                readOnly={!!inviteEmail}
                                className={`bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 ${inviteEmail ? 'opacity-70 cursor-not-allowed' : ''}`}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                className="bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
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
                                    Creating account...
                                </div>
                            ) : (
                                <>Create Account</>
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pb-6 border-t border-slate-100 dark:border-slate-800 pt-6 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="text-center">
                        <p className="text-xs text-slate-500">
                            Already have an account?{' '}
                            <Link to="/employee/login" className="font-bold text-slate-900 dark:text-white hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default EmployeeRegister;
