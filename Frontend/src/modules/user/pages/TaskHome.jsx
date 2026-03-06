import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    Plus,
    Sparkles,
    Search
} from 'lucide-react';
import { format, isToday, isAfter, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { toast } from 'sonner';

import TaskCardNew from '../components/TaskCardNew';
import useTaskStore from '@/store/taskStore';
import useAuthStore from '@/store/authStore';
import useNotificationStore from '@/store/notificationStore';
import { cn } from '@/shared/utils/cn';
import { fadeInUp, staggerContainer, scaleOnTap } from '@/shared/utils/animations';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';

const TaskHome = () => {
    const navigate = useNavigate();
    const { tasks, fetchTasks } = useTaskStore();
    const { user } = useAuthStore();
    const { notifications } = useNotificationStore();
    const [activeTab, setActiveTab] = useState('today');
    const [listRef] = useAutoAnimate();

    React.useEffect(() => {
        fetchTasks();
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // -- Summary Stats Logic --
    const stats = useMemo(() => {
        const todayCount = tasks.filter(t => isToday(parseISO(t.deadline)) && t.status !== 'completed').length;
        const overdueCount = tasks.filter(t => t.status === 'overdue').length;
        const pendingCount = tasks.filter(t => t.status !== 'completed').length;
        const doneCount = tasks.filter(t => t.status === 'completed').length;
        return { today: todayCount, overdue: overdueCount, pending: pendingCount, done: doneCount };
    }, [tasks]);

    // -- Filtering Logic --
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const taskDate = parseISO(task.deadline);
            if (activeTab === 'today') {
                return isToday(taskDate) && task.status !== 'completed';
            }
            if (activeTab === 'overdue') {
                return task.status === 'overdue';
            }
            if (activeTab === 'upcoming') {
                return isAfter(taskDate, new Date()) && !isToday(taskDate) && task.status !== 'completed';
            }
            if (activeTab === 'completed') {
                return task.status === 'completed';
            }
            return true;
        });
    }, [tasks, activeTab]);

    return (
        <div className="bg-white dark:bg-slate-950 min-h-screen w-full font-display text-text-main dark:text-white pb-28">
            {/* -- Premium Header Section: Greeting Row only with Background -- */}
            <div className="relative overflow-hidden pt-8 pb-6 px-6">
                {/* Calendar-Style Brand Background Integration */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/WLCOMPAGE .png"
                        alt="Background"
                        className="w-full h-full object-cover object-center pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 dark:bg-black/60 pointer-events-none" />
                </div>

                <div className="relative z-10">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black leading-tight tracking-tight flex items-center gap-2 text-white">
                            Good Morning, {user?.name?.split(' ')[0] || 'User'}
                        </h2>
                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                            {format(new Date(), 'EEEE, MMM dd')}
                        </p>
                    </div>
                </div>
            </div>

            {/* -- Stats Pills Section -- */}
            <div className="px-6 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-0">
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        className="bg-[#4461f2] rounded-xl p-3.5 text-white shadow-lg shadow-[#4461f2]/20 flex flex-col gap-0.5"
                    >
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-80 leading-none">Today</p>
                        <p className="text-lg font-black leading-none">{stats.today}</p>
                    </motion.div>
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.1 }}
                        className="bg-red-500 rounded-xl p-3.5 text-white shadow-lg shadow-red-500/20 flex flex-col gap-0.5"
                    >
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-80 leading-none">Overdue</p>
                        <p className="text-lg font-black leading-none">{stats.overdue}</p>
                    </motion.div>
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.2 }}
                        className="bg-amber-500 rounded-xl p-3.5 text-white shadow-lg shadow-amber-500/20 flex flex-col gap-0.5"
                    >
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-80 leading-none">Pending</p>
                        <p className="text-lg font-black leading-none">{stats.pending}</p>
                    </motion.div>
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.3 }}
                        className="bg-emerald-500 rounded-xl p-3.5 text-white shadow-lg shadow-emerald-500/20 flex flex-col gap-0.5"
                    >
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-80 leading-none">Done</p>
                        <p className="text-lg font-black leading-none">{stats.done}</p>
                    </motion.div>
                </div>
            </div>

            {/* -- Premium Section Tabs: Compact & Spaced -- */}
            <div className="mb-2 px-6 -mt-2">
                <div className="flex items-center w-full border-b border-slate-100 dark:border-slate-800 transition-all relative overflow-x-auto no-scrollbar">
                    {['today', 'overdue', 'upcoming', 'completed'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex flex-col items-center justify-center pb-2.5 pt-1 transition-all relative group shrink-0 flex-1",
                                activeTab === tab ? "text-[#4461f2]" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            )}
                        >
                            <p className={cn(
                                "text-[11px] font-black capitalize tracking-tight transition-all",
                                activeTab === tab ? "scale-105" : "scale-100"
                            )}>{tab}</p>

                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4461f2] rounded-t-full shadow-[0_-4px_8px_rgba(68,97,242,0.2)]"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* -- Task List Feed -- */}
            <div ref={listRef} className="flex flex-col gap-3 px-6 pb-12">
                <AnimatePresence mode="popLayout">
                    {filteredTasks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center py-20 text-text-secondary"
                        >
                            <Sparkles size={48} className="opacity-20 mb-4" />
                            <p className="text-sm font-bold">No tasks found</p>
                        </motion.div>
                    ) : (
                        filteredTasks.map((task, index) => (
                            <motion.div
                                key={task.id}
                                variants={fadeInUp}
                                initial="hidden"
                                animate="visible"
                                custom={index}
                                layout
                            >
                                <TaskCardNew
                                    task={task}
                                    onClick={() => navigate(`/employee/tasks/${task.id}`)}
                                />
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>


        </div>
    );
};

export default TaskHome;
