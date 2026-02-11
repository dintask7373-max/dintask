import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckSquare,
    Search,
    Filter,
    Clock,
    AlertCircle,
    CheckCircle2,
    Calendar as CalendarIcon,
    ChevronRight,
    MessageSquare,
    Link as LinkIcon,
    Zap,
    Target,
    Layers,
    Shield,
    Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import useAuthStore from '@/store/authStore';
import useTaskStore from '@/store/taskStore';
import { fadeInUp, staggerContainer } from '@/shared/utils/animations';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';

const MyTasks = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { tasks, fetchTasks, completeTask, updateTask } = useTaskStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    React.useEffect(() => {
        fetchTasks();
    }, []);

    const handleCompleteTask = (taskId) => {
        completeTask(taskId, "Tactical Module", { completedBy: user.id });
        toast.success("Directive fulfilled");
    };

    const myTasks = useMemo(() => {
        const userId = (user?._id || user?.id)?.toString();
        return tasks.filter(t => {
            const isAssignedToMe = Array.isArray(t.assignedTo)
                ? t.assignedTo.some(id => (id._id || id)?.toString() === userId)
                : (t.assignedTo?._id || t.assignedTo)?.toString() === userId;

            const isAssignedByMe = (t.assignedBy?._id || t.assignedBy)?.toString() === userId;

            // Managers see tasks they assigned OR tasks assigned to them
            return isAssignedToMe || isAssignedByMe;
        }).filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [tasks, user, searchTerm, statusFilter]);

    const stats = useMemo(() => {
        const active = myTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
        const overdue = myTasks.filter(t => t.status === 'overdue').length;
        const inReview = myTasks.filter(t => t.status === 'review').length;
        const fulfilled = myTasks.filter(t => t.status === 'completed').length;
        return [
            { label: 'Pending', value: active, color: 'primary' },
            { label: 'Overdue', value: overdue, color: 'rose' },
            { label: 'Review', value: inReview, color: 'amber' },
            { label: 'Fulfilled', value: fulfilled, color: 'emerald' }
        ];
    }, [myTasks]);

    return (
        <div className="space-y-4 sm:space-y-6 pb-12 transition-all duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-3 text-left">
                    <div className="lg:hidden size-9 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                        <img src="/dintask-logo.png" alt="DinTask" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                            Personal <span className="text-primary-600">Objectives</span>
                        </h1>
                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-1 leading-none">
                            Direct management directives
                        </p>
                    </div>
                </div>
            </div>

            {/* Status Overview Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                        <CardContent className="p-3 sm:p-4 text-left">
                            <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                            <p className={cn("text-lg sm:text-xl font-black leading-none",
                                stat.color === 'primary' ? 'text-primary-600' :
                                    stat.color === 'rose' ? 'text-rose-600' :
                                        stat.color === 'amber' ? 'text-amber-500' : 'text-emerald-600'
                            )}>{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tactical Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <Input
                        placeholder="Search objectives..."
                        className="pl-11 h-11 bg-white dark:bg-slate-900 border-none shadow-xl shadow-slate-200/20 dark:shadow-none rounded-2xl font-bold text-xs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-none overflow-x-auto no-scrollbar">
                    {['all', 'pending', 'overdue', 'review', 'completed'].map((status) => (
                        <Button
                            key={status}
                            variant="ghost"
                            size="sm"
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                "h-9 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all",
                                statusFilter === status
                                    ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Task Grid - High Density List */}
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid gap-3"
            >
                <AnimatePresence mode="popLayout">
                    {myTasks.length > 0 ? myTasks.map((task) => (
                        <motion.div key={task.id} variants={fadeInUp} layout>
                            <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-[1.5rem] overflow-hidden group hover:scale-[1.005] transition-all">
                                <CardContent className="p-0">
                                    <div className="flex">
                                        <div className={cn(
                                            "w-1.5 sm:w-2 shrink-0 transition-colors",
                                            task.priority === 'urgent' ? 'bg-red-500' :
                                                task.priority === 'high' ? 'bg-orange-500' :
                                                    task.priority === 'medium' ? 'bg-primary-500' : 'bg-slate-200'
                                        )} />
                                        <div className="flex-1 p-4 sm:p-5 text-left">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-4 flex-1 overflow-hidden">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge variant="ghost" className="bg-slate-50 text-slate-400 dark:bg-slate-800 text-[8px] font-black uppercase tracking-widest px-2 h-4">
                                                            P: {task.priority}
                                                        </Badge>
                                                        {task.team && (
                                                            <Badge className="bg-indigo-50 text-indigo-600 border-none text-[8px] font-black uppercase tracking-widest px-2 h-4">
                                                                TEAM: {task.team.name}
                                                            </Badge>
                                                        )}
                                                        {task.status === 'completed' && (
                                                            <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black uppercase tracking-widest px-2 h-4">
                                                                FULFILLED
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors uppercase leading-none mb-2 truncate">
                                                            {task.title}
                                                        </h3>
                                                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                                                            {task.description}
                                                        </p>
                                                        {task.status === 'review' && task.submissionNote && (
                                                            <div className="mt-2 p-2 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100/50 dark:border-emerald-800/30">
                                                                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1 opacity-70">Evidence Statement:</p>
                                                                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 line-clamp-2">
                                                                    "{task.submissionNote}"
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                        <div className="flex items-center gap-1.5">
                                                            <CalendarIcon size={12} className="text-primary-500" />
                                                            {format(new Date(task.deadline), "MMM dd, yyyy").toUpperCase()}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Target size={12} className="text-indigo-500" />
                                                            {task.labels?.[0]?.toUpperCase() || 'CORE'}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock size={12} className="text-amber-500" />
                                                            INIT: {format(new Date(task.createdAt), "MMM dd").toUpperCase()}
                                                        </div>
                                                        {task.attachments?.length > 0 && (
                                                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-black uppercase tracking-widest">
                                                                <Paperclip size={10} />
                                                                {task.attachments.length} ASSETS
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-3 shrink-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary-600"
                                                        onClick={() => navigate(`/manager/projects/${task.project}`)}
                                                    >
                                                        <ChevronRight size={18} />
                                                    </Button>
                                                    {task.status === 'review' && (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                                                                onClick={() => {
                                                                    updateTask(task.id, { status: 'completed', progress: 100 });
                                                                    toast.success("Directive Approved");
                                                                }}
                                                            >
                                                                APPROVE
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-rose-500/20"
                                                                onClick={() => {
                                                                    updateTask(task.id, { status: 'in_progress', progress: 50 });
                                                                    toast.error("Directive Sent for Correction");
                                                                }}
                                                            >
                                                                REJECT
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {task.status !== 'completed' && task.status !== 'review' && (
                                                        <Button
                                                            size="sm"
                                                            className="h-8 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                                                            onClick={() => {
                                                                updateTask(task.id, { status: 'completed', progress: 100 });
                                                                toast.success("Directive fulfilled");
                                                            }}
                                                        >
                                                            FULFILL
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )) : (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                            <div className="size-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-slate-200" />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Zero Objectives Found</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1 italic">
                                Mission queue currently empty
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default MyTasks;
