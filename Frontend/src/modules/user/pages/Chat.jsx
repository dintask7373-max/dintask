import React, { useState, useMemo, useEffect, useRef } from 'react';
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
    CheckCheck,
    Clock,
    Zap,
    Cpu,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/shared/utils/cn';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { useNavigate } from 'react-router-dom';

import useAuthStore from '@/store/authStore';
import useEmployeeStore from '@/store/employeeStore';
import useChatStore from '@/store/chatStore';

const EmployeeChat = () => {
    const navigate = useNavigate();
    const { user: currentUser, role: userRole } = useAuthStore();
    const { employees: allUsers, fetchEmployees } = useEmployeeStore();
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
    const [showAllUsers, setShowAllUsers] = useState(false);
    const scrollRef = useRef(null);

    // Initial load
    useEffect(() => {
        fetchConversations();
        fetchEmployees(); // Get colleagues/managers to search
    }, [fetchConversations, fetchEmployees]);

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

    // Filter users for search (Filter out self)
    const filteredResults = useMemo(() => {
        if (!searchTerm) return [];
        return allUsers.filter(u =>
            u._id !== currentUser?._id &&
            u.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allUsers, currentUser, searchTerm]);

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

    return (
        <div className="flex h-[100dvh] w-full bg-white dark:bg-slate-900 overflow-hidden transition-all duration-500">
            {/* Sidebar with Search */}
            <div className={cn(
                "w-full md:w-80 flex-shrink-0 border-r border-slate-50 dark:border-slate-800 flex flex-col transition-all",
                activeConversation ? "hidden md:flex" : "flex"
            )}>
                <div className="p-5 border-b border-slate-50 dark:border-slate-800 text-center md:text-left">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Vortex <span className="text-indigo-600">Sync</span></h1>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowAllUsers(!showAllUsers)}
                                className={cn(
                                    "size-8 rounded-lg transition-all",
                                    showAllUsers ? "bg-indigo-600 text-white shadow-lg rotate-45" : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                                )}
                            >
                                <Plus size={16} />
                            </Button>
                            <Badge variant="ghost" className="hidden sm:flex bg-indigo-50 text-indigo-600 text-[8px] font-black tracking-widest px-2 h-5">SECURE</Badge>
                        </div>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                        <Input
                            placeholder="SEARCH PEOPLE..."
                            className="h-11 pl-11 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-black text-[10px] uppercase tracking-widest placeholder:text-slate-300 shadow-inner"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                if (e.target.value) setShowAllUsers(false);
                            }}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                    <div className="p-2.5 space-y-1">
                        {/* Full Connection List */}
                        {showAllUsers && !searchTerm && (
                            <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between px-3 mb-3">
                                    <p className="text-[8px] font-black text-indigo-600 uppercase tracking-[0.3em]">Connected Nodes</p>
                                    <span className="text-[7px] font-bold text-slate-400">{allUsers.length - 1} AVAILABLE</span>
                                </div>
                                {allUsers.filter(u => u._id !== currentUser?._id).map(person => (
                                    <button
                                        key={person._id}
                                        onClick={() => handleStartChat(person)}
                                        className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/30 text-left transition-all group"
                                    >
                                        <div className="relative">
                                            <Avatar className="h-11 w-11 rounded-xl">
                                                <AvatarImage src={person.avatar} className="object-cover" />
                                                <AvatarFallback className="bg-indigo-50 text-indigo-600 font-black text-xs uppercase">
                                                    {person.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-white dark:border-slate-900 rounded-lg shadow-sm" />
                                        </div>
                                        <div>
                                            <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                                {person.name}
                                                <Badge className="bg-slate-100 text-slate-500 text-[8px] h-4 px-1.5 border-none">
                                                    {person.role?.toUpperCase() || 'MEMBER'}
                                                </Badge>
                                            </h3>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{person.email}</p>
                                        </div>
                                    </button>
                                ))}
                                <div className="h-px bg-slate-100 dark:bg-slate-800 my-4 mx-2" />
                            </div>
                        )}
                        {/* Search Results */}
                        {searchTerm && filteredResults.length > 0 && (
                            <div className="mb-4">
                                <p className="px-3 text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Initialize Uplink</p>
                                {filteredResults.map(person => (
                                    <button
                                        key={person._id}
                                        onClick={() => handleStartChat(person)}
                                        className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/30 text-left transition-all"
                                    >
                                        <Avatar className="h-11 w-11 rounded-xl">
                                            <AvatarImage src={person.avatar} className="object-cover" />
                                            <AvatarFallback className="bg-indigo-50 text-indigo-600 font-black text-xs uppercase">
                                                {person.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                                {person.name}
                                                <Badge className="bg-slate-100 text-slate-500 text-[8px] h-4 px-1.5 border-none">
                                                    {person.role?.toUpperCase() || 'MEMBER'}
                                                </Badge>
                                            </h3>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{person.email}</p>
                                        </div>
                                    </button>
                                ))}
                                <div className="h-px bg-slate-100 dark:bg-slate-800 my-4 mx-2" />
                            </div>
                        )}

                        {/* Recent Conversations */}
                        {conversations.length > 0 ? conversations.map((chat) => {
                            const partner = getChatPartner(chat);
                            const isActive = activeConversation?._id === chat._id;

                            return (
                                <button
                                    key={chat._id}
                                    onClick={() => setActiveConversation(chat)}
                                    className={cn(
                                        "w-full flex items-center gap-3.5 p-3.5 rounded-2xl transition-all text-left group relative",
                                        isActive
                                            ? "bg-slate-900 dark:bg-slate-800 shadow-xl shadow-slate-900/10"
                                            : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                                    )}
                                >
                                    <div className="relative shrink-0">
                                        <Avatar className="h-11 w-11 rounded-xl ring-2 ring-white dark:ring-slate-900 shadow-sm transition-transform group-hover:scale-105">
                                            <AvatarImage src={partner.avatar} className="object-cover" />
                                            <AvatarFallback className="bg-indigo-50 text-indigo-600 font-black text-xs uppercase">
                                                {partner.name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-white dark:border-slate-900 rounded-lg shadow-sm" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h3 className={cn(
                                                "text-[11px] font-black uppercase tracking-tight truncate flex items-center gap-1.5",
                                                isActive ? "text-white" : "text-slate-900 dark:text-white"
                                            )}>
                                                {partner.name}
                                                {!isActive && partner.role && (
                                                    <span className="text-[7px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1 rounded-sm">
                                                        {partner.role.charAt(0)}
                                                    </span>
                                                )}
                                            </h3>
                                            {chat.updatedAt && (
                                                <span className={cn(
                                                    "text-[8px] font-black uppercase tracking-widest",
                                                    isActive ? "text-indigo-400" : "text-slate-400"
                                                )}>
                                                    {format(new Date(chat.updatedAt), 'HH:mm')}
                                                </span>
                                            )}
                                        </div>
                                        <p className={cn(
                                            "text-[9px] font-bold uppercase tracking-tighter truncate opacity-60",
                                            isActive ? "text-slate-300" : "text-slate-400"
                                        )}>
                                            {chat.lastMessage?.text || 'SYN_ESTABLISHED'}
                                        </p>
                                    </div>
                                    {isActive && (
                                        <motion.div layoutId="active-indicator" className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-full" />
                                    )}
                                </button>
                            );
                        }) : (
                            <div className="p-8 text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">No active connections</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tactical Chat Area */}
            <div className={cn(
                "flex-1 flex flex-col bg-slate-50/20 dark:bg-slate-900/40",
                !activeConversation ? "hidden md:flex items-center justify-center p-12" : "flex"
            )}>
                {activeConversation ? (
                    <>
                        {/* Header */}
                        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden size-8 rounded-xl bg-slate-50 dark:bg-slate-800"
                                    onClick={() => setActiveConversation(null)}
                                >
                                    <ArrowLeft size={14} className="text-slate-400" />
                                </Button>
                                <Avatar className="h-10 w-10 rounded-xl ring-2 ring-indigo-50 dark:ring-indigo-900/10">
                                    <AvatarImage src={getChatPartner(activeConversation).avatar} className="object-cover" />
                                    <AvatarFallback className="bg-indigo-50 text-indigo-600 font-black text-xs uppercase">
                                        {getChatPartner(activeConversation)?.name?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1.5 flex items-center gap-2">
                                        {getChatPartner(activeConversation).name}
                                        <Badge className={cn(
                                            "text-[8px] h-4 px-1.5 font-black uppercase tracking-widest border-none",
                                            getChatPartner(activeConversation).role?.toLowerCase() === 'admin' ? "bg-red-50 text-red-600" :
                                                getChatPartner(activeConversation).role?.toLowerCase() === 'manager' ? "bg-amber-50 text-amber-600" :
                                                    getChatPartner(activeConversation).role?.toLowerCase() === 'sales' ? "bg-emerald-50 text-emerald-600" :
                                                        "bg-indigo-50 text-indigo-600"
                                        )}>
                                            {getChatPartner(activeConversation).role || 'MEMBER'}
                                        </Badge>
                                        <Shield size={12} className="text-indigo-500 fill-current opacity-20" />
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgb(16,185,129)]" />
                                        <p className="text-[8px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.2em] leading-none">
                                            ACTIVE_UPLINK
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="size-9 rounded-xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                    <MoreVertical size={16} />
                                </Button>
                            </div>
                        </div>

                        {/* Message Feed */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 no-scrollbar scroll-smooth" ref={scrollRef}>
                            <div className="space-y-8">
                                <AnimatePresence mode="popLayout">
                                    {messages.map((msg) => {
                                        const senderId = msg.senderId?._id || msg.senderId;
                                        const senderRole = msg.senderId?.role || (isMe ? userRole : getChatPartner(activeConversation)?.role);
                                        const currentId = currentUser?._id || currentUser?.id;
                                        const isMe = senderId === currentId;
                                        return (
                                            <motion.div
                                                key={msg._id}
                                                initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.95 }}
                                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                                className={cn(
                                                    "flex w-full group",
                                                    isMe ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                <div className={cn(
                                                    "max-w-[85%] sm:max-w-[70%] space-y-1.5 flex flex-col",
                                                    isMe ? "items-end" : "items-start"
                                                )}>
                                                    <div className="flex items-center gap-1.5 px-1">
                                                        <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                                            {isMe ? `YOU (${currentUser?.name})` : (msg.senderId?.name || "Partner")}
                                                        </span>
                                                        <span className={cn(
                                                            "text-[7px] font-bold text-white uppercase tracking-widest px-1.5 py-0.5 rounded shadow-sm",
                                                            isMe ? "bg-slate-500 shadow-slate-400/20" : "bg-indigo-600 shadow-indigo-500/20"
                                                        )}>
                                                            {isMe ? 'OPERATOR' : (msg.senderId?.role || 'EMPLOYEE').toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className={cn(
                                                        "px-5 py-3 rounded-2xl text-[13px] font-bold shadow-xl transition-all duration-300 relative",
                                                        isMe
                                                            ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/10 hover:shadow-indigo-500/20"
                                                            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none border border-slate-50 dark:border-slate-700 shadow-slate-200/30 dark:shadow-none"
                                                    )}>
                                                        {msg.text}
                                                    </div>
                                                    <div className={cn("flex items-center gap-2 px-1", isMe ? "justify-end" : "justify-start")}>
                                                        {isMe && <CheckCheck size={12} className="text-indigo-500 opacity-80" />}
                                                        <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest opacity-60">
                                                            {format(new Date(msg.createdAt), 'HH:mm:ss')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
                                        <MessageSquare size={48} className="mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest italic text-indigo-400">Awaiting communication...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800 z-10">
                            <form
                                onSubmit={handleSendMessage}
                                className="relative flex items-center gap-3"
                            >
                                <div className="flex-1 relative group bg-slate-50/50 dark:bg-slate-800/30 rounded-[1.5rem] transition-all focus-within:ring-2 focus-within:ring-indigo-500/20">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="TYPE ENCRYPTED MESSAGE..."
                                        className="h-14 pl-6 pr-14 bg-transparent border-none font-black text-[11px] uppercase tracking-[0.1em] placeholder:text-slate-300 placeholder:italic transition-all shadow-none"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <Clock size={16} className="text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="h-14 w-14 rounded-[1.5rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center justify-center p-0 flex-shrink-0 active:scale-95"
                                >
                                    <Send size={20} className="ml-0.5" />
                                </Button>
                            </form>
                            <div className="mt-3 px-2 flex items-center justify-between text-[7px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                <div className="flex items-center gap-1">
                                    <Cpu size={10} /> SYSTEM_STABLE_V4.2
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="size-1 rounded-full bg-emerald-500" /> SYNC_LOCKED
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-8 max-w-sm"
                    >
                        <div className="relative mx-auto">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full animate-pulse" />
                            <div className="w-28 h-28 bg-white dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center text-indigo-600 mx-auto relative shadow-2xl border border-slate-50 dark:border-slate-700">
                                <MessageSquare size={48} strokeWidth={2.5} className="fill-indigo-500/10" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 size-10 bg-indigo-900 text-white rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-white dark:ring-slate-900">
                                <Zap size={18} className="fill-current" />
                            </div>
                        </div>
                        <div className="space-y-3 px-6">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic line-clamp-1">Vortex <span className="text-indigo-600">Sync_Node</span></h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-[280px] mx-auto italic">
                                Initialize secure multi-channel communication node. Start by searching or selecting a neural link.
                            </p>
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Awaiting Link Selection...</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default EmployeeChat;
