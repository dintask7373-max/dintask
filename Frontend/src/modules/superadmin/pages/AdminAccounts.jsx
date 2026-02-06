import React, { useState } from 'react';
import {
    Building2,
    Search,
    Filter,
    MoreVertical,
    ShieldAlert,
    CheckCircle2,
    Clock,
    XOctagon,
    Eye,
    Trash2,
    ChevronRight,
    UserPlus,
    Plus,
    ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/shared/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/shared/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";

import useSuperAdminStore from '@/store/superAdminStore';
import { cn } from '@/shared/utils/cn';
import { fadeInUp, staggerContainer, scaleOnTap } from '@/shared/utils/animations';

const AdminAccounts = () => {
    const {
        admins,
        fetchAdmins,
        updateAdminStatus,
        deleteAdmin,
        plans,
        fetchPlans,
        updateAdminPlan
    } = useSuperAdminStore();
    const [searchTerm, setSearchTerm] = useState('');

    React.useEffect(() => {
        fetchAdmins();
        fetchPlans();
    }, [fetchAdmins, fetchPlans]);

    // Handle default plan setup once plans are loaded
    React.useEffect(() => {
        if (plans && plans.length > 0 && !newAdmin.planId) {
            const defaultPlan = plans.find(p => p.name === 'Starter') || plans[0];
            setNewAdmin(prev => ({
                ...prev,
                plan: defaultPlan.name,
                planId: defaultPlan._id
            }));
        }
    }, [plans]);
    const filteredAdmins = (admins || []).filter(adm =>
        adm.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adm.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adm.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStatusChange = async (id, newStatus) => {
        const success = await updateAdminStatus(id, newStatus);
        if (success) {
            toast.success(`Account status updated to ${newStatus}`);
        } else {
            toast.error("Failed to update status");
        }
    };

    const handlePlanChange = async (adminId, planId, planName) => {
        const success = await updateAdminPlan(adminId, planId, planName);
        if (success) {
            toast.success(`Subscription updated to ${planName}`);
        } else {
            toast.error("Failed to update plan");
        }
    };

    const statusIcons = {
        active: <CheckCircle2 size={14} className="text-emerald-500" />,
        pending: <Clock size={14} className="text-amber-500" />,
        suspended: <XOctagon size={14} className="text-red-500" />
    };

    const statusColors = {
        active: "bg-emerald-50 text-emerald-600 border-emerald-100",
        pending: "bg-amber-50 text-amber-600 border-amber-100",
        suspended: "bg-red-50 text-red-600 border-red-100"
    };

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newAdmin, setNewAdmin] = useState({
        name: '',
        owner: '',
        email: '',
        plan: 'Starter',
        planId: '',
        status: 'pending'
    });

    const handleDeleteAdmin = async (id) => {
        if (window.confirm("Are you sure you want to terminate this account? This action is irreversible.")) {
            const success = await deleteAdmin(id);
            if (success) {
                toast.success("Account terminated successfully");
            } else {
                toast.error("Failed to delete account");
            }
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        if (!newAdmin.name || !newAdmin.owner || !newAdmin.email) {
            toast.error("Please fill all required fields");
            return;
        }

        const result = await useSuperAdminStore.getState().addAdmin(newAdmin);
        if (result.success) {
            toast.success("Company account provisioned successfully");
            setIsAddModalOpen(false);
            setNewAdmin({
                name: '',
                owner: '',
                email: '',
                plan: 'Starter',
                planId: '',
                status: 'pending'
            });
        } else {
            toast.error(result.error || "Failed to provision account");
        }
    };

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-6 pb-12"
        >
            <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-0.5">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        Admin Accounts <Building2 className="text-primary-600" size={24} />
                    </h1>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest">
                        Manage client companies & access
                    </p>
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-11 px-6 bg-primary-600 hover:bg-primary-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-primary-500/20 active:scale-95 transition-all flex items-center gap-2">
                            <Plus size={18} /> ADD COMPANY
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-8 border-none bg-white dark:bg-slate-900 shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase leading-tight">
                                Create <span className="text-primary-600">New Admin</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Manually provision a new company account
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddAdmin} className="space-y-5 pt-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Company Name</Label>
                                <Input
                                    placeholder="Enter company name..."
                                    className="h-12 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl font-bold text-xs"
                                    value={newAdmin.name}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Owner Name</Label>
                                    <Input
                                        placeholder="Full name..."
                                        className="h-12 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl font-bold text-xs"
                                        value={newAdmin.owner}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, owner: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subscription Plan</Label>
                                    <Select
                                        value={newAdmin.plan}
                                        onValueChange={(val) => {
                                            const selectedPlan = plans.find(p => p.name === val);
                                            setNewAdmin({
                                                ...newAdmin,
                                                plan: val,
                                                planId: selectedPlan?._id || ''
                                            });
                                        }}
                                    >
                                        <SelectTrigger className="h-12 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl font-bold text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-xl">
                                            {plans.map(plan => (
                                                <SelectItem key={plan._id} value={plan.name} className="text-xs font-bold rounded-lg">{plan.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</Label>
                                <Input
                                    type="email"
                                    placeholder="admin@company.com"
                                    className="h-12 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl font-bold text-xs"
                                    value={newAdmin.email}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                />
                            </div>
                            <div className="pt-2">
                                <Button type="submit" className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary-500/20 active:scale-95 transition-all">
                                    PROVISION ACCOUNT <ArrowUpRight className="ml-2" size={16} />
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </motion.div>

            <motion.div variants={fadeInUp}>
                <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden rounded-2xl sm:rounded-[2rem]">
                    <div className="p-3 sm:p-4 border-b border-slate-50 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                            <Input
                                placeholder="Search companies..."
                                className="pl-9 h-9 bg-slate-50 border-none dark:bg-slate-800 rounded-xl font-bold text-[11px] focus:ring-2 focus:ring-primary-500/10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <CardContent className="p-0">
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-slate-50 dark:border-slate-800">
                                        <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[200px]">Company & Owner</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[100px]">Current Plan</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[90px]">Team Size</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[100px]">Tasks</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[100px]">Status</TableHead>
                                        <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[50px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence mode="popLayout">
                                        {filteredAdmins.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-48 text-center text-slate-400">
                                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full w-fit mx-auto mb-4">
                                                        <ShieldAlert size={32} className="opacity-20 text-slate-900 dark:text-white" />
                                                    </div>
                                                    <p className="font-bold text-slate-900 dark:text-white">No administrative accounts found.</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredAdmins.map((adm) => (
                                                <motion.tr
                                                    key={adm._id}
                                                    variants={fadeInUp}
                                                    initial="initial"
                                                    animate="animate"
                                                    exit="exit"
                                                    layout
                                                    className="border-slate-50 dark:border-slate-800 group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                                                >
                                                    <TableCell className="pl-8">
                                                        <div className="space-y-0.5 py-0.5">
                                                            <p className="font-black text-slate-900 dark:text-white leading-tight text-[13px] tracking-tight">{adm.companyName}</p>
                                                            <p className="text-[9px] text-slate-400 flex items-center gap-1 font-bold">
                                                                {adm.name} <span className="text-slate-200 dark:text-slate-700 md:inline hidden">â€¢</span> <span className="hidden md:inline">{adm.email}</span>
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-none bg-primary-50 dark:bg-primary-900/10 text-primary-600 px-2.5 py-1 rounded-lg">
                                                                {adm.subscriptionPlan || 'No Plan'}
                                                            </Badge>
                                                            <p className="text-[10px] text-slate-400 font-bold ml-1">
                                                                â‚¹{plans.find(p => p.name === adm.subscriptionPlan)?.price.toLocaleString('en-IN') || '0'}/mo
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                                        {adm.employees} Members
                                                    </TableCell>
                                                    <TableCell className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                                        {adm.tasks} Generated
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={cn(
                                                            "text-[9px] h-6 font-black uppercase tracking-widest gap-1.5 border px-2.5 rounded-full shadow-sm",
                                                            statusColors[adm.subscriptionStatus || 'pending']
                                                        )}>
                                                            {statusIcons[adm.subscriptionStatus || 'pending']}
                                                            {adm.subscriptionStatus}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-8">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
                                                                    <MoreVertical size={18} />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2">

                                                                <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 px-2 py-1.5">Set Status</DropdownMenuLabel>
                                                                <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl font-bold text-xs py-2.5 text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 dark:focus:bg-emerald-900/10" onClick={() => handleStatusChange(adm._id, 'active')}>
                                                                    <CheckCircle2 size={16} /> Mark Active
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl font-bold text-xs py-2.5 text-amber-600 focus:text-amber-700 focus:bg-amber-50 dark:focus:bg-amber-900/10" onClick={() => handleStatusChange(adm._id, 'pending')}>
                                                                    <Clock size={16} /> Mark Pending
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl font-bold text-xs py-2.5 text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/10" onClick={() => handleStatusChange(adm._id, 'suspended')}>
                                                                    <XOctagon size={16} /> Suspend Account
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="my-2" />
                                                                <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 px-2 py-1.5">Change Plan</DropdownMenuLabel>
                                                                {plans.map(plan => (
                                                                    <DropdownMenuItem
                                                                        key={plan._id}
                                                                        className="gap-3 cursor-pointer rounded-xl font-bold text-xs py-2.5"
                                                                        onClick={() => handlePlanChange(adm._id, plan._id, plan.name)}
                                                                    >
                                                                        Upgrade to {plan.name}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                                <DropdownMenuSeparator className="my-2" />
                                                                <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl font-black text-xs py-2.5 text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/10" onClick={() => handleDeleteAdmin(adm._id)}>
                                                                    <Trash2 size={16} /> Delete Company
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </motion.tr>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-slate-50 dark:divide-slate-800">
                            {filteredAdmins.length === 0 ? (
                                <div className="p-12 text-center text-slate-400">
                                    <p className="font-bold">No accounts found.</p>
                                </div>
                            ) : (
                                filteredAdmins.map((adm) => (
                                    <div key={adm._id} className="p-3 sm:p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-0.5">
                                                <h4 className="font-black text-slate-900 dark:text-white text-sm">{adm.companyName}</h4>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{adm.name}</p>
                                                <p className="text-[9px] text-slate-400 font-medium truncate max-w-[150px]">{adm.email}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5">
                                                <Badge className={cn(
                                                    "text-[8px] h-5 px-2 font-black uppercase tracking-widest gap-1 border rounded-full",
                                                    statusColors[adm.subscriptionStatus || 'pending']
                                                )}>
                                                    {adm.subscriptionStatus}
                                                </Badge>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-7 w-7 rounded-lg border border-slate-100 dark:border-slate-800">
                                                            <MoreVertical size={12} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                                        <DropdownMenuItem className="gap-2 font-bold text-xs py-2" onClick={() => handleStatusChange(adm._id, 'active')}>
                                                            <CheckCircle2 size={14} className="text-emerald-500" /> Active
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2 font-bold text-xs py-2" onClick={() => handleStatusChange(adm._id, 'suspended')}>
                                                            <XOctagon size={14} className="text-red-500" /> Suspend
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                                            <div className="space-y-0.5">
                                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Plan</p>
                                                <p className="text-[10px] font-black text-primary-600 uppercase tracking-tight">{adm.plan}</p>
                                            </div>
                                            <div className="space-y-0.5 text-right">
                                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Team Size</p>
                                                <p className="text-[10px] font-bold text-slate-900 dark:text-white">{adm.employees} Members</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="grid grid-cols-3 gap-2 px-1 md:px-0">
                <motion.div variants={fadeInUp} className="p-2 md:p-5 rounded-xl md:rounded-[2rem] bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1.5 md:gap-3 transition-all duration-500 min-w-0">
                    <div className="p-1 md:p-3 bg-white dark:bg-emerald-900/20 rounded-lg md:rounded-2xl shadow-sm shrink-0">
                        <CheckCircle2 className="text-emerald-500 h-3 w-3 md:h-5 md:w-5" />
                    </div>
                    <div className="min-w-0 overflow-hidden">
                        <h4 className="text-sm md:text-2xl font-black text-emerald-700 dark:text-emerald-400 tracking-tighter leading-none">{(admins || []).filter(a => a.subscriptionStatus === 'active').length}</h4>
                        <p className="text-[6px] md:text-[8px] font-black text-emerald-600 dark:text-emerald-500/70 uppercase tracking-widest mt-0.5 md:mt-1 truncate">Active</p>
                    </div>
                </motion.div>
                <motion.div variants={fadeInUp} className="p-2 md:p-5 rounded-xl md:rounded-[2rem] bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-center gap-1.5 md:gap-3 transition-all duration-500 min-w-0">
                    <div className="p-1 md:p-3 bg-white dark:bg-amber-900/20 rounded-lg md:rounded-2xl shadow-sm shrink-0">
                        <Clock className="text-amber-500 h-3 w-3 md:h-5 md:w-5" />
                    </div>
                    <div className="min-w-0 overflow-hidden">
                        <h4 className="text-sm md:text-2xl font-black text-amber-700 dark:text-amber-400 tracking-tighter leading-none">{(admins || []).filter(a => a.subscriptionStatus === 'pending').length}</h4>
                        <p className="text-[6px] md:text-[8px] font-black text-amber-600 dark:text-amber-500/70 uppercase tracking-widest mt-0.5 md:mt-1 truncate">Pending</p>
                    </div>
                </motion.div>
                <motion.div variants={fadeInUp} className="p-2 md:p-5 rounded-xl md:rounded-[2rem] bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 flex items-center gap-1.5 md:gap-3 transition-all duration-500 min-w-0">
                    <div className="p-1 md:p-3 bg-white dark:bg-red-900/20 rounded-lg md:rounded-2xl shadow-sm shrink-0">
                        <XOctagon className="text-red-500 h-3 w-3 md:h-5 md:w-5" />
                    </div>
                    <div className="min-w-0 overflow-hidden">
                        <h4 className="text-sm md:text-2xl font-black text-red-700 dark:text-red-400 tracking-tighter leading-none">{(admins || []).filter(a => a.subscriptionStatus === 'suspended').length}</h4>
                        <p className="text-[6px] md:text-[8px] font-black text-red-600 dark:text-red-500/70 uppercase tracking-widest mt-0.5 md:mt-1 truncate">Blocked</p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AdminAccounts;
