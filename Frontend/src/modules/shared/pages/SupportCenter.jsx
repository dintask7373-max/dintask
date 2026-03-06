import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
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
    Loader2,
    Paperclip,
    X,
    Star,
    Trash2,
    ChevronLeft
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { toast } from 'sonner';
import useAuthStore from '@/store/authStore';
import useTicketStore from '@/store/ticketStore';
import socketService from '@/services/socket';

const SupportCenter = () => {
    const { user, role } = useAuthStore();
    const location = useLocation();
    const isSalesSupport = location.pathname.includes('/sales/support');
    const { tickets, addTicket, updateTicketStatus, fetchTickets, loading, fetchTicketStats, stats, replyToTicket, initializeSocket, uploadFiles, giveFeedback, deleteTicket, pagination } = useTicketStore();
    const fileInputRef = React.useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [debouncedSearch, setDebouncedSearch] = useState('');

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
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [userFeedback, setUserFeedback] = useState('');
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const typingTimeoutRef = React.useRef(null);

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset page when tab changes
    React.useEffect(() => {
        setPage(1);
    }, [activeTab]);

    React.useEffect(() => {
        const scope = role === 'admin' ? (activeTab === 'received' ? 'company' : 'my') : 'all';
        fetchTickets({ page, limit, search: debouncedSearch, scope });
    }, [fetchTickets, page, limit, debouncedSearch, activeTab, role]);

    React.useEffect(() => {
        fetchTicketStats();
        if (user?._id) initializeSocket(user._id);
    }, [fetchTicketStats, initializeSocket, user?._id]);

    // Sync selectedTicket with store data for real-time updates
    React.useEffect(() => {
        if (selectedTicket) {
            const updated = tickets.find(t => t._id === selectedTicket._id);
            if (updated) {
                if (updated.responses?.length !== selectedTicket.responses?.length || updated.status !== selectedTicket.status) {
                    setSelectedTicket(updated);
                }
            }
        }
    }, [tickets, selectedTicket]);

    // Room Management & Listeners
    React.useEffect(() => {
        if (selectedTicket) {
            socketService.joinTicket(selectedTicket._id);

            // Instant message reception for the active ticket
            socketService.onSupportResponse(({ ticketId, updatedTicket }) => {
                if (ticketId === selectedTicket._id) {
                    setSelectedTicket(updatedTicket);
                }
            });

            socketService.onSupportTyping(({ ticketId, userName }) => {
                if (ticketId === selectedTicket._id) {
                    setTypingUser(userName);
                }
            });

            const stopTypingListener = (ticketId) => {
                if (ticketId === selectedTicket._id) {
                    setTypingUser(null);
                }
            };

            if (socketService.socket) {
                socketService.socket.on('support_stop_typing', stopTypingListener);
            }

            return () => {
                socketService.leaveTicket(selectedTicket._id);
                if (socketService.socket) {
                    socketService.socket.off('support_stop_typing', stopTypingListener);
                }
            };
        }
    }, [selectedTicket]);

    const handleTicketSelect = (ticket) => {
        // Leave previous ticket room if any
        if (selectedTicket) {
            socketService.leaveTicket(selectedTicket._id);
        }

        // Join new ticket room
        socketService.joinTicket(ticket._id);

        setSelectedTicket(ticket);
        if (window.innerWidth < 1024) setIsSheetOpen(true);
        setReplyMessage('');
    };

    const handleReply = async () => {
        if (!replyMessage.trim() || !selectedTicket) return;
        setIsSubmittingReply(true);

        // Stop typing immediately on send
        socketService.socket?.emit('support_stop_typing', selectedTicket._id);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        const success = await replyToTicket(selectedTicket._id, replyMessage);
        if (success) {
            setReplyMessage('');
        }
        setIsSubmittingReply(false);
    };

    const handleTextareaChange = (e) => {
        setReplyMessage(e.target.value);
        if (!selectedTicket) return;

        // Emit typing
        socketService.emitSupportTyping(selectedTicket._id, user?.name || 'Someone');

        // Debounce stop typing
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socketService.socket?.emit('support_stop_typing', selectedTicket._id);
        }, 3000);
    };

    const handleStatusChange = async (value) => {
        if (!selectedTicket) return;
        const success = await updateTicketStatus(selectedTicket._id, value);
        if (success) {
            setSelectedTicket(prev => ({ ...prev, status: value }));
        }
    };

    const renderDetailContent = () => {
        return (
            <div className="h-full flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/40 dark:border-slate-800/40 rounded-[2rem] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
                    <div className="flex justify-between items-start mb-4">
                        {role?.startsWith('superadmin') ? (
                            <Select value={selectedTicket.status} onValueChange={handleStatusChange}>
                                <SelectTrigger className={cn("h-7 w-auto min-w-[90px] text-[10px] font-black uppercase tracking-widest border-none px-3", getStatusStyle(selectedTicket.status))}>
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
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {selectedTicket.createdAt && new Date(selectedTicket.createdAt).toLocaleDateString()}
                            </span>
                            <button
                                onClick={() => setIsSheetOpen(false)}
                                className="p-1.5 -mr-2 bg-white dark:bg-slate-800 rounded-full text-slate-900 dark:text-white shadow-sm border border-slate-100 dark:border-slate-700 lg:hidden transition-colors"
                            >
                                <X size={14} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-snug mb-2">
                        {selectedTicket.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <User size={12} /> {selectedTicket.creator?.name || 'Unknown User'}
                    </div>
                </div>

                {/* Content Scroll */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                            {selectedTicket.description}
                        </div>
                    </div>

                    {selectedTicket.attachments?.length > 0 && (
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Attachments</label>
                            <div className="flex flex-wrap gap-3">
                                {selectedTicket.attachments.map((url, i) => (
                                    <a
                                        key={i}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block transition-transform hover:scale-105"
                                    >
                                        {url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                                            <div className="relative group size-20 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
                                                <img src={url} alt={`Attachment ${i}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <ArrowUpRight size={16} className="text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                                <FileText size={14} className="text-[#4461f2]" />
                                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">View File</span>
                                            </div>
                                        )}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedTicket.status === 'Resolved' && selectedTicket.creator?._id === user?.id && !selectedTicket.rating && (
                        <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-800/20 space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black text-[#4461f2] uppercase tracking-widest">Ticket Resolved</h4>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateTicketStatus(selectedTicket._id, 'Open')}
                                    className="h-7 text-[9px] font-black uppercase tracking-widest border-blue-200 dark:border-blue-800 text-blue-600 bg-white dark:bg-slate-900 rounded-lg"
                                >
                                    Re-open Issue
                                </Button>
                            </div>
                            <div className="space-y-3">
                                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">How would you rate our support?</p>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setUserRating(star)}
                                            className="transition-transform active:scale-95"
                                        >
                                            <Star
                                                size={20}
                                                className={cn(
                                                    "transition-colors",
                                                    star <= userRating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <Textarea
                                    placeholder="Any feedback for us?"
                                    className="min-h-[60px] text-[10px] bg-white dark:bg-slate-950 border-none rounded-xl"
                                    value={userFeedback}
                                    onChange={(e) => setUserFeedback(e.target.value)}
                                />
                                <Button
                                    onClick={async () => {
                                        if (userRating === 0) return toast.error("Please provide a rating");
                                        setIsSubmittingFeedback(true);
                                        await giveFeedback(selectedTicket._id, userRating, userFeedback);
                                        setIsSubmittingFeedback(false);
                                    }}
                                    disabled={isSubmittingFeedback || userRating === 0}
                                    className="w-full h-8 bg-[#4461f2] text-white text-[9px] font-black uppercase tracking-widest rounded-xl"
                                >
                                    {isSubmittingFeedback ? <Loader2 size={12} className="animate-spin" /> : 'Submit & Close Ticket'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {selectedTicket.rating > 0 && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">User Rating:</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={10}
                                            className={cn(star <= selectedTicket.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300")}
                                        />
                                    ))}
                                </div>
                            </div>
                            {selectedTicket.feedback && (
                                <p className="text-[10px] font-medium text-slate-500 italic">"{selectedTicket.feedback}"</p>
                            )}
                        </div>
                    )}

                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare size={12} /> Discussion
                        </label>
                        <div className="space-y-4">
                            {selectedTicket.responses?.length > 0 ? selectedTicket.responses.map((msg, i) => {
                                const isMe = msg.responder === (user?.id || user?._id);
                                return (
                                    <div key={i} className={cn("flex gap-3", isMe ? "flex-row-reverse" : "")}>
                                        <div className={cn("size-8 rounded-full flex items-center justify-center shrink-0", isMe ? "bg-[#4461f2] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500")}>
                                            <User size={14} />
                                        </div>
                                        <div className={cn("flex-1 space-y-1", isMe ? "text-right" : "")}>
                                            <div className={cn("p-3 rounded-2xl text-xs inline-block text-left max-w-[85%]", isMe ? "bg-[#4461f2] text-white rounded-tr-sm" : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-tl-sm")}>
                                                {msg.message}
                                            </div>
                                            <p className="text-[9px] text-slate-400 font-bold">
                                                {msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
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
                <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                    <AnimatePresence>
                        {typingUser && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="flex items-center gap-2 mb-2 ml-2"
                            >
                                <div className="flex gap-1">
                                    <span className="size-1 bg-[#4461f2] rounded-full animate-bounce" />
                                    <span className="size-1 bg-[#4461f2] rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <span className="size-1 bg-[#4461f2] rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 italic uppercase tracking-widest">{typingUser} is typing...</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="relative">
                        <Textarea
                            placeholder="Type your reply..."
                            className="min-h-[60px] sm:min-h-[80px] w-full resize-none pr-12 text-xs bg-slate-50 dark:bg-slate-950 border-none rounded-2xl focus:ring-2 focus:ring-[#4461f2]/20 py-3"
                            value={replyMessage}
                            onChange={handleTextareaChange}
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
    };

    const categories = ['Technical', 'Billing', 'Account', 'Feature Request', 'Other'];
    const priorities = ['Low', 'Medium', 'High', 'Urgent'];

    const handleDeleteTicket = async (e, id) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
            const success = await deleteTicket(id);
            if (success && selectedTicket?._id === id) {
                setSelectedTicket(null);
                setIsSheetOpen(false);
            }
        }
    };

    const handleCreateTicket = async () => {
        if (!newTicket.subject || !newTicket.description) return;

        let attachmentUrls = [];
        if (selectedFiles.length > 0) {
            setIsUploading(true);
            attachmentUrls = await uploadFiles(selectedFiles);
            setIsUploading(false);
        }

        const success = await addTicket({ ...newTicket, attachments: attachmentUrls });
        if (success) {
            setIsCreateModalOpen(false);
            setNewTicket({ subject: '', description: '', category: 'Technical', priority: 'Medium' });
            setSelectedFiles([]);
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
            {/* -- Premium Header Section with Background -- */}
            <div className="relative w-full overflow-hidden flex justify-center">
                {/* Background Image Layer */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/WLCOMPAGE .png"
                        alt="Background"
                        className="w-full h-full object-cover object-center pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 dark:bg-black/60 pointer-events-none" />
                </div>

                <div className="relative z-10 w-full max-w-[1100px] px-6 pt-8 pb-6">
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                            Support <span className="text-[#4461f2]">Center</span>
                        </h1>
                        <p className="text-[11px] font-black text-white/70 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                            <LifeBuoy size={14} className="text-[#4461f2]" />
                            {role?.startsWith('superadmin') ? 'Managing Administrator Escalations' :
                                role === 'admin' ? 'Unified Support Hub & Platform Requests' :
                                    'Raise tickets for technical & account issues'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="w-full max-w-[1100px] px-6 mt-4 relative z-10 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-start gap-6">
                    {role === 'admin' ? (
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
                    ) : (
                        null
                    )}

                    {!role?.startsWith('superadmin') && (
                        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-9 px-5 rounded-xl bg-[#4461f2] hover:bg-[#3451e2] text-white font-black text-[9px] uppercase tracking-widest gap-2 shadow-lg shadow-[#4461f2]/20 border-none transition-all active:scale-95">
                                    <Plus size={16} strokeWidth={3} /> Raise Ticket
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[90vw] max-w-[380px] max-h-[85vh] overflow-y-auto flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-5 shadow-2xl gap-0 scrollbar-hide">
                                <DialogHeader className="mb-4 shrink-0">
                                    <DialogTitle className="text-xl font-black italic tracking-tight uppercase dark:text-white text-center">Raise <span className="text-[#4461f2]">Ticket</span></DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</p>
                                        <Input
                                            placeholder="What is the issue?"
                                            value={newTicket.subject}
                                            onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                            className="h-10 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl font-bold text-xs px-4 focus:ring-2 focus:ring-[#4461f2]/20 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</p>
                                            <div className="relative">
                                                <select
                                                    className="w-full h-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-xs font-bold appearance-none outline-none focus:ring-2 focus:ring-[#4461f2]/20 transition-all dark:text-white"
                                                    value={newTicket.category}
                                                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                                                >
                                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                                    <ChevronRight size={12} className="rotate-90" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</p>
                                            <div className="relative">
                                                <select
                                                    className="w-full h-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-xs font-bold appearance-none outline-none focus:ring-2 focus:ring-[#4461f2]/20 transition-all dark:text-white"
                                                    value={newTicket.priority}
                                                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                                                >
                                                    {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                                    <ChevronRight size={12} className="rotate-90" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</p>
                                        <textarea
                                            rows={3}
                                            placeholder="Explain the issue in detail..."
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs outline-none resize-none dark:text-white focus:ring-2 focus:ring-[#4461f2]/20 transition-all"
                                            value={newTicket.description}
                                            onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2 pt-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Attachments</p>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-[9px] font-black text-[#4461f2] uppercase tracking-widest hover:underline flex items-center gap-1"
                                            >
                                                <Plus size={10} /> Add Files
                                            </button>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            multiple
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files);
                                                setSelectedFiles(prev => [...prev, ...files].slice(0, 5));
                                            }}
                                        />
                                        {selectedFiles.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {selectedFiles.map((file, i) => (
                                                    <div key={i} className="flex items-center gap-2 px-2 py-1 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                                                        <Paperclip size={10} className="text-slate-400" />
                                                        <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[80px]">{file.name}</span>
                                                        <button
                                                            onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))}
                                                            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full"
                                                        >
                                                            <X size={10} className="text-slate-400" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        onClick={handleCreateTicket}
                                        disabled={loading || isUploading}
                                        className="w-full h-10 bg-[#4461f2] hover:bg-[#3451e2] text-white font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg shadow-[#4461f2]/20 border-none transition-all mt-1"
                                    >
                                        {loading || isUploading ? (isUploading ? 'UPLOADING...' : 'SEND TICKET') : 'SUBMIT TICKET'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-6">

                        <div className="space-y-4">
                            <AnimatePresence mode='popLayout'>
                                {loading && tickets.length === 0 ? (
                                    <div className="flex justify-center items-center py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-[2rem]">
                                        <Loader2 className="animate-spin text-[#4461f2]" size={32} />
                                    </div>
                                ) : tickets.length > 0 ? (
                                    <div className="space-y-4" key="tickets-list">
                                        {tickets.map((ticket, index) => (
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
                                                            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-[#4461f2] transition-colors uppercase tracking-tight text-[15px]">{ticket.title}</h3>
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
                                                        {role?.startsWith('superadmin') && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-10 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                                                                onClick={(e) => handleDeleteTicket(e, ticket._id)}
                                                            >
                                                                <Trash2 size={18} />
                                                            </Button>
                                                        )}
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
                                        ))}

                                        {/* Pagination Controls */}
                                        <div className="flex items-center justify-between pt-4">
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                                                    Rows per page
                                                </p>
                                                <Select
                                                    value={limit.toString()}
                                                    onValueChange={(val) => {
                                                        setLimit(Number(val));
                                                        setPage(1);
                                                    }}
                                                >
                                                    <SelectTrigger className="h-8 w-[70px] text-[10px] font-bold uppercase tracking-widest bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[10, 20, 50, 100].map((l) => (
                                                            <SelectItem key={l} value={l.toString()} className="text-[10px] font-bold">
                                                                {l}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    Page {pagination?.page} of {pagination?.pages}
                                                </p>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                                        disabled={page === 1}
                                                        className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                                                    >
                                                        <ChevronLeft size={16} />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setPage(p => Math.min(pagination?.pages || 1, p + 1))}
                                                        disabled={page >= (pagination?.pages || 1)}
                                                        className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                                                    >
                                                        <ChevronRight size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
            </div >

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-md bg-transparent p-4 border-none shadow-none lg:hidden flex flex-col justify-end [&>button]:hidden">
                    {selectedTicket && (
                        <div className="h-[70vh] w-full max-w-[380px] mx-auto rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-black/5">
                            {renderDetailContent()}
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div >
    );
};

export default SupportCenter;
