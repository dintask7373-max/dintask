import React, { useMemo } from 'react';
import {
    BarChart3,
    TrendingUp,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Users,
    Target,
    Zap,
    Download
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { motion } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import useTaskStore from '@/store/taskStore';
import useEmployeeStore from '@/store/employeeStore';
import useProjectStore from '@/store/projectStore';
import { fadeInUp, staggerContainer } from '@/shared/utils/animations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

const TeamProgress = () => {
    const { user } = useAuthStore();
    const { tasks, fetchTasks } = useTaskStore();
    const { employees, fetchEmployees } = useEmployeeStore();
    const { projects, fetchProjects } = useProjectStore();

    React.useEffect(() => {
        fetchTasks();
        fetchEmployees();
        fetchProjects();
    }, [fetchTasks, fetchEmployees, fetchProjects]);

    const teamTasks = useMemo(() => {
        const userId = (user?._id || user?.id)?.toString();
        // Managers see tasks they assigned OR tasks assigned to them to track delegation flow
        return tasks.filter(t => {
            const isAssignedByMe = (t.assignedBy?._id || t.assignedBy)?.toString() === userId;
            return isAssignedByMe;
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

    const performanceData = useMemo(() => {
        return teamMembers.map(member => {
            const memberId = (member._id || member.id)?.toString();
            const memberTasks = tasks.filter(t => {
                const assignees = Array.isArray(t.assignedTo) ? t.assignedTo : [t.assignedTo];
                return assignees.some(a => (a?._id || a || "").toString() === memberId);
            });

            const completed = memberTasks.filter(t => t.status === 'completed').length;
            const rate = memberTasks.length > 0 ? Math.round((completed / memberTasks.length) * 100) : 0;
            const avgProgress = memberTasks.reduce((acc, t) => acc + (t.progress || 0), 0) / (memberTasks.length || 1);

            return {
                name: (member.name || 'Unknown').split(' ')[0],
                tasks: memberTasks.length,
                completed: completed,
                rate: Math.round(avgProgress), // Use average progress for the bar
                efficiency: rate
            };
        });
    }, [tasks, teamMembers]);

    const stats = useMemo(() => {
        const completed = teamTasks.filter(t => t.status === 'completed').length;
        const pending = teamTasks.filter(t => t.status !== 'completed').length;
        const total = teamTasks.length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        const completedProjects = projects.filter(p => p.status === 'completed').length;
        const totalProjects = projects.length;

        return [
            { title: 'Task Volume', value: total, icon: BarChart3, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/10', trend: 'Flow rate' },
            { title: 'Success Yield', value: `${rate}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10', trend: 'Peak efficiency' },
            { title: 'Pending Sync', value: pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10', trend: 'Active units' },
            { title: 'Milestones', value: `${completedProjects}/${totalProjects}`, icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/10', trend: 'Network goals' }
        ];
    }, [teamTasks, projects]);

    const handleExportIntelligence = () => {
        const exportData = teamTasks.map(task => {
            const assigneeId = Array.isArray(task.assignedTo) ? task.assignedTo[0] : task.assignedTo;
            const member = employees.find(e => (e._id || e.id)?.toString() === (assigneeId?._id || assigneeId)?.toString());

            return {
                'Tactical ID': task.id || task._id,
                'Directive Title': task.title,
                'Assignee': member?.name || 'ADMIN',
                'Operational Priority': task.priority?.toUpperCase(),
                'Sync Progress': `${task.progress || 0}%`,
                'Status': task.status?.toUpperCase(),
                'Initialization Date': format(new Date(task.createdAt), 'MMM dd, yyyy')
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Tactical Intelligence");
        XLSX.writeFile(wb, `Tactical_Intelligence_${format(new Date(), 'yyyyMMdd')}.xlsx`);
        toast.success("Tactical data extracted successfully!");
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
                            Metric visualization & data extraction
                        </p>
                    </div>
                </div>
                <Button
                    className="h-9 px-5 rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 font-black text-[9px] uppercase tracking-widest gap-2 shadow-lg hover:shadow-primary-500/20 transition-all border-none"
                    onClick={handleExportIntelligence}
                >
                    <Download size={14} className="text-primary-500" />
                    <span>Extract Intelligence</span>
                </Button>
            </div>

            {/* Stats Grid - High Density */}
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
            >
                {stats.map((stat, index) => (
                    <motion.div key={index} variants={fadeInUp}>
                        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                            <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                                <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0", stat.bg)}>
                                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">{stat.title}</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{stat.value}</p>
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic mt-1">{stat.trend}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                {/* Performance Chart - Tactical View */}
                <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden min-h-[400px]">
                    <CardHeader className="py-4 px-6 border-b border-slate-50 dark:border-slate-800">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                            <Zap size={14} className="text-amber-500" />
                            Force Efficiency Matrix
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800, textTransform: 'uppercase' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 9 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                            padding: '8px',
                                            fontSize: '10px',
                                            fontWeight: '800',
                                            textTransform: 'uppercase'
                                        }}
                                    />
                                    <Bar dataKey="rate" radius={[4, 4, 0, 0]} barSize={24}>
                                        {performanceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.rate > 80 ? '#10b981' : entry.rate > 50 ? '#3b82f6' : '#f59e0b'} fillOpacity={0.8} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Leaderboard */}
                <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden group">
                    <CardHeader className="py-4 px-6 border-b border-slate-50 dark:border-slate-800">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Elite Assets</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {performanceData.sort((a, b) => b.rate - a.rate).slice(0, 5).map((member, index) => (
                                <div key={member.name} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("size-8 rounded-xl flex items-center justify-center text-[10px] font-black",
                                            index === 0 ? "bg-amber-100 text-amber-600" :
                                                index === 1 ? "bg-slate-100 text-slate-500" :
                                                    "bg-slate-50 text-slate-400"
                                        )}>
                                            0{index + 1}
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-none">{member.name}</p>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{member.tasks} OPS conducted</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1.5 justify-end">
                                            <Badge variant="ghost" className="text-[9px] font-black tracking-tight text-emerald-600 bg-emerald-50 h-5 px-1.5">{member.rate}%</Badge>
                                        </div>
                                        <Progress value={member.rate} className="w-16 h-1 mt-1.5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 pt-1">
                            <Button variant="ghost" className="w-full text-primary-600 font-black text-[9px] uppercase tracking-[0.2em] hover:bg-primary-50 py-6">
                                Detailed Ranking Access
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TeamProgress;
