import React, { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    AlertCircle,
    MoreVertical,
    Flag,
    User as UserIcon,
    MessageSquare,
    Trash2,
    Edit2,
    Send
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
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
import useManagerStore from '@/store/managerStore';
import useNotificationStore from '@/store/notificationStore';
import { cn } from '@/shared/utils/cn';
import { fadeInUp, staggerContainer, scaleOnTap } from '@/shared/utils/animations';

const TaskManagement = () => {
    const { tasks, addTask, updateTask, deleteTask, addComment } = useTaskStore();
    const { employees } = useEmployeeStore();
    const addNotification = useNotificationStore(state => state.addNotification);

    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [empSearchTerm, setEmpSearchTerm] = useState('');
    const [mgrSearchTerm, setMgrSearchTerm] = useState('');

    // Discussion State
    const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);
    const [activeTaskForDiscussion, setActiveTaskForDiscussion] = useState(null);
    const [newMessage, setNewMessage] = useState('');

    const { managers } = useManagerStore();
    const [assignType, setAssignType] = useState('employee'); // 'employee' or 'manager'

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'medium',
        deadline: '',
        assignedTo: [],
        assignedToManager: '',
        collaborationEnabled: false
    });

    const priorityColors = {
        low: "text-blue-600 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30",
        medium: "text-amber-600 bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30",
        high: "text-orange-600 bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30",
        urgent: "text-red-600 bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30"
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeTab === 'all') return matchesSearch;
        if (activeTab === 'pending') return matchesSearch && task.status === 'pending';
        if (activeTab === 'completed') return matchesSearch && task.status === 'completed';
        return matchesSearch;
    });

    const handleCreateTask = (e) => {
        e.preventDefault();
        if (!newTask.title || !newTask.deadline) {
            toast.error('Please fill in required fields');
            return;
        }

        // Validate Deadline is not in the past
        if (new Date(newTask.deadline) < new Date(new Date().setHours(0, 0, 0, 0))) {
            toast.error("Deployment Failure: Deadline cannot be set in the past.");
            return;
        }

        const taskRecord = {
            ...newTask,
            id: Date.now(),
            status: 'pending',
            progress: 0,
            assignedBy: 'admin',
            createdAt: new Date().toISOString()
        };

        addTask(taskRecord);

        // Notify assignees
        if (assignType === 'employee') {
            newTask.assignedTo.forEach(empId => {
                addNotification({
                    title: 'New Admin Task',
                    description: `Admin assigned you: "${newTask.title}"`,
                    category: 'task',
                    recipientId: empId
                });
            });
        } else if (newTask.assignedToManager) {
            addNotification({
                title: 'New Project Assignment',
                description: `Admin assigned a new project to your department: "${newTask.title}"`,
                category: 'task',
                recipientId: newTask.assignedToManager
            });
        }

        toast.success('Task created and assigned');
        setIsCreateModalOpen(false);
        setNewTask({
            title: '',
            description: '',
            priority: 'medium',
            deadline: '',
            assignedTo: [],
            assignedToManager: '',
            collaborationEnabled: false
        });
    };

    const toggleEmployeeAssignment = (empId) => {
        setNewTask(prev => ({
            ...prev,
            assignedTo: prev.assignedTo.includes(empId)
                ? prev.assignedTo.filter(id => id !== empId)
                : [...prev.assignedTo, empId]
        }));
    };

    const handleOpenDiscussion = (task) => {
        setActiveTaskForDiscussion(task);
        setIsDiscussionOpen(true);
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !activeTaskForDiscussion) return;

        addComment(activeTaskForDiscussion.id, {
            text: newMessage,
            sender: 'Admin', // In a real app, this would be the logged-in user
            senderId: 'admin',
            role: 'admin'
        });

        setNewMessage('');
    };

    // Get live object for active discussion task from store
    const currentDiscussionTask = activeTaskForDiscussion ? tasks.find(t => t.id === activeTaskForDiscussion.id) : null;

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-6"
        >
            <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <div className="flex items-center gap-3 px-1 sm:px-0">
                        <div className="lg:hidden w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                            <img src="/dintask-logo.png" alt="DinTask" className="h-full w-full object-cover" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">Task <span className="text-primary-600">Management</span></h1>
                            <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Assign and track team progress</p>
                        </div>
                    </div>
                </div>

                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <motion.div {...scaleOnTap} className="w-full md:w-auto px-1 sm:px-0">
                            <Button className="w-full md:w-auto flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 bg-primary-600 hover:bg-primary-700 h-10 sm:h-11 px-6 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest">
                                <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                                <span>Create Task</span>
                            </Button>
                        </motion.div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto rounded-3xl border-none">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">Create New Task</DialogTitle>
                            <DialogDescription className="text-xs font-medium text-slate-500">
                                Fill in the details below to assign a new task to your team.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateTask} className="grid gap-6 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-slate-400">Task Title</Label>
                                <Input
                                    id="title"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    placeholder="e.g. Update Landing Page"
                                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-slate-400">Description</Label>
                                <Textarea
                                    id="description"
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    placeholder="Provide context and requirements..."
                                    className="min-h-[100px] rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Priority</Label>
                                    <Select
                                        value={newTask.priority}
                                        onValueChange={(val) => setNewTask({ ...newTask, priority: val })}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800">
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Deadline</Label>
                                    <Input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={newTask.deadline}
                                        onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-inner relative">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setAssignType('employee')}
                                        className={cn(
                                            "flex-1 rounded-xl h-10 text-[10px] font-black uppercase tracking-widest transition-all duration-500 z-10",
                                            assignType === 'employee'
                                                ? "bg-white dark:bg-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.08)] text-primary-600 dark:text-primary-400 border border-slate-100 dark:border-slate-600"
                                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        )}
                                    >
                                        Direct Employees
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setAssignType('manager')}
                                        className={cn(
                                            "flex-1 rounded-xl h-10 text-[10px] font-black uppercase tracking-widest transition-all duration-500 z-10",
                                            assignType === 'manager'
                                                ? "bg-white dark:bg-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.08)] text-primary-600 dark:text-primary-400 border border-slate-100 dark:border-slate-600"
                                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        )}
                                    >
                                        Via Manager
                                    </Button>
                                </div>

                                {assignType === 'employee' ? (
                                    <div className="grid gap-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Assign Employees</Label>
                                            <span className="text-[10px] font-bold text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full">
                                                {newTask.assignedTo.length} Selected
                                            </span>
                                        </div>
                                        <div className="relative mb-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                            <Input
                                                placeholder="Search by name or department..."
                                                value={empSearchTerm}
                                                onChange={(e) => setEmpSearchTerm(e.target.value)}
                                                className="h-9 pl-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[180px] overflow-y-auto p-3 border rounded-2xl bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 custom-scrollbar">
                                            {employees
                                                .filter(emp =>
                                                    emp.name.toLowerCase().includes(empSearchTerm.toLowerCase()) ||
                                                    emp.department?.toLowerCase().includes(empSearchTerm.toLowerCase())
                                                )
                                                .map(emp => (
                                                    <motion.div
                                                        key={emp.id}
                                                        whileHover={{ x: 3 }}
                                                        className={cn(
                                                            "flex items-center space-x-2 p-2 rounded-xl border transition-all cursor-pointer",
                                                            newTask.assignedTo.includes(emp.id)
                                                                ? "bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-900/30"
                                                                : "bg-white dark:bg-slate-900 border-transparent hover:border-slate-200"
                                                        )}
                                                        onClick={() => toggleEmployeeAssignment(emp.id)}
                                                    >
                                                        <Checkbox
                                                            id={`emp-${emp.id}`}
                                                            checked={newTask.assignedTo.includes(emp.id)}
                                                            onCheckedChange={() => toggleEmployeeAssignment(emp.id)}
                                                            className="rounded-md border-slate-300"
                                                        />
                                                        <Avatar className="h-7 w-7 border border-white dark:border-slate-800 shadow-sm shrink-0">
                                                            <AvatarImage src={emp.avatar} />
                                                            <AvatarFallback className="bg-primary-50 text-primary-600 text-[9px]">{emp.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <p className="text-[11px] font-bold truncate leading-none mb-0.5">{emp.name}</p>
                                                            <p className="text-[9px] text-slate-400 font-medium truncate italic">{emp.role}</p>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            {employees.filter(emp => emp.name.toLowerCase().includes(empSearchTerm.toLowerCase())).length === 0 && (
                                                <div className="col-span-full py-6 text-center text-[10px] text-slate-400 font-bold italic">
                                                    No employees found matching "{empSearchTerm}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Assign to Manager</Label>
                                        <div className="relative mb-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                            <Input
                                                placeholder="Search managers..."
                                                value={mgrSearchTerm}
                                                onChange={(e) => setMgrSearchTerm(e.target.value)}
                                                className="h-9 pl-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto p-3 border rounded-2xl bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 custom-scrollbar">
                                            {managers
                                                .filter(mgr =>
                                                    mgr.name.toLowerCase().includes(mgrSearchTerm.toLowerCase()) ||
                                                    mgr.department?.toLowerCase().includes(mgrSearchTerm.toLowerCase())
                                                )
                                                .map(mgr => (
                                                    <motion.div
                                                        key={mgr.id}
                                                        whileHover={{ x: 3 }}
                                                        className={cn(
                                                            "flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer",
                                                            newTask.assignedToManager === mgr.id
                                                                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30"
                                                                : "bg-white dark:bg-slate-900 border-transparent hover:border-slate-200"
                                                        )}
                                                        onClick={() => setNewTask({ ...newTask, assignedToManager: mgr.id, assignedTo: [] })}
                                                    >
                                                        <Avatar className="h-8 w-8 border border-white dark:border-slate-800 shadow-sm shrink-0">
                                                            <AvatarImage src={mgr.avatar} />
                                                            <AvatarFallback className="text-[10px] font-black">{mgr.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold leading-none mb-1">{mgr.name}</p>
                                                            <p className="text-[10px] text-slate-500 font-medium">{mgr.department}</p>
                                                        </div>
                                                        {newTask.assignedToManager === mgr.id && (
                                                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                                        )}
                                                    </motion.div>
                                                ))}
                                            {managers.filter(mgr => mgr.name.toLowerCase().includes(mgrSearchTerm.toLowerCase())).length === 0 && (
                                                <div className="py-6 text-center text-[10px] text-slate-400 font-bold italic">
                                                    No managers found matching "{mgrSearchTerm}"
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium px-1 italic">
                                            The manager will receive this task and delegate it to their team members.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center space-x-3 bg-primary-50/50 dark:bg-primary-900/10 p-4 rounded-2xl border border-primary-100/50 dark:border-primary-900/20">
                                <Checkbox
                                    id="collab"
                                    checked={newTask.collaborationEnabled}
                                    onCheckedChange={(val) => setNewTask({ ...newTask, collaborationEnabled: !!val })}
                                />
                                <Label htmlFor="collab" className="text-xs font-bold text-primary-700 dark:text-primary-400 cursor-pointer">
                                    Enable collaboration between assigned members
                                </Label>
                            </div>
                        </form>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="rounded-xl h-11 px-6">Cancel</Button>
                            <Button onClick={handleCreateTask} className="rounded-xl h-11 px-6 bg-primary-600 hover:bg-primary-700">Assign Task</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-2 ">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-col sm:flex-row items-center justify-between p-2 sm:p-3 gap-3">
                        <TabsList className="bg-slate-100 dark:bg-slate-800/50 h-10 sm:h-11 rounded-xl sm:rounded-2xl p-1 w-full sm:w-auto">
                            <TabsTrigger value="all" className="flex-1 sm:flex-none rounded-lg sm:rounded-xl px-4 sm:px-6 font-black text-[10px] sm:text-xs uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">All</TabsTrigger>
                            <TabsTrigger value="pending" className="flex-1 sm:flex-none rounded-lg sm:rounded-xl px-4 sm:px-6 font-black text-[10px] sm:text-xs uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">Pending</TabsTrigger>
                            <TabsTrigger value="completed" className="flex-1 sm:flex-none rounded-lg sm:rounded-xl px-4 sm:px-6 font-black text-[10px] sm:text-xs uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">Done</TabsTrigger>
                        </TabsList>

                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <Input
                                placeholder="Filter tasks..."
                                className="pl-10 h-10 sm:h-11 bg-slate-50 border-none dark:bg-slate-800/50 rounded-xl sm:rounded-2xl font-bold focus:ring-2 focus:ring-primary-500/10 transition-all text-xs"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <TabsContent value={activeTab} className="mt-4 px-3 outline-none focus:ring-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6 relative">
                            <AnimatePresence mode="sync">
                                {filteredTasks.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="col-span-full h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]"
                                    >
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full mb-4">
                                            <AlertCircle size={48} className="opacity-20 text-slate-900 dark:text-white" />
                                        </div>
                                        <h3 className="font-black text-slate-900 dark:text-white text-lg">No tasks found</h3>
                                        <p className="text-xs font-medium">Try adjusting your search or filters.</p>
                                    </motion.div>
                                ) : (
                                    filteredTasks.map((task) => (
                                        <motion.div
                                            key={task.id}
                                            variants={fadeInUp}
                                            layout
                                        >
                                            <Card className="border-none shadow-md hover:shadow-xl transition-shadow duration-300 group overflow-hidden bg-white dark:bg-slate-900 flex flex-col rounded-3xl h-full border border-slate-50 dark:border-slate-800/50">
                                                <div className={cn("h-1.5 w-full",
                                                    task.priority === 'urgent' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' :
                                                        task.priority === 'high' ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]' :
                                                            'bg-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]'
                                                )} />
                                                <CardHeader className="pb-3 pt-6 px-6">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <Badge variant="outline" className={cn("font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 border-none", priorityColors[task.priority])}>
                                                            {task.priority}
                                                        </Badge>
                                                        <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full",
                                                            task.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                                        )}>
                                                            {task.status}
                                                        </Badge>
                                                    </div>
                                                    <CardTitle className="text-lg font-black line-clamp-1 group-hover:text-primary-600 transition-colors tracking-tight">
                                                        {task.title}
                                                    </CardTitle>
                                                    <CardDescription className="line-clamp-2 text-xs font-medium leading-relaxed min-h-[34px] text-slate-500 dark:text-slate-400">
                                                        {task.description}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="pb-4 px-6 flex-grow">
                                                    <div className="flex flex-col gap-4">
                                                        <div className="flex items-center gap-2 py-1 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl w-fit">
                                                            <CalendarIcon size={12} className="text-primary-500" />
                                                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                                                {format(new Date(task.deadline), 'MMM dd, yyyy')}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Assigned Team</span>
                                                            <div className="flex -space-x-3 overflow-hidden p-1">
                                                                {task.assignedTo?.map(empId => {
                                                                    const emp = employees.find(e => e.id === empId);
                                                                    return (
                                                                        <Avatar key={empId} className="h-9 w-9 border-4 border-white dark:border-slate-900 shadow-sm">
                                                                            <AvatarImage src={emp?.avatar} />
                                                                            <AvatarFallback className="text-[10px] font-black">{emp?.name.charAt(0)}</AvatarFallback>
                                                                        </Avatar>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                                <CardFooter className="pt-4 px-6 pb-6 border-t border-slate-50 dark:border-slate-800 flex justify-between gap-3 bg-slate-50/30 dark:bg-slate-900/50">
                                                    <Button
                                                        variant="ghost"
                                                        className="text-[10px] font-black uppercase tracking-widest h-9 px-4 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm"
                                                        onClick={() => handleOpenDiscussion(task)}
                                                    >
                                                        <MessageSquare size={13} className="mr-2 text-primary-500" />
                                                        Discussions
                                                    </Button>
                                                    <div className="flex gap-2">
                                                        {task.status !== 'completed' && (
                                                            <motion.div {...scaleOnTap}>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-9 w-9 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-xl border border-emerald-100/50 dark:border-emerald-900/20"
                                                                    onClick={() => updateTask(task.id, { status: 'completed', completedAt: new Date().toISOString() })}
                                                                >
                                                                    <CheckCircle2 size={18} />
                                                                </Button>
                                                            </motion.div>
                                                        )}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                                                    <MoreVertical size={18} />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="rounded-xl">
                                                                <DropdownMenuItem className="text-xs font-bold gap-2 rounded-lg">
                                                                    <Edit2 size={14} /> Edit Task
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-xs font-bold gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10 rounded-lg" onClick={() => deleteTask(task.id)}>
                                                                    <Trash2 size={14} /> Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </CardFooter>
                                            </Card>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <Sheet open={isDiscussionOpen} onOpenChange={setIsDiscussionOpen}>
                <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col gap-0 p-0 rounded-l-3xl border-l border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                    <SheetHeader className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                        <SheetTitle className="text-xl font-black">
                            {currentDiscussionTask?.title || 'Task Discussion'}
                        </SheetTitle>
                        <SheetDescription className="text-xs font-medium">
                            Collaborate with your team on this task.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {currentDiscussionTask?.comments && currentDiscussionTask.comments.length > 0 ? (
                            currentDiscussionTask.comments.map((comment) => (
                                <div key={comment.id} className={cn(
                                    "flex flex-col gap-1 max-w-[85%]",
                                    comment.senderId === 'admin' ? "ml-auto items-end" : "items-start"
                                )}>
                                    <div className={cn(
                                        "p-3 rounded-2xl text-sm font-medium",
                                        comment.senderId === 'admin'
                                            ? "bg-primary-600 text-white rounded-tr-sm"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-sm"
                                    )}>
                                        {comment.text}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold px-1">
                                        {comment.sender} • {format(new Date(comment.createdAt), 'h:mm a')}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                                <MessageSquare size={48} className="mb-2" />
                                <p className="text-sm font-bold">No messages yet</p>
                                <p className="text-xs">Start the conversation!</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                className="rounded-xl h-11 bg-slate-50 dark:bg-slate-800 border-none focus:ring-1 focus:ring-primary-500"
                            />
                            <Button
                                size="icon"
                                onClick={handleSendMessage}
                                className={cn(
                                    "h-11 w-11 rounded-xl transition-all shadow-lg",
                                    newMessage.trim()
                                        ? "bg-primary-600 hover:bg-primary-700 shadow-primary-200 dark:shadow-none"
                                        : "bg-slate-200 dark:bg-slate-800 text-slate-400 shadow-none cursor-not-allowed"
                                )}
                                disabled={!newMessage.trim()}
                            >
                                <Send size={18} />
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </motion.div>
    );
};

export default TaskManagement;
