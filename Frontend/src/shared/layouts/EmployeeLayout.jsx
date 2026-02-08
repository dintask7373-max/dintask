import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar as CalendarIcon,
    StickyNote,
    User,
    Bell,
    Users,
    LifeBuoy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/shared/utils/cn';
import useAuthStore from '@/store/authStore';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/components/ui/avatar';
import { scaleOnTap } from '@/shared/utils/animations';

const EmployeeLayout = () => {
    const location = useLocation();

    const navItems = [
        { name: 'Home', path: '/employee', icon: LayoutDashboard },
        { name: 'Calendar', path: '/employee/calendar', icon: CalendarIcon },
        { name: 'Join', path: '/employee/join', icon: Users },
        { name: 'Notes', path: '/employee/notes', icon: StickyNote },
        { name: 'Profile', path: '/employee/profile', icon: User },
        { name: 'Support', path: '/employee/support', icon: LifeBuoy },
    ];

    const mainPaths = ['/employee', '/employee/calendar', '/employee/notes', '/employee/profile', '/employee/join', '/employee/support'];
    const showFooter = mainPaths.includes(location.pathname);

    return (
        <div className="fixed inset-0 h-[100dvh] w-full flex flex-col bg-white dark:bg-slate-950 font-display transition-colors duration-300 overflow-hidden">
            {/* Page Content */}
            <main className="flex-1 overflow-y-auto no-scrollbar relative w-full">
                <div className={cn(
                    "max-w-[480px] mx-auto w-full h-full",
                    showFooter ? "pb-28" : "pb-6"
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
                        className="fixed bottom-0 left-1/2 w-full max-w-[480px] h-[72px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-t border-slate-200/50 dark:border-slate-800/50 shadow-[0_-15px_40px_rgba(0,0,0,0.08)] z-50 px-4 flex items-center justify-around rounded-t-[2.2rem]"
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
                                            <item.icon
                                                size={22}
                                                strokeWidth={isActive ? 2.5 : 2}
                                                className={cn(
                                                    "transition-all duration-300 relative z-10",
                                                    isActive ? "-translate-y-0.5" : ""
                                                )}
                                            />
                                        </div>
                                        <span className={cn(
                                            "text-[8.5px] font-black mt-0.5 tracking-tight uppercase transition-all duration-300",
                                            isActive ? "text-[#4461f2] opacity-100 translate-y-0" : "text-slate-400 opacity-60 translate-y-0.5"
                                        )}>
                                            {item.name}
                                        </span>
                                    </motion.div>

                                    {/* Small Active Dot */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="active_dot"
                                            className="absolute bottom-1 size-1 bg-[#4461f2] rounded-full shadow-[0_0_10px_#4461f2]"
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
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
