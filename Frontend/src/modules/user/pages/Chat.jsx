import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import {
    Search,
    Send,
    Plus,
    MessageSquare,
    User,
    ArrowLeft,

    MoreVertical,
    Phone,
    Video,
    Info,
    CheckCheck,
    Clock,
    Home,
    CheckSquare,
    LayoutDashboard,
    Calendar,
    StickyNote,
    LifeBuoy,
    Copy,
    Share,
    Clipboard,
    X,
    Forward
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/shared/utils/cn';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { toast } from 'sonner';

import useAuthStore from '@/store/authStore';
import useEmployeeStore from '@/store/employeeStore';
import useChatStore from '@/store/chatStore';

const EmployeeChat = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { name: 'Home', path: '/employee', icon: LayoutDashboard },
        { name: 'Calendar', path: '/employee/calendar', icon: Calendar },
        { name: 'Chat', path: '/employee/chat', icon: MessageSquare },
        { name: 'Notes', path: '/employee/notes', icon: StickyNote },
        { name: 'Support', path: '/employee/support', icon: LifeBuoy },
    ];

    const { user: currentUser, role: userRole } = useAuthStore();
    const { allEmployees, fetchAllEmployees } = useEmployeeStore();
    const {
        conversations,
        activeConversation,
        messages,
        loading,
        fetchConversations,
        setActiveConversation,
        sendMessage,
        accessOrCreateChat
    } = useChatStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showAllUsers, setShowAllUsers] = useState(false);

    // Share/Forward States
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [messageToShare, setMessageToShare] = useState(null);
    const [shareSearchTerm, setShareSearchTerm] = useState('');

    const scrollRef = useRef(null);

    // Initial load
    useEffect(() => {
        fetchConversations();
        fetchAllEmployees();
    }, [fetchConversations, fetchAllEmployees]);

    // Map role to DB Model
    const getModelName = (role) => {
        const maps = {
            'admin': 'Admin',
            'manager': 'Manager',
            'employee': 'Employee',
            'sales': 'SalesExecutive',
            'superadmin': 'SuperAdmin'
        };
        return maps[role] || 'Employee';
    };

    // Filter employees for search
    const filteredEmployees = useMemo(() => {
        if (!searchTerm) return [];
        return allEmployees.filter(e =>
            e._id !== currentUser?._id &&
            e.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allEmployees, currentUser, searchTerm]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        const participantIds = activeConversation.participants.map(p => p.user._id);

        sendMessage(
            newMessage,
            activeConversation._id,
            currentUser._id,
            getModelName(userRole),
            participantIds
        );
        setNewMessage('');
    };

    const handleStartChat = async (targetUser) => {
        const targetModel = targetUser.role ? getModelName(targetUser.role) : 'Employee';
        await accessOrCreateChat(targetUser._id, targetModel, currentUser.workspaceId || 'global');
        setSearchTerm('');
        setShowAllUsers(false);
    };

    const getChatPartner = (chat) => {
        if (!chat) return null;
        if (chat.isGroup) return { name: chat.groupName, avatar: chat.groupAvatar };
        const currentId = currentUser?._id || currentUser?.id;
        return chat.participants.find(p => (p.user?._id || p.user?.id) !== currentId)?.user || { name: 'Unknown', avatar: '' };
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Message copied to clipboard');
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setNewMessage(prev => prev + text);
        } catch (err) {
            toast.error('Failed to read clipboard');
        }
    };

    const handleShare = (msg) => {
        setMessageToShare(msg);
        setShareModalOpen(true);
    };

    const handleForwardMessage = async (targetUser) => {
        if (!messageToShare) return;

        try {
            const targetModel = targetUser.role ? getModelName(targetUser.role) : 'Employee';
            const conversation = await accessOrCreateChat(targetUser._id, targetModel, currentUser.workspaceId || 'global');

            if (conversation) {
                const participantIds = conversation.participants.map(p => p.user._id || p.user);
                sendMessage(
                    messageToShare.text,
                    conversation._id,
                    currentUser._id,
                    getModelName(userRole),
                    participantIds
                );
                toast.success('Message forwarded');
                setShareModalOpen(false);
                setMessageToShare(null);
            }

        } catch (error) {
            console.error(error);
            toast.error('Failed to forward message');
        }
    };

    const filteredShareUsers = useMemo(() => {
        if (!shareSearchTerm) return allEmployees?.filter(e => e._id !== currentUser?._id) || [];
        return allEmployees.filter(e =>
            e._id !== currentUser?._id &&
            e.name.toLowerCase().includes(shareSearchTerm.toLowerCase())
        );
    }, [allEmployees, currentUser, shareSearchTerm]);

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900 overflow-hidden">
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className={cn(
                    "w-full lg:w-72 xl:w-80 flex-shrink-0 border-r border-slate-100 dark:border-slate-800 flex flex-col transition-all",
                    activeConversation ? "hidden lg:flex" : "flex"
                )}>
                    <div className="p-4 lg:p-6 border-b border-slate-50 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate('/employee')}
                                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary-600"
                                >
                                    <ArrowLeft size={18} />
                                </Button>
                                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-none uppercase tracking-tight">Team Messenger</h1>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowAllUsers(!showAllUsers)}
                                className={cn(
                                    "size-8 rounded-lg transition-all",
                                    showAllUsers ? "bg-primary-600 text-white shadow-lg rotate-45" : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                                )}
                            >
                                <Plus size={16} />
                            </Button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-[#4461f2] transition-colors" />
                            <input
                                placeholder="Search team..."
                                className="w-full h-10 pl-10 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-bold outline-none transition-all focus:border-[#4461f2] dark:focus:border-[#4461f2] dark:text-white"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    if (e.target.value) setShowAllUsers(false);
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pb-20">
                        <div className="p-2 space-y-1">
                            {/* Full Connection List */}
                            {showAllUsers && !searchTerm && (
                                <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <p className="px-3 text-[9px] font-black text-primary-600 uppercase tracking-widest mb-2">Internal Directory</p>
                                    {allEmployees.filter(u => u._id !== currentUser?._id).map(emp => (
                                        <button
                                            key={emp._id}
                                            onClick={() => handleStartChat(emp)}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/20 text-left transition-all"
                                        >
                                            <div className="relative">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={emp.avatar} />
                                                    <AvatarFallback className="bg-primary-100 text-primary-700 font-black text-xs">
                                                        {emp.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                                    {emp.name}
                                                    <Badge className="bg-slate-100 text-slate-500 text-[7px] h-3 px-1 border-none">
                                                        {emp.role?.toUpperCase() || 'MEMBER'}
                                                    </Badge>
                                                </h3>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{emp.email}</p>
                                            </div>
                                        </button>
                                    ))}
                                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />
                                </div>
                            )}
                            {/* Search Results */}
                            {searchTerm && filteredEmployees.length > 0 && (
                                <div className="mb-4">
                                    <p className="px-3 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">New Chat</p>
                                    {filteredEmployees.map(emp => (
                                        <button
                                            key={emp._id}
                                            onClick={() => handleStartChat(emp)}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/20 text-left transition-all"
                                        >
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={emp.avatar} />
                                                <AvatarFallback className="bg-primary-100 text-primary-700 font-black text-xs">
                                                    {emp.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{emp.name}</h3>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{emp.email}</p>
                                            </div>
                                        </button>
                                    ))}
                                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />
                                </div>
                            )}

                            {/* Active Conversations */}
                            {conversations.length > 0 ? conversations.map((chat) => {
                                const partner = getChatPartner(chat);
                                const isActive = activeConversation?._id === chat._id;

                                return (
                                    <button
                                        key={chat._id}
                                        onClick={() => setActiveConversation(chat)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                                            isActive
                                                ? "bg-primary-50 dark:bg-primary-900/10"
                                                : "hover:bg-slate-50 dark:hover:bg-slate-800/20"
                                        )}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-9 w-9 ring-2 ring-white dark:ring-slate-900 shadow-sm shrink-0">
                                                <AvatarImage src={partner.avatar} />
                                                <AvatarFallback className="bg-primary-100 text-primary-700 font-black text-xs">
                                                    {partner.name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <h3 className={cn(
                                                    "text-xs font-black truncate uppercase tracking-tight",
                                                    isActive ? "text-primary-700 dark:text-primary-400" : "text-slate-900 dark:text-white"
                                                )}>
                                                    {partner.name}
                                                </h3>
                                                {chat.updatedAt && (
                                                    <span className="text-[9px] text-slate-400 font-black">
                                                        {format(new Date(chat.updatedAt), 'HH:mm')}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-400 truncate font-bold uppercase tracking-widest">
                                                {chat.lastMessage?.text || 'No messages yet'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            }) : (
                                <div className="p-8 text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No active conversations</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Enhanced Docked Bottom Navigation */}
                    <AnimatePresence>
                        <motion.nav
                            initial={{ y: 100, x: '-50%' }}
                            animate={{ y: 0, x: '-50%' }}
                            exit={{ y: 100, x: '-50%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed bottom-0 left-1/2 w-full max-w-[480px] h-[60px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl z-50 px-4 flex items-center justify-around border-t border-slate-200/50 dark:border-slate-800/50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] lg:hidden"
                        >
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path || (item.path === '/employee' && location.pathname === '/employee/');

                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className="relative h-full flex flex-col items-center justify-center outline-none flex-1 group"
                                    >
                                        <motion.div
                                            whileTap={{ scale: 0.9 }}
                                            className="flex flex-col items-center justify-center relative z-10"
                                        >
                                            <div className={cn(
                                                "relative flex items-center justify-center transition-all duration-500",
                                                isActive ? "text-[#4461f2]" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                            )}>
                                                {/* Glow Background for Active Icon */}
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="icon_glow"
                                                        className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full scale-150 z-0"
                                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.8 }}
                                                    />
                                                )}

                                                <item.icon
                                                    size={isActive ? 24 : 22}
                                                    strokeWidth={isActive ? 2.5 : 1.8}
                                                    className={cn(
                                                        "transition-all duration-500 relative z-10",
                                                        isActive ? "-translate-y-1 scale-105 drop-shadow-[0_0_8px_rgba(68,97,242,0.4)]" : "group-hover:scale-110"
                                                    )}
                                                />
                                            </div>
                                            <span className={cn(
                                                "text-[9px] font-black mt-0.5 tracking-[0.05em] uppercase transition-all duration-300 relative z-10",
                                                isActive
                                                    ? "text-[#4461f2] opacity-100 -translate-y-1"
                                                    : "text-slate-400 opacity-60 translate-y-0 group-hover:opacity-100"
                                            )}>
                                                {item.name}
                                            </span>
                                        </motion.div>
                                    </NavLink>
                                );
                            })}
                        </motion.nav>
                    </AnimatePresence>
                </div>

                {/* Chat Area */}
                <div className={cn(
                    "flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-900/10",
                    !activeConversation ? "hidden md:flex items-center justify-center" : "flex"
                )}>
                    {activeConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="lg:hidden h-8 w-8 rounded-lg"
                                        onClick={() => setActiveConversation(null)}
                                    >
                                        <ArrowLeft size={18} />
                                    </Button>
                                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                                        <AvatarImage src={getChatPartner(activeConversation).avatar} />
                                        <AvatarFallback className="bg-primary-100 text-primary-700 font-black text-xs uppercase">
                                            {getChatPartner(activeConversation)?.name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-none mb-1 uppercase tracking-tight">
                                            {getChatPartner(activeConversation).name}
                                        </h2>
                                        <p className="text-[9px] text-emerald-500 font-black uppercase tracking-[0.2em]">
                                            Online
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar" ref={scrollRef}>
                                <div className="space-y-4 sm:space-y-6">
                                    {messages.map((msg) => {
                                        const senderId = msg.senderId?._id || msg.senderId;
                                        const currentId = currentUser?._id || currentUser?.id;
                                        const isMe = senderId === currentId;
                                        return (
                                            <motion.div
                                                key={msg._id}
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                className={cn(
                                                    "flex w-full group relative mb-2",
                                                    isMe ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                <div className={cn(
                                                    "max-w-[85%] sm:max-w-[70%] space-y-1 flex flex-col",
                                                    isMe ? "items-end" : "items-start"
                                                )}>
                                                    <div className="flex items-center gap-1.5 px-1 mb-1">
                                                        <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                                            {isMe ? null : (msg.senderId?.name || "Partner")}
                                                        </span>
                                                        <span className={cn(
                                                            "text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
                                                            isMe ? "text-slate-500" : "bg-primary-600 text-white"
                                                        )}>
                                                            {isMe ? 'ME' : (msg.senderId?.role || 'MEMBER').toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className={cn(
                                                        "px-4 py-2 sm:px-5 sm:py-3 rounded-2xl relative",
                                                        isMe
                                                            ? "bg-primary-600 text-white rounded-tr-none shadow-md shadow-primary-500/10"
                                                            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none border border-slate-100 dark:border-slate-800"
                                                    )}>
                                                        <p className="text-[13px] sm:text-sm font-bold leading-relaxed">{msg.text}</p>

                                                        {/* Message Actions */}
                                                        <div className={cn(
                                                            "absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity z-10",
                                                            isMe ? "-left-8" : "-right-8"
                                                        )}>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 shadow-sm border border-slate-200 dark:border-slate-700">
                                                                        <MoreVertical size={12} className="text-slate-500" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align={isMe ? "end" : "start"}>
                                                                    <DropdownMenuItem onClick={() => handleCopy(msg.text)} className="gap-2 text-xs font-bold">
                                                                        <Copy size={12} /> Copy
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleShare(msg)} className="gap-2 text-xs font-bold">
                                                                        <Share size={12} /> Share / Forward
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                    <div className={cn("flex items-center gap-1.5 px-1", isMe ? "justify-end" : "justify-start")}>
                                                        <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">
                                                            {format(new Date(msg.createdAt), 'HH:mm')}
                                                        </span>
                                                        {isMe && <CheckCheck size={10} className="text-primary-500" />}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col gap-2">
                                    <form
                                        onSubmit={handleSendMessage}
                                        className="relative flex items-center gap-2 sm:gap-3"
                                    >
                                        <Input
                                            value={newMessage}
                                            onChange={(e) => {
                                                setNewMessage(e.target.value);
                                            }}
                                            placeholder="Type message..."
                                            className="h-11 sm:h-14 pl-5 sm:pl-6 pr-12 sm:pr-14 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl sm:rounded-3xl focus:ring-2 focus:ring-primary/10 text-xs sm:text-sm font-bold placeholder:text-slate-300 transition-all shadow-inner"
                                        />
                                        <Button
                                            type="button"
                                            onClick={handlePaste}
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-14 sm:right-16 text-slate-400 hover:text-primary-600"
                                            title="Paste from Clipboard"
                                        >
                                            <Clipboard size={16} />
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            className="h-11 w-11 sm:h-14 sm:w-14 rounded-2xl sm:rounded-3xl bg-primary-600 text-white shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 active:scale-95 transition-all flex items-center justify-center p-0 shrink-0"
                                        >
                                            <Send size={18} className="sm:size-[22px] ml-0.5" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center space-y-4 max-w-sm px-10">
                            <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary mx-auto mb-6 shadow-inner">
                                <MessageSquare size={44} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Team Messenger</h2>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                Connect directly with any employee in your organization. Send updates, queries or feedback instantly.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            {/* Share/Forward Modal */}
            <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <Forward size={18} /> Forward Message
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/50">
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 line-clamp-3 italic">
                                "{messageToShare?.text}"
                            </p>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search user to forward..."
                                className="pl-9 h-10 bg-slate-50 border-none"
                                value={shareSearchTerm}
                                onChange={(e) => setShareSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="max-h-[300px] overflow-y-auto space-y-1 pr-2">
                            {filteredShareUsers.map(user => (
                                <button
                                    key={user._id}
                                    onClick={() => handleForwardMessage(user)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left group transition-all"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback className="bg-primary-100 text-primary-700 font-bold text-xs">{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{user.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user.role}</p>
                                    </div>
                                    <Forward size={16} className="text-slate-300 group-hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                            ))}
                            {filteredShareUsers.length === 0 && (
                                <p className="text-center text-xs text-slate-400 py-4 italic">No users found</p>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default EmployeeChat;
