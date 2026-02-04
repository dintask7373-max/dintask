import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    IndianRupee,
    Users,
    BarChart3,
    Clock,
    AlertCircle,
    TrendingUp,
    Calendar as CalendarIcon,
    ArrowRight,
    Target,
    Users as UsersIcon,
    Plus,
    User
} from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import useSalesStore from '@/store/salesStore';
import useSalesTargetsStore from '@/store/salesTargetsStore';
import { fadeInUp, staggerContainer } from '@/shared/utils/animations';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { cn } from '@/shared/utils/cn';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import useCRMStore from '@/store/crmStore';
import { Badge } from '@/shared/components/ui/badge';

const SalesDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { salesReps, getSalesRepByEmail } = useSalesStore();
    const { leads } = useCRMStore();
    const {
        individualTargets,
        teamTargets,
        actualPerformance,
        calculateIndividualProgress,
        calculateTeamProgress
    } = useSalesTargetsStore();

    const [selectedPeriod, setSelectedPeriod] = useState('monthly');

    const salesRep = useMemo(() => {
        return getSalesRepByEmail(user?.email);
    }, [user?.email, getSalesRepByEmail]);

    const realStats = useMemo(() => {
        const myLeads = leads;
        const totalSales = myLeads.filter(l => l.status === 'Won').reduce((sum, l) => sum + (l.amount || 0), 0);
        const activeDeals = myLeads.filter(l => l.status !== 'Won' && l.status !== 'Lost').length;
        const wonCount = myLeads.filter(l => l.status === 'Won').length;
        const lostCount = myLeads.filter(l => l.status === 'Lost').length;
        const totalClosed = wonCount + lostCount;
        const conversionRate = totalClosed > 0 ? Math.round((wonCount / totalClosed) * 100) : 0;
        const clientsCount = new Set(myLeads.filter(l => l.status === 'Won').map(l => l.company || l.name)).size;

        return { totalSales, activeDeals, conversionRate, clientsCount };
    }, [leads]);

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
        { title: 'Total Revenue', value: `₹${realStats.totalSales.toLocaleString()}`, icon: IndianRupee, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/10', trend: '+12.4%', label: 'Velocity' },
        { title: 'Active Pipeline', value: realStats.activeDeals.toString(), icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10', trend: '3 Critical', label: 'Priority' },
        { title: 'Won Deals', value: realStats.conversionRate + '%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20', trend: '+5.2%', label: 'Conversion' },
        { title: 'Total Clients', value: realStats.clientsCount.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10', trend: 'Portfolio', label: 'Network' }
    ], [realStats]);

    return (
        <div className="space-y-4 sm:space-y-8 pb-10">
            {/* Header section with refined spacing */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-0.5 sm:space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="lg:hidden w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                            <img src="/src/assets/logo.png" alt="DinTask" className="h-full w-full object-cover" />
                        </div>
                        <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Command <span className="text-primary-600">Center</span>
                        </h1>
                    </div>
                    <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                        Intelligence feed for <span className="text-slate-900 dark:text-white font-bold">{user?.name}</span> • Real-time telemetry active
                    </p>
                </motion.div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                        variant="ghost"
                        className="h-10 sm:h-12 px-4 sm:px-6 bg-white dark:bg-slate-900 border-none rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm gap-2"
                        onClick={() => navigate('/sales/schedule')}
                    >
                        <CalendarIcon size={16} />
                        <span className="hidden sm:inline">Tactical Schedule</span>
                        <span className="sm:hidden">Schedule</span>
                    </Button>
                    <Button
                        className="h-10 sm:h-12 px-4 sm:px-6 bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest text-white gap-2 transition-all active:scale-95"
                        onClick={() => navigate('/sales/deals')}
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">New Operation</span>
                        <span className="sm:hidden">Add Deal</span>
                    </Button>
                </div>
            </div>

            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {stats.map((stat, index) => (
                    <motion.div key={index} variants={fadeInUp}>
                        <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden group">
                            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                                <div className="space-y-3 sm:space-y-4">
                                    <div className={cn(
                                        "size-9 sm:size-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 duration-500",
                                        stat.bg
                                    )}>
                                        <stat.icon className={cn("size-4.5 sm:size-5", stat.color)} />
                                    </div>
                                    <div className="space-y-0.5 sm:space-y-1">
                                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                        <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{stat.value}</p>
                                        <div className="flex items-center gap-1 pt-1">
                                            <div className="flex items-center justify-center size-3.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                                                <TrendingUp size={10} />
                                            </div>
                                            <span className="text-[8px] sm:text-[9px] font-black text-emerald-600 uppercase tracking-tighter">{stat.trend}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden sm:block size-16 -mr-2 opacity-[0.03] dark:opacity-[0.07] transform rotate-12 transition-transform group-hover:rotate-0 duration-700">
                                    <stat.icon size={64} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Quota & Target Matrix */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                    <div className="space-y-0.5">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <Target size={18} className="text-primary-600" />
                            Objective Matrix
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Quota synchronization across sectors</p>
                    </div>
                    <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-2xl backdrop-blur-sm self-start sm:self-auto">
                        {['monthly', 'quarterly', 'yearly'].map((period) => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={cn(
                                    "px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all",
                                    selectedPeriod === period
                                        ? "bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 text-primary-600"
                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                )}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-6">
                    {/* Progress Cards */}
                    {[
                        { title: 'Operational Performance', icon: User, data: targetProgress.individual, target: targetProgress.individualTarget, type: 'Individual Core', color: 'primary' },
                        { title: 'Collective Synergy', icon: UsersIcon, data: targetProgress.team, target: targetProgress.teamTarget, type: 'Squad Regional', color: 'emerald' }
                    ].map((card, idx) => (
                        <Card key={idx} className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                            <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-6 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                                    <div className="space-y-0.5 sm:space-y-1">
                                        <CardTitle className="text-[11px] sm:text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">{card.title}</CardTitle>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                            <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-500 border-none rounded-lg font-black text-[7px] sm:text-[9px] uppercase tracking-widest px-1.5 sm:px-2.5 py-0.5 w-fit">
                                                {card.type}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "size-7 sm:size-10 rounded-lg sm:rounded-xl flex items-center justify-center p-1.5 sm:p-2.5 shrink-0",
                                        card.color === 'primary' ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
                                    )}>
                                        <card.icon className="size-full" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                                {['deals', 'clients'].map((metric) => (
                                    <div key={metric} className="space-y-2.5 sm:space-y-3">
                                        <div className="flex items-end justify-between px-1">
                                            <div className="space-y-0.5">
                                                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5 sm:mb-1">{metric} Target</p>
                                                <p className="text-base sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">
                                                    {targetProgress.actual[metric]} <span className="text-slate-400 font-bold text-[9px] sm:text-sm">/ {card.target[metric]}</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className={cn(
                                                    "text-[9px] sm:text-[10px] font-black uppercase tracking-widest",
                                                    card.color === 'primary' ? "text-primary-600" : "text-emerald-600"
                                                )}>
                                                    {card.data[metric]}% Completion
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-2 sm:h-3 rounded-full bg-slate-50 dark:bg-slate-800 overflow-hidden p-0.5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${card.data[metric]}%` }}
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000 relative",
                                                    card.color === 'primary'
                                                        ? "bg-gradient-to-r from-primary-400 to-primary-600 shadow-lg shadow-primary-500/20"
                                                        : "bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20"
                                                )}
                                            >
                                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                            </motion.div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Tactical Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Operations Feed */}
                <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                    <CardHeader className="p-4 sm:p-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                                <div className="size-9 sm:size-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                                    <Clock size={16} />
                                </div>
                                Telemetry Feed
                            </CardTitle>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Real-time sale signals and activity</p>
                        </div>
                        <Button
                            variant="ghost"
                            className="h-9 px-4 sm:px-5 rounded-xl text-primary-600 font-black text-[9px] uppercase tracking-widest gap-2 hover:bg-primary-50 dark:hover:bg-primary-900/10 w-fit"
                            onClick={() => navigate('/sales/deals')}
                        >
                            All Data <ArrowRight size={14} />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-2 sm:p-4 pt-0">
                        <div className="space-y-1.5">
                            {salesRep?.recentSales?.slice(0, 5).map((sale) => (
                                <div key={sale.id} className="p-2.5 sm:p-3.5 flex items-center justify-between rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                    <div className="flex items-center gap-2.5 sm:gap-4 flex-1 min-w-0">
                                        <div className={cn(
                                            "size-9 sm:size-11 rounded-lg sm:rounded-xl flex flex-col items-center justify-center font-black transition-all group-hover:scale-105 shadow-sm shrink-0",
                                            sale.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-50 text-primary-600'
                                        )}>
                                            <span className="text-[6px] sm:text-[8px] uppercase opacity-50">Node</span>
                                            <span className="text-xs sm:text-sm font-black">{String(sale.id).slice(-2)}</span>
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{sale.client}</h4>
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">₹{sale.amount.toLocaleString()}</p>
                                                <Badge className={cn(
                                                    "border-none rounded-md px-1.5 py-0 h-3.5 sm:h-4 text-[7px] sm:text-[8px] font-black uppercase tracking-widest",
                                                    sale.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-50 text-primary-600'
                                                )}>
                                                    {sale.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-2 min-w-[80px] sm:min-w-[120px] pl-3">
                                        <div className="flex items-center justify-between px-1">
                                            <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Sync</span>
                                            <span className="text-[9px] sm:text-[10px] font-black text-primary-600 tabular-nums leading-none">{sale.progress}%</span>
                                        </div>
                                        <div className="w-full h-1 sm:h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${sale.progress}%` }}
                                                className="h-full bg-primary-500 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Momentum */}
                <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                    <CardHeader className="p-5 sm:p-8 pb-4">
                        <CardTitle className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="size-9 sm:size-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                                <TrendingUp size={18} />
                            </div>
                            Momentum
                        </CardTitle>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Revenue trajectory telemetry</p>
                    </CardHeader>
                    <CardContent className="p-5 sm:p-8 pt-0 space-y-5">
                        {salesRep?.performance?.slice(-5).map((monthData) => {
                            const target = 30000;
                            const value = Math.min(Math.round((monthData.revenue / target) * 100), 100);
                            return (
                                <div key={monthData.month} className="space-y-2.5">
                                    <div className="flex items-center justify-between px-1">
                                        <div className="space-y-0.5">
                                            <span className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{monthData.month}</span>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sector High Performance</p>
                                        </div>
                                        <span className="text-[10px] sm:text-xs font-black text-primary-600 tabular-nums tracking-tighter">₹{(monthData.revenue / 1000).toFixed(1)}K</span>
                                    </div>
                                    <div className="h-1.5 sm:h-2 rounded-full bg-slate-50 dark:bg-slate-800 overflow-hidden group/bar relative">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${value}%` }}
                                            className="h-full rounded-full bg-slate-200 dark:bg-slate-700 group-hover/bar:bg-primary-500 transition-all duration-500 relative z-10"
                                        />
                                        <div className="absolute inset-0 bg-primary-100 dark:bg-primary-900/10 opacity-0 group-hover/bar:opacity-30 transition-opacity" />
                                    </div>
                                </div>
                            );
                        })}
                        <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                            <div className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white relative overflow-hidden group hover:scale-[1.01] transition-transform">
                                <div className="relative z-10">
                                    <p className="text-[8px] font-black text-primary-500 uppercase tracking-widest mb-1.5">Neural Prediction</p>
                                    <h4 className="text-[11px] font-black uppercase tracking-tight">Q4 Growth Acceleration</h4>
                                    <p className="text-[9px] text-slate-400 font-bold mt-2 leading-relaxed">System predicts 14.2% increase in tactical efficiency based on active pipeline velocity.</p>
                                </div>
                                <BarChart3 className="absolute -bottom-2 -right-2 size-16 sm:size-20 text-white/5 transform rotate-12 transition-transform group-hover:rotate-0" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SalesDashboard;