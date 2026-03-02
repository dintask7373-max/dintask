import React from 'react';
import {
    Globe,
    Copy,
    Share2,
    QrCode,
    Info,
    ExternalLink,
    Zap,
    CheckCircle2,
    ArrowUpRight,
    Target,
    Trophy
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import useAuthStore from '@/store/authStore';

const ReferralLink = () => {
    const { user } = useAuthStore();
    const referralCode = user?.referralCode || 'PENDING';
    const referralLink = `${window.location.origin}/admin/register?ref=${referralCode}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        toast.success('Referral link copied to clipboard!');
    };

    const shareOptions = [
        { name: 'WhatsApp', color: 'bg-[#25D366]', hover: 'hover:bg-[#128C7E]' },
        { name: 'LinkedIn', color: 'bg-[#0077B5]', hover: 'hover:bg-[#004182]' },
        { name: 'Email', color: 'bg-slate-800', hover: 'hover:bg-slate-900' }
    ];

    return (
        <div className="max-w-4xl space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Referral Engine</h1>
                <p className="text-slate-500 font-bold text-sm tracking-widest mt-1 opacity-60">Your gateway to scaling your partnership earnings</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* Main Link Card */}
                <div className="md:col-span-3 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-8 overflow-hidden relative">
                        <div className="relative z-10">
                            <div className="h-14 w-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-6 border border-primary-100/50">
                                <Globe size={28} />
                            </div>

                            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Your Unique Referral Link</h2>
                            <p className="text-slate-500 mt-2 text-sm font-medium">Share this link with potential clients. Our system will automatically track signups and payments linked to you.</p>

                            <div className="mt-8 space-y-4">
                                <div className="flex items-center gap-3 p-2 pl-5 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:border-primary-200 hover:shadow-lg hover:shadow-primary-900/5">
                                    <span className="text-xs font-mono font-bold text-slate-600 overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                                        {referralLink}
                                    </span>
                                    <Button
                                        onClick={copyToClipboard}
                                        className="h-10 px-5 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary-900/10"
                                    >
                                        Copy Link <Copy size={14} className="ml-2" />
                                    </Button>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {shareOptions.map((opt, i) => (
                                        <button key={i} className={`h-10 px-6 rounded-xl text-white font-bold text-[10px] uppercase tracking-widest transition-all ${opt.color} ${opt.hover} shadow-lg shadow-black/5 flex items-center gap-2`}>
                                            <Share2 size={14} /> {opt.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Background Accent */}
                        <div className="absolute -bottom-12 -right-12 h-64 w-64 bg-primary-50 rounded-full blur-3xl opacity-50 -z-0" />
                    </div>

                    {/* Quick Tips */}
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                        <div className="relative z-10 flex gap-6">
                            <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                                <Zap size={24} className="text-amber-400" />
                            </div>
                            <div>
                                <h4 className="font-black text-lg tracking-tight uppercase">Performance Tip</h4>
                                <p className="text-slate-400 text-sm mt-1 font-medium leading-relaxed">
                                    Partners who share their link on <b>LinkedIn</b> and <b>Industry Forums</b> see a <span className="text-white">5x higher conversion rate</span>. Try writing a short post about how DinTask solved your management problems.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar / QR Code */}
                <div className="md:col-span-2 space-y-6">
                    {/* QR Code Card */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 text-center flex flex-col items-center">
                        <h3 className="font-black text-slate-900 uppercase tracking-tight mb-6">Quick QR Scan</h3>
                        <div className="h-48 w-48 bg-slate-50 rounded-[2rem] border-4 border-slate-50 flex items-center justify-center relative group p-6">
                            <QrCode size={120} className="text-slate-900 opacity-80 group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-primary-600/5 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[1.8rem]">
                                <Button variant="white" size="sm" className="font-black rounded-lg">Download</Button>
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-6 bg-slate-50 px-3 py-1 rounded-full">Referral Code: {referralCode}</p>
                    </div>

                    {/* Stats Widget */}
                    <div className="bg-gradient-to-br from-indigo-600 to-primary-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-900/20">
                        <div className="flex justify-between items-start mb-6">
                            <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                <Target size={20} />
                            </div>
                            <Trophy size={20} className="text-amber-400" />
                        </div>
                        <h4 className="font-black text-lg uppercase tracking-tight">Your Progress</h4>
                        <div className="mt-4 space-y-4">
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-80">
                                    <span>Monthly Goal</span>
                                    <span>₹50,000</span>
                                </div>
                                <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white rounded-full w-[45%] shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                                </div>
                            </div>
                            <p className="text-[11px] font-medium leading-relaxed opacity-70">You're just ₹12,400 away from your Silver Badge bonus!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferralLink;
