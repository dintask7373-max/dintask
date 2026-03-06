import React, { useEffect, useMemo } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import {
    BarChart3,
    TrendingUp,
    AlertTriangle,
    Users,
    Clock,
    Activity,
    Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import useManagerStore from '@/store/managerStore';
import { fadeInUp, staggerContainer } from '@/shared/utils/animations';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const TeamProgress = () => {
    const { employeePerformance, fetchEmployeePerformance, loading } = useManagerStore();

    useEffect(() => {
        fetchEmployeePerformance();
    }, [fetchEmployeePerformance]);

    // Calculate team summary stats
    const stats = useMemo(() => {
        if (!employeePerformance || employeePerformance.length === 0) return [];

        const totals = employeePerformance.reduce((acc, emp) => ({
            totalTasks: acc.totalTasks + emp.metrics.totalTasks,
            completed: acc.completed + emp.metrics.completedTasks,
            overdue: acc.overdue + emp.metrics.overdueTasks,
            inProgress: acc.inProgress + emp.metrics.inProgressTasks
        }), { totalTasks: 0, completed: 0, overdue: 0, inProgress: 0 });

        const avgCompletion = employeePerformance.length > 0
            ? Math.round(employeePerformance.reduce((sum, emp) => sum + emp.metrics.completionRate, 0) / employeePerformance.length)
            : 0;

        return [
            {
                title: 'Total Tasks',
                value: totals.totalTasks.toString(),
                icon: BarChart3,
                color: 'text-blue-600',
                bg: 'bg-blue-100',
                border: 'border-blue-100 dark:border-blue-900',
                shadow: 'shadow-lg shadow-blue-200/50 dark:shadow-none',
                gradient: 'bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-900/20',
                trend: 'All assigned',
                label: 'TOTAL OPERATIONS'
            },
            {
                title: 'Completion Rate',
                value: `${avgCompletion}%`,
                icon: TrendingUp,
                color: 'text-emerald-600',
                bg: 'bg-emerald-100',
                border: 'border-emerald-100 dark:border-emerald-900',
                shadow: 'shadow-lg shadow-emerald-200/50 dark:shadow-none',
                gradient: 'bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-900/20',
                trend: 'Team average',
                label: 'SUCCESS YIELD'
            },
            {
                title: 'Overdue Tasks',
                value: totals.overdue.toString(),
                icon: AlertTriangle,
                color: 'text-red-600',
                bg: 'bg-red-100',
                border: 'border-red-100 dark:border-red-900',
                shadow: 'shadow-lg shadow-red-200/50 dark:shadow-none',
                gradient: 'bg-gradient-to-br from-white to-red-50 dark:from-slate-900 dark:to-red-900/20',
                trend: 'Needs attention',
                label: 'CRITICAL DELAYS'
            },
            {
                title: 'Active Team',
                value: employeePerformance.length.toString(),
                icon: Users,
                color: 'text-purple-600',
                bg: 'bg-purple-100',
                border: 'border-purple-100 dark:border-purple-900',
                shadow: 'shadow-lg shadow-purple-200/50 dark:shadow-none',
                gradient: 'bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-purple-900/20',
                trend: 'Members',
                label: 'ACTIVE FORCE'
            }
        ];
    }, [employeePerformance]);

    const handleExportData = () => {
        if (!employeePerformance || employeePerformance.length === 0) {
            toast.error("No data to export");
            return;
        }

        const exportData = employeePerformance.map(emp => ({
            'Employee': emp.name,
            'Email': emp.email,
            'Total Tasks': emp.metrics.totalTasks,
            'Completed': emp.metrics.completedTasks,
            'In Progress': emp.metrics.inProgressTasks,
            'Pending': emp.metrics.pendingTasks,
            'Overdue': emp.metrics.overdueTasks,
            'Completion Rate': `${emp.metrics.completionRate}%`,
            'On-Time Delivery': `${emp.metrics.onTimeDeliveryRate}%`,
            'Workload': emp.metrics.currentWorkload,
            'Status': emp.metrics.workloadStatus,
            'Avg Progress': `${emp.metrics.avgProgress}%`,
            'Last Active': emp.metrics.lastActive ? format(new Date(emp.metrics.lastActive), 'MMM dd, yyyy HH:mm') : 'Never'
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Employee Performance");
        XLSX.writeFile(wb, `Employee_Performance_${format(new Date(), 'yyyyMMdd')}.xlsx`);
        toast.success("Performance data exported successfully!");
    };

    const getWorkloadColor = (status) => {
        switch (status) {
            case 'overloaded': return 'bg-red-100 text-red-700 dark:bg-red-900/20 border-red-200';
            case 'normal': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 border-blue-200';
            case 'light': return 'bg-green-100 text-green-700 dark:bg-green-900/20 border-green-200';
            default: return 'bg-slate-100 text-slate-500 dark:bg-slate-800 border-slate-200';
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-3">
                    <div className="lg:hidden size-9 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                        <img src="/dintask-logo.png" alt="DinTask" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                            Performance <span className="text-primary-600">Analytics</span>
                        </h1>
                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-1 leading-none">
                            Employee metrics & insights
                        </p>
                    </div>
                </div>
                <Button
                    className="h-9 px-5 rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 font-black text-[9px] uppercase tracking-widest gap-2 shadow-lg hover:shadow-primary-500/20 transition-all border-none"
                    onClick={handleExportData}
                    disabled={!employeePerformance || employeePerformance.length === 0}
                >
                    <Download size={14} className="text-primary-500" />
                    <span>Export Data</span>
                </Button>
            </div>

            {/* Stats Grid */}
            {stats.length > 0 && (
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
                >
                    {stats.map((stat, i) => (
                        <motion.div key={i} variants={fadeInUp}>
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
                                        <div className="space-y-0.5 sm:space-y-1 text-left">
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
            )}

            {/* Employee Performance List */}
            <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                <CardHeader className="py-4 px-6 border-b border-slate-50 dark:border-slate-800">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <Activity size={14} className="text-primary-500" />
                        Employee Performance Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Loading performance data...
                        </div>
                    ) : !employeePerformance || employeePerformance.length === 0 ? (
                        <div className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                            No employee data available
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {employeePerformance.map((employee) => (
                                <div key={employee.employeeId} className="p-4 sm:p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    {/* Employee Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-12 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                {employee.profileImage ? (
                                                    <img
                                                        src={employee.profileImage}
                                                        alt={employee.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-primary-100 dark:bg-primary-900/20 text-primary-600 font-black text-lg">${employee.name?.charAt(0) || 'E'}</div>`;
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-primary-100 dark:bg-primary-900/20 text-primary-600 font-black text-lg">
                                                        {employee.name?.charAt(0) || 'E'}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none">{employee.name}</h3>
                                                <p className="text-[9px] font-bold text-slate-400 mt-1">{employee.email}</p>
                                                {employee.metrics.lastActive && (
                                                    <p className="text-[8px] font-black text-slate-500 uppercase mt-1 flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {formatDistanceToNow(new Date(employee.metrics.lastActive), { addSuffix: true })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={cn("text-[8px] font-black uppercase px-2 py-1 border", getWorkloadColor(employee.metrics.workloadStatus))}>
                                            {employee.metrics.workloadStatus}
                                        </Badge>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Tasks</p>
                                            <p className="text-lg font-black text-slate-900 dark:text-white">{employee.metrics.totalTasks}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                                            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Completed</p>
                                            <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">{employee.metrics.completedTasks}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                                            <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1">In Progress</p>
                                            <p className="text-lg font-black text-blue-700 dark:text-blue-400">{employee.metrics.inProgressTasks}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                                            <p className="text-[8px] font-black text-red-600 uppercase tracking-widest mb-1">Overdue</p>
                                            <p className="text-lg font-black text-red-700 dark:text-red-400">{employee.metrics.overdueTasks}</p>
                                        </div>
                                    </div>

                                    {/* Performance Indicators */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                <span>Completion Rate</span>
                                                <span className="text-emerald-600">{employee.metrics.completionRate}%</span>
                                            </div>
                                            <Progress value={employee.metrics.completionRate} className="h-2" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                <span>On-Time Delivery</span>
                                                <span className="text-blue-600">{employee.metrics.onTimeDeliveryRate}%</span>
                                            </div>
                                            <Progress value={employee.metrics.onTimeDeliveryRate} className="h-2" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                <span>Avg Progress</span>
                                                <span className="text-primary-600">{employee.metrics.avgProgress}%</span>
                                            </div>
                                            <Progress value={employee.metrics.avgProgress} className="h-2" />
                                        </div>
                                    </div>

                                    {/* Priority Breakdown */}
                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Priority Distribution</p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className="text-[8px] font-black bg-red-50 text-red-600 border-red-200">
                                                Urgent: {employee.metrics.priorityBreakdown.urgent}
                                            </Badge>
                                            <Badge variant="outline" className="text-[8px] font-black bg-orange-50 text-orange-600 border-orange-200">
                                                High: {employee.metrics.priorityBreakdown.high}
                                            </Badge>
                                            <Badge variant="outline" className="text-[8px] font-black bg-blue-50 text-blue-600 border-blue-200">
                                                Medium: {employee.metrics.priorityBreakdown.medium}
                                            </Badge>
                                            <Badge variant="outline" className="text-[8px] font-black bg-slate-50 text-slate-600 border-slate-200">
                                                Low: {employee.metrics.priorityBreakdown.low}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default TeamProgress;
