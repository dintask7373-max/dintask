import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign,
    FolderKanban,
    Users,
    Bell,
    TrendingUp,
    Loader2
} from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/shared/utils/animations';
import useAuthStore from '@/store/authStore';
import useAdminStore from '@/store/adminStore';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

const AdminDashboard = () => {
    const { user } = useAuthStore();
    const { dashboardStats, loading, fetchDashboardStats } = useAdminStore();

    useEffect(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    const stats = [
        {
            title: "Total Revenue",
            value: dashboardStats?.totalRevenue
                ? `₹${(dashboardStats.totalRevenue / 100000).toFixed(1)}L`
                : '₹0',
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            description: "From won deals",
            trend: "+12.5%"
        },
        {
            title: "Active Projects",
            value: dashboardStats?.activeProjects || 0,
            icon: FolderKanban,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            description: "In progress",
            trend: "+3"
        },
        {
            title: "Total Staff",
            value: dashboardStats?.totalStaff || 0,
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-900/20",
            description: dashboardStats?.staffLimit
                ? `of ${dashboardStats.staffLimit} limit`
                : "No limit set",
            breakdown: dashboardStats?.breakdown
                ? `${dashboardStats.breakdown.managers}M / ${dashboardStats.breakdown.employees}E / ${dashboardStats.breakdown.salesReps}S`
                : ""
        },
        {
            title: "Pending Actions",
            value: dashboardStats?.pendingActions || 0,
            icon: Bell,
            color: "text-amber-600",
            bg: "bg-amber-50 dark:bg-amber-900/20",
            description: "Require attention",
            breakdown: dashboardStats?.breakdown
                ? `${dashboardStats.breakdown.openTickets} tickets, ${dashboardStats.breakdown.pendingProjectConversions} conversions`
                : ""
        }
    ];

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="lg:hidden w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                        <img src="/dintask-logo.png" alt="DinTask" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Admin Dashboard</h1>
                        <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Welcome back, <span className="font-bold text-primary-600">{user?.name}</span>
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center h-[40vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
            )}

            {/* High-Level Metrics Cards */}
            {!loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {stats.map((stat, i) => (
                        <motion.div key={i} variants={fadeInUp}>
                            <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden group hover:shadow-md transition-all duration-300 rounded-2xl sm:rounded-3xl">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                                        <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                                            <stat.icon size={20} className="sm:w-6 sm:h-6" />
                                        </div>
                                        {stat.trend && (
                                            <Badge variant="secondary" className="bg-slate-50 dark:bg-slate-800 text-[8px] sm:text-[10px] font-black uppercase tracking-tighter px-2 h-5 flex items-center gap-1">
                                                <TrendingUp size={10} />
                                                {stat.trend}
                                            </Badge>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">{stat.title}</p>
                                        <h4 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tighter">{stat.value}</h4>
                                        <p className="text-[9px] sm:text-xs text-slate-500 font-medium mt-1">{stat.description}</p>
                                        {stat.breakdown && (
                                            <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{stat.breakdown}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Placeholder for future sections */}
            {!loading && (
                <motion.div variants={fadeInUp} className="mt-8">
                    <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-3">
                            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600">
                                <TrendingUp size={32} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">More Insights Coming Soon</h3>
                                <p className="text-sm text-slate-500 font-medium mt-1">
                                    Charts, performance trends, and detailed analytics will be added here.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </motion.div>
    );
};

export default AdminDashboard;
