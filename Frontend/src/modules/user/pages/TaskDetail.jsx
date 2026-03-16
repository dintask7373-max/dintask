import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Clock,
    Calendar as CalendarIcon,
    MapPin,
    MessageSquare,
    Users,
    Send,
    CheckCircle2,
    AlertTriangle,
    Flag,
    MoreVertical,
    Activity,
    Shield,
    ChevronRight,
    User,
    Paperclip,
    FileText,
    X,
    Loader2,
    Repeat
} from 'lucide-react';
import api from '@/lib/api';
import { format, isAfter } from 'date-fns';
import { toast } from 'sonner';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/components/ui/dialog";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter
} from "@/shared/components/ui/sheet";
import useTaskStore from '@/store/taskStore';
import useEmployeeStore from '@/store/employeeStore';
import useAuthStore from '@/store/authStore';
import useManagerStore from '@/store/managerStore';
import useChatStore from '@/store/chatStore';
import useNotificationStore from '@/store/notificationStore';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TaskDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { tasks, updateTask, addComment } = useTaskStore();
    const { employees } = useEmployeeStore();
    const { managers } = useManagerStore();
    const { user } = useAuthStore();
    const addNotification = useNotificationStore(state => state.addNotification);



    const task = useMemo(() => tasks.find(t => t.id === id), [tasks, id]);

    const sendMessage = useChatStore(state => state.sendMessage);



    const [submissionNote, setSubmissionNote] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

    // Discussion State
    const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);
    const [newMessage, setNewMessage] = useState('');

    // Individual Progress State
    const [myProgress, setMyProgress] = useState(0);
    const [myStatusNote, setMyStatusNote] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Initialize individual progress
    React.useEffect(() => {
        if (task) {
            // Find user's subtask if available (for group tasks)
            const mySubTask = task.subTasks?.find(st => st.user?._id === user?.id || st.user === user?.id);
            if (mySubTask) {
                setMyProgress(mySubTask.progress || 0);
            } else {
                setMyProgress(task.progress || 0);
            }
            setMyStatusNote(task.statusNotes || '');
        }
    }, [task, user]);

    const handleUpdateProgress = async () => {
        setIsUpdating(true);
        try {
            await updateTask(task.id, {
                progress: myProgress,
                statusNotes: myStatusNote,
                // Automatically set status to 'in_progress' if progress > 0 and was pending
                status: (task.status === 'pending' && myProgress > 0) ? 'in_progress' : undefined
            });
        } catch (error) {
            // Error handled by store
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !task) return;

        await addComment(task.id, {
            text: newMessage,
            sender: user?.name || 'User',
            senderId: user?.id,
            role: user?.role
        });

        setNewMessage('');
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        try {
            const res = await api('/upload/multiple', {
                method: 'POST',
                body: formData
            });

            if (res.success) {
                const newAttachments = files.map((file, idx) => ({
                    name: file.name,
                    url: res.urls[idx]
                }));
                setAttachments(prev => [...prev, ...newAttachments]);
                toast.success(`${files.length} file(s) attached to deployment`);
            }
        } catch (error) {
            // Error handled by Toast in generic API catch or not needed if specific
        } finally {
            setIsUploading(false);
        }
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const getAssetUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        // Ensure starting slash
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${API_ROOT}${path}`;
    };

    const isAssignee = task?.assignedTo?.includes(user?.id) || task?.assignedTo?.some(u => u._id === user?.id);
    const isManager = (user?.role === 'manager' && (task?.assignedBy === user?.id || task?.assignedBy?._id === user?.id)) || user?.role === 'admin';
    const mySubTask = task?.subTasks?.find(st => st.user?._id === user?.id || st.user === user?.id);

    const handleMarkComplete = () => {
        setIsSubmittingReview(true);
        updateTask(task.id, {
            status: 'review',
            progress: 90,
            submissionNote: submissionNote,
            attachments: [...(task.attachments || []), ...attachments]
        });
        setIsSubmitDialogOpen(false);

        // Notify the manager
        if (task.delegatedBy || task.assignedBy) {
            addNotification({
                title: 'Task Review Requested',
                description: `${user?.name} submitted: "${task.title}" for approval`,
                category: 'task',
                recipientId: task.delegatedBy || task.assignedBy
            });
        }

        toast.success('Task submitted for review!');
    };

    if (!task) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-background-light dark:bg-background-dark">
                <AlertTriangle size={48} className="mb-4 opacity-20" />
                <h2 className="text-xl font-bold text-text-main dark:text-white">Task Expired or Not Found</h2>
                <Button variant="link" onClick={() => navigate('/employee')} className="mt-2 text-primary">Back to Dashboard</Button>
            </div>
        );
    }

    const priorityConfig = {
        low: { label: 'Low', color: 'bg-green-100 text-green-600' },
        medium: { label: 'Medium', color: 'bg-orange-100 text-orange-600' },
        high: { label: 'High Priority', color: 'bg-red-100 text-red-600' },
        urgent: { label: 'Urgent', color: 'bg-red-100 text-red-600' }
    };
    const pConfig = priorityConfig[task.priority] || priorityConfig.low;

    return (
        <div className="bg-white dark:bg-slate-950 min-h-screen pb-32 font-display text-text-main dark:text-gray-100">

            {/* Main Content Area */}
            <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-2">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8 items-start">

                    {/* Main Column */}
                    <div className="lg:col-span-8 space-y-4 md:space-y-6">
                        {/* Back Button */}
                        <div className="mb-2">
                            <Button
                                variant="ghost"
                                onClick={() => navigate(-1)}
                                className="pl-0 hover:bg-transparent hover:text-primary gap-2 text-slate-400 transition-colors"
                            >
                                <ArrowLeft size={20} />
                                <span className="text-xs font-black uppercase tracking-widest">Back to Command</span>
                            </Button>
                        </div>

                        {/* Header Section */}
                        <div className="mb-2">
                            <div className="flex flex-wrap gap-2.5 mb-4">
                                <div className={cn("flex h-7 items-center justify-center rounded-full px-3 border-2 border-transparent", pConfig.color)}>
                                    <p className="text-[10px] font-black uppercase tracking-wider">{pConfig.label}</p>
                                </div>
                                {task.team && (
                                    <div className={cn("flex h-7 items-center justify-center rounded-full px-3 bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400")}>
                                        <p className="text-[10px] font-black uppercase tracking-wider">TEAM: {task.team.name}</p>
                                    </div>
                                )}
                                <div className={cn("flex h-7 items-center justify-center rounded-full px-3 border-2",
                                    task.status === 'overdue' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                        task.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                            task.status === 'in_progress' ? "bg-sky-50 text-sky-600 border-sky-100" :
                                                task.status === 'review' ? "bg-purple-50 text-purple-600 border-purple-100" :
                                                    task.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                        "bg-slate-50 text-slate-500 border-slate-100"
                                )}>
                                    <p className="text-[10px] font-black uppercase tracking-wider">{task.status.replace('_', ' ')}</p>
                                </div>
                                {task.labels && task.labels.map((label, i) => (
                                    <div key={i} className="flex h-7 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 px-3 border-2 border-blue-100 dark:border-blue-800">
                                        <p className="text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider">{label}</p>
                                    </div>
                                ))}
                            </div>
                            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight text-text-main dark:text-white text-left">
                                {task.title}
                            </h1>

                            {/* Project Inactive Warning */}
                            {task.project && ['on_hold', 'cancelled'].includes(task.project.status) && (
                                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 shrink-0">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase text-amber-600 tracking-widest">Operation Suspended</p>
                                        <p className="text-[10px] font-bold text-amber-700/70 dark:text-amber-400/70 uppercase">This mission belongs to a project that is currently {task.project.status.replace('_', ' ')}. Active engagement restricted.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/50 text-left">
                            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3 md:mb-4">Description</h3>
                            <p className="text-text-main dark:text-gray-200 text-sm md:text-base leading-relaxed">
                                {task.description}
                            </p>
                        </div>

                        {/* Squadron Status Section - Group Tasks */}
                        {(task.subTasks?.length > 0 || (task.assignedTo?.length > 1)) && (
                            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/50 text-left">
                                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 md:mb-6 flex items-center gap-2">
                                    <Users size={14} className="text-primary-500" />
                                    Squadron Status
                                </h3>
                                <div className="space-y-4">
                                    {task.subTasks?.map((subTask, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-4 bg-gradient-to-br from-indigo-50/80 to-blue-50/80 dark:from-indigo-900/10 dark:to-blue-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/30">
                                            <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-800 shadow-sm ring-2 ring-indigo-100 dark:ring-indigo-900/50">
                                                <AvatarImage src={subTask.user?.profileImage || subTask.user?.avatar} />
                                                <AvatarFallback className="text-xs font-black bg-indigo-100 text-indigo-600">{subTask.user?.name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-black text-slate-800 dark:text-gray-100 uppercase truncate tracking-tight">
                                                        {subTask.user?.name || 'Unknown Agent'}
                                                    </span>
                                                    <Badge variant="outline" className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest h-6 px-2.5",
                                                        subTask.status === 'completed' ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                                                            subTask.status === 'review' ? "bg-blue-100 text-blue-700 border-blue-200" :
                                                                subTask.status === 'in_progress' ? "bg-amber-100 text-amber-700 border-amber-200" :
                                                                    "bg-white/60 text-slate-500 border-slate-200/60"
                                                    )}>
                                                        {subTask.status?.replace('_', ' ') || 'Pending'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-2 bg-white/60 dark:bg-slate-800/60 rounded-full overflow-hidden">
                                                        <div
                                                            className={cn("h-full rounded-full transition-all duration-500",
                                                                subTask.status === 'completed' ? "bg-emerald-500" : "bg-primary"
                                                            )}
                                                            style={{ width: `${subTask.progress || 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400 w-8 text-right">{subTask.progress}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!task.subTasks || task.subTasks.length === 0) && (
                                        <div className="text-center p-4 text-xs font-bold text-slate-400 uppercase italic">
                                            Squadron synchronization pending...
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Task Resources Section */}
                        {((task.attachments && task.attachments.length > 0) || (task.status === 'review' || task.status === 'completed')) && (
                            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/50 text-left">
                                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3 md:mb-4 flex items-center gap-2">
                                    <Paperclip size={14} className="text-primary-500" />
                                    Task Resources
                                </h3>
                                
                                {task.attachments && task.attachments.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                        {task.attachments.map((file, idx) => (
                                            <a
                                                key={idx}
                                                href={getAssetUrl(file.url)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary-200 transition-colors group"
                                            >
                                                <FileText size={16} className="text-primary-500 group-hover:scale-110 transition-transform" />
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[11px] font-black truncate max-w-[150px] text-slate-700 dark:text-slate-300 uppercase tracking-tight">{file.name}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Reference Asset</span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {/* Submission Note (If Review or Completed) */}
                                {(task.status === 'review' || task.status === 'completed') && (
                                    <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-2">Operational Evidence</p>
                                        <p className="text-slate-700 dark:text-gray-300 text-sm leading-relaxed">
                                            {task.submissionNote || "No submission statement provided."}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Activity Feed */}
                        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/50 text-left">
                            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 md:mb-6">Activity Feed</h3>
                            <div className="relative space-y-8 before:content-[''] before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-700/50">
                                {task.activityLog && task.activityLog.length > 0 ? (
                                    task.activityLog.map((item, idx) => (
                                        <div key={idx} className="relative flex gap-4">
                                            <div className={cn(
                                                "z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-white dark:border-slate-800 shadow-sm bg-blue-50 dark:bg-blue-900/20"
                                            )}>
                                                <Activity className="text-blue-600 text-lg" size={18} />
                                            </div>
                                            <div className="flex flex-col gap-1 pt-1">
                                                <p className="text-sm text-gray-700 dark:text-gray-200">
                                                    <span className="font-bold">{item.user?.name || 'Command'}</span>
                                                    <span className="text-gray-500 font-normal ml-2"> {item.action}</span>
                                                </p>
                                                <p className="text-[9px] font-normal text-gray-400 uppercase">
                                                    {format(new Date(item.timestamp), 'MMM dd, HH:mm')}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="relative flex gap-4 opacity-50">
                                        <div className="z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-50 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-sm">
                                            <MessageSquare size={16} />
                                        </div>
                                        <div className="pt-2">
                                            <p className="text-sm text-gray-500">No activity yet</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Side Column */}
                    <div className="lg:col-span-4 space-y-4 md:space-y-6">
                        {/* Discussion Access Card */}
                        <Card className="rounded-2xl md:rounded-3xl border-none shadow-sm bg-primary-600 text-white overflow-hidden group">
                            <CardContent className="p-4 md:p-6 flex flex-col items-center text-center space-y-3 relative">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <MessageSquare size={80} />
                                </div>
                                <div className="size-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-1">
                                    <MessageSquare size={24} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-tight">Mission Discussion</h4>
                                    <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest mt-1">Communicate with Command and Squadron</p>
                                </div>
                                <Button 
                                    onClick={() => setIsDiscussionOpen(true)}
                                    className="w-full bg-white text-primary-600 hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest h-10 rounded-xl mt-2"
                                >
                                    Open Board
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Task Hierarchy Visualization */}
                        <Card className="rounded-2xl md:rounded-3xl border-none shadow-sm bg-slate-50 dark:bg-slate-900 overflow-hidden">
                            <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-left">Assignment Path</h4>
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shadow-sm relative group">
                                            <Shield size={18} />
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Manager</span>
                                    </div>
                                    <div className="h-px flex-1 bg-gradient-to-r from-amber-200 to-blue-200 dark:from-amber-900/50 dark:to-blue-900/50 relative">
                                        <div className="absolute inset-x-0 -top-1.5 flex items-center justify-center">
                                            <ChevronRight size={12} className="text-slate-400 dark:text-slate-600" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center shadow-sm",
                                            task.team
                                                ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                                                : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                        )}>
                                            {task.team ? <Users size={18} /> : <User size={18} />}
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                            {task.team ? 'Team Unit' : 'Personnel'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Info Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
                            <Card className="rounded-2xl md:rounded-3xl border-none shadow-sm bg-white dark:bg-slate-900">
                                <CardContent className="p-4 md:p-5 text-left">
                                    <div className="flex items-center gap-2 mb-3 text-slate-400">
                                        <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600">
                                            <CalendarIcon size={14} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Deadline</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{format(new Date(task.deadline), 'MMM dd, yyyy')}</p>
                                    <p className="text-[10px] text-orange-600 font-medium mt-1">
                                        {isAfter(new Date(task.deadline), new Date())
                                            ? `${Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining`
                                            : 'Overdue'}
                                    </p>
                                </CardContent>
                            </Card>

                            {task.recurrence?.type && task.recurrence.type !== 'none' && (
                                <Card className="rounded-2xl md:rounded-3xl border-none shadow-sm bg-white dark:bg-slate-900">
                                    <CardContent className="p-4 md:p-5 text-left">
                                        <div className="flex items-center gap-2 mb-3 text-slate-400">
                                            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
                                                <Repeat size={14} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Recurrence</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                                            {task.recurrence.type} Cycle
                                        </p>
                                        <p className="text-[10px] text-indigo-600 font-medium mt-1">
                                            Repeats every {task.recurrence.interval} {task.recurrence.type === 'daily' ? 'day(s)' : task.recurrence.type === 'weekly' ? 'week(s)' : 'month(s)'}
                                        </p>
                                        {task.recurrence.endDate && (
                                            <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                                                Until: {format(new Date(task.recurrence.endDate), 'MMM dd, yyyy')}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            <Card className="rounded-3xl border-none shadow-sm bg-white dark:bg-slate-900">
                                <CardContent className="p-5 text-left space-y-4">
                                    <div className="flex items-center gap-2 mb-1 text-slate-400">
                                        <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                                            <Activity size={14} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {task.team || task.assignedTo?.length > 1 ? 'My Contribution' : 'Mission Progress'}
                                        </span>
                                    </div>

                                    {/* Dynamic Controls for Assignee */}
                                    {isAssignee && task.status !== 'review' && task.status !== 'completed' ? (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                                                        {myProgress}%
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                        STEP: {Math.floor(myProgress / 10)}/10
                                                    </span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    step="5"
                                                    value={myProgress}
                                                    onChange={(e) => setMyProgress(Number(e.target.value))}
                                                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Status Note</label>
                                                <Input
                                                    value={myStatusNote}
                                                    onChange={(e) => setMyStatusNote(e.target.value)}
                                                    placeholder="Brief update..."
                                                    className="h-9 text-[10px] font-bold bg-slate-50 border-none"
                                                />
                                            </div>

                                            <Button
                                                onClick={handleUpdateProgress}
                                                disabled={isUpdating || (myProgress === (mySubTask?.progress || task.progress) && myStatusNote === (task.statusNotes || ''))}
                                                className="w-full h-9 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black text-[9px] uppercase tracking-widest rounded-lg"
                                            >
                                                {isUpdating ? 'Syncing...' : 'Update Status'}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-end justify-between">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{task.progress || 0}%</p>
                                            <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${task.progress || 0}%` }}
                                                    className="h-full bg-primary"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Manager/Owner Controls */}
                            {((user?.role === 'manager' && (task.assignedBy === user.id || task.assignedBy?._id === user.id)) || user?.role === 'admin') && (
                                <Card className="rounded-2xl md:rounded-3xl border-none shadow-sm bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800">
                                    <CardContent className="p-4 md:p-5 text-left space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Command Controls</h4>

                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => navigate(`/manager/assign-task?edit=${task.id}`)}
                                                className="h-9 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px] uppercase tracking-widest rounded-lg"
                                            >
                                                Edit Directive
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    if (confirm("Confirm deletion of this directive? This action is irreversible.")) {
                                                        useTaskStore.getState().deleteTask(task.id);
                                                        navigate(-1);
                                                    }
                                                }}
                                                className="h-9 border-rose-100 dark:border-rose-900/30 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 font-bold text-[10px] uppercase tracking-widest rounded-lg"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-4 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-t border-slate-100 dark:border-slate-800 z-30">
                <div className="max-w-4xl mx-auto">
                    {/* MANAGER / ADMIN VIEW: Review Controls */}
                    {isManager && task.status === 'review' ? (
                        <div className="grid grid-cols-2 gap-3 w-full">
                            <Button
                                onClick={() => {
                                    updateTask(task.id, { status: 'completed', progress: 100 });
                                    toast.success("Directive Approved");
                                }}
                                className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20"
                            >
                                <CheckCircle2 size={18} className="mr-2" /> Approve Mission
                            </Button>
                            <Button
                                onClick={() => {
                                    updateTask(task.id, { status: 'in_progress', progress: 50 });
                                    toast.warning("Directive Returned for Revision");
                                }}
                                className="h-14 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-rose-500/20"
                            >
                                <X size={18} className="mr-2" /> Reject Mission
                            </Button>
                        </div>
                    ) : (
                        /* ASSIGNEE VIEW: Submit Controls Trigger */
                        isAssignee && task.status !== 'completed' && task.status !== 'review' ? (
                            <button
                                onClick={() => setIsSubmitDialogOpen(true)}
                                disabled={task.project && ['on_hold', 'cancelled'].includes(task.project.status)}
                                className={cn(
                                    "w-full h-14 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all",
                                    task.status === 'overdue' ? "bg-red-600 shadow-red-500/20" : "bg-primary shadow-primary/20",
                                    task.project && ['on_hold', 'cancelled'].includes(task.project.status) && "opacity-50 cursor-not-allowed filter grayscale"
                                )}
                            >
                                <Send size={20} />
                                <span>{task.status === 'overdue' ? 'Submit Overdue Mission' : 'Submit for Review'}</span>
                            </button>
                        ) : (
                            <button disabled className="w-full h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-2 opacity-80 cursor-not-allowed">
                                {task.status === 'review' ? <Clock size={24} className="text-amber-500" /> : <CheckCircle2 size={24} />}
                                <span>{task.status === 'review' ? 'Awaiting Command Review' : task.status === 'completed' ? 'Mission Fulfilled' : 'Active Operation'}</span>
                            </button>
                        )
                    )}

                    {/* Controlled Submission Dialog - Moved outside for stability */}
                    <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                        <DialogContent className="rounded-[2.5rem] border-none">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black uppercase tracking-tight">Mission Submission</DialogTitle>
                                <DialogDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Provide operational evidence for directive fulfilment.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Evidence Statement</label>
                                    <Input
                                        placeholder="What exactly was completed? (e.g. Migration finished, repo updated)"
                                        value={submissionNote}
                                        onChange={(e) => setSubmissionNote(e.target.value)}
                                        className="h-12 bg-slate-50 border-none rounded-xl font-bold"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Technical Attachments</label>
                                        <label className="cursor-pointer">
                                            <input type="file" multiple className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                                            <div className="flex items-center gap-1.5 text-[9px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-1 rounded-lg hover:bg-primary-100 transition-colors">
                                                {isUploading ? <Loader2 size={10} className="animate-spin" /> : <Paperclip size={10} />}
                                                ATTACH FILES
                                            </div>
                                        </label>
                                    </div>

                                    {attachments.length > 0 && (
                                        <div className="grid grid-cols-1 gap-2">
                                            {attachments.map((file, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl group">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <FileText size={14} className="text-slate-400 shrink-0" />
                                                        <span className="text-[10px] font-bold text-slate-600 truncate">{file.name}</span>
                                                    </div>
                                                    <button onClick={() => removeAttachment(idx)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {attachments.length === 0 && !isUploading && (
                                        <div className="h-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl">
                                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">No technical assets attached</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleMarkComplete} className="w-full h-12 bg-primary text-white font-black uppercase tracking-wider rounded-xl">
                                    CONFIRM DEPLOYMENT
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Discussion Sheet */}
            <Sheet open={isDiscussionOpen} onOpenChange={setIsDiscussionOpen}>
                <SheetContent side="right" className="w-full sm:w-[450px] flex flex-col gap-0 p-0 rounded-l-3xl border-l border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950">
                    <SheetHeader className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 shrink-0">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-black uppercase tracking-tight">Discussion Board</SheetTitle>
                                <SheetDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Task: {task.title}</SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-950/20">
                        {task.comments && task.comments.length > 0 ? (
                            task.comments.map((comment, idx) => {
                                const isMe = comment.senderId === user?.id;
                                return (
                                    <div key={idx} className={cn(
                                        "flex flex-col gap-2 max-w-[85%]",
                                        isMe ? "ml-auto items-end" : "items-start"
                                    )}>
                                        <div className="flex items-center gap-2 px-1">
                                            {!isMe && <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{comment.sender}</span>}
                                            <span className={cn(
                                                "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                                                comment.role === 'admin' ? "bg-red-100 text-red-600" : 
                                                comment.role === 'manager' ? "bg-amber-100 text-amber-600" : 
                                                "bg-blue-100 text-blue-600"
                                            )}>
                                                {comment.role || 'Member'}
                                            </span>
                                        </div>
                                        <div className={cn(
                                            "p-4 rounded-2xl text-sm font-bold shadow-sm leading-relaxed",
                                            isMe
                                                ? "bg-primary-600 text-white rounded-tr-none"
                                                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-800"
                                        )}>
                                            {comment.text}
                                        </div>
                                        <span className="text-[9px] text-slate-400 font-bold px-1 uppercase tracking-widest">
                                            {format(new Date(comment.createdAt), 'h:mm a')}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400/50 p-8 text-center">
                                <div className="size-20 rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
                                    <MessageSquare size={32} />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-tight text-slate-600 dark:text-slate-300">No Dialogue Yet</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Initiate conversation with your sequence leads.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Broadcast updates..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                className="rounded-xl h-12 bg-slate-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-primary/10 font-bold text-xs"
                            />
                            <Button
                                size="icon"
                                onClick={handleSendMessage}
                                className={cn(
                                    "h-12 w-12 rounded-xl transition-all shadow-lg shrink-0",
                                    newMessage.trim()
                                        ? "bg-primary-600 hover:bg-primary-700 shadow-primary-500/20"
                                        : "bg-slate-100 dark:bg-slate-900 text-slate-400 shadow-none cursor-not-allowed"
                                )}
                                disabled={!newMessage.trim()}
                            >
                                <Send size={20} className="ml-0.5" />
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div >
    );
};

export default TaskDetail;
