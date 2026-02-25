<<<<<<< HEAD
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import {
    Plus,
=======
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Plus,
    Bell,
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
    Calendar as CalendarIcon,
    Clock,
    Users,
    MapPin,
<<<<<<< HEAD
    ChevronLeft,
    ChevronRight,
    XCircle,
    Target,
    Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/shared/utils/cn';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import useScheduleStore from '@/store/scheduleStore';
import useAuthStore from '@/store/authStore';
import { useMemo } from 'react';

const EmployeeCalendar = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const calendarRef = React.useRef(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState('dayGridMonth');

    const [newEvent, setNewEvent] = useState({
        title: '',
        type: 'meeting',
        startTime: '10:00',
        endTime: '11:00',
        participants: [], // Store as { userId, userType, name, email }
        location: 'Remote',
        description: '',
        meetingLink: '',
        agenda: ''
    });

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isDateSelectionModalOpen, setIsDateSelectionModalOpen] = useState(false);
    const [selectedDateEvents, setSelectedDateEvents] = useState([]);
    const [selectedEventDetails, setSelectedEventDetails] = useState(null);

    const { user } = useAuthStore();
    const {
        schedules,
        participants,
        loading,
        fetchSchedules,
        fetchParticipants,
        addScheduleEvent,
        deleteScheduleEvent
    } = useScheduleStore();

    // Fetch data on mount
    React.useEffect(() => {
        fetchSchedules();
        fetchParticipants();
    }, [fetchSchedules, fetchParticipants]);

    // Map store schedules to FullCalendar events
    const allEvents = useMemo(() => {
        return (schedules || []).map(s => {
            const datePart = s.date.split('T')[0];
            const timePart = s.time || '00:00';
            return {
                id: s._id || s.id,
                title: s.title,
                start: `${datePart}T${timePart}:00`,
                end: s.endTime ? `${datePart}T${s.endTime}:00` : null,
                backgroundColor: s.type === 'meeting' ? '#3b82f6' : s.type === 'call' ? '#10b981' : '#6366f1',
                borderColor: s.type === 'meeting' ? '#3b82f6' : s.type === 'call' ? '#10b981' : '#6366f1',
                extendedProps: {
                    type: s.type,
                    location: s.location || 'Remote',
                    participants: s.participants,
                    description: s.description,
                    agenda: s.agenda,
                    meetingLink: s.meetingLink,
                    createdBy: s.createdBy,
                    source: 'backend'
                }
            };
        });
    }, [schedules]);

    const upcomingEvents = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return allEvents
            .filter(e => new Date(e.start) >= today)
            .sort((a, b) => new Date(a.start) - new Date(b.start))
            .slice(0, 5);
    }, [allEvents]);

    const handleDateClick = (arg) => {
        const eventsOnDate = allEvents.filter(e => e.start.startsWith(arg.dateStr));
        setSelectedDate(arg.dateStr);
        if (eventsOnDate.length > 0) {
            setSelectedDateEvents(eventsOnDate);
            setIsDateSelectionModalOpen(true);
        } else {
            setIsModalOpen(true);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (!newEvent.title) {
            toast.error('Event title is required');
            return;
        }

        // Local validation for temporal overlap
        const hasConflict = (schedules || []).some(s => {
            const sameDate = s.date.split('T')[0] === selectedDate;
            if (!sameDate) return false;

            const newStart = newEvent.startTime;
            const newEnd = newEvent.endTime;
            const existStart = s.time;
            const existEnd = s.endTime;

            // Overlap logic: (s1 < e2) && (s2 < e1)
            return (newStart < existEnd && existStart < newEnd);
        });

        if (hasConflict) {
            toast.error('T-Slot Conflict: Operational overlap detected');
            return;
        }

        try {
            await addScheduleEvent({
                title: newEvent.title,
                description: newEvent.description,
                agenda: newEvent.agenda,
                meetingLink: newEvent.meetingLink,
                date: selectedDate,
                time: newEvent.startTime,
                endTime: newEvent.endTime,
                type: newEvent.type,
                location: newEvent.location,
                participants: newEvent.participants.map(p => ({
                    userId: p._id,
                    userType: p.userType,
                    name: p.name,
                    email: p.email
                }))
            });

            setIsModalOpen(false);
            setNewEvent({
                title: '',
                type: 'meeting',
                startTime: '10:00',
                endTime: '11:00',
                participants: [],
                location: 'Remote',
                description: '',
                meetingLink: '',
                agenda: ''
            });
            toast.success('Sync Timeline updated');
        } catch (error) {
            console.error(error);
        }
    };

    const toggleParticipant = (person) => {
        setNewEvent(prev => ({
            ...prev,
            participants: prev.participants.some(p => p._id === person._id)
                ? prev.participants.filter(p => p._id !== person._id)
                : [...prev.participants, person]
        }));
=======
    Users,
    X
} from 'lucide-react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    differenceInHours,
    differenceInDays,
    parseISO
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import useScheduleStore from '@/store/scheduleStore';
import useAuthStore from '@/store/authStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';

const EmployeeCalendar = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { schedules, fetchSchedules } = useScheduleStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeView, setActiveView] = useState('Month');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    // Map store schedules to our local format
    const allEvents = useMemo(() => {
        return (schedules || []).map(s => ({
            id: s._id || s.id,
            title: s.title,
            time: parseISO(s.date),
            type: s.type,
            location: s.location || 'Remote',
            description: s.description,
            participants: s.participants || []
        }));
    }, [schedules]);

    // Upcoming events logic
    const upcomingEvents = useMemo(() => {
        const now = new Date();
        return allEvents
            .filter(e => e.time >= now || isSameDay(e.time, now))
            .sort((a, b) => a.time - b.time)
            .slice(0, 5);
    }, [allEvents]);

    // Helper: Generate calendar grid
    const calendarDays = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        const startDate = startOfWeek(start, { weekStartsOn: 1 });
        const endDate = endOfWeek(end, { weekStartsOn: 0 });

        const days = [];
        let day = startDate;

        while (day <= endDate || days.length < 42) {
            days.push(day);
            day = addDays(day, 1);
        }
        return days;
    }, [currentDate]);

    // Helper: Format relative time for events
    const getRelativeTimeString = (eventDate) => {
        const now = new Date();
        const diffHours = differenceInHours(eventDate, now);
        const diffDays = differenceInDays(eventDate, now);

        if (diffHours >= 0 && diffHours < 24) return `In ${diffHours} hours`;
        if (isSameDay(eventDate, addDays(now, 1))) return 'Tomorrow';
        if (diffDays > 1) return `In ${diffDays} days`;
        return format(eventDate, 'MMM dd, h:mm a');
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
    };

    const handlePrev = () => {
        if (activeView === 'Day') setCurrentDate(addDays(currentDate, -1));
        else if (activeView === 'Week') setCurrentDate(addDays(currentDate, -7));
        else if (activeView === 'Month') setCurrentDate(subMonths(currentDate, 1));
        else if (activeView === 'Year') setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
    };

    const handleNext = () => {
<<<<<<< HEAD
        const calendarApi = calendarRef.current.getApi();
        calendarApi.next();
        setCurrentDate(calendarApi.getDate());
    };

    const handleToday = () => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.today();
        setCurrentDate(calendarApi.getDate());
    };

    const changeView = (view) => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.changeView(view);
        setCurrentView(view);
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Sync <span className="text-primary-600">Timeline</span></h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 uppercase text-xs font-black tracking-widest italic opacity-70">
                        Operational flow coordination
                    </p>
