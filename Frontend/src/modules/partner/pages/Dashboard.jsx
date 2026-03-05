import React, { useState, useEffect } from 'react';
import {
    Users,
    TrendingUp,
    Wallet,
    Clock,
    ArrowUpRight,
    ExternalLink,
    Crown,
    Copy,
    Share2,
    CheckCircle2,
    ShieldCheck,
    FileEdit,
    AlertCircle,
    Mail,
    Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import useAuthStore from '@/store/authStore';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/shared/components/ui/dialog";
import { toast } from 'sonner';
import apiRequest from '@/lib/api';

const PartnerDashboard = () => {
    const { user, fetchProfile } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalEarnings: 0,
        pendingCommission: 0,
        paidCommission: 0,
        convertedClients: 0,
        recentCommissions: [],
        referralCode: '',
        agreementStatus: 'pending'
    });
    const [loading, setLoading] = useState(true);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [clientEmail, setClientEmail] = useState('');
    const [sharing, setSharing] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await apiRequest('/partners/dashboard/stats');
            if (res.success) {
                setStats(res.data);
                // Also check if user object in store needs update (to sync status)
                if (res.data.agreementStatus !== user?.agreementStatus) {
                    fetchProfile();
                }
            }
        } catch (err) {
            toast.error('Failed to fetch dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    const handleShareLink = async () => {
        if (!clientEmail || !clientEmail.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }

        setSharing(true);
        try {
            const res = await apiRequest('/partners/share-link', {
                method: 'POST',
                body: { clientEmail }
            });
            if (res.success) {
                toast.success('Invitation sent successfully!');
                setIsEmailModalOpen(false);
                setClientEmail('');
            }
        } catch (err) {
            toast.error('Failed to send invitation');
        } finally {
            setSharing(false);
        }
    };

    const referralLink = `${window.location.protocol}//${window.location.host}/admin/register?ref=${stats?.referralCode || ''}`;
    const landingReferralLink = `${window.location.protocol}//${window.location.host}/?ref=${stats?.referralCode || ''}`;

    const statCards = [
        { label: 'Total Earnings', value: `₹${stats?.totalEarnings || 0}`, icon: Wallet, color: 'primary', trend: '+12%' },
        { label: 'Pending Payout', value: `₹${stats?.pendingCommission || 0}`, icon: Clock, color: 'amber', trend: 'Wait for Admin' },
        { label: 'Converted Clients', value: stats?.convertedClients || 0, icon: Users, color: 'emerald', trend: 'Lifetime' },
        { label: 'Paid Rewards', value: `₹${stats?.paidCommission || 0}`, icon: Crown, color: 'indigo', trend: 'Confirmed' },
    ];

    if (loading) return <div className="p-8">Loading dashboard...</div>;

    const isApprovedPartner = stats?.agreementStatus === 'approved' && user?.status === 'active';

    if (!isApprovedPartner) {
        return (
            <div className="flex-1 p-8 bg-slate-50 min-h-screen">
                <div className="max-w-4xl mx-auto space-y-12 pb-20">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-3">
                            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none">Partner Onboarding</h1>
                            <p className="text-slate-500 font-medium text-lg">Your dashboard will be fully unlocked once your agreement is approved.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <Card className="rounded-[2.5rem] border-none shadow-2xl p-8 bg-white space-y-6 flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${stats?.agreementStatus === 'pending' ? 'bg-primary-100 text-primary-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {stats?.agreementStatus === 'pending' ? <FileEdit size={32} /> : <CheckCircle2 size={32} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">1. Partnership Agreement</h3>
                                    <p className="text-slate-500 text-sm font-medium mt-1">
                                        {stats?.agreementStatus === 'pending'
                                            ? 'Review and sign our partnership agreement with your digital signature.'
                                            : 'Agreement has been signed and submitted for review.'}
                                    </p>
                                </div>
                            </div>
                            {stats?.agreementStatus === 'pending' && (
                                <Button onClick={() => navigate('/partner/agreement')} className="w-full h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/20">
                                    Continue to Sign Agreement
                                </Button>
                            )}
                            {stats?.agreementStatus !== 'pending' && (
                                <div className="h-14 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-100">
                                    <CheckCircle2 size={16} /> Completed
                                </div>
                            )}
                        </Card>

                        <Card className="rounded-[2.5rem] border-none shadow-2xl p-8 bg-white space-y-6 flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${stats?.agreementStatus === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                    <ShieldCheck size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">2. SuperAdmin Approval</h3>
                                    <p className="text-slate-500 text-sm font-medium mt-1">
                                        {stats?.agreementStatus === 'submitted'
                                            ? 'Our team is currently reviewing your signature and agreement.'
                                            : 'Activate your account by signing the agreement first.'}
                                    </p>
                                </div>
                            </div>
                            {stats?.agreementStatus === 'submitted' && (
                                <div className="h-14 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center gap-3 border border-amber-100">
                                    <Clock size={18} className="animate-pulse" />
                                    <span className="text-xs font-black uppercase tracking-widest">Waiting for Approval</span>
                                </div>
                            )}
                            {stats?.agreementStatus === 'pending' && (
                                <div className="h-14 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center gap-3 grayscale">
                                    <Clock size={18} />
                                    <span className="text-xs font-black uppercase tracking-widest">Not Started</span>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Restricted Features Overlay */}
                    <div className="relative pt-12">
                        <div className="absolute inset-0 bg-slate-50/70 backdrop-blur-sm z-10 rounded-[3rem] -mx-4 -mt-4 mb-4 flex flex-col items-center justify-center gap-6">
                            <div className="bg-white/90 shadow-2xl p-8 rounded-3xl flex flex-col items-center gap-4 border border-white max-w-sm text-center">
                                <TrendingUp className="text-slate-300 w-16 h-16" />
                                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-loose">Dashboard is Locked</h4>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Commissions, Referrals, and Payouts will appear here after approval.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 opacity-30 grayscale pointer-events-none blur-[1px]">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-32 bg-white rounded-3xl shadow-lg border border-slate-100"></div>
                            ))}
                        </div>
                        <div className="mt-8 h-80 bg-white rounded-[2.5rem] shadow-lg border border-slate-100 opacity-20 grayscale pointer-events-none"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="space-y-8 pb-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Partner Overview</h1>
                        <p className="text-slate-500 font-bold text-sm tracking-widest mt-1 opacity-60">Track your referrals and earnings in real-time</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((card, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={idx}
                            className="group relative bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 bg-${card.color}-500 transition-transform group-hover:scale-150`} />
                            <div className="relative z-10">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-5 bg-${card.color}-50 text-${card.color}-600 group-hover:bg-${card.color}-500 group-hover:text-white transition-all duration-300`}>
                                    <card.icon size={24} />
                                </div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{card.label}</p>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{card.value}</h3>
                                <div className="flex items-center gap-1.5 mt-4">
                                    <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{card.trend}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity Table */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="font-black text-slate-900 uppercase tracking-tight px-2">Commission History</h3>
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="text-left py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                                        <th className="text-left py-5 px-8 text-[10px) font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="text-left py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="text-right py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {stats?.recentCommissions?.length > 0 ? stats.recentCommissions.map((comm, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="py-5 px-8">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{comm?.adminId?.companyName || 'Valued Client'}</span>
                                                    <span className="text-[11px] text-slate-400 font-medium">Ref: {comm?._id?.slice?.(-6).toUpperCase() || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-8">
                                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${comm?.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                    {comm?.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="py-5 px-8">
                                                <span className="text-xs text-slate-500 font-medium">{comm?.createdAt ? new Date(comm.createdAt).toLocaleDateString() : 'N/A'}</span>
                                            </td>
                                            <td className="py-5 px-8 text-right">
                                                <span className="text-base font-black text-primary-600">₹{comm?.amount || 0}</span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="py-12 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">No commissions yet</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Referral Engine */}
                    <div className="space-y-4">
                        <h3 className="font-black text-slate-900 uppercase tracking-tight px-2">Referral Engine</h3>
                        <div className={`rounded-[2rem] p-8 relative overflow-hidden shadow-2xl transition-all duration-500 ${stats?.agreementStatus === 'approved' ? 'bg-primary-900 text-white shadow-primary-900/40' : 'bg-slate-100 text-slate-400 grayscale'}`}>
                            {stats?.agreementStatus === 'approved' ? (
                                <>
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Share2 size={120} />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                                            <TrendingUp size={24} className="text-primary-400" />
                                        </div>
                                        <h4 className="text-xl font-black tracking-tight leading-tight uppercase">Your link is active!</h4>
                                        <p className="text-primary-200/70 text-sm mt-3 font-medium">Share this link with your network and earn commissions on every successful signup.</p>

                                        <div className="mt-8 space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary-300">Direct Registration Link</Label>
                                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4 backdrop-blur-lg">
                                                    <span className="text-[10px] font-mono font-bold text-primary-100 truncate w-full">{referralLink}</span>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(referralLink);
                                                            toast.success('Registration link copied!');
                                                        }}
                                                        className="h-8 w-8 bg-primary-500 hover:bg-primary-400 rounded-lg flex items-center justify-center shrink-0 transition-colors shadow-lg"
                                                    >
                                                        <Copy size={16} className="text-white" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary-300">Landing Page Referral Link</Label>
                                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4 backdrop-blur-lg">
                                                    <span className="text-[10px] font-mono font-bold text-primary-100 truncate w-full">{landingReferralLink}</span>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(landingReferralLink);
                                                            toast.success('Landing page link copied!');
                                                        }}
                                                        className="h-8 w-8 bg-emerald-500 hover:bg-emerald-400 rounded-lg flex items-center justify-center shrink-0 transition-colors shadow-lg"
                                                    >
                                                        <Copy size={16} className="text-white" />
                                                    </button>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => setIsEmailModalOpen(true)}
                                                className="w-full h-12 bg-white text-primary-900 hover:bg-primary-50 rounded-xl font-black uppercase tracking-widest text-xs"
                                            >
                                                Share via Email <Mail size={14} className="ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="h-16 w-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <Lock size={32} className="text-slate-400" />
                                    </div>
                                    <h4 className="text-lg font-black uppercase tracking-tight">Engine Locked</h4>
                                    <p className="text-xs font-bold mt-2 leading-relaxed px-4 text-slate-500 uppercase tracking-widest">Accept the partnership agreement to unlock your referral engine.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
                <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">Invite Client</DialogTitle>
                        <p className="text-slate-500 text-sm font-medium mt-1">Send your referral link directly to your client's inbox.</p>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Client's Email Address</Label>
                            <Input
                                placeholder="client@example.com"
                                value={clientEmail}
                                onChange={(e) => setClientEmail(e.target.value)}
                                className="h-12 rounded-xl bg-slate-50 border-none font-bold text-xs"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleShareLink}
                            disabled={sharing}
                            className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary-500/20"
                        >
                            {sharing ? 'Sending...' : 'Send Invitation'} <Send size={16} className="ml-2" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PartnerDashboard;
