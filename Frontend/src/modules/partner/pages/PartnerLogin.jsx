import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    Lock,
    Briefcase,
    ArrowRight,
    ShieldCheck,
    AlertCircle,
    LogIn
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import useAuthStore from '@/store/authStore';
import { toast } from 'sonner';
import AuthLayout from '@/shared/components/layout/AuthLayout';

const PartnerLogin = () => {
    const navigate = useNavigate();
    const { login, checkEmail } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleEmailBlur = async () => {
        if (!formData.email) return;
        const result = await checkEmail(formData.email, 'partner');
        if (result.success) {
            if (!result.exists) {
                setEmailError('Partner email not found');
                toast.error('Identity Mismatch: Entry not found in registry');
            } else if (result.role && result.role !== 'partner') {
                let normRole = result.role;
                if (normRole === 'sales_executive') normRole = 'sales';
                setEmailError(`Registered as ${normRole.toUpperCase()}`);
                toast.error(`Wrong Portal: This ID is registered as a ${normRole.toUpperCase()}.`);
            } else {
                setEmailError('');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'email') setEmailError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (emailError) {
            toast.error(emailError);
            return;
        }
        setLoading(true);
        try {
            const result = await login(formData.email, formData.password, 'partner');

            if (result.success) {
                toast.success('Welcome back, Partner!');
                navigate('/partner');
            } else {
                toast.error(result.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            toast.error(err.message || 'Connect failed to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            brandTitle="Partner Ecosystem"
            brandSubtitle="Grow your business with DinTask. Manage referrals, track commissions, and access exclusive partner resources."
            formTitle="Partner Login"
            formSubtitle="Authentication required for secure partner dashboard access."
            bgImage="/WLCOMPAGE .png"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Partner Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleEmailBlur}
                            className={`pl-11 h-12 bg-slate-50 border-none dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-bold text-xs focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary-500/10 transition-all duration-200 ${emailError ? 'ring-2 ring-red-500/50' : ''}`}
                            placeholder="name@company.com"
                        />
                    </div>
                    {emailError && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{emailError}</p>}
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security Key</Label>
                        <Link to="/partner/forgot-password" size="sm" className="text-[10px] font-black text-primary-600 hover:underline uppercase tracking-wide">
                            Lost?
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="pl-11 h-12 bg-slate-50 border-none dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-bold text-xs focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary-500/10 transition-all duration-200"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 text-[10px] font-black uppercase tracking-[0.2em] bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-xl shadow-primary-600/20 active:scale-95 transition-all mt-2 group"
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Authenticating...</span>
                        </div>
                    ) : (
                        <><LogIn size={16} className="mr-2 group-hover:translate-x-1 transition-transform" /> Sign In</>
                    )}
                </Button>
            </form>

            <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-wider">
                    <ShieldCheck className="text-primary-500 shrink-0" size={18} />
                    <span>Secure Partner Terminal. Unauthorized access is strictly prohibited and monitored.</span>
                </div>
                <p className="text-center mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Not a partner yet? <Link to="/partner/register" className="text-primary-600 hover:underline ml-1 font-bold">Apply Now</Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default PartnerLogin;
