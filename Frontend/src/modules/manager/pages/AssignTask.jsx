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
    ArrowLeft,
    Zap,
    Target,
    Layers
} from 'lucide-react';
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
import useNotificationStore from '@/store/notificationStore';

const AssignTask = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const addTask = useTaskStore(state => state.addTask);
    const employees = useEmployeeStore(state => state.employees);
    const addNotification = useNotificationStore(state => state.addNotification);

    const subEmployees = employees.filter(e => e.managerId === user?.id);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [date, setDate] = useState();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: '',
        labels: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.assignedTo || !date) {
            toast.error("Tactical parameters incomplete");
            return;
        }

        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const newTask = {
                title: formData.title,
                description: formData.description,
                deadline: date.toISOString(),
                priority: formData.priority,
                status: 'pending',
                assignedTo: [formData.assignedTo],
                assignedBy: user.id || 'manager',
                assignedToManager: user.id,
                delegatedBy: user.id,
                createdAt: new Date().toISOString(),
                progress: 0,
                labels: formData.labels.split(',').map(l => l.trim()).filter(l => l),
                activity: [{
                    type: 'system',
                    user: user.name || 'Manager',
                    content: 'initialized task deployment',
                    time: 'Just now'
                }]
            };

            addTask(newTask);
            addNotification({
                title: 'New Task Assignment',
                description: `Directive: "${newTask.title}" initiated by ${user.name}`,
                category: 'task',
                recipientId: formData.assignedTo
            });

            toast.success("Tactical deployment successful");
            navigate('/manager/delegation');
        } catch (error) {
            toast.error("Deployment failed");
        } finally {
            setIsSubmitting(false);
        }
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
                            Task <span className="text-primary-600">Deployment</span>
                        </h1>
                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-1 leading-none">
                            Operational assignment protocols
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
                                <Label htmlFor="title" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Objective Title</Label>
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
                                <Label htmlFor="description" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Operational Brief</Label>
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
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Priority Class</Label>
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
                                    <Label htmlFor="labels" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Tactical Tags</Label>
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
                        </CardContent>
                    </Card>
                </div>

                {/* Assignment & Deployment Sidebar */}
                <div className="lg:col-span-4 space-y-4 sm:space-y-6">
                    <Card className="border-none shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden sticky top-6">
                        <CardHeader className="py-4 px-6 border-b border-slate-50 dark:border-slate-800">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Target size={14} className="text-primary-500" />
                                Deployment Unit
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-5">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Asset ID</Label>
                                <Select
                                    value={formData.assignedTo}
                                    onValueChange={(val) => handleSelectChange('assignedTo', val)}
                                >
                                    <SelectTrigger className="h-12 bg-slate-50 border-none dark:bg-slate-800/50 rounded-xl font-black text-[10px] uppercase tracking-widest px-4">
                                        <SelectValue placeholder="IDENTIFY TARGET" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-2xl">
                                        {subEmployees.length > 0 ? (
                                            subEmployees.map(emp => (
                                                <SelectItem key={emp.id} value={emp.id}>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-5 w-5 bg-primary-100">
                                                            <AvatarImage src={emp.avatar} />
                                                            <AvatarFallback className="text-[8px] font-black">{emp.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-[10px] font-black">{emp.name.toUpperCase()}</span>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-[8px] font-black uppercase text-center text-slate-400">Zero Personnel Detected</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Time Horizon</Label>
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
                                        <Zap size={14} className="fill-current" /> DEPLOY TASK
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recent Deployment History - High Density List */}
            <div className="mt-8 sm:mt-12">
                <div className="flex items-center gap-2 mb-5 px-1">
                    <div className="h-4 w-1 bg-primary-600 rounded-full" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Recent Deployments</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {useTaskStore(state => state.tasks)
                        .filter(t => t.delegatedBy === user?.id)
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 3)
                        .map(task => {
                            const assignee = employees.find(e => task.assignedTo?.includes(e.id));
                            return (
                                <Card key={task.id} className="border-none shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-900 rounded-2xl overflow-hidden group">
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
