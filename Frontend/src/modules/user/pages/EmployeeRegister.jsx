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
        <div className="min-h-screen w-full bg-slate-50 relative flex flex-col items-center justify-start font-sans overflow-x-hidden">
            {/* Horizontal Top Background */}
            <div className="w-full h-[320px] relative overflow-hidden">
                <img
                    src="/WLCOMPAGE .png"
                    alt="Background"
                    className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
            </div>

            {/* Premium Register Card */}
            <div className="w-full max-w-[440px] -mt-24 px-4 relative z-10 pb-20">
                <div className="bg-white rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] p-10 md:p-12 border border-white/40">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">
                            {referralCode ? 'Join Team' : adminId ? 'Accept Invite' : 'Register'}
                        </h1>
                        <p className="text-slate-400 text-xs font-medium italic">Create your profile to get started</p>
                        {referralCode && (
                            <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">
                                <span className="text-[10px] font-bold uppercase tracking-widest">ID: {referralCode}</span>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Full Name</Label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Enter Full Name"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="h-12 px-5 bg-slate-50 border-slate-100 rounded-xl text-slate-900 font-medium text-sm placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-[#4461f2]/10 transition-all duration-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                readOnly={!!inviteEmail}
                                className={`h-12 px-5 bg-slate-50 border-slate-100 rounded-xl text-slate-900 font-medium text-sm placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-[#4461f2]/10 transition-all duration-200 ${inviteEmail ? 'opacity-70 cursor-not-allowed' : ''}`}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                className="h-12 px-5 bg-slate-50 border-slate-100 rounded-xl text-slate-900 font-medium text-sm placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-[#4461f2]/10 transition-all duration-200"
                            />
                        </div>

                        <div className="flex items-start space-x-2.5 px-1 py-1">
                            <input
                                type="checkbox"
                                id="consent"
                                className="mt-0.5 size-4 rounded border-slate-200 text-[#4461f2] focus:ring-[#4461f2] transition-all cursor-pointer"
                                required
                            />
                            <Label htmlFor="consent" className="text-[11px] font-medium text-slate-500 cursor-pointer leading-tight">
                                I agree to the <span className="text-[#4461f2] font-bold underline">Privacy Policy</span>
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-sm font-bold bg-[#4461f2] hover:bg-[#3451e2] text-white rounded-xl shadow-lg shadow-[#4461f2]/20 transition-all active:scale-[0.98] mt-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                    </form>

                    <div className="text-center mt-10">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                            Member? <Link to="/employee/login" className="text-[#4461f2] hover:underline ml-1 font-bold">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeRegister;
