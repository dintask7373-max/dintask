import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Plus,
    Bell,
    Calendar as CalendarIcon
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
    differenceInDays
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

const EmployeeCalendar = () => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState([
        new Date(2019, 8, 1),
        new Date(2019, 8, 5),
        new Date(2019, 8, 7),
        new Date(2019, 8, 31)
    ]);
    const [activeView, setActiveView] = useState('Month');

    // Mock events mapping to the reference design
    const events = [
        {
            id: '1',
            title: 'Meeting in the centre',
            time: new Date().setHours(9, 0, 0, 0),
            hasNotification: false
        },
        {
            id: '2',
            title: 'Dinner with Jenny',
            time: new Date().setHours(13, 0, 0, 0),
            hasNotification: true
        },
        {
            id: '3',
            title: 'Avengers, cinema',
            time: addDays(new Date(), 1).setHours(20, 30, 0, 0),
            hasNotification: false
        },
        {
            id: '4',
            title: 'Meeting',
            time: addDays(new Date(), 2).setHours(21, 30, 0, 0),
            hasNotification: false
        }
    ];

    // Helper: Generate calendar grid
    const calendarDays = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        const startDate = startOfWeek(start, { weekStartsOn: 1 }); // Start with Monday as per MO in header
        const endDate = endOfWeek(end, { weekStartsOn: 0 }); // End with Sunday

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

        if (diffHours > 0 && diffHours < 24) return `In ${diffHours} hours`;
        if (isSameDay(eventDate, addDays(now, 1))) return 'Tomorrow';
        if (diffDays > 1) return `In ${diffDays} days`;
        return format(eventDate, 'MMM dd, h:mm a');
    };

    const toggleDate = (date) => {
        if (selectedDates.some(d => isSameDay(d, date))) {
            setSelectedDates(selectedDates.filter(d => !isSameDay(d, date)));
        } else {
            setSelectedDates([...selectedDates, date]);
        }
    };

    // Helper: Navigation logic based on view
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

    // Render Logic for different views
    const renderMonthView = () => (
        <div className="grid grid-cols-7 gap-y-4 text-center">
            {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(day => (
                <div key={day} className="text-[10px] font-black text-slate-300 tracking-widest mb-2">
                    {day}
                </div>
            ))}
            {calendarDays.map((day, idx) => {
                const isSelected = selectedDates.some(d => isSameDay(d, day));
                const isCurrentMonth = isSameMonth(day, currentDate);
                return (
                    <div key={idx} className="flex items-center justify-center p-0.5">
                        <button
                            onClick={() => toggleDate(day)}
                            className={cn(
                                "size-9 rounded-full flex items-center justify-center text-sm transition-all font-bold",
                                isSelected ? "bg-[#4461F2] text-white shadow-lg shadow-blue-500/30 scale-110" :
                                    isCurrentMonth ? "text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800" :
                                        "text-slate-200 dark:text-slate-700"
                            )}
                        >
                            {format(day, 'd')}
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
                <div className="relative space-y-4 max-h-[220px] overflow-y-auto no-scrollbar py-2">
                    {['09:00', '11:00', '13:00', '15:00', '17:00'].map(hour => (
                        <div key={hour} className="flex gap-4 items-center pl-2 group">
                            <span className="text-[10px] font-black text-slate-300 w-10 shrink-0">{hour}</span>
                            <div className="h-px flex-1 bg-slate-50 dark:bg-slate-800/50 group-hover:bg-blue-100 transition-colors" />
                        </div>
                    ))}
                    <div className="absolute top-[88px] left-[60px] right-6 h-12 bg-blue-500/10 border-l-4 border-blue-500 rounded-lg p-3 flex items-center pointer-events-none">
                        <span className="text-[9px] font-black text-[#4461F2] uppercase tracking-wider">Weekly Sync Placeholder</span>
                    </div>
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
                {[
                    { time: '09:00', title: 'Neural Core Meeting', color: 'bg-emerald-500' },
                    { time: '13:00', title: 'Strategic Negotiation', color: 'bg-blue-500' },
                    { time: '16:30', title: 'System Diagnostics', color: 'bg-indigo-500' }
                ].map((slot, i) => (
                    <div key={i} className="relative group">
                        <div className={cn("absolute -left-[18px] top-1/2 -translate-y-1/2 size-3 rounded-full border-2 border-white dark:border-slate-900 shadow-sm transition-transform group-hover:scale-125", slot.color)} />
                        <div className="pl-6">
                            <p className="text-[9px] font-black text-slate-300 mb-1">{slot.time}</p>
                            <h5 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{slot.title}</h5>
                        </div>
                    </div>
                ))}
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
                        {i % 3 === 0 && <div className={cn("size-1 rounded-full", isSameMonth(m, currentDate) ? "bg-white" : "bg-blue-500")} />}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 p-4 sm:p-8 flex flex-col items-center font-sans overflow-x-hidden">

            {/* Main Compact Container */}
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white dark:border-slate-800">

                {/* Header Section: Image Background */}
                <div className="relative p-8 pb-12 text-white overflow-hidden">
                    <img
                        src="/WLCOMPAGE .png"
                        alt="Background"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[1px]" />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate(-1)}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <ChevronLeft size={24} />
                            </motion.button>
                            <h1 className="text-xl font-bold tracking-tight">Calendar</h1>
                            <div className="flex gap-4">
                                <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
                                    <Search size={20} strokeWidth={2.5} />
                                </button>
                                <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
                                    <Plus size={22} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>

                        {/* View Toggles */}
                        <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-1 mb-10 overflow-hidden">
                            {['Day', 'Week', 'Month', 'Year'].map((view) => {
                                const isActive = activeView === view;
                                return (
                                    <button
                                        key={view}
                                        onClick={() => setActiveView(view)}
                                        className={cn(
                                            "relative flex-1 py-3 text-[10px] font-black transition-all uppercase tracking-[0.2em] outline-none",
                                            isActive ? "text-white" : "text-white/40 hover:text-white/70"
                                        )}
                                    >
                                        <span className="relative z-10">{view}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active_view_line"
                                                className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,1)]"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <button onClick={handlePrev} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <ChevronLeft size={20} strokeWidth={3} />
                            </button>
                            <div className="text-center">
                                <h3 className="text-3xl font-black">
                                    {activeView === 'Year' ? format(currentDate, 'yyyy') : format(currentDate, 'MMMM')}
                                </h3>
                                <p className="text-sm font-bold text-white/60 tracking-widest leading-none mt-1">
                                    {activeView === 'Year' ? 'SELECT MONTH' : format(currentDate, 'yyyy')}
                                </p>
                            </div>
                            <button onClick={handleNext} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <ChevronRight size={20} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 px-6 pt-8 pb-6 relative z-10 -mt-6 rounded-t-[2.5rem]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeView + currentDate}
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="min-h-[300px]"
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
            <div className="w-full max-w-md mt-8 space-y-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight px-1">
                    Upcoming events
                </h3>

                <div className="space-y-4">
                    {events.map((event) => (
                        <motion.div
                            key={event.id}
                            whileHover={{ scale: 1.02, x: 5 }}
                            className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-[0_15px_35px_rgb(0,0,0,0.03)] border border-white dark:border-slate-800 flex items-center justify-between group cursor-pointer"
                        >
                            <div className="space-y-1">
                                <h4 className="text-[13px] font-black text-[#4461F2] dark:text-blue-400">
                                    {event.title}
                                </h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                    {isSameDay(event.time, new Date())
                                        ? `Today, ${format(event.time, 'h:mm a')}`
                                        : format(event.time, 'MMM d, h:mm a')}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-black text-slate-900 dark:text-white">
                                    {getRelativeTimeString(event.time)}
                                </span>
                                {event.hasNotification && (
                                    <div className="bg-blue-50 dark:bg-blue-900/30 p-1.5 rounded-full text-[#4461F2]">
                                        <Bell size={12} fill="currentColor" strokeWidth={0} />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

        </div >
    );
};

export default EmployeeCalendar;
