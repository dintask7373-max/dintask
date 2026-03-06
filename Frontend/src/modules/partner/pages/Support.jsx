import React, { useState, useEffect } from 'react';
import {
    LifeBuoy,
    Search,
    ChevronRight,
    Clock,
    AlertCircle,
    CheckCircle2,
    User,
    MessageSquare,
    AlertTriangle,
    ShieldAlert,
    Loader2,
    Send,
    X,
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Sheet, SheetContent } from '@/shared/components/ui/sheet';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import useTicketStore from '@/store/ticketStore';
import socketService from '@/services/socket';
import useAuthStore from '@/store/authStore';

const PartnerSupport = () => {
    const { user: currentUser } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Store Data
    const { tickets, loading, fetchTickets, fetchTicketStats, stats, initializeSocket, replyToTicket, escalateTicket } = useTicketStore();

    // Sync selectedTicket with store data
    useEffect(() => {
        if (selectedTicket) {
            const updated = tickets.find(t => t._id === selectedTicket._id);
            if (updated) {
                if (updated.responses?.length !== selectedTicket.responses?.length || updated.status !== selectedTicket.status || updated.isEscalatedToSuperAdmin !== selectedTicket.isEscalatedToSuperAdmin) {
                    setSelectedTicket(updated);
                    // If it was just escalated, we might want to close the view since partners can't see escalated tickets
                    if (updated.isEscalatedToSuperAdmin) {
                        setSelectedTicket(null);
                        setIsSheetOpen(false);
                    }
                }
            }
        }
    }, [tickets, selectedTicket]);

    // Initialize
    useEffect(() => {
        initializeSocket(currentUser?._id);
        fetchTickets({ scope: 'all' });
        fetchTicketStats();
    }, [initializeSocket, currentUser, fetchTickets, fetchTicketStats]);

    // Room Management
    useEffect(() => {
        if (selectedTicket) {
            socketService.joinTicket(selectedTicket._id);
            return () => socketService.leaveTicket(selectedTicket._id);
        }
    }, [selectedTicket]);

    const [replyMessage, setReplyMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReply = async () => {
        if (!replyMessage.trim() || !selectedTicket) return;
        setIsSubmitting(true);
        const success = await replyToTicket(selectedTicket._id, replyMessage);
        if (success) setReplyMessage('');
        setIsSubmitting(false);
    };

    const handleEscalate = async () => {
        if (!selectedTicket || !window.confirm('Are you sure you want to escalate this to Super Admin? You will no longer be able to manage this ticket.')) return;
        const success = await escalateTicket(selectedTicket._id);
        if (success) {
            setSelectedTicket(null);
            setIsSheetOpen(false);
        }
    };

    const filteredTickets = tickets.filter(t => {
        const clientName = t.creator?.name || 'Unknown Client';
        const title = t.title || '';
        const ticketId = t.ticketId || t._id;

        const matchesSearch = clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticketId.toString().toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = activeFilter === 'All' || t.status === activeFilter;

        return matchesSearch && matchesFilter;
    });

    const getStatusStyle = (status) => {
        const s = status?.toLowerCase();
        if (s === 'open' || s === 'pending') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
        if (s === 'resolved' || s === 'closed') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                            <LifeBuoy className="text-white" size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">
                            Client <span className="text-indigo-600">Support</span>
                        </h1>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manage inquiries from your referred clients</p>
                </motion.div>

                <div className="relative group overflow-hidden rounded-xl">
                    <div className="absolute inset-0 bg-indigo-600/5 group-hover:bg-indigo-600/10 transition-colors" />
                    <Input
                        placeholder="Search client tickets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-72 h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm focus:ring-indigo-500 font-bold text-xs uppercase tracking-widest"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 text-left">
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-indigo-500" size={40} />
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <Card className="border-2 border-dashed border-slate-200 dark:border-slate-800 bg-transparent py-20 text-center">
                            <div className="size-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="text-slate-300" size={32} />
                            </div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active client tickets</p>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {filteredTickets.map((ticket, i) => (
                                <motion.div key={ticket._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                    <Card
                                        className={`border border-slate-100 dark:border-slate-900 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all cursor-pointer overflow-hidden group ${selectedTicket?._id === ticket._id ? 'ring-2 ring-indigo-500 bg-indigo-50/10 dark:bg-indigo-900/5' : 'bg-white dark:bg-slate-900'}`}
                                        onClick={() => {
                                            setSelectedTicket(ticket);
                                            if (window.innerWidth < 1024) setIsSheetOpen(true);
                                        }}
                                    >
                                        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex gap-4 items-start">
                                                <div className={`p-3 rounded-xl ${getStatusStyle(ticket.status)} border shrink-0`}>
                                                    <MessageSquare size={20} />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{ticket.ticketId || ticket._id.substr(-6)}</span>
                                                        <Badge variant="outline" className="text-[9px] font-black h-5 uppercase tracking-tighter text-slate-400">
                                                            {ticket.priority || 'Normal'}
                                                        </Badge>
                                                    </div>
                                                    <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight italic">
                                                        {ticket.title}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                                            <User size={12} className="text-indigo-500" /> {ticket.creator?.name || 'Client'}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-slate-400">
                                                            <Clock size={12} /> {new Date(ticket.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between md:justify-end gap-6">
                                                <div className="text-right">
                                                    <Badge className={`${getStatusStyle(ticket.status)} border-none text-[9px] font-black uppercase tracking-widest px-3`}>
                                                        {ticket.status || 'Open'}
                                                    </Badge>
                                                </div>
                                                <ChevronRight className={`text-slate-300 group-hover:text-indigo-500 transition-all ${selectedTicket?._id === ticket._id ? 'translate-x-1' : ''}`} size={20} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedTicket ? (
                            <motion.div key={selectedTicket._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden rounded-2xl relative sticky top-6 flex flex-col h-[600px]">
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-between items-center shrink-0">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{selectedTicket.ticketId}</span>
                                                <Badge className={`${getStatusStyle(selectedTicket.status)} border-none text-[8px] font-black uppercase px-2 h-4`}>{selectedTicket.status}</Badge>
                                            </div>
                                            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1">{selectedTicket.title}</h2>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!['Resolved', 'Closed'].includes(selectedTicket.status) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleEscalate}
                                                    className="h-8 text-[9px] font-black uppercase text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                >
                                                    Escalate
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedTicket(null)}>
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-black/10">
                                        {/* Original Message */}
                                        <div className="flex gap-3">
                                            <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                                <User size={14} className="text-slate-500" />
                                            </div>
                                            <div className="flex-1 space-y-1 text-left">
                                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{selectedTicket.creator?.name || 'Client'}</p>
                                                <div className="p-3 bg-white dark:bg-slate-800 rounded-r-2xl rounded-bl-2xl border border-slate-100 dark:border-slate-700 shadow-sm text-xs text-slate-600 dark:text-slate-300">
                                                    {selectedTicket.description}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Thread */}
                                        {selectedTicket.responses?.map((msg, i) => {
                                            const isMe = msg.responderModel === 'Partner';
                                            return (
                                                <div key={i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                    <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                                                        {isMe ? <User size={14} /> : (msg.responderModel === 'SuperAdmin' ? <ShieldAlert size={14} /> : <User size={14} />)}
                                                    </div>
                                                    <div className={`flex-1 space-y-1 ${isMe ? 'text-right' : 'text-left'}`}>
                                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{isMe ? 'Your Response' : msg.responderModel}</p>
                                                        <div className={`p-3 rounded-2xl border shadow-sm text-xs inline-block max-w-[90%] ${isMe ? 'bg-indigo-600 border-indigo-600 text-white rounded-l-2xl rounded-br-none' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-r-2xl rounded-bl-none'}`}>
                                                            {msg.message}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                                        <div className="relative">
                                            <Textarea
                                                placeholder="Write a reply..."
                                                className="min-h-[80px] w-full resize-none pr-12 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                            />
                                            <Button size="icon" className="absolute bottom-3 right-3 size-8 bg-indigo-600" onClick={handleReply} disabled={isSubmitting || !replyMessage.trim()}>
                                                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ) : (
                            <div className="h-[600px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-10 text-center">
                                <div className="size-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
                                    <MessageSquare size={32} className="text-slate-200" />
                                </div>
                                <h3 className="text-sm font-black text-slate-300 uppercase tracking-[0.2em] italic">Select a ticket to <br />start a conversation</h3>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="p-0 border-none w-full sm:max-w-md bg-white dark:bg-slate-900 lg:hidden">
                    {selectedTicket && (
                        <div className="flex flex-col h-full">
                            <div className="p-4 border-b flex items-center justify-between">
                                <h3 className="font-black uppercase italic">Ticket Details</h3>
                                <Button variant="ghost" size="icon" onClick={() => setIsSheetOpen(false)}><X size={18} /></Button>
                            </div>
                            {/* Same content as Desktop right panel could be reused here or simplified */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border">
                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Issue</p>
                                    <p className="text-xs font-bold">{selectedTicket.title}</p>
                                    <p className="text-xs text-slate-500 mt-2">{selectedTicket.description}</p>
                                </div>
                                {/* Responses list... */}
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default PartnerSupport;
