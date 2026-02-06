import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard,
    DollarSign,
    Download,
    TrendingUp,
    CheckCircle2,
    XCircle,
    RotateCcw,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    ExternalLink,
    FileText,
    History,
    ShieldCheck,
    Clock,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import useSuperAdminStore from '@/store/superAdminStore';

const BillingPayments = () => {
    const {
        billingStats,
        transactions,
        fetchBillingStats,
        fetchTransactions,
        loading
    } = useSuperAdminStore();
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    React.useEffect(() => {
        fetchBillingStats();
        fetchTransactions();
    }, []);

    const tabMappings = {
        'success': 'paid',
        'failed': 'failed',
        'refunded': 'refunded'
    };

    const filteredPayments = (transactions || []).filter(p => {
        const companyName = p.adminId?.companyName || '';
        const txnId = p.razorpayOrderId || '';
        const matchesSearch = companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            txnId.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTab = activeTab === 'all' ||
            (activeTab === 'success' && p.status === 'paid') ||
            (p.status === tabMappings[activeTab]);

        return matchesSearch && matchesTab;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'paid': case 'success': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'failed': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'refunded': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid': case 'success': return <CheckCircle2 size={14} />;
            case 'failed': return <XCircle size={14} />;
            case 'refunded': return <RotateCcw size={14} />;
            default: return <Clock size={14} />;
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight tracking-tighter uppercase italic">
                        Billing & <span className="text-primary-600">Payments</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global revenue tracking & payment gateway management.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 bg-white font-black text-[10px] uppercase tracking-[0.2em] gap-2">
                        <Download size={16} /> EXPORT
                    </Button>
                    <Button className="h-11 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-black text-[10px] uppercase tracking-[0.2em] gap-2 shadow-lg shadow-primary-500/20">
                        <DollarSign size={16} /> SETTLEMENTS
                    </Button>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', value: `₹${(billingStats.totalRevenue).toLocaleString()}`, icon: DollarSign, color: 'text-primary-600', bg: 'bg-primary-50', trend: '+12.5%', isUp: true },
                    { label: 'Active Subscriptions', value: billingStats.activeSubscriptions, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+3.2%', isUp: true },
                    { label: 'Pending Refunds', value: `₹${(billingStats.pendingRefunds).toLocaleString()}`, icon: RotateCcw, color: 'text-amber-600', bg: 'bg-amber-50', trend: '0%', isUp: true },
                    { label: 'Churn Rate', value: `${billingStats.churnRate}%`, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50', trend: '+0.5%', isUp: false }
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all rounded-[2rem]">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`size-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                    <stat.icon size={24} />
                                </div>
                                <div className={`flex items-center gap-1 text-[10px] font-black ${stat.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {stat.trend}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Payment Filter & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-xl w-full md:w-auto">
                    {['all', 'success', 'failed', 'refunded'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="SEARCH TRANSACTIONS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-slate-50 border-none rounded-xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-primary-500/10 transition-all placeholder:text-slate-300"
                    />
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <History className="text-primary-600" size={20} />
                        <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Transaction History</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 font-black px-3 py-1 uppercase text-[9px] tracking-widest">
                            {filteredPayments.length} TOTAL
                        </Badge>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Company / Order ID</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type & Plan</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Gateway</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence mode='popLayout'>
                                {filteredPayments.map((payment) => (
                                    <motion.tr
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        key={payment._id}
                                        className="group hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-900 uppercase tracking-tight group-hover:text-primary-600 transition-colors">
                                                    {payment.adminId?.companyName || 'Deleted Admin'}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-400 mt-0.5">{payment.razorpayOrderId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-700 uppercase">Subscription Purchase</span>
                                                <span className="text-[10px] font-black text-primary-600 mt-0.5 uppercase tracking-wider">{payment.planId?.name || '---'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-700 uppercase">
                                                    <Calendar size={12} className="text-slate-400" />
                                                    {new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-400 mt-0.5 flex items-center gap-1 uppercase tracking-widest">
                                                    <ShieldCheck size={10} /> Razorpay
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black text-slate-900 tracking-tighter">₹{(payment.amount).toLocaleString()}</span>
                                                <span className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Incl. GST</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusStyle(payment.status)}`}>
                                                {getStatusIcon(payment.status)}
                                                {payment.status === 'paid' ? 'SUCCESS' : payment.status.toUpperCase()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button variant="ghost" size="sm" className="size-8 p-0 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-primary-600 border border-transparent hover:border-slate-100">
                                                    <Download size={14} />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="size-8 p-0 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-primary-600 border border-transparent hover:border-slate-100">
                                                    <FileText size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-slate-50 bg-slate-50/20 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Showing {filteredPayments.length} of {transactions.length} entries</p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled className="h-8 px-4 rounded-lg font-black text-[9px] uppercase tracking-widest border-slate-200">PREV</Button>
                        <Button variant="outline" size="sm" className="h-8 px-4 rounded-lg font-black text-[9px] uppercase tracking-widest bg-white border-slate-200 text-primary-600 shadow-sm">1</Button>
                        <Button variant="outline" size="sm" disabled className="h-8 px-4 rounded-lg font-black text-[9px] uppercase tracking-widest border-slate-200">NEXT</Button>
                    </div>
                </div>
            </div>

            {/* Refund & Settings Section */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Gateway Logs */}
                <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <RefreshCw className="text-indigo-600" size={20} />
                            <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Gateway Event Stream</h2>
                        </div>
                        <Button variant="ghost" size="sm" className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:bg-primary-50">VIEW STREAM</Button>
                    </div>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            {[
                                { event: 'Webhook Received', provider: 'Razorpay', status: 'delivered', time: '2 mins ago' },
                                { event: 'Order Created', provider: 'Razorpay', status: 'success', time: '14 mins ago' },
                                { event: 'Signature Verified', provider: 'Razorpay', status: 'success', time: '1 hour ago' },
                                { event: 'Payment Captured', provider: 'Razorpay', status: 'success', time: '3 hours ago' }
                            ].map((log, i) => (
                                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{log.event}</span>
                                        <span className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{log.provider} • {log.status}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[9px] font-black text-slate-400 uppercase">{log.time}</span>
                                        <ExternalLink size={12} className="text-slate-300" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Refund & Policy Quick Actions */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 border-none shadow-xl rounded-[2rem] text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <ShieldCheck size={120} />
                        </div>
                        <CardContent className="p-8 relative z-10">
                            <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/10">
                                <RotateCcw size={28} className="text-primary-500" />
                            </div>
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2 leading-tight">
                                Tactical <span className="text-primary-500">Refunds</span>
                            </h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8 max-w-xs leading-relaxed">
                                Manage payment disputes and manual refund overrides across all client nodes.
                            </p>
                            <Button className="bg-primary-600 text-white hover:bg-primary-700 h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary-500/20">
                                LAUNCH OVERRIDE
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                            <FileText className="text-slate-400 mb-3 group-hover:text-primary-500 transition-colors" size={24} />
                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">GST TEMPLATES</h4>
                            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Tax Compliance</p>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                            <RefreshCw className="text-slate-400 mb-3 group-hover:text-amber-500 transition-colors" size={24} />
                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">RECOVERY LOGS</h4>
                            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Sync Status</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingPayments;
