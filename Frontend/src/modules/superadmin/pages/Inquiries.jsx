import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    Phone,
    Building2,
    Calendar,
    Clock,
    MoreHorizontal,
    CheckCircle2,
    Clock3,
    AlertCircle,
    Search,
    Filter,
    ChevronRight,
    MessageSquare,
    Briefcase,
    Users
} from 'lucide-react';
import useSuperAdminStore from '@/store/superAdminStore';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
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
    DialogTitle,
    DialogDescription,
} from "@/shared/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { format } from 'date-fns';
import { cn } from '@/shared/utils/cn';

const Inquiries = () => {
    const {
        inquiries,
        inquiryPagination,
        fetchInquiries,
        fetchInquiryDetails,
        updateInquiryStatus,
        loading
    } = useSuperAdminStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [pageSize, setPageSize] = useState(10);
    const [selectedInquiry, setSelectedInquiry] = useState(null);

    // Initial fetch and on filter/pagination change
    React.useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchInquiries({
                page: 1, // Reset to page 1 on search/filter change
                status: filterStatus,
                search: searchTerm.trim(),
                limit: pageSize
            });
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, filterStatus, pageSize]);

    const handlePageChange = (newPage) => {
        fetchInquiries({
            page: newPage,
            status: filterStatus,
            search: searchTerm,
            limit: pageSize
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'new':
                return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-none px-2 py-0.5 rounded-full flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter"><Clock3 size={10} strokeWidth={3} /> NEW_V2</Badge>;
            case 'replied':
                return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-none px-2 py-0.5 rounded-full flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter"><CheckCircle2 size={10} strokeWidth={3} /> Replied</Badge>;
            case 'archived':
                return <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-none px-2 py-0.5 rounded-full flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter"><AlertCircle size={10} strokeWidth={3} /> Archived</Badge>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto pb-20">
            {/* DEBUG INFO */}
            <div className="bg-red-50 p-2 text-[10px] font-mono border border-red-100 rounded text-red-600">
                Search: "{searchTerm}" | Status: {filterStatus} | Count: {inquiries.length} | Total: {inquiryPagination?.total}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Inquiries</h1>
                    <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 mt-0.5">Manage and respond to Pro and Enterprise leads.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-3 py-1 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                        {inquiryPagination.total} Leads Found
                    </Badge>
                </div>
            </div>

            <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem]">
                <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row gap-4 items-end">
                        <div className="space-y-2 flex-1 w-full">
                            <Label className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-extrabold ml-1">Search Leads</Label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <Input
                                    placeholder="Search by name, email or company..."
                                    className="pl-11 h-11 bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-2xl text-[12px] font-bold ring-offset-white focus-visible:ring-2 focus-visible:ring-primary-500/10 placeholder:text-slate-300 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2 w-full lg:w-auto">
                            <Label className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-extrabold ml-1 lg:hidden">Status Filter</Label>
                            <div className="flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl overflow-x-auto no-scrollbar">
                                {['all', 'new', 'replied', 'archived'].map((status) => (
                                    <Button
                                        key={status}
                                        variant={filterStatus === status ? 'default' : 'ghost'}
                                        size="sm"
                                        className={cn(
                                            "text-[10px] font-black uppercase tracking-widest h-9 px-4 rounded-xl transition-all",
                                            filterStatus === status
                                                ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                                        )}
                                        onClick={() => setFilterStatus(status)}
                                    >
                                        {status}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2 w-full lg:w-auto">
                            <Label className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-extrabold ml-1">Per Page</Label>
                            <Select value={pageSize.toString()} onValueChange={(val) => setPageSize(parseInt(val))}>
                                <SelectTrigger className="w-full lg:w-[100px] h-11 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none font-bold text-xs ring-offset-white focus:ring-2 focus:ring-primary-500/10 transition-all">
                                    <SelectValue placeholder="Limit" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-xl">
                                    <SelectItem value="2" className="text-xs font-bold rounded-xl">2 Leads</SelectItem>
                                    <SelectItem value="5" className="text-xs font-bold rounded-xl">5 Leads</SelectItem>
                                    <SelectItem value="10" className="text-xs font-bold rounded-xl">10 Leads</SelectItem>
                                    <SelectItem value="20" className="text-xs font-bold rounded-xl">20 Leads</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className={`grid grid-cols-1 gap-4 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                <AnimatePresence mode="popLayout">
                    {inquiries.length > 0 ? (
                        inquiries.map((inq, index) => (
                            <motion.div
                                key={inq._id || inq.id || index}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                            >
                                <Card
                                    className="overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-none transition-all duration-300 cursor-pointer"
                                    onClick={() => setSelectedInquiry(inq)}
                                >
                                    <div className={`h-1 w-full ${inq.status === 'new' ? 'bg-primary-500' : inq.status === 'replied' ? 'bg-green-500' : 'bg-slate-400'}`} />
                                    <CardContent className="p-0">
                                        <div className="flex flex-col lg:flex-row lg:items-center p-3 sm:p-5 gap-3 lg:gap-6">
                                            <div className="flex-1 min-w-0 space-y-2.5">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-800 dark:text-white font-black text-xs md:text-lg shrink-0">
                                                            {(inq.firstName?.[0] || inq.name?.[0] || 'U')}{(inq.lastName?.[0] || inq.name?.split(' ')[1]?.[0] || '')}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                                                <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white leading-tight truncate">
                                                                    {inq.firstName ? `${inq.firstName} ${inq.lastName}` : inq.name}
                                                                </h3>
                                                                <div className="flex items-center">
                                                                    {getStatusBadge(inq.status)}
                                                                </div>
                                                            </div>
                                                            <p className="text-[10px] md:text-xs font-black text-primary-600 dark:text-primary-400 flex items-center gap-1 mt-0.5 uppercase tracking-tight truncate">
                                                                <Building2 size={10} strokeWidth={3} /> {inq.company || inq.companyName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="lg:hidden shrink-0">
                                                        <InquiryActions inq={inq} updateStatus={updateInquiryStatus} onView={() => setSelectedInquiry(inq)} />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4 pt-1">
                                                    <div className="flex items-center gap-2 text-[11px] md:text-sm font-bold text-slate-500 dark:text-slate-400">
                                                        <Mail size={14} className="text-slate-400 shrink-0" />
                                                        <span className="truncate">{inq.workEmail || inq.businessEmail}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[11px] md:text-sm font-bold text-slate-500 dark:text-slate-400">
                                                        <Phone size={14} className="text-slate-400 shrink-0" />
                                                        <span>{inq.phone}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[11px] md:text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">
                                                        {inq.source === 'pricing_page' || inq.interestedPlan ? (
                                                            <>
                                                                <Calendar size={14} className="text-slate-400 shrink-0" />
                                                                <span>{inq.planSelected || inq.interestedPlan} Plan</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <MessageSquare size={14} className="text-slate-400 shrink-0" />
                                                                <span>General Inquiry</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {inq.questions && (
                                                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-[11px] md:text-xs font-medium italic text-slate-600 dark:text-slate-400 relative">
                                                        <MessageSquare className="absolute -top-2.5 -left-2.5 p-1 w-6 h-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full text-primary-500 shadow-sm" />
                                                        "{inq.questions}"
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-row lg:flex-col justify-between items-center lg:items-end gap-3 lg:gap-4 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-3 lg:pt-0 lg:pl-6 min-w-0 lg:min-w-[180px] w-full lg:w-auto">
                                                <div className="text-left lg:text-right space-y-0.5 w-auto lg:w-full">
                                                    <div className="flex lg:justify-end items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                                        <Clock size={10} /> Received
                                                    </div>
                                                    <div className="text-[11px] md:text-sm font-black text-slate-700 dark:text-slate-300 flex flex-col lg:items-end">
                                                        {format(new Date(inq.date || inq.createdAt), 'MMM dd, yyyy')}
                                                        <span className="text-[10px] font-bold text-slate-400">{format(new Date(inq.date || inq.createdAt), 'HH:mm aaa')}</span>
                                                    </div>
                                                </div>

                                                <div className="hidden lg:block w-full">
                                                    <InquiryActions inq={inq} updateStatus={updateInquiryStatus} onView={() => setSelectedInquiry(inq)} fullWidth />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-700 mb-4">
                                <Search size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No inquiries found</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                We couldn't find any inquiries matching your search or filters.
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Pagination UI */}
            {inquiryPagination.total > 0 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={inquiryPagination.page === 1}
                        onClick={() => handlePageChange(inquiryPagination.page - 1)}
                        className="rounded-xl border-slate-200 dark:border-slate-800"
                    >
                        Previous
                    </Button>
                    <div className="flex items-center gap-1">
                        {[...Array(inquiryPagination.pages)].map((_, i) => (
                            <Button
                                key={i + 1}
                                variant={inquiryPagination.page === i + 1 ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handlePageChange(i + 1)}
                                className={cn(
                                    "w-9 h-9 p-0 rounded-xl",
                                    inquiryPagination.page === i + 1 ? "" : "border-slate-200 dark:border-slate-800"
                                )}
                            >
                                {i + 1}
                            </Button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={inquiryPagination.page === inquiryPagination.pages}
                        onClick={() => handlePageChange(inquiryPagination.page + 1)}
                        className="rounded-xl border-slate-200 dark:border-slate-800"
                    >
                        Next
                    </Button>
                </div>
            )}

            <InquiryDetailModal
                isOpen={!!selectedInquiry}
                onOpenChange={(open) => !open && setSelectedInquiry(null)}
                inquiryId={selectedInquiry?._id || selectedInquiry?.id}
                initialData={selectedInquiry}
                updateStatus={updateInquiryStatus}
            />
        </div>
    );
};

const InquiryActions = ({ inq, updateStatus, onView, fullWidth = false }) => (
    <div className={fullWidth ? "w-full space-y-2" : "flex items-center gap-1"}>
        <Button
            size="sm"
            variant="outline"
            className={cn(
                "font-black text-[9px] uppercase tracking-tighter border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg shrink-0",
                fullWidth ? "w-full h-10" : "h-7 px-2"
            )}
            onClick={(e) => {
                e.stopPropagation();
                onView();
            }}
        >
            <Users size={10} className="mr-1" /> View
        </Button>
        <Button
            size="sm"
            className={cn(
                "font-black text-[9px] uppercase tracking-tighter bg-primary-600 hover:bg-primary-700 rounded-lg shrink-0",
                fullWidth ? "w-full h-10" : "h-7 px-2"
            )}
            onClick={(e) => {
                e.stopPropagation();
                window.open(`mailto:${inq.workEmail}?subject=Regarding your DinTask ${inq.planSelected} Plan Inquiry`);
            }}
        >
            <Mail size={10} className="mr-1" /> Reply
        </Button>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreHorizontal size={12} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 font-sans">
                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => updateStatus(inq._id || inq.id, 'replied')} className="flex items-center gap-2 py-2.5">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span className="font-medium">Mark as Replied</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus(inq._id || inq.id, 'new')} className="flex items-center gap-2 py-2.5">
                    <Clock3 size={16} className="text-blue-500" />
                    <span className="font-medium">Mark as New</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => updateStatus(inq._id || inq.id, 'archived')} className="flex items-center gap-2 py-2.5 text-slate-500">
                    <AlertCircle size={16} />
                    <span className="font-medium">Archive Inquiry</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
);

const InquiryDetailModal = ({ isOpen, onOpenChange, inquiryId, initialData, updateStatus }) => {
    const { fetchInquiryDetails } = useSuperAdminStore();
    const [fullInquiry, setFullInquiry] = useState(initialData);
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        if (isOpen && inquiryId) {
            setIsLoading(true);
            setFullInquiry(initialData);

            fetchInquiryDetails(inquiryId).then(data => {
                if (data) setFullInquiry(data);
                setIsLoading(false);
            });
        }
    }, [isOpen, inquiryId]);

    const inquiry = fullInquiry || initialData;
    if (!inquiry) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl font-sans text-slate-900 dark:text-white">
                <div className="sr-only">
                    <DialogTitle>Inquiry Details</DialogTitle>
                    <DialogDescription>Full details concerning the selected support inquiry.</DialogDescription>
                </div>
                {/* Header */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 sm:p-8 text-white relative">
                    <div className="absolute top-4 right-4 flex gap-2">
                        <Badge className={cn(
                            "border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                            inquiry.status === 'new' ? "bg-primary-500" : inquiry.status === 'replied' ? "bg-emerald-500" : "bg-slate-500"
                        )}>
                            {inquiry.status}
                        </Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] sm:rounded-[2rem] bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl sm:text-3xl font-black border border-white/20 shadow-xl">
                            {(inquiry.firstName?.[0] || 'U')}{(inquiry.lastName?.[0] || '')}
                        </div>
                        <div className="space-y-1 text-center sm:text-left">
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{inquiry.firstName} {inquiry.lastName}</h2>
                            <p className="text-primary-400 font-bold flex items-center justify-center sm:justify-start gap-2">
                                <Building2 size={18} /> {inquiry.company || inquiry.companyName}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 space-y-6 sm:space-y-8 bg-white dark:bg-slate-900">
                    {isLoading && <div className="text-center text-xs font-bold text-slate-400">Loading full details...</div>}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                        <DetailItem icon={Mail} label="Work Email" value={inquiry.workEmail || inquiry.businessEmail} />
                        <DetailItem icon={Phone} label="Phone Number" value={inquiry.phone} />
                        <DetailItem icon={Calendar} label="Plan Interested" value={inquiry.planSelected || inquiry.interestedPlan} />
                        <DetailItem icon={Clock} label="Received Date" value={inquiry.createdAt || inquiry.date ? format(new Date(inquiry.createdAt || inquiry.date), 'MMM dd, yyyy HH:mm') : 'N/A'} />
                        {/* Extra Details Loaded from API */}
                        {inquiry.industry && <DetailItem icon={Building2} label="Industry" value={inquiry.industry} />}
                        {inquiry.companySize && <DetailItem icon={Users} label="Company Size" value={inquiry.companySize} />}
                        {inquiry.jobTitle && <DetailItem icon={Briefcase} label="Job Title" value={inquiry.jobTitle} />}
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Message / Requirements</p>
                        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 relative">
                            <MessageSquare className="absolute -top-3 -left-3 p-1.5 w-8 h-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-primary-500 shadow-lg" />
                            <p className="text-slate-600 dark:text-slate-300 font-medium italic leading-relaxed">
                                "{inquiry.requirements || inquiry.questions || 'No specific details provided.'}"
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button
                            className="flex-1 h-12 sm:h-14 rounded-2xl bg-primary-600 hover:bg-primary-700 font-black text-base sm:text-lg gap-3"
                            onClick={() => window.open(`mailto:${inquiry.workEmail || inquiry.businessEmail}?subject=DinTask Inquiry`)}
                        >
                            <Mail size={20} /> Reply via Email
                        </Button>
                        {inquiry.status === 'new' && (
                            <Button
                                variant="outline"
                                className="h-12 sm:h-14 rounded-2xl border-slate-200 dark:border-slate-700 font-bold px-6"
                                onClick={() => {
                                    updateStatus(inquiry.id || inquiry._id, 'replied');
                                    onOpenChange(false);
                                }}
                            >
                                Mark as Replied
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="space-y-1.5 group">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Icon size={12} className="text-primary-500" /> {label}
        </p>
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {value}
        </p>
    </div>
);

export default Inquiries;
