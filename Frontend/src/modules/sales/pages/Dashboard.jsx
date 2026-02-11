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
        {
            title: 'Total Revenue',
            value: `₹${realStats.totalSales.toLocaleString()}`,
            icon: IndianRupee,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            border: 'border-blue-100 dark:border-blue-900',
            shadow: 'shadow-lg shadow-blue-200/50 dark:shadow-none',
            gradient: 'bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-900/20',
            trend: '+12.4%',
            label: 'Velocity'
        },
        {
            title: 'Active Pipeline',
            value: realStats.activeDeals.toString(),
            icon: AlertCircle,
            color: 'text-amber-600',
            bg: 'bg-amber-100',
            border: 'border-amber-100 dark:border-amber-900',
            shadow: 'shadow-lg shadow-amber-200/50 dark:shadow-none',
            gradient: 'bg-gradient-to-br from-white to-amber-50 dark:from-slate-900 dark:to-amber-900/20',
            trend: '3 Critical',
            label: 'Priority'
        },
        {
            title: 'Won Deals',
            value: realStats.conversionRate + '%',
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
            border: 'border-emerald-100 dark:border-emerald-900',
            shadow: 'shadow-lg shadow-emerald-200/50 dark:shadow-none',
            gradient: 'bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-900/20',
            trend: '+5.2%',
            label: 'Conversion'
        },
        {
            title: 'Total Clients',
            value: realStats.clientsCount.toString(),
            icon: Users,
            color: 'text-indigo-600',
            bg: 'bg-indigo-100',
            border: 'border-indigo-100 dark:border-indigo-900',
            shadow: 'shadow-lg shadow-indigo-200/50 dark:shadow-none',
            gradient: 'bg-gradient-to-br from-white to-indigo-50 dark:from-slate-900 dark:to-indigo-900/20',
            trend: 'Portfolio',
            label: 'Network'
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




        </div>
    );
};

export default SalesDashboard;
