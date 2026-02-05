import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    TrendingUp,
    PhoneCall,
    Contact,
    Menu,
    ArrowLeft,
    LogOut
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/shared/components/ui/sheet';
import { cn } from '@/shared/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

const CRMLayout = ({ role }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const sidebarItems = [
        { icon: <LayoutDashboard size={18} />, label: 'Overview', path: `/${role}/crm` },
        { icon: <Users size={18} />, label: 'Leads', path: `/${role}/crm/leads` },
        { icon: <TrendingUp size={18} />, label: 'Pipeline', path: `/${role}/crm/pipeline` },
        ...(role !== 'manager' ? [{ icon: <PhoneCall size={18} />, label: 'Follow Ups', path: `/${role}/crm/follow-ups` }] : []),
        ...(role !== 'admin' ? [{ icon: <Contact size={18} />, label: 'Contacts', path: `/${role}/crm/contacts` }] : []),
    ];

    const SidebarContent = () => (
        <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 shadow-[2px_0_12px_rgba(0,0,0,0.01)]">
            <div className="p-4 sm:p-5">
                <div className="flex items-center gap-3 mb-6 px-1">
                    <div className="h-9 w-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 text-white shrink-0">
                        <TrendingUp size={18} className="stroke-[3px]" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tight">DinTask</h1>
                        <p className="text-[9px] font-black text-primary-600 tracking-widest uppercase mt-1 opacity-90">CRM SUITE</p>
                    </div>
                </div>

                <div className="mb-5 px-0.5">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2.5 h-9 font-black text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl transition-all duration-200 group border border-slate-100 dark:border-slate-800"
                        onClick={() => navigate(`/${role}`)}
                    >
                        <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-1 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                            <ArrowLeft size={12} className="text-slate-500 dark:text-slate-400 group-hover:text-primary-600" />
                        </div>
                        <span className="truncate text-[10px] uppercase tracking-wider">Back to Main</span>
                    </Button>
                </div>

                <div className="space-y-1.5">
                    {sidebarItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    setIsMobileOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                                        : "text-slate-500 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 hover:text-primary-600 hover:translate-x-1"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 z-0"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">{item.icon}</span>
                                <span className={cn(
                                    "relative z-10 text-[11px] font-black uppercase tracking-wider transition-all duration-300",
                                    isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                                )}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/40 z-10"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mt-auto p-4 border-t border-slate-100 dark:border-slate-800/50">
                <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-100 dark:border-slate-800 transition-all hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                    <p className="text-[10px] font-black text-slate-900 dark:text-white mb-1 uppercase tracking-widest">Support Area</p>
                    <p className="text-[9px] text-slate-400 mb-3 font-medium leading-relaxed">Advanced CRM features documentation</p>
                    <Button size="sm" variant="outline" className="w-full text-[9px] font-black uppercase tracking-widest bg-white dark:bg-slate-900 h-7 rounded-lg border-slate-200 dark:border-slate-700">
                        Docs
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-white dark:bg-slate-950 font-display">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-56 h-full shrink-0">
                <SidebarContent />
            </div>

            {/* Mobile Header & Sidebar */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 z-50 px-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <TrendingUp className="text-white stroke-[3px]" size={14} />
                    </div>
                    <span className="font-black text-slate-900 dark:text-white tracking-tight uppercase text-xs">CRM<span className="text-primary-600 ml-1">Suite</span></span>
                </div>
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
                            <Menu size={18} />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-r-0 w-[260px]">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto md:p-6 p-4 pt-16 md:pt-6 bg-slate-50/40 dark:bg-slate-950">
                <div className="max-w-[1400px] mx-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default CRMLayout;
