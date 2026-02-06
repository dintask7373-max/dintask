import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from '@/shared/utils/animations';
import { cn } from '@/shared/utils/cn';

const ManagerLayout = ({ role = 'manager' }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const location = useLocation();

    return (
        <div className="fixed inset-0 h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 flex font-sans transition-colors duration-300 overflow-hidden">
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
                <div className="flex-1 overflow-y-auto scroll-smooth w-full">
                    <main className="w-full min-h-full px-4 md:px-8 pt-20 pb-8">
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
        </div>
    );
};

export default ManagerLayout;
