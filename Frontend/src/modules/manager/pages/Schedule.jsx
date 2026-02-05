import React, { useState, useMemo } from 'react';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    Users,
    Search,
    Filter,
    Zap,
    Target,
    Layers,
    Shield,
    Trash2,
    Video
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import useEmployeeStore from '@/store/employeeStore';
import useTaskStore from '@/store/taskStore';
import useScheduleStore from '@/store/scheduleStore';
import { fadeInUp, staggerContainer } from '@/shared/utils/animations';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils/cn';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Calendar } from "@/shared/components/ui/calendar";
import { toast } from "sonner";

const ManagerSchedule = () => {
    const { user } = useAuthStore();
    const employees = useEmployeeStore(state => state.employees);
    const tasks = useTaskStore(state => state.tasks);
    const { schedules, addScheduleEvent, deleteScheduleEvent } = useScheduleStore();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedMember, setSelectedMember] = useState('all');

    // Modal States
    const [isAddEventOpen, setIsAddEventOpen] = useState(false);
    const [isViewEventOpen, setIsViewEventOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Form State
    const [newEventData, setNewEventData] = useState({
        title: '',
        description: '',
        date: new Date(),
        time: '09:00',
        type: 'meeting',
        participants: []
    });

    const teamMembers = useMemo(() => {
        return employees.filter(e => e.managerId === user?.id);
    }, [employees, user]);

    // Calendar logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const getDailyEvents = (day) => {
        const teamTasks = tasks.filter(t => (t.delegatedBy === user?.id || t.assignedToManager === user?.id) && isSameDay(new Date(t.deadline), day));
        const userSchedules = schedules.filter(s => (s.managerId === user?.id) && isSameDay(new Date(s.date), day));
        const taskEvents = teamTasks.map(t => ({ ...t, type: 'task', date: t.deadline }));
        const scheduleEvents = userSchedules.map(s => ({ ...s, type: s.type || 'schedule', date: s.date }));
        return [...taskEvents, ...scheduleEvents];
    };

    const handleCreateEvent = () => {
        if (!newEventData.title || !newEventData.date) {
            toast.error("Parameters missing");
            return;
        }

        const event = { ...newEventData, managerId: user?.id, date: newEventData.date.toISOString() };
        addScheduleEvent(event);
        toast.success("Timeline synchronized");
        setIsAddEventOpen(false);
        setNewEventData({ title: '', description: '', date: new Date(), time: '09:00', type: 'meeting', participants: [] });
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setIsViewEventOpen(true);
    };

    const handleDeleteEvent = () => {
        if (selectedEvent?.type === 'task') {
            toast.error("Directive deletion restricted");
            return;
        }
        deleteScheduleEvent(selectedEvent.id);
        toast.success("Event purged");
        setIsViewEventOpen(false);
    };

    return (
        <div className="space-y-4 sm:space-y-6 pb-12 transition-all duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-3">
                    <div className="lg:hidden size-9 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                        <img src="/src/assets/dintask_logo_-removebg-preview.png" alt="DinTask" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                            Sync <span className="text-primary-600">Timeline</span>
                        </h1>
                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-1 leading-none">
                            Operational flow coordination
                        </p>
                    </div>
                </div>
                <Button className="h-9 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20 text-white gap-2" onClick={() => setIsAddEventOpen(true)}>
                    <Plus size={14} /> NEW ENTRY
                </Button>
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-4">
                {/* Tactical Sidebar */}
                <div className="space-y-4">
                    <Card className="border-none shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                        <CardHeader className="py-4 px-6 border-b border-slate-50 dark:border-slate-800">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Force Filter</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-1.5">
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-3 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all",
                                    selectedMember === 'all' ? "bg-primary-50 text-primary-600" : "text-slate-400"
                                )}
                                onClick={() => setSelectedMember('all')}
                            >
                                <Users size={14} /> ALL FORCE
                            </Button>
                            {teamMembers.map((member) => (
                                <Button
                                    key={member.id}
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start gap-3 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all",
                                        selectedMember === member.id ? "bg-primary-50 text-primary-600" : "text-slate-400"
                                    )}
                                    onClick={() => setSelectedMember(member.id)}
                                >
                                    <div className="size-5 rounded-lg overflow-hidden shrink-0">
                                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="truncate">{member.name}</span>
                                </Button>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-primary-500/10 bg-primary-600 text-white rounded-[2rem] overflow-hidden group">
                        <CardContent className="p-6 space-y-4">
                            <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center animate-pulse">
                                <Video size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-xs uppercase tracking-widest mb-1.5">Daily Force Brief</h3>
                                <p className="text-[10px] font-bold text-primary-100 uppercase tracking-tight italic">Team synchronization active at 1000 HRS.</p>
                            </div>
                            <Button className="w-full h-9 rounded-xl font-black text-[9px] uppercase tracking-widest bg-white text-primary-600 hover:bg-slate-50 transition-colors">INITIALIZE LINK</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Tactical Calendar Node */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 px-5 rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-none">
                        <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <div className="flex items-center gap-1.5">
                            <Button variant="ghost" size="icon" className="size-8 rounded-lg text-slate-400" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                                <ChevronLeft size={16} />
                            </Button>
                            <Button variant="ghost" className="h-8 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-primary-600" onClick={() => setCurrentDate(new Date())}>NOW</Button>
                            <Button variant="ghost" size="icon" className="size-8 rounded-lg text-slate-400" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>

                    <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                        <div className="grid grid-cols-7 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                                <div key={day} className="p-3 text-center text-[9px] font-black text-slate-400 tracking-[0.2em]">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7">
                            {calendarDays.map((day, idx) => {
                                const events = getDailyEvents(day);
                                return (
                                    <div
                                        key={day.toString()}
                                        className={cn(
                                            "min-h-[100px] sm:min-h-[130px] p-2 border-r border-b border-slate-50 dark:border-slate-800 last:border-r-0 transition-all",
                                            !isSameMonth(day, monthStart) ? "bg-slate-50/10 dark:bg-slate-800/5 opacity-20" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30",
                                            isSameDay(day, new Date()) && "bg-primary-50/30 dark:bg-primary-900/10"
                                        )}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className={cn(
                                                "size-5 sm:size-6 flex items-center justify-center rounded-lg text-[10px] font-black transition-all",
                                                isSameDay(day, new Date()) ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30" : "text-slate-400"
                                            )}>
                                                {format(day, 'd')}
                                            </span>
                                            {events.length > 0 && (
                                                <div className="size-1.5 rounded-full bg-primary-600 animate-pulse hidden sm:block" />
                                            )}
                                        </div>
                                        <div className="space-y-1 overflow-hidden">
                                            {events.slice(0, 3).map((event, eIdx) => (
                                                <button
                                                    key={eIdx}
                                                    onClick={() => handleEventClick(event)}
                                                    className={cn(
                                                        "w-full text-left px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter truncate transition-all",
                                                        event.type === 'task' ? "bg-blue-50 text-blue-600" :
                                                            event.type === 'meeting' ? "bg-purple-50 text-purple-600" :
                                                                "bg-emerald-50 text-emerald-600"
                                                    )}>
                                                    {event.title}
                                                </button>
                                            ))}
                                            {events.length > 3 && (
                                                <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest pl-1 mt-1">
                                                    + {events.length - 3} MORE
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Tactical Modals */}
            <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
                    <div className="bg-slate-900 p-6 text-white border-b-4 border-primary-600">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                            <Layers className="text-primary-500" size={20} />
                            Chronos Entry
                        </DialogTitle>
                        <DialogDescription className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 italic">
                            Append timeline directive
                        </DialogDescription>
                    </div>
                    <div className="p-6 space-y-4 bg-white dark:bg-slate-900">
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Event Header</Label>
                            <Input
                                placeholder="e.g., SITE-O1 STATUS SYNC"
                                value={newEventData.title}
                                onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })}
                                className="h-10 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-black text-xs px-4"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Timeline Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"ghost"}
                                            className={cn(
                                                "w-full h-10 justify-start bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-black text-[10px] uppercase px-4",
                                                !newEventData.date && "text-slate-400"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4 text-primary-500" />
                                            {newEventData.date ? format(newEventData.date, "MMM dd").toUpperCase() : <span>SELECT</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-2xl overflow-hidden" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={newEventData.date}
                                            onSelect={(date) => setNewEventData({ ...newEventData, date: date })}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Sync Time</Label>
                                <Input
                                    type="time"
                                    value={newEventData.time}
                                    onChange={(e) => setNewEventData({ ...newEventData, time: e.target.value })}
                                    className="h-10 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-black text-xs px-4"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Type Classification</Label>
                            <Select
                                value={newEventData.type}
                                onValueChange={(value) => setNewEventData({ ...newEventData, type: value })}
                            >
                                <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-black text-[10px] uppercase px-4">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-2xl">
                                    <SelectItem value="meeting" className="text-[10px] font-black uppercase">SYNC MEETING</SelectItem>
                                    <SelectItem value="reminder" className="text-[10px] font-black uppercase">TACTICAL REMINDER</SelectItem>
                                    <SelectItem value="deadline" className="text-[10px] font-black uppercase text-red-500">HARD DEADLINE</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsAddEventOpen(false)} className="h-9 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest">CANCEL</Button>
                        <Button onClick={handleCreateEvent} className="h-9 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest bg-primary-600 text-white shadow-lg shadow-primary-500/20">CONFIRM SYNC</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Event Dialog */}
            <Dialog open={isViewEventOpen} onOpenChange={setIsViewEventOpen}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
                    <div className="bg-slate-900 p-6 text-white border-b-4 border-primary-600">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">{selectedEvent?.title}</DialogTitle>
                        <DialogDescription className="text-[9px] font-black text-primary-400 uppercase tracking-widest mt-1">
                            {selectedEvent?.date && format(new Date(selectedEvent.date), "PPP").toUpperCase()} // {selectedEvent?.time}
                        </DialogDescription>
                    </div>
                    <div className="p-6 bg-white dark:bg-slate-900 space-y-4">
                        <div className="flex items-center gap-2">
                            <Badge variant="ghost" className="bg-primary-50 text-primary-600 text-[8px] font-black uppercase tracking-widest h-5 px-2">
                                {selectedEvent?.type}
                            </Badge>
                            <div className="h-4 w-px bg-slate-100" />
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-1">
                                <Shield size={10} /> ENCRYPTED DATA
                            </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-tighter italic">
                            {selectedEvent?.description || "Directive parameters normal. No additional data provided."}
                        </p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-2">
                        {selectedEvent?.type !== 'task' && (
                            <Button variant="ghost" onClick={handleDeleteEvent} className="h-9 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest text-red-500 hover:bg-red-50">PURGE ENTRY</Button>
                        )}
                        <Button variant="ghost" onClick={() => setIsViewEventOpen(false)} className="h-9 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest">CLOSE</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManagerSchedule;
