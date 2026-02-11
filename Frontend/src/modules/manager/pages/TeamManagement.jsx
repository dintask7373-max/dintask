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
import useTeamStore from '@/store/teamStore';
import useManagerStore from '@/store/managerStore';
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
    const { teams, fetchTeams, createTeam, deleteTeam } = useTeamStore();
    const [searchTerm, setSearchTerm] = useState('');
    const addNotification = useNotificationStore(state => state.addNotification);
    const [viewMode, setViewMode] = useState('assets'); // 'assets' or 'teams'

    React.useEffect(() => {
        fetchTeams();
        useEmployeeStore.getState().fetchEmployees();
    }, []);

    const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

    const teamMembers = useMemo(() => {
        const userId = user?._id || user?.id;
        const userAdminId = user?.adminId?._id || user?.adminId;
        return employees.filter(e => {
            const empAdminId = e.adminId?._id || e.adminId;
            const empManagerId = e.managerId?._id || e.managerId;
            return e.role === 'employee' &&
                (empManagerId === userId || empAdminId === userAdminId) &&
                e.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
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

    const handleCreateTeam = async () => {
        if (!newTeamName.trim()) {
            toast.error("Please enter a team name");
            return;
        }
        if (selectedMembers.length === 0) {
            toast.error("Please select at least one member");
            return;
        }

        await createTeam({
            name: newTeamName,
            members: selectedMembers,
            description: `Force Team: ${newTeamName}`
        });

        setIsCreateTeamOpen(false);
        setNewTeamName('');
        setSelectedMembers([]);
    };

    const toggleMemberSelection = (memberId) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    return (
        <div className="space-y-4 sm:space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-3">
                    <div className="lg:hidden size-9 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                        <img src="/dintask-logo.png" alt="DinTask" className="h-full w-full object-cover" />
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
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            "h-9 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all",
                            viewMode === 'assets' ? "bg-slate-900 text-white border-transparent" : "border-slate-200"
                        )}
                        onClick={() => setViewMode('assets')}
                    >
                        Assets
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            "h-9 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all",
                            viewMode === 'teams' ? "bg-slate-900 text-white border-transparent" : "border-slate-200"
                        )}
                        onClick={() => setViewMode('teams')}
                    >
                        Teams
                    </Button>
                    <Button
                        size="sm"
                        className="h-9 rounded-xl bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20 font-black text-[9px] uppercase tracking-widest text-white ml-2"
                        onClick={() => setIsCreateTeamOpen(true)}
                    >
                        <Users size={14} className="mr-2" />
                        Create Team
                    </Button>
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

            {/* Content Display */}
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            >
                <AnimatePresence mode="popLayout">
                    {viewMode === 'assets' ? (
                        teamMembers.length > 0 ? teamMembers.map((member) => {
                            const memberTasks = tasks.filter(t => t.assignedTo?.includes(member.id));
                            const activeTasks = memberTasks.filter(t => t.status !== 'completed').length;
                            const completedTasks = memberTasks.filter(t => t.status === 'completed').length;

                            return (
                                <motion.div key={member._id || member.id} variants={fadeInUp} layout>
                                    <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden group hover:scale-[1.01] transition-all">
                                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                                        <CardContent className="p-5 sm:p-6">
                                            <div className="flex items-start justify-between mb-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <Avatar className="h-14 w-14 rounded-2xl border-2 border-white dark:border-slate-800 shadow-sm">
                                                            <AvatarImage src={member.avatar || member.profileImage} />
                                                            <AvatarFallback className="bg-primary-50 text-primary-600 font-black text-xl">
                                                                {member?.name?.charAt(0) || '?'}
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
                        )
                    ) : (
                        /* Teams View */
                        teams.length > 0 ? teams.map((team) => (
                            <motion.div key={team._id} variants={fadeInUp} layout>
                                <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden group hover:scale-[1.01] transition-all">
                                    <div className="h-1.5 bg-primary-500" />
                                    <CardContent className="p-5 sm:p-6">
                                        <div className="flex items-start justify-between mb-5">
                                            <div>
                                                <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm leading-none mb-1">
                                                    {team.name}
                                                </h3>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mt-1">
                                                    {team.members?.length || 0} Force Units
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 rounded-xl text-slate-300 hover:text-red-600"
                                                onClick={() => {
                                                    if (confirm('Delete this team?')) deleteTeam(team._id);
                                                }}
                                            >
                                                <MoreVertical size={16} />
                                            </Button>
                                        </div>

                                        <div className="flex -space-x-2 mb-6 overflow-hidden">
                                            {team.members?.slice(0, 5).map((member, i) => (
                                                <Avatar key={i} className="inline-block h-8 w-8 rounded-lg border-2 border-white dark:border-slate-900">
                                                    <AvatarImage src={member?.profileImage || member?.avatar} />
                                                    <AvatarFallback className="bg-slate-100 text-[10px] font-black uppercase text-slate-600">
                                                        {member?.name?.charAt(0) || '?'}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ))}
                                            {(team.members?.length || 0) > 5 && (
                                                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border-2 border-white dark:border-slate-900 bg-slate-900 text-[10px] font-black text-white">
                                                    +{team.members.length - 5}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-9 rounded-xl gap-2 font-black text-[9px] uppercase tracking-[0.1em] border-slate-200"
                                                onClick={() => navigate('/manager/progress')}
                                            >
                                                Tactical View
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
                                <div className="size-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
                                    <Shield size={32} className="text-slate-200" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Zero Teams Formed</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1 italic">Initialize force structures</p>
                            </div>
                        )
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Create Team Modal */}
            <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
                <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden font-sans">
                    <div className="bg-primary-600 p-6 text-white">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Form Tactical Team</DialogTitle>
                        <DialogDescription className="text-[9px] font-black text-primary-100 uppercase tracking-[0.2em] mt-1 italic">Identify and group specialized units for deployment</DialogDescription>
                    </div>
                    <div className="p-6 space-y-4 bg-white dark:bg-slate-900">
                        <div className="space-y-1.5">
                            <Label htmlFor="teamName" className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Team Designation (Name)</Label>
                            <Input
                                id="teamName"
                                placeholder="Enter team identifier..."
                                className="bg-slate-50 border-none rounded-xl font-bold text-sm"
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Available Units</Label>
                            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                                {employees.filter(e => {
                                    const userId = user?._id || user?.id;
                                    const userAdminId = user?.adminId?._id || user?.adminId;
                                    const empAdminId = e.adminId?._id || e.adminId;
                                    const empManagerId = e.managerId?._id || e.managerId;
                                    return e.role === 'employee' && e.status === 'active' && (empManagerId === userId || empAdminId === userAdminId);
                                }).length > 0 ?
                                    employees.filter(e => {
                                        const userId = user?._id || user?.id;
                                        const userAdminId = user?.adminId?._id || user?.adminId;
                                        const empAdminId = e.adminId?._id || e.adminId;
                                        const empManagerId = e.managerId?._id || e.managerId;
                                        return e.role === 'employee' && e.status === 'active' && (empManagerId === userId || empAdminId === userAdminId);
                                    }).map((member) => (
                                        <div
                                            key={member._id || member.id}
                                            className={cn(
                                                "flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer",
                                                selectedMembers.includes(member._id || member.id)
                                                    ? "border-primary-500 bg-primary-50/30"
                                                    : "border-slate-100 hover:border-slate-200"
                                            )}
                                            onClick={() => toggleMemberSelection(member._id || member.id)}
                                        >
                                            <Avatar className="h-8 w-8 rounded-lg">
                                                <AvatarImage src={member.avatar || member.profileImage} />
                                                <AvatarFallback className="bg-slate-100 text-[10px] font-black">
                                                    {member?.name?.charAt(0) || '?'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white leading-none">{member.name}</p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{member.role}</p>
                                            </div>
                                            <div className={cn(
                                                "size-4 rounded-full border-2 flex items-center justify-center transition-all",
                                                selectedMembers.includes(member._id || member.id)
                                                    ? "border-primary-600 bg-primary-600"
                                                    : "border-slate-200"
                                            )}>
                                                {selectedMembers.includes(member._id || member.id) && <CheckSquare className="text-white" size={10} />}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-4 text-[10px] font-bold text-slate-400 uppercase">No personnel detected in sector</div>
                                    )}
                            </div>
                        </div>
                        <DialogFooter className="pt-2 flex gap-3">
                            <Button variant="ghost" onClick={() => setIsCreateTeamOpen(false)} className="flex-1 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest">Abort</Button>
                            <Button
                                onClick={handleCreateTeam}
                                className="flex-1 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest bg-primary-600 hover:bg-primary-700 text-white shadow-lg"
                            >
                                Forge Team
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Message Modal - Premium */}
            <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
                <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden font-sans">
                    <div className="bg-primary-600 p-6 text-white">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Establish Neural Link</DialogTitle>
                        <DialogDescription className="text-[9px] font-black text-primary-100 uppercase tracking-[0.2em] mt-1 italic">Direct communication with unit: {selectedMember?.name}</DialogDescription>
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
