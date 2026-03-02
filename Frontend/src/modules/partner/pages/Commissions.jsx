import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Search,
    Filter,
    Download,
    Calendar,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    User,
    Building2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import apiRequest from '@/lib/api';
import { toast } from 'sonner';

const Commissions = () => {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCommissions();
    }, []);

    const fetchCommissions = async () => {
        try {
            const res = await apiRequest('/partners/dashboard/stats');
            if (res.success) {
                // Using recentCommissions as a placeholder for full history
                setCommissions(res.data.recentCommissions || []);
            }
        } catch (err) {
            toast.error('Failed to load commissions');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Earnings Ledger</h1>
                    <p className="text-slate-500 font-bold text-sm tracking-widest mt-1 opacity-60">Verified commissions from your referred clients</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input className="h-11 pl-10 w-64 rounded-xl border-slate-100 bg-white" placeholder="Search by client name..." />
                    </div>
                    <Button variant="outline" className="h-11 w-11 p-0 rounded-xl border-slate-100">
                        <Filter size={18} />
                    </Button>
                    <Button variant="outline" className="h-11 px-5 rounded-xl border-slate-100 font-bold">
                        <Download size={18} className="mr-2" /> Export
                    </Button>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Details</th>
                                <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan & Type</th>
                                <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="text-right py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Commission</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {commissions.length > 0 ? commissions.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="py-6 px-8">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs">
                                                {item.adminId?.companyName?.slice(0, 2).toUpperCase() || 'UC'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{item.adminId?.companyName || 'Unknown Corp'}</span>
                                                <span className="text-[11px] text-slate-400 font-medium">Ref: #ID{item._id.slice(-6).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-slate-700">Business Pro</span>
                                            <Badge variant="secondary" className="w-fit text-[9px] h-4 font-black uppercase tracking-tighter bg-slate-100 text-slate-500 border-none">
                                                {item.type}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8">
                                        <div className={item.status === 'paid' ? "flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase" : "flex items-center gap-1.5 text-amber-500 font-black text-[10px] uppercase"}>
                                            {item.status === 'paid' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                            {item.status}
                                        </div>
                                    </td>
                                    <td className="py-6 px-8">
                                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                                            <Calendar size={14} className="opacity-40" />
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="py-6 px-8 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-lg font-black text-primary-600 tracking-tight">₹{item.amount}</span>
                                            <span className="text-[10px] font-black text-slate-300 uppercase leading-none">Net Recv.</span>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center opacity-20">
                                            <TrendingUp size={60} />
                                            <p className="mt-4 font-black uppercase tracking-widest text-sm text-slate-400">No earnings recorded yet</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing 1 to {commissions.length} of {commissions.length} results</p>
                    <div className="flex gap-2">
                        <Button disabled variant="outline" className="h-9 px-3 rounded-lg border-slate-200">
                            <ChevronLeft size={16} />
                        </Button>
                        <Button disabled variant="outline" className="h-9 px-3 rounded-lg border-slate-200">
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Commissions;
