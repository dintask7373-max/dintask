import React from 'react';
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

const Notifications = () => {
    const mockNotifications = [
        {
            title: 'Commission Received!',
            message: 'You earned ₹2,400 from a new payment by "Alpha Corp".',
            time: '2 hours ago',
            type: 'success',
            icon: TrendingUp
        },
        {
            title: 'Partner Account Approved',
            message: 'Welcome to the DinTask Partner Network! You can now start referring clients.',
            time: '1 day ago',
            type: 'info',
            icon: CheckCircle2
        },
        {
            title: 'Payout Initiated',
            message: 'Your monthly payout of ₹15,200 has been processed.',
            time: '3 days ago',
            type: 'payout',
            icon: Wallet
        }
    ];

    return (
        <div className="max-w-4xl space-y-8 pb-10">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Notifications</h1>
                    <p className="text-slate-500 font-bold text-sm tracking-widest mt-1 opacity-60">Stay updated on your referrals and payouts</p>
                </div>
                <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-primary-600 hover:bg-primary-50">
                    Mark all as read
                </Button>
            </div>

            <div className="space-y-4">
                {mockNotifications.map((notif, idx) => (
                    <div key={idx} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 p-6 flex items-start gap-6 group hover:border-primary-200 transition-all duration-300">
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all group-hover:scale-110 ${notif.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                notif.type === 'payout' ? 'bg-primary-50 border-primary-100 text-primary-600' :
                                    'bg-blue-50 border-blue-100 text-blue-600'
                            }`}>
                            <notif.icon size={24} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">{notif.title}</h3>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                                    <Clock size={12} className="mr-1" /> {notif.time}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                                {notif.message}
                            </p>
                            <div className="mt-4 flex gap-3">
                                <Button size="sm" className="h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest">View Details</Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-slate-300 hover:text-slate-600">
                                    <MoreHorizontal size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

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
