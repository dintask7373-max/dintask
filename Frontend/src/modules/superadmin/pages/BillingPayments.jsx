import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import useSuperAdminStore from '@/store/superAdminStore';
import useAuthStore from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

const BillingPayments = () => {
    const { role } = useAuthStore();
    const reactNavigate = useNavigate();

    const {
        billingStats,
        transactions,
        transactionPagination,
        fetchBillingStats,
        fetchTransactions,
        loading
    } = useSuperAdminStore();

    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    // Initial load and dependency-based fetch
    React.useEffect(() => {
        fetchBillingStats();
    }, [fetchBillingStats]);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            fetchTransactions({
                page: currentPage,
                limit: pageSize,
                search: searchQuery.trim(),
                status: activeTab
            });
        }, 400);

        return () => clearTimeout(handler);
    }, [fetchTransactions, currentPage, pageSize, searchQuery, activeTab]);

    // Reset to page 1 on search or filter change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeTab, pageSize]);

    const handleView = (txn) => {
        setSelectedTransaction(txn);
        setIsViewOpen(true);
    };

    const handleDownload = (txn) => {
        const receiptContent = `ORDER RECEIPT\n----------------\nOrder ID: ${txn.razorpayOrderId}\nDate: ${new Date(txn.createdAt).toLocaleDateString()}\nCompany: ${txn.adminId?.companyName || 'N/A'}\nPlan: ${txn.planId?.name || 'N/A'}\nAmount: ₹${txn.amount}\nStatus: ${txn.status}`;
        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt_${txn.razorpayOrderId || 'txn'}.txt`;
        a.click();
    };

    const handleFullExport = () => {
        if (!displayTransactions.length) {
            toast.error("No transaction data available to export");
            return;
        }

        try {
            const exportRows = displayTransactions.map(txn => ({
                'Company Name': txn.adminId?.companyName || 'N/A',
                'Order ID': txn.razorpayOrderId,
                'Payment ID': txn.razorpayPaymentId || 'N/A',
                'Date': new Date(txn.createdAt).toLocaleDateString('en-IN'),
                'Plan Purchased': txn.planId?.name || 'N/A',
                'Currency': txn.currency,
                'Amount (INR)': txn.amount,
                'Status': txn.status.toUpperCase()
            }));

            const ws = XLSX.utils.json_to_sheet(exportRows);
            const wscols = [
                { wch: 25 }, // Company
                { wch: 20 }, // Order ID
                { wch: 20 }, // Payment ID
                { wch: 15 }, // Date
                { wch: 15 }, // Plan
                { wch: 10 }, // Currency
                { wch: 15 }, // Amount
                { wch: 15 }  // Status
            ];
            ws['!cols'] = wscols;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Transactions");

            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `DinTask_Transaction_Audit_${timestamp}.xlsx`;

            XLSX.writeFile(wb, filename);
            toast.success("Transaction audit report exported successfully");
        } catch (error) {
            console.error('Export Error:', error);
            toast.error("Failed to generate export file");
        }
    };

    const displayTransactions = transactions || [];

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
                    <Button
                        onClick={handleFullExport}
                        disabled={role === 'superadmin_staff'}
                        variant="outline"
                        className="h-11 px-6 rounded-xl border-slate-200 bg-white font-black text-[10px] uppercase tracking-[0.2em] gap-2 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Download size={16} /> {role === 'superadmin_staff' ? 'EXPORT LOCKED' : 'EXPORT'}
                    </Button>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Revenue', value: role === 'superadmin' ? `₹${(billingStats.totalRevenue || 0).toLocaleString()}` : '₹ ••••••', icon: DollarSign, color: 'text-primary-600', bg: 'bg-primary-50', trend: role === 'superadmin' ? '+12.5%' : 'LOCKED', isUp: true },
                    { label: 'Active Subscriptions', value: billingStats.activeSubscriptions || 0, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+3.2%', isUp: true },
                    { label: 'Churn Rate', value: `${billingStats.churnRate || 0}%`, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50', trend: '+0.5%', isUp: false }
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all rounded-[2rem] relative">
                        {role === 'superadmin_staff' && stat.label === 'Total Revenue' && (
                            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                <ShieldCheck className="text-primary-200 opacity-20" size={80} />
                            </div>
                        )}
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
                            {transactionPagination?.total || 0} TOTAL
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
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <RefreshCw className="text-primary-600 animate-spin" size={32} />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Transactions...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : displayTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-32 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="p-4 bg-slate-50 rounded-full">
                                                    <History size={48} className="text-slate-300" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-black text-slate-900 uppercase tracking-widest">
                                                        {searchQuery ? `No matches for "${searchQuery}"` : "No transactions found"}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose max-w-[250px] mx-auto">
                                                        {searchQuery
                                                            ? "Try adjusting your search terms or filters to find the specific transaction."
                                                            : "Your transaction history is currently empty."}
                                                    </p>
                                                </div>
                                                {searchQuery && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSearchQuery('')}
                                                        className="mt-2 rounded-xl border-slate-200 font-black text-[10px] uppercase tracking-widest h-9 px-6"
                                                    >
                                                        Clear Search
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    displayTransactions.map((payment) => (
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
                                                    <span className="text-sm font-black text-slate-900 tracking-tighter">
                                                        {role === 'superadmin' ? `₹${(payment.amount).toLocaleString()}` : '₹ ••••••'}
                                                    </span>
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
                                                    <Button
                                                        onClick={() => handleDownload(payment)}
                                                        variant="ghost" size="sm" className="size-8 p-0 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-primary-600 border border-transparent hover:border-slate-100">
                                                        <Download size={14} />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleView(payment)}
                                                        variant="ghost" size="sm" className="size-8 p-0 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-primary-600 border border-transparent hover:border-slate-100">
                                                        <FileText size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination UI */}
                {transactionPagination?.total > 0 && (
                    <div className="p-6 border-t border-slate-50 bg-slate-50/20 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, transactionPagination.total)} of {transactionPagination.total} entries
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Page Size</span>
                                <Select value={pageSize.toString()} onValueChange={(val) => setPageSize(parseInt(val))}>
                                    <SelectTrigger className="w-[70px] h-8 rounded-lg bg-white border-slate-200 font-bold text-[10px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-xl">
                                        {[5, 10, 20, 50].map(size => (
                                            <SelectItem key={size} value={size.toString()} className="text-[10px] font-bold rounded-lg">{size}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="h-8 px-4 rounded-lg font-black text-[10px] border-slate-200"
                            >
                                PREV
                            </Button>

                            {/* Simple pagination logic to avoid huge arrays if pages > 10 */}
                            {[...Array(transactionPagination.pages)].map((_, i) => (
                                <Button
                                    key={i + 1}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`h-8 w-8 p-0 rounded-lg font-black text-[10px] border-slate-200 ${currentPage === i + 1 ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600'}`}
                                >
                                    {i + 1}
                                </Button>
                            ))}

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === transactionPagination.pages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="h-8 px-4 rounded-lg font-black text-[10px] border-slate-200"
                            >
                                NEXT
                            </Button>
                        </div>
                    </div>
                )}
            </div>


            {/* Transaction Details Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-md bg-white border-slate-100 rounded-[2rem] p-8 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black italic tracking-tight uppercase">Transaction <span className="text-primary-600">Details</span></DialogTitle>
                    </DialogHeader>
                    {selectedTransaction && (
                        <div className="mt-6 space-y-6">
                            <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50 space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Company</p>
                                        <p className="text-xs font-bold text-slate-900">{selectedTransaction.adminId?.companyName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Date</p>
                                        <p className="text-xs font-bold text-slate-900">{new Date(selectedTransaction.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Order ID</p>
                                        <p className="text-xs font-mono font-bold text-slate-900 bg-white px-3 py-2 rounded-lg border border-slate-100">{selectedTransaction.razorpayOrderId}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Plan</p>
                                        <Badge className="bg-primary-50 text-primary-600 hover:bg-primary-100 border-none text-[9px] font-black uppercase tracking-widest">
                                            {selectedTransaction.planId?.name || 'N/A'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Amount</p>
                                        <p className="text-sm font-black text-slate-900">
                                            {role === 'superadmin' ? `₹${(selectedTransaction.amount).toLocaleString()}` : '₹ ••••••'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <Button onClick={() => setIsViewOpen(false)} className="w-full bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest h-11 rounded-xl">
                                Close Details
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default BillingPayments;
