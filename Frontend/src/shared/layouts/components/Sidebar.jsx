import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    CheckSquare,
    Users,
    BarChart3,
    Calendar as CalendarIcon,
    CreditCard,
    Settings as SettingsIcon,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Menu,
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    ChevronDown,
    Briefcase,
    ListChecks,
    TrendingUp,
    UserPlus,
    MessageSquare,
    Lock,
    LifeBuoy,
    History,
    Receipt,
    Activity
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/components/ui/button';
import useAuthStore from '@/store/authStore';
import useSuperAdminStore from '@/store/superAdminStore';

const Sidebar = ({ role, isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
    const logout = useAuthStore(state => state.logout);
    const navigate = useNavigate();
    const location = useLocation();
    const inquiries = useSuperAdminStore(state => state.inquiries);
    const newInquiriesCount = inquiries.filter(inq => inq.status === 'new').length;

    const isSuperAdmin = role === 'superadmin';
    const isManager = role === 'manager';
    const isAdmin = role === 'admin';

    const [isSettingsOpen, setIsSettingsOpen] = useState(
        (isSuperAdmin && location.pathname.startsWith('/superadmin/settings')) ||
        (isManager && location.pathname.startsWith('/manager/settings')) ||
        (isAdmin && location.pathname.startsWith('/admin/settings'))
    );

    const sidebarSearchParams = new URLSearchParams(location.search);
    const activeTab = sidebarSearchParams.get('tab') || 'profile';

    const handleLogout = () => {
        logout();
        if (role === 'superadmin') navigate('/superadmin/login');
        else if (role === 'admin') navigate('/admin/login');
        else if (role === 'manager') navigate('/manager/login');
        else navigate('/employee/login');
    };

    const navItems = [
        ...(role === 'manager'
            ? [
                { name: 'Dashboard', path: '/manager', icon: LayoutDashboard },
                { name: 'Assign Task', path: '/manager/assign-task', icon: CheckSquare },
                { name: 'My Tasks', path: '/manager/my-tasks', icon: ListChecks },
                { name: 'Delegation', path: '/manager/delegation', icon: Users },
                { name: 'Team', path: '/manager/team', icon: Users },
                { name: 'Progress', path: '/manager/progress', icon: BarChart3 },
                { name: 'Chat', path: '/manager/chat', icon: MessageSquare },
                { name: 'Schedule', path: '/manager/schedule', icon: CalendarIcon },
                { name: 'Settings', path: '/manager/settings', icon: SettingsIcon },
                { name: 'Reports', path: '/manager/reports', icon: BarChart3 },
                { name: 'Support', path: '/manager/support', icon: LifeBuoy },
            ]
            : []),
        ...(role === 'sales'
            ? [
                { name: 'Dashboard', path: '/sales', icon: LayoutDashboard },
                { name: 'CRM', path: '/sales/crm', icon: Briefcase },
                { name: 'Deals', path: '/sales/deals', icon: CheckSquare },
                { name: 'Sales Tasks', path: '/sales/tasks', icon: CheckSquare },
                { name: 'Clients', path: '/sales/clients', icon: Users },
                { name: 'Reports', path: '/sales/reports', icon: BarChart3 },
                { name: 'Schedule', path: '/sales/schedule', icon: CalendarIcon },
                { name: 'Settings', path: '/sales/settings', icon: SettingsIcon },
                { name: 'Support', path: '/sales/support', icon: LifeBuoy },
            ]
            : []),
        ...(role === 'admin'
            ? [
                { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
                { name: 'Tasks', path: `/${role}/tasks`, icon: CheckSquare },
                { name: 'CRM', path: '/admin/crm', icon: Briefcase },
                { name: 'Managers', path: '/admin/managers', icon: ShieldCheck },
                { name: 'Employees', path: '/admin/employees', icon: Users },
                { name: 'Join Requests', path: '/admin/requests', icon: UserPlus },
                { name: 'Sales', path: '/admin/sales', icon: TrendingUp },
                { name: 'Reports', path: `/${role}/reports`, icon: BarChart3 },
                { name: 'Chat', path: '/admin/chat', icon: MessageSquare },
                { name: 'Calendar', path: `/${role}/calendar`, icon: CalendarIcon },
                { name: 'Subscription', path: '/admin/subscription', icon: CreditCard },
                { name: 'Support', path: '/admin/support', icon: LifeBuoy },
                { name: 'Settings', path: `/${role}/settings`, icon: SettingsIcon },
            ]
            : []),
        ...(role === 'superadmin'
            ? [
                { name: 'Dashboard', path: '/superadmin', icon: LayoutDashboard },
                { name: 'Inquiries', path: '/superadmin/inquiries', icon: ListChecks },
                { name: 'Admins', path: '/superadmin/admins', icon: Users },
                { name: 'Global Users', path: '/superadmin/users', icon: Activity },
                { name: 'Billing', path: '/superadmin/billing', icon: Receipt },
                { name: 'Support', path: '/superadmin/support', icon: LifeBuoy },
                { name: 'History', path: '/superadmin/history', icon: History },
                { name: 'Plans', path: '/superadmin/plans', icon: CreditCard },
                { name: 'Settings', path: `/${role}/settings`, icon: SettingsIcon },
            ]
            : []),
    ];

    const managerSettingsSubItems = isManager
        ? [
            { name: 'Profile Information', path: '/manager/settings/profile', icon: User },
            { name: 'Notifications', path: '/manager/settings/notifications', icon: Bell },
        ]
        : [];

    const adminSettingsSubItems = isAdmin
        ? [
            { name: 'Profile', path: '/admin/settings?tab=profile', icon: User, tab: 'profile' },
            { name: 'Security', path: '/admin/settings?tab=security', icon: Shield, tab: 'security' },
            { name: 'Appearance', path: '/admin/settings?tab=appearance', icon: Palette, tab: 'appearance' },
        ]
        : [];

    const superAdminSettingsSubItems = isSuperAdmin
        ? [
            { name: 'Account', path: '/superadmin/settings?tab=profile', icon: User, tab: 'profile' },
            { name: 'Security', path: '/superadmin/settings?tab=security', icon: Lock, tab: 'security' },
            { name: 'Platform', path: '/superadmin/settings?tab=platform', icon: SettingsIcon, tab: 'platform' },
        ]
        : [];

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 transition-all duration-300 z-50 overflow-hidden",
                isCollapsed ? "w-20" : "w-64",
                isOpen ? "translate-x-0" : "-translate-x-full",
                "lg:translate-x-0"
            )}
        >
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 mb-4 border-b border-slate-100 dark:border-slate-900 h-16 shrink-0">
                    {!isCollapsed && (
                        <div className="flex items-center gap-3 font-black text-xl text-slate-900 dark:text-white tracking-tighter">
                            <div className="h-9 w-9 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                                <img src="/dintask-logo.png" alt="DinTask" className="h-full w-full object-cover" />
                            </div>
                            <span>DinTask</span>
                        </div>
                    )}
                    {isCollapsed && (
                        <div className="h-10 w-10 rounded-xl overflow-hidden mx-auto shadow-sm border border-slate-100">
                            <img src="/dintask-logo.png" alt="DinTask" className="h-full w-full object-cover" />
                        </div>
                    )}

                    {!isCollapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-xl hidden lg:flex"
                        >
                            <ChevronLeft size={20} />
                        </Button>
                    )}
                    {isCollapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-xl hidden lg:flex mt-2"
                        >
                            <ChevronRight size={20} />
                        </Button>
                    )}
                </div>

                <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto no-scrollbar py-2">
                    {navItems.map((item) => {
                        const isSettingsItem = (isManager || isAdmin || isSuperAdmin) && item.name === 'Settings';

                        if (isSettingsItem) {
                            return (
                                <div key={item.path}>
                                    <button
                                        type="button"
                                        onClick={() => setIsSettingsOpen(prev => !prev)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-bold group w-full text-left",
                                            "text-slate-500 hover:bg-slate-50 hover:text-primary-600 dark:text-slate-400 dark:hover:bg-slate-900"
                                        )}
                                    >
                                        <item.icon size={20} className={cn(
                                            "min-w-[20px]",
                                            isCollapsed ? "mx-auto" : ""
                                        )} />
                                        {!isCollapsed && (
                                            <>
                                                <span className="truncate flex-1 ml-3 text-xs uppercase tracking-widest">{item.name}</span>
                                                <ChevronDown
                                                    size={14}
                                                    className={cn(
                                                        "transition-transform",
                                                        !isSettingsOpen && "-rotate-90"
                                                    )}
                                                />
                                            </>
                                        )}
                                    </button>

                                    {!isCollapsed && isSettingsOpen && (
                                        <div className="mt-1 ml-4 border-l border-slate-100 dark:border-slate-800 space-y-1">
                                            {(isManager
                                                ? managerSettingsSubItems
                                                : isAdmin
                                                    ? adminSettingsSubItems
                                                    : superAdminSettingsSubItems
                                            ).map((subItem) => {
                                                const isActiveSub = isManager
                                                    ? location.pathname === subItem.path
                                                    : activeTab === subItem.tab;

                                                return (
                                                    <NavLink
                                                        key={subItem.name}
                                                        to={subItem.path}
                                                        onClick={() => setIsOpen(false)}
                                                        className={cn(
                                                            "flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-[11px] font-black uppercase tracking-widest group ml-4",
                                                            isActiveSub
                                                                ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20"
                                                                : "text-slate-500 hover:text-primary-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900"
                                                        )}
                                                    >
                                                        <subItem.icon size={14} className="min-w-[14px]" />
                                                        <span className="truncate">{subItem.name}</span>
                                                    </NavLink>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === `/${role}`}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-bold group border border-transparent",
                                    isActive
                                        ? "bg-primary-600 text-white shadow-lg shadow-primary-900/30"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-primary-600 dark:text-slate-400 dark:hover:bg-slate-900"
                                )}
                            >
                                <item.icon size={20} className={cn(
                                    "min-w-[20px]",
                                    isCollapsed ? "mx-auto" : ""
                                )} />
                                {!isCollapsed && <span className="truncate ml-3 text-xs uppercase tracking-widest">{item.name}</span>}
                                {!isCollapsed && item.name === 'Inquiries' && newInquiriesCount > 0 && (
                                    <span className={cn(
                                        "ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black shadow-sm",
                                        "bg-primary-600 text-white"
                                    )}>
                                        {newInquiriesCount}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold",
                            isCollapsed && "justify-center"
                        )}
                        onClick={handleLogout}
                    >
                        <LogOut size={20} />
                        {!isCollapsed && <span className="ml-3 text-xs uppercase tracking-widest">Logout</span>}
                    </Button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
