import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LifeBuoy,
    Plus,
    Search,
    Clock,
    CheckCircle2,
    AlertCircle,
    User,
    ChevronRight,
    MessageSquare,
    ShieldCheck,
    AlertTriangle,
    Filter,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/shared/components/ui/dialog';
import useAuthStore from '@/store/authStore';
import useTicketStore from '@/store/ticketStore';

const SupportCenter = () => {
    const { user, role } = useAuthStore();
    const { tickets, addTicket, updateTicketStatus, fetchTickets, loading } = useTicketStore();

    React.useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(role === 'admin' ? 'received' : 'sent');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTicket, setNewTicket] = useState({
        subject: '',
        description: '',
        category: 'Technical',
        priority: 'Medium'
    });

    const categories = ['Technical', 'Billing', 'Account', 'Feature Request', 'Other'];
    const priorities = ['Low', 'Medium', 'High', 'Urgent'];

    // Filter Logic
    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.ticketId?.toLowerCase().includes(searchQuery.toLowerCase());

        if (role === 'superadmin') {
            return t.isEscalatedToSuperAdmin && matchesSearch;
        }

        if (role === 'admin') {
            if (activeTab === 'received') {
                // Team tickets: NOT escalated and NOT created by me (although creator check is redundant if valid logic)
                // Filter out tickets I created myself just in case
                return !t.isEscalatedToSuperAdmin && t.creator?._id !== user?.id && matchesSearch;
            } else {
                // My tickets: Created by me (and implicitly escalated if I am admin)
                return t.creator?._id === user?.id && matchesSearch;
            }
        }

        // Employee, Manager, Sales - They only see their own tickets
        return t.creator?._id === user?.id && matchesSearch;
    });

    const handleCreateTicket = async () => {
        if (!newTicket.subject || !newTicket.description) return;

        const ticketData = {
            ...newTicket,
            // Backend handles the rest
        };

        const success = await addTicket(ticketData);
        if (success) {
            setIsCreateModalOpen(false);
            setNewTicket({ subject: '', description: '', category: 'Technical', priority: 'Medium' });
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Open': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Closed': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Urgent': return 'text-rose-600';
            case 'High': return 'text-amber-600';
            case 'Medium': return 'text-blue-600';
            default: return 'text-slate-500';
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 italic">
                        <LifeBuoy className="text-primary-600 size-8" />
                        SUPPORT <span className="text-primary-600">CENTER</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xs uppercase tracking-[0.2em] mt-1">
                        {role === 'superadmin' ? 'Managing Administrator Escalations' :
                            role === 'admin' ? 'Unified Support Hub & Platform Requests' :
                                'Raise tickets for technical & account issues'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {role !== 'superadmin' && (
                        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-11 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-primary-500/20">
                                    <Plus size={16} /> Raise New Ticket
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md bg-white border-none rounded-[2rem] p-8">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black italic tracking-tight uppercase">Raise <span className="text-primary-600">Ticket</span></DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6 mt-4">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</p>
                                        <Input
                                            placeholder="What is the issue?"
                                            value={newTicket.subject}
                                            onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                            className="h-12 border-none bg-slate-50 rounded-xl font-medium"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</p>
                                            <select
                                                className="w-full h-12 bg-slate-50 rounded-xl px-4 text-sm font-bold appearance-none outline-none"
                                                value={newTicket.category}
                                                onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                                            >
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</p>
                                            <select
                                                className="w-full h-12 bg-slate-50 rounded-xl px-4 text-sm font-bold appearance-none outline-none"
                                                value={newTicket.priority}
                                                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                                            >
                                                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</p>
                                        <textarea
                                            rows={4}
                                            placeholder="Explain the issue in detail..."
                                            className="w-full p-4 bg-slate-50 rounded-xl border-none font-medium text-sm outline-none resize-none"
                                            value={newTicket.description}
                                            onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                        />
                                    </div>
                                    <Button
                                        onClick={handleCreateTicket}
                                        disabled={loading}
                                        className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-black text-xs uppercase tracking-widest rounded-xl"
                                    >
                                        {loading ? 'SENDING...' : `SEND TO ${role === 'admin' ? 'SUPER ADMIN' : 'ADMIN'}`}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </header>

            {/* Role Specific Navigation */}
            {role === 'admin' && (
                <div className="flex gap-4 p-1.5 bg-white rounded-2xl w-fit shadow-sm border border-slate-100">
                    <button
                        onClick={() => setActiveTab('received')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'received' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Team Support Requests
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'sent' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        My Support Tickets
                    </button>
                </div>
            )}

            {/* Content Area */}
            <div className="grid lg:grid-cols-12 gap-8">
                {/* Tickets List */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by subject or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 bg-white border-none rounded-[1.25rem] shadow-sm text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all"
                        />
                    </div>

                    <div className="space-y-3">
                        <AnimatePresence mode='popLayout'>
                            {loading ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader2 className="animate-spin text-primary-600" size={32} />
                                </div>
                            ) : filteredTickets.length > 0 ? (
                                filteredTickets.map((ticket) => (
                                    <motion.div
                                        layout
                                        key={ticket._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white border border-slate-100 p-5 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all group cursor-pointer"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`size-12 rounded-2xl flex flex-col items-center justify-center border font-black ${getStatusStyle(ticket.status)}`}>
                                                    <span className="text-[8px] opacity-60">ID</span>
                                                    <span className="text-[10px] tracking-tighter">{ticket.ticketId?.split('-')[1]}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className="border-slate-100 text-[8px] font-black uppercase">{ticket.type}</Badge>
                                                        <span className={`text-[9px] font-black uppercase flex items-center gap-1 ${getPriorityColor(ticket.priority)}`}>
                                                            <AlertCircle size={10} /> {ticket.priority}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{ticket.title}</h3>
                                                    <div className="flex items-center gap-4 mt-1.5">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                                                            <User size={12} className="text-primary-400 text-xs" />
                                                            {role === 'admin' && activeTab === 'received' ? ticket.creator?.name : `Sent to ${ticket.isEscalatedToSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'}`}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                                                            <Clock size={12} className="text-primary-400" />
                                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {role === 'admin' && activeTab === 'received' && ticket.status === 'Open' && (
                                                    <Button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateTicketStatus(ticket._id, 'Resolved');
                                                        }}
                                                        variant="outline"
                                                        className="h-9 px-4 rounded-lg border-emerald-100 text-emerald-600 hover:bg-emerald-50 text-[10px] font-black uppercase tracking-widest"
                                                    >
                                                        Quick Resolve
                                                    </Button>
                                                )}
                                                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(ticket.status)}`}>
                                                    {ticket.status}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-white/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                    <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No support tickets found</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Info / Tips Sidebar */}
                <div className="lg:col-span-4 space-y-6">


                    <Card className="border-none shadow-sm bg-white rounded-[2rem] p-6 lg:p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 size={18} />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-widest underline decoration-emerald-200">Resolution Stats</h4>
                        </div>

                        <div className="space-y-4">
                            {[
                                { label: 'Avg Feedback', val: '4.8/5', color: 'bg-emerald-500' },
                                { label: 'Resolved', val: '92%', color: 'bg-primary-500' },
                                { label: 'In Time', val: '85%', color: 'bg-amber-500' }
                            ].map((stat, i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                                        <span className="text-slate-400">{stat.label}</span>
                                        <span className="text-slate-900">{stat.val}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                        <div className={`h-full ${stat.color} rounded-full`} style={{ width: stat.val.includes('/') ? '96%' : stat.val }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SupportCenter;
