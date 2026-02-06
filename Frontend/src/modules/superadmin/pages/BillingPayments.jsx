import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard,
    DollarSign,
    Receipt,
    Download,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    XCircle,
    RotateCcw,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    Search,
    ChevronDown,
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
    const { admins, stats } = useSuperAdminStore();
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Mock payments data for demonstration
    const payments = useMemo(() => [
        {
            id: 'TXN-001',
            company: 'Tech Solutions Inc.',
            plan: 'Pro Team',
            amount: 2499,
            gst: 450,
            total: 2949,
            status: 'success',
            date: '2026-02-05T10:30:00Z',
            gateway: 'Razorpay',
            invoiceNo: 'INV-2026-001',
            type: 'Subscription Renewal'
        },
        {
            id: 'TXN-002',
            company: 'Creative Agency',
            plan: 'Starter',
            amount: 999,
            gst: 180,
            total: 1179,
            status: 'failed',
            error: 'Insufficient Funds',
            date: '2026-02-04T15:20:00Z',
            gateway: 'Stripe',
            invoiceNo: '-',
            type: 'Plan Upgrade'
        },
        {
            id: 'TXN-003',
            company: 'Global Logistics',
            plan: 'Business',
            amount: 4999,
            gst: 900,
            total: 5899,
            status: 'refunded',
            date: '2026-02-03T09:00:00Z',
            gateway: 'Razorpay',
            invoiceNo: 'INV-2026-002',
            type: 'Double Payment'
        },
        {
            id: 'TXN-004',
            company: 'Future Space',
            plan: 'Pro Team',
            amount: 2499,
            gst: 450,
            total: 2949,
            status: 'success',
            date: '2026-02-01T11:15:00Z',
            gateway: 'PayPal',
            invoiceNo: 'INV-2026-003',
            type: 'New Subscription'
        },
        {
            id: 'TXN-005',
            company: 'Creative Agency',
            plan: 'Starter',
            amount: 999,
            gst: 180,
            total: 1179,
            status: 'success',
            date: '2026-01-28T14:45:00Z',
            gateway: 'Stripe',
            invoiceNo: 'INV-2026-004',
            type: 'New Subscription'
        }
    ], []);

    const filteredPayments = payments.filter(p => {
        const matchesSearch = p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'all' || p.status === activeTab;
        return matchesSearch && matchesTab;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'success': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'failed': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'refunded': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return <CheckCircle2 size={14} />;
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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">BILLING & PAYMENTS</h1>
                    <p className="text-slate-500 font-medium">Global revenue tracking & payment gateway management.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 bg-white font-bold text-xs uppercase tracking-widest gap-2">
                        <Download size={16} /> Export Reports
                    </Button>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', value: `₹${(stats.totalRevenue).toLocaleString()}`, icon: DollarSign, color: 'text-primary-600', bg: 'bg-primary-50', trend: '+12.5%', isUp: true },
                    { label: 'Active Subscriptions', value: admins.length, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+3.2%', isUp: true },
                    { label: 'Pending Refunds', value: '₹14,500', icon: RotateCcw, color: 'text-amber-600', bg: 'bg-amber-50', trend: '-5.1%', isUp: false },
                    { label: 'Churn Rate', value: '2.4%', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50', trend: '+0.5%', isUp: false }
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`size-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                    <stat.icon size={24} />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-bold ${stat.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {stat.trend}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
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
                            className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab
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
                        placeholder="Search Transactions or Companies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <History className="text-primary-600" size={20} />
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Transaction History</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 font-bold px-3 py-1 uppercase text-[10px]">
                            {filteredPayments.length} Total
                        </Badge>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Company / Transaction ID</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type & Plan</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Gateway</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount (incl. GST)</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>

                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence mode='popLayout'>
                                {filteredPayments.map((payment, i) => (
                                    <motion.tr
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        key={payment.id}
                                        className="group hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{payment.company}</span>
                                                <span className="text-[10px] font-medium text-slate-400 mt-0.5">{payment.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-700">{payment.type}</span>
                                                <span className="text-[10px] font-black text-primary-600/70 mt-0.5 uppercase tracking-wider">{payment.plan}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                                    <Calendar size={12} className="text-slate-400" />
                                                    {new Date(payment.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                                <span className="text-[10px] font-medium text-slate-400 mt-0.5 flex items-center gap-1">
                                                    <ShieldCheck size={10} /> {payment.gateway}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black text-slate-900">₹{(payment.total).toLocaleString()}</span>
                                                <span className="text-[10px] font-medium text-slate-400 mt-0.5">GST: ₹{payment.gst}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(payment.status)}`}>
                                                {getStatusIcon(payment.status)}
                                                {payment.status}
                                            </div>
                                            {payment.error && (
                                                <div className="text-[9px] font-bold text-rose-400 mt-1 uppercase pl-1">{payment.error}</div>
                                            )}
                                        </td>

                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>


            </div>


        </div>
    );
};

export default BillingPayments;
