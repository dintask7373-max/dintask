import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Check,
    ChevronRight,
    ShieldCheck,
    CreditCard,
    Zap,
    Star,
    Users,
    ArrowLeft,
    Sparkles,
    Rocket
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
import { cn } from '@/shared/utils/cn';
import useEmployeeStore from '@/store/employeeStore';

const Checkout = () => {
    const navigate = useNavigate();
    const workspace = useEmployeeStore(state => state.workspace) || "Personal Workspace";
    const [billingCycle, setBillingCycle] = useState('yearly'); // 'yearly' or 'monthly'
    const [addons, setAddons] = useState({
        ai: false,
        training: false
    });

    const yearlyPrice = 12;
    const monthlyPrice = 19;
    const currentPrice = billingCycle === 'yearly' ? yearlyPrice : monthlyPrice;

    return (
        <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950 font-sans">
            <div className="max-w-[1200px] mx-auto px-4 py-12">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-8 font-bold text-slate-500 hover:text-primary-600 transition-colors gap-2"
                >
                    <ArrowLeft size={18} />
                    Back to Plans
                </Button>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Column: Selection */}
                    <div className="flex-1 space-y-12">
                        <section className="space-y-6">
                            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Order Summary</h1>

                            <div className="space-y-4">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Upgrading Workspace:</p>
                                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <div className="w-12 h-12 rounded-2xl bg-primary-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-primary-500/20">
                                        {workspace.charAt(0).toUpperCase()}
                                    </div>
                                    <p className="text-lg font-black text-slate-800 dark:text-white">{workspace}</p>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">Billing Plan</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Yearly Plan */}
                                <div
                                    onClick={() => setBillingCycle('yearly')}
                                    className={cn(
                                        "relative p-8 rounded-[32px] cursor-pointer transition-all duration-300 border-2",
                                        billingCycle === 'yearly'
                                            ? "bg-white dark:bg-slate-900 border-primary-500 shadow-xl shadow-primary-500/10"
                                            : "bg-slate-50/50 dark:bg-slate-900/50 border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                                    )}
                                >
                                    {billingCycle === 'yearly' && (
                                        <div className="absolute top-4 right-4 text-primary-600">
                                            <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                                                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                            </div>
                                        </div>
                                    )}
                                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-7 px-4 rounded-full border-none shadow-lg">
                                        -40% OFF
                                    </Badge>
                                    <div className="text-center space-y-2">
                                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Billed Yearly</p>
                                        <h3 className="text-5xl font-black text-slate-900 dark:text-white">${yearlyPrice}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Member per month</p>
                                    </div>
                                </div>

                                {/* Monthly Plan */}
                                <div
                                    onClick={() => setBillingCycle('monthly')}
                                    className={cn(
                                        "relative p-8 rounded-[32px] cursor-pointer transition-all duration-300 border-2",
                                        billingCycle === 'monthly'
                                            ? "bg-white dark:bg-slate-900 border-primary-500 shadow-xl shadow-primary-500/10"
                                            : "bg-slate-50/50 dark:bg-slate-900/50 border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                                    )}
                                >
                                    {billingCycle === 'monthly' && (
                                        <div className="absolute top-4 right-4 text-primary-600">
                                            <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                                                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="text-center space-y-2">
                                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Billed Monthly</p>
                                        <h3 className="text-5xl font-black text-slate-900 dark:text-white">${monthlyPrice}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Member per month</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white px-1">Add-Ons</h2>

                            <div className="space-y-4">
                                {/* AI Addon */}
                                <div className="p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-6 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center shadow-inner">
                                            <Sparkles size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-900 dark:text-white">Everything AI</h4>
                                                <span className="text-xs font-bold text-slate-400 line-through">$68</span>
                                                <span className="text-xs font-bold text-purple-600">$28 <span className="text-slate-400 font-medium">member/mo</span></span>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed font-medium max-w-md">
                                                Get unlimited access to AI Assign, AI Prioritize, and AI Notetaker along with other new, game-changing DinTask AI features.
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={addons.ai}
                                        onCheckedChange={(checked) => setAddons(prev => ({ ...prev, ai: checked }))}
                                    />
                                </div>

                                {/* Training Addon */}
                                <div className="p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-6 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-900/20 text-pink-600 flex items-center justify-center shadow-inner">
                                            <Rocket size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-900 dark:text-white">Live 1:1 Training with an Expert</h4>
                                                <span className="text-xs font-bold text-slate-400 line-through">$1,300</span>
                                                <span className="text-xs font-bold text-pink-600">$149 <span className="text-slate-400 font-medium">/ month</span></span>
                                            </div>
                                            <ul className="space-y-1 mt-2">
                                                <li className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                                    <Check size={12} className="text-emerald-500" /> 2 hours of Live 1:1 time per month with a Workflow Expert
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={addons.training}
                                        onCheckedChange={(checked) => setAddons(prev => ({ ...prev, training: checked }))}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Features & Checkout */}
                    <div className="w-full lg:w-[400px] shrink-0">
                        <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-2xl p-8 space-y-8 sticky top-8">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-primary-600 tracking-tight">Business</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] pt-4 border-t border-slate-50 dark:border-slate-800">Key Features</p>
                                <ul className="space-y-4 pt-4">
                                    {[
                                        "Unlimited Message History",
                                        "Unlimited Activity views",
                                        "Unlimited Tasks in Multiple Lists",
                                        "Unlimited Private Whiteboards",
                                        "Unlimited Advanced Cards",
                                        "Two-Factor Authentication",
                                        "Google SSO",
                                        "Custom Exporting",
                                        "Workload View",
                                        "Automation Integrations",
                                        "10 Guests + 5 extra per paid user"
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 group">
                                            <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                                                <Check size={12} className="text-emerald-600" strokeWidth={3} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary-600 transition-colors">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="space-y-6 pt-8 border-t border-slate-50 dark:border-slate-800">
                                <div className="text-center space-y-2">
                                    <p className="text-xs font-bold text-slate-400">Trusted by more than</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">3,000,000 Teams</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 items-center justify-items-center opacity-60 grayscale hover:grayscale-0 transition-all">
                                    {/* Mock Badges */}
                                    <div className="p-2 border border-slate-100 rounded-lg text-[10px] font-black w-24 text-center">TRUSTe</div>
                                    <div className="p-2 border border-slate-100 rounded-lg text-[10px] font-black w-24 text-center">ACCREDITED B+</div>
                                    <div className="p-2 border border-slate-100 rounded-lg text-[10px] font-black w-24 text-center">Norton SECURED</div>
                                    <div className="p-2 border border-slate-100 rounded-lg text-[10px] font-black w-24 text-center">100% SECURE</div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-8 border-t border-slate-50 dark:border-slate-800">
                                <Button
                                    className="w-full h-16 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-black text-xl shadow-xl shadow-primary-500/30 transition-all hover:scale-[1.02] active:scale-95 group"
                                    onClick={() => toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
                                        loading: 'Connecting to Razorpay...',
                                        success: 'Checkout ready!',
                                        error: 'Failed to connect. Please try again.'
                                    })}
                                >
                                    Confirm Upgrade <ChevronRight size={24} className="ml-2 transition-transform group-hover:translate-x-1" />
                                </Button>

                                <div className="space-y-3">
                                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">We accept the following cards</p>
                                    <div className="flex items-center justify-center gap-3">
                                        {['VISA', 'MASTERCARD', 'MAESTRO', 'AMEX', 'DISCOVER'].map((card) => (
                                            <div key={card} className="w-10 h-6 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-[8px] font-black text-slate-400 grayscale">
                                                {card}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
