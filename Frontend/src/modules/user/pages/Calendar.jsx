import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from 'react-router-dom';
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Plus,
    StickyNote
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils/cn';
import { fadeInUp, staggerContainer, scaleOnTap } from '@/shared/utils/animations';

const EmployeeCalendar = () => {
    const calendarRef = useRef(null);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [view, setView] = useState('dayGridMonth');
    const [currentDate, setCurrentDate] = useState(new Date());

    // Mock events for the employee
    const events = [
        {
            id: '1',
            title: 'Meeting in the centre',
            start: new Date().toISOString().split('T')[0] + 'T09:00:00',
            color: '#3b82f6',
            extendedProps: { type: 'meeting', location: 'Office centre', description: 'Discussing project progress.' }
        },
        {
            id: '2',
            title: 'Dinner with Jenny',
            start: new Date().toISOString().split('T')[0] + 'T13:00:00',
            color: '#3b82f6',
            extendedProps: { type: 'social', location: 'Restaurant', description: 'Personal meeting.' }
        }
    ];

    const handleEventClick = (info) => {
        setSelectedEvent(info.event);
        setIsModalOpen(true);
    };

    const handleNext = () => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.next();
        setCurrentDate(calendarApi.getDate());
    };

    const handlePrev = () => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.prev();
        setCurrentDate(calendarApi.getDate());
    };

    const handleViewChange = (newView) => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.changeView(newView);
        setView(newView);
    };

    const handleToday = () => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.today();
        setCurrentDate(calendarApi.getDate());
    };

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="min-h-screen bg-white dark:bg-slate-950 -m-6 flex flex-col font-sans"
        >
            {/* Header Section (White Wash) */}
            <div className="pt-10 pb-20 px-6 relative overflow-hidden">
                {/* Premium Background Wash */}
                <div className="absolute inset-0 z-0 h-[420px]">
                    <img
                        src="/WLCOMPAGE .png"
                        alt="Background"
                        className="w-full h-full object-cover opacity-70 dark:opacity-30 translate-y-[-10%]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-white dark:from-slate-950/40 dark:via-slate-950/80 dark:to-slate-950" />
                </div>

                {/* Top Nav Row */}
                <div className="flex items-center justify-between mb-8 text-slate-900 dark:text-white relative z-10">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-xl font-black tracking-tight uppercase">Calendar</h2>
                    <div className="flex gap-4">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <Plus size={22} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* View Tabs (Pill style) */}
                <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900/50 backdrop-blur-sm rounded-full p-1 mb-8 relative z-10 border border-slate-200 dark:border-slate-800 shadow-sm">
                    {['Day', 'Week', 'Month', 'Year'].map((label) => {
                        const viewKey = label === 'Day' ? 'dayGridDay' : label === 'Week' ? 'listWeek' : label === 'Month' ? 'dayGridMonth' : 'dayGridYear';
                        const isActive = view === viewKey;
                        return (
                            <button
                                key={label}
                                onClick={() => handleViewChange(viewKey)}
                                className={cn(
                                    "flex-1 py-1.5 rounded-full text-[11px] font-black transition-all",
                                    isActive ? "bg-[#4461f2] text-white shadow-lg shadow-[#4461f2]/20" : "text-slate-400 hover:text-slate-600 dark:text-slate-500"
                                )}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Month/Year Nav Row */}
                <div className="flex items-center justify-between px-2 relative z-10">
                    <button onClick={handlePrev} className="p-2.5 bg-white/80 dark:bg-slate-800 shadow-md rounded-full text-slate-600 hover:scale-110 transition-all border border-slate-100 dark:border-slate-700">
                        <ChevronLeft size={18} />
                    </button>
                    <div className="text-center group cursor-pointer" onClick={handleToday}>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tighter">
                            {format(currentDate, 'MMMM')}
                        </h3>
                        <p className="text-[10px] font-black text-[#4461f2] tracking-[0.2em] leading-none mt-1">
                            {format(currentDate, 'yyyy')}
                        </p>
                    </div>
                    <button onClick={handleNext} className="p-2.5 bg-white/80 dark:bg-slate-800 shadow-md rounded-full text-slate-600 hover:scale-110 transition-all border border-slate-100 dark:border-slate-700">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Calendar Card (Overlapping) */}
            <div className="px-6 -mt-10 relative z-10">
                <Card className="border-none shadow-[0_15px_35px_rgba(0,0,0,0.1)] bg-white dark:bg-slate-900 rounded-3xl overflow-hidden p-3 pt-4">
                    <CardContent className="p-0">
                        <style>{`
                            .fc { font-family: inherit; border: none !important; }
                            .fc-theme-standard td, .fc-theme-standard th { border: none !important; }
                            .fc-col-header-cell-cushion { 
                                color: #9ca3af !important; 
                                font-weight: 800 !important; 
                                font-size: 10px !important;
                                text-transform: uppercase !important;
                                padding-bottom: 20px !important;
                                display: block !important;
                            }
                            .fc-daygrid-day-number { 
                                font-weight: 600 !important;
                                font-size: 13px !important;
                                color: #1f2937 !important;
                                display: flex !important;
                                align-items: center !important;
                                justify-content: center !important;
                                width: 30px !important;
                                height: 30px !important;
                                margin: 0 auto !important;
                                padding: 0 !important;
                            }
                            .dark .fc-daygrid-day-number { color: #f3f4f6 !important; }
                            .fc-daygrid-day-frame { 
                                min-height: 42px !important; 
                                display: flex !important;
                                align-items: center !important;
                                justify-content: center !important;
                                margin-bottom: 5px !important;
                            }
                            .fc-day-today { background: transparent !important; }
                            .fc-day-today .fc-daygrid-day-number { 
                                background: #1a4eff !important; 
                                color: white !important; 
                                border-radius: 50% !important;
                                box-shadow: 0 4px 10px rgba(26, 78, 255, 0.3) !important;
                            }
                            .fc-day-other .fc-daygrid-day-number { opacity: 0.2 !important; }
                            /* Mimic range background from reference image */
                            .ref-range { background: rgba(26, 78, 255, 0.08) !important; border-radius: 999px !important; }
                        `}</style>
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={false}
                            events={events}
                            height="auto"
                            eventClick={handleEventClick}
                            noEventsContent="No events"
                            firstDay={1}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Events Section */}
            <div className="flex-1 px-6 py-10 space-y-6">
                <h3 className="text-xl font-black text-[#1f2937] dark:text-white tracking-tight">
                    Upcoming events
                </h3>
                <div className="space-y-3">
                    {/* Meeting Card */}
                    <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-[0_8px_20px_rgba(0,0,0,0.03)] flex items-start justify-between border border-transparent hover:border-blue-100 transition-all cursor-pointer"
                        onClick={() => { setSelectedEvent(events[0]); setIsModalOpen(true); }}
                    >
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-[#1a4eff] dark:text-blue-400">Meeting in the centre</h4>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Today, 9:00 AM</p>
                        </div>
                        <div className="text-[11px] font-black text-slate-900 dark:text-white pt-1">
                            In 2 hours
                        </div>
                    </motion.div>

                    {/* Dinner Card */}
                    <div className="relative group">
                        <motion.div
                            whileTap={{ scale: 0.98 }}
                            className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-[0_8px_20px_rgba(0,0,0,0.03)] flex items-start justify-between translate-x-4 border border-transparent"
                            onClick={() => { setSelectedEvent(events[1]); setIsModalOpen(true); }}
                        >
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-[#1a4eff] dark:text-blue-400">Dinner with Jenny</h4>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Today, 1:00 PM</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[11px] font-black text-slate-900 dark:text-white pt-1">In 6 hours</span>
                                <button className="text-blue-600 dark:text-blue-400 p-1">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Movie Card */}
                    <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-[0_8px_20px_rgba(0,0,0,0.03)] flex items-start justify-between border border-transparent transition-all cursor-pointer opacity-80"
                    >
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-[#1a4eff] dark:text-blue-400">Avengers, cinema</h4>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Sept 26, 8:30 PM</p>
                        </div>
                        <div className="text-[11px] font-black text-slate-900 dark:text-white pt-1">
                            Tomorrow
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Event Detail Modal (Themed) */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="w-[85%] max-w-sm rounded-[2.5rem] p-8 border-none shadow-2xl bg-white dark:bg-slate-900">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="size-16 rounded-[1.5rem] bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#1a4eff]">
                            <CalendarIcon size={32} />
                        </div>
                        <div className="space-y-2">
                            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                                {selectedEvent?.title}
                            </DialogTitle>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Event Details
                            </p>
                        </div>

                        <div className="w-full space-y-4">
                            <div className="flex items-center gap-4 text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                                <Clock size={16} className="text-blue-500" />
                                {selectedEvent ? format(new Date(selectedEvent.start), 'p, EEEE') : ''}
                            </div>
                            <div className="flex items-center gap-4 text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                                <MapPin size={16} className="text-red-500" />
                                {selectedEvent?.extendedProps?.location}
                            </div>
                        </div>

                        <Button onClick={() => setIsModalOpen(false)} className="w-full h-14 rounded-2xl bg-[#1a4eff] hover:bg-blue-700 text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95">
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default EmployeeCalendar;
