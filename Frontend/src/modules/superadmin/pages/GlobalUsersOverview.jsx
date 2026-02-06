import React, { useState } from 'react';
import {
    Users,
    UserCheck,
    UserPlus,
    Activity,
    Shield,
    Briefcase,
    Target,
    TrendingUp,
    Search,
    Filter,
    ArrowUpRight,
    MousePointer2,
    Calendar,
    Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from 'recharts';

import useSuperAdminStore from '@/store/superAdminStore';

const GlobalUsersOverview = () => {
    const {
        stats,
        roleDistribution,
        growthData,
        hourlyActivity,
        recentLogins,
        fetchDashboardStats,
        fetchRoleDistribution,
        fetchUserGrowth,
        fetchHourlyActivity,
        fetchRecentLogins
    } = useSuperAdminStore();

    React.useEffect(() => {
        fetchDashboardStats();
        fetchRoleDistribution();
        fetchUserGrowth();
        fetchHourlyActivity();
        fetchRecentLogins();
    }, []);

    const roleIcons = {
        'Admins': Shield,
        'Managers': Briefcase,
        'Sales': Target,
        'Employees': Users
    };

    const roleDistWithIcons = roleDistribution.map(role => ({
        ...role,
        icon: roleIcons[role.name] || Users
    }));

    return (
        <div className="p-6 space-y-8 bg-slate-50/50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
                        Global Users <span className="text-primary-600">Overview</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">
                        Tactical Platform Monitoring & User Analytics
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-slate-200 shadow-sm font-bold uppercase text-[10px] tracking-widest h-10 px-4">
                        <Calendar size={14} className="mr-2" /> Last 30 Days
                    </Button>
                    <Button className="bg-primary-600 hover:bg-primary-700 text-white font-bold uppercase text-[10px] tracking-widest h-10 px-4 shadow-lg shadow-primary-500/20">
                        <Activity size={14} className="mr-2" /> Real-time Feed
                    </Button>
                </div>
            </div>

            {/* Tactical Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', value: stats.totalUsers || 0, icon: Users, trend: `${stats.monthlyGrowthPercentage > 0 ? '+' : ''}${stats.monthlyGrowthPercentage}%`, color: 'from-blue-600 to-indigo-600' },
                    { label: 'Active Now', value: stats.activeUsers || 0, icon: Activity, trend: 'Live', color: 'from-emerald-500 to-teal-600' },
                    { label: 'Growth', value: `${stats.monthlyGrowthPercentage || 0}%`, icon: TrendingUp, trend: 'Monthly', color: 'from-amber-500 to-orange-600' },
                    { label: 'Avg Session', value: '24m', icon: MousePointer2, trend: '-2m', color: 'from-purple-600 to-pink-600' }
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-xl shadow-slate-200/50 overflow-hidden group">
                        <CardContent className="p-0">
                            <div className={`h-1.5 bg-gradient-to-r ${stat.color}`} />
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary-600 transition-colors">
                                        <stat.icon size={20} />
                                    </div>
                                    <Badge variant="outline" className={`${stat.trend.includes('+') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-100'} font-bold text-[10px]`}>
                                        {stat.trend}
                                    </Badge>
                                </div>
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</h3>
                                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">
                                    {stat.value.toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Role Distribution & Growth Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Role Breakdown */}
                <Card className="lg:col-span-1 border-none shadow-xl shadow-slate-200/50">
                    <CardHeader className="border-b border-slate-50">
                        <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Shield size={14} className="text-primary-600" />
                            Role Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[250px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={roleDistWithIcons}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {roleDistWithIcons.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none italic">{stats.totalUsers || 0}</span>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Total</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            {roleDistWithIcons.map((role, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 transition-all hover:scale-105">
                                    <div className="size-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${role.color}15`, color: role.color }}>
                                        <role.icon size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{role.name}</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white leading-none tracking-tight">{role.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Growth Chart */}
                <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50">
                    <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={14} className="text-primary-600" />
                            User Growth Analysis
                        </CardTitle>
                        <div className="flex gap-2">
                            {['6M', '1Y', 'ALL'].map(t => (
                                <button key={t} className={`text-[10px] font-black px-3 py-1 rounded-full transition-all ${t === '6M' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={growthData}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row: Activity Feed & Detailed Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Login Activity Monitoring */}
                <Card className="border-none shadow-xl shadow-slate-200/50">
                    <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Activity size={14} className="text-primary-600" />
                            Hourly Peak Activity
                        </CardTitle>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">Online Monitor</Badge>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlyActivity}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="time"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                        cursor={{ fill: '#f8fafc' }}
                                    />
                                    <Bar dataKey="active" radius={[4, 4, 0, 0]}>
                                        {hourlyActivity.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.active > 400 ? '#6366f1' : '#cbd5e1'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Platform Activity */}
                <Card className="border-none shadow-xl shadow-slate-200/50">
                    <CardHeader className="border-b border-slate-50">
                        <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <UserCheck size={14} className="text-primary-600" />
                            Recent Login Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-50 bg-slate-50/50">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Profile</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentLogins.map((login, idx) => (
                                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                                        {login.user.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{login.user}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{login.company}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className={`${login.role === 'Admin' ? 'bg-indigo-50 text-indigo-600' :
                                                    login.role === 'Manager' ? 'bg-purple-50 text-purple-600' :
                                                        login.role === 'Sales' ? 'bg-amber-50 text-amber-600' :
                                                            'bg-emerald-50 text-emerald-600'
                                                    } border-none font-black text-[9px] uppercase tracking-widest px-2 py-0.5`}>
                                                    {login.role}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                                                    <Clock size={12} className="text-slate-300" />
                                                    {login.time}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 font-black text-[9px] uppercase tracking-widest">
                                                    <span className={`size-1.5 rounded-full ${login.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                                                    <span className={login.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}>{login.status}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-center">
                            <Button variant="link" className="text-[10px] font-black text-primary-600 uppercase tracking-widest h-auto p-0 hover:no-underline hover:text-primary-700">
                                View Full Activity Log <ArrowUpRight size={14} className="ml-1" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default GlobalUsersOverview;
