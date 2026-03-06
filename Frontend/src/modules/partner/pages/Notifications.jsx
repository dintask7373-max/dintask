import React, { useEffect } from 'react';
import {
    Bell,
    Clock,
    TrendingUp,
    Wallet,
    Info,
    CheckCircle2,
    AlertCircle,
    MoreHorizontal
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import useNotificationStore from '@/store/notificationStore';

const Notifications = () => {
    const { notifications, fetchNotifications, markAsRead, markAllAsRead, loading } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const getIcon = (type) => {
        switch (type) {
            case 'payment':
            case 'commission':
                return TrendingUp;
            case 'payout':
                return Wallet;
            case 'general':
                return Info;
            case 'success':
                return CheckCircle2;
            case 'alert':
                return AlertCircle;
            default:
                return Bell;
        }
    };

    return (
        <div className="max-w-4xl space-y-8 pb-10">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Notifications</h1>
                    <p className="text-slate-500 font-bold text-sm tracking-widest mt-1 opacity-60">Stay updated on your referrals and payouts</p>
                </div>
                <Button onClick={markAllAsRead} variant="ghost" className="text-xs font-black uppercase tracking-widest text-primary-600 hover:bg-primary-50">
                    Mark all as read
                </Button>

            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest text-xs">
                        Loading notifications...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest text-xs">
                        No notifications found
                    </div>
                ) : (
                    notifications.map((notif) => {
                        const Icon = getIcon(notif.type);
                        const time = new Date(notif.createdAt).toLocaleString();

                        return (
                            <div key={notif._id} className={cn(
                                "bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 p-6 flex items-start gap-6 group hover:border-primary-200 transition-all duration-300",
                                !notif.isRead && "border-l-4 border-l-primary-500"
                            )}>
                                <div className={cn(
                                    "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all group-hover:scale-110",
                                    notif.type === 'payment' || notif.type === 'commission' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                        notif.type === 'payout' ? 'bg-primary-50 border-primary-100 text-primary-600' :
                                            'bg-blue-50 border-blue-100 text-blue-600'
                                )}>
                                    <Icon size={24} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">{notif.title}</h3>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                                            <Clock size={12} className="mr-1" /> {time}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                                        {notif.message}
                                    </p>
                                    <div className="mt-4 flex gap-3">
                                        {!notif.isRead && (
                                            <Button
                                                onClick={() => markAsRead(notif._id)}
                                                size="sm"
                                                className="h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest"
                                            >
                                                Mark as read
                                            </Button>
                                        )}
                                        {notif.link && (
                                            <Button
                                                onClick={() => window.location.href = notif.link}
                                                variant="outline"
                                                size="sm"
                                                className="h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest"
                                            >
                                                View Details
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                <div className="py-10 text-center">
                    <Button variant="outline" className="rounded-xl font-black uppercase tracking-widest text-xs border-slate-200 h-11 px-8">
                        Load More
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
