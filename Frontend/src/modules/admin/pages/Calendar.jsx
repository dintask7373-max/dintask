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
    Filter
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
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import useEmployeeStore from '@/store/employeeStore';
import useScheduleStore from '@/store/scheduleStore';
import useAuthStore from '@/store/authStore';
import { useMemo } from 'react';

const AdminCalendar = () => {
    const { employees } = useEmployeeStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const calendarRef = React.useRef(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState('dayGridMonth');

    const [newEvent, setNewEvent] = useState({
        title: '',
        type: 'meeting',
        startTime: '10:00',
        endTime: '11:00',
        participants: [],
        location: 'Conference Room A'
    });

    const { user } = useAuthStore();
    const { schedules, addScheduleEvent, deleteScheduleEvent } = useScheduleStore();

    // Map store schedules to FullCalendar events
    const allEvents = useMemo(() => {
        const storeEvents = schedules.map(s => ({
            id: s.id,
            title: s.title,
            start: s.date.includes('T') ? s.date : `${s.date}T${s.time || '00:00'}:00`,
            backgroundColor: s.type === 'meeting' ? '#3b82f6' : s.type === 'call' ? '#10b981' : '#6366f1',
            borderColor: s.type === 'meeting' ? '#3b82f6' : s.type === 'call' ? '#10b981' : '#6366f1',
            extendedProps: {
                type: s.type,
                location: s.location || 'Remote',
                participants: s.participants,
                assignedTo: s.assignedTo,
                description: s.description,
                source: 'store'
            }
        }));

        // Filter events assigned to Admin or where user is participant
        return storeEvents.filter(e =>
            e.extendedProps.assignedTo?.toLowerCase().includes('admin') ||
            e.extendedProps.participants?.includes(user?.id)
        );
    }, [schedules, user?.id]);

    const handleDateClick = (arg) => {
        setSelectedDate(arg.dateStr);
        setIsModalOpen(true);
    };

    const handleCreateEvent = (e) => {
        e.preventDefault();
        if (!newEvent.title) {
            toast.error('Event title is required');
            return;
        }

        const start = `${selectedDate}T${newEvent.startTime}:00`;
        const end = `${selectedDate}T${newEvent.endTime}:00`;

        addScheduleEvent({
            title: newEvent.title,
            date: selectedDate,
            time: newEvent.startTime,
            type: newEvent.type,
            location: newEvent.location,
            participants: newEvent.participants,
            assignedTo: 'Admin'
        });
        toast.success('Meeting scheduled successfully');
        setIsModalOpen(false);
        setNewEvent({
            title: '',
            type: 'meeting',
            startTime: '10:00',
            endTime: '11:00',
            participants: [],
            location: 'Conference Room A'
        });
    };

    const toggleParticipant = (empId) => {
        setNewEvent(prev => ({
            ...prev,
            participants: prev.participants.includes(empId)
                ? prev.participants.filter(id => id !== empId)
                : [...prev.participants, empId]
        }));
    };

    // Calendar Control Functions
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
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Team Calendar</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Schedule meetings and manage team availability.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 shadow-lg shadow-primary-200 dark:shadow-none bg-primary-600 hover:bg-primary-700 text-white rounded-xl h-11 px-5">
                        <Plus size={18} />
                        <span>New Event</span>
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
                                <button onClick={handleToday} className="px-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors">
                                    Today
                                </button>
                                <button onClick={handleNext} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full text-slate-500 transition-all shadow-sm">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <button
                                onClick={() => changeView('dayGridMonth')}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    currentView === 'dayGridMonth'
                                        ? "bg-white dark:bg-slate-700 text-primary-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                )}
                            >
                                Month
                            </button>
                            <button
                                onClick={() => changeView('timeGridWeek')}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    currentView === 'timeGridWeek'
                                        ? "bg-white dark:bg-slate-700 text-primary-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                )}
                            >
                                Week
                            </button>
                            <button
                                onClick={() => changeView('listWeek')}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    currentView === 'listWeek'
                                        ? "bg-white dark:bg-slate-700 text-primary-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                )}
                            >
                                List
                            </button>
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
                                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate leading-tight">
                                            {eventInfo.event.title}
                                        </span>
                                        {eventInfo.view.type !== 'dayGridMonth' && (
                                            <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                                                {eventInfo.timeText}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                            eventClick={(info) => {
                                toast.info(`Event: ${info.event.title} at ${info.event.extendedProps.location}`);
                            }}
                        />
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Upcoming Events</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {allEvents.slice(0, 3).map(event => (
                                <div key={event.id} className="flex gap-3 p-3 rounded-xl border border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10 group hover:border-primary-100 transition-all cursor-pointer">
                                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                        <span className="text-[10px] uppercase text-pink-500 font-bold">{format(new Date(event.start), 'MMM')}</span>
                                        <span className="text-xl font-black text-slate-800 dark:text-white leading-none">{format(new Date(event.start), 'dd')}</span>
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">{event.title}</p>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5 font-medium">
                                            <div className="flex items-center gap-1">
                                                <Clock size={10} />
                                                <span>{format(new Date(event.start), 'HH:mm')}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin size={10} />
                                                <span className="truncate max-w-[80px]">{event.extendedProps.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full text-xs font-bold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl h-9">
                                View Full Schedule <ChevronRight size={14} className="ml-1" />
                            </Button>
                        </CardContent>
                    </Card>

                </div>
            </div>

            {/* Create Event Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Schedule Meeting</DialogTitle>
                        <DialogDescription>
                            Create a new event for {selectedDate || 'today'}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title" className="font-bold text-xs uppercase text-slate-500">Event Title</Label>
                            <Input
                                id="title"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                placeholder="e.g. Design Review"
                                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="font-bold text-xs uppercase text-slate-500">Start</Label>
                                <Input type="time" value={newEvent.startTime} onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })} className="h-11 rounded-xl bg-slate-50 border-slate-200" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="font-bold text-xs uppercase text-slate-500">End</Label>
                                <Input type="time" value={newEvent.endTime} onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })} className="h-11 rounded-xl bg-slate-50 border-slate-200" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label className="font-bold text-xs uppercase text-slate-500">Location</Label>
                            <Input
                                value={newEvent.location}
                                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                placeholder="Zoom, Office, etc."
                                className="h-11 rounded-xl bg-slate-50 border-slate-200"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="font-bold text-xs uppercase text-slate-500">Participants</Label>
                            <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
                                {employees.map(emp => (
                                    <div
                                        key={emp.id}
                                        onClick={() => toggleParticipant(emp.id)}
                                        className={cn(
                                            "flex items-center gap-2 p-1.5 pr-3 rounded-lg border cursor-pointer transition-all",
                                            newEvent.participants.includes(emp.id)
                                                ? "bg-white border-primary-200 ring-2 ring-primary-100 shadow-sm"
                                                : "bg-white border-slate-200 opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={emp.avatar} />
                                            <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className={cn("text-[10px] font-bold", newEvent.participants.includes(emp.id) ? "text-primary-700" : "text-slate-500")}>{emp.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold text-slate-500 hover:text-slate-900">Cancel</Button>
                        <Button onClick={handleCreateEvent} className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-8 shadow-lg shadow-primary-200">Schedule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminCalendar;
