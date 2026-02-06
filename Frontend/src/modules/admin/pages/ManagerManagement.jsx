import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    Mail,
    Phone,
    Shield,
    Users,
    Briefcase,
    CheckCircle2,
    XCircle,
    Download,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { utils, writeFile } from 'xlsx';
import { format } from 'date-fns';
import useManagerStore from '@/store/managerStore';
import useEmployeeStore from '@/store/employeeStore';
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
import { cn } from '@/shared/utils/cn';

import useAuthStore from '@/store/authStore';
import useSalesStore from '@/store/salesStore';

const ManagerManagement = () => {
    const navigate = useNavigate();
    const { managers, addManager, updateManager, deleteManager } = useManagerStore();
    const { employees } = useEmployeeStore();
    const { salesExecutives } = useSalesStore();
    const { user } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [expandedManager, setExpandedManager] = useState(null);
    const [newManager, setNewManager] = useState({ name: '', email: '', department: '' });
    const [editingManager, setEditingManager] = useState(null);
    const [parent] = useAutoAnimate();

    // Limit tracking
    const EMPLOYEE_LIMIT = user?.planDetails?.userLimit || 2;
    const currentCount = managers.length + employees.length + (salesExecutives?.length || 0);
    const isLimitReached = currentCount >= EMPLOYEE_LIMIT;

    const filteredManagers = useMemo(() => {
        return managers.filter(m =>
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [managers, searchTerm]);

    const handleAddManager = (e) => {
        e.preventDefault();
        addManager({
            ...newManager,
            id: `M00${managers.length + 1}`,
            status: 'active',
            teamMembers: []
        });
        setNewManager({ name: '', email: '', department: '' });
        setIsAddModalOpen(false);
    };

    const handleExportExcel = () => {
        const excelData = filteredManagers.map(mgr => ({
            'Manager ID': mgr.id,
            'Name': mgr.name,
            'Email': mgr.email,
            'Department': mgr.department,
            'Team Size': employees.filter(e => e.managerId === mgr.id).length,
            'Status': mgr.status.toUpperCase(),
        }));

        const worksheet = utils.json_to_sheet(excelData);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Managers");
        writeFile(workbook, `Managers_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    };

    const handleEditClick = (mgr) => {
        setEditingManager({ ...mgr });
        setIsEditModalOpen(true);
    };

    const handleUpdateManager = (e) => {
        e.preventDefault();
        if (editingManager) {
            updateManager(editingManager.id, {
                name: editingManager.name,
                email: editingManager.email,
                department: editingManager.department
            });
            setIsEditModalOpen(false);
            setEditingManager(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <div className="flex items-center gap-3 px-1 sm:px-0">
                        <div className="lg:hidden w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                            <img src="/src/assets/dintask_logo_-removebg-preview.png" alt="DinTask" className="h-full w-full object-cover" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Manager <span className="text-primary-600">Management</span></h1>
                            <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Department heads and team hierarchies</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1">
                    <Button
                        variant="outline"
                        onClick={handleExportExcel}
                        className="flex-1 md:flex-none h-9 sm:h-11 px-3 sm:px-4 gap-2 border-slate-100 dark:border-slate-800 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest whitespace-nowrap"
                    >
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
            <div className="bg-blue-50/30 border border-blue-100/50 dark:bg-blue-900/10 dark:border-blue-900/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-6 flex items-center gap-3">
                <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                <p className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-400 font-bold uppercase tracking-widest">
                    Used <span className="text-blue-900 dark:text-white">{currentCount}</span> / <span className="text-blue-900 dark:text-white">{EMPLOYEE_LIMIT}</span> platform slots.
                    {isLimitReached && <span className="ml-2 text-red-500 animate-pulse">Limit reached!</span>}
                </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                {[
                    { label: 'Managers', value: managers.length, icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10' },
                    { label: 'Active', value: managers.filter(m => m.status === 'active').length, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
                    { label: 'Team Size', value: employees.length, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/10' },
                    { label: 'Pending', value: '0', icon: CheckCircle2, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10' }
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
                        <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                            <div className={cn("p-2 sm:p-3 rounded-xl sm:rounded-2xl shrink-0", stat.bg)}>
                                <stat.icon size={16} className={cn("sm:w-5 sm:h-5", stat.color)} />
                            </div>
                            <div className="text-left min-w-0">
                                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{stat.label}</p>
                                <p className="text-base sm:text-xl font-black text-slate-900 dark:text-white leading-tight">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Toolbar */}
            <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden">
                <CardContent className="p-2 sm:p-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Quick search managers..."
                            className="h-10 sm:h-11 pl-10 bg-slate-50 border-none dark:bg-slate-800 rounded-xl sm:rounded-2xl font-bold text-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Manager Table/List */}
            <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] overflow-hidden">
                <div className="overflow-x-auto hidden lg:block">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                <th className="p-5 w-10"></th>
                                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Manager</th>
                                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Size</th>
                                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody ref={parent}>
                            {filteredManagers.map((mgr) => {
                                const teamMembers = employees.filter(e => e.managerId === mgr.id);
                                const teamCount = teamMembers.length;
                                const isExpanded = expandedManager === mgr.id;

                                return (
                                    <React.Fragment key={mgr.id}>
                                        <tr
                                            className={cn(
                                                "border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 transition-colors group cursor-pointer",
                                                isExpanded && "bg-slate-50/80 dark:bg-slate-800/80"
                                            )}
                                            onClick={() => setExpandedManager(isExpanded ? null : mgr.id)}
                                        >
                                            <td className="p-5">
                                                {isExpanded ? <ChevronUp size={16} className="text-primary-600" /> : <ChevronDown size={16} className="text-slate-400" />}
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
                                                        <AvatarImage src={mgr.avatar} />
                                                        <AvatarFallback className="bg-primary-50 text-primary-600 font-bold">{mgr.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white leading-none">{mgr.name}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{mgr.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <Badge variant="outline" className="rounded-lg font-bold text-[10px] bg-slate-50 text-slate-600 tracking-wider">
                                                    {mgr.department}
                                                </Badge>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                    <Users size={14} className="text-slate-400" />
                                                    <span className="text-sm font-bold text-slate-700">{teamCount} Members</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "h-1.5 w-1.5 rounded-full",
                                                        mgr.status === 'active' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300"
                                                    )} />
                                                    <span className={cn(
                                                        "text-xs font-bold uppercase tracking-widest",
                                                        mgr.status === 'active' ? "text-emerald-600" : "text-slate-400"
                                                    )}>
                                                        {mgr.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                                                        onClick={() => handleEditClick(mgr)}
                                                    >
                                                        <Edit2 size={14} />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg" onClick={() => navigate('/admin/chat')}>
                                                        <MessageSquare size={14} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                        onClick={() => deleteManager(mgr.id)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bg-slate-50/30 dark:bg-slate-800/20">
                                                <td colSpan={6} className="p-0">
                                                    <div className="px-16 py-6 animate-in slide-in-from-top-2 duration-300">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                                Team Members
                                                                <Badge className="bg-primary-50 text-primary-700 hover:bg-primary-50 border-none px-2 py-0.5 text-[9px]">{teamCount} Total</Badge>
                                                            </h4>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {teamMembers.length > 0 ? (
                                                                teamMembers.map(emp => (
                                                                    <div key={emp.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm group/employee">
                                                                        <div className="flex items-center gap-3">
                                                                            <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                                                                                <AvatarImage src={emp.avatar} />
                                                                                <AvatarFallback className="bg-slate-50 text-slate-600 text-[10px] font-bold">{emp.name.charAt(0)}</AvatarFallback>
                                                                            </Avatar>
                                                                            <div>
                                                                                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{emp.name}</p>
                                                                                <p className="text-[10px] text-slate-500 mt-1">{emp.role}</p>
                                                                            </div>
                                                                        </div>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-primary-600 rounded-lg">
                                                                            <ExternalLink size={14} />
                                                                        </Button>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="col-span-3 py-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No team members assigned</p>
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
                    {filteredManagers.map((mgr) => {
                        const teamCount = employees.filter(e => e.managerId === mgr.id).length;
                        return (
                            <div key={mgr.id} className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-slate-100 dark:border-slate-800">
                                            <AvatarImage src={mgr.avatar} />
                                            <AvatarFallback className="bg-primary-50 text-primary-600 font-black">{mgr.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-black text-slate-900 dark:text-white text-sm leading-tight">{mgr.name}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">{mgr.email}</p>
                                        </div>
                                    </div>
                                    <Badge className={cn(
                                        "text-[8px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 text-slate-500",
                                        mgr.status === 'active' && "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                                    )}>
                                        {mgr.status}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl">
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Department</p>
                                        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{mgr.department}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Team Size</p>
                                        <div className="flex items-center gap-1.5">
                                            <Users size={10} className="text-slate-400" />
                                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{teamCount} Members</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest h-5">Manager</Badge>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-400 hover:text-primary-600 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditClick(mgr);
                                            }}
                                        >
                                            <Edit2 size={12} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary-600 rounded-lg bg-slate-50 dark:bg-slate-800/50" onClick={() => navigate('/admin/chat')}>
                                            <MessageSquare size={12} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 rounded-lg bg-slate-50 dark:bg-slate-800/50" onClick={() => deleteManager(mgr.id)}>
                                            <Trash2 size={12} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredManagers.length === 0 && (
                        <div className="p-10 text-center">
                            <Shield className="mx-auto h-10 w-10 text-slate-200 mb-3" />
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">Empty State</h3>
                            <p className="text-[10px] text-slate-500 font-medium">No managers match your criteria.</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Add Manager Dialog */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle>Add New Manager</DialogTitle>
                        <DialogDescription>Create a new department head account.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddManager} className="space-y-4 py-4">
                        <div className="grid gap-2 text-left">
                            <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                            <Input
                                value={newManager.name}
                                onChange={(e) => setNewManager({ ...newManager, name: e.target.value })}
                                placeholder="Manager Name"
                                className="rounded-xl h-11"
                                required
                            />
                        </div>
                        <div className="grid gap-2 text-left">
                            <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                            <Input
                                type="email"
                                value={newManager.email}
                                onChange={(e) => setNewManager({ ...newManager, email: e.target.value })}
                                placeholder="manager@dintask.com"
                                className="rounded-xl h-11"
                                required
                            />
                        </div>
                        <div className="grid gap-2 text-left">
                            <label className="text-xs font-bold text-slate-500 uppercase">Department</label>
                            <Input
                                value={newManager.department}
                                onChange={(e) => setNewManager({ ...newManager, department: e.target.value })}
                                placeholder="Engineering, Operations, etc."
                                className="rounded-xl h-11"
                                required
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl h-11 px-6">Cancel</Button>
                            <Button type="submit" className="rounded-xl h-11 px-6 bg-primary-600 hover:bg-primary-700">Create Manager</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Manager Dialog */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle>Edit Manager Details</DialogTitle>
                        <DialogDescription>Update the information for {editingManager?.name}.</DialogDescription>
                    </DialogHeader>
                    {editingManager && (
                        <form onSubmit={handleUpdateManager} className="space-y-4 py-4">
                            <div className="grid gap-2 text-left">
                                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                <Input
                                    value={editingManager.name}
                                    onChange={(e) => setEditingManager({ ...editingManager, name: e.target.value })}
                                    className="rounded-xl h-11"
                                    required
                                />
                            </div>
                            <div className="grid gap-2 text-left">
                                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                                <Input
                                    type="email"
                                    value={editingManager.email}
                                    onChange={(e) => setEditingManager({ ...editingManager, email: e.target.value })}
                                    className="rounded-xl h-11"
                                    required
                                />
                            </div>
                            <div className="grid gap-2 text-left">
                                <label className="text-xs font-bold text-slate-500 uppercase">Department</label>
                                <Input
                                    value={editingManager.department}
                                    onChange={(e) => setEditingManager({ ...editingManager, department: e.target.value })}
                                    className="rounded-xl h-11"
                                    required
                                />
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="rounded-xl h-11 px-6">Cancel</Button>
                                <Button type="submit" className="rounded-xl h-11 px-6 bg-primary-600 hover:bg-primary-700">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManagerManagement;
