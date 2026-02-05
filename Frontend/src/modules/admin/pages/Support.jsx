import React, { useState } from 'react';
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
    CreditCard
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

const SupportManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedTicket, setSelectedTicket] = useState(null);

    const [tickets] = useState([
        {
            id: 'TKT-1024',
            client: 'ABC Pvt Ltd',
            issue: 'Login error on employee mobile app',
            category: 'Technical',
            priority: 'High',
            status: 'Pending',
            createdAt: '2024-02-05 10:30 AM',
            assignedTo: 'Support Team A',
            description: 'Employees are receiving a 500 internal server error when trying to authenticate via the mobile application.',
        },
        {
            id: 'TKT-1025',
            client: 'Global Tech Solutions',
            issue: 'Payment failed for Pro subscription renewal',
            category: 'Subscription',
            priority: 'Urgent',
            status: 'Escalated',
            createdAt: '2024-02-05 11:15 AM',
            assignedTo: 'Finance Team',
            description: 'The admin is trying to renew the subscription but the transaction is being declined by the gateway.',
        },
        {
            id: 'TKT-1026',
            client: 'Vertex Enterprises',
            issue: 'Feature request: Bulk task export',
            category: 'General',
            priority: 'Low',
            status: 'Resolved',
            createdAt: '2024-02-04 03:45 PM',
            assignedTo: 'Product Team',
            description: 'The client wants an option to export all tasks across all projects into a single CSV/Excel file.',
        }
    ]);

    const filters = ['All', 'Pending', 'Escalated', 'Resolved'];

    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'All' || t.status === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
            case 'Escalated': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
            case 'Resolved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Technical': return <Wrench size={14} className="text-blue-500" />;
            case 'Subscription': return <CreditCard size={14} className="text-purple-500" />;
            case 'General': return <MessageSquare size={14} className="text-slate-500" />;
            default: return <LifeBuoy size={14} className="text-primary-500" />;
        }
    };

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
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] ml-11">
                        Monitor tickets, escalations & technical issues
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                >
                    <div className="relative group overflow-hidden rounded-xl">
                        <div className="absolute inset-0 bg-primary-600/5 group-hover:bg-primary-600/10 transition-colors" />
                        <Input
                            placeholder="Search tickets, clients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-72 h-12 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm focus:ring-primary-500 font-bold text-xs uppercase tracking-widest"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                    <Button className="h-12 px-6 bg-primary-600 hover:bg-primary-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-primary-500/20 active:scale-95 transition-all">
                        Create Ticket
                    </Button>
                </motion.div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Tickets', val: '24', icon: LifeBuoy, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/10' },
                    { label: 'Pending', val: '08', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
                    { label: 'Escalated', val: '03', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10' },
                    { label: 'Resolved Today', val: '12', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
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
                    {/* Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {filters.map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${activeFilter === filter
                                        ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20'
                                        : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    {/* Table View */}
                    <div className="space-y-4">
                        {filteredTickets.map((ticket, i) => (
                            <motion.div
                                key={ticket.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card
                                    className={`border border-slate-100 dark:border-slate-900 hover:border-primary-200 dark:hover:border-primary-900/50 transition-all cursor-pointer overflow-hidden group ${selectedTicket?.id === ticket.id ? 'ring-2 ring-primary-500 bg-primary-50/10 dark:bg-primary-900/5' : 'bg-white dark:bg-slate-900'
                                        }`}
                                    onClick={() => setSelectedTicket(ticket)}
                                >
                                    <CardContent className="p-0">
                                        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex gap-4 items-start">
                                                <div className={`p-3 rounded-xl ${getStatusStyle(ticket.status)} border shrink-0`}>
                                                    {ticket.status === 'Escalated' ? <AlertTriangle size={20} /> : <MessageSquare size={20} />}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{ticket.id}</span>
                                                        <Badge variant="outline" className={`text-[9px] font-black h-5 uppercase tracking-tighter ${ticket.priority === 'Urgent' ? 'text-red-500 border-red-200' : 'text-slate-400'
                                                            }`}>
                                                            {ticket.priority}
                                                        </Badge>
                                                    </div>
                                                    <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors uppercase tracking-tight italic">
                                                        {ticket.issue}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                                            <User size={12} className="text-primary-500" /> {ticket.client}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock size={12} /> {ticket.createdAt}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50 dark:border-slate-800">
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                                    <Badge className={`${getStatusStyle(ticket.status)} border-none text-[9px] font-black uppercase tracking-[0.15em] px-3`}>
                                                        {ticket.status}
                                                    </Badge>
                                                </div>
                                                <ChevronRight className={`text-slate-300 group-hover:text-primary-500 transition-all ${selectedTicket?.id === ticket.id ? 'translate-x-1' : ''}`} size={20} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Detail or Actions */}
                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedTicket ? (
                            <motion.div
                                key={selectedTicket.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden rounded-2xl relative">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <ShieldAlert size={120} />
                                    </div>
                                    <CardContent className="p-8 space-y-8 relative z-10">
                                        <div className="pb-6 border-b border-white/10 flex justify-between items-start">
                                            <div>
                                                <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-2 block">{selectedTicket.id}</span>
                                                <h2 className="text-2xl font-black italic tracking-tighter leading-tight uppercase">Ticket Detail</h2>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-white hover:bg-white/10"
                                                onClick={() => setSelectedTicket(null)}
                                            >
                                                Close
                                            </Button>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                                                <div className="size-12 rounded-full overflow-hidden bg-primary-600 flex items-center justify-center shrink-0 border-2 border-white/20">
                                                    <User size={24} className="text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black uppercase tracking-widest text-primary-400">Client Account</h4>
                                                    <p className="text-lg font-black italic">{selectedTicket.client}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Subject</h4>
                                                <p className="text-sm font-bold text-white/90 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
                                                    {selectedTicket.issue}
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Description</h4>
                                                <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic">
                                                    "{selectedTicket.description}"
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Category</p>
                                                    <div className="flex items-center justify-center gap-2 text-xs font-black italic text-primary-400">
                                                        {getCategoryIcon(selectedTicket.category)}
                                                        {selectedTicket.category}
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Assigned To</p>
                                                    <p className="text-xs font-black italic whitespace-nowrap">{selectedTicket.assignedTo}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-3">
                                            <Button className="bg-primary-600 hover:bg-primary-700 text-white font-black text-[10px] uppercase tracking-widest h-12 rounded-xl border-none">
                                                Escalate
                                            </Button>
                                            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-black text-[10px] uppercase tracking-widest h-12 rounded-xl">
                                                Resolve
                                            </Button>
                                        </div>
                                    </CardContent>
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

                    {/* Quick Management Actions */}
                    <Card className="border-none shadow-sm dark:bg-slate-900 bg-white">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-4">
                                Quick Management
                            </h3>
                            <div className="space-y-2">
                                <Button variant="ghost" className="w-full justify-between h-12 hover:bg-slate-50 dark:hover:bg-slate-800 group px-4">
                                    <span className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 group-hover:text-primary-600 transition-colors">
                                        <AlertCircle size={14} /> Escalation Protocols
                                    </span>
                                    <ChevronRight size={14} className="text-slate-300" />
                                </Button>
                                <Button variant="ghost" className="w-full justify-between h-12 hover:bg-slate-50 dark:hover:bg-slate-800 group px-4">
                                    <span className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 group-hover:text-primary-600 transition-colors">
                                        <ShieldAlert size={14} /> Team Assignments
                                    </span>
                                    <ChevronRight size={14} className="text-slate-300" />
                                </Button>
                                <Button variant="ghost" className="w-full justify-between h-12 hover:bg-slate-50 dark:hover:bg-slate-800 group px-4">
                                    <span className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 group-hover:text-primary-600 transition-colors">
                                        <Badge variant="outline" className="text-[8px] h-4">PDF</Badge> Support Guide v3.0
                                    </span>
                                    <ChevronRight size={14} className="text-slate-300" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SupportManagement;
