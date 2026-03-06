import React, { useMemo } from 'react';
import {
    BarChart3,
    FileText,
    Download,
    TrendingUp,
    Clock,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Calendar as CalendarIcon,
    PieChart as PieChartIcon,
    Zap,
    Cpu,
    Target
} from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import { motion } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import useTaskStore from '@/store/taskStore';
import useEmployeeStore from '@/store/employeeStore';
import { fadeInUp, staggerContainer } from '@/shared/utils/animations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils/cn';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{label}</p>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200" /> Total OPS: {data.total}
                    </p>
                    <p className="text-[10px] font-black flex items-center gap-2 uppercase tracking-widest" style={{ color: data.color }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: data.color }} /> Sync: {data.completed}
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Yield</p>
                        <p className="text-sm font-black" style={{ color: data.color }}>
                            {data.percentage}%
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const ManagerReports = () => {
    const { user } = useAuthStore();
    const tasks = useTaskStore(state => state.tasks);
    const fetchTasks = useTaskStore(state => state.fetchTasks);
    const employees = useEmployeeStore(state => state.employees);
    const fetchEmployees = useEmployeeStore(state => state.fetchEmployees);

    React.useEffect(() => {
        fetchTasks();
        fetchEmployees();
    }, [fetchTasks, fetchEmployees]);

    const teamTasks = useMemo(() => {
        const userId = (user?._id || user?.id)?.toString();
        return tasks.filter(t => {
            const isAssignedByMe = (t.assignedBy?._id || t.assignedBy)?.toString() === userId;
            const isAssignedToMe = Array.isArray(t.assignedTo)
                ? t.assignedTo.some(id => (id._id || id)?.toString() === userId)
                : (t.assignedTo?._id || t.assignedTo)?.toString() === userId;
            return isAssignedByMe || isAssignedToMe;
        });
    }, [tasks, user]);

    const teamMembers = useMemo(() => {
        const userId = (user?._id || user?.id)?.toString();
        const userAdminId = (user?.adminId?._id || user?.adminId)?.toString();

        return employees.filter(e => {
            const empAdminId = (e.adminId?._id || e.adminId)?.toString();
            const empManagerId = (e.managerId?._id || e.managerId)?.toString();

            return e.role === 'employee' &&
                (empManagerId === userId || empAdminId === userAdminId);
        });
    }, [employees, user]);

    const stats = useMemo(() => {
        const total = teamTasks.length;
        const completed = teamTasks.filter(t => t.status === 'completed').length;
        const pending = teamTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
        const highPriority = teamTasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return [
            {
                title: 'Total Vol',
                value: total.toString(),
                icon: BarChart3,
                color: 'text-blue-600',
                bg: 'bg-blue-100',
                border: 'border-blue-100 dark:border-blue-900',
                shadow: 'shadow-lg shadow-blue-200/50 dark:shadow-none',
                gradient: 'bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-900/20',
                trend: '+12%',
                label: 'TOTAL OPERATIONS'
            },
            {
                title: 'Yield Rate',
                value: `${completionRate}%`,
                icon: TrendingUp,
                color: 'text-emerald-600',
                bg: 'bg-emerald-100',
                border: 'border-emerald-100 dark:border-emerald-900',
                shadow: 'shadow-lg shadow-emerald-200/50 dark:shadow-none',
                gradient: 'bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-900/20',
                trend: 'OPTIMAL',
                label: 'SUCCESS YIELD'
            },
            {
                title: 'Queue',
                value: pending.toString(),
                icon: Clock,
                color: 'text-amber-600',
                bg: 'bg-amber-100',
                border: 'border-amber-100 dark:border-amber-900',
                shadow: 'shadow-lg shadow-amber-200/50 dark:shadow-none',
                gradient: 'bg-gradient-to-br from-white to-amber-50 dark:from-slate-900 dark:to-amber-900/20',
                trend: '-2 units',
                label: 'PENDING ACTION'
            },
            {
                title: 'Priority',
                value: highPriority.toString(),
                icon: Zap,
                color: 'text-rose-600',
                bg: 'bg-rose-100',
                border: 'border-rose-100 dark:border-rose-900',
                shadow: 'shadow-lg shadow-rose-200/50 dark:shadow-none',
                gradient: 'bg-gradient-to-br from-white to-rose-50 dark:from-slate-900 dark:to-rose-900/20',
                trend: 'CRITICAL',
                label: 'HIGH PRIORITY'
            }
        ];
    }, [teamTasks]);

    const statusData = useMemo(() => {
        const completed = teamTasks.filter(t => t.status === 'completed').length;
        const pending = teamTasks.filter(t => t.status === 'pending').length;
        const inProgress = teamTasks.filter(t => t.status === 'in_progress' || (t.progress > 0 && t.progress < 100)).length;

        return [
            { name: 'FULFILLED', value: completed, color: '#10b981' },
            { name: 'ACTIVE', value: inProgress, color: '#3b82f6' },
            { name: 'QUEUE', value: pending, color: '#f59e0b' }
        ].filter(d => d.value > 0);
    }, [teamTasks]);

    const performanceData = useMemo(() => {
        return teamMembers.map(emp => {
            const memberId = (emp._id || emp.id)?.toString();
            const empTasks = teamTasks.filter(t => {
                const assignees = Array.isArray(t.assignedTo) ? t.assignedTo : [t.assignedTo];
                return assignees.some(a => (a?._id || a || "").toString() === memberId);
            });
            const total = empTasks.length;
            const completed = empTasks.filter(t => t.status === 'completed').length;
            const totalProgress = empTasks.reduce((acc, t) => acc + (t.progress || 0), 0);
            const percentage = total > 0 ? totalProgress / total : 0;

            let color = '#ef4444'; // Red (Low Progress / <50%)
            if (percentage >= 70) color = '#22c55e'; // Green (Good / >=70%)
            else if (percentage >= 50) color = '#eab308'; // Yellow (Mediocre / 50-69%)
            else if (percentage > 0) color = '#f97316'; // Orange

            return {
                name: (emp.name || 'Unknown').toUpperCase().split(' ')[0],
                completed,
                total,
                color,
                percentage: Math.round(percentage)
            };
        }).sort((a, b) => b.total - a.total);
    }, [teamMembers, teamTasks]);

    const weeklyData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date;
        });

        return last7Days.map(date => {
            const count = teamTasks.filter(t => {
                const taskDate = new Date(t.createdAt);
                return taskDate.getDate() === date.getDate() &&
                    taskDate.getMonth() === date.getMonth() &&
                    taskDate.getFullYear() === date.getFullYear();
            }).length;
            return {
                name: format(date, 'eee').charAt(0),
                count
            };
        });
    }, [teamTasks]);

    const activityLog = useMemo(() => {
        return [...teamTasks]
            .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
            .slice(0, 10)
            .map(task => {
                const updatedTime = task.updatedAt || task.createdAt;
                let action = 'DEPLOYED';
                if (task.status === 'completed') action = 'FULFILLED';
                else if (task.status === 'in_progress') action = 'ENGAGED';
                else if (task.progress > 0) action = 'SYNCED';

                // Find user name
                const assigneeId = Array.isArray(task.assignedTo) ? task.assignedTo[0] : task.assignedTo;
                const member = employees.find(e => (e._id || e.id)?.toString() === (assigneeId?._id || assigneeId)?.toString());

                return {
                    id: task.id || task._id,
                    time: format(new Date(updatedTime), 'HH:mm'),
                    user: member?.name || 'ADMIN',
                    action,
                    task: task.title,
                    status: task.status
                };
            });
    }, [teamTasks, employees]);

    const handleExportExcel = () => {
        const exportData = teamTasks.map(task => ({
            ID: task.id,
            Title: task.title,
            Status: task.status,
            Priority: task.priority,
            Progress: `${task.progress}%`,
            Deadline: format(new Date(task.deadline), 'MMM dd, yyyy HH:mm'),
            AssignedBy: task.assignedBy === 'admin' ? 'Admin' : 'Manager',
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Tactical Report");
        XLSX.writeFile(wb, `Force_Report_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    };

    return (
        <div className="space-y-4 sm:space-y-6 pb-12">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-3">
                    <div className="lg:hidden size-9 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                        <img src="/dintask-logo.png" alt="DinTask" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                            Tactical <span className="text-primary-600">Analytics</span>
                        </h1>
                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-1 leading-none">
                            Intelligence Node Active
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 sm:flex-none h-9 rounded-xl font-black text-[9px] uppercase tracking-widest border-slate-200 gap-2">
                        <CalendarIcon size={14} className="text-primary-500" />
                        30D
                    </Button>
                    <Button
                        onClick={handleExportExcel}
                        className="flex-1 sm:flex-none h-9 rounded-xl bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20 font-black text-[9px] uppercase tracking-widest text-white gap-2"
                    >
                        <Download size={14} />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats Grid - High Density */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((stat, i) => (
                    <Card key={i} className={cn(
                        "border-2 rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1",
                        stat.border,
                        stat.shadow,
                        stat.gradient
                    )}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="space-y-3">
                                <div className={cn(
                                    "size-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-105 duration-500 shadow-inner",
                                    stat.bg
                                )}>
                                    <stat.icon className={cn("size-4", stat.color)} />
                                </div>
                                <div className="space-y-0.5 text-left">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                    <p className={cn("text-xl font-black tracking-tight leading-none", stat.color)}>{stat.value}</p>
                                    <div className="flex items-center gap-1 pt-1">
                                        <div className={cn("flex items-center justify-center size-3 rounded-full", stat.bg)}>
                                            <TrendingUp size={8} className={stat.color} />
                                        </div>
                                        <span className={cn("text-[8px] font-black uppercase tracking-tighter", stat.color)}>{stat.trend}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={cn("hidden sm:block size-12 -mr-1 opacity-10 transform rotate-12 transition-transform group-hover:rotate-0 duration-700", stat.color)}>
                                <stat.icon size={48} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                {/* Performance Chart */}
                <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                    <CardHeader className="py-4 px-6 border-b border-slate-50 dark:border-slate-800">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                            <Cpu size={14} className="text-primary-500" />
                            Force Performance Matrix
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] pt-6 pr-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 9, fontWeight: 900, textTransform: 'uppercase' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 9, fontWeight: 900 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                                    content={<CustomTooltip />}
                                />
                                <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={16}>
                                    {performanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                    <CardHeader className="py-4 px-6 border-b border-slate-50 dark:border-slate-800">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                            <PieChartIcon size={14} className="text-primary-500" />
                            Workflow Segmentation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] pt-4 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '10px', fontWeight: '900' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{teamTasks.length}</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">OPS</p>
                        </div>
                        <div className="flex justify-center gap-4 pb-4">
                            {statusData.map((s) => (
                                <div key={s.name} className="flex items-center gap-1.5">
                                    <div className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{s.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Velocity and Logs Grid */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                {/* Velocity Line Chart */}
                <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                    <CardHeader className="py-4 px-6 border-b border-slate-50 dark:border-slate-800">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                            <TrendingUp size={14} className="text-emerald-500" />
                            Flow Velocity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[200px] p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weeklyData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: '900' }} />
                                <Line type="monotone" dataKey="count" stroke="#ec4899" strokeWidth={3} dot={{ r: 4, fill: '#ec4899', strokeWidth: 2, stroke: '#fff' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Activity Feed - High Density */}
                <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                    <CardHeader className="py-4 px-6 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tactical Logs</CardTitle>
                        <Button variant="ghost" size="sm" className="h-6 px-2 font-black text-[9px] uppercase tracking-widest text-primary-600 hover:bg-primary-50 rounded-lg">All Logs</Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {activityLog.map((log) => (
                                <div key={log.id} className="p-3 sm:px-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="text-[8px] font-black text-slate-300 uppercase shrink-0">{log.time}</div>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase leading-none mb-1">{log.user}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate">{log.task}</p>
                                        </div>
                                    </div>
                                    <Badge variant="ghost" className={cn(
                                        "text-[8px] font-black uppercase h-5 px-1.5 shrink-0",
                                        log.status === 'completed' ? "bg-emerald-50 text-emerald-600" :
                                            log.status === 'in-progress' ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"
                                    )}>
                                        {log.action}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ManagerReports;
