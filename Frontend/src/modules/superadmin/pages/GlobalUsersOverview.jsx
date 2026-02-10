import React, { useState } from 'react';
import {
    Users,
    MousePointer2,
    Calendar,
    Shield,
    Briefcase,
    Target,
    Activity,
    TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Cell,
    PieChart,
    Pie
} from 'recharts';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import useSuperAdminStore from '@/store/superAdminStore';

const GlobalUsersOverview = () => {
    const {
        stats,
        roleDistribution,
        growthData,
        fetchDashboardStats,
        fetchRoleDistribution,
        fetchUserGrowth
    } = useSuperAdminStore();

    const [growthPeriod, setGrowthPeriod] = useState('6');

    React.useEffect(() => {
        fetchDashboardStats();
        fetchRoleDistribution();
    }, []);

    React.useEffect(() => {
        fetchUserGrowth(parseInt(growthPeriod));
    }, [growthPeriod]);

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
            </div>

            {/* Tactical Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { label: 'Total Users', value: stats.totalUsers || 0, icon: Users, trend: `${stats.monthlyGrowthPercentage > 0 ? '+' : ''}${stats.monthlyGrowthPercentage}%`, color: 'from-blue-600 to-indigo-600' },
                    { label: 'Active Now', value: stats.activeUsers || 0, icon: Activity, trend: 'Live', color: 'from-emerald-500 to-teal-600' }, // Now reflects real Active Users (status='active')
                    { label: 'Growth', value: `${stats.monthlyGrowthPercentage || 0}%`, icon: TrendingUp, trend: 'Monthly', color: 'from-amber-500 to-orange-600' }
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
                        <Select value={growthPeriod} onValueChange={setGrowthPeriod}>
                            <SelectTrigger className="w-[110px] h-8 text-[9px] font-black uppercase tracking-tighter bg-slate-50 border-none dark:bg-slate-800 rounded-lg">
                                <SelectValue placeholder="Period" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="6" className="text-[10px] font-bold">Last 6 Months</SelectItem>
                                <SelectItem value="12" className="text-[10px] font-bold">Last 1 Year</SelectItem>
                            </SelectContent>
                        </Select>
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


        </div>
    );
};

export default GlobalUsersOverview;
