import React, { useState, useMemo } from 'react';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    Search,
    Filter,
    Phone,
    Video,
    Briefcase,
    CheckSquare,
    Users
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import useAuthStore from '@/store/authStore';
import useTaskStore from '@/store/taskStore';
import useScheduleStore from '@/store/scheduleStore';
import useCRMStore from '@/store/crmStore';
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
    DialogTrigger,
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

const SalesSchedule = () => {
    const { user } = useAuthStore();
    const { tasks } = useTaskStore();
    const { schedules, addScheduleEvent, deleteScheduleEvent } = useScheduleStore();
    const { followUps, leads } = useCRMStore();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedFilter, setSelectedFilter] = useState('all');

    const [isAddEventOpen, setIsAddEventOpen] = useState(false);
    const [isViewEventOpen, setIsViewEventOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const [newEventData, setNewEventData] = useState({
        title: '',
        description: '',
        date: new Date(),
        time: '09:00',
        type: 'meeting',
        participants: [],
        assignedTo: ''
    });

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const getDailyEvents = (day) => {
        const myTasks = tasks.filter(t => {
            const isAssigned = t.assignedTo?.some(id => id === user?.id || id === '1');
            return isAssigned && t.deadline && isSameDay(new Date(t.deadline), day);
        }).map(t => ({
            ...t,
            id: t.id,
            title: t.title,
            type: 'task',
            time: format(new Date(t.deadline), 'HH:mm'),
            date: t.deadline
        }));

        const mySchedules = schedules.filter(s => isSameDay(new Date(s.date), day)).map(s => ({
            ...s,
            source: 'schedule'
        }));

        const myFollowUps = followUps.filter(f => f.scheduledAt && isSameDay(new Date(f.scheduledAt), day)).map(f => {
            const lead = leads.find(l => l.id === f.leadId);
            return {
                id: f.id,
                title: `${f.type === 'meeting' ? 'Meeting' : 'Call'} with ${lead?.name || 'Lead'}`,
                description: f.notes,
                type: f.type === 'meeting' ? 'meeting' : 'call',
                time: format(new Date(f.scheduledAt), 'HH:mm'),
                date: f.scheduledAt,
                source: 'crm'
            };
        });

        let allEvents = [...myTasks, ...mySchedules, ...myFollowUps];
        if (selectedFilter !== 'all') {
            allEvents = allEvents.filter(e => e.type === selectedFilter);
        }

        return allEvents.sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));
    };

    const handleCreateEvent = () => {
        if (!newEventData.title || !newEventData.date) {
            toast.error("Required fields missing");
            return;
        }

        const event = {
            ...newEventData,
            managerId: user?.id,
            date: newEventData.date.toISOString(),
        };

        addScheduleEvent(event);
        toast.success("Event synchronized");
        setIsAddEventOpen(false);
        setNewEventData({
            title: '',
            description: '',
            date: new Date(),
            time: '09:00',
            type: 'meeting',
            participants: [],
            assignedTo: ''
        });
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setIsViewEventOpen(true);
    };

    const handleDeleteEvent = () => {
        if (selectedEvent?.source === 'crm' || selectedEvent?.type === 'task') {
            toast.error("Action restricted to source module");
            return;
        }
        deleteScheduleEvent(selectedEvent.id);
        toast.success("Event removed");
        setIsViewEventOpen(false);
    };

    const getEventTypeColor = (type) => {
        switch (type) {
            case 'meeting': return 'bg-purple-100/80 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
            case 'call': return 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
            case 'task': return 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            default: return 'bg-slate-100/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 pb-10">
            {/* Header section */}
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-8 px-1">
                <div className="flex items-center gap-3">
                    <div className="lg:hidden size-9 sm:size-11 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                        <img src="/src/assets/logo.png" alt="DinTask" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight">
                            Strategic <span className="text-primary-600">Schedule</span>
                        </h1>
                        <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                            Coordinate high-impact client engagements
                        </p>
                    </div>
                </div>
                <Button
                    variant="default"
                    className="h-9 sm:h-10 px-4 sm:px-6 gap-2 shadow-lg shadow-primary-500/20 bg-primary-600 hover:bg-primary-700 rounded-lg sm:rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest w-full sm:w-auto"
                    onClick={() => setIsAddEventOpen(true)}
                >
                    <Plus size={14} className="sm:size-4" />
                    <span>Initialize Event</span>
                </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-4 items-start focus-visible:outline-none">
                {/* Filters/Sidebar - Transformed for Mobile */}
                <div className="space-y-4">
                    <Card className="border-none shadow-xl shadow-slate-200/20 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                        <CardHeader className="py-2 px-4 sm:px-5 border-b border-slate-50 dark:border-slate-800">
                            <CardTitle className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Stream Filter</CardTitle>
                        </CardHeader>
                        <CardContent className="p-1.5 sm:p-2">
                            <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1 pb-1 lg:pb-0 scrollbar-hide">
                                {[
                                    { id: 'all', icon: <CalendarIcon size={12} />, label: 'All' },
                                    { id: 'meeting', icon: <Video size={12} />, label: 'Meetings' },
                                    { id: 'call', icon: <Phone size={12} />, label: 'Calls' },
                                    { id: 'task', icon: <CheckSquare size={12} />, label: 'Items' }
                                ].map((f) => (
                                    <Button
                                        key={f.id}
                                        variant={selectedFilter === f.id ? 'default' : 'ghost'}
                                        className={cn(
                                            "flex-1 lg:w-full justify-center lg:justify-start gap-2 h-8 sm:h-9 rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[9px] uppercase tracking-widest transition-all whitespace-nowrap px-3 sm:px-4",
                                            selectedFilter === f.id ? "bg-primary-600 text-white shadow-md shadow-primary-500/20" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        )}
                                        onClick={() => setSelectedFilter(f.id)}
                                    >
                                        <div className="shrink-0">{f.icon}</div>
                                        <span>{f.label}</span>
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-primary-500/10 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl overflow-hidden hidden lg:block">
                        <CardContent className="p-5 space-y-4">
                            <div className="size-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                <Clock size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-base tracking-tight uppercase">Active Velocity</h3>
                                <p className="text-[9px] text-primary-100 mt-1 font-black uppercase tracking-widest leading-relaxed">Engagement in 45m</p>
                            </div>
                            <Button variant="secondary" size="sm" className="w-full h-9 rounded-xl font-black text-[9px] uppercase tracking-widest text-primary-600 hover:bg-white transition-colors">Tactical View</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Calendar Grid - Modern & Responsive */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2 sm:p-3 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-800">
                        <h2 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight pl-2">
                            {format(currentDate, 'MMMM')} <span className="text-primary-600">{format(currentDate, 'yyyy')}</span>
                        </h2>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-50"
                                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                            >
                                <ChevronLeft size={14} className="sm:size-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-7 sm:h-8 px-2 sm:px-4 rounded-lg border-none bg-slate-50 dark:bg-slate-800 font-black text-[8px] sm:text-[9px] uppercase tracking-widest text-slate-600"
                                onClick={() => setCurrentDate(new Date())}
                            >
                                Now
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-50"
                                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                            >
                                <ChevronRight size={14} className="sm:size-4" />
                            </Button>
                        </div>
                    </div>

                    <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                        <div className="grid grid-cols-7 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className="py-2.5 sm:py-3 text-center text-[7px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 divide-x divide-y divide-slate-50 dark:divide-slate-800 border-l border-t border-slate-50 dark:divide-slate-800">
                            {calendarDays.map((day, idx) => {
                                const events = getDailyEvents(day);
                                const isSelected = isSameDay(day, new Date());
                                const isCurrentMonth = isSameMonth(day, monthStart);

                                return (
                                    <div
                                        key={day.toString()}
                                        className={cn(
                                            "min-h-[60px] sm:min-h-[110px] p-0.5 sm:p-1 transition-all group",
                                            !isCurrentMonth ? "bg-slate-50/20 dark:bg-slate-800/10 opacity-30 pointer-events-none" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30",
                                            isSelected && "bg-primary-50/30 dark:bg-primary-900/10"
                                        )}
                                    >
                                        <div className="flex justify-between items-center mb-1 px-1 sm:px-1.5">
                                            <span className={cn(
                                                "text-[8px] sm:text-xs font-black size-5 sm:size-7 flex items-center justify-center rounded-lg leading-none transition-all",
                                                isSelected ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30" : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                                            )}>
                                                {format(day, 'd')}
                                            </span>
                                            {events.length > 0 && isCurrentMonth && (
                                                <div className="size-1 rounded-full bg-primary-500 animate-pulse hidden sm:block" />
                                            )}
                                        </div>
                                        <div className="space-y-0.5 overflow-hidden px-0.5">
                                            {events.slice(0, 3).map((event, eIdx) => (
                                                <div
                                                    key={eIdx}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEventClick(event);
                                                    }}
                                                    className={cn(
                                                        "px-1 py-0.5 rounded-md text-[6px] sm:text-[9px] font-black truncate transition-all cursor-pointer hover:translate-x-0.5 active:scale-95 shadow-sm uppercase tracking-tighter leading-none",
                                                        getEventTypeColor(event.type)
                                                    )}>
                                                    <span className="hidden sm:inline">{event.time && <span className="mr-1 opacity-60 tabular-nums">{event.time}</span>}</span>
                                                    {event.title}
                                                </div>
                                            ))}
                                            {events.length > 3 && (
                                                <div className="px-1 py-0.5 text-[6px] font-black text-slate-400 uppercase tracking-widest italic">
                                                    + {events.length - 3} Units
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

            {/* Modals with Premium Styling */}
            <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-[1.5rem] border-none shadow-2xl p-0 overflow-hidden">
                    <div className="bg-slate-900 p-6 text-white relative">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Initialize Event</DialogTitle>
                        <DialogDescription className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-1 italic">
                            Configure a new temporal operation
                        </DialogDescription>
                    </div>
                    <div className="p-6 space-y-4 bg-white dark:bg-slate-900">
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Operation Title</Label>
                            <Input
                                placeholder="Strategic Briefing"
                                className="h-10 bg-slate-50 border-none rounded-xl font-bold text-sm px-4"
                                value={newEventData.title}
                                onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Window Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full h-10 justify-start bg-slate-50 border-none rounded-xl font-bold text-xs">
                                            <CalendarIcon className="mr-2 h-3.5 w-3.5 text-primary-600" />
                                            {newEventData.date ? format(newEventData.date, "PP") : "Select Date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden border-none shadow-2xl" align="start">
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
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Timeline</Label>
                                <Input
                                    type="time"
                                    className="h-10 bg-slate-50 border-none rounded-xl font-bold text-sm px-4 tabular-nums"
                                    value={newEventData.time}
                                    onChange={(e) => setNewEventData({ ...newEventData, time: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Tactical Type</Label>
                                <Select value={newEventData.type} onValueChange={(v) => setNewEventData({ ...newEventData, type: v })}>
                                    <SelectTrigger className="h-10 bg-slate-50 border-none rounded-xl font-bold text-xs ring-0 focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-xl">
                                        <SelectItem value="meeting" className="text-xs font-bold font-black">Meeting</SelectItem>
                                        <SelectItem value="call" className="text-xs font-bold">Call</SelectItem>
                                        <SelectItem value="deadline" className="text-xs font-bold">Deadline</SelectItem>
                                        <SelectItem value="other" className="text-xs font-bold">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Assignee</Label>
                                <Input
                                    placeholder="Internal ID"
                                    className="h-10 bg-slate-50 border-none rounded-xl font-bold text-sm px-4"
                                    value={newEventData.assignedTo}
                                    onChange={(e) => setNewEventData({ ...newEventData, assignedTo: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Detailed Intel</Label>
                            <Textarea
                                placeholder="Operational notes..."
                                className="bg-slate-50 border-none rounded-xl font-medium text-sm min-h-[80px] px-4 py-3"
                                value={newEventData.description}
                                onChange={(e) => setNewEventData({ ...newEventData, description: e.target.value })}
                            />
                        </div>
                        <DialogFooter className="pt-4 flex gap-2">
                            <Button variant="ghost" className="flex-1 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest" onClick={() => setIsAddEventOpen(false)}>Abort</Button>
                            <Button className="flex-1 h-10 rounded-xl bg-primary-600 hover:bg-primary-700 font-black text-[9px] uppercase tracking-widest text-white shadow-lg" onClick={handleCreateEvent}>Deploy Event</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isViewEventOpen} onOpenChange={setIsViewEventOpen}>
                <DialogContent className="sm:max-w-[380px] rounded-[1.5rem] border-none shadow-2xl p-0 overflow-hidden">
                    <div className={cn("p-6 text-white flex items-center justify-between", getEventTypeColor(selectedEvent?.type || 'other').split(' ')[0].replace('/80', ''))}>
                        <h3 className="text-lg font-black uppercase tracking-tight truncate mr-2">{selectedEvent?.title}</h3>
                        <Badge className="bg-white/20 backdrop-blur-md text-white border-none rounded-lg font-black text-[8px] uppercase tracking-widest py-1">
                            {selectedEvent?.type}
                        </Badge>
                    </div>
                    <div className="p-6 space-y-4 bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-6">
                            <div className="space-y-0.5">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Temporal Window</p>
                                <p className="text-xs font-black text-slate-900 dark:text-white">{selectedEvent?.date && format(new Date(selectedEvent.date), "dd MMM yyyy")}</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Timeline</p>
                                <p className="text-xs font-black text-slate-900 dark:text-white tabular-nums">{selectedEvent?.time}</p>
                            </div>
                        </div>

                        {selectedEvent?.assignedTo && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-50 dark:border-slate-800">
                                <div className="size-7 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                                    <Users size={14} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Assigned Force</p>
                                    <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-none mt-1">{selectedEvent.assignedTo}</p>
                                </div>
                            </div>
                        )}

                        {selectedEvent?.description && (
                            <div className="space-y-1.5">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Operational Intel</p>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold leading-relaxed bg-slate-50/50 dark:bg-slate-800/50 p-3 rounded-xl italic">"{selectedEvent.description}"</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Source: {selectedEvent?.source === 'crm' ? 'Neural Link' : 'Manual Entry'}</span>
                            <div className="flex gap-2">
                                {selectedEvent?.source === 'schedule' && (
                                    <Button variant="ghost" size="sm" className="h-8 px-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg font-black text-[8px] uppercase tracking-widest" onClick={handleDeleteEvent}>Purge</Button>
                                )}
                                <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg border-none bg-slate-100 dark:bg-slate-800 font-black text-[8px] uppercase tracking-widest" onClick={() => setIsViewEventOpen(false)}>Close</Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SalesSchedule;