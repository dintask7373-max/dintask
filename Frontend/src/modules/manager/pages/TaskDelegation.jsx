import React, { useMemo, useState } from 'react';
import {
    Users,
    Search,
    Filter,
    Clock,
    AlertCircle,
    CheckCircle2,
    Calendar as CalendarIcon,
    ChevronRight,
    ArrowRightLeft,
    UserPlus,
    UserMinus,
    MessageSquare,
    MoreVertical,
    Zap,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import useTaskStore from '@/store/taskStore';
import useEmployeeStore from '@/store/employeeStore';
import { fadeInUp, staggerContainer } from '@/shared/utils/animations';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { cn } from '@/shared/utils/cn';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/shared/components/ui/dialog";
import { toast } from 'sonner';

const TaskDelegation = () => {
    const { user } = useAuthStore();
    const tasks = useTaskStore(state => state.tasks);
    const delegateTaskToEmployee = useTaskStore(state => state.delegateTaskToEmployee);
    const employees = useEmployeeStore(state => state.employees);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelegateClick = (task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleDelegateTask = (employeeId) => {
        if (!selectedTask) return;
        delegateTaskToEmployee(selectedTask.id, employeeId, user.id, "Delegated via Tactical Command Node");
        toast.success(`Task deployment confirmed`);
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    const pendingTasks = useMemo(() => {
        return tasks.filter(t =>
            t.assignedToManager === user?.id &&
            !t.delegatedBy &&
            t.status !== 'completed'
        ).filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [tasks, user, searchTerm]);

    const delegatedTasks = useMemo(() => {
        return tasks.filter(t =>
            t.delegatedBy === user?.id
        ).filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [tasks, user, searchTerm]);

    const teamMembers = useMemo(() => {
        return employees.filter(e => e.managerId === user?.id);
    }, [employees, user]);

    return (
        <div className="space-y-4 sm:space-y-6 pb-12">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-3">
                    <div className="lg:hidden size-9 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                        <img src="/src/assets/dintask_logo_-removebg-preview.png" alt="DinTask" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                            Delegation <span className="text-primary-600">Terminal</span>
                        </h1>
                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-1 leading-none">
                            Operational task redistribution
                        </p>
                    </div>
                </div>
            </div>

            {/* Tactical Search & Oversight */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <Input
                        placeholder="Search deployment queue..."
                        className="pl-11 h-11 bg-white dark:bg-slate-900 border-none shadow-xl shadow-slate-200/20 dark:shadow-none rounded-2xl font-bold text-xs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 h-11 bg-white dark:bg-slate-900 px-4 rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-none">
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{pendingTasks.length} PENDING</span>
                    </div>
                    <div className="w-px h-3 bg-slate-100 dark:bg-slate-800" />
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-primary-500" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{delegatedTasks.length} DEPLOYED</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Pending Delegation Grid */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <ArrowRightLeft className="text-amber-500" size={16} />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Assignment Queue</h2>
                    </div>

                    <div className="grid gap-3">
                        {pendingTasks.length > 0 ? pendingTasks.map((task) => (
                            <Card key={task.id} className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[1.5rem] overflow-hidden group hover:border-l-4 hover:border-l-amber-500 transition-all">
                                <CardContent className="p-4 sm:p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1.5 flex-1 overflow-hidden text-left">
                                            <h3 className="font-black text-[11px] sm:text-xs text-slate-900 dark:text-white uppercase leading-tight group-hover:text-amber-600 transition-colors truncate">
                                                {task.title}
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                    <Clock size={10} className="text-amber-500" />
                                                    DUE: {new Date(task.deadline).toLocaleDateString().toUpperCase()}
                                                </span>
                                                <Badge variant="ghost" className={cn(
                                                    "text-[8px] font-black uppercase h-4 px-1.5",
                                                    task.priority === 'urgent' ? 'bg-red-50 text-red-500' : 'bg-primary-50 text-primary-600'
                                                )}>
                                                    {task.priority}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-black text-[9px] uppercase tracking-widest shrink-0"
                                            onClick={() => handleDelegateClick(task)}
                                        >
                                            <UserPlus size={12} className="mr-1.5" /> DEPLOY
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )) : (
                            <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Queue Vacuum Detected</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Delegated Task Repository */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1 text-left">
                        <CheckCircle2 className="text-emerald-500" size={16} />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Deployed Assets</h2>
                    </div>

                    <div className="grid gap-3">
                        {delegatedTasks.length > 0 ? delegatedTasks.map((task) => {
                            const assignee = teamMembers.find(e => task.assignedTo?.includes(e.id));
                            return (
                                <Card key={task.id} className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[1.5rem] overflow-hidden group hover:bg-slate-50/50 transition-all opacity-80 hover:opacity-100">
                                    <CardContent className="p-3 sm:p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="relative shrink-0">
                                                    <Avatar className="size-9 rounded-xl border-2 border-white dark:border-slate-800 shadow-sm">
                                                        <AvatarImage src={assignee?.avatar} />
                                                        <AvatarFallback className="bg-primary-50 text-primary-600 font-black text-[10px]">
                                                            {assignee?.name?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="absolute -bottom-1 -right-1 size-3.5 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center border border-slate-100">
                                                        <CheckCircle2 className="text-emerald-500" size={10} />
                                                    </div>
                                                </div>
                                                <div className="min-w-0 flex-1 text-left overflow-hidden">
                                                    <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase leading-none mb-1 truncate">
                                                        {task.title}
                                                    </h3>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">
                                                        LINKED TO: <span className="text-primary-600">{assignee?.name}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge variant="outline" className="text-[8px] font-black h-4 px-1.5 border-slate-200 uppercase tracking-tighter">
                                                    {task.status}
                                                </Badge>

                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        }) : (
                            <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Force Zero</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delegation Modal - Premium Tactical */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden font-sans">
                    <div className="bg-slate-900 p-6 text-white border-b-4 border-primary-600">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                            <Shield className="text-primary-500" size={20} />
                            Asset Allocation
                        </DialogTitle>
                        <DialogDescription className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 italic">
                            RE-ASSIGNING OBJECTIVE: {selectedTask?.title}
                        </DialogDescription>
                    </div>
                    <div className="p-6 bg-white dark:bg-slate-900 max-h-[60vh] overflow-y-auto">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Select Operations Asset</p>
                        <div className="grid gap-2">
                            {teamMembers.map(member => (
                                <button
                                    key={member.id}
                                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group text-left"
                                    onClick={() => handleDelegateTask(member.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="size-8 rounded-xl">
                                            <AvatarImage src={member.avatar} />
                                            <AvatarFallback className="font-black text-[10px]">{member.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase leading-none mb-1">{member.name}</p>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{member.role}</p>
                                        </div>
                                    </div>
                                    <div className="size-6 rounded-lg bg-slate-50 group-hover:bg-primary-600 group-hover:text-white flex items-center justify-center transition-colors">
                                        <ChevronRight size={14} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="h-9 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest italic">Abort Sync</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TaskDelegation;
