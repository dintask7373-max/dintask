import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Plus,
    Bell,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
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
    };

    const handlePrev = () => {
        if (activeView === 'Day') setCurrentDate(addDays(currentDate, -1));
        else if (activeView === 'Week') setCurrentDate(addDays(currentDate, -7));
        else if (activeView === 'Month') setCurrentDate(subMonths(currentDate, 1));
        else if (activeView === 'Year') setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
    };

    const handleNext = () => {
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
                </div>
            ))}
            {calendarDays.map((day, idx) => {
                const hasEvent = allEvents.some(e => isSameDay(e.time, day));
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isSameDay(day, new Date());

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
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="py-10 text-center">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.5em]">Neural Calendar Terminal v2.0</p>
            </div>
        </div>
    );
};

export default EmployeeCalendar;
