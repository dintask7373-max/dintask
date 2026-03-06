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
import { cn } from '@/shared/utils/cn';

const SubscriptionHistory = () => {
    const {
        subscriptionHistory,
        fetchSubscriptionHistory,
        loading,
        billingStats,
        fetchBillingStats,
        historyPagination
    } = useSuperAdminStore();

    // Server-side pagination state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const { role } = useAuthStore();
    const navigate = useNavigate();

    // Log pagination state for debugging
    console.log('History Pagination State:', historyPagination);

    // Initial fetch for stats
    React.useEffect(() => {
        fetchBillingStats();
    }, [fetchBillingStats]);

    // Handle debouncing for search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch data when parameters change
    React.useEffect(() => {
        fetchSubscriptionHistory({
            page: currentPage,
            limit: limit,
            search: debouncedSearch,
            status: statusFilter
        });
    }, [fetchSubscriptionHistory, currentPage, limit, debouncedSearch, statusFilter]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= (historyPagination?.pages || 1)) {
            setCurrentPage(newPage);
        }
    };

    const handleLimitChange = (newLimit) => {
        setLimit(Number(newLimit));
        setCurrentPage(1);
    };

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
        if (!subscriptionHistory.length) {
            toast.error("No data available to export");
            return;
        }

        try {
            const exportRows = subscriptionHistory.map(item => ({
                'Company Name': item.companyName,
                'Subscription Plan': item.planName,
                'Deployment Start': item.startDate ? new Date(item.startDate).toLocaleDateString('en-IN') : 'N/A',
                'Expiry Date': item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-IN') : 'Permanent',
                'Status': item.status.toUpperCase(),
                'Days Remaining': item.daysRemaining,
                'Total Revenue (INR)': item.revenue
            }));

            const ws = XLSX.utils.json_to_sheet(exportRows);
            const wscols = [
                { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
            ];
            ws['!cols'] = wscols;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Subscription Audit");
            const timestamp = new Date().toISOString().split('T')[0];
            XLSX.writeFile(wb, `DinTask_Subscription_Audit_${timestamp}.xlsx`);
            toast.success("Audit report exported successfully");
        } catch (error) {
            console.error('Export Error:', error);
            toast.error("Failed to generate export file");
        }
    };

    const handleResetSearch = () => {
        setSearchQuery('');
        setStatusFilter('All');
        setCurrentPage(1);
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/30 border-2 border-slate-100 dark:border-slate-800 flex-1">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                            <History className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                                Subscription <span className="text-indigo-600">Audit</span>
                            </h1>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">
                                Complete Dynamic Intelligence Trail of Client Nodes
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <Button
                        onClick={handleExport}
                        disabled={role === 'superadmin_staff'}
                        variant="outline"
                        className="h-14 px-8 border-2 border-slate-100 bg-white dark:bg-slate-900 font-black text-[10px] uppercase tracking-[0.2em] rounded-[1.25rem] flex items-center gap-2 hover:bg-slate-50 hover:border-indigo-200 shadow-xl shadow-slate-200/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Download size={18} className="text-indigo-600" /> {role === 'superadmin_staff' ? 'EXPORT LOCKED' : 'GENERATE AUDIT'}
                    </Button>
                    <div className="relative group">
                        <Input
                            placeholder="SEARCH COMPANY INDEX..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 w-full md:w-80 h-14 border-2 border-slate-100 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/20 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] placeholder:text-slate-300 focus-visible:ring-4 focus-visible:ring-indigo-500/5 transition-all focus:border-indigo-500"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    </div>
                </div>
            </div>

            {/* Tactical Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Active', val: billingStats.activeSubscriptions || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', shadow: 'shadow-emerald-200/40' },
                    { label: 'Revenue (TOTAL)', val: role === 'superadmin' ? `₹${(billingStats.totalRevenue / 100000).toFixed(2)}L` : '₹ ••••••', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', shadow: 'shadow-indigo-200/40' },
                    { label: 'Expiring Nodes', val: (subscriptionHistory || []).filter(i => i.daysRemaining <= 7 && i.status === 'active').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', shadow: 'shadow-amber-200/40' },
                    { label: 'Churn Rate', val: `${billingStats.churnRate || 0}%`, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', shadow: 'shadow-rose-200/40' },
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
                        <Card className={cn(
                            "border-2 shadow-lg transition-all duration-300 rounded-[2rem] relative bg-white dark:bg-slate-900 overflow-hidden group hover:-translate-y-1",
                            stat.border,
                            stat.shadow
                        )}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`size-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner`}>
                                        <stat.icon size={24} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic">{stat.val}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main History Feed */}
            <Card className="border-2 border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b-2 border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-50/30">
                    <div className="space-y-1">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-2">
                            <Filter size={18} className="text-indigo-600" /> Subscription Deployment Feed
                        </h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-7">System Intelligence Log // Real-time Audit</p>
                    </div>
                    <div className="flex gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-xl shadow-slate-200/20 border-2 border-slate-100 dark:border-slate-800 w-fit">
                        {['All', 'Active', 'Expiring', 'Expired'].map(f => (
                            <button
                                key={f}
                                onClick={() => {
                                    setStatusFilter(f);
                                    setCurrentPage(1);
                                }}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95",
                                    statusFilter === f
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50'
                                )}
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
                    ) : subscriptionHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="size-24 rounded-full bg-slate-50 flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
                                <Search className="text-slate-300" size={40} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">No Records Found</h3>
                            <p className="text-xs font-medium text-slate-500 max-w-xs mx-auto mb-6">
                                We couldn't find any subscription logs matching your criteria. Try adjusting your filters.
                            </p>
                            <Button
                                onClick={handleResetSearch}
                                variant="outline"
                                className="h-10 px-6 font-black text-[10px] uppercase tracking-[0.2em] border-slate-200 text-slate-600 hover:bg-slate-50"
                            >
                                Clear Search
                            </Button>
                        </div>
                    ) : (
                        <>
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
                                            {subscriptionHistory.map((item) => (
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
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination UI */}
                            {historyPagination?.total > 0 && (
                                <div className="p-6 border-t border-slate-50 bg-slate-50/20 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span>Rows per page</span>
                                        <select
                                            value={limit}
                                            onChange={(e) => handleLimitChange(e.target.value)}
                                            className="bg-white border-none shadow-sm rounded-lg text-slate-700 py-1 pl-3 pr-8 focus:ring-2 focus:ring-indigo-500/20 font-bold cursor-pointer"
                                        >
                                            {[5, 10, 20, 50].map(size => (
                                                <option key={size} value={size}>{size}</option>
                                            ))}
                                        </select>
                                        <span>
                                            Showing {((currentPage - 1) * limit) + 1} - {Math.min(currentPage * limit, historyPagination.total)} of {historyPagination.total}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="h-8 w-8 p-0 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30"
                                        >
                                            <ChevronRight className="rotate-180" size={16} />
                                        </Button>

                                        {[...Array(historyPagination.pages || 1)].slice(Math.max(0, currentPage - 2), Math.min(historyPagination.pages, currentPage + 1)).map((_, i, arr) => {
                                            const pageNum = Math.max(0, currentPage - 2) + i + 1;
                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={currentPage === pageNum ? 'default' : 'ghost'}
                                                    size="sm"
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`h-8 w-8 p-0 rounded-lg font-black text-[10px] ${currentPage === pageNum
                                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                                        : 'bg-white text-slate-600 hover:bg-indigo-50 border border-slate-100'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === historyPagination.pages}
                                            className="h-8 w-8 p-0 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30"
                                        >
                                            <ChevronRight size={16} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SubscriptionHistory;
