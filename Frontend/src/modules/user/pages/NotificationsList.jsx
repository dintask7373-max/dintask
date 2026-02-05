import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCheck,
    Trash2,
    Bell,
    MessageSquare,
    AlertCircle,
    Clock,
    Search,
    Filter,
    MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import useNotificationStore from '@/store/notificationStore';
import useAuthStore from '@/store/authStore';
import { cn } from '@/shared/utils/cn';

const NotificationsList = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();
    const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore();
    const [filterType, setFilterType] = useState('all'); // all, unread, task, message
    const [searchQuery, setSearchQuery] = useState('');

    // Filter notifications for the current user
    const userNotifications = useMemo(() => {
        return notifications.filter(n => {
            // General notifications (no recipientId) or notifications specifically for this user
            const forMe = !n.recipientId || n.recipientId === currentUser?.id;

            // Search filter
            const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.description.toLowerCase().includes(searchQuery.toLowerCase());

            // Type filter
            const matchesFilter = filterType === 'all' ||
                (filterType === 'unread' && !n.isRead) ||
                (filterType === n.category);

            return forMe && matchesSearch && matchesFilter;
        });
    }, [notifications, currentUser, searchQuery, filterType]);

    const unreadCount = useMemo(() =>
        notifications.filter(n => (!n.recipientId || n.recipientId === currentUser?.id) && !n.isRead).length
        , [notifications, currentUser]);

    const handleMarkAll = () => {
        markAllAsRead();
        toast.success('All notifications marked as read');
    };

    const getIcon = (category) => {
        switch (category) {
            case 'task': return <Bell className="text-blue-500" size={18} />;
            case 'message': return <MessageSquare className="text-emerald-500" size={18} />;
            case 'deadline': return <AlertCircle className="text-amber-500" size={18} />;
            default: return <Bell className="text-slate-500" size={18} />;
        }
    };

    const NotificationItem = ({ notification }) => (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
                "p-5 flex items-start gap-4 transition-all relative group border-b border-slate-50 dark:border-slate-800 last:border-0",
                !notification.isRead ? "bg-primary/5 dark:bg-primary/10 border-l-4 border-l-primary" : "border-l-4 border-l-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
            )}
        >
            <div className={cn(
                "p-3 rounded-2xl shrink-0 transition-transform group-hover:scale-105 shadow-sm",
                !notification.isRead ? "bg-white dark:bg-slate-800" : "bg-slate-50 dark:bg-slate-900"
            )}>
                {getIcon(notification.category)}
            </div>

            <div className="flex-1 space-y-1.5 pr-10">
                <div className="flex items-center justify-between">
                    <h4 className={cn(
                        "text-sm font-bold tracking-tight",
                        !notification.isRead ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                    )}>
                        {notification.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{notification.time}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {notification.description}
                </p>
            </div>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2">
                {!notification.isRead && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => markAsRead(notification.id)}
                        className="h-8 w-8 hover:bg-white dark:hover:bg-slate-800 text-primary rounded-xl shadow-sm"
                    >
                        <CheckCheck size={16} />
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteNotification(notification.id)}
                    className="h-8 w-8 hover:bg-white dark:hover:bg-slate-800 text-red-500 rounded-xl shadow-sm"
                >
                    <Trash2 size={16} />
                </Button>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] pb-20">
            {/* Elegant Desktop Header */}
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full ring-4 ring-primary/10">
                                        {unreadCount} New
                                    </span>
                                )}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex relative w-64 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search notifications..."
                                className="pl-10 h-10 bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                onClick={handleMarkAll}
                                className="bg-primary hover:bg-primary-600 text-[10px] font-black uppercase tracking-widest px-6 h-10 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                            >
                                Mark all as read
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="rounded-2xl opacity-50">
                            <MoreHorizontal size={20} />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 pt-8 grid md:grid-cols-[240px_1fr] gap-8">
                {/* Desktop Filters Sidebar */}
                <aside className="hidden md:block space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.25em] mb-4 ml-2">Quick Filters</h3>
                        {[
                            { id: 'all', label: 'All Notifications', icon: Bell },
                            { id: 'unread', label: 'Unread Only', icon: AlertCircle },
                            { id: 'task', label: 'Tasks & Updates', icon: Bell },
                            { id: 'message', label: 'Direct Messages', icon: MessageSquare },
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setFilterType(btn.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                                    filterType === btn.id
                                        ? "bg-white dark:bg-slate-900 text-primary shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800"
                                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                <btn.icon size={18} />
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    <Card className="bg-primary/5 border-none rounded-[2rem] overflow-hidden">
                        <CardContent className="p-6">
                            <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-2">Notification Tips</h4>
                            <p className="text-[10px] text-primary/70 font-medium leading-relaxed">
                                Keep your inbox clean by marking notifications as read or deleting old ones.
                            </p>
                        </CardContent>
                    </Card>
                </aside>

                {/* Main Notifications Feed */}
                <main>
                    <div className="md:hidden mb-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {['all', 'unread', 'task', 'message'].map(type => (
                            <Button
                                key={type}
                                variant={filterType === type ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterType(type)}
                                className="rounded-full capitalize px-5 text-[10px] font-black tracking-widest border-slate-200 dark:border-slate-800"
                            >
                                {type}
                            </Button>
                        ))}
                    </div>

                    <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden ring-1 ring-slate-200/60 dark:ring-slate-800">
                        <CardContent className="p-0">
                            <AnimatePresence mode="popLayout">
                                {userNotifications.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-32 flex flex-col items-center justify-center text-center px-10"
                                    >
                                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-200 dark:text-slate-700 mb-6">
                                            <Bell size={48} />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Perfectly Clean!</h3>
                                        <p className="text-sm text-slate-400 font-medium">
                                            No {filterType !== 'all' ? filterType : ''} notifications found for your profile.
                                            Check back later for updates.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                        <AnimatePresence mode="popLayout">
                                            {userNotifications.map((notification) => (
                                                <NotificationItem key={notification.id} notification={notification} />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
};

export default NotificationsList;
