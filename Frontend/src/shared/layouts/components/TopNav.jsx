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
import useNotificationStore from '@/store/notificationStore';
import NotificationPanel from './NotificationPanel';
import { cn } from '@/shared/utils/cn';

const TopNav = ({ onMenuClick, isSidebarCollapsed }) => {
    const { user, logout, role } = useAuthStore();
    const { unreadCount, fetchNotifications } = useNotificationStore();
    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    const handleLogout = () => {
        logout();
        navigate('/init');
    };

    return (
        <header className={cn(
            "h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 w-full z-40 transition-all duration-300"
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

                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "relative text-slate-500 hover:text-primary-600 transition-all",
                                isNotificationOpen && "bg-primary-50 text-primary-600 dark:bg-primary-900/20"
                            )}
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                            )}
                        </Button>

                        <NotificationPanel
                            isOpen={isNotificationOpen}
                            onClose={() => setIsNotificationOpen(false)}
                        />
                    </div>

                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="p-0 hover:bg-transparent flex items-center gap-2">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">{user?.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tighter">{role}</p>
                                </div>
                                <Avatar className="h-9 w-9 border-2 border-primary-100 dark:border-primary-900">
                                    <AvatarImage src={user?.profileImage ? (user.profileImage.startsWith('http') ? user.profileImage : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${user.profileImage}`) : `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} />
                                    <AvatarFallback className="bg-primary-600 text-white font-bold">{user?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-2">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/${role}/settings`)}>
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>Profile Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/${role}/notifications`)}>
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
