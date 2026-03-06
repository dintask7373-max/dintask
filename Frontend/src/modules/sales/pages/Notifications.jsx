import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Info,
    Search,
    Filter,
    Check,
    Archive,
    Inbox,
    Trash,
    MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useNotificationStore from '@/store/notificationStore';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { cn } from '@/shared/utils/cn';
import { fadeInUp, staggerContainer } from '@/shared/utils/animations';
import { toast } from 'sonner';

const SalesNotifications = () => {
    const navigate = useNavigate();
    const {
        notifications,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        bulkDeleteNotifications,
        unreadCount,
        loading
    } = useNotificationStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const filteredNotifications = useMemo(() => {
        return notifications.filter(n => {
            const title = n.title || '';
            const message = n.message || '';
            const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                message.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterType === 'all' ||
                (filterType === 'unread' && !n.isRead) ||
                (filterType === 'read' && n.isRead);
            return matchesSearch && matchesFilter;
        });
    }, [notifications, searchTerm, filterType]);

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(filteredNotifications.map(n => n._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id, checked) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        await bulkDeleteNotifications(selectedIds);
        setSelectedIds([]);
        toast.success(`${selectedIds.length} notifications deleted`);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle2 size={18} className="text-emerald-500" />;
            case 'error': return <AlertCircle size={18} className="text-red-500" />;
            case 'warning': return <AlertCircle size={18} className="text-amber-500" />;
            default: return <Info size={18} className="text-blue-500" />;
        }
    };

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="p-4 sm:p-8 space-y-8"
        >
            {/* Header */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        ALERTS & FEED
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
                        Real-time intelligence for your sales operations
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllAsRead}
                        className="rounded-xl border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest h-10 px-4"
                    >
                        Clear All Unread
                    </Button>
                    {selectedIds.length > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            className="rounded-xl text-[10px] font-black uppercase tracking-widest h-10 px-4 shadow-lg shadow-red-500/20"
                        >
                            Purge ({selectedIds.length})
                        </Button>
                    )}
                </div>
            </motion.div>

            {/* Filters Area */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <Card className="lg:col-span-12 border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/50">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <Input
                                placeholder="Scan notifications..."
                                className="pl-12 h-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-xs font-bold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="rounded-2xl border-slate-200 dark:border-slate-800 h-12 px-6 text-[10px] font-black uppercase tracking-widest gap-2">
                                        <Filter size={16} />
                                        {filterType === 'all' ? 'All Data' : filterType === 'unread' ? 'Active' : 'Archived'}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-2xl border-slate-100 dark:border-slate-800">
                                    <DropdownMenuItem onClick={() => setFilterType('all')} className="rounded-xl text-[10px] font-black uppercase tracking-widest p-3">Complete History</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterType('unread')} className="rounded-xl text-[10px] font-black uppercase tracking-widest p-3">Active Only</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterType('read')} className="rounded-xl text-[10px] font-black uppercase tracking-widest p-3">Archived Only</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* List Header */}
            <div className="flex items-center gap-4 px-6 mb-4">
                <Checkbox
                    checked={selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0}
                    onCheckedChange={handleSelectAll}
                    className="rounded-md border-slate-200 size-5"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {selectedIds.length > 0 ? `${selectedIds.length} Selected` : 'Select Total'}
                </span>
            </div>

            {/* Notifications Container */}
            <AnimatePresence mode="popLayout">
                {filteredNotifications.length === 0 ? (
                    <motion.div
                        variants={fadeInUp}
                        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center"
                    >
                        <div className="size-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8">
                            <Inbox size={40} className="text-slate-200" />
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white">Telemetry Clear</h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 max-w-[280px] uppercase tracking-tighter">No new intelligence signals detected in the current sector.</p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {filteredNotifications.map((n) => (
                            <motion.div
                                key={n._id}
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={() => {
                                    if (!n.isRead) markAsRead(n._id);
                                    if (n.link) navigate(n.link);
                                }}
                                className={cn(
                                    "group relative bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-[2rem] border transition-all flex items-start gap-4 sm:gap-8 cursor-pointer",
                                    !n.isRead ? "border-blue-100 dark:border-blue-900/30 shadow-lg shadow-blue-500/5 bg-gradient-to-r from-blue-50/20 to-transparent" : "border-slate-100 dark:border-slate-800/50 hover:border-blue-200",
                                    selectedIds.includes(n._id) && "bg-blue-50 border-blue-500"
                                )}
                            >
                                <Checkbox
                                    checked={selectedIds.includes(n._id)}
                                    onCheckedChange={(checked) => handleSelectOne(n._id, checked)}
                                    className="mt-1.5 rounded-md border-slate-200 size-5 shrink-0"
                                />

                                <div className="shrink-0 hidden sm:block relative">
                                    <div className={cn(
                                        "size-14 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-12 duration-500 shadow-inner",
                                        !n.isRead ? "bg-white dark:bg-slate-800 shadow-md" : "bg-slate-50 dark:bg-slate-800/40"
                                    )}>
                                        {getIcon(n.type)}
                                    </div>
                                    {!n.isRead && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white dark:border-slate-950"></span>
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                                        <div className="flex items-center gap-3">
                                            <Badge className={cn(
                                                "h-5 px-2 text-[9px] font-black uppercase tracking-[0.2em] border-none shadow-sm",
                                                !n.isRead ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                            )}>
                                                {n.type || 'SIGNAL'}
                                            </Badge>
                                            {!n.isRead && <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest animate-pulse">New Signal</span>}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 tabular-nums uppercase tracking-widest">
                                            {format(new Date(n.createdAt), 'dd MMM • HH:mm')}
                                        </span>
                                    </div>
                                    <h4 className={cn(
                                        "text-base mb-1 truncate tracking-tight transition-colors group-hover:text-blue-600",
                                        !n.isRead ? "font-black text-slate-900 dark:text-white" : "font-bold text-slate-600 dark:text-slate-400"
                                    )}>
                                        {n.title}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed italic font-medium opacity-80">
                                        {n.message}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-11 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 active:scale-90"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(n._id);
                                        }}
                                    >
                                        <Trash2 size={20} />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SalesNotifications;
