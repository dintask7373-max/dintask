import React from 'react';
import { format } from 'date-fns';
import { Clock, MessageSquare, Paperclip, CheckCircle2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';

const TaskCardNew = ({ task, onClick, managers = [] }) => {
    // Priority Badge Styles - matching user's HTML classes
    const priorityConfig = {
        low: { label: 'Low', color: 'bg-green-100 text-green-600' },
        medium: { label: 'Medium', color: 'bg-orange-100 text-orange-600' },
        high: { label: 'High Priority', color: 'bg-red-100 text-red-600' },
        urgent: { label: 'Urgent', color: 'bg-red-100 text-red-600' }
    };

    const config = priorityConfig[task.priority] || priorityConfig.low;
    const isCompleted = task.status === 'completed';

    // Get Assigner Info
    const assigner = task.assignedBy === 'self'
        ? { name: 'Self', isSelf: true }
        : task.delegatedBy
            ? managers.find(m => m.id === task.delegatedBy) || { name: 'Manager' }
            : { name: 'Admin', isAdmin: true };

    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col gap-3 rounded-xl bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide", config.color)}>
                        {config.label}
                    </span>
                    {task.labels && task.labels.map((label, index) => (
                        <span
                            key={index}
                            className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                                label === 'Self Task'
                                    ? "bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800"
                                    : "bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                            )}
                        >
                            {label}
                        </span>
                    ))}
                </div>
                <div className="flex size-6 items-center justify-center">
                    <input
                        type="checkbox"
                        checked={isCompleted}
                        readOnly
                        className="size-5 rounded-full border-slate-300 text-primary focus:ring-primary/20 cursor-pointer transition-all"
                    />
                </div>
            </div>

            <div className={cn("flex flex-col gap-1", isCompleted && "opacity-60")}>
                <p className={cn(
                    "text-text-main dark:text-white text-base font-bold leading-tight",
                    isCompleted && "line-through"
                )}>
                    {task.title}
                </p>
                <div className="flex items-center gap-1.5 text-text-secondary dark:text-gray-400">
                    <Clock size={16} />
                    <p className="text-xs font-medium">
                        {isCompleted
                            ? `Completed at ${format(new Date(), 'h:mm a')}`
                            : `Due ${format(new Date(task.deadline), 'MMM dd, h:mm a')}`
                        }
                    </p>
                </div>
            </div>

            <div className={cn("flex items-center justify-between pt-2 mt-1 border-t border-slate-50 dark:border-slate-700", isCompleted ? "opacity-50" : "")}>
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {task.assignedTo && task.assignedTo.length > 0 ? (
                            task.assignedTo.slice(0, 3).map((u, i) => (
                                <Avatar key={i} className="h-7 w-7 border-2 border-white dark:border-slate-800">
                                    <AvatarFallback className="text-[9px] bg-slate-100 text-slate-500">U</AvatarFallback>
                                </Avatar>
                            ))
                        ) : (
                            <div className="size-7 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 flex items-center justify-center">
                                <span className="text-[9px] font-bold text-gray-500">A</span>
                            </div>
                        )}
                    </div>

                    {/* Assigner Info */}
                    <div className="flex items-center gap-1.5 ml-2 border-l border-slate-100 dark:border-slate-700 pl-3">
                        <div className={cn(
                            "size-1.5 rounded-full",
                            assigner.isSelf ? "bg-emerald-500" :
                                assigner.isAdmin ? "bg-amber-500" : "bg-primary-500"
                        )} />
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                            By: {assigner.name}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-primary">
                        <MessageSquare size={16} />
                        <span className="text-[10px] font-bold">2</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskCardNew;
