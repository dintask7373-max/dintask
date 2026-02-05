import React, { useState } from 'react';
import {
    History,
    Search,
    Download,
    Calendar,
    Building2,
    CheckCircle2,
    Clock,
    AlertCircle,
    MoreVertical,
    ArrowUpRight,
    TrendingUp,
    CreditCard,
    Filter,
    ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { motion } from 'framer-motion';

const SubscriptionHistory = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const [historyData] = useState([
        {
            id: 'TXN-9901',
            company: 'ABC Pvt Ltd',
            plan: 'Pro Enterprise',
            amount: '₹45,000',
            status: 'Active',
            startDate: '2024-01-10',
            endDate: '2024-02-10',
            paymentMethod: 'UPI',
            users: 85,
            health: 'Healthy'
        },
        {
            id: 'TXN-9902',
            company: 'Zenith Logistics',
            plan: 'Starter Plus',
            amount: '₹12,500',
            status: 'Expiring Soon',
            startDate: '2024-01-15',
            endDate: '2024-02-08',
            paymentMethod: 'Credit Card',
            users: 12,
            health: 'Warning'
        },
        {
            id: 'TXN-9903',
            company: 'Crystal Clear Co',
            plan: 'Custom Tactical',
            amount: '₹89,000',
            status: 'Active',
            startDate: '2023-12-20',
            endDate: '2024-03-20',
            paymentMethod: 'Net Banking',
            users: 150,
            health: 'Healthy'
        },
        {
            id: 'TXN-9904',
            company: 'Global Tech',
            plan: 'Free Tier',
            amount: '₹0',
            status: 'Expired',
            startDate: '2023-12-01',
            endDate: '2024-01-01',
            paymentMethod: 'N/A',
            users: 5,
            health: 'Critical'
        }
    ]);

    const filteredData = historyData.filter(item => {
        const matchesSearch = item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.plan.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200';
            case 'Expiring Soon': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200';
            case 'Expired': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800';
        }
    };

    return (
        <div className="space-y-6 pb-6 px-4 md:px-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
                            <History className="text-white" size={20} />
                        </div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">
                            Subscription <span className="text-indigo-600">History</span>
                        </h1>
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest sm:ml-11">
                        Complete Audit Trail
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" className="h-10 px-4 border-slate-200 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest rounded-lg flex items-center gap-2 hover:bg-slate-50 flex-1 sm:flex-none">
                        <Download size={14} /> EXPORT
                    </Button>
                    <div className="relative flex-1 sm:flex-none">
                        <Input
                            placeholder="SEARCH COMPANY..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-full sm:w-60 h-10 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-lg font-bold text-[10px] uppercase tracking-widest"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                </div>
            </div>

            {/* Quick Overview Cards - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Active', val: '142', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
                    { label: 'Revenue (MTD)', val: '₹12.4L', icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/10' },
                    { label: 'Renewals (7d)', val: '18', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
                    { label: 'Churn Rate', val: '2.4%', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden group">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.val}</h3>
                                </div>
                                <div className={`size-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                    <stat.icon size={20} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main History View */}
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest italic flex items-center gap-2">
                        <Filter size={14} className="text-indigo-600" /> Subscription Feed
                    </h3>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                        {['All', 'Active', 'Expiring', 'Expired'].map(f => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f === 'Expiring' ? 'Expiring Soon' : f)}
                                className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${(statusFilter === f || (statusFilter === 'Expiring Soon' && f === 'Expiring'))
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-slate-400 hover:text-indigo-600'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Desktop Table / Mobile Card Switcher */}
                <CardContent className="p-0">
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-50 dark:border-slate-800">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Company / Plan</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dates</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {filteredData.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100 dark:border-indigo-900/50">
                                                    <Building2 size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.company}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                        <CreditCard size={10} /> {item.plan}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tighter">
                                                    <span className="text-indigo-500 w-8">ACT:</span> {item.startDate}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tighter">
                                                    <span className="text-red-500 w-8">EXP:</span> {item.endDate}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <Badge className={`${getStatusStyle(item.status)} border-none text-[8px] font-black uppercase tracking-widest px-2.5 py-1`}>
                                                {item.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-sm text-slate-900 dark:text-white tracking-widest">
                                            {item.amount}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <Button variant="ghost" size="icon" className="size-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                                                <ArrowUpRight size={18} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredData.map((item) => (
                            <div key={item.id} className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 border border-indigo-100 dark:border-indigo-900/50">
                                            <Building2 size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.company}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.plan}</p>
                                        </div>
                                    </div>
                                    <Badge className={`${getStatusStyle(item.status)} border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5`}>
                                        {item.status}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Activation</p>
                                        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{item.startDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Expiry</p>
                                        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{item.endDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Value</p>
                                        <p className="text-[11px] font-black text-indigo-600">{item.amount}</p>
                                    </div>
                                    <div className="flex items-end justify-end">
                                        <Button variant="ghost" size="sm" className="h-8 text-[9px] font-black uppercase tracking-widest text-indigo-600">
                                            DETAILS <ChevronRight size={12} className="ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SubscriptionHistory;
