import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    Search,
    Filter,
    MoreVertical,
    CheckCircle2,
    Clock,
    XOctagon,
    Eye,
    ArrowUpRight,
    TrendingUp,
    Wallet,
    Building2,
    User,
    Settings2,
    Banknote,
    FileText,
    Landmark
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import PartnerAnalyticsModal from '../components/PartnerAnalyticsModal';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/shared/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/shared/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import apiRequest from '@/lib/api';
import { cn } from '@/shared/utils/cn';

const PartnerManagement = () => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
    const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
    const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
    const [partnerDocs, setPartnerDocs] = useState([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [isReferralsModalOpen, setIsReferralsModalOpen] = useState(false);
    const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [partnerReferrals, setPartnerReferrals] = useState([]);
    const [referralsLoading, setReferralsLoading] = useState(false);
    const [isCommissionsModalOpen, setIsCommissionsModalOpen] = useState(false);
    const [partnerCommissions, setPartnerCommissions] = useState([]);
    const [commissionsLoading, setCommissionsLoading] = useState(false);
    const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
    const [approving, setApproving] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const [commissionData, setCommissionData] = useState({
        commissionType: 'Percentage',
        commissionValue: 10
    });

    const [payoutData, setPayoutData] = useState({
        amount: 0,
        transactionRef: ''
    });

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const res = await apiRequest('/partners');
            if (res.success) {
                setPartners(res.data);
            }
        } catch (err) {
            toast.error('Failed to fetch partners');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            const res = await apiRequest(`/partners/${id}/status`, {
                method: 'PUT',
                body: { status }
            });
            if (res.success) {
                toast.success(`Partner ${status.toLowerCase()} successfully`);
                fetchPartners();
            }
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleCommissionUpdate = async () => {
        try {
            const res = await apiRequest(`/partners/${selectedPartner._id}/commission`, {
                method: 'PUT',
                body: commissionData
            });
            if (res.success) {
                toast.success('Commission settings updated');
                setIsCommissionModalOpen(false);
                fetchPartners();
            }
        } catch (err) {
            toast.error('Failed to update commission');
        }
    };

    const handleApproveAgreement = async () => {
        setApproving(true);
        try {
            const res = await apiRequest(`/partners/${selectedPartner._id}/status`, {
                method: 'PUT',
                body: { agreementStatus: 'approved' }
            });
            if (res.success) {
                toast.success('Agreement approved and partner activated!');
                setIsAgreementModalOpen(false);
                fetchPartners();
            }
        } catch (err) {
            toast.error('Failed to approve agreement');
        } finally {
            setApproving(false);
        }
    };

    const handleReleasePayout = async () => {
        if (!payoutData.amount || !selectedPartner || !payoutData.transactionRef) {
            toast.error('Please enter amount and transaction reference');
            return;
        }

        try {
            const res = await apiRequest('/partners/payouts', {
                method: 'POST',
                body: {
                    partnerId: selectedPartner._id,
                    amount: Number(payoutData.amount),
                    transactionRef: payoutData.transactionRef,
                    commissionIds: []
                }
            });
            if (res.success) {
                toast.success('Payout recorded successfully');
                setIsPayoutModalOpen(false);
                fetchPartners();
            }
        } catch (err) {
            toast.error('Failed to process payout');
        }
    };

    const fetchPartnerDocs = async (partner) => {
        setSelectedPartner(partner);
        setIsDocsModalOpen(true);
        setDocsLoading(true);
        try {
            const res = await apiRequest(`/partners/documents/${partner._id}`);
            if (res.success) {
                setPartnerDocs(res.data);
            }
        } catch (err) {
            toast.error('Failed to fetch documents');
        } finally {
            setDocsLoading(false);
        }
    };
    const fetchPartnerTransactions = async (partner) => {
        setSelectedPartner(partner);
        setIsCommissionsModalOpen(true);
        setCommissionsLoading(true);
        try {
            const url = `/partners/history/${partner._id}`;
            console.log('[DEBUG] Calling API:', url);
            const res = await apiRequest(url);
            if (res.success) {
                setPartnerCommissions(res.data);
            }
        } catch (err) {
            toast.error('Failed to fetch transactions');
        } finally {
            setCommissionsLoading(false);
        }
    };

    const fetchPartnerReferrals = async (partner) => {
        setSelectedPartner(partner);
        setIsReferralsModalOpen(true);
        setReferralsLoading(true);
        try {
            const res = await apiRequest(`/partners/referrals/${partner._id}`);
            if (res.success) {
                setPartnerReferrals(res.data);
            }
        } catch (err) {
            toast.error('Failed to fetch referrals');
        } finally {
            setReferralsLoading(false);
        }
    };

    const filteredPartners = partners.filter(p =>
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                        Partner Management <ShieldCheck className="text-primary-600" size={24} />
                    </h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        Approve referrals, set commissions & manage payouts
                    </p>
                </div>
            </div>

            <Card className="border-2 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-none overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 italic">Partner Directory</h2>
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-3 py-1 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                            {filteredPartners.length} Partners
                        </Badge>
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input
                            placeholder="Search by name, email or company..."
                            className="pl-11 h-11 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-[12px] font-bold focus-visible:ring-primary-500/10 transition-all placeholder:text-slate-300 shadow-none text-slate-900 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-50 dark:border-slate-800">
                                <TableHead className="pl-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Partner Details</TableHead>
                                <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-400">Type</TableHead>
                                <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                                <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-400">Earnings</TableHead>
                                <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-400">Commission</TableHead>
                                <TableHead className="text-right pr-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPartners.length > 0 ? filteredPartners.map((partner) => (
                                <TableRow key={partner._id} className="border-slate-50 dark:border-slate-800 group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <TableCell className="pl-8">
                                        <div className="space-y-1 py-2">
                                            <p className="font-extrabold text-slate-900 dark:text-white leading-tight text-[15px] tracking-tight hover:text-primary-600 transition-colors cursor-pointer" onClick={() => { setSelectedPartner(partner); setIsProfileModalOpen(true); }}>
                                                {partner.partnerType === 'Individual' ? partner.fullName : partner.companyName}
                                            </p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
                                                {partner.email} • {partner.referralCode || 'NO CODE'}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-none bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-lg">
                                            {partner.partnerType}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn(
                                            "text-[10px] h-7 font-black uppercase tracking-widest gap-1.5 border px-3 rounded-full shadow-sm",
                                            partner.status === 'active' ? "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-500 border-emerald-100 dark:border-emerald-900/10" :
                                                partner.status === 'pending' ? "bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-500 border-amber-100 dark:border-amber-900/10" :
                                                    "bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-500 border-red-100 dark:border-red-900/10"
                                        )}>
                                            {partner.status === 'active' ? <CheckCircle2 size={13} /> : partner.status === 'pending' ? <Clock size={13} /> : <XOctagon size={13} />}
                                            {partner.status}
                                        </Badge>
                                        {partner.agreementStatus === 'submitted' && (
                                            <div className="flex items-center gap-1.5 mt-1.5 pl-1">
                                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                <span className="text-[9px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-tighter">Needs Review</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-base font-black text-slate-900 dark:text-white tracking-tight text-primary-600">₹{partner.totalEarnings}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending: ₹{partner.pendingCommission}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col leading-tight">
                                            <span className="text-[12px] font-extrabold text-slate-800 dark:text-slate-200 uppercase">{partner.commissionType}</span>
                                            <span className="text-[11px] font-bold text-slate-400">{partner.commissionValue}{partner.commissionType === 'Percentage' ? '%' : ' Fixed'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
                                                    <MoreVertical size={18} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" side="bottom" sideOffset={8} avoidCollisions={false} className="w-56 font-sans rounded-2xl p-2 shadow-2xl border-none bg-white dark:bg-slate-900">
                                                <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 px-2 py-1.5">Quick Actions</DropdownMenuLabel>
                                                <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl font-bold text-xs py-2.5 text-primary-600 focus:text-primary-700 focus:bg-primary-50 dark:focus:bg-primary-900/10" onClick={() => { setSelectedPartner(partner); setIsProfileModalOpen(true); }}>
                                                    <Eye size={16} /> View Full Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-1 opacity-50 dark:bg-slate-800" />
                                                {partner.status !== 'active' && (
                                                    <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl font-bold text-xs py-2.5 text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 dark:focus:bg-emerald-900/10" onClick={() => handleStatusChange(partner._id, 'active')}>
                                                        <CheckCircle2 size={16} /> Approve Partner
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl font-bold text-xs py-2.5 text-amber-600 focus:text-amber-700 focus:bg-amber-50 dark:focus:bg-amber-900/10" onClick={() => {
                                                    setSelectedPartner(partner);
                                                    setCommissionData({
                                                        commissionType: partner.commissionType,
                                                        commissionValue: partner.commissionValue
                                                    });
                                                    setIsCommissionModalOpen(true);
                                                }}>
                                                    <Settings2 size={16} /> Set Commission
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl font-bold text-xs py-2.5 text-primary-600 focus:text-primary-700 focus:bg-primary-50 dark:focus:bg-primary-900/10" onClick={() => {
                                                    setSelectedPartner(partner);
                                                    setPayoutData({ amount: partner.pendingCommission, transactionRef: '' });
                                                    setIsPayoutModalOpen(true);
                                                }}>
                                                    <Banknote size={16} /> Release Payout
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-1 opacity-50 dark:bg-slate-800" />
                                                <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl font-bold text-xs py-2.5 text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/10" onClick={() => handleStatusChange(partner._id, 'rejected')}>
                                                    <XOctagon size={16} /> Reject / Disable
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-1 opacity-50 dark:bg-slate-800" />
                                                <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl font-bold text-xs py-2.5 text-blue-600 focus:text-blue-700 focus:bg-blue-50 dark:focus:bg-blue-900/10" onClick={() => { setSelectedPartner(partner); setIsAgreementModalOpen(true); }}>
                                                    <FileText size={16} /> View Agreement & Signature
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl font-bold text-xs py-2.5 text-slate-600 dark:text-slate-400 focus:text-slate-700 dark:focus:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800" onClick={() => fetchPartnerDocs(partner)}>
                                                    <FileText size={16} /> View Documents
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl font-bold text-xs py-2.5 text-slate-800 dark:text-slate-200 focus:text-slate-900 dark:focus:text-white focus:bg-slate-50 dark:focus:bg-slate-800" onClick={() => fetchPartnerTransactions(partner)}>
                                                    <TrendingUp size={16} /> View Transactions
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl font-bold text-xs py-2.5 text-blue-600 focus:text-blue-700 focus:bg-blue-50 dark:focus:bg-blue-900/10" onClick={() => { setSelectedPartner(partner); setIsAnalyticsModalOpen(true); }}>
                                                    <TrendingUp size={16} /> View Analytics & Reports
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl font-bold text-xs py-2.5 text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 dark:focus:bg-emerald-900/10" onClick={() => { setSelectedPartner(partner); setIsBankModalOpen(true); }}>
                                                    <Landmark size={16} /> View Bank Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl font-bold text-xs py-2.5 text-slate-800 dark:text-slate-200 focus:text-slate-900 dark:focus:text-white focus:bg-slate-50 dark:focus:bg-slate-800" onClick={() => fetchPartnerReferrals(partner)}>
                                                    <User size={16} /> View Referrals
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center text-slate-400 font-bold uppercase tracking-widest italic text-xs">
                                        No partners found matching criteria
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Partner Profile Modal (Comprehensive View) */}
            <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
                <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 max-w-4xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <div className="flex flex-col h-[90vh]">
                        {/* Header Section */}
                        <div className="bg-white dark:bg-slate-900 p-8 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <Badge className={cn(
                                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border mb-2",
                                        selectedPartner?.status === 'active' ? "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-500 border-emerald-100 dark:border-emerald-900/10" : "bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-500 border-amber-100 dark:border-amber-900/10"
                                    )}>
                                        {selectedPartner?.status} Profile
                                    </Badge>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none italic uppercase">
                                        {selectedPartner?.partnerType === 'Individual' ? selectedPartner?.fullName : selectedPartner?.companyName}
                                    </h2>
                                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 mt-2">
                                        <Building2 size={16} className="text-primary-600" /> {selectedPartner?.partnerType} Partner <span className="text-slate-200 dark:text-slate-800">•</span> {selectedPartner?.email}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Impact</p>
                                    <h3 className="text-4xl font-black text-primary-600 italic tracking-tighter">₹{selectedPartner?.totalEarnings || 0}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Content Section - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                            <div className="grid md:grid-cols-3 gap-6">
                                {/* Payout Stats */}
                                <Card className="border-none shadow-sm rounded-3xl bg-emerald-600 text-white p-6">
                                    <Wallet className="mb-4 opacity-50" size={24} />
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Pending Payout</p>
                                    <h4 className="text-2xl font-black italic tracking-tight">₹{selectedPartner?.pendingCommission || 0}</h4>
                                </Card>
                                <Card className="border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900 p-6">
                                    <Banknote className="mb-4 text-primary-600" size={24} />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Commission Rate</p>
                                    <h4 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">{selectedPartner?.commissionValue}{selectedPartner?.commissionType === 'Percentage' ? '%' : ' Fixed'}</h4>
                                </Card>
                                <Card className="border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900 p-6">
                                    <TrendingUp className="mb-4 text-blue-600" size={24} />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Referral Code</p>
                                    <h4 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">{selectedPartner?.referralCode || 'N/A'}</h4>
                                </Card>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Bank Details */}
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <Landmark size={14} /> Bank Settlements
                                    </h4>
                                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-[9px] font-bold text-slate-400 uppercase">Account Holder</Label>
                                                <p className="text-sm font-black text-slate-900 dark:text-white">{selectedPartner?.bankDetails?.accountHolderName || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-[9px] font-bold text-slate-400 uppercase">Bank Name</Label>
                                                <p className="text-sm font-black text-slate-900 dark:text-white">{selectedPartner?.bankDetails?.bankName || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-[9px] font-bold text-slate-400 uppercase">Account number</Label>
                                                <p className="text-sm font-black text-slate-900 dark:text-white tracking-wider">{selectedPartner?.bankDetails?.accountNumber || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-[9px] font-bold text-slate-400 uppercase">IFSC Code</Label>
                                                <p className="text-sm font-black text-primary-600 uppercase italic">{selectedPartner?.bankDetails?.ifscCode || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Kyc / Individual Details */}
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <ShieldCheck size={14} /> KYC & Identity
                                    </h4>
                                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-[9px] font-bold text-slate-400 uppercase">PAN Number</Label>
                                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{selectedPartner?.panNumber || selectedPartner?.companyPan || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-[9px] font-bold text-slate-400 uppercase">Contact Phone</Label>
                                                <p className="text-sm font-black text-slate-900 dark:text-white">{selectedPartner?.phone || 'N/A'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <Label className="text-[9px] font-bold text-slate-400 uppercase">Address / Registered location</Label>
                                                <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{selectedPartner?.address || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Signal / Agreement Section */}
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                    <FileText size={14} /> Partnership Agreement
                                </h4>
                                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                                    <div className="flex-1 space-y-4 text-center md:text-left">
                                        <Badge className="bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-500 border-none font-black text-[9px] uppercase tracking-widest mb-2">
                                            {selectedPartner?.agreementStatus || 'pending'} agreement
                                        </Badge>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic">
                                            "Agreement terms include {selectedPartner?.commissionValue}{selectedPartner?.commissionType === 'Percentage' ? '%' : ' Fixed'} commission on all successful referrals. Payouts are released upon reaches threshold."
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase">Signed on: {selectedPartner?.agreementAcceptedAt ? new Date(selectedPartner.agreementAcceptedAt).toLocaleString() : 'N/A'}</p>
                                    </div>
                                    <div className="w-full md:w-64">
                                        <Label className="text-[9px] font-bold text-slate-400 uppercase block mb-3 text-center">Digital Signature</Label>
                                        {selectedPartner?.signatureImage ? (
                                            <div className="h-32 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center justify-center">
                                                <img src={selectedPartner.signatureImage} alt="Signature" className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal brightness-0 dark:brightness-200 contrast-200" />
                                            </div>
                                        ) : (
                                            <div className="h-32 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 text-slate-300 dark:text-slate-700">
                                                <FileText size={24} />
                                                <p className="text-[9px] font-black uppercase">No signature</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Section */}
                        <div className="bg-white dark:bg-slate-900 p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 flex gap-4">
                            <Button onClick={() => setIsProfileModalOpen(false)} variant="outline" className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[11px]">
                                Close Profile
                            </Button>
                            {selectedPartner?.status === 'pending' && (
                                <Button onClick={() => handleStatusChange(selectedPartner._id, 'active')} className="flex-[2] h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-emerald-500/20">
                                    Approve & Activate Partner
                                </Button>
                            )}
                            {selectedPartner?.status === 'active' && (
                                <Button onClick={() => { setIsProfileModalOpen(false); setIsPayoutModalOpen(true); }} className="flex-[2] h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary-500/20">
                                    Manage Commissions
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Commission Modal */}
            <Dialog open={isCommissionModalOpen} onOpenChange={setIsCommissionModalOpen}>
                <DialogContent className="rounded-[2rem] border-none shadow-2xl p-8 max-w-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight italic">Set <span className="text-primary-600">Commission</span></DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 pt-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Commission Model</Label>
                            <Select value={commissionData.commissionType} onValueChange={(v) => setCommissionData({ ...commissionData, commissionType: v })}>
                                <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs text-slate-900 dark:text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-xl bg-white dark:bg-slate-900 font-sans">
                                    <SelectItem value="Percentage" className="font-bold text-xs">Percentage (%)</SelectItem>
                                    <SelectItem value="Fixed" className="font-bold text-xs">Fixed Amount (₹)</SelectItem>
                                    <SelectItem value="Recurring" className="font-bold text-xs">Recurring (₹/Month)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Value</Label>
                            <Input
                                type="number"
                                value={commissionData.commissionValue}
                                onChange={(e) => setCommissionData({ ...commissionData, commissionValue: Number(e.target.value) })}
                                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs text-slate-900 dark:text-white"
                            />
                        </div>
                        <Button onClick={handleCommissionUpdate} className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary-500/20">
                            Update Settings
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Payout Modal */}
            <Dialog open={isPayoutModalOpen} onOpenChange={setIsPayoutModalOpen}>
                <DialogContent className="rounded-[2rem] border-none shadow-2xl p-8 max-w-sm bg-white dark:bg-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight italic">Release <span className="text-emerald-600">Payout</span></DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 pt-4">
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 text-center">
                            <p className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest opacity-60">Payable Amount</p>
                            <h3 className="text-3xl font-black text-emerald-900 dark:text-white tracking-tighter mt-1">₹{selectedPartner?.pendingCommission || 0}</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount to Pay</Label>
                                <button
                                    onClick={() => setPayoutData({ ...payoutData, amount: selectedPartner?.pendingCommission || 0 })}
                                    className="text-[9px] font-black uppercase text-primary-600 hover:text-primary-700 transition-colors"
                                >
                                    Use Full Balance
                                </button>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={payoutData.amount}
                                    onChange={(e) => setPayoutData({ ...payoutData, amount: e.target.value })}
                                    className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs uppercase pl-8 text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction ID / Reference</Label>
                            <Input
                                placeholder="TXN12345678"
                                value={payoutData.transactionRef}
                                onChange={(e) => setPayoutData({ ...payoutData, transactionRef: e.target.value })}
                                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs uppercase text-slate-900 dark:text-white"
                            />
                        </div>
                        <Button onClick={handleReleasePayout} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                            Confirm Payout
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Documents Modal */}
            <Dialog open={isDocsModalOpen} onOpenChange={setIsDocsModalOpen}>
                <DialogContent className="rounded-[2rem] border-none shadow-2xl p-8 max-w-lg bg-white dark:bg-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight italic">Partner <span className="text-primary-600">Documents</span></DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        {docsLoading ? (
                            <div className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading documents...</div>
                        ) : partnerDocs.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                                {partnerDocs.map((doc, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-primary-200 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-primary-600 shadow-sm">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{doc.documentType}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(doc.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-primary-600 font-bold h-9 px-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all"
                                            onClick={() => window.open(doc.fileUrl, '_blank')}
                                        >
                                            View File
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <FileText size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No documents uploaded yet</p>
                            </div>
                        )}
                        <Button onClick={() => setIsDocsModalOpen(false)} variant="outline" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest mt-4 border-slate-200 dark:border-slate-800">
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Referrals Modal */}
            <Dialog open={isReferralsModalOpen} onOpenChange={setIsReferralsModalOpen}>
                <DialogContent className="rounded-[2rem] border-none shadow-2xl p-8 max-w-2xl overflow-hidden flex flex-col max-h-[85vh] bg-white dark:bg-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-2">
                            Referrals for <span className="text-primary-600 truncate">{selectedPartner?.partnerType === 'Individual' ? selectedPartner?.fullName : selectedPartner?.companyName}</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-4">
                        {referralsLoading ? (
                            <div className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading referrals...</div>
                        ) : partnerReferrals.length > 0 ? (
                            <div className="border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/50">
                                <Table>
                                    <TableHeader className="bg-white dark:bg-slate-900">
                                        <TableRow className="hover:bg-transparent border-slate-50 dark:border-slate-800">
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-6">Client / Company</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registered On</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {partnerReferrals.map((client) => (
                                            <TableRow key={client._id} className="hover:bg-white dark:hover:bg-slate-800 transition-colors border-slate-50 dark:border-slate-800">
                                                <TableCell className="pl-6 py-4">
                                                    <div className="space-y-0.5">
                                                        <p className="font-black text-slate-900 dark:text-white text-[13px] tracking-tight">{client.companyName || 'N/A'}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold">{client.name} • {client.email}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm",
                                                        client.status === 'active' ? "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-500 border-emerald-100 dark:border-emerald-900/10" : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
                                                    )}>
                                                        {client.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-[10px] font-bold text-slate-500 uppercase">
                                                    {new Date(client.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-20 text-center space-y-4">
                                <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-200 dark:text-slate-700 shadow-inner">
                                    <User size={40} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-900 dark:text-white font-black uppercase tracking-tight">No Referrals Found</p>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">This partner hasn't referred any clients yet.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                        <Button onClick={() => setIsReferralsModalOpen(false)} className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-xl">
                            Close referrals
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Commissions Modal */}
            <Dialog open={isCommissionsModalOpen} onOpenChange={setIsCommissionsModalOpen}>
                <DialogContent className="rounded-[2rem] border-none shadow-2xl p-8 max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-2">
                            Transaction History: <span className="text-primary-600 truncate">{selectedPartner?.partnerType === 'Individual' ? selectedPartner?.fullName : selectedPartner?.companyName}</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-4">
                        {commissionsLoading ? (
                            <div className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading transactions...</div>
                        ) : partnerCommissions.length > 0 ? (
                            <div className="border border-slate-100 rounded-3xl overflow-hidden bg-slate-50/50">
                                <Table>
                                    <TableHeader className="bg-white">
                                        <TableRow className="hover:bg-transparent border-slate-50">
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-6">Client / Details</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {partnerCommissions.map((comm) => (
                                            <TableRow key={comm._id} className="hover:bg-white transition-colors border-slate-50">
                                                <TableCell className="pl-6 py-4">
                                                    <div className="space-y-0.5">
                                                        <p className="font-black text-slate-900 text-[13px] tracking-tight">{comm.adminId?.companyName || 'N/A'}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{comm.type}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-[12px] font-black italic text-primary-600">₹{comm.amount}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm",
                                                        comm.status === 'paid' ? "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-500 border-emerald-100 dark:border-emerald-900/10" : "bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-500 border-amber-100 dark:border-amber-900/10"
                                                    )}>
                                                        {comm.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-[10px] font-bold text-slate-500 uppercase">
                                                    {new Date(comm.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-20 text-center space-y-4">
                                <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-200 dark:text-slate-700 shadow-inner">
                                    <TrendingUp size={40} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-900 dark:text-white font-black uppercase tracking-tight">No Transactions Yet</p>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Earnings will appear here once referrals start paying.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                        <Button onClick={() => setIsCommissionsModalOpen(false)} className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-xl">
                            Close transactions
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <PartnerAnalyticsModal
                isOpen={isAnalyticsModalOpen}
                onClose={() => setIsAnalyticsModalOpen(false)}
                partner={selectedPartner}
            />

            {/* Bank Details Modal */}
            <Dialog open={isBankModalOpen} onOpenChange={setIsBankModalOpen}>
                <DialogContent className="rounded-[2rem] border-none shadow-2xl p-8 max-w-sm bg-white dark:bg-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-2 text-slate-900 dark:text-white">
                            Bank <span className="text-primary-600">Details</span> <Landmark className="text-primary-600" size={20} />
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 italic">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Account Holder</Label>
                                <p className="font-bold text-slate-900 dark:text-white">{selectedPartner?.bankDetails?.accountHolderName || selectedPartner?.accountHolderName || 'N/A'}</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 italic">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Account Number</Label>
                                <p className="font-bold text-slate-900 dark:text-white tracking-wider">{selectedPartner?.bankDetails?.accountNumber || selectedPartner?.accountNumber || 'N/A'}</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 italic">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">IFSC Code</Label>
                                <p className="font-bold text-primary-600 uppercase tracking-widest">{selectedPartner?.bankDetails?.ifscCode || selectedPartner?.ifscCode || 'N/A'}</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 italic">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Bank / Branch</Label>
                                <p className="font-bold text-slate-900 dark:text-white">
                                    {selectedPartner?.bankDetails?.bankName || selectedPartner?.bankName || 'N/A'}
                                    <span className="text-slate-400 font-medium ml-2">({selectedPartner?.bankDetails?.branchName || selectedPartner?.branchName || 'N/A'})</span>
                                </p>
                            </div>
                        </div>
                        <Button onClick={() => setIsBankModalOpen(false)} className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-xl mt-4">
                            Close details
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Agreement Review Modal */}
            <Dialog open={isAgreementModalOpen} onOpenChange={setIsAgreementModalOpen}>
                <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 max-w-2xl overflow-hidden bg-white dark:bg-slate-950">
                    <div className="p-8 space-y-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
                                Review <span className="text-primary-600">Agreement</span>
                            </DialogTitle>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Verify the partner's signature before activation.</p>
                        </DialogHeader>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Partner Details</Label>
                                <div className="space-y-2">
                                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{selectedPartner?.partnerType === 'Individual' ? selectedPartner?.fullName : selectedPartner?.companyName}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-widest">{selectedPartner?.email}</p>
                                    <div className="pt-2">
                                        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none font-black text-[9px] uppercase tracking-widest">
                                            {selectedPartner?.agreementStatus || 'pending'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Digital Signature</Label>
                                {selectedPartner?.signatureImage ? (
                                    <div className="h-40 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-4 flex items-center justify-center">
                                        <img src={selectedPartner.signatureImage} alt="Signature" className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal brightness-0 dark:brightness-200 contrast-200" />
                                    </div>
                                ) : (
                                    <div className="h-40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-600">
                                        <FileText size={32} />
                                        <p className="text-[10px] font-black uppercase">No signature uploaded</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic">
                                "The partner acknowledges that by submitting this signature, they agree to the DinTask Partnership terms and conditions, including commission structures and confidentiality clauses."
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-black uppercase tracking-widest">
                                Accepted At: {selectedPartner?.agreementAcceptedAt ? new Date(selectedPartner.agreementAcceptedAt).toLocaleString() : 'N/A'}
                            </p>
                        </div>

                        <DialogFooter className="gap-3">
                            <Button variant="outline" onClick={() => setIsAgreementModalOpen(false)} className="h-12 flex-1 rounded-xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-slate-800">
                                Close
                            </Button>
                            {selectedPartner?.agreementStatus === 'submitted' && (
                                <Button
                                    onClick={handleApproveAgreement}
                                    disabled={approving}
                                    className="h-12 flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20"
                                >
                                    {approving ? 'Activating...' : 'Approve & Activate Partner'}
                                </Button>
                            )}
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PartnerManagement;
