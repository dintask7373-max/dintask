import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import {
    Plus,
    Calendar as CalendarIcon,
    Clock,
    Users,
    MapPin,
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

const SalesSchedule = () => {
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
        participants: [],
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

        const hasConflict = (schedules || []).some(s => {
            const sameDate = s.date.split('T')[0] === selectedDate;
            if (!sameDate) return false;
            const newStart = newEvent.startTime;
            const newEnd = newEvent.endTime;
            const existStart = s.time;
            const existEnd = s.endTime;
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
    };

    const handlePrev = () => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.prev();
        setCurrentDate(calendarApi.getDate());
    };

    const handleNext = () => {
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
        <div className="space-y-6 pb-12 transition-all duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Strategic <span className="text-primary-600">Schedule</span></h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 uppercase text-xs font-black tracking-widest italic opacity-70">
                        Coordinate high-impact engagements
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 shadow-lg shadow-primary-200 dark:shadow-none bg-primary-600 hover:bg-primary-700 text-white rounded-xl h-11 px-5 font-black uppercase text-[10px] tracking-widest">
                        <Plus size={18} />
                        <span>Initialize Entry</span>
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
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight leading-none mb-1">Initialize Operation</DialogTitle>
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
                                placeholder="STRATEGIC SYNC"
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
                            <Label className="font-black text-[10px] uppercase text-slate-400 tracking-widest ml-1">Engage Link</Label>
                            <Input
                                value={newEvent.meetingLink}
                                onChange={(e) => setNewEvent({ ...newEvent, meetingLink: e.target.value })}
                                placeholder="https://link.com/..."
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
                                placeholder="STRATEGIC OBJECTIVES..."
                                className="bg-slate-50 border-none rounded-2xl font-black text-xs px-5 py-3 min-h-[80px]"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="font-black text-[10px] uppercase text-slate-400 tracking-widest ml-1">Deployed Personnel</Label>
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
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 italic">Engagement Briefing</span>
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
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SalesSchedule;
