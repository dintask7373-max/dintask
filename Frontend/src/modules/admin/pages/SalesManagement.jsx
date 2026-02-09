import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Briefcase,
    TrendingUp,
    IndianRupee,
    Users,
    Download,
    Shield,
    Filter,
    MoreHorizontal,
    Calendar,
    Building2,
    UserCircle
} from 'lucide-react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import useSalesStore from '@/store/salesStore';
import useCRMStore from '@/store/crmStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/shared/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/utils/cn';
import { format } from 'date-fns';
import { toast } from 'sonner';

import useAuthStore from '@/store/authStore';
import useEmployeeStore from '@/store/employeeStore';
import useManagerStore from '@/store/managerStore'; // Kept in case required by other logic, though we replaced 'managers' usage with employees filter in principle.


const SalesManagement = () => {
    const { salesReps, fetchSalesReps, addSalesRep, updateSalesRep, deleteSalesRep } = useSalesStore();
    const { leads, getPipelineData, moveLead, addLead, assignLead, requestProjectConversion, fetchLeads } = useCRMStore();
    const { employees, fetchSubscriptionLimit, limitStatus } = useEmployeeStore();
    const { managers } = useManagerStore();
    const { user } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddRepModalOpen, setIsAddRepModalOpen] = useState(false);
    const [isAddDealModalOpen, setIsAddDealModalOpen] = useState(false);
    const [newRepData, setNewRepData] = useState({ name: '', email: '' });
    const [newDealData, setNewDealData] = useState({
        name: '',
        company: '',
        amount: '',
        priority: 'medium',
        stage: 'New',
        owner: '',
        email: ''
    });

    const [parent] = useAutoAnimate();
    const [pipelineSearchTerm, setPipelineSearchTerm] = useState('');

    React.useEffect(() => {
        const loadData = async () => {
            await fetchSalesReps();
            await fetchLeads();
            await fetchSubscriptionLimit();
        };
        loadData();
    }, []);

    // Limit tracking - use real data from backend
    const EMPLOYEE_LIMIT = limitStatus?.limit || user?.planDetails?.userLimit || 2;
    const currentCount = limitStatus?.current || employees.length;
    const isLimitReached = limitStatus?.allowed === false || currentCount >= EMPLOYEE_LIMIT;

    const filteredReps = useMemo(() => {
        return salesReps.filter(rep =>
            rep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rep.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [salesReps, searchTerm]);

    const pipelineData = getPipelineData();
    const processedPipeline = useMemo(() => {
        return pipelineData.map(column => {
            const filteredLeads = column.leads.filter(lead => {
                if (!lead) return false;
                const matchesSearch = lead.name.toLowerCase().includes(pipelineSearchTerm.toLowerCase()) ||
                    lead.company.toLowerCase().includes(pipelineSearchTerm.toLowerCase());
                return matchesSearch;
            });
            return { ...column, leads: filteredLeads };
        });
    }, [pipelineData, pipelineSearchTerm]);


    const handleAddRep = async (e) => {
        e.preventDefault();

        if (isLimitReached) {
            toast.error(limitStatus?.error || 'Subscription limit reached. Please upgrade your plan.');
            return;
        }

        try {
            await addSalesRep(newRepData);
            setNewRepData({ name: '', email: '' });
            setIsAddRepModalOpen(false);
            // Refresh limit status
            await fetchSubscriptionLimit();
        } catch (error) {
            // error handled in store
            if (error.message && error.message.includes('limit')) {
                await fetchSubscriptionLimit();
            }
        }
    };

    const handleExport = () => {
        try {
            const dataToExport = filteredReps.map(rep => ({
                'Name': rep.name,
                'Email': rep.email,
                'Phone': rep.phoneNumber || 'N/A',
                'Status': rep.status || 'Active',
                'Total Sales': rep.totalSales || 0,
                'Active Deals': rep.activeDeals || 0,
                'Conversion Rate (%)': rep.conversionRate || 0,
                'Joined Date': rep.createdAt ? new Date(rep.createdAt).toLocaleDateString() : 'N/A'
            }));

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sales Representatives");

            // Generate Excel file and trigger download
            XLSX.writeFile(wb, "Sales_Representatives.xlsx");
            toast.success("Export successful");
        } catch (error) {
            console.error("Export Error:", error);
            toast.error("Failed to export data");
        }
    };

    const handleAddDeal = () => {
        if (!newDealData.name || !newDealData.company) {
            toast.error("Name and Company are required");
            return;
        }

        const deal = {
            ...newDealData,
            amount: parseFloat(newDealData.amount) || 0,
            createdAt: new Date().toISOString(),
            status: newDealData.stage
        };

        const addedLead = addLead(deal);
        if (newDealData.stage !== 'New') {
            moveLead(addedLead.id, 'New', newDealData.stage);
        }

        setIsAddDealModalOpen(false);
        setNewDealData({
            name: '', company: '', amount: '', priority: 'medium', stage: 'New', owner: '', email: ''
        });
        toast.success("New deal created and assigned");
    };

    const getRepName = (id) => {
        const rep = salesReps.find(r => r.id === id);
        return rep ? rep.name : 'Unassigned';
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const startStage = source.droppableId;
        const finishStage = destination.droppableId;

        moveLead(draggableId, startStage, finishStage);
        toast.success(`Moved to ${finishStage}`);
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 px-1 sm:px-0">
                    <div className="lg:hidden w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                        <img src="/dintask-logo.png" alt="DinTask" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Sales <span className="text-primary-600">Management</span></h1>
                        <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1 uppercase">Team & Pipeline Control</p>
                    </div>
                </div>
            </div>

            {/* Subscription Alert */}
            <div className="bg-blue-50/30 border border-blue-100/50 dark:bg-blue-900/10 dark:border-blue-900/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-2 flex items-center gap-3">
                <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                <p className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-400 font-bold uppercase tracking-widest">
                    Used <span className="text-blue-900 dark:text-white">{currentCount}</span> / <span className="text-blue-900 dark:text-white">{EMPLOYEE_LIMIT}</span> platform slots.
                    {isLimitReached && <span className="ml-2 text-red-500 animate-pulse">Limit reached!</span>}
                </p>
            </div>

            <Tabs defaultValue="team" className="space-y-4 sm:space-y-6">
                <TabsList className="bg-white dark:bg-slate-900 p-1 border border-slate-100 dark:border-slate-800 rounded-xl h-auto w-full sm:w-auto">
                    <TabsTrigger value="team" className="flex-1 sm:flex-none rounded-lg px-4 sm:px-8 py-2 data-[state=active]:bg-primary-50 data-[state=active]:text-primary-700 font-black text-[10px] sm:text-xs uppercase tracking-widest">Team</TabsTrigger>
                    <TabsTrigger value="pipeline" className="flex-1 sm:flex-none rounded-lg px-4 sm:px-8 py-2 data-[state=active]:bg-primary-50 data-[state=active]:text-primary-700 font-black text-[10px] sm:text-xs uppercase tracking-widest">Pipeline</TabsTrigger>
                </TabsList>

                <TabsContent value="team" className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                        {[
                            { label: 'Total Reps', value: salesReps.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'Active Deals', value: salesReps.reduce((acc, curr) => acc + (curr.activeDeals || 0), 0), icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Revenue', value: `₹${(salesReps.reduce((acc, curr) => acc + (curr.totalSales || 0), 0) / 1000).toFixed(0)}K`, icon: IndianRupee, color: 'text-purple-600', bg: 'bg-purple-50' },
                            { label: 'Conversion', value: `${salesReps.length > 0 ? (salesReps.reduce((acc, curr) => acc + (curr.conversionRate || 0), 0) / salesReps.length).toFixed(0) : 0}%`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' }
                        ].map((stat, i) => (
                            <Card key={i} className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
                                <CardContent className="p-3 sm:p-4 flex items-center gap-2.5 sm:gap-4">
                                    <div className={cn("p-2 sm:p-3 rounded-xl sm:rounded-2xl shrink-0", stat.bg)}>
                                        <stat.icon size={16} className={stat.color} />
                                    </div>
                                    <div className="text-left min-w-0">
                                        <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{stat.label}</p>
                                        <p className="text-sm sm:text-xl font-black text-slate-900 dark:text-white truncate">{stat.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="relative w-full sm:w-[250px] lg:w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <Input
                                placeholder="Search representatives..."
                                className="pl-9 h-9 sm:h-10 bg-slate-50 border-none dark:bg-slate-800 rounded-xl text-xs font-bold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                variant="ghost"
                                onClick={handleExport}
                                className="flex-1 sm:flex-none gap-2 border border-slate-100 dark:border-slate-800 h-9 sm:h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"
                            >
                                <Download size={14} />
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                            <Button
                                onClick={() => setIsAddRepModalOpen(true)}
                                disabled={isLimitReached}
                                className="flex-1 sm:flex-none gap-2 bg-primary-600 hover:bg-primary-700 h-9 sm:h-10 rounded-xl shadow-lg shadow-primary-500/20 text-[10px] font-black uppercase tracking-widest"
                            >
                                <Plus size={14} />
                                <span>Add Rep</span>
                            </Button>
                        </div>
                    </div>

                    <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden">
                        <div className="overflow-x-auto hidden lg:block">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Representative</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Deals</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Sales</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Conversion</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody ref={parent}>
                                    {filteredReps.map((rep) => (
                                        <tr key={rep._id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border-2 border-white dark:border-slate-800 shadow-sm shrink-0">
                                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${rep.name}`} />
                                                        <AvatarFallback className="bg-primary-50 text-primary-600 font-black text-xs">{rep.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <p className="font-black text-slate-900 dark:text-white leading-tight text-xs truncate">{rep.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium truncate">{rep.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Briefcase size={12} className="text-slate-400" />
                                                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 tracking-tight">{rep.activeDeals || 0} Deals</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <IndianRupee size={12} className="text-emerald-500 stroke-[2.5px]" />
                                                    <span className="text-xs font-black text-emerald-600 tracking-tight">₹{(rep.totalSales || 0).toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge className="rounded-lg font-black text-[9px] bg-slate-50 dark:bg-slate-800 text-slate-500 border-none shadow-none uppercase tracking-widest">
                                                    {rep.conversionRate || 0}%
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("h-1.5 w-1.5 rounded-full", rep.status === 'active' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300")} />
                                                    <span className={cn("text-[10px] font-black uppercase tracking-widest", rep.status === 'active' ? "text-emerald-600" : "text-slate-400")}> {rep.status || 'Pending'} </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"> <Edit2 size={12} /> </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => deleteSalesRep(rep._id || rep.id)}> <Trash2 size={12} /> </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List Card View */}
                        <div className="lg:hidden p-3 space-y-3">
                            {filteredReps.map((rep) => (
                                <div key={rep._id} className="p-4 rounded-2xl bg-slate-50/30 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${rep.name}`} />
                                                <AvatarFallback className="bg-primary-50 text-primary-600 font-black">{rep.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-black text-slate-900 dark:text-white leading-tight">{rep.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{rep.email}</p>
                                            </div>
                                        </div>
                                        <Badge
                                            className={cn(
                                                "text-[8px] font-black uppercase tracking-widest h-5 px-2 shadow-none border-none",
                                                rep.status === 'active' ? 'bg-emerald-100/50 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                            )}
                                        >
                                            {rep.status || 'Pending'}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 p-3 bg-white dark:bg-slate-900/50 rounded-xl shadow-sm border border-slate-100/50 dark:border-slate-800/50">
                                        <div className="space-y-0.5">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Sales</p>
                                            <p className="text-xs font-black text-emerald-600 tracking-tight flex items-center gap-1">
                                                <IndianRupee size={10} className="stroke-[3.5px]" />
                                                {(rep.totalSales || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Efficiency</p>
                                            <p className="text-xs font-black text-primary-600 tracking-tight">{rep.conversionRate || 0}% Conv.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex items-center gap-2">
                                            <Briefcase size={12} className="text-slate-300" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{rep.activeDeals || 0} Open Deals</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm"> <Edit2 size={12} /> </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm" onClick={() => deleteSalesRep(rep._id || rep.id)}> <Trash2 size={12} className="text-red-400" /> </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>


                <TabsContent value="pipeline" className="space-y-4 sm:space-y-6">
                    {/* Search and Add Deal Button (unchanged) */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="relative w-full sm:w-[300px] lg:w-[350px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <Input
                                placeholder="Search deals..."
                                className="pl-9 h-9 sm:h-10 bg-slate-50 border-none dark:bg-slate-800 rounded-xl text-xs font-bold"
                                value={pipelineSearchTerm}
                                onChange={(e) => setPipelineSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => setIsAddDealModalOpen(true)} className="w-full sm:w-auto gap-2 bg-primary-600 hover:bg-primary-700 h-9 sm:h-10 rounded-xl shadow-lg shadow-primary-500/20 text-[10px] font-black uppercase tracking-widest px-6">
                            <Plus size={14} />
                            <span>Add Deal</span>
                        </Button>
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="flex overflow-x-auto pb-4 gap-4 custom-scrollbar">
                            {processedPipeline.map(({ stage, leads: stageLeads }) => (
                                <div key={stage} className="flex flex-col w-[260px] sm:w-[280px] bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800 h-full max-h-[calc(100vh-320px)] min-h-[450px]">
                                    <div className="p-3 border-b border-slate-100 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-t-2xl sticky top-0 z-10">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300">{stage}</h3>
                                            <Badge variant="outline" className="h-5 text-[9px] font-black bg-white dark:bg-slate-800 border-none shadow-none">
                                                {stageLeads.length}
                                            </Badge>
                                        </div>
                                        <div className="h-0.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className={cn("h-full transition-all duration-500",
                                                stage === 'Won' ? 'bg-emerald-500' :
                                                    stage === 'Lost' ? 'bg-red-500' : 'bg-primary-500'
                                            )} style={{ width: '100%' }} />
                                        </div>
                                    </div>
                                    <Droppable droppableId={stage}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={cn(
                                                    "flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar min-h-[100px] transition-colors",
                                                    snapshot.isDraggingOver ? "bg-slate-100 dark:bg-slate-800/50 rounded-b-2xl" : ""
                                                )}
                                            >
                                                {stageLeads.length === 0 && !snapshot.isDraggingOver ? (
                                                    <div className="flex flex-col items-center justify-center h-20 text-slate-300 text-[10px] font-black uppercase tracking-widest border-2 border-dashed border-slate-100/50 dark:border-slate-800/30 rounded-xl">
                                                        Empty
                                                    </div>
                                                ) : (
                                                    stageLeads.map((lead, index) => (
                                                        <Draggable key={lead._id || lead.id} draggableId={lead._id || lead.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={cn(
                                                                        "bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 group hover:shadow-md transition-all relative overflow-hidden select-none",
                                                                        snapshot.isDragging ? "shadow-xl ring-2 ring-primary-500 rotate-2 z-50 bg-white" : ""
                                                                    )}
                                                                    style={{ ...provided.draggableProps.style }}
                                                                >
                                                                    {/* Card Content same as before */}
                                                                    <div className="absolute top-0 right-0 w-12 h-12 bg-slate-50/50 dark:bg-slate-800/30 rounded-bl-full -mr-6 -mt-6 group-hover:scale-110 transition-transform" />

                                                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                                                        <Badge className={cn("text-[8px] uppercase font-black px-1.5 py-0 border-none shadow-none", getPriorityColor(lead.priority))}>
                                                                            {lead.priority}
                                                                        </Badge>

                                                                        {stage === 'Won' && (
                                                                            lead.approvalStatus === 'pending_project' ? (
                                                                                <Badge variant="outline" className="text-[8px] h-5 bg-amber-50 text-amber-600 border-amber-200">Pending Project</Badge>
                                                                            ) : lead.approvalStatus === 'approved_project' ? (
                                                                                <Badge variant="outline" className="text-[8px] h-5 bg-emerald-50 text-emerald-600 border-emerald-200">Active Project</Badge>
                                                                            ) : (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    className="h-5 text-[8px] px-2 bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation(); // prevent drag interference if button clicked
                                                                                        requestProjectConversion(lead.id);
                                                                                        toast.success("Project conversion requested sent to Admin");
                                                                                    }}
                                                                                    onMouseDown={(e) => e.stopPropagation()} // Important for button inside draggable
                                                                                >
                                                                                    Request Project
                                                                                </Button>
                                                                            )
                                                                        )}

                                                                        {stage !== 'Won' && (
                                                                            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1.5 text-slate-300 hover:text-slate-600 rounded-lg">
                                                                                <MoreHorizontal size={12} />
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                    <h4 className="font-black text-slate-900 dark:text-white text-[11px] mb-1 line-clamp-1 relative z-10 uppercase tracking-tight">{lead.name}</h4>
                                                                    <div className="flex items-center gap-1 text-[9px] text-slate-400 mb-3 relative z-10 font-bold tracking-wide">
                                                                        <Building2 size={10} className="text-slate-300" />
                                                                        <span className="truncate">{lead.company}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 mb-3 relative z-10">
                                                                        <Avatar className="h-4 w-4 border border-white dark:border-slate-800 shrink-0">
                                                                            <AvatarFallback className="text-[7px] font-black bg-primary-50 text-primary-600 uppercase">{getRepName(lead.owner).charAt(0)}</AvatarFallback>
                                                                        </Avatar>
                                                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest truncate">{getRepName(lead.owner)}</span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-50 dark:border-slate-800 relative z-10">
                                                                        <div className="flex items-center gap-0.5 text-primary-600 font-black text-[11px] tracking-tight">
                                                                            <IndianRupee size={10} className="stroke-[3.5px]" />
                                                                            {Number(lead.amount || 0).toLocaleString()}
                                                                        </div>
                                                                        <div className="flex items-center gap-1 text-[8px] text-slate-300 font-black uppercase tracking-widest">
                                                                            <Calendar size={9} />
                                                                            {lead.deadline ? format(new Date(lead.deadline), 'MMM d') : '—'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))
                                                )}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            ))}
                        </div>
                    </DragDropContext>
                </TabsContent>
            </Tabs>

            {/* Add Rep Dialog */}
            <Dialog open={isAddRepModalOpen} onOpenChange={setIsAddRepModalOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle>Add New Sales Rep</DialogTitle>
                        <DialogDescription>Create a new sales representative account.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddRep} className="space-y-4 py-4">
                        <div className="grid gap-2 text-left">
                            <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                            <Input value={newRepData.name} onChange={(e) => setNewRepData({ ...newRepData, name: e.target.value })} placeholder="Rep Name" className="rounded-xl h-11" required />
                        </div>
                        <div className="grid gap-2 text-left">
                            <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                            <Input type="email" value={newRepData.email} onChange={(e) => setNewRepData({ ...newRepData, email: e.target.value })} placeholder="sales@dintask.com" className="rounded-xl h-11" required />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsAddRepModalOpen(false)} className="rounded-xl h-11 px-6">Cancel</Button>
                            <Button type="submit" className="rounded-xl h-11 px-6 bg-primary-600 hover:bg-primary-700">Add Rep</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Add Deal Dialog */}
            <Dialog open={isAddDealModalOpen} onOpenChange={setIsAddDealModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Deal</DialogTitle>
                        <DialogDescription>Create a new deal and assign it to a team member.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Deal Name</Label>
                            <Input id="name" value={newDealData.name} onChange={(e) => setNewDealData({ ...newDealData, name: e.target.value })} placeholder="e.g. Website Redesign" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="company">Company</Label>
                            <Input id="company" value={newDealData.company} onChange={(e) => setNewDealData({ ...newDealData, company: e.target.value })} placeholder="Client Company" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Value (₹)</Label>
                                <Input id="amount" type="number" value={newDealData.amount} onChange={(e) => setNewDealData({ ...newDealData, amount: e.target.value })} placeholder="50000" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select value={newDealData.priority} onValueChange={(val) => setNewDealData({ ...newDealData, priority: val })}>
                                    <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="owner">Assign To</Label>
                            <Select value={newDealData.owner} onValueChange={(val) => setNewDealData({ ...newDealData, owner: val })}>
                                <SelectTrigger><SelectValue placeholder="Select Sales Rep" /></SelectTrigger>
                                <SelectContent>
                                    {salesReps.map(rep => (
                                        <SelectItem key={rep.id} value={rep.id}>{rep.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDealModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddDeal}>Create Deal</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SalesManagement;
