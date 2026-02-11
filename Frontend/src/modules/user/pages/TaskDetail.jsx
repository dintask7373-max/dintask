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
    Loader2
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

import useTaskStore from '@/store/taskStore';
import useEmployeeStore from '@/store/employeeStore';
import useAuthStore from '@/store/authStore';
import useManagerStore from '@/store/managerStore';
import useChatStore from '@/store/chatStore';
import useNotificationStore from '@/store/notificationStore';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

const TaskDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { tasks, updateTask } = useTaskStore();
    const { employees } = useEmployeeStore();
    const { managers } = useManagerStore();
    const { user: currentUser } = useAuthStore();
    const addNotification = useNotificationStore(state => state.addNotification);



    const task = useMemo(() => tasks.find(t => t.id === id), [tasks, id]);

    const sendMessage = useChatStore(state => state.sendMessage);



    const [submissionNote, setSubmissionNote] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Individual Progress State
    const [myProgress, setMyProgress] = useState(0);
    const [myStatusNote, setMyStatusNote] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Initialize individual progress
    React.useEffect(() => {
        if (task) {
            // Find user's subtask if available (for group tasks)
            const mySubTask = task.subTasks?.find(st => st.user?._id === currentUser?.id || st.user === currentUser?.id);
            if (mySubTask) {
                setMyProgress(mySubTask.progress || 0);
            } else {
                setMyProgress(task.progress || 0);
            }
            setMyStatusNote(task.statusNotes || '');
        }
    }, [task, currentUser]);

    const handleUpdateProgress = async () => {
        setIsUpdating(true);
        try {
            await updateTask(task.id, {
                progress: myProgress,
                statusNotes: myStatusNote,
                // Automatically set status to 'in_progress' if progress > 0 and was pending
                status: (task.status === 'pending' && myProgress > 0) ? 'in_progress' : undefined
            });
            toast.success("Operational status updated");
        } catch (error) {
            toast.error("Failed to sync status");
        } finally {
            setIsUpdating(false);
        }
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
            toast.error("Deployment evidence upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const isAssignee = task?.assignedTo?.includes(currentUser?.id) || task?.assignedTo?.some(u => u._id === currentUser?.id);
    const mySubTask = task?.subTasks?.find(st => st.user?._id === currentUser?.id || st.user === currentUser?.id);

    const handleMarkComplete = () => {
        setIsSubmittingReview(true);
        updateTask(task.id, {
            status: 'review',
            progress: 90,
            submissionNote: submissionNote,
            attachments: attachments
        });

        // Notify the manager
        if (task.delegatedBy || task.assignedBy) {
            addNotification({
                title: 'Task Review Requested',
                description: `${currentUser?.name} submitted: "${task.title}" for approval`,
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
                        {/* Header Section */}
                        <div className="mb-2">
                            <div className="flex flex-wrap gap-2 mb-3">
                                <div className={cn("flex h-6 md:h-7 items-center justify-center rounded-full px-2.5 md:px-3", pConfig.color)}>
                                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider">{pConfig.label}</p>
                                </div>
                                {task.team && (
                                    <div className={cn("flex h-6 md:h-7 items-center justify-center rounded-full px-2.5 md:px-3 bg-indigo-100 dark:bg-indigo-900 shadow-sm border border-indigo-200 dark:border-indigo-800")}>
                                        <p className="text-indigo-600 dark:text-indigo-400 text-[10px] md:text-xs font-black uppercase tracking-wider">TEAM: {task.team.name}</p>
                                    </div>
                                )}
                                {task.status === 'overdue' && (
                                    <div className={cn("flex h-6 md:h-7 items-center justify-center rounded-full px-2.5 md:px-3 bg-red-600 text-white shadow-lg shadow-red-500/20")}>
                                        <p className="text-[10px] md:text-xs font-black uppercase tracking-wider">OVERDUE</p>
                                    </div>
                                )}
                                <div className={cn("flex h-6 md:h-7 items-center justify-center rounded-full px-2.5 md:px-3",
                                    task.status === 'overdue' ? "bg-red-50 text-red-600" : "bg-slate-100 dark:bg-slate-800"
                                )}>
                                    <p className={cn("text-[10px] md:text-xs font-bold uppercase tracking-wider",
                                        task.status === 'overdue' ? "text-red-700 font-extrabold" : "text-slate-600 dark:text-slate-300"
                                    )}>{task.status.replace('_', ' ')}</p>
                                </div>
                                {task.labels && task.labels.map((label, i) => (
                                    <div key={i} className="flex h-6 md:h-7 items-center justify-center rounded-full bg-primary/10 px-2.5 md:px-3">
                                        <p className="text-primary text-[10px] md:text-xs font-bold uppercase tracking-wider">{label}</p>
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
                                        <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                            <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
                                                <AvatarImage src={subTask.user?.profileImage || subTask.user?.avatar} />
                                                <AvatarFallback className="text-[10px] font-black">{subTask.user?.name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between mb-1.5">
                                                    <span className="text-xs font-black text-slate-700 dark:text-gray-200 uppercase truncate">
                                                        {subTask.user?.name || 'Unknown Agent'}
                                                    </span>
                                                    <Badge variant="outline" className={cn(
                                                        "text-[8px] font-black uppercase tracking-wider h-5",
                                                        subTask.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                                            subTask.status === 'review' ? "bg-blue-50 text-blue-600 border-blue-200" :
                                                                subTask.status === 'in_progress' ? "bg-amber-50 text-amber-600 border-amber-200" :
                                                                    "bg-slate-100 text-slate-500 border-slate-200"
                                                    )}>
                                                        {subTask.status?.replace('_', ' ') || 'Pending'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
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

                        {/* Submission Details (If Review or Completed) */}
                        {(task.status === 'review' || task.status === 'completed') && (
                            <div className="bg-emerald-50/30 dark:bg-emerald-900/10 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-emerald-100/50 dark:border-emerald-800/30 text-left">
                                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-emerald-600/70 mb-3 md:mb-4">Operational Evidence</h3>
                                <p className="text-slate-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
                                    {task.submissionNote || "No submission statement provided."}
                                </p>
                                {task.attachments?.length > 0 && (
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        {task.attachments.map((file, idx) => (
                                            <a
                                                key={idx}
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-emerald-200 transition-colors group"
                                            >
                                                <FileText size={16} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                                                <span className="text-[10px] font-bold truncate max-w-[120px] text-slate-700 dark:text-slate-300">{file.name}</span>
                                            </a>
                                        ))}
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
                        {/* Task Hierarchy Visualization */}
                        <Card className="rounded-2xl md:rounded-3xl border-none shadow-sm bg-slate-50 dark:bg-slate-900 overflow-hidden">
                            <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-left">Assignment Path</h4>
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shadow-sm relative group">
                                            <Shield size={18} />
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Admin</span>
                                    </div>
                                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 relative">
                                        <div className="absolute inset-x-0 -top-1.5 flex items-center justify-center">
                                            <ChevronRight size={12} className="text-slate-300 dark:text-slate-700" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center shadow-sm border-2 bg-white dark:bg-slate-800 border-white dark:border-slate-800 text-slate-600 dark:text-slate-400",
                                            task.team && "border-indigo-400 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40"
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
                                    {isAssignee ? (
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-4 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-t border-slate-100 dark:border-slate-800 z-30">
                <div className="max-w-4xl mx-auto">
                    {task.status !== 'completed' && task.status !== 'review' ? (
                        <Dialog>
                            <DialogTrigger asChild>
                                <button
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
                            </DialogTrigger>
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
                                        CONFIRM DEPLOΥΜΕΝΤ
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <button disabled className="w-full h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-2 opacity-80 cursor-not-allowed">
                            <CheckCircle2 size={24} />
                            <span>{task.status === 'review' ? 'Awaiting Review' : 'Mission Fulfilled'}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskDetail;
