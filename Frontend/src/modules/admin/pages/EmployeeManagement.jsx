import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    Plus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    Mail,
    Phone,
    Shield,
    CheckCircle2,
    XCircle,
    Filter,
    ArrowUpDown,
    Download,
    Users,
    ChevronDown,
    ChevronUp,
    Check,
    MessageSquare
} from 'lucide-react';
import { useAutoAnimate } from '@formkit/auto-animate/react';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/shared/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import useEmployeeStore from '@/store/employeeStore';
import useTaskStore from '@/store/taskStore';
import useManagerStore from '@/store/managerStore';
import { cn } from '@/shared/utils/cn';
import { Progress } from '@/shared/components/ui/progress';

import useSalesStore from '@/store/salesStore';
import useAuthStore from '@/store/authStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Copy, Send } from 'lucide-react';
import api from '@/lib/api';

const EmployeeManagement = () => {
    const navigate = useNavigate();
    const { employees, deleteEmployee, addEmployee, updateEmployee, fetchSubscriptionLimit, limitStatus } = useEmployeeStore();
    const { user } = useAuthStore();
    const { tasks } = useTaskStore();
    const { managers } = useManagerStore();
    const { salesExecutives } = useSalesStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [expandedEmployee, setExpandedEmployee] = useState(null);
    const [newEmployee, setNewEmployee] = useState({ name: '', email: '', role: '', managerId: '' });

    const [parent] = useAutoAnimate();

    React.useEffect(() => {
        const loadData = async () => {
            await useEmployeeStore.getState().fetchEmployees();
            await useEmployeeStore.getState().fetchPendingRequests();
            await fetchSubscriptionLimit();
        };
        loadData();
    }, []);

    // Limit based on plan from backend
    const EMPLOYEE_LIMIT = limitStatus?.limit || user?.planDetails?.userLimit || 2;
    const currentCount = limitStatus?.current || (employees.length + managers.length + (salesExecutives?.length || 0));
    const isLimitReached = limitStatus?.allowed === false || currentCount >= EMPLOYEE_LIMIT;

    const employeeStats = useMemo(() => {
        const stats = {};
        employees.forEach(emp => {
            const empId = emp._id || emp.id;
            if (!empId) return;
            // assignedTo is likely an array of strings (IDs)
            const empTasks = tasks.filter(t => t.assignedTo && t.assignedTo.includes(empId.toString()));
            const completed = empTasks.filter(t => t.status === 'completed').length;
            stats[empId] = {
                total: empTasks.length,
                completed: completed,
                percentage: empTasks.length > 0 ? (completed / empTasks.length) * 100 : 0,
                tasks: empTasks
            };
        });
        return stats;
    }, [employees, tasks]);

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [employees, searchTerm, filterStatus]);

    const handleAddEmployee = async (e) => {
        e.preventDefault();

        if (isLimitReached) {
            toast.error(limitStatus?.error || 'Subscription limit reached. Please upgrade your plan.');
            return;
        }

        try {
            await addEmployee({
                ...newEmployee,
                id: Date.now(),
                status: 'active',
                joinedDate: new Date().toLocaleDateString()
            });
            setNewEmployee({ name: '', email: '', role: '', managerId: '' });
            setIsAddModalOpen(false);
            // Refresh limit status
            await fetchSubscriptionLimit();
        } catch (error) {
            if (error.message && error.message.includes('limit')) {
                await fetchSubscriptionLimit();
            }
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to remove this employee?')) {
            deleteEmployee(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <div className="flex items-center gap-3">
                        <div className="lg:hidden w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                            <img src="/dintask-logo.png" alt="DinTask" className="h-full w-full object-cover" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Employee Management</h1>
                            <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Team members and workspace access</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1">
                    <Button variant="outline" className="flex-1 md:flex-none h-9 sm:h-11 px-3 sm:px-4 gap-2 border-slate-100 dark:border-slate-800 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest whitespace-nowrap">
                        <Download size={14} className="sm:w-[18px] sm:h-[18px]" />
                        <span>Export</span>
                    </Button>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        disabled={isLimitReached}
                        className="flex-1 md:flex-none h-9 sm:h-11 px-3 sm:px-4 gap-2 shadow-lg shadow-primary-500/20 bg-primary-600 hover:bg-primary-700 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest whitespace-nowrap"
                    >
                        <Plus size={14} className="sm:w-[18px] sm:h-[18px]" />
                        <span>Add New</span>
                    </Button>
                </div>
            </div>




            {/* Subscription Alert */}
            <Alert className="bg-blue-50/30 border-blue-100/50 dark:bg-blue-900/10 dark:border-blue-900/20 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                <AlertDescription className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-400 font-bold uppercase tracking-widest">
                    Used <span className="text-blue-900 dark:text-white">{currentCount}</span> / <span className="text-blue-900 dark:text-white">{EMPLOYEE_LIMIT}</span> employee slots.
                    {isLimitReached && <span className="ml-2 text-red-500 animate-pulse">Limit reached!</span>}
                </AlertDescription>
            </Alert>

            {/* Toolbar */}
            <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl">
                <CardContent className="p-2 sm:p-4 flex flex-col md:flex-row gap-2 sm:gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            placeholder="Quick search..."
                            className="pl-9 h-9 sm:h-11 bg-slate-50 border-none dark:bg-slate-800 rounded-xl font-bold text-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl">
                        {['all', 'active', 'inactive'].map((status) => (
                            <Button
                                key={status}
                                variant={filterStatus === status ? 'default' : 'ghost'}
                                onClick={() => setFilterStatus(status)}
                                className={cn(
                                    "flex-1 h-8 sm:h-9 rounded-lg px-3 sm:px-6 font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all",
                                    filterStatus === status
                                        ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                {status}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Employee Table/List */}
            <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2rem] overflow-hidden">
                <div className="overflow-x-auto hidden lg:block">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-10"></th>
                                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[250px]">Employee</th>
                                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[150px]">Reports To</th>
                                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[150px]">Role</th>
                                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[180px]">Task Progress</th>
                                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[120px]">Status</th>
                                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right min-w-[120px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody ref={parent}>
                            {filteredEmployees.map((emp) => {
                                const empId = emp._id || emp.id;
                                const stats = employeeStats[empId] || { total: 0, completed: 0, percentage: 0, tasks: [] };
                                const isExpanded = expandedEmployee === empId;

                                return (
                                    <React.Fragment key={empId}>
                                        <tr className={cn(
                                            "border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer",
                                            isExpanded && "bg-slate-50/80 dark:bg-slate-800/80"
                                        )} onClick={() => setExpandedEmployee(isExpanded ? null : empId)}>
                                            <td className="p-5">
                                                {isExpanded ? <ChevronUp size={16} className="text-primary-600" /> : <ChevronDown size={16} className="text-slate-400" />}
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
                                                        <AvatarImage src={emp.avatar} />
                                                        <AvatarFallback className="bg-primary-50 text-primary-600 font-bold">{emp.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white leading-none">{emp.name}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{emp.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                {emp.managerId ? (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6 border border-white dark:border-slate-800 shadow-sm">
                                                            <AvatarImage src={employees.find(m => m._id === emp.managerId)?.avatar} />
                                                            <AvatarFallback className="text-[8px] font-black">{employees.find(m => m._id === emp.managerId)?.name?.charAt(0) || '?'}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                            {employees.find(m => m._id === emp.managerId)?.name || 'Unknown'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="p-5">
                                                <Badge variant="outline" className="rounded-lg font-bold text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-600 tracking-wider">
                                                    {emp.role}
                                                </Badge>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex flex-col gap-1.5 w-40">
                                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                                        <span className="text-slate-500 uppercase">Success Rate</span>
                                                        <span className="text-primary-600">{stats.completed}/{stats.total}</span>
                                                    </div>
                                                    <Progress value={stats.percentage} className="h-1.5 bg-slate-100 dark:bg-slate-800" indicatorClassName="bg-primary-600" />
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "h-1.5 w-1.5 rounded-full",
                                                        emp.status === 'active' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300"
                                                    )} />
                                                    <span className={cn(
                                                        "text-xs font-bold uppercase tracking-widest",
                                                        emp.status === 'active' ? "text-emerald-600" : "text-slate-400"
                                                    )}>
                                                        {emp.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                                                        <Edit2 size={14} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                        onClick={() => handleDelete(emp._id || emp.id)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 rounded-lg">
                                                                <MoreVertical size={14} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-xl">
                                                            <DropdownMenuItem className="gap-2 text-xs font-medium rounded-lg" onClick={() => navigate('/admin/chat')}>
                                                                <MessageSquare size={14} /> Direct Message
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="gap-2 text-xs font-medium rounded-lg">
                                                                <Mail size={14} /> Send Email
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="gap-2 text-xs font-medium rounded-lg">
                                                                <Phone size={14} /> Call Member
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bg-slate-50/30 dark:bg-slate-800/20">
                                                <td colSpan={6} className="p-0">
                                                    <div className="px-16 py-6 animate-in slide-in-from-top-2 duration-300">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                                Tasks Todo List
                                                                <Badge className="bg-primary-50 text-primary-700 hover:bg-primary-50 border-none px-2 py-0.5 text-[9px]">{stats.total} Assigned</Badge>
                                                            </h4>
                                                        </div>
                                                        <div className="grid gap-2">
                                                            {stats.tasks.length > 0 ? (
                                                                stats.tasks.map(task => (
                                                                    <div key={task.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm group/task">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={cn(
                                                                                "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                                                                                task.status === 'completed'
                                                                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                                                                    : "border-slate-200 dark:border-slate-700 bg-transparent"
                                                                            )}>
                                                                                {task.status === 'completed' && <Check size={12} strokeWidth={4} />}
                                                                            </div>
                                                                            <span className={cn(
                                                                                "text-sm font-bold",
                                                                                task.status === 'completed' ? "text-slate-400 line-through decoration-slate-300" : "text-slate-700 dark:text-slate-200"
                                                                            )}>
                                                                                {task.title}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Badge variant="outline" className={cn(
                                                                                "text-[9px] font-black uppercase tracking-tighter px-2 py-0",
                                                                                task.priority === 'urgent' ? "text-red-500 border-red-100 bg-red-50/50" :
                                                                                    task.priority === 'high' ? "text-orange-500 border-orange-100 bg-orange-50/50" :
                                                                                        "text-blue-500 border-blue-100 bg-blue-50/50"
                                                                            )}>
                                                                                {task.priority}
                                                                            </Badge>
                                                                            <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                                                                                {task.progress}%
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No tasks assigned yet</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List */}
                <div className="lg:hidden divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredEmployees.map((emp) => {
                        const empId = emp._id || emp.id;
                        const stats = employeeStats[empId] || { total: 0, completed: 0, percentage: 0, tasks: [] };
                        return (
                            <div key={empId} className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-slate-100 dark:border-slate-800">
                                            <AvatarImage src={emp.avatar} />
                                            <AvatarFallback className="bg-primary-50 text-primary-600 font-black">{emp.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-black text-slate-900 dark:text-white text-sm leading-tight">{emp.name}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">{emp.email}</p>
                                        </div>
                                    </div>
                                    <Badge className={cn(
                                        "text-[8px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 text-slate-500",
                                        emp.status === 'active' && "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                                    )}>
                                        {emp.status}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl">
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Reports To</p>
                                        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                            {managers.find(m => m.id === emp.managerId)?.name || 'Unassigned'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Progress</p>
                                        <div className="flex items-center gap-2">
                                            <Progress value={stats.percentage} className="h-1 flex-1" />
                                            <span className="text-[9px] font-black text-primary-600">{Math.round(stats.percentage)}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest h-5">{emp.role}</Badge>
                                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary-600 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                            <Edit2 size={12} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary-600 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                            <MessageSquare size={12} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 rounded-lg bg-slate-50 dark:bg-slate-800/50" onClick={() => handleDelete(emp._id || emp.id)}>
                                            <Trash2 size={12} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredEmployees.length === 0 && (
                    <div className="p-20 text-center">
                        <Users className="mx-auto h-12 w-12 text-slate-200 dark:text-slate-800 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No employees found</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or filters.</p>
                    </div>
                )}
            </Card>

            {/* Add Employee Dialog */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl duration-200">
                    <DialogHeader>
                        <DialogTitle>Add New Employee</DialogTitle>
                        <DialogDescription>Enter employee details to give them access to the platform.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddEmployee} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                            <Input
                                id="name"
                                value={newEmployee.name}
                                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                placeholder="Chirag J"
                                className="rounded-xl h-11"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                            <Input
                                id="email"
                                type="email"
                                value={newEmployee.email}
                                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                                placeholder="chirag.j@example.com"
                                className="rounded-xl h-11"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="role" className="text-xs font-bold text-slate-500 uppercase">Role</label>
                            <Input
                                id="role"
                                value={newEmployee.role}
                                onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                                placeholder="Software Engineer"
                                className="rounded-xl h-11"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="manager" className="text-xs font-bold text-slate-500 uppercase">Assign Manager</label>
                            <select
                                id="manager"
                                className="w-full h-11 rounded-xl bg-slate-50 border-slate-200 px-3 text-sm focus:ring-2 focus:ring-primary-500/10 outline-none transition-all"
                                value={newEmployee.managerId}
                                onChange={(e) => setNewEmployee({ ...newEmployee, managerId: e.target.value })}
                            >
                                <option value="">No Manager (Unassigned)</option>
                                {managers.map(mgr => (
                                    <option key={mgr.id} value={mgr.id}>{mgr.name} ({mgr.department})</option>
                                ))}
                            </select>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl h-11 px-6">Cancel</Button>
                            <Button type="submit" className="rounded-xl h-11 px-6 bg-primary-600 hover:bg-primary-700">Add Employee</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>


        </div>
    );
};

export default EmployeeManagement;
