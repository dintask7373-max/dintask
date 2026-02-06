import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar as CalendarIcon,
    StickyNote,
    User,
    Bell,
    Crown,
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
        { name: 'Upgrade', path: '/employee/subscription', icon: Crown },
        { name: 'Notes', path: '/employee/notes', icon: StickyNote },
        { name: 'Profile', path: '/employee/profile', icon: User },
        { name: 'Support', path: '/employee/support', icon: LifeBuoy },
    ];

    const mainPaths = ['/employee', '/employee/calendar', '/employee/notes', '/employee/profile', '/employee/subscription', '/employee/support'];
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

            {/* Floating Bottom Navigation */}
            <AnimatePresence>
                {showFooter && (
                    <motion.nav
                        initial={{ y: 100, x: '-50%', opacity: 0 }}
                        animate={{ y: 0, x: '-50%', opacity: 1 }}
                        exit={{ y: 100, x: '-50%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-6 left-1/2 w-[95%] max-w-[440px] h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-2xl z-50 px-4 flex items-center justify-between"
                    >
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/employee'}
                                className={({ isActive }) => cn(
                                    "flex flex-col items-center gap-0.5 transition-all outline-none",
                                    isActive
                                        ? "text-primary dark:text-primary-400"
                                        : "text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-primary-400"
                                )}
                            >
                                <motion.div {...scaleOnTap} className="flex flex-col items-center justify-center">
                                    <item.icon size={22} className={cn("transition-all", ({ isActive }) => isActive ? "fill-current" : "")} />
                                    <span className="text-[10px] font-black mt-0.5 tracking-tighter uppercase">{item.name}</span>
                                </motion.div>
                            </NavLink>
                        ))}
                    </motion.nav>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmployeeLayout;
