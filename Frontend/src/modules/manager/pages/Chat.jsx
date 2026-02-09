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
    Info,
    CheckCheck,
    Clock,
    Shield,
    Terminal,
    Zap,
    Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/shared/utils/cn';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';

import useAuthStore from '@/store/authStore';
import useEmployeeStore from '@/store/employeeStore';
import useChatStore from '@/store/chatStore';

const ManagerChat = () => {
    const { user: currentUser, role: userRole } = useAuthStore();
    const { employees } = useEmployeeStore();
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
    }, [fetchConversations]);

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

    // Filter team members and others for search
    const filteredResults = useMemo(() => {
        if (!searchTerm) return [];
        return employees.filter(e =>
            e._id !== currentUser?._id &&
            e.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, currentUser, searchTerm]);

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
        <div className="flex h-[calc(100vh-140px)] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-all duration-500">
            {/* Neural Links Sidebar */}
            <div className={cn(
                "w-full md:w-80 flex-shrink-0 border-r border-slate-50 dark:border-slate-800 flex flex-col transition-all",
                activeConversation ? "hidden md:flex" : "flex"
            )}>
                <div className="p-5 border-b border-slate-50 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Neural <span className="text-primary-600">Links</span></h1>
                        <div className="flex items-center gap-2">
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
                            <Badge variant="ghost" className="bg-primary-50 text-primary-600 text-[8px] font-black tracking-widest px-2 h-5">ENCRYPTED</Badge>
                        </div>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                        <Input
                            placeholder="SEARCH NODE ID..."
                            className="h-11 pl-11 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-black text-[10px] uppercase tracking-widest placeholder:text-slate-300"
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
                                <p className="px-3 text-[8px] font-black text-primary-600 uppercase tracking-[0.3em] mb-3">Available Neural Nodes</p>
                                {employees.filter(e => e._id !== currentUser?._id).map(emp => (
                                    <button
                                        key={emp._id}
                                        onClick={() => handleStartChat(emp)}
                                        className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/30 text-left transition-all"
                                    >
                                        <div className="relative">
                                            <Avatar className="h-11 w-11 rounded-xl">
                                                <AvatarImage src={emp.avatar} />
                                                <AvatarFallback className="bg-primary-50 text-primary-600 font-black text-xs">
                                                    {emp.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-white dark:border-slate-900 rounded-lg shadow-sm" />
                                        </div>
                                        <div>
                                            <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                                {emp.name}
                                                <Badge className="bg-slate-100 text-slate-500 text-[8px] h-4 px-1.5 border-none">
                                                    {emp.role?.toUpperCase() || 'MEMBER'}
                                                </Badge>
                                            </h3>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{emp.email}</p>
                                        </div>
                                    </button>
                                ))}
                                <div className="h-px bg-slate-100 dark:bg-slate-800 my-4 mx-2" />
                            </div>
                        )}
                        {/* Search Results */}
                        {searchTerm && filteredResults.length > 0 && (
                            <div className="mb-4">
                                <p className="px-3 text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Initialize New Uplink</p>
                                {filteredResults.map(emp => (
                                    <button
                                        key={emp._id}
                                        onClick={() => handleStartChat(emp)}
                                        className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/30 text-left transition-all"
                                    >
                                        <Avatar className="h-11 w-11 rounded-xl">
                                            <AvatarImage src={emp.avatar} />
                                            <AvatarFallback className="bg-primary-50 text-primary-600 font-black text-xs">
                                                {emp.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{emp.name}</h3>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{emp.email}</p>
                                        </div>
                                    </button>
                                ))}
                                <div className="h-px bg-slate-100 dark:bg-slate-800 my-4 mx-2" />
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
                                        "w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all text-left group relative",
                                        isActive
                                            ? "bg-slate-900 dark:bg-slate-800 shadow-xl shadow-slate-900/10"
                                            : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                                    )}
                                >
                                    <div className="relative shrink-0">
                                        <Avatar className="h-11 w-11 rounded-xl ring-2 ring-white dark:ring-slate-900 shadow-sm transition-transform group-hover:scale-105">
                                            <AvatarImage src={partner.avatar} className="object-cover" />
                                            <AvatarFallback className="bg-primary-50 text-primary-600 font-black text-xs uppercase">
                                                {partner.name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-white dark:border-slate-900 rounded-lg shadow-sm animate-pulse" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h3 className={cn(
                                                "text-[11px] font-black uppercase tracking-tight truncate",
                                                isActive ? "text-white" : "text-slate-900 dark:text-white"
                                            )}>
                                                {partner.name}
                                            </h3>
                                            {chat.updatedAt && (
                                                <span className={cn(
                                                    "text-[8px] font-black uppercase tracking-widest",
                                                    isActive ? "text-primary-400" : "text-slate-400"
                                                )}>
                                                    {format(new Date(chat.updatedAt), 'HH:mm')}
                                                </span>
                                            )}
                                        </div>
                                        <p className={cn(
                                            "text-[9px] font-bold uppercase tracking-tighter truncate opacity-60",
                                            isActive ? "text-slate-300" : "text-slate-400 font-medium"
                                        )}>
                                            {chat.lastMessage?.text || 'IDLE_CONNECTION'}
                                        </p>
                                    </div>
                                    {isActive && (
                                        <motion.div layoutId="active-indicator" className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-600 rounded-full" />
                                    )}
                                </button>
                            );
                        }) : (
                            <div className="p-8 text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">No neural links established</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tactical Comms Area */}
            <div className={cn(
                "flex-1 flex flex-col bg-slate-50/20 dark:bg-slate-900/40",
                !activeConversation ? "hidden md:flex items-center justify-center p-12" : "flex"
            )}>
                {activeConversation ? (
                    <>
                        {/* Deployment Header */}
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
                                <Avatar className="h-10 w-10 rounded-xl ring-2 ring-primary-50 dark:ring-primary-900/10">
                                    <AvatarImage src={getChatPartner(activeConversation).avatar} className="object-cover" />
                                    <AvatarFallback className="bg-primary-50 text-primary-600 font-black text-xs uppercase">
                                        {getChatPartner(activeConversation)?.name?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1.5 flex items-center gap-2">
                                        {getChatPartner(activeConversation).name}
                                        <Shield size={12} className="text-primary-500 fill-current opacity-20" />
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <div className="size-1.5 rounded-full bg-emerald-500" />
                                        <p className="text-[8px] text-emerald-600 font-black uppercase tracking-[0.2em] leading-none">
                                            SECURE_NODE_ACTIVE
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="size-9 rounded-xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                    <Phone size={16} />
                                </Button>
                                <Button variant="ghost" size="icon" className="size-9 rounded-xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                    <Video size={16} />
                                </Button>
                                <div className="w-px h-4 bg-slate-100 dark:bg-slate-800 mx-1" />
                                <Button variant="ghost" size="icon" className="size-9 rounded-xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                    <MoreVertical size={16} />
                                </Button>
                            </div>
                        </div>

                        {/* Tactical Message Repository */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 no-scrollbar scroll-smooth" ref={scrollRef}>
                            <div className="space-y-8">
                                <div className="flex justify-center">
                                    <span className="px-4 py-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-xl text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 shadow-xl shadow-slate-200/20 dark:shadow-none border border-slate-50 dark:border-slate-700">
                                        LOG_INITIALIZED: {format(new Date(), 'dd_MMM_yyyy').toUpperCase()}
                                    </span>
                                </div>

                                <AnimatePresence mode="popLayout">
                                    {messages.map((msg) => {
                                        const senderId = msg.senderId?._id || msg.senderId;
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
                                                            "text-[7px] font-bold text-white uppercase tracking-widest px-1.5 py-0.5 rounded",
                                                            isMe ? "bg-slate-500" : "bg-primary-600"
                                                        )}>
                                                            {isMe ? 'OPERATOR' : (msg.senderId?.role || 'EMPLOYEE').toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className={cn(
                                                        "px-4 py-3 rounded-2xl text-[13px] font-bold shadow-xl transition-all duration-300 relative",
                                                        isMe
                                                            ? "bg-primary-600 text-white rounded-tr-none shadow-primary-500/10 hover:shadow-primary-500/20"
                                                            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none border border-slate-50 dark:border-slate-700 shadow-slate-200/30 dark:shadow-none"
                                                    )}>
                                                        {msg.text}
                                                        <div className={cn(
                                                            "absolute -bottom-1 h-3 w-4 transition-colors",
                                                            isMe ? "right-0 bg-primary-600 rounded-bl-full" : "left-0 bg-white dark:bg-slate-800 border-l border-slate-50 dark:border-slate-700 rounded-br-full"
                                                        )} />
                                                    </div>
                                                    <div className={cn("flex items-center gap-2 px-1", isMe ? "justify-end" : "justify-start")}>
                                                        {isMe && <CheckCheck size={12} className="text-primary-500 group-hover:scale-110 transition-transform" />}
                                                        <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest opacity-60">
                                                            T: {format(new Date(msg.createdAt), 'HH:mm:ss')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Command Interface Input */}
                        <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800 z-10">
                            <form
                                onSubmit={handleSendMessage}
                                className="relative flex items-center gap-3"
                            >
                                <div className="flex-1 relative group bg-slate-50 dark:bg-slate-800/30 rounded-[1.5rem] transition-all focus-within:ring-2 focus-within:ring-primary-500/20">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                        <Terminal size={16} className="text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                                    </div>
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="INPUT SECURE COMMAND..."
                                        className="h-14 pl-16 pr-14 bg-transparent border-none font-black text-[11px] uppercase tracking-[0.1em] placeholder:text-slate-300 placeholder:italic transition-all shadow-none"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="h-14 w-14 rounded-[1.5rem] bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xl hover:bg-primary-600 hover:text-white transition-all flex items-center justify-center p-0 flex-shrink-0 active:scale-90"
                                >
                                    <Send size={20} className="ml-0.5 mt-0.5" />
                                </Button>
                            </form>
                            <div className="mt-3 px-2 flex items-center justify-between text-[7px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                <div className="flex items-center gap-1">
                                    <Cpu size={10} /> CRYPTO_ENGINE_V4.2_ONLINE
                                </div>
                                <div>SIGNAL_STRENGTH: 98%</div>
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
                            <div className="absolute inset-0 bg-primary-500/20 blur-[60px] rounded-full animate-pulse" />
                            <div className="w-28 h-28 bg-white dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center text-primary-600 mx-auto relative shadow-2xl border border-slate-50 dark:border-slate-700">
                                <MessageSquare size={48} strokeWidth={2.5} className="fill-primary-500/10" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 size-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-white dark:ring-slate-900">
                                <Zap size={18} className="fill-current" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Neural <span className="text-primary-600">Sync_Node</span></h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-[280px] mx-auto italic">
                                Initialize high-priority encrypted uplink to begin tactical command coordination.
                            </p>
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                            <div className="size-2 rounded-full bg-slate-300 animate-ping" />
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Awaiting Link Initialization...</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ManagerChat;
