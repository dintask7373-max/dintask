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
    const { tasks } = useTaskStore();
    const { user } = useAuthStore();
    const { notifications } = useNotificationStore();
    const [activeTab, setActiveTab] = useState('today');
    const [listRef] = useAutoAnimate();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // -- Summary Stats Logic --
    const stats = useMemo(() => {
        const todayCount = tasks.filter(t => isToday(parseISO(t.deadline)) && t.status !== 'completed').length;
        const pendingCount = tasks.filter(t => t.status !== 'completed').length;
        const doneCount = tasks.filter(t => t.status === 'completed').length;
        return { today: todayCount, pending: pendingCount, done: doneCount };
    }, [tasks]);

    // -- Filtering Logic --
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const taskDate = parseISO(task.deadline);
            if (activeTab === 'today') {
                return isToday(taskDate) && task.status !== 'completed';
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
        <div className="bg-background-light dark:bg-background-dark min-h-screen w-full font-display text-text-main dark:text-white pb-28">
            {/* -- Header Section -- */}
            <motion.header
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="flex items-center justify-between py-6 px-6"
            >
                <div className="flex flex-col">
                    <h2 className="text-2xl font-extrabold leading-tight tracking-[-0.02em] flex items-center gap-2">
                        Good Morning, {user?.name?.split(' ')[0] || 'User'}
                    </h2>
                    <p className="text-text-secondary dark:text-gray-400 text-sm font-medium">
                        {format(new Date(), 'EEEE, MMM dd')} • {stats.today} tasks today
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <motion.div {...scaleOnTap} className="relative">
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700"
                            onClick={() => navigate('/employee/notifications')}
                        >
                            <Bell size={20} className="text-primary" />
                        </Button>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background-light dark:border-background-dark shadow-sm">
                                {unreadCount}
                            </span>
                        )}
                    </motion.div>
                </div>
            </motion.header>

            {/* -- Summary Pills -- */}
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid grid-cols-3 gap-3 px-6 pt-2 pb-6"
            >
                <motion.div variants={fadeInUp} className="flex flex-col gap-1 rounded-xl p-4 bg-primary text-white shadow-lg shadow-primary/20">
                    <p className="text-[11px] uppercase tracking-wider font-bold opacity-80">Today</p>
                    <p className="text-2xl font-extrabold leading-none">{stats.today}</p>
                </motion.div>
                <motion.div variants={fadeInUp} className="flex flex-col gap-1 rounded-xl p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <p className="text-[11px] uppercase tracking-wider font-bold text-text-secondary">Pending</p>
                    <p className="text-2xl font-extrabold leading-none">{stats.pending}</p>
                </motion.div>
                <motion.div variants={fadeInUp} className="flex flex-col gap-1 rounded-xl p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <p className="text-[11px] uppercase tracking-wider font-bold text-text-secondary">Done</p>
                    <p className="text-2xl font-extrabold leading-none">{stats.done}</p>
                </motion.div>
            </motion.div>

            {/* -- Tabs Navigation -- */}
            <div className="mb-4 px-6">
                <div className="flex border-b border-slate-200 dark:border-slate-700 transition-all relative">
                    {['today', 'upcoming', 'completed'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex flex-col items-center justify-center pb-3 pt-2 flex-1 transition-all relative",
                                activeTab === tab ? "text-primary border-b-[3px] border-primary" : "text-text-secondary border-b-[3px] border-transparent"
                            )}
                        >
                            <p className="text-sm font-bold capitalize">{tab}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* -- Task List Feed -- */}
            <div ref={listRef} className="flex flex-col gap-4 px-6 min-h-[300px]">
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

            {/* -- Floating Action Button -- */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-24 right-6 size-14 rounded-full bg-primary-600 text-white shadow-xl shadow-primary-500/40 flex items-center justify-center z-30 transition-transform"
                onClick={() => navigate('/employee/tasks/new')}
            >
                <Plus size={28} />
            </motion.button>

            {/* -- Aesthetic Blur Gradient -- */}
            <div className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent pointer-events-none z-10"></div>
        </div>
    );
};

export default TaskHome;
