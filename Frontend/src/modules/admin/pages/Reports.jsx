import React, { useState, useMemo } from 'react';
import {
    FileText,
    Download,
    Search,
    Calendar as CalendarIcon,
    Filter,
    ChevronDown,
    ArrowUpRight,
    Printer,
    Share2,
    CheckCircle,
    Plus,
    TrendingUp,
    Users,
    Activity,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { utils, writeFile } from 'xlsx';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/shared/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/components/ui/popover";

import useTaskStore from '@/store/taskStore';
import useEmployeeStore from '@/store/employeeStore';
import useManagerStore from '@/store/managerStore';
import useAuthStore from '@/store/authStore';
import { cn } from '@/shared/utils/cn';

const Reports = () => {
    const { user } = useAuthStore();
    const { tasks } = useTaskStore();
    const { employees } = useEmployeeStore();
    const { managers } = useManagerStore();
    const [dateRange, setDateRange] = useState('30'); // Changed default to 30 days for better data coverage
    const [selectedMember, setSelectedMember] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [reportType, setReportType] = useState('overview'); // overview, employees, managers

    const allMembersList = useMemo(() => [
        ...employees.map(e => ({ ...e, type: 'Employee' })),
        ...managers.map(m => ({ ...m, type: 'Manager' }))
    ], [employees, managers]);

    const filteredData = useMemo(() => {
        return tasks.filter(task => {
            // Apply search term to task title only if in overview mode
            const matchesSearch = reportType === 'overview'
                ? task.title.toLowerCase().includes(searchTerm.toLowerCase())
                : true;

            const matchesMember = selectedMember === 'all'
                ? true
                : (task.assignedTo.includes(selectedMember) || task.assignedToManager === selectedMember);

            const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;

            const now = new Date();
            const taskDate = new Date(task.createdAt);
            const diffDays = Math.ceil((now - taskDate) / (1000 * 60 * 60 * 24));
            const matchesDate = diffDays <= parseInt(dateRange);

            return matchesSearch && matchesMember && matchesStatus && matchesDate;
        });
    }, [tasks, searchTerm, selectedMember, selectedStatus, dateRange, reportType]);

    const reportStats = useMemo(() => {
        return {
            total: filteredData.length,
            completed: filteredData.filter(t => t.status === 'completed').length,
            completionRate: filteredData.length > 0
                ? Math.round((filteredData.filter(t => t.status === 'completed').length / filteredData.length) * 100)
                : 0
        };
    }, [filteredData]);

    const employeeReportData = useMemo(() => {
        return employees
            .map(emp => {
                const empTasks = filteredData.filter(t => t.assignedTo.includes(emp.id));
                const completed = empTasks.filter(t => t.status === 'completed').length;
                const completionRate = empTasks.length > 0 ? Math.round((completed / empTasks.length) * 100) : 0;
                return {
                    ...emp,
                    totalTasks: empTasks.length,
                    completedTasks: completed,
                    completionRate
                };
            })
            .filter(emp => {
                if (reportType !== 'employees') return true;
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch = emp.name.toLowerCase().includes(searchLower) ||
                    emp.role.toLowerCase().includes(searchLower) ||
                    emp.department.toLowerCase().includes(searchLower);
                return matchesSearch && (emp.totalTasks > 0 || searchTerm === '');
            });
    }, [employees, filteredData, searchTerm, reportType]);

    const managerReportData = useMemo(() => {
        return managers
            .map(mgr => {
                const mgrTasks = filteredData.filter(t => t.assignedToManager === mgr.id);
                const completed = mgrTasks.filter(t => t.status === 'completed').length;
                const completionRate = mgrTasks.length > 0 ? Math.round((completed / mgrTasks.length) * 100) : 0;
                return {
                    ...mgr,
                    totalTasks: mgrTasks.length,
                    completedTasks: completed,
                    completionRate
                };
            })
            .filter(mgr => {
                if (reportType !== 'managers') return true;
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch = mgr.name.toLowerCase().includes(searchLower) ||
                    mgr.role?.toLowerCase().includes(searchLower) ||
                    mgr.department?.toLowerCase().includes(searchLower);
                return matchesSearch && (mgr.totalTasks > 0 || searchTerm === '');
            });
    }, [managers, filteredData, searchTerm, reportType]);

    const handleExportExcel = () => {
        let excelData = [];
        let fileName = "";

        if (reportType === 'overview') {
            excelData = filteredData.map(task => ({
                'Task ID': task.id,
                'Task Title': task.title,
                'Description': task.description || 'No description',
                'Assigned To': task.assignedTo.map(id => employees.find(e => e.id === id)?.name || id).join(', '),
                'Status': task.status.toUpperCase(),
                'Priority': task.priority.toUpperCase(),
                'Created Date': format(new Date(task.createdAt), 'MMM dd, yyyy'),
                'Deadline': format(new Date(task.deadline), 'MMM dd, yyyy'),
                'Progress': `${task.progress}%`
            }));
            fileName = `Tasks_Report_${format(new Date(), 'yyyy-MM-dd')}`;
        } else if (reportType === 'employees') {
            excelData = employeeReportData.map(emp => ({
                'Name': emp.name,
                'Email': emp.email,
                'Role': emp.role,
                'Department': emp.department,
                'Total Tasks': emp.totalTasks,
                'Completed Tasks': emp.completedTasks,
                'Completion Rate': `${emp.completionRate}%`
            }));
            fileName = `Employee_Performance_${format(new Date(), 'yyyy-MM-dd')}`;
        } else if (reportType === 'managers') {
            excelData = managerReportData.map(mgr => ({
                'Name': mgr.name,
                'Email': mgr.email,
                'Department': mgr.department,
                'Total Tasks Managed': mgr.totalTasks,
                'Completed Tasks': mgr.completedTasks,
                'Success Rate': `${mgr.completionRate}%`
            }));
            fileName = `Manager_Performance_${format(new Date(), 'yyyy-MM-dd')}`;
        }

        const worksheet = utils.json_to_sheet(excelData);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Data");
        writeFile(workbook, `DinTask_${fileName}.xlsx`);
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 px-1 sm:px-0">
                    <div className="lg:hidden w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                        <img src="/src/assets/logo.png" alt="DinTask" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Reports <span className="text-primary-600">& Analytics</span></h1>
                        <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1 uppercase">Performance tracking</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" className="flex items-center gap-2 border border-slate-100 dark:border-slate-800 h-9 sm:h-10 rounded-xl font-black text-[10px] uppercase tracking-widest">
                        <Printer size={14} />
                        <span className="hidden sm:inline">Print</span>
                    </Button>
                </div>
            </div>

            {/* Report Type Selector */}
            <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar backdrop-blur-sm border border-slate-100 dark:border-slate-800">
                <Button
                    variant="ghost"
                    onClick={() => setReportType('overview')}
                    className={cn(
                        "flex-1 sm:flex-none rounded-[0.9rem] h-9 px-6 sm:px-8 text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300",
                        reportType === 'overview'
                            ? "bg-white dark:bg-slate-700 shadow-md shadow-slate-200/50 dark:shadow-none text-primary-600 dark:text-primary-400"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                >
                    Overview
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => setReportType('employees')}
                    className={cn(
                        "flex-1 sm:flex-none rounded-[0.9rem] h-9 px-6 sm:px-8 text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300",
                        reportType === 'employees'
                            ? "bg-white dark:bg-slate-700 shadow-md shadow-slate-200/50 dark:shadow-none text-primary-600 dark:text-primary-400"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                >
                    Employees
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => setReportType('managers')}
                    className={cn(
                        "flex-1 sm:flex-none rounded-[0.9rem] h-9 px-6 sm:px-8 text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300",
                        reportType === 'managers'
                            ? "bg-white dark:bg-slate-700 shadow-md shadow-slate-200/50 dark:shadow-none text-primary-600 dark:text-primary-400"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                >
                    Managers
                </Button>
            </div>

            {/* Filters Bar */}
            <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem]">
                <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-extrabold ml-1">Period</Label>
                            <Select value={dateRange} onValueChange={setDateRange}>
                                <SelectTrigger className="h-11 bg-slate-50/50 border-none dark:bg-slate-800/50 rounded-2xl text-[12px] font-bold px-5">
                                    <SelectValue placeholder="Select Period" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-xl">
                                    <SelectItem value="7" className="text-xs font-bold uppercase tracking-widest py-2.5">Last 7 Days</SelectItem>
                                    <SelectItem value="30" className="text-xs font-bold uppercase tracking-widest py-2.5">Last 30 Days</SelectItem>
                                    <SelectItem value="90" className="text-xs font-bold uppercase tracking-widest py-2.5">Last Quarter</SelectItem>
                                    <SelectItem value="365" className="text-xs font-bold uppercase tracking-widest py-2.5">This Year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-extrabold ml-1">Assigned</Label>
                            <div className="flex gap-2.5">
                                <Select value={selectedMember} onValueChange={setSelectedMember}>
                                    <SelectTrigger className="h-11 bg-slate-50/50 border-none dark:bg-slate-800/50 flex-1 rounded-2xl text-[12px] font-bold px-5">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-xl">
                                        <SelectItem value="all" className="text-xs font-bold uppercase tracking-widest py-2.5">All Members</SelectItem>
                                        {allMembersList.map(member => (
                                            <SelectItem key={member.id} value={member.id} className="text-xs font-bold py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <span>{member.name}</span>
                                                    <Badge variant="outline" className="text-[8px] h-3.5 px-1 opacity-50 border-none shadow-none uppercase font-black">{member.type.charAt(0)}</Badge>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant={selectedMember === user?.id ? "default" : "secondary"}
                                    onClick={() => setSelectedMember(user?.id)}
                                    className={cn(
                                        "h-11 px-6 rounded-full transition-all shrink-0 font-black text-[10px] uppercase tracking-widest",
                                        selectedMember === user?.id
                                            ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30"
                                            : "bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 border border-slate-100 dark:border-slate-700"
                                    )}
                                >
                                    Me
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-extrabold ml-1">Status</Label>
                            <div className="flex gap-2.5">
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger className="h-11 bg-slate-50/50 border-none dark:bg-slate-800/50 flex-1 rounded-2xl text-[12px] font-bold px-5">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-xl">
                                        <SelectItem value="all" className="text-xs font-bold uppercase tracking-widest py-2.5">All Status</SelectItem>
                                        <SelectItem value="pending" className="text-xs font-bold uppercase tracking-widest py-2.5">Pending</SelectItem>
                                        <SelectItem value="completed" className="text-xs font-bold uppercase tracking-widest py-2.5">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={handleExportExcel}
                                    className="h-11 w-11 shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl border-none shrink-0 flex items-center justify-center transition-all active:scale-95"
                                >
                                    <Download size={18} />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-extrabold ml-1">Search Analytics</Label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Filter by title..."
                                    className="pl-11 h-11 bg-slate-50/50 border-none dark:bg-slate-800/50 rounded-2xl text-[12px] font-bold ring-offset-white focus-visible:ring-2 focus-visible:ring-primary-500/10 placeholder:text-slate-300 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden relative group h-24 lg:h-32">
                        <div className="absolute top-0 right-0 p-2 lg:p-4 opacity-20 transition-transform group-hover:scale-125 duration-500">
                            <Activity size={60} className="lg:size-[80px]" />
                        </div>
                        <CardContent className="p-4 lg:p-6 relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <p className="text-[8px] lg:text-[10px] font-black text-indigo-100 uppercase tracking-[0.2em] opacity-80">Throughput</p>
                                <div className="flex items-baseline gap-1 lg:gap-2 mt-0.5 sm:mt-1">
                                    <span className="text-xl lg:text-4xl font-black">{reportStats.total}</span>
                                    <span className="text-[8px] lg:text-xs font-bold text-indigo-200 opacity-60">Tasks</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-[8px] lg:text-[10px] font-bold text-emerald-300">
                                <TrendingUp size={10} className="lg:size-3" />
                                <span className="truncate">+12% productivity</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-gradient-to-br from-emerald-500 to-emerald-700 text-white overflow-hidden relative group h-24 lg:h-32">
                        <div className="absolute top-0 right-0 p-2 lg:p-4 opacity-20 transition-transform group-hover:scale-125 duration-500">
                            <CheckCircle size={60} className="lg:size-[80px]" />
                        </div>
                        <CardContent className="p-4 lg:p-6 relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <p className="text-[8px] lg:text-[10px] font-black text-emerald-50 text-white/80 uppercase tracking-[0.2em]">Efficiency</p>
                                <div className="flex items-baseline gap-1 lg:gap-2 mt-0.5 sm:mt-1">
                                    <span className="text-xl lg:text-4xl font-black">{reportStats.completionRate}%</span>
                                    <span className="text-[8px] lg:text-xs font-bold text-emerald-100 opacity-60">Success</span>
                                </div>
                            </div>
                            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-1 lg:mt-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${reportStats.completionRate}%` }}
                                    className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Detailed Table */}
            <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 border-b border-slate-50 dark:border-slate-800">
                    <div>
                        <CardTitle className="text-sm sm:text-lg font-black uppercase tracking-tight">
                            {reportType === 'overview' ? 'Task Analysis' : reportType === 'employees' ? 'Staff Performance' : 'Leader Metrics'}
                        </CardTitle>
                        <CardDescription className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-0.5">
                            Detailed performance deep-dive
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-primary-50 dark:bg-primary-900/10 text-primary-600 border-none shadow-none font-black text-[9px] uppercase tracking-widest px-2.5">
                        {reportType === 'overview' ? `${filteredData.length} Items` : reportType === 'employees' ? `${employees.length} Staff` : `${managers.length} Lead`}
                    </Badge>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto w-full">
                        <Table>
                            <TableHeader>
                                {reportType === 'overview' ? (
                                    <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                        <TableHead className="pl-4 md:pl-6 min-w-[200px] text-[10px] font-black uppercase tracking-widest text-slate-400">Name</TableHead>
                                        <TableHead className="min-w-[140px] text-[10px] font-black uppercase tracking-widest text-slate-400">Assignment</TableHead>
                                        <TableHead className="min-w-[120px] text-[10px] font-black uppercase tracking-widest text-slate-400">Schedule</TableHead>
                                        <TableHead className="min-w-[100px] text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                                        <TableHead className="text-right pr-4 md:pr-6 min-w-[90px] text-[10px] font-black uppercase tracking-widest text-slate-400">Rate</TableHead>
                                    </TableRow>
                                ) : (
                                    <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                        <TableHead className="pl-4 md:pl-6 min-w-[180px] text-[10px] font-black uppercase tracking-widest text-slate-400">{reportType === 'employees' ? 'Member' : 'Leader'}</TableHead>
                                        <TableHead className="min-w-[140px] text-[10px] font-black uppercase tracking-widest text-slate-400">Dept.</TableHead>
                                        <TableHead className="min-w-[80px] text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Tasks</TableHead>
                                        <TableHead className="min-w-[80px] text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Done</TableHead>
                                        <TableHead className="text-right pr-4 md:pr-6 min-w-[100px] text-[10px] font-black uppercase tracking-widest text-slate-400">Success</TableHead>
                                    </TableRow>
                                )}
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence mode="popLayout text-center">
                                    {reportType === 'overview' ? (
                                        filteredData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-64 text-center">
                                                    <div className="flex flex-col items-center justify-center opacity-30 italic">
                                                        <Search size={48} className="mb-4" />
                                                        <p className="text-sm font-bold">No matching data found for this period.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredData.map((data, index) => (
                                                <motion.tr
                                                    key={data.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.03 }}
                                                    className="border-slate-50 dark:border-slate-800 group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                                                >
                                                    <TableCell className="pl-4 md:pl-6 font-black text-xs text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors uppercase tracking-tight">
                                                        {data.title}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="flex items-center gap-1 max-w-[130px] overflow-hidden">
                                                                {data.assignedTo.slice(0, 2).map((id, i) => {
                                                                    const emp = employees.find(e => e.id === id);
                                                                    return (
                                                                        <span key={id} className="text-[9px] font-black text-slate-500 whitespace-nowrap bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                                            {emp?.name.split(' ')[0]}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                            {data.assignedTo.length > 2 && (
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <button className="h-6 w-6 rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors shadow-sm focus:outline-none">
                                                                            <Plus size={12} className="stroke-[3px]" />
                                                                        </button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-56 p-3 rounded-2xl border-none shadow-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 z-50">
                                                                        <div className="space-y-2">
                                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Team ({data.assignedTo.length})</p>
                                                                            <div className="space-y-1">
                                                                                {data.assignedTo.map(id => {
                                                                                    const emp = employees.find(e => e.id === id);
                                                                                    return (
                                                                                        <div key={id} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                                                            <Avatar className="h-6 w-6">
                                                                                                <AvatarImage src={emp?.avatar} />
                                                                                                <AvatarFallback className="text-[8px]">{emp?.name.charAt(0)}</AvatarFallback>
                                                                                            </Avatar>
                                                                                            <div className="flex flex-col">
                                                                                                <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">{emp?.name}</span>
                                                                                                <span className="text-[10px] text-slate-500 mt-0.5">{emp?.role || 'Member'}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-[10px] font-bold text-slate-400">
                                                        <div className="flex items-center gap-1.5">
                                                            {format(new Date(data.createdAt), 'MMM dd')}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={data.status === 'completed' ? 'default' : 'secondary'} className={cn("text-[9px] font-black h-5 uppercase tracking-tighter px-1.5 border-none shadow-none", data.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-primary-50 text-primary-600")}>
                                                            {data.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-4 md:pr-6">
                                                        <span className={cn("text-[10px] font-black tracking-tight", data.priority === 'urgent' ? "text-red-500" : "text-slate-900 dark:text-slate-200")}>
                                                            {data.status === 'completed' ? '100%' : '25%'}
                                                        </span>
                                                    </TableCell>
                                                </motion.tr>
                                            ))
                                        )
                                    ) : (
                                        (reportType === 'employees' ? employeeReportData : managerReportData).map((user, index) => (
                                            <motion.tr
                                                key={user.id}
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.03 }}
                                                className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                                            >
                                                <TableCell className="pl-4 md:pl-6">
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar className="h-7 w-7 ring-2 ring-slate-100 dark:ring-slate-800 shadow-sm shrink-0">
                                                            <AvatarImage src={user.avatar} />
                                                            <AvatarFallback className="font-black text-xs">{user.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate">{user.name}</p>
                                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate">{user.role}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">{user.department}</TableCell>
                                                <TableCell className="text-[11px] font-black text-slate-900 dark:text-white text-center">{user.totalTasks}</TableCell>
                                                <TableCell className="text-[11px] font-black text-emerald-600 text-center">
                                                    <span className="bg-emerald-50 dark:bg-emerald-900/10 px-2 py-0.5 rounded-md">{user.completedTasks}</span>
                                                </TableCell>
                                                <TableCell className="text-right pr-4 md:pr-6">
                                                    <div className="flex items-center justify-end gap-2.5">
                                                        <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${user.completionRate}%` }}
                                                                transition={{ duration: 1, ease: "easeOut" }}
                                                                className={cn(
                                                                    "h-full",
                                                                    user.completionRate > 70 ? "bg-emerald-500" : user.completionRate > 40 ? "bg-amber-500" : "bg-red-500"
                                                                )}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-900 dark:text-white">{user.completionRate}%</span>
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Reports;
