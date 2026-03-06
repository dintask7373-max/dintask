import React from 'react';
import { format } from 'date-fns';
import { Clock, MessageSquare, Paperclip, CheckCircle2, Repeat } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';

const TaskCardNew = ({ task, onClick, managers = [] }) => {
    // Premium Color System: More vibrant ("color-full") and outlined
    const priorityConfig = {
        low: {
            label: 'Low',
            base: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
            border: 'border-emerald-100 dark:border-emerald-900/50',
            accent: 'bg-emerald-500',
            glow: 'rgba(16,185,129,0.1)'
        },
        medium: {
            label: 'Medium',
            base: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
            border: 'border-blue-100 dark:border-blue-900/50',
            accent: 'bg-blue-500',
            glow: 'rgba(59,130,246,0.1)'
        },
        high: {
            label: 'High Priority',
            base: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
            border: 'border-amber-100 dark:border-amber-900/50',
            accent: 'bg-amber-500',
            glow: 'rgba(245,158,11,0.1)'
        },
        urgent: {
            label: 'Urgent',
            base: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
            border: 'border-rose-100 dark:border-rose-900/50',
            accent: 'bg-rose-500',
            glow: 'rgba(244,63,94,0.1)'
        }
    };

    const config = priorityConfig[task.priority] || priorityConfig.low;
    const isCompleted = task.status === 'completed';
    const isOverdue = task.status === 'overdue';

    // Get Assigner Info
    const assigner = task.assignedBy === 'self'
        ? { name: 'Self', isSelf: true }
        : task.delegatedBy
            ? managers.find(m => m.id === task.delegatedBy) || { name: 'Manager' }
            : { name: 'Admin', isAdmin: true };

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative flex flex-col gap-3 rounded-[1.5rem] p-4 border transition-all duration-300 cursor-pointer overflow-hidden",
                isOverdue
                    ? "bg-rose-50/30 dark:bg-rose-950/10 border-rose-200 dark:border-rose-800 shadow-lg shadow-rose-500/5"
                    : isCompleted
                        ? "bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800"
                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1"
            )}
            style={{
                boxShadow: !isCompleted && !isOverdue ? `0 8px 15px -10px ${config.glow}` : undefined
            }}
        >
            {/* Visual Accent Bar */}
            <div className={cn(
                "absolute top-0 left-0 w-1 h-full transition-all duration-300 group-hover:w-1.5",
                isCompleted ? "bg-slate-300 dark:bg-slate-700" : config.accent
            )} />

            {/* Design Ornament Glow - Smaller blurred area */}
            <div className={cn(
                "absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-15 transition-opacity group-hover:opacity-30",
                isCompleted ? "bg-slate-400" : config.accent
            )} />

            <div className="flex justify-between items-start relative z-10 pl-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className={cn(
                        "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border shadow-sm transition-all",
                        config.base
                    )}>
                        {config.label}
                    </span>
                    {isOverdue && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-rose-600 text-white shadow-lg shadow-rose-500/30 border border-rose-500">
                            Overdue
                        </span>
                    )}
                </div>

                <div className="flex shrink-0">
                    <div className={cn(
                        "size-5.5 rounded-lg flex items-center justify-center transition-all duration-300 border-[1.5px]",
                        isCompleted
                            ? "bg-[#4461f2] border-[#4461f2] shadow-md shadow-[#4461f2]/20"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 group-hover:border-[#4461f2]/50"
                    )}>
                        {isCompleted && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                </div>
            </div>

            <div className={cn("flex flex-col gap-1.5 relative z-10 pl-1.5", isCompleted && "opacity-60")}>
                <h3 className={cn(
                    "text-slate-800 dark:text-white text-base font-black leading-tight tracking-tight",
                    isCompleted && "line-through decoration-[2px] decoration-[#4461f2]/30"
                )}>
                    {task.title}
                </h3>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Clock size={14} className={cn(isOverdue ? "text-rose-500" : "text-slate-300")} />
                    <p className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        isOverdue && "text-rose-500"
                    )}>
                        {isCompleted
                            ? `Done at ${format(new Date(), 'h:mm a')}`
                            : `${format(new Date(task.deadline), 'MMM dd • h:mm a')}`
                        }
                    </p>
                </div>
            </div>

            <div className={cn(
                "flex items-center justify-between pt-3 mt-1 border-t transition-colors relative z-10 pl-1.5",
                isOverdue ? "border-rose-200/50 dark:border-rose-800/50" : "border-slate-100 dark:border-slate-800"
            )}>
                <div className="flex items-center gap-2.5">
                    <Avatar className="h-6.5 w-6.5 border-2 border-white dark:border-slate-900 ring-1 ring-slate-100 dark:ring-slate-800 shadow-sm">
                        <AvatarFallback className="text-[8px] font-black bg-slate-100 text-slate-500">U</AvatarFallback>
                    </Avatar>

                    <div className="flex items-center gap-2 border-l border-slate-100 dark:border-slate-800 pl-2.5">
                        <div className={cn(
                            "size-1.5 rounded-full shadow-[0_0_5px]",
                            assigner.isSelf ? "bg-emerald-500 shadow-emerald-500/50" :
                                assigner.isAdmin ? "bg-amber-500 shadow-amber-500/50" : "bg-[#4461f2] shadow-blue-500/50"
                        )} />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            {assigner.name}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3.5">
                    {task.attachments?.length > 0 && (
                        <div className="flex items-center gap-1 text-slate-400 group-hover:text-emerald-500 transition-colors">
                            <Paperclip size={14} strokeWidth={2.5} />
                            <span className="text-[9px] font-black">{task.attachments.length}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskCardNew;
