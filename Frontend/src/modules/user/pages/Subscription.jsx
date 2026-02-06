import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Star, Shield, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import ContactSalesModal from '../components/ContactSalesModal';
import useEmployeeStore from '@/store/employeeStore';
import { useNavigate } from 'react-router-dom';

const Subscription = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('');
    const workspace = useEmployeeStore(state => state.workspace);
    const navigate = useNavigate();

    const handlePlanClick = (plan) => {
        if (plan.name === 'Free') return;
        setSelectedPlan(plan.name);

        if (plan.name === 'Enterprise') {
            setIsModalOpen(true);
        } else {
            navigate('/employee/checkout');
        }
    };

    const plans = [
        {
            name: "Free",
            price: "$0",
            duration: "Forever",
            description: "Everything you need to get started.",
            features: [
                "Unlimited Storage",
                "Unlimited Folders",
                "Basic Task Management",
                "Email Support"
            ],
            cta: "Current Plan",
            ctaVariant: "outline",
            popular: false,
            icon: Star
        },
        {
            name: "Pro",
            price: "$12",
            duration: "member / month",
            description: "Perfect for growing teams.",
            features: [
                "Everything in Free",
                "Google SSO",
                "Unlimited Message History",
                "Advanced Reporting"
            ],
            cta: "Upgrade",
            ctaVariant: "default",
            popular: false,
            icon: Crown
        },
        {
            name: "Pro Plus",
            price: "$29",
            duration: "member / month",
            description: "Advanced features for professionals.",
            features: [
                "Everything in Pro",
                "Custom Branding",
                "Priority Support",
                "Advanced Security",
                "Team Analytics"
            ],
            cta: "Get Started",
            ctaVariant: "default",
            popular: true,
            icon: Zap
        },
        {
            name: "Enterprise",
            price: "Custom",
            duration: "pricing",
            description: "Advanced controls for large orgs.",
            features: [
                "Everything in Pro Plus",
                "White Labeling",
                "Enterprise API",
                "Audit Log",
                "Dedicated Success Manager"
            ],
            cta: "Contact Sales",
            ctaVariant: "outline",
            popular: false,
            icon: Shield
        }
    ];

    return (
        <div className="min-h-full pb-24 px-3 md:px-4 pt-4 md:pt-6">
            {!workspace && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-5xl mx-auto mb-8 md:mb-12"
                >
                    <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none">
                        {/* Decorative gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-primary-950/20 dark:via-purple-950/20 dark:to-pink-950/20 opacity-60" />

                        {/* Content */}
                        <div className="relative p-6 md:p-8">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                {/* Left Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                                            <Star className="text-white w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white">Have an Invite Link?</h3>
                                            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">Join your organization</p>
                                        </div>
                                    </div>
                                    <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 ml-0 md:ml-[52px]">
                                        Connect with your team's workspace and get instant access to all premium features and collaboration tools.
                                    </p>
                                </div>

                                {/* Right Button */}
                                <Button
                                    onClick={() => navigate('/employee/join')}
                                    className="bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-bold px-6 md:px-8 rounded-xl md:rounded-2xl h-11 md:h-12 shadow-lg shadow-primary-500/30 transition-all active:scale-95 shrink-0 w-full md:w-auto"
                                >
                                    Join Workspace
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {workspace && (
                <div className="max-w-5xl mx-auto mb-8 md:mb-12 p-4 md:p-6 rounded-2xl md:rounded-[32px] bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                        <Crown size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h3 className="text-sm md:text-lg font-bold text-slate-800 dark:text-white">Active Workspace: <span className="text-emerald-600 dark:text-emerald-400 font-black">{workspace}</span></h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm text-balance">You are using your team's premium subscription. Enjoy unlimited access to all features!</p>
                    </div>
                </div>
            )}

            <div className="text-center mb-6 md:mb-10 space-y-2 md:space-y-3 px-2">
                <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    {workspace ? 'Workspace Subscription' : 'Upgrade your Workspace'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-xs md:text-sm">
                    {workspace ? 'Your team’s current active plan and benefits.' : 'Choose the plan that best fits your team\'s needs and scale without limits.'}
                </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-7xl mx-auto">
                {plans.map((plan, index) => (
                    <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                    >
                        {plan.popular && (
                            <div className="absolute -top-3 md:-top-4 left-0 right-0 mx-auto w-24 md:w-32 bg-gradient-to-r from-primary-600 to-purple-600 text-white text-[8px] md:text-xs font-bold py-0.5 md:py-1 px-2 md:px-3 rounded-full text-center shadow-lg shadow-primary-500/20 z-10 flex items-center justify-center gap-1">
                                <Star size={8} className="md:w-2.5 md:h-2.5" fill="currentColor" /> Popular
                            </div>
                        )}

                        <Card className={`h-full overflow-hidden border transition-all duration-300 hover:shadow-xl rounded-2xl md:rounded-3xl ${plan.popular
                            ? 'border-primary-500/50 dark:border-primary-400/50 shadow-lg shadow-primary-500/10 lg:scale-110 z-0 bg-white dark:bg-slate-900'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-white dark:hover:bg-slate-900'
                            }`}>
                            <CardContent className="p-3 md:p-6 flex flex-col h-full">
                                <div className="mb-4 md:mb-6">
                                    <div className="flex items-center gap-1.5 md:gap-2 mb-2">
                                        <div className={`p-1.5 md:p-2 rounded-lg ${plan.popular ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                            <plan.icon size={14} className="md:w-5 md:h-5" />
                                        </div>
                                        <h3 className="text-xs md:text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                                    </div>
                                    <div className="flex items-baseline gap-0.5 md:gap-1">
                                        <span className="text-xl md:text-4xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                                        {plan.price !== 'Custom' && (
                                            <span className="text-[10px] md:text-sm font-medium text-slate-500 dark:text-slate-400">/mo</span>
                                        )}
                                    </div>
                                    <p className="text-[8px] md:text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5 md:mt-1">{plan.duration}</p>
                                </div>

                                <Button
                                    variant={plan.popular ? 'default' : 'outline'}
                                    onClick={() => handlePlanClick(plan)}
                                    className={`w-full mb-4 md:mb-8 font-semibold text-[10px] md:text-sm h-8 md:h-10 rounded-lg md:rounded-xl ${plan.popular
                                        ? 'bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white shadow-md shadow-primary-500/20'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400'
                                        }`}
                                >
                                    {plan.cta}
                                </Button>

                                <div className="space-y-2 md:space-y-4 flex-1">
                                    <p className="text-[8px] md:text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide">
                                        Features
                                    </p>
                                    <ul className="space-y-1.5 md:space-y-3">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-1.5 md:gap-3">
                                                <div className="mt-0.5 min-w-[12px] md:min-w-[16px]">
                                                    <Check size={12} className="md:w-4 md:h-4 text-primary-600 dark:text-primary-400" strokeWidth={2.5} />
                                                </div>
                                                <span className="text-[10px] md:text-sm text-slate-600 dark:text-slate-300 leading-tight">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="mt-8 md:mt-12 text-center px-4">
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-3 md:mb-4">
                    Need a custom solution for your large organization?
                </p>
                <Button
                    variant="link"
                    onClick={() => {
                        setSelectedPlan('Enterprise');
                        setIsModalOpen(true);
                    }}
                    className="text-primary-600 dark:text-primary-400 font-semibold p-0 h-auto hover:underline text-xs md:text-sm"
                >
                    Talk to our Sales Team <ArrowRight size={12} className="md:w-3.5 md:h-3.5 ml-1 inline-block" />
                </Button>
            </div>

            <ContactSalesModal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                planName={selectedPlan}
            />
        </div>
    );
};

export default Subscription;
