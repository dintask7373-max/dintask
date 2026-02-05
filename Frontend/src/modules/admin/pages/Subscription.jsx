import React from 'react';
import {
    CreditCard,
    Check,
    Users,
    Shield,
    Zap,
    Clock,
    ChevronRight,
    TrendingUp,
    History,
    Download
} from 'lucide-react';

import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from "@/shared/components/ui/progress";
import useEmployeeStore from '@/store/employeeStore';
import { cn } from '@/shared/utils/cn';

const Subscription = () => {
    const { employees, subscriptionLimit } = useEmployeeStore();
    const usagePercentage = (employees.length / subscriptionLimit) * 100;

    const currentPlan = {
        name: 'Pro Team',
        price: 'â‚¹2,499/mo',
        billing: 'Monthly',
        nextBill: 'Feb 15, 2026',
        features: [
            'Up to 5 Team Members',
            'Advanced Reports',
            'Custom Task Priority',
            'Location Tracking',
            '5GB File Storage'
        ]
    };

    const plans = [
        {
            name: 'Starter',
            price: 'â‚¹999/mo',
            limit: 2,
            features: ['Basic Task Mgmt', 'Mobile App', 'Email Reports'],
            current: false
        },
        {
            name: 'Pro Team',
            price: 'â‚¹2,499/mo',
            limit: 5,
            features: ['Everything in Starter', 'Advanced Analytics', 'Location Verification'],
            current: true
        },
        {
            name: 'Business',
            price: 'â‚¹4,999/mo',
            limit: 20,
            features: ['Everything in Pro', 'Custom Branding', 'API Access', '24/7 Support'],
            current: false
        }
    ];

    const [selectedRole, setSelectedRole] = React.useState('employee');
    const referralLinks = {
        employee: 'https://dintask.com/employee/register?ref=ADM-99X2',
        manager: 'https://dintask.com/manager/register?ref=ADM-99X2',
        sales: 'https://dintask.com/sales/register?ref=ADM-99X2'
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Subscription & Billing</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage your plan, billing history, and team seats.
                    </p>
                </div>
                <Badge variant="outline" className="bg-primary-50 text-primary-600 border-primary-100 dark:bg-primary-900/10 dark:border-primary-900/30 px-3 py-1">
                    <Zap size={14} className="mr-1.5 fill-primary-600" />
                    System Active
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Plan Overview */}
                <Card className="lg:col-span-2 border-none shadow-md shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-bold">Current Plan</CardTitle>
                        <CardDescription>Details of your active subscription</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Plan</p>
                                <h3 className="text-2xl font-black text-primary-600">{currentPlan.name}</h3>
                                <p className="text-sm text-slate-500">{currentPlan.billing} billing period</p>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Price</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{currentPlan.price}</h3>
                                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 sm:justify-end">
                                    <Clock size={10} /> Next renewal: {currentPlan.nextBill}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Users size={18} className="text-primary-500" />
                                    Seat Utilization
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Total Seats Used</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{employees.length} / {subscriptionLimit}</span>
                                    </div>
                                    <Progress value={usagePercentage} className="h-2 bg-slate-100 dark:bg-slate-800" />
                                    <p className="text-[10px] text-slate-400 italic">
                                        {usagePercentage > 80 ? "âš ï¸ You are running out of seats." : "You have room for more team members."}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Shield size={18} className="text-primary-500" />
                                    Plan Features
                                </h4>
                                <ul className="space-y-2">
                                    {currentPlan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                            <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                                <Check size={10} />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
                        <p className="text-[11px] text-slate-400 italic">Payments are secured via Stripe API.</p>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-xs">Cancel</Button>
                            <Button variant="outline" size="sm" className="text-xs h-8 border-slate-200 dark:border-slate-800">Update Payment</Button>
                        </div>
                    </CardFooter>
                </Card>

                {/* Invitation Link Section */}
                <Card className="lg:col-span-3 border-dashed border-2 border-primary-500/30 bg-primary-50/5 dark:bg-primary-900/5 overflow-hidden">
                    <CardContent className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="p-4 rounded-3xl bg-primary-100 dark:bg-primary-900/30 text-primary-600">
                                <Users size={40} />
                            </div>
                            <div className="flex-1 space-y-4 text-center md:text-left">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Invite Your Team Members</h3>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-xl text-sm font-medium">
                                        Select a role to generate a unique registration link. Share it with your team to give them access to their respective dashboards.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                                    {['employee', 'manager', 'sales'].map((role) => (
                                        <Button
                                            key={role}
                                            variant={selectedRole === role ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setSelectedRole(role)}
                                            className={cn(
                                                "h-8 px-4 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-300",
                                                selectedRole === role
                                                    ? "bg-slate-900 dark:bg-white dark:text-slate-900 shadow-md translate-y-[-1px]"
                                                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                                            )}
                                        >
                                            {role} Link
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="w-full md:w-auto space-y-3">
                                <div className="flex bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-1 pl-4 items-center ring-4 ring-primary-500/5 shadow-inner">
                                    <span className="text-xs font-mono text-slate-400 truncate max-w-[180px]">
                                        {referralLinks[selectedRole].replace('https://', '')}
                                    </span>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="ml-4 h-9 font-bold bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-500/20 px-6"
                                        onClick={() => {
                                            navigator.clipboard.writeText(referralLinks[selectedRole]);
                                            toast.success(`${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} invitation link copied!`);
                                        }}
                                    >
                                        Copy
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 pt-1">
                                    <span>Remaining Seats</span>
                                    <span className="text-primary-600">{subscriptionLimit - employees.length} slots</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Billing Stats / Actions */}
                <div className="space-y-6">

                    <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
                        <CardContent className="p-6">
                            <TrendingUp className="text-primary-400 mb-4 opacity-50" size={32} />
                            <h4 className="text-lg font-bold mb-1">Scale Your Business</h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                                Unlock advanced features and more team slots with our Business plan.
                            </p>
                            <Button className="w-full bg-primary-600 hover:bg-primary-700 border-none font-bold text-xs h-10 shadow-lg shadow-black/20">
                                Compare Plans <ChevronRight size={14} className="ml-1" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Upgrade Options Table placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {plans.map((plan, i) => (
                    <Card key={i} className={cn(
                        "border-2 transition-all duration-300",
                        plan.current
                            ? "border-primary-500 shadow-xl shadow-primary-100 dark:shadow-none bg-white dark:bg-slate-900"
                            : "border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700"
                    )}>
                        <CardHeader>
                            {plan.current && <Badge className="w-fit mb-2 bg-primary-600">Current Plan</Badge>}
                            <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                            <CardDescription className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                                {plan.price}
                                <span className="text-sm font-normal text-slate-400">/mo</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {plan.features.map((f, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                        <Check size={14} className="text-emerald-500" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant={plan.current ? "default" : "outline"}
                                className="w-full font-bold"
                                disabled={plan.current}
                            >
                                {plan.current ? 'Your Active Plan' : `Upgrade to ${plan.name}`}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Subscription;
