import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, UserPlus, Link2, Mail } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import useEmployeeStore from '@/store/employeeStore';
import useAuthStore from '@/store/authStore';

const SalesRegister = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const referralCode = queryParams.get('ref');
    const adminId = queryParams.get('adminId');
    const inviteEmail = queryParams.get('email');

    const addPendingRequest = useEmployeeStore(state => state.addPendingRequest);
    const { register } = useAuthStore();

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
            toast.error('Operational initialization failed: missing data');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Security key mismatch');
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
                    role: 'sales_executive', // Correct role for sales
                    adminId
                });

                if (response?.success) {
                    if (response.user?.status === 'pending') {
                        navigate('/pending-approval');
                    } else {
                        toast.success('Sales operator integrated successfully');
                        navigate('/sales/login');
                    }
                }
            } else if (referralCode) {
                const success = await addPendingRequest({
                    fullName,
                    email,
                    password,
                    workspaceId: referralCode,
                    role: 'Sales'
                });
                if (success) {
                    navigate('/employee/success-join');
                }
            } else {
                toast.error("Integration failure. Invitation or Link required.");
            }
        } catch {
            toast.error('Integration failure. Transmit again.');
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
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2 uppercase">
                            {referralCode ? 'Force Link' : adminId ? 'Invite Sync' : 'Operator Sync'}
                        </h1>
                        <p className="text-slate-400 text-xs font-medium italic">Establish your tactical presence</p>

                        {referralCode && (
                            <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">
                                <span className="text-[10px] font-bold uppercase tracking-widest">Workspace: {referralCode}</span>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Legal Designation</Label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Operator Name"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="h-12 px-5 bg-slate-50 border-slate-100 rounded-xl text-slate-900 font-medium text-sm placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-primary-500/10 transition-all duration-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Comm Link</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="operator@entity.com"
                                value={formData.email}
                                onChange={handleChange}
                                readOnly={!!inviteEmail}
                                className={`h-12 px-5 bg-slate-50 border-slate-100 rounded-xl text-slate-900 font-medium text-sm placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-primary-500/10 transition-all duration-200 ${inviteEmail ? 'opacity-70 cursor-not-allowed' : ''}`}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Security Key</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="h-12 px-5 bg-slate-50 border-slate-100 rounded-xl text-slate-900 font-medium text-sm placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-primary-500/10 transition-all duration-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Confirm Key</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="h-12 px-5 bg-slate-50 border-slate-100 rounded-xl text-slate-900 font-medium text-sm placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-primary-500/10 transition-all duration-200"
                                />
                            </div>
                        </div>

                        <div className="flex items-start space-x-2.5 px-1 py-1">
                            <input
                                type="checkbox"
                                id="consent"
                                className="mt-0.5 size-4 rounded border-slate-200 text-primary-600 focus:ring-primary-600 transition-all cursor-pointer"
                                required
                            />
                            <Label htmlFor="consent" className="text-[11px] font-medium text-slate-500 cursor-pointer leading-tight">
                                I agree to the <span className="text-primary-600 font-bold underline cursor-pointer">Security Protocol</span>
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            className={cn(
                                "w-full h-12 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-[0.98] mt-2 group",
                                referralCode ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20" : adminId ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20" : "bg-primary-600 hover:bg-primary-700 shadow-primary-600/20"
                            )}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    <span>Syncing...</span>
                                </div>
                            ) : (
                                <><UserPlus size={18} className="mr-2 group-hover:scale-110 transition-transform" /> Initialize Account</>
                            )}
                        </Button>
                    </form>

                    <div className="text-center mt-10">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                            Member? <Link to="/sales/login" className="text-primary-600 hover:underline ml-1 font-bold">Return to Portal</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesRegister;
