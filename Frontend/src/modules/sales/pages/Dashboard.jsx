import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    IndianRupee,
    Users,
    BarChart3,
    Clock,
    AlertCircle,
    TrendingUp,
    Calendar as CalendarIcon,
    ArrowRight,
    Target,
    Mail,
    Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import useSalesStore from '@/store/salesStore';
import useSalesTargetsStore from '@/store/salesTargetsStore';
import { fadeInUp, staggerContainer } from '@/shared/utils/animations';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';
import useCRMStore from '@/store/crmStore';
import { Badge } from '@/shared/components/ui/badge';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { format, isToday } from 'date-fns';

const SalesDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { salesReps, getSalesRepByEmail } = useSalesStore();
    const { leads, followUps, fetchLeads, fetchFollowUps } = useCRMStore();
    const {
        individualTargets,
        teamTargets,
        actualPerformance,
        calculateIndividualProgress,
        calculateTeamProgress
    } = useSalesTargetsStore();

    const [selectedPeriod, setSelectedPeriod] = useState('monthly');

    React.useEffect(() => {
        fetchLeads();
        fetchFollowUps();
    }, []);

    const salesRep = useMemo(() => {
        return getSalesRepByEmail(user?.email);
    }, [user?.email, getSalesRepByEmail]);

    const realStats = useMemo(() => {
        const myLeads = leads;
        const totalSales = myLeads.filter(l => l.status === 'Won').reduce((sum, l) => sum + (l.amount || 0), 0);
        const potentialRevenue = myLeads.filter(l => l.status === 'Proposal Sent').reduce((sum, l) => sum + (l.amount || 0), 0);
        const activeDeals = myLeads.filter(l => l.status !== 'Won' && l.status !== 'Lost').length;
        const wonCount = myLeads.filter(l => l.status === 'Won').length;
        const lostCount = myLeads.filter(l => l.status === 'Lost').length;
        const totalClosed = wonCount + lostCount;
        const conversionRate = totalClosed > 0 ? Math.round((wonCount / totalClosed) * 100) : 0;
        const clientsCount = new Set(myLeads.filter(l => l.status === 'Won').map(l => l.company || l.name)).size;

        const urgentLeads = myLeads.filter(l => l.priority === 'urgent' || l.priority === 'high').length;
        const highPriorityLeads = myLeads.filter(l => l.priority === 'urgent' || l.priority === 'high')
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 4);

        const highValueDeals = myLeads.filter(l => l.amount > 50000 && l.status !== 'Won' && l.status !== 'Lost')
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 4);

        // Pipeline Data for Recharts
        const stages = ['New', 'Contacted', 'Meeting Done', 'Proposal Sent', 'Won'];
        const pipelineData = stages.map(stage => ({
            name: stage,
            value: myLeads.filter(l => l.status === stage).length
        }));

        // Today's Agenda from Follow-ups
        const todaysAgenda = followUps.filter(f => isToday(new Date(f.scheduledAt)) && f.status === 'Scheduled')
            .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

        return {
            totalSales,
            potentialRevenue,
            activeDeals,
            conversionRate,
            clientsCount,
            urgentLeads,
            highPriorityLeads,
            highValueDeals,
            pipelineData,
            todaysAgenda
        };
    }, [leads, followUps]);

    const targetProgress = useMemo(() => {
        return {
            individual: {
                revenue: calculateIndividualProgress(selectedPeriod, 'revenue'),
                deals: calculateIndividualProgress(selectedPeriod, 'deals'),
                clients: calculateIndividualProgress(selectedPeriod, 'clients')
            },
            team: {
                revenue: calculateTeamProgress(selectedPeriod, 'revenue'),
                deals: calculateTeamProgress(selectedPeriod, 'deals'),
                clients: calculateTeamProgress(selectedPeriod, 'clients')
            },
            actual: actualPerformance[selectedPeriod] || {},
            individualTarget: individualTargets[selectedPeriod] || {},
            teamTarget: teamTargets[selectedPeriod] || {}
        };
    }, [selectedPeriod, individualTargets, teamTargets, actualPerformance, calculateIndividualProgress, calculateTeamProgress]);

    const stats = useMemo(() => [
        {
            title: 'Won Revenue',
            value: `₹${realStats.totalSales.toLocaleString()}`,
            icon: IndianRupee,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            border: 'border-blue-100 dark:border-blue-900',
            shadow: 'shadow-lg shadow-blue-200/50 dark:shadow-none',
            gradient: 'bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-900/20',
            trend: 'Earned',
            label: 'Total Gains'
        },
        {
            title: 'Potential Revenue',
            value: `₹${realStats.potentialRevenue.toLocaleString()}`,
            icon: Target,
            color: 'text-indigo-600',
            bg: 'bg-indigo-100',
            border: 'border-indigo-100 dark:border-indigo-900',
            shadow: 'shadow-lg shadow-indigo-200/50 dark:shadow-none',
            gradient: 'bg-gradient-to-br from-white to-indigo-50 dark:from-slate-900 dark:to-indigo-900/20',
            trend: 'In-Pipeline',
            label: 'Expected'
        },
        {
            title: 'Urgent Ops',
            value: realStats.urgentLeads.toString(),
            icon: AlertCircle,
            color: 'text-red-600',
            bg: 'bg-red-100',
            border: 'border-red-100 dark:border-red-900',
            shadow: 'shadow-lg shadow-red-200/50 dark:shadow-none',
            gradient: 'bg-gradient-to-br from-white to-red-50 dark:from-slate-900 dark:to-red-900/20',
            trend: 'Priority',
            label: 'Action Required'
        },
        {
            title: 'Conversion Rate',
            value: realStats.conversionRate + '%',
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
            border: 'border-emerald-100 dark:border-emerald-900',
            shadow: 'shadow-lg shadow-emerald-200/50 dark:shadow-none',
            gradient: 'bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-900/20',
            trend: 'Efficiency',
            label: 'Success Rate'
        }
    ], [realStats]);

    return (
        <div className="space-y-4 sm:space-y-8 pb-10">
            {/* Header section with refined spacing */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-0.5 sm:space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Command <span className="text-primary-600">Center</span>
                        </h1>
                    </div>
                    <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                        Intelligence feed for <span className="text-slate-900 dark:text-white font-bold">{user?.name}</span> • Real-time telemetry active
                    </p>
                </motion.div>

                <div className="flex items-center gap-2 sm:gap-3">

                </div>
            </div>

            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {stats.map((stat, index) => (
                    <motion.div key={index} variants={fadeInUp}>
                        <Card className={cn(
                            "border-2 rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1",
                            stat.border,
                            stat.shadow,
                            stat.gradient
                        )}>
                            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                                <div className="space-y-3 sm:space-y-4">
                                    <div className={cn(
                                        "size-9 sm:size-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 duration-500 shadow-inner",
                                        stat.bg
                                    )}>
                                        <stat.icon className={cn("size-4.5 sm:size-5", stat.color)} />
                                    </div>
                                    <div className="space-y-0.5 sm:space-y-1">
                                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                        <p className={cn("text-lg sm:text-2xl font-black tracking-tight leading-none", stat.color)}>{stat.value}</p>
                                        <div className="flex items-center gap-1 pt-1">
                                            <div className={cn("flex items-center justify-center size-3.5 rounded-full", stat.bg)}>
                                                <TrendingUp size={10} className={stat.color} />
                                            </div>
                                            <span className={cn("text-[8px] sm:text-[9px] font-black uppercase tracking-tighter", stat.color)}>{stat.trend}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={cn("hidden sm:block size-16 -mr-2 opacity-10 transform rotate-12 transition-transform group-hover:rotate-0 duration-700", stat.color)}>
                                    <stat.icon size={64} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Leads Pipeline Funnel */}
                <motion.div variants={fadeInUp} className="lg:col-span-2">
                    <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-6 sm:p-8 border-b border-slate-50 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="size-2 rounded-full bg-primary-600 animate-pulse" />
                                        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Pipeline Intelligence</CardTitle>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Stage Distribution</h2>
                                </div>
                                <BarChart3 className="text-slate-200 dark:text-slate-800 size-8" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 sm:p-8">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={realStats.pipelineData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 800, fill: '#64748B' }}
                                            dy={10}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            cursor={{ fill: '#F8FAFC' }}
                                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: 'white' }}
                                        />
                                        <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                                            {realStats.pipelineData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 4 ? '#10b981' : '#2563eb'} fillOpacity={0.8 + (index * 0.05)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Action Center - Today's Agenda */}
                <motion.div variants={fadeInUp}>
                    <Card className="h-full border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-slate-900 rounded-[2.5rem] overflow-hidden text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Clock size={120} />
                        </div>
                        <CardHeader className="p-6 sm:p-8 border-b border-white/5 relative z-10">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Action Center</CardTitle>
                                </div>
                                <h2 className="text-2xl font-black tracking-tight">Today's Agenda</h2>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 sm:p-8 space-y-6 relative z-10 overflow-y-auto max-h-[400px] no-scrollbar">
                            {realStats.todaysAgenda.length > 0 ? (
                                realStats.todaysAgenda.map((item, i) => (
                                    <div key={i} className="group flex gap-4 p-4 rounded-3xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer active:scale-95">
                                        <div className="size-12 rounded-2xl bg-primary-500/20 flex flex-col items-center justify-center border border-primary-500/30 overflow-hidden shrink-0">
                                            <span className="text-[10px] font-black uppercase leading-none opacity-60">{format(new Date(item.scheduledAt), 'MMM')}</span>
                                            <span className="text-lg font-black leading-none">{format(new Date(item.scheduledAt), 'dd')}</span>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest px-2 h-4 border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
                                                    {item.type}
                                                </Badge>
                                                <span className="text-[10px] font-black text-slate-500">{format(new Date(item.scheduledAt), 'hh:mm a')}</span>
                                            </div>
                                            <p className="text-sm font-black text-white/90 truncate">{item.leadId?.name || 'Unassigned Lead'}</p>
                                            <p className="text-[10px] font-bold text-slate-400 truncate opacity-60 leading-none">{item.notes || 'No specific notes'}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                    <CalendarIcon size={48} className="text-slate-600 mb-4" />
                                    <p className="text-xs font-black uppercase tracking-[0.2em]">Zero Operations</p>
                                    <p className="text-[10px] font-bold mt-1 italic">Scan complete. All clear.</p>
                                </div>
                            )}

                            {realStats.todaysAgenda.length > 0 && (
                                <Button variant="ghost" className="w-full h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest gap-2">
                                    View Full Schedule <ArrowRight size={14} />
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Smart Revenue & Urgent Ops Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* High Priority Matrix */}
                <motion.div variants={fadeInUp}>
                    <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-6 sm:p-8 border-b border-slate-50 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="size-2 rounded-full bg-red-600 animate-pulse" />
                                        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Urgent Ops Matrix</CardTitle>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Priority Intercepts</h2>
                                </div>
                                <Shield className="text-red-100 dark:text-red-900/20 size-8" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                {realStats.highPriorityLeads.length > 0 ? (
                                    realStats.highPriorityLeads.map((lead, i) => (
                                        <div key={i} className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 font-black text-xs">
                                                    {lead.priority?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{lead.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{lead.company || 'Private Lead'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-slate-900 dark:text-white">₹{lead.amount?.toLocaleString()}</p>
                                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[8px] font-black uppercase border-none h-4">
                                                    {lead.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center">
                                        <div className="size-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4 border-4 border-emerald-100 dark:border-emerald-900/30">
                                            <Shield className="text-emerald-500" size={24} />
                                        </div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white">All Clear</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">No Urgent Intercepts Required</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Smart Revenue Tracking - High Value Deals */}
                <motion.div variants={fadeInUp}>
                    <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-6 sm:p-8 border-b border-slate-50 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="size-2 rounded-full bg-indigo-600 animate-pulse" />
                                        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Smart Revenue Tracking</CardTitle>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">High Value Assets</h2>
                                </div>
                                <TrendingUp className="text-indigo-100 dark:text-indigo-900/20 size-8" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                {realStats.highValueDeals.length > 0 ? (
                                    realStats.highValueDeals.map((lead, i) => (
                                        <div key={i} className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                                    <IndianRupee size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{lead.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{lead.status}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-indigo-600">₹{lead.amount?.toLocaleString()}</p>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Expected Value</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center opacity-40">
                                        <Target size={48} className="mx-auto text-slate-300 mb-4" />
                                        <p className="text-xs font-black uppercase tracking-[0.2em]">No High Value Active Deals</p>
                                        <p className="text-[10px] font-bold mt-1">Acquire more leads to track revenue intelligence</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>




        </div>
    );
};

export default SalesDashboard;
