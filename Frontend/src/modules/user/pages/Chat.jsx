import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    Send,
    MessageSquare,
    ArrowLeft,
    Phone,
    Video,
    MoreVertical,
    CheckCheck,
    Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/shared/utils/cn';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

import useAuthStore from '@/store/authStore';
import useManagerStore from '@/store/managerStore';
import useChatStore from '@/store/chatStore';

const EmployeeChat = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();
    const { managers } = useManagerStore();
    const { messages, sendMessage } = useChatStore();
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef(null);

    // Find the manager of this employee
    // In this app, employees usually have a managerId. 
    // If not directly in currentUser, we find it from the task or assume a primary manager.
    // Let's assume the first manager for now or find the one they have messages with.

    const chatPartners = useMemo(() => {
        const partners = new Set();
        messages.forEach(msg => {
            if (msg.senderId === currentUser?.id) partners.add(msg.receiverId);
            if (msg.receiverId === currentUser?.id) partners.add(msg.senderId);
        });

        return Array.from(partners).map(id => {
            const manager = managers.find(m => m.id === id);
            if (!manager) return null;
            return manager;
        }).filter(Boolean);
    }, [messages, managers, currentUser]);

    const activePartner = chatPartners[0] || managers[0]; // Default to first manager if no chat yet
    const activeChatId = activePartner?.id;

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

    if (!activePartner) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 mb-4">
                    <MessageSquare size={32} />
                </div>
                <h2 className="text-xl font-bold">No Manager Found</h2>
                <p className="text-sm text-slate-500 max-w-xs">You don't have an assigned manager to chat with yet.</p>
                <Button variant="link" onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
            {/* Chat Header */}
            <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={activePartner?.avatar} />
                        <AvatarFallback className="bg-primary-100 text-primary-700 font-bold">
                            {activePartner?.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">
                            {activePartner?.name} (Manager)
                        </h2>
                        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">
                            Available
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary">
                        <Phone size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary">
                        <Video size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary">
                        <MoreVertical size={18} />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-slate-900/10" ref={scrollRef}>
                <div className="space-y-6">
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
                                    "max-w-[80%] space-y-1",
                                    isMe ? "items-end" : "items-start"
                                )}>
                                    <div className={cn(
                                        "px-5 py-3 rounded-[2rem] text-sm font-medium shadow-sm",
                                        isMe
                                            ? "bg-primary text-white rounded-tr-none"
                                            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none border border-slate-100 dark:border-slate-700"
                                    )}>
                                        {msg.text}
                                    </div>
                                    <div className={cn("flex items-center gap-1.5 px-2", isMe ? "justify-end" : "justify-start")}>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                                            {format(new Date(msg.timestamp), 'HH:mm')}
                                        </span>
                                        {isMe && <CheckCheck size={12} className="text-primary-500" />}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                    {activeMessages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full opacity-30 mt-20">
                            <MessageSquare size={48} className="mb-2" />
                            <p className="text-sm font-bold">No messages yet. Say hi to your manager!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Input */}
            <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <form
                    onSubmit={handleSendMessage}
                    className="relative flex items-center gap-3"
                >
                    <div className="flex-1 relative group">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message to your manager..."
                            className="h-14 pl-6 pr-14 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-primary/20 text-sm font-medium placeholder:text-slate-300 transition-all shadow-inner"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-primary"
                            >
                                <Clock size={18} />
                            </Button>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="h-14 w-14 rounded-3xl bg-primary text-white shadow-xl shadow-primary/30 hover:shadow-primary/40 active:scale-95 transition-all flex items-center justify-center p-0 flex-shrink-0"
                    >
                        <Send size={22} className="ml-1" />
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default EmployeeChat;
