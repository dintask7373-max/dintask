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
    ArrowUpRight,
    TrendingUp,
    CreditCard,
    Filter,
    ChevronRight,
    CircleDashed
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import useSuperAdminStore from '@/store/superAdminStore';
import useAuthStore from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

const SubscriptionHistory = () => {
    const {
        subscriptionHistory,
        fetchSubscriptionHistory,
        loading,
        billingStats,
        fetchBillingStats
    } = useSuperAdminStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const { role } = useAuthStore();
    const navigate = useNavigate();

    React.useEffect(() => {
        fetchSubscriptionHistory();
        fetchBillingStats();
    }, [fetchSubscriptionHistory, fetchBillingStats]);

    const filteredData = (subscriptionHistory || []).filter(item => {
        const matchesSearch = item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.planName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'All' ||
            (statusFilter === 'Expiring' && item.daysRemaining <= 7 && item.status === 'active') ||
            item.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status, daysRemaining) => {
        if (status === 'active' && daysRemaining <= 7) return 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-500/10';
        switch (status.toLowerCase()) {
            case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-500/10';
            case 'expired': return 'bg-rose-50 text-rose-600 border-rose-100 shadow-sm shadow-rose-500/10';
            case 'inactive': return 'bg-slate-50 text-slate-500 border-slate-100';
            default: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '---';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleExport = () => {
        if (!filteredData.length) {
            toast.error("No data available to export");
            return;
        }

        try {
            // Prepare data with proper headers
            const exportRows = filteredData.map(item => ({
                'Company Name': item.companyName,
                'Subscription Plan': item.planName,
                'Deployment Start': item.startDate ? new Date(item.startDate).toLocaleDateString('en-IN') : 'N/A',
                'Expiry Date': item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-IN') : 'Permanent',
                'Status': item.status.toUpperCase(),
                'Days Remaining': item.daysRemaining,
                'Total Revenue (INR)': item.revenue
            }));

            // Create Worksheet
            const ws = XLSX.utils.json_to_sheet(exportRows);

            // Set column widths for better readability
            const wscols = [
                { wch: 30 }, // Company Name
                { wch: 20 }, // Plan
                { wch: 15 }, // Start
                { wch: 15 }, // Expiry
                { wch: 15 }, // Status
                { wch: 15 }, // Days
                { wch: 20 }  // Revenue
            ];
            ws['!cols'] = wscols;

            // Create Workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Subscription Audit");

            // Generate Filename with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `DinTask_Subscription_Audit_${timestamp}.xlsx`;

            // Write File
            XLSX.writeFile(wb, filename);
            toast.success("Audit report exported successfully");
        } catch (error) {
            console.error('Export Error:', error);
            toast.error("Failed to generate export file");
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                            <History className="text-white" size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-tight">
                            Subscription <span className="text-indigo-600">History</span>
                        </h1>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                        Complete Dynamic Audit Trail of Client Nodes
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        onClick={handleExport}
                        disabled={role === 'superadmin_staff'}
                        variant="outline"
                        className="h-11 px-6 border-slate-200 bg-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Download size={16} /> {role === 'superadmin_staff' ? 'EXPORT LOCKED' : 'EXPORT AUDIT'}
                    </Button>
                    <div className="relative">
                        <Input
                            placeholder="SEARCH COMPANY..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 w-full md:w-72 h-11 border-none bg-white shadow-sm rounded-xl font-black text-[10px] uppercase tracking-[0.2em] placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-indigo-500/10"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                </div>
            </div>

            {/* Tactical Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Active', val: billingStats.activeSubscriptions || 0, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Revenue (TOTAL)', val: role === 'superadmin' ? `₹${(billingStats.totalRevenue / 100000).toFixed(2)}L` : '₹ ••••••', icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { label: 'Expiring Nodes', val: (subscriptionHistory || []).filter(i => i.daysRemaining <= 7 && i.status === 'active').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Churn Rate', val: `${billingStats.churnRate || 0}%`, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative"
                    >
                        {role === 'superadmin_staff' && stat.label === 'Revenue (TOTAL)' && (
                            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] z-20 rounded-[2rem]" />
                        )}
                        <Card className="border-none shadow-sm bg-white overflow-hidden group rounded-[2rem] hover:shadow-md transition-all">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{stat.val}</h3>
                                </div>
                                <div className={`size-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner`}>
                                    <stat.icon size={24} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main History Feed */}
            <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] italic flex items-center gap-2">
                        <Filter size={14} className="text-indigo-600" /> Subscription Deployment Feed
                    </h3>
                    <div className="flex gap-2 bg-white p-1 rounded-xl shadow-inner border border-slate-100">
                        {['All', 'Active', 'Expiring', 'Expired'].map(f => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${(statusFilter === f)
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-slate-400 hover:text-indigo-600'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <CardContent className="p-0">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-3">
                            <div className="size-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Fetching Secure Audit Data...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/30">
                                    <tr className="border-b border-slate-50">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Company & Plan</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment Dates</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Remaining Validity</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Revenue Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <AnimatePresence mode="popLayout">
                                        {filteredData.map((item) => (
                                            <motion.tr
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                key={item._id}
                                                className="group hover:bg-slate-50/50 transition-colors"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100 group-hover:bg-white group-hover:scale-110 transition-all duration-500 shadow-sm">
                                                            <Building2 size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.companyName}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest bg-white border-slate-200 text-indigo-600 px-2 py-0.5 rounded-md">
                                                                    <CreditCard size={10} className="mr-1" /> {item.planName}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-tight">
                                                            <span className="text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded opacity-70 w-10 text-center">START</span>
                                                            {formatDate(item.startDate)}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-tight">
                                                            <span className="text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded opacity-70 w-10 text-center">EXPIRY</span>
                                                            {formatDate(item.expiryDate)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <div className={`text-sm font-black tracking-tighter ${item.daysRemaining <= 7 ? 'text-amber-600' : 'text-slate-900 underline decoration-indigo-200 decoration-2 underline-offset-4'}`}>
                                                            {item.daysRemaining} {item.daysRemaining === 1 ? 'DAY' : 'DAYS'}
                                                        </div>
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Countdown</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <Badge className={`${getStatusStyle(item.status, item.daysRemaining)} border-2 text-[9px] font-black uppercase tracking-[0.1em] px-4 py-1.5 rounded-full`}>
                                                        {item.status === 'active' && item.daysRemaining <= 7 ? 'EXPIRING SOON' : item.status.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td className="px-8 py-6 text-right font-black text-sm text-slate-900 tracking-tighter">
                                                    {role === 'superadmin' ? `₹${(item.revenue || 0).toLocaleString()}` : '₹ ••••••'}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                    {filteredData.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan={5} className="py-24 text-center">
                                                <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                                    <CircleDashed className="text-slate-200 animate-pulse" size={32} />
                                                </div>
                                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">No subscription logs detected matching criteria</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SubscriptionHistory;
