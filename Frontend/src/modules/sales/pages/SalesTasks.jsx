import React, { useState, useMemo } from 'react';
import {
    CheckSquare,
    Plus,
    Filter,
    Search,
    PhoneCall,
    Mail,
    Calendar,
    Clock,
    Tag,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import useTaskStore from '@/store/taskStore';
import useCRMStore from '@/store/crmStore';
import useAuthStore from '@/store/authStore';
import useSalesStore from '@/store/salesStore';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';

const SalesTasks = () => {
    const { user } = useAuthStore();
    const { salesReps, getSalesRepByEmail } = useSalesStore();
    const { followUps, leads } = useCRMStore();
    const { tasks, addTask, updateTask, deleteTask } = useTaskStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [sortBy, setSortBy] = useState('deadline');
    const [sortOrder, setSortOrder] = useState('asc');
    const [activeTab, setActiveTab] = useState('tasks');

    const salesRep = useMemo(() => {
        return getSalesRepByEmail(user?.email);
    }, [user?.email, getSalesRepByEmail]);

    const filteredTasks = useMemo(() => {
        return tasks
            .filter(task => {
                const userId = salesRep?.id || user?.id || '1';
                const isAssigned = task.assignedTo?.some(id => id === userId || id === '1');
                const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
                const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
                return isAssigned && matchesSearch && matchesStatus && matchesPriority;
            })
            .sort((a, b) => {
                let aVal, bVal;
                switch (sortBy) {
                    case 'title':
                        aVal = a.title.toLowerCase();
                        bVal = b.title.toLowerCase();
                        break;
                    case 'deadline':
                        aVal = new Date(a.deadline);
                        bVal = new Date(b.deadline);
                        break;
                    case 'priority':
                        const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
                        aVal = priorityOrder[a.priority] || 0;
                        bVal = priorityOrder[b.priority] || 0;
                        break;
                    case 'status':
                        const statusOrder = { pending: 1, in_progress: 2, completed: 3 };
                        aVal = statusOrder[a.status] || 0;
                        bVal = statusOrder[b.status] || 0;
                        break;
                    default:
                        aVal = new Date(a.deadline);
                        bVal = new Date(b.deadline);
                }
                if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
    }, [tasks, searchTerm, selectedStatus, selectedPriority, sortBy, sortOrder, salesRep?.id, user?.id]);

    const recentActivities = useMemo(() => {
        const sortedFollowUps = [...followUps].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return sortedFollowUps.slice(0, 10).map(fup => {
            const lead = leads.find(l => l.id === fup.leadId);
            return {
                id: fup.id,
                type: fup.type?.toLowerCase() || 'call',
                title: fup.type ? `${fup.type} with ${lead?.name || 'Unknown Client'}` : 'Follow-up',
                description: fup.notes || 'No notes',
                date: fup.scheduledAt || fup.createdAt,
                duration: fup.duration,
                outcome: fup.outcome || 'Pending',
                leadName: lead?.name
            };
        });
    }, [followUps, leads]);

    const taskStats = useMemo(() => {
        const totalTasks = filteredTasks.length;
        const pendingTasks = filteredTasks.filter(t => t.status === 'pending').length;
        const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress').length;
        const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;
        const highPriorityTasks = filteredTasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length;

        return { totalTasks, pendingTasks, inProgressTasks, completedTasks, highPriorityTasks };
    }, [filteredTasks]);

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleAddTask = () => {
        const title = window.prompt("Enter Task Title:");
        if (!title) return;
        const priority = window.prompt("Priority (low, medium, high):", "medium");
        const deadline = window.prompt("Deadline (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);

        const newTask = {
            title,
            priority: priority || 'medium',
            deadline: deadline ? new Date(deadline).toISOString() : new Date().toISOString(),
            status: 'pending',
            assignedTo: [user?.id],
            description: 'Created via Sales Tasks',
            createdBy: user?.id
        };
        addTask(newTask);
        toast.success('Task synchronized successfully');
    };

    const handleTaskStatusChange = (taskId, newStatus) => {
        updateTask(taskId, { status: newStatus });
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'call': return <PhoneCall size={16} className="text-blue-500" />;
            case 'email': return <Mail size={16} className="text-purple-500" />;
            case 'meeting': return <Calendar size={16} className="text-emerald-500" />;
            default: return <Clock size={16} className="text-slate-400" />;
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'call': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'email': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'meeting': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    const getPriorityBadgeVariant = (priority) => {
        switch (priority) {
            case 'high':
            case 'urgent': return 'destructive';
            case 'medium': return 'warning';
            case 'low': return 'secondary';
            default: return 'default';
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 pb-10">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                            Sales <span className="text-primary-600">Operations</span>
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                            Coordinate tasks & tracking
                        </p>
                    </div>
                </div>
                <Button
                    variant="default"
                    className="h-10 px-6 gap-2 shadow-lg shadow-primary-500/20 bg-primary-600 hover:bg-primary-700 rounded-xl font-black text-[10px] uppercase tracking-widest"
                    onClick={handleAddTask}
                >
                    <Plus size={16} />
                    <span>Deploy Task</span>
                </Button>
            </div>

            {/* Compact High-Density Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
                {[
                    { label: 'Total Ops', value: taskStats.totalTasks, color: 'text-slate-600', border: 'border-slate-200', bg: 'bg-slate-50', shadow: 'shadow-slate-200/50' },
                    { label: 'Pending', value: taskStats.pendingTasks, color: 'text-amber-600', border: 'border-amber-200', bg: 'bg-amber-50', shadow: 'shadow-amber-200/50' },
                    { label: 'In Force', value: taskStats.inProgressTasks, color: 'text-blue-600', border: 'border-blue-200', bg: 'bg-blue-50', shadow: 'shadow-blue-200/50' },
                    { label: 'Resolved', value: taskStats.completedTasks, color: 'text-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50', shadow: 'shadow-emerald-200/50' },
                    { label: 'Urgent', value: taskStats.highPriorityTasks, color: 'text-red-600', border: 'border-red-200', bg: 'bg-red-50', shadow: 'shadow-red-200/50' }
                ].map((stat, i) => (
                    <Card key={i} className={cn(
                        "border-2 shadow-lg rounded-2xl overflow-hidden group transition-all hover:-translate-y-1",
                        stat.border,
                        stat.shadow,
                        "bg-white dark:bg-slate-900", // Keep white bg but border provides color
                        i === 4 ? "col-span-2 sm:col-span-1" : ""
                    )}>
                        <CardContent className={cn("p-3.5 sm:p-4 bg-gradient-to-br from-white to-transparent dark:from-slate-900", stat.bg.replace('bg-', 'to-') + '/20')}>
                            <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5 sm:mb-2">{stat.label}</p>
                            <p className={cn("text-lg sm:text-xl font-black leading-none", stat.color)}>{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="tasks" className="w-full" onValueChange={setActiveTab}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                    <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl h-10 border border-slate-100 dark:border-slate-800">
                        <TabsTrigger value="tasks" className="rounded-lg px-5 font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Task List</TabsTrigger>
                        <TabsTrigger value="activities" className="rounded-lg px-5 font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Activity Feed</TabsTrigger>
                    </TabsList>

                    {activeTab === 'tasks' && (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-60 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                                <input
                                    placeholder="Search operations..."
                                    className="w-full h-9 pl-9 bg-white dark:bg-slate-800 border-none shadow-sm rounded-xl text-[11px] font-bold outline-none focus:ring-1 focus:ring-primary-100"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-none shadow-sm bg-white dark:bg-slate-800 shrink-0">
                                <Filter size={14} className="text-slate-600" />
                            </Button>
                        </div>
                    )}
                </div>

                <TabsContent value="tasks" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <Card className="border-2 border-primary-100 shadow-xl shadow-primary-100/50 dark:border-primary-900 dark:shadow-none bg-gradient-to-br from-white to-primary-50/30 dark:from-slate-900 dark:to-primary-900/10 rounded-2xl overflow-hidden">
                        <CardHeader className="py-3 px-6 border-b border-slate-50 dark:border-slate-800">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Action Matrix</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-slate-50 dark:border-slate-800 hover:bg-transparent">
                                            <TableHead className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Action Item</TableHead>
                                            <TableHead className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest cursor-pointer group" onClick={() => handleSort('priority')}>
                                                <div className="flex items-center gap-1">
                                                    Level
                                                    <ArrowUpRight size={10} className={cn("transition-transform", sortBy === 'priority' && sortOrder === 'desc' && "rotate-90")} />
                                                </div>
                                            </TableHead>
                                            <TableHead className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Deadline</TableHead>
                                            <TableHead className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">State</TableHead>
                                            <TableHead className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Execution</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTasks.map((task) => (
                                            <TableRow key={task.id} className="border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => handleTaskStatusChange(task.id, task.status === 'completed' ? 'pending' : 'completed')}>
                                                <TableCell className="px-6 py-3">
                                                    <div>
                                                        <p className="font-black text-sm text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{task.title}</p>
                                                        <p className="text-[8px] text-slate-400 font-black mt-1 uppercase tracking-widest italic">Node ID: {String(task.id).slice(-6)}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-3">
                                                    <Badge className={cn(
                                                        "rounded-lg border-none px-2 py-0.5 font-black text-[8px] uppercase tracking-widest",
                                                        task.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                                                            task.priority === 'high' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                                                    )}>
                                                        {task.priority}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-6 py-3">
                                                    <div className="flex items-center gap-1.5 text-slate-400 font-black text-[9px] uppercase tracking-tighter">
                                                        <Calendar size={10} />
                                                        {new Date(task.deadline).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-3">
                                                    <Badge className={cn(
                                                        "rounded-lg border-none px-2 py-0.5 font-black text-[8px] uppercase tracking-widest",
                                                        task.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-primary-50 text-primary-600'
                                                    )}>
                                                        {task.status.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-6 py-3 text-right">
                                                    <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-white dark:hover:bg-slate-800">
                                                        <ArrowUpRight size={14} className="text-slate-300 group-hover:text-primary-600 transition-all" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {filteredTasks.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="p-16 text-center">
                                                    <div className="space-y-3">
                                                        <div className="size-16 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                                            <CheckSquare size={32} className="text-slate-200" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h3 className="font-black text-slate-900 dark:text-white text-base uppercase tracking-tight italic">Clear Horizon</h3>
                                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">No pending operations detected</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activities" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <Card className="border-2 border-purple-100 shadow-xl shadow-purple-100/50 dark:border-purple-900 dark:shadow-none bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-900 dark:to-purple-900/10 rounded-2xl overflow-hidden p-3 sm:p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="group p-4 rounded-xl border border-slate-50 dark:border-slate-800 hover:border-primary-100 dark:hover:border-primary-900/30 bg-slate-50/30 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={cn("size-8 rounded-lg flex items-center justify-center shadow-sm", activity.type === 'call' ? 'bg-blue-50 text-blue-600' : activity.type === 'email' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600')}>
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        <Badge className={cn("rounded-lg border-none px-2 py-0.5 font-black text-[8px] uppercase tracking-widest", getActivityColor(activity.type))}>
                                            {activity.type}
                                        </Badge>
                                    </div>
                                    <h4 className="text-[13px] font-black text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-primary-600 transition-colors uppercase tracking-tight truncate">{activity.title}</h4>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3 italic">{activity.outcome}</p>
                                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                                        <div className="flex items-center gap-1.5 text-slate-300 font-black text-[9px] uppercase tracking-tighter">
                                            <Clock size={10} />
                                            {new Date(activity.date).toLocaleDateString()}
                                        </div>
                                        <ArrowUpRight size={12} className="text-slate-200 group-hover:text-primary-500 transition-all" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {recentActivities.length === 0 && (
                            <div className="p-16 text-center">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] italic">Silence in the wire. No activity detected.</p>
                            </div>
                        )}
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SalesTasks;