=======
        if (activeView === 'Day') setCurrentDate(addDays(currentDate, 1));
        else if (activeView === 'Week') setCurrentDate(addDays(currentDate, 7));
        else if (activeView === 'Month') setCurrentDate(addMonths(currentDate, 1));
        else if (activeView === 'Year') setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
    };

    const renderMonthView = () => (
        <div className="grid grid-cols-7 gap-y-1 text-center">
            {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(day => (
                <div key={day} className="text-[10px] font-black text-slate-300 tracking-widest mb-2">
                    {day}
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
                </div>
            ))}
            {calendarDays.map((day, idx) => {
                const hasEvent = allEvents.some(e => isSameDay(e.time, day));
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isSameDay(day, new Date());

<<<<<<< HEAD
                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 shadow-lg shadow-primary-200 dark:shadow-none bg-primary-600 hover:bg-primary-700 text-white rounded-xl h-11 px-5 font-black uppercase text-[10px] tracking-widest">
                        <Plus size={18} />
                        <span>New Entry</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <Card className="xl:col-span-3 border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden rounded-[2rem]">
                    <div className="p-6 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white capitalize">
                                {format(currentDate, 'MMMM yyyy')}
                            </h2>
                            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-1">
                                <button onClick={handlePrev} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full text-slate-500 transition-all shadow-sm">
                                    <ChevronLeft size={16} />
                                </button>
                                <button onClick={handleToday} className="px-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors uppercase tracking-widest">
                                    Now
                                </button>
                                <button onClick={handleNext} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full text-slate-500 transition-all shadow-sm">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            {['dayGridMonth', 'timeGridWeek', 'listWeek'].map((view) => (
                                <button
                                    key={view}
                                    onClick={() => changeView(view)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                        currentView === view
                                            ? "bg-white dark:bg-slate-700 text-primary-600 shadow-sm"
                                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    )}
                                >
                                    {view === 'dayGridMonth' ? 'Month' : view === 'timeGridWeek' ? 'Week' : 'List'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <CardContent className="p-0">
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={false}
                            events={allEvents}
                            editable={true}
                            selectable={true}
                            selectMirror={true}
                            dayMaxEvents={3}
                            dateClick={handleDateClick}
                            height={750}
                            aspectRatio={1.8}
                            eventContent={(eventInfo) => (
                                <div className={cn(
                                    "flex items-center gap-2 w-full h-full px-2 py-1 overflow-hidden transition-all hover:brightness-95",
                                    eventInfo.event.extendedProps.type === 'meeting' ? "bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500" :
                                        eventInfo.event.extendedProps.type === 'review' ? "bg-emerald-50 dark:bg-emerald-900/30 border-l-2 border-emerald-500" :
                                            "bg-indigo-50 dark:bg-indigo-900/30 border-l-2 border-indigo-500"
                                )}>
                                    <div className={cn(
                                        "w-1.5 h-1.5 rounded-full shrink-0",
                                        eventInfo.event.extendedProps.type === 'meeting' ? "bg-blue-500" :
                                            eventInfo.event.extendedProps.type === 'review' ? "bg-emerald-500" : "bg-indigo-500"
                                    )} />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate leading-tight uppercase tracking-tight">
                                            {eventInfo.event.title}
                                        </span>
                                    </div>
                                </div>
                            )}
                            eventClick={(info) => {
                                setSelectedEventDetails({
                                    title: info.event.title,
                                    start: info.event.start,
                                    ...info.event.extendedProps,
                                    id: info.event.id
                                });
                                setIsDetailsModalOpen(true);
                            }}
                        />
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                        <CardHeader className="pb-2 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tactical Briefing</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                                <div
                                    key={event.id}
                                    className="flex gap-3 p-3 rounded-xl border border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10 group hover:border-primary-100 transition-all cursor-pointer"
                                    onClick={() => {
                                        setSelectedEventDetails({
                                            title: event.title,
                                            start: event.start,
                                            ...event.extendedProps,
                                            id: event.id
                                        });
                                        setIsDetailsModalOpen(true);
                                    }}
                                >
                                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                        <span className="text-[10px] uppercase text-pink-500 font-bold">{format(new Date(event.start), 'MMM')}</span>
                                        <span className="text-xl font-black text-slate-800 dark:text-white leading-none">{format(new Date(event.start), 'dd')}</span>
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-600 transition-colors uppercase tracking-tight leading-none mb-1">{event.title}</p>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-widest">
                                            <div className="flex items-center gap-1">
                                                <Clock size={10} />
                                                <span>{format(new Date(event.start), 'HH:mm')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No Future Ops</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create Event Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[450px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
                    <div className="bg-slate-900 p-8 text-white border-b-4 border-primary-600">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight leading-none mb-1">Schedule Operation</DialogTitle>
                        <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest italic opacity-70">
                            Appending directive for {selectedDate && format(new Date(selectedDate), 'MMM dd')}
                        </DialogDescription>
                    </div>
                    <div className="p-8 space-y-4 bg-white dark:bg-slate-900 overflow-y-auto max-h-[70vh] custom-scrollbar">
                        <div className="space-y-1.5">
                            <Label className="font-black text-[10px] uppercase text-slate-400 tracking-widest ml-1">Event Header</Label>
                            <Input
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                placeholder="OPERATIONAL SYNC"
                                className="h-12 rounded-2xl bg-slate-50 border-none focus:ring-2 ring-primary-500/20 font-black text-xs px-5"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="font-black text-[10px] uppercase text-slate-400 tracking-widest ml-1">Commencement</Label>
                                <Input type="time" value={newEvent.startTime} onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })} className="h-12 rounded-2xl bg-slate-50 border-none px-5 font-black" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="font-black text-[10px] uppercase text-slate-400 tracking-widest ml-1">Conclusion</Label>
                                <Input type="time" value={newEvent.endTime} onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })} className="h-12 rounded-2xl bg-slate-50 border-none px-5 font-black" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="font-black text-[10px] uppercase text-slate-400 tracking-widest ml-1">Type Classification</Label>
                                <Select
                                    value={newEvent.type}
                                    onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}
                                >
                                    <SelectTrigger className="h-12 bg-slate-50 border-none rounded-2xl font-black text-[10px] uppercase px-5">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                        <SelectItem value="meeting" className="text-[10px] font-black uppercase">SYNC MEETING</SelectItem>
                                        <SelectItem value="call" className="text-[10px] font-black uppercase">TACTICAL CALL</SelectItem>
                                        <SelectItem value="review" className="text-[10px] font-black uppercase text-emerald-500">INTEL REVIEW</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="font-black text-[10px] uppercase text-slate-400 tracking-widest ml-1">Location</Label>
                                <Input
                                    value={newEvent.location}
                                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                    placeholder="HQ / REMOTE"
                                    className="h-12 rounded-2xl bg-slate-50 border-none px-5 font-black text-xs"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="font-black text-[10px] uppercase text-slate-400 tracking-widest ml-1">Virtual Hub</Label>
                            <Input
                                value={newEvent.meetingLink}
                                onChange={(e) => setNewEvent({ ...newEvent, meetingLink: e.target.value })}
                                placeholder="https://zoom.link/..."
                                className="h-12 rounded-2xl bg-slate-50 border-none px-5 font-black text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="font-black text-[10px] uppercase text-slate-400 tracking-widest ml-1">Quick Description</Label>
                            <Input
                                value={newEvent.description}
                                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                placeholder="BRIEF SUMMARY"
                                className="h-12 rounded-2xl bg-slate-50 border-none px-5 font-black text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="font-black text-[10px] uppercase text-slate-400 tracking-widest ml-1">Detailed Agenda</Label>
                            <Textarea
                                value={newEvent.agenda}
                                onChange={(e) => setNewEvent({ ...newEvent, agenda: e.target.value })}
                                placeholder="OPERATIONAL OBJECTIVES..."
                                className="bg-slate-50 border-none rounded-2xl font-black text-xs px-5 py-3 min-h-[80px]"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="font-black text-[10px] uppercase text-slate-400 tracking-widest ml-1">Target Personnel</Label>
                            <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-100 custom-scrollbar">
                                {participants.map(person => (
                                    <button
                                        key={person._id}
                                        type="button"
                                        onClick={() => toggleParticipant(person)}
                                        className={cn(
                                            "flex items-center gap-2 p-1.5 pr-4 rounded-xl border transition-all",
                                            newEvent.participants.some(p => p._id === person._id)
                                                ? "bg-white border-primary-500 shadow-md ring-2 ring-primary-100"
                                                : "bg-white/50 border-slate-100 opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-1.5 w-1.5 rounded-full",
                                            person.userType === 'Admin' ? "bg-red-500" :
                                                person.userType === 'Manager' ? "bg-purple-500" :
                                                    person.userType === 'SalesExecutive' ? "bg-amber-500" : "bg-blue-500"
                                        )} />
                                        <span className={cn("text-[9px] font-black uppercase tracking-tight", newEvent.participants.some(p => p._id === person._id) ? "text-primary-600" : "text-slate-500")}>
                                            {person.name} ({person.userType})
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50/50 flex gap-3">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest">Abort</Button>
                        <Button onClick={handleCreateEvent} className="flex-1 h-12 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary-500/20">Commit Sync</Button>
                    </div>
                </DialogContent>
            </Dialog >

            {/* Event Details Modal */}
            < Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen} >
                <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
                    <div className={cn(
                        "p-8 text-white relative",
                        selectedEventDetails?.type === 'meeting' ? "bg-blue-600" :
                            selectedEventDetails?.type === 'review' ? "bg-emerald-600" : "bg-indigo-600"
                    )}>
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 italic">Operational Briefing</span>
                            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {selectedEventDetails?.type}
                            </div>
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight leading-tight mb-2">
                            {selectedEventDetails?.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-6 opacity-90">
                            <div className="flex items-center gap-1.5">
                                <Clock size={14} strokeWidth={3} />
                                <span className="text-xs font-black uppercase tracking-widest">
                                    {selectedEventDetails?.start && format(new Date(selectedEventDetails.start), 'HH:mm')}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin size={14} strokeWidth={3} />
                                <span className="text-xs font-black uppercase tracking-widest truncate max-w-[150px]">
                                    {selectedEventDetails?.location}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-6 bg-white dark:bg-slate-900">
                        {selectedEventDetails?.description && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Directive Summary</p>
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 italic leading-relaxed uppercase tracking-tight">
                                    "{selectedEventDetails.description}"
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployed Personnel</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedEventDetails?.participants?.map((p, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 py-1.5 pl-1.5 pr-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                        <div className="size-6 rounded-lg bg-primary-100 flex items-center justify-center text-[10px] font-black text-primary-600 uppercase">
                                            {p.name?.[0]}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-700 dark:text-slate-200 leading-none uppercase">{p.name}</span>
                                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter opacity-70">{p.userType}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedEventDetails?.meetingLink && (
                            <div className="pt-2">
                                <Button
                                    className="w-full h-12 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary-500/20 gap-3"
                                    onClick={() => window.open(selectedEventDetails.meetingLink, '_blank')}
                                >
                                    INITIALIZE VIRTUAL LINK
                                </Button>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest border-slate-200 text-slate-400 hover:bg-slate-50"
                                onClick={() => setIsDetailsModalOpen(false)}
                            >
                                Close Intel
                            </Button>
                            {selectedEventDetails?.createdBy === user?.id ? (
                                <Button
                                    variant="ghost"
                                    className="h-11 px-4 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest"
                                    onClick={async () => {
                                        if (confirm('Are you sure you want to purge this record?')) {
                                            await deleteScheduleEvent(selectedEventDetails.id);
                                            setIsDetailsModalOpen(false);
                                            toast.success('Event purged from timeline');
                                        }
                                    }}
                                >
                                    Purge
                                </Button>
                            ) : (
                                <div className="h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2 border border-slate-100 dark:border-slate-800">
                                    <Shield size={12} className="text-slate-400" />
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Read Only</span>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog >

            {/* Date Selection Modal */}
            < Dialog open={isDateSelectionModalOpen} onOpenChange={setIsDateSelectionModalOpen} >
                <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
                    <div className="bg-slate-900 p-8 text-white relative">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight leading-none mb-1">
                            Daily Briefing
                        </DialogTitle>
                        <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest opacity-60">
                            {selectedDate && format(new Date(selectedDate), 'EEEE, MMMM dd')}
                        </DialogDescription>
                        <button
                            onClick={() => setIsDateSelectionModalOpen(false)}
                            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <XCircle size={20} />
                        </button>
                    </div>

                    <div className="p-8 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {selectedDateEvents.map((event) => (
                            <div
                                key={event.id}
                                onClick={() => {
                                    setSelectedEventDetails({
                                        title: event.title,
                                        start: event.start,
                                        ...event.extendedProps,
                                        id: event.id
                                    });
                                    setIsDateSelectionModalOpen(false);
                                    setIsDetailsModalOpen(true);
                                }}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-primary-200 transition-all cursor-pointer group"
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                                    event.extendedProps.type === 'meeting' ? "bg-blue-100 text-blue-600" :
                                        event.extendedProps.type === 'review' ? "bg-emerald-100 text-emerald-600" : "bg-indigo-100 text-indigo-600"
                                )}>
                                    {event.extendedProps.type === 'meeting' ? <Users size={20} /> :
                                        event.extendedProps.type === 'review' ? <Target size={20} /> : <CalendarIcon size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight truncate mb-1">
                                        {event.title}
                                    </h4>
                                    <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        <div className="flex items-center gap-1">
                                            <Clock size={10} />
                                            <span>{format(new Date(event.start), 'HH:mm')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-slate-50/50 flex gap-3">
                        <Button
                            className="flex-1 h-12 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary-500/20"
                            onClick={() => {
                                setIsDateSelectionModalOpen(false);
                                setIsModalOpen(true);
                            }}
                        >
                            <Plus size={16} className="mr-2" /> Schedule New
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] border-slate-200 text-slate-400"
                            onClick={() => setIsDateSelectionModalOpen(false)}
                        >
                            Close Brief
=======
                return (
                    <div key={idx} className="flex items-center justify-center p-0.5">
                        <button
                            onClick={() => {
                                setCurrentDate(day);
                                const dayEvents = allEvents.filter(e => isSameDay(e.time, day));
                                if (dayEvents.length > 0) {
                                    // Could open a day view or something
                                }
                            }}
                            className={cn(
                                "size-8 rounded-full flex flex-col items-center justify-center text-xs transition-all font-bold relative",
                                isTodayDate ? "bg-[#4461F2] text-white shadow-lg shadow-blue-500/20 scale-105" :
                                    isCurrentMonth ? "text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800" :
                                        "text-slate-200 dark:text-slate-700"
                            )}
                        >
                            {format(day, 'd')}
                            {hasEvent && !isTodayDate && (
                                <div className="absolute bottom-1 size-1 bg-[#4461F2] rounded-full" />
                            )}
                        </button>
                    </div>
                );
            })}
        </div>
    );

    const renderWeekView = () => {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekDays = Array.from({ length: 7 }, (_, i) => addDays(start, i));
        return (
            <div className="flex flex-col space-y-4">
                <div className="flex justify-between p-2 mb-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    {weekDays.map((day, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{format(day, 'EEE').slice(0, 2)}</span>
                            <button
                                onClick={() => setCurrentDate(day)}
                                className={cn(
                                    "size-10 rounded-xl flex items-center justify-center text-xs font-black transition-all",
                                    isSameDay(day, currentDate)
                                        ? "bg-[#4461F2] text-white shadow-md shadow-blue-500/20"
                                        : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                                )}
                            >
                                {format(day, 'd')}
                            </button>
                        </div>
                    ))}
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar py-2">
                    {allEvents.filter(e => isSameDay(e.time, currentDate)).length > 0 ? (
                        allEvents.filter(e => isSameDay(e.time, currentDate)).map((event, i) => (
                            <div key={i} className="flex gap-4 items-center p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
                                onClick={() => { setSelectedEvent(event); setIsDetailsOpen(true); }}>
                                <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{event.title}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{format(event.time, 'h:mm a')}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest italic">
                            No events scheduled for this day
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderDayView = () => (
        <div className="flex flex-col space-y-6 pt-2">
            <div className="flex items-center justify-center p-6 bg-[#4461F2]/5 rounded-[2rem] border border-blue-100/50">
                <div className="text-center">
                    <p className="text-[10px] font-black text-[#4461F2] uppercase tracking-[0.3em] mb-1">{format(currentDate, 'EEEE')}</p>
                    <h4 className="text-5xl font-black text-slate-900 dark:text-white">{format(currentDate, 'dd')}</h4>
                    <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">{format(currentDate, 'MMMM yyyy')}</p>
                </div>
            </div>
            <div className="space-y-6 pl-2 py-4 border-l-2 border-slate-50 dark:border-slate-800 ml-4">
                {allEvents.filter(e => isSameDay(e.time, currentDate)).length > 0 ? (
                    allEvents.filter(e => isSameDay(e.time, currentDate)).map((slot, i) => (
                        <div key={i} className="relative group cursor-pointer" onClick={() => { setSelectedEvent(slot); setIsDetailsOpen(true); }}>
                            <div className={cn("absolute -left-[18px] top-1/2 -translate-y-1/2 size-3 rounded-full border-2 border-white dark:border-slate-900 shadow-sm transition-transform group-hover:scale-125 bg-slate-900 dark:bg-slate-100")} />
                            <div className="pl-6">
                                <p className="text-[9px] font-black text-slate-300 mb-1">{format(slot.time, 'HH:mm')}</p>
                                <h5 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{slot.title}</h5>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-[10px] font-black text-slate-300 uppercase italic ml-4">Agenda Clear</p>
                )}
            </div>
        </div>
    );

    const renderYearView = () => {
        const months = Array.from({ length: 12 }, (_, i) => new Date(currentDate.getFullYear(), i, 1));
        return (
            <div className="grid grid-cols-3 gap-3">
                {months.map((m, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            setCurrentDate(m);
                            setActiveView('Month');
                        }}
                        className={cn(
                            "aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all",
                            isSameMonth(m, currentDate)
                                ? "bg-[#4461F2] text-white shadow-lg"
                                : "bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-blue-50"
                        )}
                    >
                        <span className="text-[10px] font-black uppercase tracking-tighter">{format(m, 'MMM')}</span>
                        {allEvents.some(e => isSameMonth(e.time, m)) && (
                            <div className={cn("size-1 rounded-full", isSameMonth(m, currentDate) ? "bg-white" : "bg-slate-500")} />
                        )}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 p-4 sm:p-8 flex flex-col items-center font-sans overflow-x-hidden pb-24 relative">

            {/* Main Compact Container */}
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 relative z-10">

                {/* Header Section: Original Brand Image */}
                <div className="relative p-8 pb-12 overflow-hidden border-b border-slate-100">
                    <img
                        src="/WLCOMPAGE .png"
                        alt="Header Background"
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />
                    {/* Sophisticated dark wash to make white text pop while keeping image visible */}
                    <div className="absolute inset-0 bg-slate-950/40 dark:bg-black/60 pointer-events-none" />

                    <div className="relative z-10 text-white">
                        <div className="flex items-center justify-between mb-8">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate(-1)}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <ChevronLeft size={24} />
                            </motion.button>
                            <h1 className="text-xl font-black tracking-tight uppercase">Calendar</h1>
                            <div className="w-6" /> {/* Spacer to balance the back button */}
                        </div>

                        {/* View Toggles - Modern Underline Navigation */}
                        <div className="flex items-center justify-between mb-8 relative px-2">
                            {['Day', 'Week', 'Month', 'Year'].map((view) => (
                                <button
                                    key={view}
                                    onClick={() => setActiveView(view)}
                                    className={cn(
                                        "flex-1 py-2 text-[11px] font-black transition-all uppercase tracking-[0.2em] relative z-10",
                                        activeView === view
                                            ? "text-white"
                                            : "text-white/40 hover:text-white/80"
                                    )}
                                >
                                    {view}
                                    {activeView === view && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <button onClick={handlePrev} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <ChevronLeft size={20} strokeWidth={3} />
                            </button>
                            <div className="text-center" onClick={() => setCurrentDate(new Date())}>
                                <h3 className="text-3xl font-black text-white">
                                    {activeView === 'Year' ? format(currentDate, 'yyyy') : format(currentDate, 'MMMM')}
                                </h3>
                                <p className="text-xs font-black text-white/50 tracking-[0.3em] leading-none mt-1 uppercase">
                                    {activeView === 'Year' ? 'Deploy Plan' : format(currentDate, 'yyyy')}
                                </p>
                            </div>
                            <button onClick={handleNext} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                                <ChevronRight size={20} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 px-6 pt-4 pb-2 relative z-10 -mt-6 rounded-t-[2.5rem]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeView + currentDate}
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="min-h-[240px]"
                        >
                            {activeView === 'Month' && renderMonthView()}
                            {activeView === 'Week' && renderWeekView()}
                            {activeView === 'Day' && renderDayView()}
                            {activeView === 'Year' && renderYearView()}
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>

            {/* Upcoming Events Section (Separate Div) */}
            <div className="w-full max-w-md mt-8 space-y-6 relative z-10">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight px-1">
                    Upcoming events
                </h3>

                <div className="space-y-4">
                    {upcomingEvents.length > 0 ? (
                        upcomingEvents.map((event, index) => {
                            const eventColors = [
                                { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-100 dark:border-blue-900/50', accent: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400', shadow: 'shadow-blue-500/10' },
                                { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-100 dark:border-emerald-900/50', accent: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', shadow: 'shadow-emerald-500/10' },
                                { bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-100 dark:border-rose-900/50', accent: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', shadow: 'shadow-rose-500/10' },
                                { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-100 dark:border-amber-900/50', accent: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', shadow: 'shadow-amber-500/10' },
                                { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-100 dark:border-purple-900/50', accent: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400', shadow: 'shadow-purple-500/10' }
                            ];
                            const style = eventColors[index % eventColors.length];

                            return (
                                <motion.div
                                    key={event.id}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    onClick={() => { setSelectedEvent(event); setIsDetailsOpen(true); }}
                                    className={cn(
                                        "relative overflow-hidden p-6 rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between group",
                                        style.bg,
                                        style.border,
                                        style.shadow
                                    )}
                                >
                                    {/* Left Accent Bar */}
                                    <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", style.accent)} />

                                    <div className="space-y-1 relative z-10">
                                        <h4 className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                            {event.title}
                                        </h4>
                                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Clock size={12} className={style.text} />
                                            {isSameDay(event.time, new Date())
                                                ? `Today, ${format(event.time, 'h:mm a')}`
                                                : format(event.time, 'MMM d, h:mm a')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <span className={cn("text-[11px] font-black uppercase tracking-widest", style.text)}>
                                            {getRelativeTimeString(event.time)}
                                        </span>
                                        <div className={cn("p-2 rounded-xl transition-transform group-hover:rotate-12", style.bg, "border shadow-inner")}>
                                            <Bell size={14} className={style.text} fill="currentColor" />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                            <CalendarIcon size={32} className="opacity-10 mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest italic">No Future Operations</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Event Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="w-[90%] max-w-sm rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden bg-white dark:bg-slate-900">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-8 text-white">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight leading-tight">
                            {selectedEvent?.title}
                        </DialogTitle>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mt-2">
                            Event Classification: {selectedEvent?.type}
                        </p>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                                <Clock size={16} className="text-slate-900 dark:text-white" />
                                {selectedEvent ? format(selectedEvent.time, 'p, EEEE, MMM dd') : ''}
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                                <MapPin size={16} className="text-red-500" />
                                {selectedEvent?.location}
                            </div>
                        </div>

                        {selectedEvent?.description && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Directive</p>
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 italic leading-relaxed">
                                    "{selectedEvent.description}"
                                </p>
                            </div>
                        )}

                        <Button onClick={() => setIsDetailsOpen(false)} className="w-full h-14 rounded-2xl bg-[#4461F2] hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">
                            Acknowledge
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
<<<<<<< HEAD
=======

            <div className="py-10 text-center">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.5em]">Neural Calendar Terminal v2.0</p>
            </div>
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
        </div>
    );
};

export default EmployeeCalendar;
