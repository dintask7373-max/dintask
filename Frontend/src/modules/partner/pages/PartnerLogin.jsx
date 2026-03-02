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
    AlertCircle
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import useAuthStore from '@/store/authStore';
import { toast } from 'sonner';
import apiRequest from '@/lib/api';

const PartnerLogin = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore(state => state.setAuth);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const login = useAuthStore(state => state.login);

    const handleSubmit = async (e) => {
        e.preventDefault();
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo Section */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-900/20">
                        <Briefcase size={24} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">DinTask <span className="text-primary-600">Partners</span></h1>
                </div>

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 border border-white"
                >
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Partner Login</h2>
                        <p className="text-slate-500 mt-2">Manage your referrals and commissions</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                                <Input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Password</Label>
                                <Link to="/partner/forgot-password" size="sm" className="text-xs font-bold text-primary-600 hover:underline">
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                                <Input
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-xl font-bold uppercase tracking-widest bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-900/20"
                        >
                            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} className="ml-2" />
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl text-[11px] text-slate-500 leading-relaxed">
                            <ShieldCheck className="text-primary-500 shrink-0" size={18} />
                            <span>Partner portal is secure. Only authorized partners with approved applications can access the dashboard.</span>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <p className="text-center mt-8 text-slate-400 font-bold text-xs uppercase tracking-widest">
                    Not a partner yet? <Link to="/partner/register" className="text-primary-600 hover:underline">Apply Now</Link>
                </p>
            </div>
        </div>
    );
};

export default PartnerLogin;
