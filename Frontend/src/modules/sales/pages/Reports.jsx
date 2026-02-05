import React, { useState, useMemo } from 'react';
import { BarChart3, PieChart, LineChart, Download, Filter, Search, TrendingUp, TrendingDown, Target, Users, FileText, Clock, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import useAuthStore from '@/store/authStore';
import useSalesStore from '@/store/salesStore';
import useSalesTargetsStore from '@/store/salesTargetsStore';

import useCRMStore from '@/store/crmStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const SalesReports = () => {
    const { user } = useAuthStore();
    const { salesReps, getSalesRepByEmail } = useSalesStore();
    const { leads } = useCRMStore();
    const {
        individualTargets,
        teamTargets,
        actualPerformance,
        calculateIndividualProgress,
        calculateTeamProgress,
        getIndividualTargetsByPeriod,
        getTeamTargetsByPeriod,
        getActualPerformanceByPeriod
    } = useSalesTargetsStore();

    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [filters, setFilters] = useState({ status: 'all', type: 'all' });
    const [targetPeriod, setTargetPeriod] = useState('monthly');
    const [activeTab, setActiveTab] = useState('revenue');

    const salesRep = useMemo(() => {
        return getSalesRepByEmail(user?.email);
    }, [user?.email, getSalesRepByEmail]);

    const reportingToTargetPeriod = {
        week: 'monthly',
        month: 'monthly',
        quarter: 'quarterly',
        year: 'yearly'
    };

    const targetReportData = useMemo(() => {
        const mappedPeriod = reportingToTargetPeriod[selectedPeriod] || 'monthly';
        return {
            individual: {
                revenue: calculateIndividualProgress(mappedPeriod, 'revenue'),
                deals: calculateIndividualProgress(mappedPeriod, 'deals'),
                clients: calculateIndividualProgress(mappedPeriod, 'clients')
            },
            team: {
                revenue: calculateTeamProgress(mappedPeriod, 'revenue'),
                deals: calculateTeamProgress(mappedPeriod, 'deals'),
                clients: calculateTeamProgress(mappedPeriod, 'clients')
            },
            individualTarget: getIndividualTargetsByPeriod(mappedPeriod),
            teamTarget: getTeamTargetsByPeriod(mappedPeriod),
            actual: getActualPerformanceByPeriod(mappedPeriod)
        };
    }, [selectedPeriod, calculateIndividualProgress, calculateTeamProgress, getIndividualTargetsByPeriod, getTeamTargetsByPeriod, getActualPerformanceByPeriod]);

    const reportMetrics = useMemo(() => {
        let filteredLeads = leads;

        const totalRevenue = filteredLeads
            .filter(l => l.status === 'Won')
            .reduce((sum, l) => sum + (l.amount || 0), 0);

        const totalDeals = filteredLeads.length;
        const wonDealsCount = filteredLeads.filter(l => l.status === 'Won').length;

        const avgDealValue = totalDeals > 0 ? Math.round(filteredLeads.reduce((sum, l) => sum + (l.amount || 0), 0) / totalDeals) : 0;

        return {
            totalRevenue,
            totalDeals,
            avgDealValue,
            revenueChange: '+18.4%',
            dealsChange: '+12.5%',
            avgValueChange: '+5.2%'
        };
    }, [salesRep, selectedPeriod, leads]);

    const handleExport = () => {
        const rows = [
            ["ID", "Name", "Company", "Amount", "Status", "Created At"],
            ...leads.map(l => [
                l.id,
                `"${l.name}"`,
                `"${l.company}"`,
                l.amount || 0,
                l.status,
                l.createdAt ? l.createdAt.split('T')[0] : ''
            ])
        ];

        const csvContent = "data:text/csv;charset=utf-8,"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sales_report_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Intelligence report exported");
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-4 sm:space-y-6 pb-10">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1 mb-2">
                <div className="flex items-center gap-3">
                    <div className="lg:hidden size-9 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                        <img src="/src/assets/dintask_logo_-removebg-preview.png" alt="DinTask" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                            Intelligence <span className="text-primary-600">Analytics</span>
                        </h1>
                        <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-1 leading-none">
                            Decipher performance trends
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="flex-1 sm:w-[130px] h-9 bg-white dark:bg-slate-900 border-none rounded-xl font-black text-[9px] uppercase tracking-widest px-3 shadow-sm ring-offset-0 focus:ring-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                            <SelectItem value="week" className="text-[10px] font-bold">Week</SelectItem>
                            <SelectItem value="month" className="text-[10px] font-bold">Month</SelectItem>
                            <SelectItem value="quarter" className="text-[10px] font-bold">Quarter</SelectItem>
                            <SelectItem value="year" className="text-[10px] font-bold">Annual</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="default"
                        className="h-9 px-4 gap-2 shadow-lg shadow-primary-500/20 bg-primary-600 hover:bg-primary-700 rounded-xl font-black text-[9px] uppercase tracking-widest text-white transition-all transform active:scale-95"
                        onClick={handleExport}
                    >
                        <Download size={14} />
                        <span className="hidden sm:inline">Export Intelligence</span>
                        <span className="sm:hidden">Export</span>
                    </Button>
                </div>
            </div>

            {/* Summary Grid - Premium Look */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
                {[
                    { label: 'Revenue Velocity', value: `â‚¹${reportMetrics.totalRevenue.toLocaleString()}`, change: reportMetrics.revenueChange, icon: <IndianRupee size={16} />, color: 'primary' },
                    { label: 'Tactical Wins', value: reportMetrics.totalDeals, change: reportMetrics.dealsChange, icon: <Target size={16} />, color: 'emerald' },
                    { label: 'Mean Value', value: `â‚¹${reportMetrics.avgDealValue.toLocaleString()}`, change: reportMetrics.avgValueChange, icon: <TrendingUp size={16} />, color: 'blue' }
                ].map((stat, i) => (
                    <Card key={i} className={cn(
                        "border-none shadow-sm sm:shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden group",
                        i === 2 ? "col-span-2 sm:col-span-1" : ""
                    )}>
                        <CardContent className="p-3 sm:p-5 flex items-center justify-between">
                            <div className="space-y-2.5 sm:space-y-3">
                                <div className={cn(
                                    "size-8 sm:size-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0",
                                    stat.color === 'primary' ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20" :
                                        stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" :
                                            "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                                )}>
                                    {React.cloneElement(stat.icon, { size: 14, className: "sm:size-4" })}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                    <p className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{stat.value}</p>
                                    <div className="flex items-center gap-1.5 pt-1">
                                        <div className="flex items-center justify-center size-3 sm:size-3.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                                            <TrendingUp size={7} className="sm:size-2" />
                                        </div>
                                        <span className="text-[7px] sm:text-[8px] font-black text-emerald-600 uppercase tracking-widest">{stat.change} Acceleration</span>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden sm:block size-16 -mr-4 opacity-[0.03] dark:opacity-[0.07] transform rotate-12 transition-transform group-hover:rotate-0">
                                {React.cloneElement(stat.icon, { size: 64 })}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="revenue" className="w-full" onValueChange={setActiveTab}>
                <div className="mb-4 px-1 overflow-x-auto scrollbar-hide">
                    <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl h-10 border border-slate-100 dark:border-slate-800 w-fit sm:w-auto">
                        {['revenue', 'deals', 'clients', 'targets'].map((tab) => (
                            <TabsTrigger
                                key={tab}
                                value={tab}
                                className="px-4 sm:px-5 h-8 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-primary-600 data-[state=active]:shadow-sm whitespace-nowrap"
                            >
                                {tab}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <TabsContent value="revenue" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                        <CardHeader className="py-4 px-6 border-b border-slate-50 dark:border-slate-800">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-0.5">
                                    <CardTitle className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Revenue Trajectory</CardTitle>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic pl-0.5">Financial infrastructure breakdown</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100/50 dark:border-emerald-800/50">
                                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest text-center leading-none mb-0.5">Efficiency</p>
                                        <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 text-center uppercase">92.4%</p>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="h-[280px] sm:h-[350px] flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800/50 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent transition-opacity opacity-0 group-hover:opacity-100" />
                                <div className="text-center z-10 p-6">
                                    <div className="size-16 rounded-[1.5rem] bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center mx-auto mb-4 transform transition-transform group-hover:scale-110">
                                        <BarChart3 className="size-8 text-primary-600" />
                                    </div>
                                    <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Neural Projection Matrix</p>
                                    <p className="text-[8px] text-slate-400 font-black mt-2 max-w-[200px] leading-relaxed uppercase tracking-wider">Analyzing historical revenue flows for optimization strategies.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="targets" className="mt-0 focus-visible:outline-none focus-visible:ring-0 space-y-4">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {/* Individual Targets - Refined */}
                        <Card className="border-none shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                            <CardHeader className="py-2.5 sm:py-3 px-3 sm:px-6 border-b border-slate-50 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="hidden sm:flex size-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 items-center justify-center text-primary-600">
                                            <Target size={14} />
                                        </div>
                                        <CardTitle className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Neural Tasking</CardTitle>
                                    </div>
                                    <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-400 border-none rounded-lg font-black text-[7px] sm:text-[8px] uppercase tracking-widest px-1.5 sm:px-2 py-0.5 whitespace-nowrap">
                                        {targetPeriod}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                                {['revenue', 'deals', 'clients'].map((metric) => {
                                    const progress = calculateIndividualProgress(targetPeriod, metric);
                                    const target = getIndividualTargetsByPeriod(targetPeriod)[metric];
                                    const actual = getActualPerformanceByPeriod(targetPeriod)[metric];

                                    return (
                                        <div key={metric} className="space-y-1.5 sm:space-y-2">
                                            <div className="flex items-end justify-between px-0.5">
                                                <div className="space-y-0.5">
                                                    <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest">{metric}</p>
                                                    <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">
                                                        {metric === 'revenue' ? `â‚¹${(actual / 1000).toFixed(1)}k` : actual}
                                                    </p>
                                                </div>
                                                <p className="hidden sm:block text-[8px] font-black text-slate-400 uppercase tracking-widest">of {metric === 'revenue' ? `â‚¹${target?.toLocaleString()}` : target}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <Progress value={progress} className="h-1 sm:h-1.5 bg-slate-50 dark:bg-slate-800" />
                                                <div className="flex justify-between items-center px-0.5">
                                                    <span className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest">Comp.</span>
                                                    <span className="text-[8px] sm:text-[9px] font-black text-primary-600 uppercase tracking-widest">{progress}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        {/* Team Progress - Modernized */}
                        <Card className="border-none shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                            <CardHeader className="py-2.5 sm:py-3 px-3 sm:px-6 border-b border-slate-50 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="hidden sm:flex size-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 items-center justify-center text-emerald-600">
                                            <Users size={14} />
                                        </div>
                                        <CardTitle className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Squad Synergy</CardTitle>
                                    </div>
                                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-400 border-none rounded-lg font-black text-[7px] sm:text-[8px] uppercase tracking-widest px-1.5 sm:px-2 py-0.5 whitespace-nowrap">
                                        Sector Avg
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                                {['revenue', 'deals', 'clients'].map((metric) => {
                                    const progress = calculateTeamProgress(targetPeriod, metric);
                                    const target = getTeamTargetsByPeriod(targetPeriod)[metric];
                                    const actual = getActualPerformanceByPeriod(targetPeriod)[metric];

                                    return (
                                        <div key={metric} className="space-y-1.5 sm:space-y-2">
                                            <div className="flex items-end justify-between px-0.5">
                                                <div className="space-y-0.5">
                                                    <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest">{metric}</p>
                                                    <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">
                                                        {metric === 'revenue' ? `â‚¹${(actual / 1000).toFixed(1)}k` : actual}
                                                    </p>
                                                </div>
                                                <p className="hidden sm:block text-[8px] font-black text-slate-400 uppercase tracking-widest">of {metric === 'revenue' ? `â‚¹${target?.toLocaleString()}` : target}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <Progress value={progress} indicatorClassName="bg-emerald-500" className="h-1 sm:h-1.5 bg-slate-50 dark:bg-slate-800" />
                                                <div className="flex justify-between items-center px-0.5">
                                                    <span className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest">Deploy.</span>
                                                    <span className="text-[8px] sm:text-[9px] font-black text-emerald-600 uppercase tracking-widest">{progress}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Fallback for other tabs */}
                {['deals', 'clients'].includes(activeTab) && (
                    <TabsContent value={activeTab} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                            <CardContent className="p-16 text-center">
                                <div className="size-16 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                    <Clock className="size-8 text-slate-400" />
                                </div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Sector Analytics pending</h3>
                                <p className="text-[9px] text-slate-400 font-black mt-2 uppercase tracking-widest">Aggregating real-time data from neural nodes...</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
};

export default SalesReports;
