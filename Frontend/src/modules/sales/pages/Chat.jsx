import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    Search,
    Send,
    MessageSquare,
    User,
    ArrowLeft,
    MoreVertical,
    Phone,
    Video,
    Shield,
    CheckCheck,
    Terminal,
    Zap,
    Cpu,
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/shared/utils/cn';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';

import useAuthStore from '@/store/authStore';
import useChatStore from '@/store/chatStore';
import useCRMStore from '@/store/crmStore';

const SalesChat = () => {
    const { user: currentUser, role: userRole } = useAuthStore();
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
        // targetUser could be anyone from search
        const targetModel = targetUser.role ? getModelName(targetUser.role) : 'Employee';
        await accessOrCreateChat(targetUser._id, targetModel, currentUser.workspaceId || 'global');
        setSearchTerm('');
    };

    const getChatPartner = (chat) => {
        if (!chat) return null;
        if (chat.isGroup) return { name: chat.groupName, avatar: chat.groupAvatar };
        return chat.participants.find(p => p.user._id !== currentUser?._id)?.user || { name: 'Unknown', avatar: '' };
    };

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-all duration-500">
            {/* Sales Comms Sidebar */}
            <div className={cn(
                "w-full md:w-80 flex-shrink-0 border-r border-slate-50 dark:border-slate-800 flex flex-col transition-all",
                activeConversation ? "hidden md:flex" : "flex"
            )}>
                <div className="p-5 border-b border-slate-50 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic text-emerald-600">Sales <span className="text-slate-900 dark:text-white">Uplink</span></h1>
                        <Badge variant="outline" className="text-[8px] font-black tracking-widest px-2 h-5 border-emerald-500/20 text-emerald-600">ENCRYPTED</Badge>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                    <div className="p-2.5 space-y-1">
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
                                            <AvatarFallback className="bg-emerald-50 text-emerald-600 font-black text-xs uppercase">
                                                {partner.name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-white dark:border-slate-900 rounded-lg shadow-sm" />
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
                                                    isActive ? "text-emerald-400" : "text-slate-400"
                                                )}>
                                                    {format(new Date(chat.updatedAt), 'HH:mm')}
                                                </span>
                                            )}
                                        </div>
                                        <p className={cn(
                                            "text-[9px] font-bold uppercase tracking-tighter truncate opacity-60",
                                            isActive ? "text-slate-300" : "text-slate-400 font-medium"
                                        )}>
                                            {chat.lastMessage?.text || 'WAITING_FOR_HANDSHAKE...'}
                                        </p>
                                    </div>
                                </button>
                            );
                        }) : (
                            <div className="p-8 text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">No active deal channels</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Chat Area */}
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
                                <Avatar className="h-10 w-10 rounded-xl ring-2 ring-emerald-50 dark:ring-emerald-900/10">
                                    <AvatarImage src={getChatPartner(activeConversation).avatar} className="object-cover" />
                                    <AvatarFallback className="bg-emerald-50 text-emerald-600 font-black text-xs uppercase">
                                        {getChatPartner(activeConversation)?.name?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1.5">
                                        {getChatPartner(activeConversation).name}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <div className="size-1.5 rounded-full bg-emerald-500" />
                                        <p className="text-[8px] text-emerald-600 font-black uppercase tracking-[0.2em] leading-none">
                                            ACTIVE_NEGOTIATION
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="size-9 rounded-xl text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all">
                                    <Phone size={16} />
                                </Button>
                                <Button variant="ghost" size="icon" className="size-9 rounded-xl text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all">
                                    <Video size={16} />
                                </Button>
                                <div className="w-px h-4 bg-slate-100 dark:bg-slate-800 mx-1" />
                                <Button variant="ghost" size="icon" className="size-9 rounded-xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                    <MoreVertical size={16} />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 no-scrollbar scroll-smooth" ref={scrollRef}>
                            <div className="space-y-8">
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
                                                    <div className={cn(
                                                        "px-4 py-3 rounded-2xl text-[13px] font-bold shadow-xl transition-all duration-300 relative",
                                                        isMe
                                                            ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-tr-none"
                                                            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none border border-slate-50 dark:border-slate-700"
                                                    )}>
                                                        {msg.text}
                                                    </div>
                                                    <div className={cn("flex items-center gap-2 px-1", isMe ? "justify-end" : "justify-start")}>
                                                        {isMe && <CheckCheck size={12} className="text-emerald-500" />}
                                                        <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest opacity-60">
                                                            {format(new Date(msg.createdAt), 'HH:mm')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800 z-10">
                            <form
                                onSubmit={handleSendMessage}
                                className="relative flex items-center gap-3"
                            >
                                <div className="flex-1 relative group bg-slate-50 dark:bg-slate-800/30 rounded-[1.5rem] transition-all focus-within:ring-2 focus-within:ring-emerald-500/20">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="TYPE DEAL UPDATE..."
                                        className="h-14 pl-6 pr-14 bg-transparent border-none font-black text-[11px] uppercase tracking-[0.1em] placeholder:text-slate-300 transition-all shadow-none"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="h-14 w-14 rounded-[1.5rem] bg-emerald-600 text-white shadow-2xl hover:bg-emerald-700 transition-all flex items-center justify-center p-0 flex-shrink-0 active:scale-90"
                                >
                                    <Send size={20} className="ml-0.5 mt-0.5" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-8 max-w-sm"
                    >
                        <div className="w-28 h-28 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2.5rem] flex items-center justify-center text-emerald-600 mx-auto relative shadow-2xl border border-emerald-100 dark:border-emerald-800">
                            <Briefcase size={48} className="fill-emerald-500/10" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Sales <span className="text-emerald-600">Terminal</span></h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-[280px] mx-auto italic">
                                Select a partner to open a high-priority negotiation bandwidth.
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default SalesChat;
