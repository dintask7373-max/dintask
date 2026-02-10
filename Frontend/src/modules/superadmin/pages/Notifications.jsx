import React, { useEffect, useState, useMemo } from 'react';
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

const Notifications = () => {
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
            const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                n.message.toLowerCase().includes(searchTerm.toLowerCase());
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
        toast.success(`${selectedIds.length} notifications archived`);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle2 size={18} className="text-emerald-500" />;
            case 'error': return <AlertCircle size={18} className="text-red-500" />;
            case 'warning': return <AlertCircle size={18} className="text-amber-500" />;
            default: return <Info size={18} className="text-primary-500" />;
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
                        ALERTS <span className="text-primary-600">&</span> NOTIFICATIONS
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
                        System telemetry and operational intelligence
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllAsRead}
                        className="rounded-xl border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest h-10 px-4"
                    >
                        Sync All
                    </Button>
                    {selectedIds.length > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            className="rounded-xl text-[10px] font-black uppercase tracking-widest h-10 px-4 shadow-lg shadow-red-500/20"
                        >
                            Archive ({selectedIds.length})
                        </Button>
                    )}
                </div>
            </motion.div>

            {/* Filters & Actions */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <Card className="lg:col-span-12 border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/50">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <Input
                                placeholder="Filter alerts by content..."
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
                                        {filterType === 'all' ? 'All Alerts' : filterType === 'unread' ? 'Unread Only' : 'Read History'}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2">
                                    <DropdownMenuItem onClick={() => setFilterType('all')} className="rounded-xl text-[10px] font-black uppercase tracking-widest p-3">All Alerts</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterType('unread')} className="rounded-xl text-[10px] font-black uppercase tracking-widest p-3">Unread Only</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterType('read')} className="rounded-xl text-[10px] font-black uppercase tracking-widest p-3">Read History</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Content Area */}
            <div className="space-y-4">
                <div className="flex items-center gap-4 px-6">
                    <Checkbox
                        checked={selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="rounded-md border-slate-200 size-5"
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {selectedIds.length > 0 ? `${selectedIds.length} Selected` : 'Select All Alerts'}
                    </span>
                </div>

                <AnimatePresence mode="popLayout">
                    {filteredNotifications.length === 0 ? (
                        <motion.div
                            variants={fadeInUp}
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center"
                        >
                            <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                <Inbox size={32} className="text-slate-200" />
                            </div>
                            <h3 className="text-base font-black uppercase tracking-widest text-slate-900 dark:text-white">Operational Silence</h3>
                            <p className="text-xs font-bold text-slate-400 mt-2 max-w-[280px]">No intelligence parameters match your current filter criteria.</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-3">
                            {filteredNotifications.map((n) => (
                                <motion.div
                                    key={n._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className={cn(
                                        "group relative bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-[2rem] border transition-all flex items-start gap-4 sm:gap-6",
                                        !n.isRead ? "border-primary-100 dark:border-primary-900/30 shadow-md shadow-primary-500/5 bg-primary-50/10" : "border-slate-100 dark:border-slate-800/50 hover:border-primary-200",
                                        selectedIds.includes(n._id) && "bg-primary-50 border-primary-500"
                                    )}
                                >
                                    <Checkbox
                                        checked={selectedIds.includes(n._id)}
                                        onCheckedChange={(checked) => handleSelectOne(n._id, checked)}
                                        className="mt-1 rounded-md border-slate-200 size-5 shrink-0"
                                    />

                                    <div className="relative shrink-0 hidden sm:block">
                                        <div className={cn(
                                            "size-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105",
                                            !n.isRead ? "bg-white dark:bg-slate-800 shadow-sm" : "bg-slate-50 dark:bg-slate-800/40"
                                        )}>
                                            {getIcon(n.type)}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0" onClick={() => !n.isRead && markAsRead(n._id)}>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                            <div className="flex items-center gap-3">
                                                <Badge className={cn(
                                                    "h-5 px-2 text-[9px] font-black uppercase tracking-widest border-none",
                                                    !n.isRead ? "bg-primary-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                )}>
                                                    {n.category || 'SYSTEM'}
                                                </Badge>
                                                {!n.isRead && (
                                                    <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
                                                )}
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 tabular-nums uppercase">
                                                {format(new Date(n.createdAt), 'dd MMM yyyy • HH:mm')}
                                            </span>
                                        </div>
                                        <h4 className={cn(
                                            "text-sm mb-1 truncate",
                                            !n.isRead ? "font-black text-slate-900 dark:text-white" : "font-semibold text-slate-600 dark:text-slate-400"
                                        )}>
                                            {n.title}
                                        </h4>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed italic font-medium">
                                            {n.message}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-10 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(n._id);
                                            }}
                                        >
                                            <Trash size={18} />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Notifications;
