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
import { Sheet, SheetContent } from '@/shared/components/ui/sheet';
import { Textarea } from '@/shared/components/ui/textarea';
import { cn } from '@/shared/utils/cn';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import useAuthStore from '@/store/authStore';
import useTicketStore from '@/store/ticketStore';

const SupportCenter = () => {
    const { user, role } = useAuthStore();
    const { tickets, addTicket, updateTicketStatus, fetchTickets, loading, fetchTicketStats, stats, replyToTicket } = useTicketStore();

    React.useEffect(() => {
        fetchTickets();
        fetchTicketStats();
    }, [fetchTickets, fetchTicketStats]);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(role === 'admin' ? 'received' : 'sent');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTicket, setNewTicket] = useState({
        subject: '',
        description: '',
        category: 'Technical',
        priority: 'Medium'
    });

    // Detail View State
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    const handleTicketSelect = (ticket) => {
        setSelectedTicket(ticket);
        if (window.innerWidth < 1024) setIsSheetOpen(true);
        setReplyMessage('');
    };

    const handleReply = async () => {
        if (!replyMessage.trim() || !selectedTicket) return;
        setIsSubmittingReply(true);
        // Assuming replyToTicket exists in store and handles API
        const success = await replyToTicket(selectedTicket._id, replyMessage);
        if (success) {
            setReplyMessage('');
        }
        setIsSubmittingReply(false);
    };

    const handleStatusChange = async (value) => {
        if (!selectedTicket) return;
        const success = await updateTicketStatus(selectedTicket._id, value);
        if (success) {
            setSelectedTicket(prev => ({ ...prev, status: value }));
        }
    };

    const renderDetailContent = () => (
        <div className="h-full flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/40 dark:border-slate-800/40 rounded-[2.5rem] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="flex justify-between items-start mb-4">
                    {role?.startsWith('superadmin') ? (
                        <Select value={selectedTicket.status} onValueChange={handleStatusChange}>
                            <SelectTrigger className={cn("h-7 w-auto min-w-[100px] text-[10px] font-black uppercase tracking-widest border-none px-3", getStatusStyle(selectedTicket.status))}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Open">Open</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Resolved">Resolved</SelectItem>
                                <SelectItem value="Closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <Badge className={cn("px-3 py-1 text-[10px] font-black uppercase tracking-widest", getStatusStyle(selectedTicket.status))}>
                            {selectedTicket.status}
                        </Badge>
                    )}
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(selectedTicket.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-snug mb-2">
                    {selectedTicket.subject}
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <User size={12} /> {selectedTicket.creator?.name || 'Unknown User'}
                </div>
            </div>

            {/* Content Scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                        {selectedTicket.description}
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare size={12} /> Discussion
                    </label>
                    <div className="space-y-4">
                        {selectedTicket.responses?.length > 0 ? selectedTicket.responses.map((msg, i) => {
                            const userModel = role?.startsWith('superadmin') ? 'SuperAdmin' :
                                role === 'admin' ? 'Admin' :
                                    role === 'sales' ? 'SalesExecutive' :
                                        role.charAt(0).toUpperCase() + role.slice(1);
                            const isMe = msg.responderModel === userModel;
                            return (
                                <div key={i} className={cn("flex gap-3", isMe ? "flex-row-reverse" : "")}>
                                    <div className={cn("size-8 rounded-full flex items-center justify-center shrink-0", isMe ? "bg-[#4461f2] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500")}>
                                        <User size={14} />
                                    </div>
                                    <div className={cn("flex-1 space-y-1", isMe ? "text-right" : "")}>
                                        <div className={cn("p-3 rounded-2xl text-xs inline-block text-left max-w-[85%]", isMe ? "bg-[#4461f2] text-white rounded-tr-sm" : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-tl-sm")}>
                                            {msg.message}
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-bold">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-10 text-slate-300 dark:text-slate-700">
                                <p className="text-[10px] uppercase tracking-widest font-bold">No messages yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="relative">
                    <Textarea
                        placeholder="Type your reply..."
                        className="min-h-[80px] w-full resize-none pr-12 text-xs bg-slate-50 dark:bg-slate-950 border-none rounded-2xl focus:ring-2 focus:ring-[#4461f2]/20"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                    />
                    <Button
                        size="icon"
                        onClick={handleReply}
                        disabled={isSubmittingReply || !replyMessage.trim()}
                        className="absolute bottom-2 right-2 size-8 bg-[#4461f2] hover:bg-[#3451e2] text-white rounded-xl shadow-lg shadow-[#4461f2]/20"
                    >
                        {isSubmittingReply ? <Loader2 size={14} className="animate-spin" /> : <ArrowUpRight size={16} />}
                    </Button>
                </div>
            </div>
        </div>
    );

    const categories = ['Technical', 'Billing', 'Account', 'Feature Request', 'Other'];
    const priorities = ['Low', 'Medium', 'High', 'Urgent'];

    // Filter Logic
    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.ticketId?.toLowerCase().includes(searchQuery.toLowerCase());

        if (role?.startsWith('superadmin')) {
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
        <div className="min-h-screen w-full bg-white dark:bg-slate-950 relative flex flex-col items-center justify-start font-sans overflow-x-hidden pb-12">
            {/* Enhanced Background Visibility */}
            <div className="absolute inset-0 h-[320px] z-0 overflow-hidden">
                <img
                    src="/WLCOMPAGE .png"
                    alt="Background"
                    className="w-full h-full object-cover object-center opacity-70 dark:opacity-30 translate-y-[-10%]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-white dark:from-slate-950/40 dark:via-slate-950/80 dark:to-slate-950" />
            </div>

            {/* Support Content */}
            <div className="w-full max-w-[1100px] mt-12 px-6 relative z-10 space-y-8">
                {/* Header Row */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            Support <span className="text-[#4461f2]">Center</span>
                        </h1>
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                            <LifeBuoy size={14} className="text-[#4461f2]" />
                            {role?.startsWith('superadmin') ? 'Managing Administrator Escalations' :
                                role === 'admin' ? 'Unified Support Hub & Platform Requests' :
                                    'Raise tickets for technical & account issues'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {!role?.startsWith('superadmin') && (
                            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="h-12 px-6 rounded-2xl bg-[#4461f2] hover:bg-[#3451e2] text-white font-black text-[10px] uppercase tracking-widest gap-3 shadow-lg shadow-[#4461f2]/20 border-none transition-all active:scale-95">
                                        <Plus size={18} /> Raise New Ticket
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border-white/20 dark:border-slate-800/40 rounded-[2.5rem] p-8 shadow-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-black italic tracking-tight uppercase dark:text-white">Raise <span className="text-[#4461f2]">Ticket</span></DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-6 mt-6">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</p>
                                            <Input
                                                placeholder="What is the issue?"
                                                value={newTicket.subject}
                                                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                                className="h-12 border-none bg-slate-50 dark:bg-slate-950 rounded-xl font-bold text-sm px-5"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</p>
                                                <select
                                                    className="w-full h-12 bg-slate-50 dark:bg-slate-950 rounded-xl px-5 text-sm font-bold appearance-none outline-none border-none dark:text-white"
                                                    value={newTicket.category}
                                                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                                                >
                                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</p>
                                                <select
                                                    className="w-full h-12 bg-slate-50 dark:bg-slate-950 rounded-xl px-5 text-sm font-bold appearance-none outline-none border-none dark:text-white"
                                                    value={newTicket.priority}
                                                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                                                >
                                                    {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</p>
                                            <textarea
                                                rows={4}
                                                placeholder="Explain the issue in detail..."
                                                className="w-full p-5 bg-slate-50 dark:bg-slate-950 rounded-xl border-none font-bold text-sm outline-none resize-none dark:text-white"
                                                value={newTicket.description}
                                                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                            />
                                        </div>
                                        <Button
                                            onClick={handleCreateTicket}
                                            disabled={loading}
                                            className="w-full h-12 bg-[#4461f2] hover:bg-[#3451e2] text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-[#4461f2]/20 border-none transition-all"
                                        >
                                            {loading ? 'SENDING...' : `SEND TO ${role === 'admin' ? 'SUPER ADMIN' : 'ADMIN'}`}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </header>

                {/* Role Specific Tabs */}
                {role === 'admin' && (
                    <div className="flex gap-2 p-1.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl w-fit shadow-sm border border-white/20 dark:border-slate-800/40">
                        <button
                            onClick={() => setActiveTab('received')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'received' ? 'bg-[#4461f2] text-white shadow-lg shadow-[#4461f2]/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        >
                            Team Support Requests
                        </button>
                        <button
                            onClick={() => setActiveTab('sent')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'sent' ? 'bg-[#4461f2] text-white shadow-lg shadow-[#4461f2]/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        >
                            My Support Tickets
                        </button>
                    </div>
                )}

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Tickets List */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4461f2] transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search by subject or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-none rounded-[1.5rem] shadow-sm text-sm font-bold focus:ring-4 focus:ring-[#4461f2]/10 transition-all placeholder:text-slate-400 dark:text-white"
                            />
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence mode='popLayout'>
                                {loading && tickets.length === 0 ? (
                                    <div className="flex justify-center items-center py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-[2rem]">
                                        <Loader2 className="animate-spin text-[#4461f2]" size={32} />
                                    </div>
                                ) : filteredTickets.length > 0 ? (
                                    filteredTickets.map((ticket, index) => (
                                        <motion.div
                                            layout
                                            key={ticket._id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => handleTicketSelect(ticket)}
                                            className={cn(
                                                "bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/40 dark:border-slate-800/40 p-5 rounded-[2rem] shadow-[0_15px_35px_-8px_rgba(0,0,0,0.06)] hover:shadow-xl hover:scale-[1.01] transition-all duration-300 group cursor-pointer",
                                                selectedTicket?._id === ticket._id ? "ring-2 ring-[#4461f2] ring-offset-2 dark:ring-offset-slate-950" : ""
                                            )}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                                                <div className="flex items-start gap-5">
                                                    <div className={cn(
                                                        "size-14 rounded-2xl flex flex-col items-center justify-center border-none font-black shadow-inner bg-slate-50 dark:bg-slate-950",
                                                        ticket.status === 'Resolved' ? "text-emerald-500" : "text-[#4461f2]"
                                                    )}>
                                                        <span className="text-[9px] opacity-40 uppercase tracking-tighter">ID</span>
                                                        <span className="text-[13px] tracking-tighter">{ticket.ticketId?.split('-')[1] || ticket._id.slice(-4).toUpperCase()}</span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1.5">
                                                            <Badge className="bg-[#4461f2]/10 text-[#4461f2] hover:bg-[#4461f2]/20 border-none text-[8px] font-black uppercase tracking-wider px-2 py-0.5">
                                                                {ticket.category}
                                                            </Badge>
                                                            <span className={cn(
                                                                "text-[9px] font-black uppercase flex items-center gap-1 tracking-wider",
                                                                getPriorityColor(ticket.priority)
                                                            )}>
                                                                <AlertCircle size={10} /> {ticket.priority}
                                                            </span>
                                                        </div>
                                                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-[#4461f2] transition-colors uppercase tracking-tight text-[15px]">{ticket.subject}</h3>
                                                        <div className="flex items-center gap-5 mt-2">
                                                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                                <User size={12} className="text-[#4461f2]/50" />
                                                                {role === 'admin' && activeTab === 'received' ? ticket.creator?.name : `To: ${ticket.isEscalatedToSuperAdmin ? 'Super Admin' : 'Admin'}`}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                                <Clock size={12} className="text-[#4461f2]/50" />
                                                                {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
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
                                                            className="h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 border-none transition-all active:scale-95"
                                                        >
                                                            Resolve
                                                        </Button>
                                                    )}
                                                    <div className={cn(
                                                        "px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border-none shadow-sm",
                                                        getStatusStyle(ticket.status),
                                                        ticket.status === 'Resolved' ? "bg-emerald-500/10 text-emerald-600" :
                                                            ticket.status === 'Open' ? "bg-blue-500/10 text-blue-600" :
                                                                "bg-amber-500/10 text-amber-600"
                                                    )}>
                                                        {ticket.status}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                                        <MessageSquare size={54} className="mx-auto text-slate-300 dark:text-slate-700 mb-5 opacity-50" />
                                        <h3 className="text-slate-900 dark:text-slate-300 font-bold mb-1">Stay Organized</h3>
                                        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">No support tickets found</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Detail Panel Desktop */}
                    <div className="hidden lg:block lg:col-span-4 h-[calc(100vh-140px)] sticky top-24">
                        <AnimatePresence mode="wait">
                            {selectedTicket ? (
                                <motion.div
                                    key={selectedTicket._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="h-full"
                                >
                                    {renderDetailContent()}
                                </motion.div>
                            ) : (
                                <div className="h-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-8">
                                    <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                        <MessageSquare size={32} className="text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <h3 className="text-slate-900 dark:text-white font-bold uppercase tracking-widest text-xs mb-2">Select a ticket</h3>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">View conversation & details</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-md p-0 border-none bg-transparent lg:hidden">
                    {selectedTicket && (
                        <div className="h-full pt-10">
                            {renderDetailContent()}
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div >
    );
};

export default SupportCenter;
