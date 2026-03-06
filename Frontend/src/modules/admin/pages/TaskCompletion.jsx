import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Clock,
    MapPin,
    User as UserIcon,
    CheckCircle2,
    AlertCircle,
    MessageSquare,
    History,
    Info,
    ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Separator } from '@/shared/components/ui/separator';

import useTaskStore from '@/store/taskStore';
import useEmployeeStore from '@/store/employeeStore';
import { cn } from '@/shared/utils/cn';

const TaskCompletion = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { tasks } = useTaskStore();
    const { employees } = useEmployeeStore();

    const task = useMemo(() => tasks.find(t => t.id === id), [tasks, id]);

    if (!task) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
                <AlertCircle size={48} className="mb-4 opacity-20" />
                <h2 className="text-xl font-bold">Task Not Found</h2>
                <Button variant="link" onClick={() => navigate('/admin/tasks')}>Go back to tasks</Button>
            </div>
        );
    }

    const priorityColors = {
        low: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Task Details</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">ID: {task.id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Task Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="pb-4">
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-2">
                                <div className="flex gap-2">
                                    <Badge className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", priorityColors[task.priority])}>
                                        {task.priority} Priority
                                    </Badge>
                                    <Badge variant={task.status === 'completed' ? 'default' : 'secondary'} className={cn(
                                        "text-[10px]",
                                        task.status === 'completed' ? "bg-emerald-500 hover:bg-emerald-600" : ""
                                    )}>
                                        {task.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <Clock size={14} />
                                    <span>Due: {format(new Date(task.deadline), 'MMM dd, yyyy')}</span>
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">{task.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                    <Info size={16} className="text-primary-500" />
                                    Description
                                </h4>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                    {task.description || "No description provided for this task."}
                                </p>
                            </div>

                            <Separator className="bg-slate-100 dark:bg-slate-800" />

                            <div>
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Assigned Team Members</h4>
                                <div className="flex flex-wrap gap-4">
                                    {task.assignedTo?.map(empId => {
                                        const emp = employees.find(e => e.id === empId);
                                        return (
                                            <div key={empId} className="flex items-center gap-3 p-2 pr-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                                <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800">
                                                    <AvatarImage src={emp?.avatar} />
                                                    <AvatarFallback>{emp?.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{emp?.name}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{emp?.role}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity Feed placeholder */}
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <History size={18} className="text-primary-500" />
                                Activity Feed
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                                <div className="relative">
                                    <div className="absolute -left-[19px] top-1.5 w-3 h-3 rounded-full bg-primary-500 border-2 border-white dark:border-slate-900" />
                                    <p className="text-xs text-slate-400 mb-1">{format(new Date(task.createdAt), 'MMM dd, HH:mm')}</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        Task created by <span className="font-semibold">Admin</span>
                                    </p>
                                </div>

                                {task.status === 'completed' && (
                                    <div className="relative">
                                        <div className="absolute -left-[19px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                                        <p className="text-xs text-slate-400 mb-1">{format(new Date(task.completedAt), 'MMM dd, HH:mm')}</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">
                                            Task marked as <span className="text-emerald-500 font-semibold uppercase">completed</span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Input placeholder="Add a comment..." className="bg-slate-50 border-none dark:bg-slate-800" />
                                <Button size="icon" variant="secondary"><MessageSquare size={16} /></Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Completion Analysis & Map */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                        <CardHeader className="bg-primary-600 text-white">
                            <CardTitle className="text-lg font-bold">Submission Info</CardTitle>
                            <CardDescription className="text-primary-100">Verification details</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {task.status === 'completed' ? (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    <div className="p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-500">Status</span>
                                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:bg-emerald-500/20 dark:border-emerald-900/30">Verified</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-500">Completion Time</span>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                {format(new Date(task.completedAt), 'HH:mm:ss')}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-500">Device ID</span>
                                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">D-882910-X</span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50">
                                        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                            <MapPin size={14} className="text-red-500" />
                                            Submission Location
                                        </div>
                                        <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden group">
                                            <img
                                                src="https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/28.6139,77.2090,12,0/400x250?access_token=pk.placeholder"
                                                alt="Location Map"
                                                className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500"
                                            />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                                <MapPin size={24} className="text-red-500 mb-2 animate-bounce" />
                                                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">28.6139° N, 77.2090° E</p>
                                                <p className="text-[9px] text-slate-500">New Delhi, India</p>
                                            </div>
                                            <Button variant="secondary" size="sm" className="absolute bottom-2 right-2 h-7 text-[10px] gap-1 shadow-lg">
                                                View Detailed <ExternalLink size={10} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-300">
                                        <Clock size={32} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Awaiting Completion</p>
                                        <p className="text-xs text-slate-500">Submission data will appear here once the task is finished.</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TaskCompletion;
