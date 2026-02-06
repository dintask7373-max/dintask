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
import { format } from 'date-fns';

import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from "@/shared/components/ui/progress";
import useEmployeeStore from '@/store/employeeStore';
import { cn } from '@/shared/utils/cn';

import { useNavigate } from 'react-router-dom';
import useSubscriptionStore from '@/store/subscriptionStore';
import useAuthStore from '@/store/authStore';

const Subscription = () => {
    const { employees, subscriptionLimit } = useEmployeeStore();
    const { user, fetchProfile } = useAuthStore();
    const { plans, fetchPlans, createOrder, verifyPayment, billingHistory, fetchBillingHistory, downloadInvoice } = useSubscriptionStore();
    const [loadingPlan, setLoadingPlan] = React.useState(null);
    const [downloadingId, setDownloadingId] = React.useState(null);

    React.useEffect(() => {
        fetchPlans();
        fetchBillingHistory();
    }, []);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async (plan) => {
        setLoadingPlan(plan._id);
        const res = await loadRazorpayScript();

        if (!res) {
            toast.error('Razorpay SDK failed to load. Are you online?');
            setLoadingPlan(null);
            return;
        }

        // Create Order
        const orderRes = await createOrder(plan._id);

        if (orderRes.success && orderRes.free) {
            toast.success('Plan activated successfully!');
            await fetchProfile();
            setLoadingPlan(null);
            return;
        }

        if (!orderRes.success) {
            toast.error(orderRes.error || 'Failed to initiate payment');
            setLoadingPlan(null);
            return;
        }

        const options = {
            key: 'rzp_test_8sYbzHWidwe5Zw', // Should ideally be in env
            amount: orderRes.data.amount,
            currency: orderRes.data.currency,
            name: 'DinTask CRM',
            description: `Payment for ${plan.name} Plan`,
            order_id: orderRes.data.id,
            handler: async (response) => {
                const verifyRes = await verifyPayment({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                });

                if (verifyRes.success) {
                    toast.success('Subscription upgraded successfully!');
                    await fetchProfile(); // Refresh user data to get new plan
                } else {
                    toast.error(verifyRes.error || 'Payment verification failed');
                }
                setLoadingPlan(null);
            },
            prefill: {
                name: user?.name,
                email: user?.email,
            },
            theme: {
                color: '#2563eb'
            }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
        setLoadingPlan(null);
    };

    const usagePercentage = (employees.length / (user?.planDetails?.userLimit || subscriptionLimit)) * 100;

    const currentPlan = {
        name: user?.subscriptionPlan || 'Starter',
        price: '---',
        billing: 'Monthly',
        nextRenewal: user?.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString() : 'N/A',
        features: user?.planDetails?.features || ['Basic Features']
    };

    const [selectedRole, setSelectedRole] = React.useState('employee');
    const referralLinks = {
        employee: `https://dintask.com/employee/register?adminId=${user?.id}`,
        manager: `https://dintask.com/manager/register?adminId=${user?.id}`,
        sales: `https://dintask.com/sales/register?adminId=${user?.id}`
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
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">â‚¹{user?.planDetails?.price || 0}</h3>
                                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 sm:justify-end">
                                    <Clock size={10} /> Next renewal: {currentPlan.nextRenewal}
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

            {/* Upgrade Options Table */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {(plans || []).map((plan, i) => {
                    const isCurrent = user?.subscriptionPlanId === plan._id;
                    return (
                        <Card key={i} className={cn(
                            "border-2 transition-all duration-300",
                            isCurrent
                                ? "border-primary-500 shadow-xl shadow-primary-100 dark:shadow-none bg-white dark:bg-slate-900"
                                : "border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700"
                        )}>
                            <CardHeader>
                                {isCurrent && <Badge className="w-fit mb-2 bg-primary-600">Current Plan</Badge>}
                                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                                <CardDescription className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                                    â‚¹{plan.price}
                                    <span className="text-sm font-normal text-slate-400">/mo</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {plan.features?.map((f, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                            <Check size={14} className="text-emerald-500" />
                                            {f}
                                        </li>
                                    ))}
                                    <li className="flex items-center gap-2 text-xs text-slate-900 font-bold">
                                        <Users size={14} className="text-primary-500" />
                                        Up to {plan.userLimit} Users
                                    </li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    variant={isCurrent ? "default" : "outline"}
                                    className="w-full font-bold"
                                    disabled={isCurrent || loadingPlan === plan._id}
                                    onClick={() => handlePayment(plan)}
                                >
                                    {loadingPlan === plan._id ? 'Processing...' : (isCurrent ? 'Your Active Plan' : `Upgrade to ${plan.name}`)}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {/* Billing History */}
            <Card className="border-none shadow-md shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 mt-8">
                <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <History size={20} className="text-primary-500" />
                        Billing History
                    </CardTitle>
                    <CardDescription>View your past transactions and download invoices.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Invoice</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(billingHistory || []).map((payment) => (
                                    <tr key={payment._id} className="border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 text-[11px] font-bold text-slate-600">
                                            {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="p-4 text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                            {payment.planId?.name || '---'}
                                        </td>
                                        <td className="p-4 text-[11px] font-black text-slate-900 dark:text-white tracking-tight">
                                            â‚¹{payment.amount.toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <Badge className={cn(
                                                "text-[8px] font-black uppercase tracking-widest h-5 px-2 shadow-none border-none",
                                                payment.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                                            )}>
                                                {payment.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={cn(
                                                    "h-8 w-8",
                                                    downloadingId === payment._id ? "text-primary-600 animate-pulse" : "text-slate-400 hover:text-primary-600"
                                                )}
                                                disabled={downloadingId === payment._id}
                                                onClick={async () => {
                                                    setDownloadingId(payment._id);
                                                    await downloadInvoice(payment._id, payment.razorpayOrderId);
                                                    setDownloadingId(null);
                                                }}
                                            >
                                                <Download size={14} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {(!billingHistory || billingHistory.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            No transaction history found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Subscription;
