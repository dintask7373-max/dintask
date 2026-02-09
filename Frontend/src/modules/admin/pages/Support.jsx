import React, { useState, useEffect } from 'react';
import {
    LifeBuoy,
    Search,
    Filter,
    MoreHorizontal,
    ChevronRight,
    Clock,
    AlertCircle,
    CheckCircle2,
    User,
    MessageSquare,
    AlertTriangle,
    ShieldAlert,
    Wrench,
    CreditCard,
    Plus,
    Loader2,
    Send,
    User,
    X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';
import useTicketStore from '@/store/ticketStore'; // Import Store

const SupportManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [activeTab, setActiveTab] = useState('team'); // 'team' or 'my'
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Store Data
    const { tickets, loading, fetchTickets, addTicket, fetchTicketStats, stats } = useTicketStore();

    // Form State
    const [formData, setFormData] = useState({
        subject: '',
        category: 'General',
        priority: 'Medium',
        description: ''
    });

    // Reply State
    const [replyMessage, setReplyMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { replyToTicket, escalateTicket } = useTicketStore();

    const handleReply = async () => {
        if (!replyMessage.trim() || !selectedTicket) return;
        setIsSubmitting(true);
        const success = await replyToTicket(selectedTicket._id, replyMessage);
        if (success) {
            setReplyMessage('');
            // Store updates selectedTicket automatically via fetch or we update local selectedTicket? 
            // useTicketStore updates the list. We need to update selectedTicket ref.
            // Let's find it from store
            const updated = useTicketStore.getState().tickets.find(t => t._id === selectedTicket._id);
            if (updated) setSelectedTicket(updated);
        }
        setIsSubmitting(false);
    };

    const handleEscalate = async () => {
        if (!selectedTicket) return;
        const success = await escalateTicket(selectedTicket._id);
        if (success) {
            const updated = useTicketStore.getState().tickets.find(t => t._id === selectedTicket._id);
            if (updated) setSelectedTicket(updated);
        }
    };

    // Fetch on Mount & Tab Change
    useEffect(() => {
        fetchTickets(activeTab === 'my' ? 'my' : 'all');
        fetchTicketStats();
    }, [activeTab, fetchTickets, fetchTicketStats]);

    const handleCreateTicket = async () => {
        const success = await addTicket(formData);
        if (success) {
            setIsCreateOpen(false);
            setFormData({ subject: '', category: 'General', priority: 'Medium', description: '' });
            // If we are on "my" tab, it will auto-update. If on "team", we might want to switch or just notify.
            if (activeTab === 'team') setActiveTab('my');
        }
    };

    const filters = ['All', 'Open', 'Pending', 'Escalated', 'Resolved'];

    const filteredTickets = tickets.filter(t => {
        // Backend 'title' vs UI 'issue', Backend 'creator.name' vs UI 'client'
        const clientName = t.creator?.name || 'Unknown';
        const issue = t.title || '';
        const ticketId = t.ticketId || t._id;

        const matchesSearch = clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticketId.toString().toLowerCase().includes(searchQuery.toLowerCase());

        // Simple status filter logic
        const matchesFilter = activeFilter === 'All' || t.status === activeFilter;

        return matchesSearch && matchesFilter;
    });

    const getStatusStyle = (status) => {
        // Normalize status
        const s = status?.toLowerCase();
        if (s === 'open' || s === 'pending') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
        if (s === 'escalated' || s === 'urgent') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
        if (s === 'resolved' || s === 'closed') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Technical': return <Wrench size={14} className="text-blue-500" />;
            case 'Subscription': return <CreditCard size={14} className="text-purple-500" />;
            case 'General': return <MessageSquare size={14} className="text-slate-500" />;
            default: return <LifeBuoy size={14} className="text-primary-500" />;
        }
    };

    // Calculate Stats from Real Data
    const totalTickets = tickets.length;
    const pendingCount = tickets.filter(t => t.status === 'Open' || t.status === 'Pending').length;
    const escalatedCount = tickets.filter(t => t.isEscalatedToSuperAdmin).length;
    const resolvedCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;


    return (
        <div className="space-y-8 pb-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary-600 rounded-xl shadow-lg shadow-primary-500/20">
                            <LifeBuoy className="text-white" size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">
                            Support <span className="text-primary-600">&</span> Management
                        </h1>
                    </div>

                    {/* Tabs for Ticket Scope */}
                    <div className="flex items-center gap-2 mt-4">
                        <button
                            onClick={() => setActiveTab('team')}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'team' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            Team Support Requests
                        </button>
                        <button
                            onClick={() => setActiveTab('my')}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'my' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            My Support Tickets
                        </button>
                    </div>

                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                >
                    <div className="relative group overflow-hidden rounded-xl">
                        <div className="absolute inset-0 bg-primary-600/5 group-hover:bg-primary-600/10 transition-colors" />
                        <Input
                            placeholder="Search tickets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-72 h-12 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm focus:ring-primary-500 font-bold text-xs uppercase tracking-widest"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 bg-primary-600 hover:bg-primary-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-primary-500/20 active:scale-95 transition-all">
                                <Plus className="mr-2 h-4 w-4" /> Raise New Ticket
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">New Support Ticket</DialogTitle>
                                <DialogDescription className="font-medium text-slate-500">
                                    Describe the issue you are facing. We will get back to you shortly.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="subject" className="text-xs font-black uppercase tracking-widest">Subject</Label>
                                    <Input
                                        id="subject"
                                        placeholder="Brief summary of the issue"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-black uppercase tracking-widest">Category</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(val) => setFormData({ ...formData, category: val })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Technical">Technical</SelectItem>
                                                <SelectItem value="Subscription">Billing/Subscription</SelectItem>
                                                <SelectItem value="General">General Inquiry</SelectItem>
                                                <SelectItem value="Feature Request">Feature Request</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-black uppercase tracking-widest">Priority</Label>
                                        <Select
                                            value={formData.priority}
                                            onValueChange={(val) => setFormData({ ...formData, priority: val })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Low">Low</SelectItem>
                                                <SelectItem value="Medium">Medium</SelectItem>
                                                <SelectItem value="High">High</SelectItem>
                                                <SelectItem value="Urgent">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="desc" className="text-xs font-black uppercase tracking-widest">Description</Label>
                                    <Textarea
                                        id="desc"
                                        placeholder="Detailed explanation..."
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateTicket} disabled={loading} className="w-full bg-primary-600 font-black uppercase tracking-widest">
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                    Submit Ticket
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </motion.div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Tickets', val: totalTickets, icon: LifeBuoy, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/10' },
                    { label: 'Pending / Open', val: pendingCount, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
                    { label: 'Escalated', val: escalatedCount, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10' },
                    { label: 'Resolved (All Time)', val: resolvedCount, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="border-none shadow-sm dark:bg-slate-900 overflow-hidden group">
                            <CardContent className="p-6 relative">
                                <div className="flex items-center justify-between relative z-10">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.val}</h3>
                                    </div>
                                    <div className={`size-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                                        <stat.icon size={24} />
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 -right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <stat.icon size={80} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Tickets List */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Ticket List Header/Filters */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black italic uppercase tracking-tight">
                            {activeTab === 'my' ? 'My Tickets' : 'Team Tickets'}
                        </h3>
                        {/* Optional Status Filters could go here */}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-primary-500" size={40} />
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <Card className="border-2 border-dashed border-slate-200 dark:border-slate-800 bg-transparent py-10 text-center">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No tickets found</p>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredTickets.map((ticket, i) => (
                                <motion.div
                                    key={ticket._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Card
                                        className={`border border-slate-100 dark:border-slate-900 hover:border-primary-200 dark:hover:border-primary-900/50 transition-all cursor-pointer overflow-hidden group ${selectedTicket?._id === ticket._id ? 'ring-2 ring-primary-500 bg-primary-50/10 dark:bg-primary-900/5' : 'bg-white dark:bg-slate-900'
                                            }`}
                                        onClick={() => setSelectedTicket(ticket)}
                                    >
                                        <CardContent className="p-0">
                                            <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex gap-4 items-start">
                                                    <div className={`p-3 rounded-xl ${getStatusStyle(ticket.status || 'Open')} border shrink-0`}>
                                                        {ticket.isEscalatedToSuperAdmin ? <AlertTriangle size={20} /> : <MessageSquare size={20} />}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{ticket.ticketId || ticket._id.substr(-6)}</span>
                                                            <Badge variant="outline" className={`text-[9px] font-black h-5 uppercase tracking-tighter ${ticket.priority === 'Urgent' ? 'text-red-500 border-red-200' : 'text-slate-400'
                                                                }`}>
                                                                {ticket.priority || 'Normal'}
                                                            </Badge>
                                                        </div>
                                                        <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors uppercase tracking-tight italic">
                                                            {ticket.title}
                                                        </h3>
                                                        <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                                                <User size={12} className="text-primary-500" /> {ticket.creator?.name || 'Me'}
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <Clock size={12} /> {new Date(ticket.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50 dark:border-slate-800">
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                                        <Badge className={`${getStatusStyle(ticket.status || 'Open')} border-none text-[9px] font-black uppercase tracking-[0.15em] px-3`}>
                                                            {ticket.status || 'Open'}
                                                        </Badge>
                                                    </div>
                                                    <ChevronRight className={`text-slate-300 group-hover:text-primary-500 transition-all ${selectedTicket?._id === ticket._id ? 'translate-x-1' : ''}`} size={20} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Panel: Detail or Actions */}
                <div className="space-y-6">
                    {/* Resolution Stats - Always Visible */}
                    <Card className="border-none shadow-sm dark:bg-slate-900 bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <CheckCircle2 className="text-green-600 dark:text-green-400" size={20} />
                                </div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                    Resolution Stats
                                </h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                        <span className="text-slate-500">Avg Feedback</span>
                                        <span className="text-slate-900 dark:text-white">{stats?.avgFeedback || 0}/5</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((stats?.avgFeedback || 0) / 5) * 100}%` }}
                                            className="h-full bg-emerald-500 rounded-full"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                        <span className="text-slate-500">Resolved</span>
                                        <span className="text-slate-900 dark:text-white">{stats?.resolvedRate || 0}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${stats?.resolvedRate || 0}%` }}
                                            className="h-full bg-blue-500 rounded-full"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                        <span className="text-slate-500">In Time</span>
                                        <span className="text-slate-900 dark:text-white">{stats?.inTimeResolution || 0}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${stats?.inTimeResolution || 0}%` }}
                                            className="h-full bg-amber-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <AnimatePresence mode="wait">
                        {selectedTicket ? (
                            <motion.div
                                key={selectedTicket._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden rounded-2xl relative sticky top-6 flex flex-col h-[calc(100vh-140px)]">
                                    {/* Header */}
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-between items-center shrink-0">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">
                                                    {selectedTicket.ticketId || selectedTicket._id.substr(-6)}
                                                </span>
                                                <Badge className={`${getStatusStyle(selectedTicket.status)} border-none text-[8px] font-black uppercase px-1.5 h-4`}>
                                                    {selectedTicket.status}
                                                </Badge>
                                            </div>
                                            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1">
                                                {selectedTicket.title}
                                            </h2>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {!selectedTicket.isEscalatedToSuperAdmin && !['Resolved', 'Closed'].includes(selectedTicket.status) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleEscalate}
                                                    className="h-7 text-[9px] font-black uppercase text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10"
                                                >
                                                    Escalate
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-slate-400 hover:text-slate-600"
                                                onClick={() => setSelectedTicket(null)}
                                            >
                                                <X size={16} /> {/* Wait, X is not imported? I need to import X if not present. X is likely not imported based on previous check. I'll use simple text or ensure import */}
                                                {/* X was not in imports list. I'll stick to text 'Close' or use ChevronRight. Text 'Close' used previously. */}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Conversation Body */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-black/20">
                                        {/* Original Post */}
                                        <div className="flex gap-3">
                                            <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                <User size={14} className="text-slate-500" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{selectedTicket.creator?.name || 'Reporter'}</span>
                                                    <span className="text-[9px] text-slate-400">{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="p-3 bg-white dark:bg-slate-800 rounded-r-xl rounded-bl-xl border border-slate-100 dark:border-slate-700 shadow-sm text-xs text-slate-600 dark:text-slate-300">
                                                    {selectedTicket.description}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Responses */}
                                        {selectedTicket.responses?.map((msg, i) => {
                                            const isMe = msg.responderModel === 'Admin'; // Assuming logged in user is Admin
                                            return (
                                                <div key={i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                    <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-primary-100 text-primary-600' : 'bg-slate-200 text-slate-500'}`}>
                                                        {isMe ? <User size={14} /> : (msg.responderModel === 'SuperAdmin' ? <ShieldAlert size={14} /> : <User size={14} />)}
                                                    </div>
                                                    <div className={`flex-1 space-y-1 ${isMe ? 'text-right' : ''}`}>
                                                        <div className={`flex items-center gap-2 ${isMe ? 'justify-end' : ''}`}>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isMe ? 'You' : msg.responderModel}</span>
                                                            <span className="text-[9px] text-slate-400">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <div className={`p-3 rounded-xl border shadow-sm text-xs inline-block text-left max-w-[85%] ${isMe
                                                            ? 'bg-primary-600 border-primary-600 text-white rounded-l-xl rounded-br-none'
                                                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-r-xl rounded-bl-none'
                                                            }`}>
                                                            {msg.message}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Footer / Reply */}
                                    <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                                        <div className="relative">
                                            <Textarea
                                                placeholder="Type your reply..."
                                                className="min-h-[60px] w-full resize-none pr-10 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-primary-500"
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                            />
                                            <Button
                                                size="icon"
                                                className="absolute bottom-2 right-2 size-7 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm"
                                                onClick={handleReply}
                                                disabled={isSubmitting || !replyMessage.trim()}
                                            >
                                                {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <Card className="border-2 border-dashed border-slate-200 dark:border-slate-800 bg-transparent text-center py-20 px-10">
                                    <div className="size-20 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto mb-6">
                                        <MessageSquare size={32} className="text-slate-300" />
                                    </div>
                                    <h3 className="text-base font-black text-slate-400 uppercase tracking-widest italic">
                                        Select a ticket to <br /> view tactical details
                                    </h3>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SupportManagement;
