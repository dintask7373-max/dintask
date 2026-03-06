import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar as CalendarIcon,
    CheckSquare,
    AlertCircle,
    User,
    AlignLeft,
    Type,
    Flag,
    Plus,
    Save,
    Layers,
    ArrowLeft,
    Target,
    Zap,
    Clock,
    Paperclip,
    X,
    Loader2
} from 'lucide-react';
import api from '@/lib/api'; // Ensure api import for uploads
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Textarea } from '@/shared/components/ui/textarea';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { cn } from '@/shared/utils/cn';

import useAuthStore from '@/store/authStore';
import useTaskStore from '@/store/taskStore';
import useEmployeeStore from '@/store/employeeStore';
import useProjectStore from '@/store/projectStore';
import useTeamStore from '@/store/teamStore';
import useNotificationStore from '@/store/notificationStore';
import { useSearchParams } from 'react-router-dom';

const AssignTask = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { addTask, tasks, fetchTasks } = useTaskStore();
    const { employees, fetchEmployees } = useEmployeeStore();
    const { projects, fetchProjects } = useProjectStore();
    const { teams, fetchTeams } = useTeamStore();
    const addNotification = useNotificationStore(state => state.addNotification);
    const [searchParams] = useSearchParams();
    const urlProjectId = searchParams.get('projectId');
    const editTaskId = searchParams.get('edit');

    React.useEffect(() => {
        fetchProjects();
        fetchTasks();
        fetchEmployees();
        fetchTeams();
        if (urlProjectId) {
            setFormData(prev => ({ ...prev, projectId: urlProjectId }));
        }
    }, [urlProjectId]);

    // Load Task Data for Edit Mode
    React.useEffect(() => {
        if (editTaskId && tasks.length > 0) {
            const taskToEdit = tasks.find(t => t.id === editTaskId || t._id === editTaskId);
            if (taskToEdit) {
                // Populate Form
                setFormData({
                    title: taskToEdit.title,
                    description: taskToEdit.description || '',
                    priority: taskToEdit.priority,
                    assignedTo: 'none', // Not used directly, but kept for structure
                    selectedEmployees: taskToEdit.assignedTo?.map(u => u._id || u) || [],
                    labels: taskToEdit.labels?.join(', ') || '',
                    projectId: taskToEdit.project?._id || taskToEdit.project || 'none',
                    teamId: taskToEdit.team?._id || taskToEdit.team || 'none',
                    recurrenceType: taskToEdit.recurrence?.type || 'none',
                    recurrenceInterval: taskToEdit.recurrence?.interval || '1',
                    recurrenceEndDate: taskToEdit.recurrence?.endDate ? new Date(taskToEdit.recurrence.endDate).toISOString().split('T')[0] : ''
                });
                setDate(new Date(taskToEdit.deadline));
                setTaskFiles(taskToEdit.attachments || []);
            }
        }
    }, [editTaskId, tasks]);

    const subEmployees = employees.filter(e => {
        const userId = (user?._id || user?.id)?.toString();
        const userAdminId = (user?.adminId?._id || user?.adminId)?.toString();
        const empAdminId = (e.adminId?._id || e.adminId)?.toString();
        const empManagerId = (e.managerId?._id || e.managerId)?.toString();

        return e.role === 'employee' && (empManagerId === userId || empAdminId === userAdminId);
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [date, setDate] = useState();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: 'none',
        labels: '',
        projectId: 'none',
        teamId: 'none',
        recurrenceType: 'none',
        recurrenceInterval: '1',
        recurrenceEndDate: '',
        selectedEmployees: [] // For multi-assign
    });
    const [taskFiles, setTaskFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validation: Must have title, deadline, and at least one assignee or team
        if (!formData.title || (formData.selectedEmployees.length === 0 && formData.teamId === 'none') || !date) {
            toast.error("Deployment incomplete. Title, Deadline, and Personnel/Team required.");
            return;
        }

        // Validate Deadline is not in the past
        if (date < new Date(new Date().setSeconds(0, 0) - 60000)) {
            toast.error("Tactical Failure: Deadline cannot be set in the temporal past.");
            return;
        }

        // Validate Recurrence
        if (formData.recurrenceType !== 'none') {
            if (parseInt(formData.recurrenceInterval) < 1) {
                toast.error("Interval must be positive");
                return;
            }
            if (formData.recurrenceEndDate && new Date(formData.recurrenceEndDate) <= date) {
                toast.error("Cycle end date must be after start deadline");
                return;
            }
        }

        setIsSubmitting(true);
        try {
            // Task Object
            const taskPayload = {
                title: formData.title,
                description: formData.description,
                deadline: date.toISOString(),
                priority: formData.priority,
                assignedTo: formData.selectedEmployees,
                team: formData.teamId === 'none' ? undefined : formData.teamId,
                project: formData.projectId === 'none' ? undefined : formData.projectId,
                labels: formData.labels.split(',').map(l => l.trim()).filter(l => l),
                recurrence: {
                    type: formData.recurrenceType,
                    interval: parseInt(formData.recurrenceInterval) || 1,
                    endDate: formData.recurrenceEndDate ? new Date(formData.recurrenceEndDate) : null
                },
                attachments: taskFiles
            };

            // Status Auto-Update Logic
            if (editTaskId) {
                const taskToEdit = tasks.find(t => t.id === editTaskId || t._id === editTaskId);
                if (taskToEdit && taskToEdit.status === 'overdue' && new Date(date) > new Date()) {
                    taskPayload.status = 'pending';
                    taskPayload.progress = 0; // Reset progress or keep? Better to reset if it was overdue
                    toast.info("Directive status reset to PENDING due to deadline extension.");
                }
            }

            if (editTaskId) {
                // Update Existing Task
                await useTaskStore.getState().updateTask(editTaskId, taskPayload);
                toast.success("Directive Updated Successfully");
            } else {
                // Create New Task
                await addTask(taskPayload);
                toast.success("Task deployed successfully");
            }

            navigate('/manager/my-tasks');
        } catch (error) {
            console.error(error);
            toast.error(editTaskId ? "Update failed" : "Deployment failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);
        const uploadData = new FormData();
        files.forEach(file => uploadData.append('files', file));

        try {
            // Use standard API util
            const res = await api('/upload/multiple', {
                method: 'POST',
                body: uploadData
            });

            if (res.success) {
                const newAttachments = files.map((file, idx) => ({
                    name: file.name,
                    url: res.urls[idx]
                }));
                setTaskFiles(prev => [...prev, ...newAttachments]);
                toast.success("Assets secured");
            }
        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    // Toggle Employee Selection
    const toggleEmployee = (empId) => {
        setFormData(prev => {
            const current = prev.selectedEmployees;
            const newSelection = current.includes(empId)
                ? current.filter(id => id !== empId)
                : [...current, empId];
            return { ...prev, selectedEmployees: newSelection, assignedTo: newSelection.length > 0 ? newSelection[0] : 'none' };
        });
    };

    return (
        <div className="space-y-4 sm:space-y-6 pb-10 max-w-5xl mx-auto px-1">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={14} />
                    </Button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                            {editTaskId ? (<>Update <span className="text-primary-600">Directive</span></>) : (<>Task <span className="text-primary-600">Deployment</span></>)}
                        </h1>
                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-1 leading-none">
                            {editTaskId ? 'Modify existing operational parameters' : 'Operational assignment protocols'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
                {/* Deployment Config Form */}
                <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                    <Card className="border-none shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                        <CardHeader className="py-4 px-6 border-b border-slate-50 dark:border-slate-800">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Layers size={14} className="text-primary-500" />
                                Core Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 sm:p-8 space-y-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="title" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Task Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="e.g., SITE-O1 INFRASTRUCTURE PATCH"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="h-11 bg-slate-50 border-none dark:bg-slate-800/50 rounded-xl font-bold text-sm px-4"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="description" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Input detailed tactical directives..."
                                    className="min-h-[120px] bg-slate-50 border-none dark:bg-slate-800/50 rounded-xl font-bold text-sm p-4 resize-none"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Priority</Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(val) => handleSelectChange('priority', val)}
                                    >
                                        <SelectTrigger className="h-11 bg-slate-50 border-none dark:bg-slate-800/50 rounded-xl font-bold text-sm px-4">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-2xl">
                                            <SelectItem value="low" className="text-[10px] font-black uppercase tracking-widest">Minimal</SelectItem>
                                            <SelectItem value="medium" className="text-[10px] font-black uppercase tracking-widest font-primary-600">Standard</SelectItem>
                                            <SelectItem value="high" className="text-[10px] font-black uppercase tracking-widest text-orange-500">High</SelectItem>
                                            <SelectItem value="urgent" className="text-[10px] font-black uppercase tracking-widest text-red-500">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="labels" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Tags</Label>
                                    <Input
                                        id="labels"
                                        name="labels"
                                        placeholder="SYNC, DELTA, CORE"
                                        value={formData.labels}
                                        onChange={handleInputChange}
                                        className="h-11 bg-slate-50 border-none dark:bg-slate-800/50 rounded-xl font-bold text-sm px-4"
                                    />
                                </div>
                            </div>

                            {/* Attachments Section */}
                            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between px-1">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Technical Assets ({taskFiles.length})</Label>
                                    <label className="cursor-pointer">
                                        <input type="file" multiple className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-1 rounded-lg hover:bg-primary-100 transition-colors">
                                            {isUploading ? <Loader2 size={10} className="animate-spin" /> : <Paperclip size={10} />}
                                            ATTACH FILES
                                        </div>
                                    </label>
                                </div>
                                {taskFiles.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {taskFiles.map((file, idx) => (
                                            <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-lg group">
                                                <span className="text-[9px] font-bold text-slate-600 truncate max-w-[100px]">{file.name}</span>
                                                <button type="button" onClick={() => setTaskFiles(prev => prev.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 transition-colors">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Assignment & Deployment Sidebar */}
                <div className="lg:col-span-4 space-y-4 sm:space-y-6 lg:sticky lg:top-6 lg:h-fit">
                    <Card className="border-none shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                        <CardHeader className="py-4 px-6 border-b border-slate-50 dark:border-slate-800">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Target size={14} className="text-primary-500" />
                                Deployment Unit
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-5">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Assign to Project (Optional)</Label>
                                <Select
                                    value={formData.projectId}
                                    onValueChange={(val) => handleSelectChange('projectId', val)}
                                >
                                    <SelectTrigger className="h-11 bg-slate-50 border-none dark:bg-slate-800/50 rounded-xl font-bold text-sm px-4">
                                        <SelectValue placeholder="Select Project" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-2xl h-60">
                                        <SelectItem value="none" className="text-[10px] font-black uppercase">No Project</SelectItem>
                                        {projects.map(project => (
                                            <SelectItem key={project._id} value={project._id} className="text-[10px] font-black uppercase">
                                                {project.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Team (Optional)</Label>
                                <Select
                                    value={formData.teamId}
                                    onValueChange={(val) => handleSelectChange('teamId', val)}
                                >
                                    <SelectTrigger className="h-11 bg-slate-50 border-none dark:bg-slate-800/50 rounded-xl font-bold text-sm px-4">
                                        <SelectValue placeholder="Select Team" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-2xl">
                                        <SelectItem value="none" className="text-[10px] font-black uppercase">No Team</SelectItem>
                                        {teams.map(team => (
                                            <SelectItem key={team._id} value={team._id} className="text-[10px] font-black uppercase">
                                                {team.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Assign To</Label>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                                    {subEmployees.length > 0 ? (
                                        subEmployees.map(emp => {
                                            const isSelected = formData.selectedEmployees.includes(emp._id || emp.id);
                                            return (
                                                <div
                                                    key={emp._id || emp.id}
                                                    onClick={() => toggleEmployee(emp._id || emp.id)}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer bg-slate-50 dark:bg-slate-800/50",
                                                        isSelected
                                                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                                                            : "border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                                    )}
                                                >
                                                    <div className="relative">
                                                        <Avatar className="h-8 w-8 mb-1.5">
                                                            <AvatarImage src={emp.avatar || emp.profileImage} />
                                                            <AvatarFallback className="text-[10px] font-black">{emp?.name?.charAt(0) || '?'}</AvatarFallback>
                                                        </Avatar>
                                                        {isSelected && (
                                                            <div className="absolute -top-1 -right-1 size-4 bg-primary-500 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                                                                <CheckSquare size={10} strokeWidth={4} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={cn(
                                                        "text-[9px] font-black text-center leading-tight uppercase",
                                                        isSelected ? "text-primary-700 dark:text-primary-400" : "text-slate-500"
                                                    )}>
                                                        {(emp?.name?.split(' ')[0] || 'Unknown')}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="col-span-full p-4 text-[9px] font-black uppercase text-center text-slate-400 italic">No Personnel Available</div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Deadline</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"ghost"}
                                            className={cn(
                                                "w-full h-12 justify-start bg-slate-50 dark:bg-slate-800/50 rounded-xl font-black text-[10px] uppercase tracking-widest px-4",
                                                !date && "text-slate-400"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4 text-primary-500" />
                                            {date ? format(date, "PPP").toUpperCase() : <span className="italic">SET DEADLINE</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-2xl overflow-hidden">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                            disabled={{ before: new Date() }} // Prevent past dates
                                            className="font-sans"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <Button
                                className="w-full h-12 gap-2 font-black text-[10px] uppercase tracking-[0.2em] bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-500/20 text-white rounded-xl mt-4"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>INITIALIZING...</>
                                ) : (
                                    <>
                                        {searchParams.get('edit') ? (
                                            <><Save size={14} className="fill-current" /> UPDATE DIRECTIVE</>
                                        ) : (
                                            <><Zap size={14} className="fill-current" /> DEPLOY TASK</>
                                        )}
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                        <CardHeader className="py-4 px-6 border-b border-slate-50 dark:border-slate-800">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Clock size={14} className="text-amber-500" />
                                Temporal Cycle
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-5">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Recurrence Pattern</Label>
                                <Select
                                    value={formData.recurrenceType}
                                    onValueChange={(val) => handleSelectChange('recurrenceType', val)}
                                >
                                    <SelectTrigger className="h-11 bg-slate-50 border-none dark:bg-slate-800/50 rounded-xl font-bold text-sm px-4">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-2xl">
                                        <SelectItem value="none" className="text-[10px] font-black uppercase">One-off Mission</SelectItem>
                                        <SelectItem value="daily" className="text-[10px] font-black uppercase">Daily Cycle</SelectItem>
                                        <SelectItem value="weekly" className="text-[10px] font-black uppercase">Weekly Cycle</SelectItem>
                                        <SelectItem value="monthly" className="text-[10px] font-black uppercase">Monthly Cycle</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.recurrenceType !== 'none' && (
                                <>
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Interval Factor</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            name="recurrenceInterval"
                                            value={formData.recurrenceInterval}
                                            onChange={handleInputChange}
                                            className="h-11 bg-slate-50 border-none dark:bg-slate-800/50 rounded-xl font-bold text-sm px-4"
                                            placeholder="Frequency (e.g. 1)"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Cycle Termination (Optional)</Label>
                                        <Input
                                            type="date"
                                            name="recurrenceEndDate"
                                            min={new Date().toISOString().split('T')[0]}
                                            value={formData.recurrenceEndDate}
                                            onChange={handleInputChange}
                                            className="h-11 bg-slate-50 border-none dark:bg-slate-800/50 rounded-xl font-bold text-sm px-4"
                                        />
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>

            <div className="mt-8 sm:mt-12">
                <div className="flex items-center gap-2 mb-5 px-1">
                    <div className="h-4 w-1 bg-primary-600 rounded-full" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Recent Deployments</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tasks
                        .filter(t => t.assignedBy === user?.id || t.delegatedBy === user?.id)
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 3)
                        .map(task => {
                            const assignee = employees.find(e => task.assignedTo?.includes(e.id));
                            return (
                                <Card key={task._id || task.id} className="border-none shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-900 rounded-2xl overflow-hidden group">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase leading-tight line-clamp-1 group-hover:text-primary-600 transition-colors">{task.title}</h3>
                                            <Badge variant="ghost" className={cn(
                                                "text-[8px] font-black uppercase h-4 px-1 rounded",
                                                task.priority === 'urgent' ? "bg-red-50 text-red-600" :
                                                    task.priority === 'high' ? "bg-orange-50 text-orange-600" :
                                                        "bg-primary-50 text-primary-600"
                                            )}>
                                                {task.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight line-clamp-2 italic mb-4">
                                            {task.description}
                                        </p>
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
                                            <div className="flex items-center gap-2">
                                                <div className="size-5 rounded-lg overflow-hidden bg-slate-100">
                                                    <img src={assignee?.avatar} alt={assignee?.name} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                    {assignee?.name.split(' ')[0] || 'ASYNC'}
                                                </span>
                                            </div>
                                            <span className="text-[8px] font-black text-slate-400">
                                                {format(new Date(task.createdAt), "MMM dd").toUpperCase()}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                </div>
            </div>
        </div>
    );
};

export default AssignTask;
