import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus,
    Check,
    X,
    Clock,
    User,
    Mail,
    Shield,
    Search,
    Filter,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    SearchX
} from 'lucide-react';
import { toast } from 'sonner';
import useEmployeeStore from '@/store/employeeStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { format } from 'date-fns';
import { cn } from '@/shared/utils/cn';
import { useAutoAnimate } from '@formkit/auto-animate/react';

const JoinRequests = () => {
    const {
        pendingRequests,
        pendingPagination,
        approveRequest,
        rejectRequest,
        fetchPendingRequests,
        loading
    } = useEmployeeStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [parent] = useAutoAnimate();

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPendingRequests({ page, limit, search: searchTerm });
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [fetchPendingRequests, page, limit, searchTerm]);

    const handleApprove = async (id, name, role) => {
        const success = await approveRequest(id, role);
        if (success) {
            toast.success(`${name} has been approved and added to your team!`);
            // Refresh to ensure counts/pagination are correct
            fetchPendingRequests({ page, limit, search: searchTerm });
        }
    };

    const handleReject = async (id, name, role) => {
        const success = await rejectRequest(id, role);
        if (success) {
            toast.error(`${name}'s request has been rejected.`);
            fetchPendingRequests({ page, limit, search: searchTerm });
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">Access Control</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
                        Intercepting new intelligence signals from prospective units
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className="bg-primary-50 text-primary-600 border-primary-100 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm">
                        {pendingPagination.total} Total Pending
                    </Badge>
                </div>
            </div>

            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/50">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Scan by identity or secure-link..."
                            className="pl-12 h-12 border-none rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-[11px] font-bold"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1); // Reset to first page on search
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Select
                            value={limit.toString()}
                            onValueChange={(val) => {
                                setLimit(parseInt(val));
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[140px] h-12 rounded-2xl border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest">
                                <SelectValue placeholder="Limit" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 p-1">
                                <SelectItem value="5" className="rounded-xl text-[10px] font-black uppercase p-3">Show 5</SelectItem>
                                <SelectItem value="10" className="rounded-xl text-[10px] font-black uppercase p-3">Show 10</SelectItem>
                                <SelectItem value="25" className="rounded-xl text-[10px] font-black uppercase p-3">Show 25</SelectItem>
                                <SelectItem value="50" className="rounded-xl text-[10px] font-black uppercase p-3">Show 50</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            onClick={() => {
                                fetchPendingRequests({ page, limit, search: searchTerm });
                                toast.info('Re-scanning for signals...');
                            }}
                            className="rounded-2xl h-12 px-6 gap-2 border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest"
                            disabled={loading}
                        >
                            <Clock className={cn("size-4", loading && "animate-spin")} />
                            <span>Refresh</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 min-h-[400px]" ref={parent}>
                <AnimatePresence mode="popLayout">
                    {pendingRequests.length > 0 ? (
                        pendingRequests.map((req, index) => (
                            <motion.div
                                key={req._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="border-slate-100 dark:border-slate-800/50 hover:border-primary-200 dark:hover:border-primary-900/50 transition-all duration-300 rounded-[2.5rem] overflow-hidden group bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:shadow-primary-500/5">
                                    <CardContent className="p-6 sm:p-8">
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-6 sm:gap-10">
                                            <div className="flex-1 flex items-center gap-6">
                                                <div className="relative shrink-0">
                                                    <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-center text-primary-600 dark:text-primary-400 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                                        <User size={32} strokeWidth={2.5} />
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 size-6 rounded-xl bg-blue-500 border-4 border-white dark:border-slate-900 flex items-center justify-center">
                                                        <div className="size-1.5 rounded-full bg-white animate-pulse" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5 min-w-0">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none truncate tracking-tight">
                                                            {req.name}
                                                        </h3>
                                                        <Badge className="rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-primary-600 text-white border-none shadow-sm">
                                                            {req.role}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-slate-400">
                                                        <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
                                                            <Mail size={14} className="text-slate-300" /> {req.email || 'No-Encryption'}
                                                        </span>
                                                        <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
                                                            <Clock size={14} className="text-slate-300" /> {req.createdAt ? format(new Date(req.createdAt), 'MMM dd • HH:mm') : 'Syncing...'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <Button
                                                    onClick={() => handleReject(req._id, req.name, req.role)}
                                                    variant="ghost"
                                                    className="rounded-2xl h-14 px-6 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-black text-[10px] uppercase tracking-widest transition-all"
                                                >
                                                    <X size={18} className="mr-2" />
                                                    Deny Access
                                                </Button>
                                                <Button
                                                    onClick={() => handleApprove(req._id, req.name, req.role)}
                                                    className="rounded-[1.25rem] h-14 px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white shadow-xl shadow-slate-200 dark:shadow-none transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em]"
                                                >
                                                    <Check size={18} className="mr-3" />
                                                    Authorize
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        !loading && (
                            <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-inner">
                                <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-200 dark:text-slate-700 mx-auto mb-8">
                                    <SearchX size={52} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic">Zero Signals</h3>
                                <p className="text-slate-400 mt-3 max-w-sm mx-auto font-bold text-xs uppercase tracking-widest">
                                    No pending units identified for authorization in this sector.
                                </p>
                            </div>
                        )
                    )}
                </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {pendingPagination && pendingPagination.total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 pb-10 border-t border-slate-100 dark:border-slate-800/50">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Displaying <span className="text-slate-900 dark:text-white italic">{pendingRequests.length}</span> of <span className="text-slate-900 dark:text-white italic">{pendingPagination.total}</span> intercepted units
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={page === 1 || loading}
                            onClick={() => setPage(page - 1)}
                            className="rounded-xl size-12 border-slate-200 dark:border-slate-800 hover:bg-primary-50 hover:text-primary-600 active:scale-95 transition-all shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </Button>

                        <div className="flex items-center gap-2 px-4">
                            {[...Array(pendingPagination.pages)].map((_, i) => {
                                const p = i + 1;
                                // Basic logic to show limited pages if many exist
                                if (pendingPagination.pages > 5) {
                                    if (p !== 1 && p !== pendingPagination.pages && Math.abs(p - page) > 1) {
                                        if (p === 2 || p === pendingPagination.pages - 1) return <span key={p} className="text-slate-300">...</span>;
                                        return null;
                                    }
                                }

                                return (
                                    <Button
                                        key={p}
                                        variant={page === p ? "default" : "outline"}
                                        onClick={() => setPage(p)}
                                        className={cn(
                                            "rounded-xl size-10 text-[10px] font-black shadow-sm transition-all",
                                            page === p ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 scale-110 shadow-lg shadow-slate-200 dark:shadow-none" : "border-slate-100 dark:border-slate-800 text-slate-400 hover:border-primary-200"
                                        )}
                                        disabled={loading}
                                    >
                                        {p}
                                    </Button>
                                );
                            })}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            disabled={page === pendingPagination.pages || loading}
                            onClick={() => setPage(page + 1)}
                            className="rounded-xl size-12 border-slate-200 dark:border-slate-800 hover:bg-primary-50 hover:text-primary-600 active:scale-95 transition-all shadow-sm"
                        >
                            <ChevronRight size={20} />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JoinRequests;
