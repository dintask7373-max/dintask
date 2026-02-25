import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
<<<<<<< HEAD
import { Users, Plus, TrendingUp } from 'lucide-react';
=======
import { Users, TrendingUp, Edit2, Trash2 } from 'lucide-react';
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
import { cn } from '@/shared/utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/shared/components/ui/dialog";
import useCRMStore from '@/store/crmStore';
import useAuthStore from '@/store/authStore';

const Clients = () => {
    const { user } = useAuthStore();
    const { leads, addLead, editLead, deleteLead } = useCRMStore();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [editClientData, setEditClientData] = useState({
        name: '',
        company: '',
        email: '',
        phone: ''
    });

<<<<<<< HEAD
    const [isAddClientOpen, setIsAddClientOpen] = useState(false);
    const [newClientData, setNewClientData] = useState({
        name: '',
        company: '',
        email: '',
        phone: ''
    });

=======
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
    const myClients = leads;

    const stats = useMemo(() => {
        return {
            total: myClients.length,
            active: myClients.filter(c => c.status === 'Won').length,
            potential: myClients.filter(c => c.status !== 'Won').length,
            growth: '+12.5%'
        };
    }, [myClients]);

<<<<<<< HEAD
    const handleAddClient = () => {
        if (!newClientData.name || !newClientData.company) {
            toast.error("Name and Company are required");
            return;
        }

        const newClient = {
            ...newClientData,
            status: 'Won',
            owner: user?.id || '1',
            createdAt: new Date().toISOString(),
            source: 'Manual'
        };
        addLead(newClient);
        toast.success('Client integrated successfully');
        setIsAddClientOpen(false);
        setNewClientData({ name: '', company: '', email: '', phone: '' });
=======

    const handleEditClick = (client) => {
        setSelectedClient(client);
        setEditClientData({
            name: client.name,
            company: client.company,
            email: client.email,
            phone: client.phone
        });
        setIsEditOpen(true);
    };

    const handleUpdateClient = () => {
        if (!editClientData.name || !editClientData.company) {
            toast.error("Name and Company are required");
            return;
        }

        editLead(selectedClient._id || selectedClient.id, editClientData);
        setIsEditOpen(false);
        setSelectedClient(null);
    };

    const handleDeleteClient = (client) => {
        if (window.confirm(`Are you sure you want to delete client "${client.name}"?`)) {
            deleteLead(client._id || client.id);
        }
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
    };

    return (
        <div className="space-y-4 sm:space-y-6 pb-10">
<<<<<<< HEAD
            {/* Sticky Header & Stats Section */}
            <div className="sticky top-0 z-30 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md pt-4 -mt-4 pb-2 space-y-4 sm:space-y-6">
=======
            {/* Header & Stats Section */}
            <div className="pt-2 pb-2 space-y-4 sm:space-y-6">
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
                {/* Header section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
<<<<<<< HEAD
                                Client <span className="text-primary-600">Infrastructure</span>
                            </h1>
                            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-1 leading-none">
                                Accelerating high-value partnerships
                            </p>
                        </div>
                    </div>
                    <Button
                        className="h-9 px-4 sm:px-6 gap-2 shadow-lg shadow-primary-500/20 bg-primary-600 hover:bg-primary-700 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest w-full sm:w-auto"
                        onClick={() => setIsAddClientOpen(true)}
                    >
                        <Plus size={14} className="sm:size-4" />
                        <span>Onboard Client</span>
                    </Button>
                </div>

                {/* High-Density Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pb-2">
                    {[
                        { label: 'Total Base', value: stats.total, icon: <Users size={16} />, color: 'primary', border: 'border-primary-100', shadow: 'shadow-primary-200/50', gradient: 'bg-gradient-to-br from-white to-primary-50/30' },
                        { label: 'Active Links', value: stats.active, icon: <TrendingUp size={16} />, color: 'emerald', border: 'border-emerald-100', shadow: 'shadow-emerald-200/50', gradient: 'bg-gradient-to-br from-white to-emerald-50/30' },
=======
                                Client <span className="text-primary-600">Database</span>
                            </h1>
                            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-1 leading-none">
                                Manage and grow your client relationships
                            </p>
                        </div>
                    </div>
                </div>

                {/* High-Density Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pb-2 px-1">
                    {[
                        { label: 'Total Clients', value: stats.total, icon: <Users size={16} />, color: 'primary', border: 'border-primary-100', shadow: 'shadow-primary-200/50', gradient: 'bg-gradient-to-br from-white to-primary-50/30' },
                        { label: 'Active Clients', value: stats.active, icon: <TrendingUp size={16} />, color: 'emerald', border: 'border-emerald-100', shadow: 'shadow-emerald-200/50', gradient: 'bg-gradient-to-br from-white to-emerald-50/30' },
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
                        { label: 'Potential', value: stats.potential, icon: <Users size={16} />, color: 'indigo', border: 'border-indigo-100', shadow: 'shadow-indigo-200/50', gradient: 'bg-gradient-to-br from-white to-indigo-50/30' },
                        { label: 'Growth rate', value: stats.growth, icon: <TrendingUp size={16} />, color: 'blue', border: 'border-blue-100', shadow: 'shadow-blue-200/50', gradient: 'bg-gradient-to-br from-white to-blue-50/30' }
                    ].map((stat, i) => (
                        <Card key={i} className={cn(
                            "border-2 shadow-lg rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1",
                            stat.border,
                            stat.shadow,
                            stat.gradient,
                            "dark:from-slate-900 dark:to-slate-800"
                        )}>
                            <CardContent className="p-4 sm:p-5 space-y-3">
                                <div className={cn(
                                    "size-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-inner",
                                    stat.color === 'primary' ? "bg-primary-100 text-primary-600 dark:bg-primary-900/40" :
                                        stat.color === 'emerald' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40" :
                                            stat.color === 'indigo' ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40" :
                                                "bg-blue-100 text-blue-600 dark:bg-blue-900/40"
                                )}>
                                    {React.cloneElement(stat.icon, { size: 16 })}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 sm:mb-1.5">{stat.label}</p>
                                    <p className={cn("text-lg sm:text-2xl font-black leading-none uppercase tracking-tight",
                                        stat.color === 'primary' ? 'text-primary-600' :
                                            stat.color === 'emerald' ? 'text-emerald-600' :
                                                stat.color === 'indigo' ? 'text-indigo-600' : 'text-blue-600'
                                    )}>{stat.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <Card className="border-2 border-primary-100 shadow-xl shadow-primary-200/30 dark:border-primary-900 dark:shadow-none bg-gradient-to-br from-white to-primary-50/30 dark:from-slate-900 dark:to-primary-900/10 rounded-2xl overflow-hidden">
                <CardHeader className="py-2.5 sm:py-3 px-4 sm:px-6 border-b border-slate-50 dark:border-slate-800">
<<<<<<< HEAD
                    <CardTitle className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Database core</CardTitle>
=======
                    <CardTitle className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Client List</CardTitle>
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto scrollbar-hide">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-50 dark:border-slate-800">
<<<<<<< HEAD
                                    <TableHead className="px-4 sm:px-6 py-3 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">ID / Force</TableHead>
                                    <TableHead className="px-4 sm:px-6 py-3 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">Organization</TableHead>
                                    <TableHead className="hidden md:table-cell px-4 sm:px-6 py-3 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">Comm Link</TableHead>
=======
                                    <TableHead className="px-4 sm:px-6 py-3 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">Client Name</TableHead>
                                    <TableHead className="px-4 sm:px-6 py-3 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">Company</TableHead>
                                    <TableHead className="hidden md:table-cell px-4 sm:px-6 py-3 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">Email Address</TableHead>
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
                                    <TableHead className="px-4 sm:px-6 py-3 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                                    <TableHead className="px-4 sm:px-6 py-3 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {myClients.map((client, index) => (
                                    <TableRow key={`${client._id || client.id || 'new'}-${index}`} className="group border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <TableCell className="px-4 sm:px-6 py-3">
                                            <div className="flex items-center gap-2.5 sm:gap-3">
                                                <div className="size-7 sm:size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-slate-500 uppercase shrink-0">
                                                    {client.name.substring(0, 2)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-none mb-1 uppercase tracking-tight truncate">{client.name}</p>
                                                    <p className="text-[7px] sm:text-[8px] text-slate-400 font-black uppercase tracking-widest">ID: {String(client.id).padStart(6, '0')}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 sm:px-6 py-3">
                                            <p className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 uppercase truncate max-w-[120px]">{client.company}</p>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell px-6 py-3">
                                            <p className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{client.email}</p>
                                        </TableCell>
                                        <TableCell className="px-6 py-3">
                                            <Badge className={cn(
                                                "rounded-lg border-none px-2 py-0.5 font-black text-[8px] uppercase tracking-widest",
                                                client.status === 'Won' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                                            )}>
<<<<<<< HEAD
                                                {client.status === 'Won' ? 'Strategic' : 'Tactical'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-3 text-right">
                                            <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-white dark:hover:bg-slate-800">
                                                <Plus size={14} className="text-slate-400 group-hover:text-primary-600 transition-all" />
                                            </Button>
=======
                                                {client.status === 'Won' ? 'Active' : 'Potential'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-400 hover:text-primary-600 transition-all"
                                                    onClick={() => handleEditClick(client)}
                                                >
                                                    <Edit2 size={14} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-400 hover:text-red-600 transition-all"
                                                    onClick={() => handleDeleteClient(client)}
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

<<<<<<< HEAD
            {/* Onboard Client Dialog */}
            <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
                <DialogContent className="sm:max-w-[440px] rounded-[1.5rem] border-none shadow-2xl p-0 overflow-hidden">
                    <div className="bg-slate-900 p-6 text-white relative">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Onboard Client</DialogTitle>
                        <DialogDescription className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-1 italic">
                            Register new strategic partner node
=======

            {/* Edit Client Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[440px] rounded-[1.5rem] border-none shadow-2xl p-0 overflow-hidden">
                    <div className="bg-slate-900 p-6 text-white relative">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Update Client</DialogTitle>
                        <DialogDescription className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-1 italic">
                            Modify client database record
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
                        </DialogDescription>
                    </div>
                    <div className="p-6 space-y-4 bg-white dark:bg-slate-900">
                        <div className="space-y-1.5">
<<<<<<< HEAD
                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Client Authority</Label>
                            <Input
                                placeholder="Full Name"
                                className="h-10 bg-slate-50 border-none rounded-xl font-bold text-sm px-4"
                                value={newClientData.name}
                                onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Organization</Label>
                            <Input
                                placeholder="Entity Name"
                                className="h-10 bg-slate-50 border-none rounded-xl font-bold text-sm px-4"
                                value={newClientData.company}
                                onChange={(e) => setNewClientData({ ...newClientData, company: e.target.value })}
=======
                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Client Name</Label>
                            <Input
                                placeholder="Full Name"
                                className="h-10 bg-slate-50 border-none rounded-xl font-bold text-sm px-4"
                                value={editClientData.name}
                                onChange={(e) => setEditClientData({ ...editClientData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Company Name</Label>
                            <Input
                                placeholder="Entity Name"
                                className="h-10 bg-slate-50 border-none rounded-xl font-bold text-sm px-4"
                                value={editClientData.company}
                                onChange={(e) => setEditClientData({ ...editClientData, company: e.target.value })}
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
<<<<<<< HEAD
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Comm Channel</Label>
                                <Input
                                    placeholder="Email"
                                    className="h-10 bg-slate-50 border-none rounded-xl font-bold text-sm px-4"
                                    value={newClientData.email}
                                    onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Direct Link</Label>
                                <Input
                                    placeholder="Phone"
                                    className="h-10 bg-slate-50 border-none rounded-xl font-bold text-sm px-4"
                                    value={newClientData.phone}
                                    onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
=======
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</Label>
                                <Input
                                    placeholder="Email"
                                    className="h-10 bg-slate-50 border-none rounded-xl font-bold text-sm px-4"
                                    value={editClientData.email}
                                    onChange={(e) => setEditClientData({ ...editClientData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</Label>
                                <Input
                                    placeholder="Phone"
                                    className="h-10 bg-slate-50 border-none rounded-xl font-bold text-sm px-4"
                                    value={editClientData.phone}
                                    onChange={(e) => setEditClientData({ ...editClientData, phone: e.target.value })}
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
                                />
                            </div>
                        </div>
                        <DialogFooter className="pt-4 flex gap-2">
<<<<<<< HEAD
                            <Button variant="ghost" className="flex-1 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest" onClick={() => setIsAddClientOpen(false)}>Abort</Button>
                            <Button className="flex-1 h-10 rounded-xl bg-primary-600 hover:bg-primary-700 font-black text-[9px] uppercase tracking-widest text-white shadow-lg" onClick={handleAddClient}>Initialize Sync</Button>
=======
                            <Button variant="ghost" className="flex-1 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button className="flex-1 h-10 rounded-xl bg-primary-600 hover:bg-primary-700 font-black text-[9px] uppercase tracking-widest text-white shadow-lg" onClick={handleUpdateClient}>Update Database</Button>
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Clients;
