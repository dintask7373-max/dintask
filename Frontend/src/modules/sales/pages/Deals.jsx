import React, { useState, useMemo, useEffect } from 'react';
import {
    CheckSquare,
    Filter,
    Plus,
    Search,
    Calendar as CalendarIcon,
    IndianRupee,
    User,
    Clock,
    TrendingUp,
    ArrowUpRight,
    Phone,
    Mail,
    Building,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Edit2,
    ShieldAlert
} from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Calendar } from "@/shared/components/ui/calendar";
import { Textarea } from '@/shared/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import useCRMStore from '@/store/crmStore';
import useAuthStore from '@/store/authStore';
import useSalesStore from '@/store/salesStore';
import { toast } from 'sonner';
import { useDebounce } from '@/shared/hooks/use-debounce';


const Deals = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { salesReps, getSalesRepByEmail } = useSalesStore();
    const { leads, pagination, fetchLeads, addLead, editLead, deleteLead, pipelineStages, requestProjectConversion } = useCRMStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStage, setSelectedStage] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [sortBy, setSortBy] = useState('deadline');
    const [sortOrder, setSortOrder] = useState('asc');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Dialog state
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState(null);

    // Add Deal Dialog state
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newDealData, setNewDealData] = useState({
        clientName: '',
        amount: '',
        status: 'New',
        priority: 'medium'
    });

    // Edit Deal Dialog state
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editDealData, setEditDealData] = useState({
        name: '',
        company: '',
        amount: '',
        status: 'New',
        priority: 'medium',
        deadline: null
    });
    const [originalAmount, setOriginalAmount] = useState(null);
    const [changeReason, setChangeReason] = useState('');

    const debouncedSearch = useDebounce(searchTerm, 500);

    // Fetch leads on mount and when filters change
    useEffect(() => {
        fetchLeads({
            search: debouncedSearch,
            status: selectedStage,
            priority: selectedPriority,
            page,
            limit
        });
    }, [debouncedSearch, selectedStage, selectedPriority, page, limit]);

    // Get current sales rep data
    const salesRep = useMemo(() => {
        return getSalesRepByEmail(user?.email);
    }, [user?.email, getSalesRepByEmail]);

    // Simplified filteredDeals (now mostly handle sorting)
    const filteredDeals = useMemo(() => {
        if (!user) return [];

        // Note: The leads are already filtered by the backend for search/status/priority
        // We only show 'Won' deals in this specific view, but if selectedStage is set, 
        // the backend handles it. If user wants a 'Deals' view that only shows Won, 
        // we might need to decide if backend 'status' should be forced to 'Won' here.
        // User said "sales me deals me jo search bar h and filter ko backend se connect karo".
        // In Deals.jsx, it seems it originally filtered for 'Won' deals only by default?
        // Let's check line 93: let myDeals = (leads || []).filter(lead => lead.status === 'Won');

        let displayLeads = leads || [];

        // If this page is specifically for 'Won' deals (Deals page), 
        // we should probably ensure the backend fetch includes status=Won.
        // But the previous code allowed filtering by stage too.

        return [...displayLeads]
            .sort((a, b) => {
                let aVal, bVal;
                switch (sortBy) {
                    case 'amount':
                        aVal = a.amount || 0;
                        bVal = b.amount || 0;
                        break;
                    case 'deadline':
                        aVal = a.deadline ? new Date(a.deadline) : new Date(8640000000000000);
                        bVal = b.deadline ? new Date(b.deadline) : new Date(8640000000000000);
                        break;
                    case 'stage':
                        aVal = a.status || '';
                        bVal = b.status || '';
                        break;
                    case 'priority':
                        const priorityOrder = { low: 1, medium: 2, high: 3 };
                        aVal = priorityOrder[a.priority] || 0;
                        bVal = priorityOrder[b.priority] || 0;
                        break;
                    default:
                        aVal = a.deadline ? new Date(a.deadline) : new Date(8640000000000000);
                        bVal = b.deadline ? new Date(b.deadline) : new Date(8640000000000000);
                }
                if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
    }, [leads, sortBy, sortOrder, user]);

    const dealStats = useMemo(() => {
        const totalDeals = filteredDeals.length;
        const totalValue = filteredDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
        const wonDeals = filteredDeals.filter(d => d.status === 'Won').length;
        const lostDeals = filteredDeals.filter(d => d.status === 'Lost').length;
        const activeDeals = totalDeals - wonDeals - lostDeals;
        const avgDealValue = totalDeals > 0 ? Math.round(totalValue / totalDeals) : 0;
        const winRate = totalDeals > 0 ? Math.round((wonDeals / (wonDeals + lostDeals)) * 100) : 0;

        return { totalDeals, totalValue, wonDeals, lostDeals, activeDeals, avgDealValue, winRate: isNaN(winRate) ? 0 : winRate };
    }, [filteredDeals]);

    const getStageColor = (stage) => {
        const colors = {
            'New': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'Contacted': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            'Meeting Done': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
            'Proposal Sent': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
            'Won': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'Lost': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
        return colors[stage] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const submitNewDeal = () => {
        if (!newDealData.clientName) {
            toast.error("Client Name is required");
            return;
        }

        const newDeal = {
            name: newDealData.clientName,
            company: newDealData.clientName,
            status: newDealData.status,
            priority: newDealData.priority,
            amount: parseFloat(newDealData.amount) || 0,
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            owner: user?.id || 'demo-user',
            email: `contact@${newDealData.clientName.replace(/\s+/g, '').toLowerCase()}.com`,
            mobile: '555-0000',
            source: 'Manual'
        };
        addLead(newDeal);
        toast.success(`Deal created for ${newDealData.clientName}`);
        setIsAddOpen(false);
        setNewDealData({ clientName: '', amount: '', status: 'New', priority: 'medium' });
    };

    const handleViewDeal = (dealId) => {
        const deal = leads.find(l => (l._id || l.id) === dealId);
        if (deal) {
            setSelectedDeal(deal);
            setIsViewOpen(true);
        }
    };

    const handleDeleteDeal = () => {
        if (selectedDeal) {
            if (window.confirm('Remove this deal from the pipeline? This action is irreversible.')) {
                deleteLead(selectedDeal._id || selectedDeal.id);
                toast.success("Deal removed from pipeline");
                setIsViewOpen(false);
                setSelectedDeal(null);
            }
        }
    };

    const handleEditClick = (deal) => {
        setSelectedDeal(deal);
        setEditDealData({
            name: deal.name,
            company: deal.company,
            amount: deal.amount,
            status: deal.status,
            priority: deal.priority,
            deadline: deal.deadline ? new Date(deal.deadline) : null,
            notes: deal.notes || ''
        });
        setOriginalAmount(deal.amount);
        setChangeReason('');
        setIsEditOpen(true);
    };

    const handleEditDeal = () => {
        if (selectedDeal) {
            setEditDealData({
                name: selectedDeal.name,
                company: selectedDeal.company,
                amount: selectedDeal.amount,
                status: selectedDeal.status,
                priority: selectedDeal.priority,
                deadline: selectedDeal.deadline ? new Date(selectedDeal.deadline) : null,
                notes: selectedDeal.notes || ''
            });
            setOriginalAmount(selectedDeal.amount);
            setChangeReason('');
            setIsEditOpen(true);
            setIsViewOpen(false);
        }
    };

    const submitEditDeal = () => {
        if (!editDealData.name) {
            toast.error("Name is required");
            return;
        }
        const currentAmount = parseFloat(editDealData.amount) || 0;
        const isAmountChanged = originalAmount !== null && currentAmount !== originalAmount;

        if (isAmountChanged && !changeReason.trim()) {
            toast.error("Reason for valuation adjustment is mandatory when changing deal price");
            return;
        }

        const finalNotes = isAmountChanged
            ? `${editDealData.notes || ''}\n[${new Date().toLocaleString()}] Amount adjusted from ₹${originalAmount} to ₹${currentAmount}. Reason: ${changeReason}`
            : editDealData.notes;

        editLead(selectedDeal._id || selectedDeal.id, {
            ...editDealData,
            amount: currentAmount,
            notes: finalNotes,
            deadline: editDealData.deadline ? editDealData.deadline.toISOString() : selectedDeal.deadline
        });
        toast.success("Deal updated successfully");
        setIsEditOpen(false);
        setSelectedDeal(null);
    };

    return (
        <div className="space-y-3 sm:space-y-4 pb-10">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                            Sales <span className="text-primary-600">Deals</span>
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                            Manage active business deals & closures
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* New Deal button removed as per request */}
                </div>
            </div>

            {/* Quick Stats Grid - Compact */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { label: 'Deals In Progress', value: dealStats.activeDeals, icon: IndianRupee, color: 'text-primary-600', border: 'border-primary-100', shadow: 'shadow-primary-100/50', gradient: 'from-white to-primary-50/30', trend: 'Deal Value' },
                    { label: 'Deals Won', value: dealStats.wonDeals, icon: CheckSquare, color: 'text-emerald-600', border: 'border-emerald-100', shadow: 'shadow-emerald-100/50', gradient: 'from-white to-emerald-50/30', trend: 'Conversions' },
                    { label: 'Pipeline Value', value: `₹${(dealStats.totalValue / 1000).toFixed(1)}k`, icon: TrendingUp, color: 'text-blue-600', border: 'border-blue-100', shadow: 'shadow-blue-100/50', gradient: 'from-white to-blue-50/30', trend: 'Potential' },
                    { label: 'Success Rate', value: `${dealStats.winRate}%`, icon: ArrowUpRight, color: 'text-amber-600', border: 'border-amber-100', shadow: 'shadow-amber-100/50', gradient: 'from-white to-amber-50/30', trend: 'Accuracy' }
                ].map((stat, i) => (
                    <Card key={i} className={cn(
                        "border-2 shadow-lg rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1",
                        stat.border,
                        stat.shadow,
                        "bg-gradient-to-br",
                        stat.gradient,
                        "dark:from-slate-900 dark:to-slate-800"
                    )}>
                        <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
                            <div className="space-y-3">
                                <div className={cn("size-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 duration-500 shadow-sm", stat.color.replace('text-', 'bg-').replace('600', '100'))}>
                                    <stat.icon size={16} className={stat.color} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                    <p className={cn("text-lg sm:text-xl font-black tracking-tight leading-none", stat.color)}>{stat.value}</p>
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter italic leading-none">{stat.trend}</p>
                                </div>
                            </div>
                            <div className={cn("size-14 -mr-3 opacity-10 transform rotate-12 transition-transform group-hover:rotate-0 duration-700", stat.color)}>
                                <stat.icon size={56} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters Bar - Ultra Compact */}
            <Card className="border-2 border-slate-100 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:shadow-none bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/20 rounded-2xl overflow-hidden">
                <CardContent className="p-2 sm:p-3">
                    <div className="flex flex-col lg:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 transition-colors group-focus-within:text-primary-600" />
                            <input
                                placeholder="Scan tactical pipeline for identifier..."
                                className="w-full h-10 pl-11 bg-slate-50 border-none dark:bg-slate-800 rounded-xl font-bold text-xs outline-none focus:ring-1 focus:ring-primary-100"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full lg:w-auto">
                            <Select value={selectedStage} onValueChange={setSelectedStage}>
                                <SelectTrigger className="h-10 min-w-[140px] rounded-xl bg-slate-50 border-none dark:bg-slate-800 font-bold text-[9px] uppercase tracking-widest">
                                    <div className="flex items-center gap-2">
                                        <Filter size={12} className="text-slate-400" />
                                        <SelectValue placeholder="All Sectors" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="border-none shadow-2xl">
                                    <SelectItem value="all" className="text-[10px] font-black uppercase">All Sectors</SelectItem>
                                    {pipelineStages?.map(stage => (
                                        <SelectItem key={stage} value={stage} className="text-[10px] font-black uppercase">{stage}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                                <SelectTrigger className="h-10 min-w-[140px] rounded-xl bg-slate-50 border-none dark:bg-slate-800 font-bold text-[9px] uppercase tracking-widest">
                                    <SelectValue placeholder="Priority Level" />
                                </SelectTrigger>
                                <SelectContent className="border-none shadow-2xl">
                                    <SelectItem value="all" className="text-[10px] font-black uppercase">All Priority</SelectItem>
                                    <SelectItem value="high" className="text-[10px] font-black uppercase text-red-600">High Alert</SelectItem>
                                    <SelectItem value="medium" className="text-[10px] font-black uppercase text-amber-600">Standard</SelectItem>
                                    <SelectItem value="low" className="text-[10px] font-black uppercase text-slate-400">Low Risk</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Data Grid - Refined Density */}
            <Card className="border-2 border-primary-100 shadow-xl shadow-primary-100/50 dark:border-primary-900 dark:shadow-none bg-gradient-to-br from-white to-primary-50/30 dark:from-slate-900 dark:to-primary-900/10 rounded-2xl overflow-hidden min-h-[400px]">
                <CardHeader className="py-3 px-6 border-b border-slate-50 dark:border-slate-800">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tactical Pipeline core</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Desktop View */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-50 dark:border-slate-800">
                                    <TableHead className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Entity</TableHead>
                                    <TableHead className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Name</TableHead>
                                    <TableHead className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Valuation</TableHead>
                                    <TableHead className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Deployment</TableHead>
                                    <TableHead className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Priority</TableHead>
                                    <TableHead className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDeals.map((deal) => (
                                    <TableRow key={deal._id || deal.id} className="group cursor-pointer border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors" onClick={() => handleViewDeal(deal._id || deal.id)}>
                                        <TableCell className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                                                    {deal.name?.substring(0, 1)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none mb-1">{deal.company || deal.name}</p>
                                                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Node ID: {String(deal._id || deal.id).substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-3">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{deal.name}</p>
                                        </TableCell>
                                        <TableCell className="px-6 py-3">
                                            <p className="text-sm font-black text-slate-900 dark:text-white leading-none">₹{(deal.amount || 0).toLocaleString()}</p>
                                        </TableCell>
                                        <TableCell className="px-6 py-3">
                                            <Badge className={cn("border-none text-[8px] font-black uppercase tracking-widest h-5 px-2 rounded-lg", getStageColor(deal.status))}>
                                                {deal.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("size-2 rounded-full",
                                                    deal.priority === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                                                        deal.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-300')}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-3 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditClick(deal);
                                                    }}
                                                >
                                                    <Edit2 size={14} />
                                                </Button>

                                                {deal.status === 'Won' && (
                                                    (deal.approvalStatus && deal.approvalStatus !== 'none') ? (
                                                        <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-emerald-200 text-emerald-600 bg-emerald-50">
                                                            {deal.approvalStatus.replace('_', ' ')}
                                                        </Badge>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 px-3 text-[9px] font-black uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-500/20"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (!deal.amount || deal.amount <= 0) {
                                                                    toast.error("Project budget cannot be zero. Please update the deal amount.");
                                                                    return;
                                                                }
                                                                if (!deal.deadline) {
                                                                    toast.error("Project deadline is mandatory. Please recalibrate (edit) the deal and set a deadline.");
                                                                    return;
                                                                }
                                                                requestProjectConversion(deal._id || deal.id);
                                                            }}
                                                        >
                                                            Convert
                                                        </Button>
                                                    )
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View - Refined Dossier Style */}
                    <div className="md:hidden space-y-3 p-3">
                        {filteredDeals.map((deal) => (
                            <div key={deal._id || deal.id} className="group bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden active:scale-[0.98] transition-all" onClick={() => handleViewDeal(deal._id || deal.id)}>
                                <div className="flex items-start justify-between mb-3 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="size-11 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center text-sm font-black uppercase shadow-inner shadow-primary-500/10 shrink-0">
                                            {deal.name?.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-slate-900 dark:text-white text-sm leading-tight uppercase tracking-tight truncate">{deal.company || deal.name}</h4>
                                            <Badge className={cn("mt-1 border-none text-[7px] font-black uppercase tracking-widest h-4 px-1.5 rounded-lg", getStageColor(deal.status))}>
                                                {deal.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={cn("text-[8px] uppercase font-black px-2 py-0.5 border shadow-none rounded-lg shrink-0",
                                            deal.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' :
                                                deal.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-slate-50 text-slate-500 border-slate-100'
                                        )}
                                    >
                                        {deal.priority}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-800/50 flex flex-col justify-center">
                                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Valuation Focus</p>
                                        <div className="flex items-center gap-1 text-primary-600 font-black text-sm">
                                            <IndianRupee size={10} className="stroke-[3.5px]" />
                                            {Number(deal.amount || 0).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-800/50 flex flex-col justify-center">
                                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Sector Node</p>
                                        <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase truncate">
                                            {String(deal._id || deal.id).substring(0, 8)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-50 dark:border-slate-800/50">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-9 px-4 rounded-xl text-primary-600 hover:bg-primary-50 font-black text-[10px] uppercase tracking-widest"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditClick(deal);
                                        }}
                                    >
                                        <Edit2 size={12} className="mr-2" />
                                        Recalibrate
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-9 px-4 rounded-xl text-red-500 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedDeal(deal);
                                            handleDeleteDeal();
                                        }}
                                    >
                                        <Trash2 size={12} className="mr-2" />
                                        Purge
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredDeals.length === 0 && (
                        <div className="p-16 text-center space-y-4">
                            <div className="size-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                <IndianRupee size={32} className="text-slate-200" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight italic">No Tactical Matches</h3>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Adjust frequency filters to recalibrate detection</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing {Math.min(pagination.total, (pagination.currentPage - 1) * pagination.limit + 1)} to {Math.min(pagination.total, pagination.currentPage * pagination.limit)} of {pagination.total} assets
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.currentPage === 1}
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            className="h-8 w-8 p-0 rounded-lg border-slate-200"
                        >
                            <ChevronLeft size={14} />
                        </Button>

                        {[...Array(pagination.pages)].map((_, i) => {
                            const pageNum = i + 1;
                            if (
                                pageNum === 1 ||
                                pageNum === pagination.pages ||
                                (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
                            ) {
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={pagination.currentPage === pageNum ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setPage(pageNum)}
                                        className={cn(
                                            "h-8 w-8 p-0 rounded-lg text-[10px] font-black",
                                            pagination.currentPage === pageNum
                                                ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20"
                                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            } else if (
                                pageNum === pagination.currentPage - 2 ||
                                pageNum === pagination.currentPage + 2
                            ) {
                                return <span key={pageNum} className="px-1 text-slate-400 text-xs text-[10px] font-black">...</span>;
                            }
                            return null;
                        })}

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.currentPage === pagination.pages}
                            onClick={() => setPage(prev => Math.min(pagination.pages, prev + 1))}
                            className="h-8 w-8 p-0 rounded-lg border-slate-200"
                        >
                            <ChevronRight size={14} />
                        </Button>
                    </div>
                </div>
            )}

            {/* Dialogs */}
            {/* View Deal Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="w-[94vw] max-w-[500px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
                    <div className="h-24 sm:h-28 bg-slate-900 p-6 sm:p-8 flex flex-col justify-end relative overflow-hidden">
                        <div className="absolute top-0 right-0 size-40 bg-primary-600/20 rounded-full blur-3xl -mr-20 -mt-20" />
                        <h2 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase relative z-10 truncate">{selectedDeal?.company || selectedDeal?.name}</h2>
                        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest relative z-10">Business Deal Overview</p>
                    </div>
                    <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col">
                                <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Expected Revenue</p>
                                <p className="text-lg sm:text-xl font-black text-primary-600 leading-none">₹{(selectedDeal?.amount || 0).toLocaleString()}</p>
                            </div>
                            <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col">
                                <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Deal Status</p>
                                <Badge className={cn("border-none text-[8px] font-black uppercase h-5 sm:h-6 px-2 sm:px-2.5 rounded-lg w-fit", getStageColor(selectedDeal?.status))}>
                                    {selectedDeal?.status}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Client Contacts</h4>
                            {[
                                { icon: User, label: 'Contact Person', value: selectedDeal?.name },
                                { icon: Mail, label: 'Email Address', value: selectedDeal?.email || 'N/A' },
                                { icon: Phone, label: 'Phone Number', value: selectedDeal?.mobile || 'N/A' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                        <item.icon size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                                        <p className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white truncate">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <DialogFooter className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                            <Button
                                variant="outline"
                                className="h-10 rounded-xl text-[9px] font-black uppercase tracking-widest border-slate-200"
                                onClick={() => {
                                    setIsViewOpen(false);
                                    handleEditClick(selectedDeal);
                                }}
                            >
                                <Edit2 size={12} className="mr-2" />
                                Edit Deal
                            </Button>
                            <Button className="h-10 rounded-xl bg-primary-600 hover:bg-primary-700 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary-500/20" onClick={() => setIsViewOpen(false)}>
                                Close Details
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Deal Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="w-[94vw] max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden font-sans">
                    <div className="bg-primary-600 p-6 text-white">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Add New Deal</DialogTitle>
                        <p className="text-[9px] font-black text-primary-100 uppercase tracking-[0.2em] mt-1 italic">Register new business opportunity</p>
                    </div>
                    <div className="p-6 space-y-4 bg-white dark:bg-slate-900">
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Company / Client Name</Label>
                            <Input
                                value={newDealData.clientName}
                                onChange={(e) => setNewDealData({ ...newDealData, clientName: e.target.value })}
                                className="h-10 rounded-xl bg-slate-50 border-none font-bold text-sm px-4"
                                placeholder="Corporate Name"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expected Revenue</Label>
                                <Input
                                    type="number"
                                    value={newDealData.amount}
                                    onChange={(e) => setNewDealData({ ...newDealData, amount: e.target.value })}
                                    className="h-10 rounded-xl bg-slate-50 border-none font-bold text-sm px-4"
                                    placeholder="Amount"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Priority</Label>
                                <Select value={newDealData.priority} onValueChange={(val) => setNewDealData({ ...newDealData, priority: val })}>
                                    <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-none font-bold text-[10px] uppercase">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="high">High Priority</SelectItem>
                                        <SelectItem value="medium">Medium Priority</SelectItem>
                                        <SelectItem value="low">Low Priority</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Deal Stage</Label>
                            <Select value={newDealData.status} onValueChange={(val) => setNewDealData({ ...newDealData, status: val })}>
                                <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-none font-bold text-[10px] uppercase">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {pipelineStages.map(stage => (
                                        <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter className="pt-4 flex gap-3">
                            <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="flex-1 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest">Cancel</Button>
                            <Button onClick={submitNewDeal} className="flex-1 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest bg-primary-600 hover:bg-primary-700 text-white shadow-lg">Save Deal</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Deal Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="w-[94vw] max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden font-sans">
                    <div className="bg-slate-900 p-6 text-white">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Edit Deal Details</DialogTitle>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Update business opportunity info</p>
                    </div>
                    <div className="p-6 space-y-4 bg-white dark:bg-slate-900">
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Deal Name</Label>
                            <Input
                                value={editDealData.name}
                                onChange={(e) => setEditDealData({ ...editDealData, name: e.target.value })}
                                className="h-10 rounded-xl bg-slate-50 border-none font-bold text-sm px-4"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Deal Amount (₹)</Label>
                                <Input
                                    type="number"
                                    value={editDealData.amount}
                                    onChange={(e) => setEditDealData({ ...editDealData, amount: e.target.value })}
                                    className="h-10 rounded-xl bg-slate-50 border-none font-bold text-sm px-4"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Priority</Label>
                                <Select value={editDealData.priority} onValueChange={(val) => setEditDealData({ ...editDealData, priority: val })}>
                                    <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-none font-bold text-[10px] uppercase">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="high">High Priority</SelectItem>
                                        <SelectItem value="medium">Medium Priority</SelectItem>
                                        <SelectItem value="low">Low Priority</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stage</Label>
                            <Select value={editDealData.status} onValueChange={(val) => setEditDealData({ ...editDealData, status: val })}>
                                <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-none font-bold text-[10px] uppercase">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {pipelineStages.map(stage => (
                                        <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Deadline</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full h-10 justify-start text-left font-bold text-sm px-4 rounded-xl bg-slate-50 border-none",
                                            !editDealData.deadline && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                                        {editDealData.deadline ? format(editDealData.deadline, "PPP") : <span>Pick a deadline</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={editDealData.deadline}
                                        onSelect={(date) => setEditDealData({ ...editDealData, deadline: date })}
                                        disabled={(date) =>
                                            date < new Date(new Date().setHours(0, 0, 0, 0)) || date > new Date("2035-12-31")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {originalAmount !== null && parseFloat(editDealData.amount) !== originalAmount && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-2 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30"
                            >
                                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                    <ShieldAlert size={14} className="animate-pulse" />
                                    <Label className="text-[9px] font-black uppercase tracking-widest italic">
                                        Mandatory: Reason for valuation adjustment
                                    </Label>
                                </div>
                                <Textarea
                                    placeholder="Explain why the deal value was modified..."
                                    value={changeReason}
                                    onChange={(e) => setChangeReason(e.target.value)}
                                    className="min-h-[90px] rounded-xl border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 font-bold text-xs"
                                />
                            </motion.div>
                        )}
                        <DialogFooter className="pt-4 flex gap-3">
                            <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="flex-1 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest">Cancel</Button>
                            <Button onClick={submitEditDeal} className="flex-1 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest bg-slate-900 hover:bg-slate-800 text-white">Save Changes</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Deals;
