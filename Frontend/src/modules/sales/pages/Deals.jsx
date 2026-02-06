import React, { useState, useMemo } from 'react';
import {
    CheckSquare,
    Filter,
    Plus,
    Search,
    Calendar,
    IndianRupee,
    User,
    Clock,
    TrendingUp,
    ArrowUpRight,
    Phone,
    Mail,
    Building,
    ArrowRight
} from 'lucide-react';
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


const Deals = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { salesReps, getSalesRepByEmail } = useSalesStore();
    const { leads, addLead, editLead, deleteLead, pipelineStages } = useCRMStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStage, setSelectedStage] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [sortBy, setSortBy] = useState('deadline');
    const [sortOrder, setSortOrder] = useState('asc');

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
        priority: 'medium'
    });

    // Get current sales rep data
    const salesRep = useMemo(() => {
        return getSalesRepByEmail(user?.email);
    }, [user?.email, getSalesRepByEmail]);

    // Filter and sort deals
    const filteredDeals = useMemo(() => {
        if (!salesRep && !user) return [];
        let myDeals = leads;

        return myDeals
            .filter(deal => {
                const matchesSearch = (deal.company || deal.name).toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStage = selectedStage === 'all' || deal.status === selectedStage;
                const matchesPriority = selectedPriority === 'all' || deal.priority === selectedPriority;
                return matchesSearch && matchesStage && matchesPriority;
            })
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
    }, [leads, searchTerm, selectedStage, selectedPriority, sortBy, sortOrder, salesRep, user]);

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
        const deal = leads.find(l => l.id === dealId);
        if (deal) {
            setSelectedDeal(deal);
            setIsViewOpen(true);
        }
    };

    const handleDeleteDeal = () => {
        if (selectedDeal) {
            deleteLead(selectedDeal.id);
            toast.success("Deal deleted successfully");
            setIsViewOpen(false);
            setSelectedDeal(null);
        }
    };

    const handleEditDeal = () => {
        if (selectedDeal) {
            setEditDealData({
                name: selectedDeal.name,
                company: selectedDeal.company,
                amount: selectedDeal.amount,
                status: selectedDeal.status,
                priority: selectedDeal.priority
            });
            setIsEditOpen(true);
            setIsViewOpen(false);
        }
    };

    const submitEditDeal = () => {
        if (!editDealData.name) {
            toast.error("Name is required");
            return;
        }
        editLead(selectedDeal.id, {
            ...editDealData,
            amount: parseFloat(editDealData.amount) || 0
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
                    <div className="lg:hidden w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                        <img src="/dintask-logo.png" alt="DinTask" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                            Sales <span className="text-primary-600">Pipeline</span>
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                            Operational deal flow & conversions
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setIsAddOpen(true)}
                        className="flex-1 sm:flex-none h-10 px-6 gap-2 shadow-lg shadow-primary-500/20 bg-primary-600 hover:bg-primary-700 rounded-xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap"
                    >
                        <Plus size={16} />
                        <span>New Deal</span>
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid - Compact */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { label: 'Active Pipeline', value: dealStats.activeDeals, icon: IndianRupee, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/10', trend: 'Force Strength' },
                    { label: 'Strategic Wins', value: dealStats.wonDeals, icon: CheckSquare, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20', trend: 'Conversion' },
                    { label: 'Total Value', value: `₹${(dealStats.totalValue / 1000).toFixed(1)}k`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10', trend: 'Portfolio' },
                    { label: 'Efficiency', value: `${dealStats.winRate}%`, icon: ArrowUpRight, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10', trend: 'Success Rate' }
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden group">
                        <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
                            <div className="space-y-3">
                                <div className={cn("size-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 duration-500", stat.bg)}>
                                    <stat.icon size={16} className={stat.color} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                    <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{stat.value}</p>
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter italic leading-none">{stat.trend}</p>
                                </div>
                            </div>
                            <div className="size-14 -mr-3 opacity-[0.03] transform rotate-12 transition-transform group-hover:rotate-0 duration-700">
                                <stat.icon size={56} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters Bar - Ultra Compact */}
            <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
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
                                <SelectContent className="rounded-2xl border-none shadow-2xl">
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
                                <SelectContent className="rounded-2xl border-none shadow-2xl">
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
            <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden min-h-[400px]">
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
                                    <TableHead className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Valuation</TableHead>
                                    <TableHead className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Deployment</TableHead>
                                    <TableHead className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Priority</TableHead>
                                    <TableHead className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDeals.map((deal) => (
                                    <TableRow key={deal.id} className="group cursor-pointer border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors" onClick={() => handleViewDeal(deal.id)}>
                                        <TableCell className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                                                    {deal.name?.substring(0, 1)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none mb-1">{deal.company || deal.name}</p>
                                                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Node ID: {String(deal.id).substring(0, 8)}</p>
                                                </div>
                                            </div>
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
                                                <span className="text-[9px] font-black uppercase text-slate-500">{deal.priority}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-3 text-right">
                                            <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-white dark:hover:bg-slate-800">
                                                <ArrowRight size={14} className="text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden space-y-3 p-3">
                        {filteredDeals.map((deal) => (
                            <div key={deal.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3" onClick={() => handleViewDeal(deal.id)}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-xs font-black text-primary-600">
                                            {deal.name?.substring(0, 1)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none mb-1">{deal.company || deal.name}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">₹{(deal.amount || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <Badge className={cn("border-none text-[8px] font-black uppercase tracking-widest h-5 px-2 rounded-lg", getStageColor(deal.status))}>
                                        {deal.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("size-2 rounded-full", deal.priority === 'high' ? 'bg-red-500' : 'bg-slate-300')} />
                                        <span className="text-[9px] font-black uppercase text-slate-400">{deal.priority} PRIORITY</span>
                                    </div>
                                    <ArrowRight size={14} className="text-slate-300" />
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

            {/* Dialogs */}
            {/* View Deal Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
                    <div className="h-28 bg-slate-900 p-8 flex flex-col justify-end relative overflow-hidden">
                        <div className="absolute top-0 right-0 size-40 bg-primary-600/20 rounded-full blur-3xl -mr-20 -mt-20" />
                        <h2 className="text-xl font-black text-white tracking-tight uppercase relative z-10">{selectedDeal?.company || selectedDeal?.name}</h2>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest relative z-10">Sector Operations Overview</p>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Market Valuation</p>
                                <p className="text-xl font-black text-primary-600 leading-none">₹{(selectedDeal?.amount || 0).toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Deployment Stage</p>
                                <Badge className={cn("border-none text-[8px] font-black uppercase h-6 px-2.5 rounded-lg w-fit", getStageColor(selectedDeal?.status))}>
                                    {selectedDeal?.status}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Personnel Linkages</h4>
                            {[
                                { icon: User, label: 'Operator', value: selectedDeal?.name },
                                { icon: Mail, label: 'Hub', value: selectedDeal?.email || 'N/A' },
                                { icon: Phone, label: 'Direct', value: selectedDeal?.mobile || 'N/A' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                        <item.icon size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <DialogFooter className="gap-2 pt-4 border-t border-slate-100">
                            <Button variant="ghost" className="flex-1 h-10 rounded-xl text-red-500 font-black text-[9px] uppercase tracking-widest hover:bg-red-50" onClick={handleDeleteDeal}>
                                Terminate
                            </Button>
                            <Button variant="outline" className="flex-1 h-10 rounded-xl text-primary-600 font-black text-[9px] uppercase tracking-widest" onClick={handleEditDeal}>
                                Recalibrate
                            </Button>
                            <Button className="flex-1 h-10 rounded-xl bg-primary-600 hover:bg-primary-700 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary-500/20" onClick={() => setIsViewOpen(false)}>
                                Exit
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Deal Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden font-sans">
                    <div className="bg-primary-600 p-6 text-white">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Initiate Acquisition</DialogTitle>
                        <p className="text-[9px] font-black text-primary-100 uppercase tracking-[0.2em] mt-1 italic">New marketplace opportunity</p>
                    </div>
                    <div className="p-6 space-y-4 bg-white dark:bg-slate-900">
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entity identifier</Label>
                            <Input
                                value={newDealData.clientName}
                                onChange={(e) => setNewDealData({ ...newDealData, clientName: e.target.value })}
                                className="h-10 rounded-xl bg-slate-50 border-none font-bold text-sm px-4"
                                placeholder="Corporate Name"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Market Valuation</Label>
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
                                        <SelectItem value="high">High Alert</SelectItem>
                                        <SelectItem value="medium">Standard</SelectItem>
                                        <SelectItem value="low">Low Risk</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lifecycle Stage</Label>
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
                            <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="flex-1 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest">Abort</Button>
                            <Button onClick={submitNewDeal} className="flex-1 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest bg-primary-600 hover:bg-primary-700 text-white shadow-lg">Confirm</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Deal Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden font-sans">
                    <div className="bg-slate-900 p-6 text-white">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Recalibrate Parameters</DialogTitle>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Updating tactical metadata</p>
                    </div>
                    <div className="p-6 space-y-4 bg-white dark:bg-slate-900">
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entity name</Label>
                            <Input
                                value={editDealData.name}
                                onChange={(e) => setEditDealData({ ...editDealData, name: e.target.value })}
                                className="h-10 rounded-xl bg-slate-50 border-none font-bold text-sm px-4"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valuation (₹)</Label>
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
                                        <SelectItem value="high">High Alert</SelectItem>
                                        <SelectItem value="medium">Standard</SelectItem>
                                        <SelectItem value="low">Low Risk</SelectItem>
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
                        <DialogFooter className="pt-4 flex gap-3">
                            <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="flex-1 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest">Cancel</Button>
                            <Button onClick={submitEditDeal} className="flex-1 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest bg-slate-900 hover:bg-slate-800 text-white">Apply Sync</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Deals;
