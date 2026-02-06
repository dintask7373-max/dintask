import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    ChevronLeft,
    ChevronRight,
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [view, setView] = useState('listWeek');
    const [currentDate, setCurrentDate] = useState(new Date());

    // Mock events for the employee
    const events = [
        {
            id: '1',
            title: 'Weekly Sync Meeting',
            start: new Date().toISOString().split('T')[0] + 'T10:00:00',
            end: new Date().toISOString().split('T')[0] + 'T11:00:00',
            color: '#3b82f6',
            extendedProps: { type: 'meeting', location: 'Zoom', description: 'Discussing project progress and blockers.' }
        },
        {
            id: '2',
            title: 'Frontend Review',
            start: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T14:30:00',
            color: '#10b981',
            extendedProps: { type: 'review', location: 'Office Room 4', description: 'Reviewing the new dashboard designs.' }
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
            className="space-y-6"
        >
            <motion.div variants={fadeInUp} className="flex items-center justify-between px-1">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Schedule</h2>
                    <p className="text-xs text-slate-500 font-medium">Your meetings and milestones</p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn("h-7 px-3 rounded-xl text-[10px] font-bold transition-all", view === 'listWeek' ? "bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-white" : "text-slate-500")}
                        onClick={() => handleViewChange('listWeek')}
                    >
                        List
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn("h-7 px-3 rounded-xl text-[10px] font-bold transition-all", view === 'dayGridMonth' ? "bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-white" : "text-slate-500")}
                        onClick={() => handleViewChange('dayGridMonth')}
                    >
                        Month
                    </Button>
                </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
                <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                    <div className="flex items-center justify-between p-3 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                        <div className="flex gap-1">
                            <motion.div {...scaleOnTap}>
                                <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700" onClick={handlePrev}>
                                    <ChevronLeft size={14} />
                                </Button>
                            </motion.div>
                            <motion.div {...scaleOnTap}>
                                <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700" onClick={handleNext}>
                                    <ChevronRight size={14} />
                                </Button>
                            </motion.div>
                        </div>
                        <motion.div
                            key={`${currentDate.getTime()}-${view}`}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[11px] font-black text-slate-900 dark:text-white tracking-widest uppercase"
                        >
                            {format(currentDate, view === 'listWeek' ? 'MMM dd, yyyy' : 'MMMM yyyy')}
                        </motion.div>
                        <motion.div {...scaleOnTap}>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-[9px] font-black text-primary-600 uppercase tracking-widest hover:bg-primary-50 dark:hover:bg-primary-900/10" onClick={handleToday}>
                                TODAY
                            </Button>
                        </motion.div>
                    </div>
                    <CardContent className="p-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={view}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <FullCalendar
                                    ref={calendarRef}
                                    plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
                                    initialView="listWeek"
                                    headerToolbar={false}
                                    events={events}
                                    height="auto"
                                    eventClick={handleEventClick}
                                    eventClassNames="rounded-xl overflow-hidden mb-1 border-none shadow-sm"
                                    noEventsContent="No events for this week"
                                />
                            </motion.div>
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="space-y-4">
                <motion.h3 variants={fadeInUp} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Coming Up Today</motion.h3>
                <div className="space-y-3">
                    {events.filter(e => e.start.startsWith(new Date().toISOString().split('T')[0])).map((event, index) => (
                        <motion.div
                            key={event.id}
                            variants={fadeInUp}
                            custom={index}
                        >
                            <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl active:scale-[0.98] transition-transform cursor-pointer" onClick={() => { setSelectedEvent({ title: event.title, start: new Date(event.start), extendedProps: event.extendedProps }); setIsModalOpen(true); }}>
                                <CardContent className="p-4 flex gap-4">
                                    <div className="w-1.5 h-auto rounded-full bg-primary-500" />
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{event.title}</h4>
                                            <Badge variant="outline" className="text-[8px] uppercase tracking-tighter border-slate-100 dark:border-slate-800">
                                                {event.extendedProps.type}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} className="text-primary-500" />
                                                <span>{format(new Date(event.start), 'HH:mm')}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin size={12} className="text-red-500" />
                                                <span>{event.extendedProps.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl">
                    <DialogHeader>
                        <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 mb-2">
                            <CalendarIcon size={24} />
                        </div>
                        <DialogTitle className="text-xl font-bold">{selectedEvent?.title}</DialogTitle>
                        <DialogDescription className="text-xs">
                            Event Details & Schedule
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="flex gap-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</p>
                                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    <Clock size={14} className="text-primary-500" />
                                    {selectedEvent ? format(new Date(selectedEvent.start), 'p') : ''}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
                                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    <CalendarIcon size={14} className="text-primary-500" />
                                    {selectedEvent ? format(new Date(selectedEvent.start), 'MMM dd, yyyy') : ''}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300">
                                <MapPin size={14} className="text-red-500" />
                                {selectedEvent?.extendedProps?.location}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                {selectedEvent?.extendedProps?.description}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsModalOpen(false)} className="w-full rounded-xl h-11 font-bold">Close Details</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default EmployeeCalendar;
