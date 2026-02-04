import React, { useMemo, useState } from 'react';
import {
    Users,
    Search,
    Mail,
    Phone,
    MapPin,
    Calendar as CalendarIcon,
    MoreVertical,
    MessageSquare,
    CheckSquare,
    Clock,
    TrendingUp,
    Shield,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import useEmployeeStore from '@/store/employeeStore';
import useTaskStore from '@/store/taskStore';
import { fadeInUp, staggerContainer } from '@/shared/utils/animations';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { cn } from '@/shared/utils/cn';

import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import useNotificationStore from '@/store/notificationStore';
import useChatStore from '@/store/chatStore';

const TeamManagement = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const employees = useEmployeeStore(state => state.employees);
    const tasks = useTaskStore(state => state.tasks);
    const [searchTerm, setSearchTerm] = useState('');
    const addNotification = useNotificationStore(state => state.addNotification);

    const teamMembers = useMemo(() => {
        return employees.filter(e =>
            e.managerId === user?.id &&
            e.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, user, searchTerm]);

    const stats = useMemo(() => {
        const active = teamMembers.filter(e => e.status === 'active').length;
        return [
            { label: 'Total Force', value: teamMembers.length, color: 'primary' },
            { label: 'Units Online', value: active, color: 'emerald' },
            { label: 'Idle Units', value: teamMembers.length - active, color: 'amber' }
        ];
    }, [teamMembers]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-emerald-500';
            case 'away': return 'bg-amber-500';
            case 'offline': return 'bg-slate-300';
            default: return 'bg-slate-300';
        }
    };
    const [selectedMember, setSelectedMember] = useState(null);
    const [messageContent, setMessageContent] = useState("");
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

    const handleOpenMessageModal = (member) => {
        setSelectedMember(member);
        setMessageContent("");
        setIsMessageModalOpen(true);
    };

    const sendMessage = useChatStore(state => state.sendMessage);

    const handleSendMessage = () => {
        if (!messageContent.trim()) {
            toast.error("Please enter a message");
            return;
        }

        sendMessage(user.id, selectedMember.id, messageContent);

        addNotification({
            title: `Message from ${user?.name || 'Manager'}`,
            description: messageContent,
            category: 'message',
            recipientId: selectedMember?.id
        });

        toast.success(`Message sent to ${selectedMember.name}`);
        setIsMessageModalOpen(false);
        navigate('/manager/chat');
    };

    return (
        <div className="space-y-4 sm:space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-3">
                    <div className="lg:hidden size-9 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                        <img src="/src/assets/logo.png" alt="DinTask" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                            Team <span className="text-primary-600">Assets</span>
                        </h1>
                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-1 leading-none">
                            Force Deployment Hub
                        </p>
                    </div>
                </div>
            </div>

            {/* Tactical Summary bar */}
            <div className="grid grid-cols-3 gap-3">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                        <CardContent className="p-3 sm:p-4">
                            <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                            <p className={cn("text-lg sm:text-xl font-black leading-none",
                                stat.color === 'primary' ? 'text-primary-600' :
                                    stat.color === 'emerald' ? 'text-emerald-600' : 'text-amber-600'
                            )}>{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filter Section */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <Input
                    placeholder="Search personnel by identifier..."
                    className="pl-11 h-11 bg-white dark:bg-slate-900 border-none shadow-xl shadow-slate-200/20 dark:shadow-none rounded-2xl font-bold text-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Team Grid - Responsive Density */}
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            >
                <AnimatePresence mode="popLayout">
                    {teamMembers.length > 0 ? teamMembers.map((member) => {
                        const memberTasks = tasks.filter(t => t.assignedTo?.includes(member.id));
                        const activeTasks = memberTasks.filter(t => t.status !== 'completed').length;
                        const completedTasks = memberTasks.filter(t => t.status === 'completed').length;

                        return (
                            <motion.div key={member.id} variants={fadeInUp} layout>
                                <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden group hover:scale-[1.01] transition-all">
                                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                                    <CardContent className="p-5 sm:p-6">
                                        <div className="flex items-start justify-between mb-5">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <Avatar className="h-14 w-14 rounded-2xl border-2 border-white dark:border-slate-800 shadow-sm">
                                                        <AvatarImage src={member.avatar} />
                                                        <AvatarFallback className="bg-primary-50 text-primary-600 font-black text-xl">
                                                            {member.name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className={cn(
                                                        "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900",
                                                        getStatusColor(member.status)
                                                    )} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm leading-none mb-1">
                                                        {member.name}
                                                    </h3>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">{member.role}</p>
                                                    <Badge variant="outline" className="mt-2 text-[8px] font-black uppercase tracking-widest px-1.5 h-4 border-slate-200">
                                                        {member.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="size-8 rounded-xl text-slate-300 hover:text-primary-600">
                                                <Zap size={16} />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-5">
                                            <div className="p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Operational</p>
                                                <p className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{activeTasks}</p>
                                            </div>
                                            <div className="p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Fulfilled</p>
                                                <p className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{completedTasks}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-6 text-left">
                                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase">
                                                <Mail size={12} className="text-slate-300 shrink-0" />
                                                <span className="truncate">{member.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase">
                                                <Shield size={12} className="text-primary-400 shrink-0" />
                                                <span>Workload Status: <span className={cn(activeTasks > 5 ? 'text-red-500' : 'text-emerald-500')}>{activeTasks > 5 ? 'Critical' : 'Balanced'}</span></span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-9 rounded-xl gap-2 font-black text-[9px] uppercase tracking-[0.1em] border-slate-200"
                                                onClick={() => handleOpenMessageModal(member)}
                                            >
                                                <MessageSquare size={14} className="text-primary-500" /> Link
                                            </Button>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="h-9 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 gap-2 font-black text-[9px] uppercase tracking-[0.1em] text-white"
                                                onClick={() => navigate('/manager/progress')}
                                            >
                                                <TrendingUp size={14} className="text-primary-500" /> Trace
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    }) : (
                        <div className="col-span-full py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
                            <div className="size-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <Users size={32} className="text-slate-200" />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Zero Assets Detected</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1 italic">Recalibrate frequency search</p>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Message Modal - Premium */}
            <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
                <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden font-sans">
                    <div className="bg-primary-600 p-6 text-white">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Establish Neural Link</DialogTitle>
                        <p className="text-[9px] font-black text-primary-100 uppercase tracking-[0.2em] mt-1 italic italic">Direct communication with: {selectedMember?.name}</p>
                    </div>
                    <div className="p-6 space-y-4 bg-white dark:bg-slate-900">
                        <div className="space-y-1.5">
                            <Label htmlFor="message" className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Message Payload</Label>
                            <Textarea
                                id="message"
                                placeholder="Input tactical directives..."
                                className="bg-slate-50 border-none rounded-xl font-medium text-sm min-h-[120px] p-4"
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                            />
                        </div>
                        <DialogFooter className="pt-2 flex gap-3">
                            <Button variant="ghost" onClick={() => setIsMessageModalOpen(false)} className="flex-1 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest">Abort</Button>
                            <Button onClick={handleSendMessage} className="flex-1 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest bg-primary-600 hover:bg-primary-700 text-white shadow-lg">Transmit</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TeamManagement;
