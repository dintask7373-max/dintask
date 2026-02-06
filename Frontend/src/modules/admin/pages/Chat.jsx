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
    Info,
    CheckCheck,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/shared/utils/cn';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';

import useAuthStore from '@/store/authStore';
import useEmployeeStore from '@/store/employeeStore';
import useChatStore from '@/store/chatStore';

const AdminChat = () => {
    const { user: currentUser } = useAuthStore();
    const { employees } = useEmployeeStore();
    const { messages, sendMessage } = useChatStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [activeChatId, setActiveChatId] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef(null);

    // Filter employees in the same workspace (or all for now as it's a demo)
    const availablePartners = useMemo(() => {
        // Admins can chat with everyone for now, or filter by their workspace
        return employees.filter(e => e.id !== currentUser?.id);
    }, [employees, currentUser]);

    // Get unique conversation partners
    const chatPartners = useMemo(() => {
        const partners = new Set();
        messages.forEach(msg => {
            if (msg.senderId === currentUser?.id) partners.add(msg.receiverId);
            if (msg.receiverId === currentUser?.id) partners.add(msg.senderId);
        });

        // Current active chats + all available partners (filtered by search)
        const combinedPartners = Array.from(new Set([...Array.from(partners), ...availablePartners.map(p => p.id)]));

        return combinedPartners.map(id => {
            const member = employees.find(e => e.id === id);
            if (!member) return null;

            const lastMsg = messages
                .filter(m => (m.senderId === id && m.receiverId === currentUser?.id) || (m.senderId === currentUser?.id && m.receiverId === id))
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

            return {
                ...member,
                lastMessage: lastMsg?.text || 'No messages yet',
                lastMessageTime: lastMsg?.timestamp || null,
            };
        }).filter(Boolean).filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [messages, availablePartners, employees, currentUser, searchTerm]);

    const activePartner = useMemo(() => {
        return chatPartners.find(p => p.id === activeChatId);
    }, [chatPartners, activeChatId]);

    const activeMessages = useMemo(() => {
        if (!activeChatId) return [];
        return messages.filter(msg =>
            (msg.senderId === currentUser?.id && msg.receiverId === activeChatId) ||
            (msg.senderId === activeChatId && msg.receiverId === currentUser?.id)
        ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }, [messages, activeChatId, currentUser]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activeMessages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChatId) return;

        sendMessage(currentUser.id, activeChatId, newMessage);
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] lg:h-[calc(100vh-120px)] bg-white dark:bg-slate-900 rounded-2xl lg:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className={cn(
                    "w-full lg:w-72 xl:w-80 flex-shrink-0 border-r border-slate-100 dark:border-slate-800 flex flex-col transition-all",
                    activeChatId ? "hidden lg:flex" : "flex"
                )}>
                    <div className="p-4 lg:p-6 border-b border-slate-50 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="lg:hidden w-8 h-8 rounded-lg overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                                <img src="/dintask-logo.png" alt="DinTask" className="h-full w-full object-cover" />
                            </div>
                            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-none uppercase tracking-tight">Messenger</h1>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <Input
                                placeholder="Search employee..."
                                className="h-9 pl-9 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-bold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="p-2 space-y-1">
                            {chatPartners.map((partner) => (
                                <button
                                    key={partner.id}
                                    onClick={() => setActiveChatId(partner.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                                        activeChatId === partner.id
                                            ? "bg-primary-50 dark:bg-primary-900/10"
                                            : "hover:bg-slate-50 dark:hover:bg-slate-800/20"
                                    )}
                                >
                                    <div className="relative">
                                        <Avatar className="h-9 w-9 ring-2 ring-white dark:ring-slate-900 shadow-sm shrink-0">
                                            <AvatarImage src={partner.avatar} />
                                            <AvatarFallback className="bg-primary-100 text-primary-700 font-black text-xs">
                                                {partner.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h3 className={cn(
                                                "text-xs font-black truncate uppercase tracking-tight",
                                                activeChatId === partner.id ? "text-primary-700 dark:text-primary-400" : "text-slate-900 dark:text-white"
                                            )}>
                                                {partner.name}
                                            </h3>
                                            {partner.lastMessageTime && (
                                                <span className="text-[9px] text-slate-400 font-black">
                                                    {format(new Date(partner.lastMessageTime), 'HH:mm')}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-400 truncate font-bold uppercase tracking-widest">
                                            {partner.lastMessage}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className={cn(
                    "flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-900/10",
                    !activeChatId ? "hidden md:flex items-center justify-center" : "flex"
                )}>
                    {activeChatId ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="lg:hidden h-8 w-8 rounded-lg"
                                        onClick={() => setActiveChatId(null)}
                                    >
                                        <ArrowLeft size={18} />
                                    </Button>
                                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                                        <AvatarImage src={activePartner?.avatar} />
                                        <AvatarFallback className="bg-primary-100 text-primary-700 font-black text-xs uppercase">
                                            {activePartner?.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-none mb-1 uppercase tracking-tight">
                                            {activePartner?.name}
                                        </h2>
                                        <p className="text-[9px] text-emerald-500 font-black uppercase tracking-[0.2em]">
                                            Online
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary-600">
                                        <Phone size={16} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary-600">
                                        <Video size={16} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary-600">
                                        <MoreVertical size={16} />
                                    </Button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar" ref={scrollRef}>
                                <div className="space-y-4 sm:space-y-6">
                                    {activeMessages.map((msg) => {
                                        const isMe = msg.senderId === currentUser?.id;
                                        return (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                className={cn(
                                                    "flex w-full",
                                                    isMe ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                <div className={cn(
                                                    "max-w-[85%] sm:max-w-[70%] space-y-1",
                                                    isMe ? "items-end" : "items-start"
                                                )}>
                                                    <div className={cn(
                                                        "px-4 py-2 sm:px-5 sm:py-3 rounded-2xl group relative",
                                                        isMe
                                                            ? "bg-primary-600 text-white rounded-tr-none shadow-md shadow-primary-500/10"
                                                            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none border border-slate-100 dark:border-slate-800"
                                                    )}>
                                                        <p className="text-[13px] sm:text-sm font-bold leading-relaxed">{msg.text}</p>
                                                    </div>
                                                    <div className={cn("flex items-center gap-1.5 px-1", isMe ? "justify-end" : "justify-start")}>
                                                        <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">
                                                            {format(new Date(msg.timestamp), 'HH:mm')}
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
                                <form
                                    onSubmit={handleSendMessage}
                                    className="relative flex items-center gap-2 sm:gap-3"
                                >
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type official message..."
                                        className="h-11 sm:h-14 pl-5 sm:pl-6 pr-12 sm:pr-14 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl sm:rounded-3xl focus:ring-2 focus:ring-primary/10 text-xs sm:text-sm font-bold placeholder:text-slate-300 transition-all shadow-inner"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="h-11 w-11 sm:h-14 sm:w-14 rounded-2xl sm:rounded-3xl bg-primary-600 text-white shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 active:scale-95 transition-all flex items-center justify-center p-0 shrink-0"
                                    >
                                        <Send size={18} className="sm:size-[22px] ml-0.5" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="text-center space-y-4 max-w-sm px-10">
                            <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary mx-auto mb-6 shadow-inner">
                                <MessageSquare size={44} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Admin Messenger</h2>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                Connect directly with any employee in your organization. Send updates, queries or feedback instantly.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminChat;
