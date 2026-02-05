import React, { useState } from 'react';
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
    ChevronRight,
    Filter,
    ArrowUpRight,
    Users,
    X
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle
} from '@/shared/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';

const SuperAdminSupport = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Mock tickets for Admin Support (Issues faced by Admins during subscription/use)
    const [tickets] = useState([
        {
            id: 'SUP-7721',
            client: 'ABC Pvt Ltd (Admin)',
            issue: 'Subscription Payment Loop Error',
            category: 'Subscription',
            priority: 'Urgent',
            status: 'Pending',
            createdAt: '2024-02-05 09:45 AM',
            assignedTo: 'Finance Ops',
            description: 'The admin reported that after completing the payment via UPI, they are being redirected back to the pricing page instead of the dashboard.',
        },
        {
            id: 'SUP-7722',
            client: 'Zenith Logistics (Admin)',
            issue: 'Cannot add more than 50 employees',
            category: 'Technical',
            priority: 'High',
            status: 'Escalated',
            createdAt: '2024-02-05 11:20 AM',
            assignedTo: 'System Architect',
            description: 'Client is on the Pro Plus plan which should allow 100 employees, but the system is throwing a quota limit error at 50.',
        },
        {
            id: 'SUP-7723',
            client: 'Crystal Clear Co (Admin)',
            issue: 'Login error on Admin Console',
            category: 'Technical',
            priority: 'High',
            status: 'Pending',
            createdAt: '2024-02-05 12:15 PM',
            assignedTo: 'Dev Support',
            description: 'Admin is unable to login after the latest system update. Error: 401 Unauthorized even with correct credentials.',
        },
        {
            id: 'SUP-7724',
            client: 'Global Tech (Admin)',
            issue: 'Invoice not generated for Jan 2024',
            category: 'Subscription',
            priority: 'Low',
            status: 'Resolved',
            createdAt: '2024-02-04 04:30 PM',
            assignedTo: 'Accounts',
            description: 'Client successfully paid but the PDF invoice was not generated in the billing section.',
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

    const handleTicketSelect = (ticket) => {
        setSelectedTicket(ticket);
        setIsSheetOpen(true);
    };

    const TicketDetailContent = ({ ticket, onClose }) => (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 lg:rounded-xl lg:shadow-xl lg:border lg:border-slate-100 lg:dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-950 p-5 text-white relative">
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em]">{ticket.id}</span>
                        {onClose && (
                            <Button variant="ghost" size="icon" className="size-6 text-white/40 hover:text-white hover:bg-white/10" onClick={onClose}>
                                <X size={16} />
                            </Button>
                        )}
                    </div>
                    <h2 className="text-lg font-black italic tracking-tighter uppercase leading-tight line-clamp-1">
                        Ticket Detail
                    </h2>
                </div>
                <ShieldAlert className="absolute bottom-[-10px] right-[-10px] opacity-10" size={80} />
            </div>

            <div className="p-5 space-y-6 flex-1 overflow-y-auto">
                <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Issue Overview</p>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">
                            "{ticket.description}"
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center gap-1.5">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                            {ticket.category === 'Subscription' ? <CreditCard className="text-purple-500" size={14} /> : <Wrench className="text-indigo-500" size={14} />}
                            <span className="text-[9px] font-black italic uppercase">{ticket.category}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center gap-1.5">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Priority</p>
                            <AlertTriangle className={ticket.priority === 'Urgent' ? 'text-red-500' : 'text-amber-500'} size={14} />
                            <span className="text-[9px] font-black italic uppercase">{ticket.priority}</span>
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Assignment</p>
                        <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                <Users size={14} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-200">{ticket.assignedTo}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 pt-4">
                    <Button className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-md shadow-indigo-500/20">
                        REASSIGN TEAM <ArrowUpRight className="ml-1.5" size={14} />
                    </Button>
                    <Button variant="outline" className="w-full h-11 border-slate-200 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest rounded-lg">
                        RESOLVE & CLOSE
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 pb-6 px-4 md:px-6 max-w-7xl mx-auto">
            {/* Header section with responsive layout */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
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
                    <Button className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex-1 sm:flex-none">
                        TEAMS
                    </Button>
                </div>
            </div>

            {/* Stats row - Grid on mobile, flex on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm bg-indigo-600 text-white overflow-hidden rounded-xl">
                    <CardContent className="p-4 relative">
                        <div className="relative z-10">
                            <p className="text-[8px] font-black opacity-60 uppercase tracking-widest mb-1">Active Escalations</p>
                            <h3 className="text-2xl font-black tracking-tighter">03</h3>
                            <div className="mt-1 flex items-center gap-1.5 text-[8px] font-bold bg-white/10 w-fit px-2 py-0.5 rounded-full uppercase">
                                <AlertTriangle size={10} /> Urgent
                            </div>
                        </div>
                        <ShieldAlert className="absolute -bottom-2 -right-2 opacity-10" size={60} />
                    </CardContent>
                </Card>

                {/* Responsive Filter Buttons for mobile/tablet */}
                <div className="md:col-span-1 lg:col-span-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2 mr-4 border-r pr-4 border-slate-100 dark:border-slate-800">
                        <Filter size={14} className="text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
                    </div>
                    {filters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === filter
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                : 'bg-slate-50 dark:bg-slate-950 text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
                {/* Main Content: Tickets Feed */}
                <div className="lg:col-span-2 xl:col-span-3 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredTickets.map((ticket, i) => (
                            <motion.div
                                key={ticket.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card
                                    className={`border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all cursor-pointer overflow-hidden rounded-xl group ${selectedTicket?.id === ticket.id ? 'ring-2 ring-indigo-500 bg-indigo-50/5' : 'bg-white dark:bg-slate-900'
                                        }`}
                                    onClick={() => handleTicketSelect(ticket)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex gap-4">
                                            <div className={`size-12 rounded-lg ${getStatusStyle(ticket.status)} border flex flex-col items-center justify-center shrink-0`}>
                                                <span className="text-[8px] font-black mb-0.5 opacity-60 uppercase">ID</span>
                                                <span className="text-[10px] font-black">{ticket.id.split('-')[1]}</span>
                                            </div>

                                            <div className="flex-1 space-y-1 overflow-hidden">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded-sm">{ticket.category}</span>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden sm:flex items-center gap-1">
                                                            <Clock size={10} /> {ticket.createdAt}
                                                        </span>
                                                    </div>
                                                    <Badge className={`${getStatusStyle(ticket.status)} border-none text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5`}>
                                                        {ticket.status}
                                                    </Badge>
                                                </div>

                                                <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate">
                                                    {ticket.issue}
                                                </h3>

                                                <div className="flex items-center gap-3 text-[10px] font-bold">
                                                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                                        <User size={12} className="text-indigo-500" />
                                                        <span className="font-black uppercase tracking-tighter whitespace-nowrap truncate max-w-[120px]">{ticket.client}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Detail View (Desktop Only) */}
                <div className="hidden lg:block lg:col-span-1">
                    <AnimatePresence mode="wait">
                        {selectedTicket ? (
                            <motion.div
                                key={selectedTicket.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="sticky top-20"
                            >
                                <TicketDetailContent
                                    ticket={selectedTicket}
                                    onClose={() => setSelectedTicket(null)}
                                />
                            </motion.div>
                        ) : (
                            <div className="h-[400px] rounded-xl border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center p-6 sticky top-20">
                                <div className="size-16 rounded-full bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center mb-4 text-slate-200">
                                    <MessageSquare size={24} />
                                </div>
                                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest italic leading-tight">
                                    Select a ticket <br /> to manage
                                </h3>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Mobile/Tablet Detail Overlay (Sheet) */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="p-0 border-none w-full sm:max-w-md bg-transparent">
                    <AnimatePresence>
                        {selectedTicket && (
                            <div className="h-full">
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
