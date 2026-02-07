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
                addPendingRequest({
                    fullName,
                    email,
                    password,
                    workspaceId: referralCode,
                    role: 'Sales'
                });
                toast.success('Join request transmitted. Pending Command approval.');
                navigate('/employee/success-join');
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] size-[40%] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] size-[40%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

            <Card className="w-full max-w-[480px] border-none shadow-2xl shadow-primary-500/10 bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden relative z-10">
                <div className={cn(
                    "h-2 bg-gradient-to-r w-full",
                    referralCode ? "from-emerald-600 to-blue-600" : adminId ? "from-blue-600 to-indigo-600" : "from-primary-600 to-blue-600"
                )} />

                <CardHeader className="text-center space-y-2 pt-10 pb-6 px-10">
                    <div className="flex justify-center mb-6">
                        <div className={cn(
                            "size-16 rounded-[1.5rem] bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center p-3 relative group transition-all",
                            referralCode ? "text-emerald-600" : adminId ? "text-blue-600" : "text-primary-600"
                        )}>
                            <div className={cn(
                                "absolute inset-0 rounded-[1.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity",
                                referralCode ? "bg-emerald-500/20" : adminId ? "bg-blue-500/20" : "bg-primary-500/20"
                            )} />
                            {referralCode ? <Link2 size={32} className="relative z-10" /> : adminId ? <Mail size={32} className="relative z-10" /> : <UserPlus size={32} className="relative z-10" />}
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                        {referralCode ? 'Force <span className="text-emerald-600">Link</span>' : adminId ? 'Invite <span className="text-blue-600">Sync</span>' : 'Operator <span className="text-primary-600">Sync</span>'}
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {referralCode ? (
                            <span className="flex items-center justify-center gap-1.5 text-emerald-600 font-black">
                                <ShieldCheck size={12} /> External Workspace: {referralCode}
                            </span>
                        ) : adminId ? 'Secure Invitation Protocol' : 'Scale the sales infrastructure'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-10 pb-8 space-y-6">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal Designation</Label>
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder="Operator Name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="h-11 bg-slate-50 border-none rounded-xl font-bold text-sm px-5"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Comm Link</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="operator@entity.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    readOnly={!!inviteEmail}
                                    className={`h-11 bg-slate-50 border-none rounded-xl font-bold text-sm px-5 ${inviteEmail ? 'opacity-70 cursor-not-allowed' : ''}`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Security Key</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="h-11 bg-slate-50 border-none rounded-xl font-bold text-sm px-5"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Key</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="h-11 bg-slate-50 border-none rounded-xl font-bold text-sm px-5"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className={cn(
                                "w-full h-14 mt-4 text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl rounded-xl",
                                referralCode ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : adminId ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20" : "bg-primary-600 hover:bg-primary-700 shadow-primary-500/20"
                            )}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Synchronizing...
                                </div>
                            ) : (
                                <><UserPlus size={18} className="mr-2" /> Initialize Account</>
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col space-y-5 p-10 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="w-full flex items-center justify-between gap-4">
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 whitespace-nowrap">Existing Operator?</span>
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                    </div>

                    <Link to="/sales/login" className="w-full h-12 rounded-xl bg-white dark:bg-slate-800 border-none shadow-sm flex items-center justify-center text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest hover:bg-slate-50 transition-colors">
                        Return to Portal
                    </Link>

                    <p className="text-[8px] font-bold text-slate-400 text-center uppercase tracking-[0.2em]">
                        Neural Enrollment Protocol v2.8
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default SalesRegister;
