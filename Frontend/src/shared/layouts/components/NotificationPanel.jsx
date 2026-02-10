import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
    Bell,
    X,
    Check,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Info,
    History,
    CircleDashed,
    Trash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useNotificationStore from '@/store/notificationStore';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';

const NotificationPanel = ({ isOpen, onClose }) => {
    const {
        notifications,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        bulkDeleteNotifications,
        unreadCount
    } = useNotificationStore();

    const [selectedIds, setSelectedIds] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    const handleMarkAsRead = async (id) => {
        await markAsRead(id);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        await deleteNotification(id);
        toast.success("Notification removed");
    };

    const toggleSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        await bulkDeleteNotifications(selectedIds);
        setSelectedIds([]);
        setIsSelectionMode(false);
        toast.success(`${selectedIds.length} notifications deleted`);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle2 size={16} className="text-emerald-500" />;
            case 'error': return <AlertCircle size={16} className="text-red-500" />;
            case 'warning': return <AlertCircle size={16} className="text-amber-500" />;
            default: return <Info size={16} className="text-primary-500" />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-slate-900/10 backdrop-blur-[2px] lg:hidden"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-3 w-[calc(100vw-2rem)] sm:w-[400px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/20 overflow-hidden z-50"
                    >
                        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                                    Notifications
                                    {unreadCount > 0 && (
                                        <Badge className="bg-primary-600 text-[10px] h-4 px-1.5 border-none font-bold">
                                            {unreadCount} NEW
                                        </Badge>
                                    )}
                                </h3>
                                <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-0.5">Your system activity alerts</p>
                            </div>
                            <div className="flex items-center gap-1">
                                {notifications.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-8 w-8 rounded-xl transition-all",
                                            isSelectionMode ? "bg-primary-50 text-primary-600" : "text-slate-400 hover:text-primary-600"
                                        )}
                                        onClick={() => {
                                            setIsSelectionMode(!isSelectionMode);
                                            setSelectedIds([]);
                                        }}
                                        title="Selection Mode"
                                    >
                                        <History size={16} />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-xl text-slate-400 hover:text-red-500"
                                    onClick={onClose}
                                >
                                    <X size={18} />
                                </Button>
                            </div>
                        </div>

                        {isSelectionMode && selectedIds.length > 0 && (
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                className="bg-slate-900 dark:bg-slate-100 px-4 py-2 flex items-center justify-between"
                            >
                                <span className="text-[10px] font-black text-white dark:text-slate-900 uppercase tracking-widest">
                                    {selectedIds.length} Selected
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        className="h-6 px-3 text-[9px] font-black uppercase tracking-widest text-white/60 dark:text-slate-500 hover:text-white dark:hover:text-slate-900"
                                        onClick={() => setSelectedIds([])}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="h-6 px-3 bg-red-500 hover:bg-red-600 text-white border-none rounded-lg font-black text-[9px] uppercase tracking-widest"
                                        onClick={handleBulkDelete}
                                    >
                                        Archive Selection
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        <div className="h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="h-[400px] flex flex-col items-center justify-center text-center p-8">
                                    <div className="size-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                        <Bell size={24} className="text-slate-200 dark:text-slate-700" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Quiet Zone</p>
                                    <p className="text-[9px] font-black text-slate-300 mt-1 uppercase">No active notifications at this time</p>
                                </div>
                            ) : (
                                <div className="p-2 space-y-1">
                                    {notifications.map((notification) => (
                                        <motion.div
                                            key={notification._id}
                                            layout
                                            onClick={() => isSelectionMode ? toggleSelection(notification._id) : handleMarkAsRead(notification._id)}
                                            className={cn(
                                                "group relative p-3 sm:p-4 rounded-2xl transition-all cursor-pointer border border-transparent",
                                                !notification.isRead ? "bg-slate-50 dark:bg-slate-800/40" : "hover:bg-slate-50 dark:hover:bg-slate-800/20",
                                                selectedIds.includes(notification._id) && "bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-800 shadow-sm"
                                            )}
                                        >
                                            <div className="flex gap-3 sm:gap-4">
                                                <div className="relative shrink-0">
                                                    <div className={cn(
                                                        "size-9 rounded-xl flex items-center justify-center",
                                                        !notification.isRead ? "bg-white dark:bg-slate-800 shadow-sm" : "bg-slate-100 dark:bg-slate-800/50"
                                                    )}>
                                                        {getIcon(notification.type)}
                                                    </div>
                                                    {!notification.isRead && (
                                                        <span className="absolute -top-1 -right-1 size-2.5 bg-primary-500 border-2 border-white dark:border-slate-800 rounded-full animate-pulse" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0 pr-6">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest truncate">
                                                            {notification.category || 'System'}
                                                        </span>
                                                        <span className="text-[8px] font-bold text-slate-400 tabular-nums">
                                                            {format(new Date(notification.createdAt), 'HH:mm')}
                                                        </span>
                                                    </div>
                                                    <h4 className={cn(
                                                        "text-[11px] leading-tight mb-1 truncate",
                                                        !notification.isRead ? "font-black text-slate-900 dark:text-white" : "font-semibold text-slate-500 dark:text-slate-400"
                                                    )}>
                                                        {notification.title}
                                                    </h4>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium italic">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Buttons (Visible on hover) */}
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!isSelectionMode && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                                                        onClick={(e) => handleDelete(e, notification._id)}
                                                    >
                                                        <Trash size={14} />
                                                    </Button>
                                                )}
                                                {isSelectionMode && (
                                                    <div className={cn(
                                                        "size-5 rounded-md border-2 flex items-center justify-center transition-all",
                                                        selectedIds.includes(notification._id)
                                                            ? "bg-primary-600 border-primary-600 text-white"
                                                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                                    )}>
                                                        {selectedIds.includes(notification._id) && <Check size={12} strokeWidth={4} />}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="p-3 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 mt-auto">
                                <Button
                                    variant="ghost"
                                    className="w-full h-8 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-xl"
                                    onClick={markAllAsRead}
                                >
                                    Mark All As Read
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationPanel;
