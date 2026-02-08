import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle2, AlertCircle, Building2, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

const ChatSupport = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! How can I assist you with DinTask today?", sender: 'support', time: '10:00 AM' }
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const userMsg = {
            id: Date.now(),
            text: newMessage,
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMsg]);
        setNewMessage('');

        setTimeout(() => {
            const supportMsg = {
                id: Date.now() + 1,
                text: "Thank you for reaching out. An agent will be with you shortly. Your expected wait time is 2 minutes.",
                sender: 'support',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, supportMsg]);
        }, 1500);
    };

    return (
        <div className="min-h-screen w-full bg-white dark:bg-slate-950 relative flex flex-col items-center justify-start font-sans overflow-x-hidden">
            {/* Enhanced Background Visibility (Identical to Join Page) */}
            <div className="absolute inset-0 h-[420px] z-0 overflow-hidden">
                <img
                    src="/WLCOMPAGE .png"
                    alt="Background"
                    className="w-full h-full object-cover object-center opacity-70 dark:opacity-30 translate-y-[-10%]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-white dark:from-slate-950/40 dark:via-slate-950/80 dark:to-slate-950" />
            </div>

            {/* Support Content Container - Matches Join Page max-width and margin */}
            <div className="w-full max-w-[440px] mt-16 px-4 relative z-10 pb-20">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] p-10 md:p-12 border border-white dark:border-slate-800">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight mb-2">Chat Support</h1>
                        <div className="flex items-center justify-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            <p className="text-slate-400 text-xs font-medium italic">Support agent is online</p>
                        </div>
                    </div>

                    {/* Chat Area - Integrated into the card like the form */}
                    <div className="space-y-6">
                        <div className="h-[300px] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                            <AnimatePresence>
                                {messages.map((msg) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={msg.id}
                                        className={cn("flex", msg.sender === 'user' ? "justify-end" : "justify-start")}
                                    >
                                        <div
                                            className={cn(
                                                "max-w-[85%] rounded-2xl px-4 py-3 text-[12px] font-bold leading-relaxed",
                                                msg.sender === 'user'
                                                    ? "bg-[#4461f2] text-white rounded-tr-none shadow-lg shadow-[#4461f2]/20"
                                                    : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700/50 rounded-tl-none shadow-sm"
                                            )}
                                        >
                                            <p>{msg.text}</p>
                                            <p className={cn(
                                                "text-[8px] mt-1.5 font-black uppercase tracking-wider italic",
                                                msg.sender === 'user' ? "text-white/60" : "text-slate-400"
                                            )}>
                                                {msg.time}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Input Area - Matches Join Page Input style */}
                        <form onSubmit={handleSendMessage} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                            <div className="relative group">
                                <Input
                                    placeholder="Type your message..."
                                    className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white font-bold text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-[#4461f2]/10 transition-all duration-200 pr-12"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <Button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg bg-[#4461f2] hover:bg-[#3451e2] text-white shadow-lg shadow-[#4461f2]/20 transition-all active:scale-95 flex items-center justify-center p-0"
                                >
                                    <Send size={18} />
                                </Button>
                            </div>
                        </form>

                        <div className="text-center mt-8">
                            <button
                                onClick={() => navigate(-1)}
                                className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-[#4461f2] transition-colors"
                            >
                                Close Chat
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center space-y-2 opacity-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        DinTask Secure Protocol
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatSupport;
