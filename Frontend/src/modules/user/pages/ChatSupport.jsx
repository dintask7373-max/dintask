import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { motion } from 'framer-motion';

const ChatSupport = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! How can I assist you with DinTask today?", sender: 'support', time: '10:00 AM' }
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Add user message
        const userMsg = { id: Date.now(), text: newMessage, sender: 'user', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages(prev => [...prev, userMsg]);
        setNewMessage('');

        // Simulate support response
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
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col">
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                <MessageCircle size={16} />
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                        </div>
                        <div>
                            <h2 className="text-sm font-bold">DinTask Support</h2>
                            <p className="text-[10px] text-green-500 font-medium">Online</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
                {messages.map((msg) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[75%] rounded-2xl p-3 text-sm ${msg.sender === 'user'
                                    ? 'bg-primary-600 text-white rounded-tr-none'
                                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm rounded-tl-none'
                                }`}
                        >
                            <p>{msg.text}</p>
                            <p className={`text-[9px] mt-1 text-right ${msg.sender === 'user' ? 'text-primary-200' : 'text-slate-400'}`}>
                                {msg.time}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-primary-500"
                    />
                    <Button type="submit" size="icon" className="rounded-xl bg-primary-600 hover:bg-primary-700">
                        <Send size={18} />
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ChatSupport;
