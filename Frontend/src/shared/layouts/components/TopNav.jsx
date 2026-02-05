import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User as UserIcon, Menu, X, Sun, Moon, LogOut } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import useAuthStore from '@/store/authStore';
import { cn } from '@/shared/utils/cn';

const TopNav = ({ onMenuClick, isSidebarCollapsed }) => {
    const { user, logout, role } = useAuthStore();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const navigate = useNavigate();

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    const handleLogout = () => {
        logout();
        if (role === 'superadmin') navigate('/superadmin/login');
        else if (role === 'admin') navigate('/admin/login');
        else if (role === 'manager') navigate('/admin/login');
        else navigate('/employee/login');
    };

    return (
        <header className={cn(
            "h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md fixed top-0 right-0 z-40 transition-all duration-300 left-0",
            isSidebarCollapsed ? "lg:left-20" : "lg:left-64"
        )}>
            <div className="flex h-full items-center justify-between px-4 lg:px-8">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={onMenuClick}
                    >
                        <Menu className="h-6 w-6" />
                    </Button>

                    <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 w-64">
                        <Search className="h-4 w-4 text-slate-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search tasks, people..."
                            className="bg-transparent border-none outline-none text-sm w-full dark:text-slate-200"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleDarkMode}
                        className="text-slate-500 hover:text-primary-600"
                    >
                        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>

                    <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-primary-600">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    </Button>

                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="p-0 hover:bg-transparent flex items-center gap-2">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">{user?.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tighter">{role}</p>
                                </div>
                                <Avatar className="h-9 w-9 border-2 border-primary-100 dark:border-primary-900">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} />
                                    <AvatarFallback className="bg-primary-600 text-white font-bold">{user?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-2">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>Profile Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <Bell className="mr-2 h-4 w-4" />
                                <span>Notifications</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

export default TopNav;
