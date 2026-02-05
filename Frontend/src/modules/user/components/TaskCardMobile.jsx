import React from 'react';
import {
    Clock,
    Calendar as CalendarIcon,
    Flag,
    ChevronRight,
    CheckCircle2,
    Users
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { cn } from '@/shared/utils/cn';

const TaskCardMobile = ({ task, onClick }) => {
    const priorityColors = {
        low: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
        medium: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
        high: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
        urgent: "text-red-600 bg-red-50 dark:bg-red-900/20"
    };

    const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'completed';

    return (
        <Card
            className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 active:scale-[0.98] transition-all cursor-pointer overflow-hidden border-l-4"
            style={{ borderLeftColor: task.priority === 'urgent' ? '#ef4444' : task.priority === 'high' ? '#f97316' : '#3b82f6' }}
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-widest px-1.5 py-0 border-none", priorityColors[task.priority])}>
                        {task.priority}
                    </Badge>
                    {task.status === 'completed' ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                    ) : isOverdue ? (
                        <Badge className="bg-red-500 text-[9px] px-1.5 py-0">Overdue</Badge>
                    ) : (
                        <div className="flex items-center gap-1 text-slate-400">
                            <Clock size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">Today</span>
                        </div>
                    )}
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2">
                    {task.title}
                </h3>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <CalendarIcon size={12} className="text-primary-500" />
                        <span className={cn(isOverdue && "text-red-500 font-bold")}>
                            {format(new Date(task.deadline), 'MMM dd')}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-1.5">
                            {task.assignedTo?.slice(0, 2).map((empId, i) => (
                                <Avatar key={empId} className="h-5 w-5 border border-white dark:border-slate-900 shadow-sm">
                                    <AvatarFallback className="text-[8px]">U</AvatarFallback>
                                </Avatar>
                            ))}
                            {task.assignedTo?.length > 2 && (
                                <div className="h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-800 border border-white dark:border-slate-900 flex items-center justify-center text-[7px] font-bold text-slate-500">
                                    +{task.assignedTo.length - 2}
                                </div>
                            )}
                        </div>
                        <ChevronRight size={16} className="text-slate-300" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default TaskCardMobile;
