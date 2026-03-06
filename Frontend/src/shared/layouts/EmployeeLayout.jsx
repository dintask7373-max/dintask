import { useNavigate, Outlet, NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar as CalendarIcon,
    StickyNote,
    User,
    Bell,
    Users,
    LifeBuoy,
    LogOut,
    MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/shared/utils/cn';
import useAuthStore from '@/store/authStore';
import useNotificationStore from '@/store/notificationStore';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/components/ui/avatar';
import { scaleOnTap } from '@/shared/utils/animations';
import React from 'react';

const EmployeeLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { unreadCount, fetchNotifications } = useNotificationStore();

    React.useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const navItems = [
        { name: 'Home', path: '/employee', icon: LayoutDashboard },
        { name: 'Calendar', path: '/employee/calendar', icon: CalendarIcon },
        { name: 'Chat', path: '/employee/chat', icon: MessageSquare },
        { name: 'Notes', path: '/employee/notes', icon: StickyNote },
        { name: 'Support', path: '/employee/support', icon: LifeBuoy },
    ];

    const mainPaths = ['/employee', '/employee/calendar', '/employee/notes', '/employee/support', '/employee/profile'];
    const isChatPage = location.pathname === '/employee/chat';
    const showFooter = mainPaths.includes(location.pathname);

    return (
        <div className="fixed inset-0 h-[100dvh] w-full flex flex-col bg-white dark:bg-slate-950 font-display transition-colors duration-300 overflow-hidden relative">
            {/* Unified Premium Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <img
                    src="/WLCOMPAGE .png"
                    alt="Background"
                    className="w-full h-full object-cover opacity-[0.03] dark:opacity-[0.05] grayscale"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80" />
            </div>

            {/* Abstract Shapes for Premium Feel */}
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-100/20 dark:bg-blue-900/10 blur-[120px] rounded-full z-0 pointer-events-none" />

            {/* Top Header */}
            {!isChatPage && (
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-2 z-50 relative">
                    <div className="flex items-center">
                        <div className="h-16 w-32 flex items-center justify-start overflow-hidden -ml-4">
                            <img src="/dintask-logo.png" alt="DinTask" className="h-20 w-auto object-contain" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl text-slate-500 hover:text-[#4461f2] hover:bg-slate-50 dark:hover:bg-slate-800 relative"
                            onClick={() => navigate('/employee/notifications')}
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900 shadow-sm" />
                            )}
                        </Button>
                        <button
                            onClick={() => navigate('/employee/profile')}
                            className="flex items-center gap-2 pl-2 focus:outline-none"
                        >
                            <Avatar className="h-9 w-9 border-2 border-white dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none transition-transform active:scale-90">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback className="bg-[#4461f2] text-white font-black text-[10px] uppercase">
                                    {user?.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        </button>
                    </div>
                </header>
            )}

            {/* Page Content */}
            <main className={cn(
                "flex-1 relative w-full h-full pt-0",
                isChatPage ? "overflow-hidden" : "overflow-y-auto no-scrollbar"
            )}>
                <div className={cn(
                    isChatPage ? "max-w-full h-full" : "max-w-[480px] mx-auto min-h-screen",
                    "w-full",
                    showFooter ? "pb-20" : "pb-0"
                )}>
                    <Outlet />
                </div>
            </main>

            {/* Enhanced Docked Bottom Navigation */}
            <AnimatePresence>
                {showFooter && (
                    <motion.nav
                        initial={{ y: 100, x: '-50%' }}
                        animate={{ y: 0, x: '-50%' }}
                        exit={{ y: 100, x: '-50%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed bottom-0 left-1/2 w-full max-w-[480px] h-[60px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl z-50 px-4 flex items-center justify-around border-t border-slate-200/50 dark:border-slate-800/50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]"
                    >
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path || (item.path === '/employee' && location.pathname === '/employee/');

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className="relative h-full flex flex-col items-center justify-center outline-none flex-1 group"
                                >
                                    <motion.div
                                        whileTap={{ scale: 0.9 }}
                                        className="flex flex-col items-center justify-center relative z-10"
                                    >
                                        <div className={cn(
                                            "relative flex items-center justify-center transition-all duration-500",
                                            isActive ? "text-[#4461f2]" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                        )}>
                                            {/* Glow Background for Active Icon */}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="icon_glow"
                                                    className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full scale-150 z-0"
                                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.8 }}
                                                />
                                            )}

                                            <item.icon
                                                size={isActive ? 24 : 22}
                                                strokeWidth={isActive ? 2.5 : 1.8}
                                                className={cn(
                                                    "transition-all duration-500 relative z-10",
                                                    isActive ? "-translate-y-1 scale-105 drop-shadow-[0_0_8px_rgba(68,97,242,0.4)]" : "group-hover:scale-110"
                                                )}
                                            />
                                        </div>
                                        <span className={cn(
                                            "text-[9px] font-black mt-0.5 tracking-[0.05em] uppercase transition-all duration-300 relative z-10",
                                            isActive
                                                ? "text-[#4461f2] opacity-100 -translate-y-1"
                                                : "text-slate-400 opacity-60 translate-y-0 group-hover:opacity-100"
                                        )}>
                                            {item.name}
                                        </span>
                                    </motion.div>

                                    {/* Premium Active Indicator Bar Removed */}
                                </NavLink>
                            );
                        })}
                    </motion.nav>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmployeeLayout;
