import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
    LayoutDashboard,
    CheckSquare,
    Users,
    BarChart3,
    Clock,
    AlertCircle,
    TrendingUp,
    Calendar as CalendarIcon,
    ArrowRight,
    Zap,
    Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import useTaskStore from '@/store/taskStore';
import useEmployeeStore from '@/store/employeeStore';
import useProjectStore from '@/store/projectStore';
import { fadeInUp, staggerContainer } from '@/shared/utils/animations';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils/cn';

const ManagerDashboard = () => {
    const { user } = useAuthStore();
    const tasks = useTaskStore(state => state.tasks);
    const employees = useEmployeeStore(state => state.employees);
    const { projects, fetchProjects } = useProjectStore();
    const navigate = useNavigate();

    React.useEffect(() => {
        fetchProjects();
    }, []);

    // Manager statistics
    const stats = useMemo(() => {
        const managerTasks = tasks.filter(t => t.assignedToManager === user?.id);
        const teamTasks = tasks.filter(t => t.delegatedBy === user?.id);
        const myTasksToComplete = managerTasks.filter(t => !t.delegatedBy);

        const completedTeamTasks = teamTasks.filter(t => t.status === 'completed');
        const completionRate = teamTasks.length > 0
            ? Math.round((completedTeamTasks.length / teamTasks.length) * 100)
            : 0;

        return [
            {
                title: 'Personal Backlog',
                value: myTasksToComplete.length,
                icon: CheckSquare,
                color: 'text-primary-600',
                bg: 'bg-primary-50 dark:bg-primary-900/10',
                trend: 'Direct Assignments'
            },
            {
                title: 'Queue Depth',
                value: managerTasks.filter(t => !t.delegatedBy && t.status !== 'completed').length,
                icon: Zap,
                color: 'text-amber-600',
                bg: 'bg-amber-50 dark:bg-amber-900/10',
                trend: 'Priority Sync'
            },
            {
                title: 'Team Velocity',
                value: `${completionRate}%`,
                icon: TrendingUp,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50 dark:bg-emerald-900/10',
                trend: 'Yield Rate'
            },
            {
                title: 'Active Force',
                value: employees.filter(e => e.managerId === user?.id && e.status === 'active').length,
                icon: Users,
                color: 'text-indigo-600',
                bg: 'bg-indigo-50 dark:bg-indigo-900/10',
                trend: `Units Online`
            }
        ];
    }, [tasks, employees, user]);

    return (
        <div className="space-y-4 sm:space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-3">
                    <div className="lg:hidden size-9 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                        <img src="/dintask-logo.png" alt="DinTask" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                            Manager <span className="text-primary-600">Sync</span>
                        </h1>
                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-1 leading-none">
                            Team operation status: Nominal
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none h-9 rounded-xl border-slate-200 dark:border-slate-800 font-black text-[9px] uppercase tracking-widest"
                        onClick={() => navigate('/manager/schedule')}
                    >
                        <CalendarIcon size={14} className="mr-2" />
                        Timeline
                    </Button>
                    <Button
                        size="sm"
                        className="flex-1 sm:flex-none h-9 rounded-xl bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20 font-black text-[9px] uppercase tracking-widest text-white"
                        onClick={() => navigate('/manager/delegation')}
                    >
                        <CheckSquare size={14} className="mr-2" />
                        Delegate
                    </Button>
                </div>
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
                        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden group">
                            <CardContent className="p-3.5 sm:p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={cn("p-1.5 rounded-lg", stat.bg)}>
                                        <stat.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", stat.color)} />
                                    </div>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">
                                        Live
                                    </span>
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">
                                        {stat.title}
                                    </h3>
                                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                                        {stat.value}
                                    </div>
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter italic">
                                        {stat.trend}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Content Grid */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                {/* Recent Tasks Activity */}
                <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                    <CardHeader className="py-4 px-5 sm:px-6 flex flex-row items-center justify-between border-b border-slate-50 dark:border-slate-800">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                            <Clock className="text-primary-500" size={14} />
                            Operational Flow
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-3 rounded-lg text-primary-600 hover:bg-primary-50 font-black text-[9px] uppercase tracking-widest"
                            onClick={() => navigate('/manager/progress')}
                        >
                            Log <ArrowRight size={10} className="ml-1" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {tasks.filter(t => t.delegatedBy === user?.id).slice(0, 5).map((task) => (
                                <div key={task.id} className="p-3 sm:p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-1 h-8 rounded-full",
                                            task.priority === 'urgent' ? 'bg-red-500' :
                                                task.priority === 'high' ? 'bg-orange-500' : 'bg-primary-500'
                                        )} />
                                        <div>
                                            <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-none mb-1.5">{task.title}</h4>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                Assignee: {employees.find(e => e.id === task.assignedTo?.[0])?.name || 'Multiple Units'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <div className="text-[10px] font-black text-slate-900 dark:text-white tracking-widest">{task.progress}%</div>
                                        <Progress value={task.progress} className="w-16 sm:w-20 h-1 bg-slate-100 dark:bg-slate-800" />
                                    </div>
                                </div>
                            ))}
                            {tasks.filter(t => t.delegatedBy === user?.id).length === 0 && (
                                <div className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                                    No active tactical deployments
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Team Workload Matrix */}
                <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden h-fit">
                    <CardHeader className="py-4 px-5 border-b border-slate-50 dark:border-slate-800">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Force Workload</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 space-y-4">
                        {employees.filter(e => e.managerId === user?.id).map((member) => {
                            const memberTasks = tasks.filter(t => t.assignedTo?.includes(member.id));
                            const completionPercentage = memberTasks.length > 0
                                ? Math.round((memberTasks.filter(t => t.status === 'completed').length / memberTasks.length) * 100)
                                : 0;

                            return (
                                <div key={member.id} className="p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-800/50 group hover:border-primary-500/30 transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="size-8 rounded-xl overflow-hidden shadow-sm border border-white">
                                                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase leading-none block">{member.name}</span>
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{memberTasks.length} Units</span>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-[8px] font-black h-4 px-1.5 border-slate-200">
                                            SYNCED
                                        </Badge>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                            <span>Efficiency Rate</span>
                                            <span className="text-primary-600 font-black">{completionPercentage}%</span>
                                        </div>
                                        <Progress value={completionPercentage} className="h-1 bg-white dark:bg-slate-700" />
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Active Projects Quick Access */}
                <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden h-fit lg:col-span-3">
                    <CardHeader className="py-4 px-5 flex flex-row items-center justify-between border-b border-slate-50 dark:border-slate-800">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 flex items-center gap-2">
                            <Briefcase size={14} />
                            Active Operational Units (Projects)
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-3 rounded-lg text-primary-600 hover:bg-primary-50 font-black text-[9px] uppercase tracking-widest"
                            onClick={() => navigate('/manager/projects')}
                        >
                            View All <ArrowRight size={10} className="ml-1" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.filter(p => p.status === 'active').slice(0, 3).map(project => (
                            <div key={project._id} className="p-4 rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group hover:border-primary-500 transition-all cursor-pointer" onClick={() => navigate(`/manager/projects/${project._id}`)}>
                                <div className="flex justify-between items-start mb-3">
                                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-emerald-200 text-emerald-600 bg-emerald-50">
                                        ACTIVE
                                    </Badge>
                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                        {project.deadline ? format(new Date(project.deadline), 'MMM dd') : 'NO DEADLINE'}
                                    </div>
                                </div>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase mb-1 truncate">{project.name}</h4>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <Users size={10} /> {project.clientCompany || 'Independent'}
                                </p>
                            </div>
                        ))}
                        {projects.filter(p => p.status === 'active').length === 0 && (
                            <div className="col-span-full py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                                Zero Active Projects Detected
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ManagerDashboard;
