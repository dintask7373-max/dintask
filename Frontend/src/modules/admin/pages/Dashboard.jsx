import React, { useMemo } from 'react';
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    Users,
    TrendingUp,
    MoreVertical,
    Plus,
    BarChart3,
    Calendar as CalendarIcon
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import useTaskStore from '@/store/taskStore';
import useAuthStore from '@/store/authStore';
import useManagerStore from '@/store/managerStore';
import useEmployeeStore from '@/store/employeeStore';
import useScheduleStore from '@/store/scheduleStore';
import { fadeInUp, staggerContainer, scaleOnTap } from '@/shared/utils/animations';
import { format, isSameDay } from 'date-fns';

const AdminDashboard = () => {
    const { user } = useAuthStore();
    const { tasks } = useTaskStore();
    const { managers } = useManagerStore();
    const { employees } = useEmployeeStore();

    // Mock data for the chart
    const chartData = [
        { name: 'Mon', completed: 4, pending: 2 },
        { name: 'Tue', completed: 7, pending: 5 },
        { name: 'Wed', completed: 5, pending: 8 },
        { name: 'Thu', completed: 12, pending: 4 },
        { name: 'Fri', completed: 8, pending: 6 },
        { name: 'Sat', completed: 3, pending: 2 },
        { name: 'Sun', completed: 2, pending: 1 },
    ];

    const { schedules } = useScheduleStore();

    const adminMeetings = useMemo(() => {
        const today = new Date();
        return schedules.filter(s =>
            s.assignedTo?.toLowerCase().includes('admin') &&
            (new Date(s.date) >= new Date(today.setHours(0, 0, 0, 0)))
        ).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [schedules]);

    const stats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return [
            {
                title: "Today's Tasks",
                value: tasks.filter(t => t.createdAt.startsWith(today)).length,
                icon: Clock,
                color: "text-blue-600",
                bg: "bg-blue-50 dark:bg-blue-900/20",
                description: "+2 from yesterday"
            },
            {
                title: "Completed Today",
                value: tasks.filter(t => t.status === 'completed' && t.completedAt?.startsWith(today)).length,
                icon: CheckCircle2,
                color: "text-emerald-600",
                bg: "bg-emerald-50 dark:bg-emerald-900/20",
                description: "85% completion rate"
            },
            {
                title: "Tasks Pending Mgr",
                value: tasks.filter(t => t.assignedToManager && t.status === 'pending' && !t.delegatedBy).length,
                icon: AlertCircle,
                color: "text-amber-600",
                bg: "bg-amber-50 dark:bg-amber-900/20",
                description: "Awaiting delegation"
            },
            {
                title: "Active Managers",
                value: managers.length,
                icon: Users,
                color: "text-purple-600",
                bg: "bg-purple-50 dark:bg-purple-900/20",
                description: `${employees.length} employees reporting`
            }
        ];
    }, [tasks]);

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center justify-between w-full md:w-auto">
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
                    <div className="md:hidden">
                        <motion.div {...scaleOnTap}>
                            <Button size="sm" className="h-9 w-9 p-0 rounded-xl bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20">
                                <Plus size={18} />
                            </Button>
                        </motion.div>
                    </div>
                </div>
                <motion.div {...scaleOnTap} className="hidden md:block">
                    <Button className="h-11 sm:h-12 px-6 rounded-xl sm:rounded-2xl flex items-center gap-2 shadow-lg shadow-primary-200 dark:shadow-none bg-primary-600 hover:bg-primary-700 font-black text-xs uppercase tracking-widest">
                        <Plus size={18} />
                        <span>Create New Task</span>
                    </Button>
                </motion.div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {stats.map((stat, i) => (
                    <motion.div key={i} variants={fadeInUp}>
                        <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden group hover:shadow-md transition-shadow duration-300 rounded-2xl sm:rounded-3xl">
                            <CardContent className="p-3 sm:p-6">
                                <div className="flex items-center justify-between mb-2 sm:mb-4">
                                    <div className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                                        <stat.icon size={16} className="sm:w-6 sm:h-6" />
                                    </div>
                                    <Badge variant="secondary" className="bg-slate-50 dark:bg-slate-800 text-[7px] sm:text-[10px] font-black uppercase tracking-tighter px-1.5 h-4 sm:h-auto sm:px-2">
                                        {stat.description.split(' ')[0]}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-[10px] sm:text-sm font-black text-slate-400 uppercase tracking-widest">{stat.title}</p>
                                    <h4 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 sm:mt-1 tracking-tighter">{stat.value}</h4>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <motion.div variants={fadeInUp} className="lg:col-span-2">
                    <Card className="h-full border-none shadow-sm shadow-slate-200/50 bg-white dark:bg-slate-900 overflow-hidden rounded-2xl sm:rounded-[2rem]">
                        <CardHeader className="flex flex-row items-center justify-between px-5 py-4 sm:p-6 sm:pb-0">
                            <div>
                                <CardTitle className="text-sm sm:text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white">Completion Trend</CardTitle>
                                <CardDescription className="text-[10px] sm:text-sm font-bold">Weekly Overview</CardDescription>
                            </div>
                            <div className="p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                <TrendingUp size={16} className="text-emerald-500 sm:w-5 sm:h-5" />
                            </div>
                        </CardHeader>
                        <CardContent className="h-[200px] sm:h-[300px] mt-2 sm:mt-6 px-2 sm:px-6 pb-2">
                            <ResponsiveContainer width="100%" height="100%" debounce={50}>
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                            backgroundColor: '#1e293b',
                                            color: '#fff'
                                        }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="completed"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorCompleted)"
                                        animationDuration={1500}
                                        animationBegin={500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Daily Progress */}
                <motion.div variants={fadeInUp}>
                    <Card className="h-full border-none shadow-sm shadow-slate-200/50 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2rem]">
                        <CardHeader className="p-5 sm:p-6">
                            <CardTitle className="text-sm sm:text-lg font-black uppercase tracking-widest">Daily Progress</CardTitle>
                            <CardDescription className="text-[10px] sm:text-sm font-bold">Target Tracking</CardDescription>
                        </CardHeader>
                        <CardContent className="px-5 sm:px-6 pb-6 space-y-4 sm:space-y-6">
                            <div className="space-y-1 sm:space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500 font-black uppercase tracking-widest text-[9px] sm:text-xs">Overall</span>
                                    <span className="font-black text-primary-600">68%</span>
                                </div>
                                <Progress value={68} className="h-1.5 sm:h-2.5 bg-slate-100 dark:bg-slate-800" />
                            </div>

                            <div className="space-y-3 sm:space-y-4 mt-6">
                                <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Actions</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    <motion.div {...scaleOnTap}>
                                        <Button variant="outline" className="w-full justify-start gap-2.5 h-10 sm:h-12 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-xl font-black text-[10px] sm:text-xs">
                                            <div className="p-1 sm:p-1.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 rounded-lg shrink-0">
                                                <Users size={14} className="sm:w-4 sm:h-4" />
                                            </div>
                                            <span className="truncate">Assign Pending Tasks</span>
                                        </Button>
                                    </motion.div>
                                    <motion.div {...scaleOnTap}>
                                        <Button variant="outline" className="w-full justify-start gap-2.5 h-10 sm:h-12 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-xl font-black text-[10px] sm:text-xs">
                                            <div className="p-1 sm:p-1.5 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 rounded-lg shrink-0">
                                                <BarChart3 size={14} className="sm:w-4 sm:h-4" />
                                            </div>
                                            <span className="truncate">Generate Report</span>
                                        </Button>
                                    </motion.div>
                                    <motion.div {...scaleOnTap}>
                                        <Button variant="outline" className="w-full justify-start gap-2.5 h-10 sm:h-12 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-xl font-black text-[10px] sm:text-xs">
                                            <div className="p-1 sm:p-1.5 bg-purple-50 dark:bg-purple-900/40 text-purple-600 rounded-lg shrink-0">
                                                <CalendarIcon size={14} className="sm:w-4 sm:h-4" />
                                            </div>
                                            <span className="truncate">Schedule Meeting</span>
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Admin Follow-ups / Meetings */}
                <motion.div variants={fadeInUp} className="lg:col-span-3">
                    <Card className="border-none shadow-sm shadow-slate-200/50 bg-white dark:bg-slate-900 overflow-hidden rounded-2xl sm:rounded-[2rem]">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 px-5 py-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm sm:text-lg font-black uppercase tracking-widest flex items-center gap-2">
                                    <Clock size={16} className="text-primary-600 shrink-0 sm:w-5 sm:h-5" />
                                    Meetings & Follow-ups
                                </CardTitle>
                                <Badge variant="outline" className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest h-5 sm:h-6">{adminMeetings.length} Scheduled</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6">
                                {adminMeetings.length > 0 ? adminMeetings.slice(0, 6).map(meeting => (
                                    <div key={meeting.id} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary-100 dark:hover:border-primary-900 transition-all group bg-slate-50/30 dark:bg-slate-800/20">
                                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                                            <div className="p-1.5 sm:p-2 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 shrink-0">
                                                <CalendarIcon size={14} className="sm:w-[18px] sm:h-[18px]" />
                                            </div>
                                            <Badge className="text-[7px] sm:text-[9px] bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-100 dark:border-slate-700 font-black uppercase tracking-tighter px-1.5 h-4 sm:h-auto">{meeting.type}</Badge>
                                        </div>
                                        <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white mb-0.5 sm:mb-1 truncate">{meeting.title}</h4>
                                        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} />
                                                <span>{format(new Date(meeting.date), 'MMM dd')} - {meeting.time}</span>
                                            </div>
                                        </div>
                                        {meeting.description && (
                                            <p className="text-[11px] text-slate-400 mt-2 line-clamp-1 italic">"{meeting.description}"</p>
                                        )}
                                    </div>
                                )) : (
                                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 grayscale opacity-50">
                                        <CalendarIcon size={48} className="mb-2" />
                                        <p className="text-sm font-medium">No meetings scheduled with you.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
