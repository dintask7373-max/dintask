import React, { useState, useEffect } from 'react';
import {
    LifeBuoy,
    Search,
    Clock,
    AlertTriangle,
    CheckCircle2,
    User,
    MessageSquare,
    ShieldAlert,
    Wrench,
    CreditCard,
    ArrowUpRight,
    Users,
    X,
    Send,
    Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import {
    Sheet,
    SheetContent,
} from '@/shared/components/ui/sheet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';
import useSuperAdminStore from '@/store/superAdminStore';
import { format } from 'date-fns';
import { toast } from 'sonner';

const SuperAdminSupport = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Store fetch
    const { supportTickets, loading, fetchSupportTickets, replyToSupportTicket, updateSupportTicketStatus } = useSuperAdminStore();

    useEffect(() => {
        fetchSupportTickets();
    }, [fetchSupportTickets]);

    const filters = ['All', 'Open', 'Pending', 'Escalated', 'Resolved', 'Closed'];

    const filteredTickets = (supportTickets || []).filter(t => {
        const clientName = t.creator?.name || 'Unknown';
        const issue = t.title || '';
        const ticketId = t.ticketId || t._id;

        const matchesSearch = clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticketId.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = activeFilter === 'All' || t.status === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending':
            case 'Open': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
            case 'Escalated':
            case 'Urgent': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
            case 'Resolved':
            case 'Closed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    const handleTicketSelect = (ticket) => {
        setSelectedTicket(ticket);
        setIsSheetOpen(true);
        // Reset reply
        setReplyMessage('');
    };

    const handleReply = async () => {
        if (!replyMessage.trim() || !selectedTicket) return;
        setIsSubmitting(true);
        const success = await replyToSupportTicket(selectedTicket._id, replyMessage);
        if (success) {
            setReplyMessage('');
            toast.success('Reply sent');
            // If ticket was Open, maybe set to Pending automatically?
            // Optional: updateSupportTicketStatus(selectedTicket._id, 'Pending');

            // Refresh local selected ticket from store
            const updated = useSuperAdminStore.getState().supportTickets.find(t => t._id === selectedTicket._id);
            if (updated) setSelectedTicket(updated);
        }
        setIsSubmitting(false);
    };

    const handleStatusUpdate = async (val) => {
        if (!selectedTicket) return;
        const success = await updateSupportTicketStatus(selectedTicket._id, val);
        if (success) {
            const updated = useSuperAdminStore.getState().supportTickets.find(t => t._id === selectedTicket._id);
            if (updated) setSelectedTicket(updated);
        }
    };

    const TicketDetailContent = ({ ticket, onClose }) => (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 lg:rounded-xl lg:shadow-xl lg:border lg:border-slate-100 lg:dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-950 p-5 text-white relative shrink-0">
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                            {ticket.ticketId || ticket._id.substr(-6)}
                        </span>
                        {onClose && (
                            <Button variant="ghost" size="icon" className="size-6 text-white/40 hover:text-white hover:bg-white/10" onClick={onClose}>
                                <X size={16} />
                            </Button>
                        )}
                    </div>
                    <h2 className="text-lg font-black italic tracking-tighter uppercase leading-tight line-clamp-1">
                        {ticket.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-3">
                        <Select value={ticket.status} onValueChange={handleStatusUpdate}>
                            <SelectTrigger className="h-7 w-auto min-w-[100px] border-white/20 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Open">Open</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Resolved">Resolved</SelectItem>
                                <SelectItem value="Closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Badge variant="outline" className={`h-7 border-white/20 text-white/80 font-black text-[9px] uppercase tracking-widest ${ticket.priority === 'Urgent' ? 'bg-red-500/20 border-red-500/50 text-red-100' : ''}`}>
                            {ticket.priority}
                        </Badge>
                    </div>
                </div>
                <ShieldAlert className="absolute bottom-[-10px] right-[-10px] opacity-10" size={80} />
            </div>

            {/* Conversation Feed */}
            <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50 dark:bg-slate-950/50 space-y-6">

                {/* Original Poster Info */}
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="size-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                        {ticket.creator?.name?.slice(0, 2) || 'CL'}
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{ticket.creator?.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold">{ticket.creator?.companyName}</p>
                    </div>
                    <span className="ml-auto text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase">
                        {format(new Date(ticket.createdAt), 'MMM dd, HH:mm')}
                    </span>
                </div>

                <div className="space-y-4">
                    {/* Initial Issue Message */}
                    <div className="flex gap-3">
                        <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            <User size={14} className="text-slate-500" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Issue Description</span>
                            </div>
                            <div className="p-3 bg-white dark:bg-slate-900 rounded-r-xl rounded-bl-xl border border-slate-100 dark:border-slate-800 shadow-sm text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                                {ticket.description}
                            </div>
                        </div>
                    </div>

                    {/* Responses */}
                    {ticket.responses?.map((msg, i) => {
                        const isMe = msg.responderModel === 'SuperAdmin';
                        return (
                            <div key={i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                                    {isMe ? <ShieldAlert size={14} /> : <User size={14} />}
                                </div>
                                <div className={`flex-1 space-y-1 ${isMe ? 'text-right' : ''}`}>
                                    <div className={`flex items-center gap-2 ${isMe ? 'justify-end' : ''}`}>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isMe ? 'Support Team' : 'Client'}</span>
                                        <span className="text-[9px] font-bold text-slate-300">{msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : ''}</span>
                                    </div>
                                    <div className={`p-3 rounded-xl border shadow-sm text-xs font-medium leading-relaxed inline-block text-left max-w-[85%] ${isMe
                                        ? 'bg-indigo-600 border-indigo-600 text-white rounded-l-xl rounded-br-none'
                                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-r-xl rounded-bl-none'
                                        }`}>
                                        {msg.message}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Reply Box */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <div className="relative">
                    <Textarea
                        placeholder="Type your reply here..."
                        className="min-h-[80px] w-full resize-none pr-12 text-xs font-medium bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                    />
                    <Button
                        size="icon"
                        className="absolute bottom-2 right-2 size-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md"
                        onClick={handleReply}
                        disabled={isSubmitting || !replyMessage.trim()}
                    >
                        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 pb-6 px-4 md:px-6 max-w-7xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
                            <LifeBuoy className="text-white" size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase italic">
                                Client <span className="text-indigo-600">Support</span>
                            </h1>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                                Managing Admin Escalations
                            </p>
                        </div>
                    </div>
                </motion.div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 sm:flex-none">
                        <Input
                            placeholder="SEARCH TICKETS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-full sm:w-64 h-10 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-lg font-bold text-[10px] uppercase tracking-widest focus:ring-indigo-500"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
                {/* Tickets List */}
                <div className="lg:col-span-2 xl:col-span-3 space-y-4">
                    {/* Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                        {filters.map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === filter
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-indigo-500" size={32} />
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-10 text-center">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No tickets found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredTickets.map((ticket, i) => (
                                <motion.div
                                    key={ticket._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Card
                                        className={`border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all cursor-pointer overflow-hidden rounded-xl group ${selectedTicket?._id === ticket._id ? 'ring-2 ring-indigo-500 bg-indigo-50/5' : 'bg-white dark:bg-slate-900'
                                            }`}
                                        onClick={() => handleTicketSelect(ticket)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex gap-4">
                                                <div className={`size-12 rounded-lg ${getStatusStyle(ticket.status)} border flex flex-col items-center justify-center shrink-0`}>
                                                    <span className="text-[8px] font-black mb-0.5 opacity-60 uppercase">ID</span>
                                                    <span className="text-[10px] font-black">{ticket.ticketId?.split('-')[1] || ticket._id.substr(-6)}</span>
                                                </div>

                                                <div className="flex-1 space-y-1 overflow-hidden">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded-sm">{ticket.type || 'General'}</span>
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden sm:flex items-center gap-1">
                                                                <Clock size={10} /> {format(new Date(ticket.createdAt), 'MMM dd')}
                                                            </span>
                                                        </div>
                                                        <Badge className={`${getStatusStyle(ticket.status)} border-none text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5`}>
                                                            {ticket.status}
                                                        </Badge>
                                                    </div>

                                                    <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate">
                                                        {ticket.title}
                                                    </h3>

                                                    <div className="flex items-center gap-3 text-[10px] font-bold">
                                                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                                            <User size={12} className="text-indigo-500" />
                                                            <span className="font-black uppercase tracking-tighter whitespace-nowrap truncate max-w-[120px]">{ticket.creator?.name || 'Unknown'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-slate-400">
                                                            <Users size={12} />
                                                            <span className="font-bold uppercase tracking-tighter whitespace-nowrap truncate max-w-[100px]">{ticket.companyId?.companyName || 'Unknown Company'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Panel: Detail View (Desktop) */}
                <div className="hidden lg:block lg:col-span-1 h-[calc(100vh-140px)] sticky top-24">
                    <AnimatePresence mode="wait">
                        {selectedTicket ? (
                            <motion.div
                                key={selectedTicket._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="h-full"
                            >
                                <TicketDetailContent
                                    ticket={selectedTicket}
                                    onClose={() => setSelectedTicket(null)}
                                />
                            </motion.div>
                        ) : (
                            <div className="h-full rounded-xl border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center p-6 text-slate-300">
                                <MessageSquare size={32} className="mb-4 opacity-50" />
                                <h3 className="text-xs font-black uppercase tracking-widest">Select a ticket to view conversation</h3>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Mobile/Tablet Detail Overlay */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="p-0 border-none w-full sm:max-w-md bg-transparent">
                    <AnimatePresence>
                        {selectedTicket && (
                            <div className="h-full pt-10 sm:pt-0">
                                <TicketDetailContent
                                    ticket={selectedTicket}
                                    onClose={() => setIsSheetOpen(false)}
                                />
                            </div>
                        )}
                    </AnimatePresence>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default SuperAdminSupport;
