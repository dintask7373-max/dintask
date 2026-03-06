import { useState } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from '@/shared/utils/animations';
import { cn } from '@/shared/utils/cn';
import { LayoutDashboard, MessageSquare, Settings, Users } from 'lucide-react';

const ManagerLayout = ({ role = 'manager' }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const location = useLocation();

    const salesNavItems = [
        { name: 'Dashboard', path: '/sales', icon: LayoutDashboard },
        { name: 'Clients', path: '/sales/clients', icon: Users },
        { name: 'Chat', path: '/sales/chat', icon: MessageSquare },
        { name: 'Setting', path: '/sales/settings', icon: Settings },
    ];

    const showMobileFooter = role === 'sales';

    return (
        <div className={cn(
            "fixed inset-0 h-[100dvh] w-full flex font-sans transition-colors duration-300 overflow-hidden",
            role === 'sales' ? "bg-white dark:bg-slate-950" : "bg-slate-50 dark:bg-slate-950"
        )}>
            {/* Sidebar with mobile responsiveness */}
            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
                role={role}
            />

            {/* Main Content Area */}
            <div className={cn(
                "flex-1 flex flex-col relative h-full w-full transition-all duration-300",
                isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
            )}>
                {/* Header/Top Navigation */}
                <TopNav
                    onMenuClick={() => setIsSidebarOpen(true)}
                    isSidebarCollapsed={isSidebarCollapsed}
                />

                {/* Scrollable Page Content */}
                <div className="flex-1 overflow-y-auto scroll-smooth w-full no-scrollbar">
                    <main className={cn(
                        "w-full min-h-full px-4 md:px-8 pt-6",
                        showMobileFooter ? "pb-16 md:pb-8" : "pb-8"
                    )}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                variants={pageVariants}
                                transition={{ duration: 0.2 }}
                                className="w-full"
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </main>

                    {/* Footer - Scrolls with content */}
                    <footer className="py-6 px-4 md:px-8 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
                                &copy; 2024 <span className="text-primary-600">DINTASK</span> CRM. ALL RIGHTS RESERVED.
                            </p>
                            <div className="flex gap-6">
                                <a href="#" className="text-[10px] font-black text-slate-400 hover:text-primary-500 uppercase tracking-widest transition-colors">Support</a>
                                <a href="#" className="text-[10px] font-black text-slate-400 hover:text-primary-500 uppercase tracking-widest transition-colors">Privacy</a>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Bottom Navigation for Sales Functionality */}
            <AnimatePresence>
                {showMobileFooter && !isSidebarOpen && (
                    <motion.nav
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed bottom-0 left-0 w-full h-[60px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl z-50 px-4 flex items-center justify-around lg:hidden border-t border-slate-200/50 dark:border-slate-800/50 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]"
                    >
                        {salesNavItems.map((item) => {
                            const isActive = location.pathname === item.path || (item.path === '/sales' && location.pathname === '/sales/');

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
                                                    layoutId="sales_icon_glow"
                                                    className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full scale-150 z-0"
                                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.8 }}
                                                />
                                            )}

                                            <item.icon
                                                size={isActive ? 22 : 20}
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
                                                ? "text-[#4461F2] opacity-100 -translate-y-0.5"
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

export default ManagerLayout;
