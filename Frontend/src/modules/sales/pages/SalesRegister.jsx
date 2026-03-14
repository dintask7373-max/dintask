import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, UserPlus, Link2, Mail, Eye, EyeOff } from 'lucide-react';
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

    const [formData, setFormData] = useState({
        fullName: '',
        email: inviteEmail || '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const { register, checkEmail } = useAuthStore();
    const navigate = useNavigate();

    const handleEmailBlur = async () => {
        if (!formData.email || !!inviteEmail) return;
        const result = await checkEmail(formData.email, 'sales_executive');
        if (result.success && result.exists) {
            setEmailError('Comm Link already active in another division');
            toast.error('Identity Collision: Email already registered in Sales Division');
        } else {
            setEmailError('');
        }
    };

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
        if (id === 'email') setEmailError('');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const { fullName, email, phoneNumber, password, confirmPassword } = formData;

        if (emailError) {
            toast.error(emailError);
            return;
        }

        if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
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
                    phoneNumber,
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
                    phoneNumber,
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

    if (!adminId && !referralCode) {
        return (
            <div className="min-h-screen w-full bg-slate-900 flex flex-col items-center justify-center p-6 font-sans">
                <div className="w-full max-w-[440px] bg-slate-800 rounded-[2.5rem] shadow-2xl p-10 text-center border border-slate-700">
                    <div className="w-20 h-20 bg-primary-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={32} className="text-primary-500" />
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Tactical <span className="text-primary-500">Access Only</span></h1>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                        Sales Division registration requires a verified workspace invitation or unit authorization code.
                    </p>
                    <div className="space-y-4">
                        <Button
                            onClick={() => navigate('/sales/login')}
                            className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all"
                        >
                            Return to HQ
                        </Button>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-loose">
                            Verify your credentials with <br /> workspace command.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

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
                <div className="bg-gradient-to-br from-white to-primary-50/30 dark:from-slate-900 dark:to-primary-900/10 rounded-[2.5rem] shadow-xl shadow-primary-500/20 p-10 md:p-12 border-2 border-primary-100 dark:border-primary-900">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2 uppercase">
                            {referralCode ? 'Force Link' : 'Invite Sync'}
                        </h1>
                        <p className="text-slate-400 text-xs font-medium italic">Establishing secure tactical sync with workspace</p>
                        <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                {referralCode ? `UNIT: ${referralCode}` : `HQ ID: ${adminId.substring(0, 8)}...`}
                            </span>
                        </div>
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
                                onBlur={handleEmailBlur}
                                readOnly={!!inviteEmail}
                                className={`h-12 px-5 bg-slate-50 border-slate-100 rounded-xl text-slate-900 font-medium text-sm placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-primary-500/10 transition-all duration-200 ${inviteEmail ? 'opacity-70 cursor-not-allowed' : ''} ${emailError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                            />
                            {emailError && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{emailError}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber" className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Direct Line</Label>
                            <Input
                                id="phoneNumber"
                                type="text"
                                placeholder="9876543210"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="h-12 px-5 bg-slate-50 border-slate-100 rounded-xl text-slate-900 font-medium text-sm placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-primary-500/10 transition-all duration-200"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Security Key</Label>
                                <div className="relative group/pass">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="h-12 px-5 bg-slate-50 border-slate-100 rounded-xl text-slate-900 font-medium text-sm placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-primary-500/10 transition-all duration-200 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Confirm Key</Label>
                                <div className="relative group/pass">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="h-12 px-5 bg-slate-50 border-slate-100 rounded-xl text-slate-900 font-medium text-sm placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-primary-500/10 transition-all duration-200 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors p-1"
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
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
                                I agree to the <Link to="/terms" className="text-primary-600 font-bold underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary-600 font-bold underline">Privacy Policy</Link>
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
