import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    DollarSign,
    FolderKanban,
    Users,
    Bell,
    TrendingUp,
    Loader2,
    ArrowRight,
    Building2,
    Calendar,
    Phone,
    AlertCircle
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { fadeInUp, staggerContainer } from '@/shared/utils/animations';
import useAuthStore from '@/store/authStore';
import useAdminStore from '@/store/adminStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';
import { formatDistanceToNow } from 'date-fns';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        dashboardStats,
        revenueChartData,
        pipelineChartData,
        projectHealthChartData,
        actionableLists,
        loading,
        fetchDashboardStats,
        fetchRevenueChart,
        fetchPipelineChart,
        fetchProjectHealthChart,
        fetchActionableLists
    } = useAdminStore();

    const [revenuePeriod, setRevenuePeriod] = useState(6);

    useEffect(() => {
        fetchDashboardStats();
        fetchRevenueChart(revenuePeriod);
        fetchPipelineChart();
        fetchProjectHealthChart();
        fetchActionableLists();
    }, [fetchDashboardStats, fetchRevenueChart, fetchPipelineChart, fetchProjectHealthChart, fetchActionableLists, revenuePeriod]);

    const stats = [
        {
            title: "Total Revenue",
            value: dashboardStats?.totalRevenue
                ? `₹${(dashboardStats.totalRevenue / 100000).toFixed(1)}L`
                : '₹0',
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            description: "From won deals",
            trend: "+12.5%"
        },
        {
            title: "Active Projects",
            value: dashboardStats?.activeProjects || 0,
            icon: FolderKanban,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            description: "In progress",
            trend: "+3"
        },
        {
            title: "Total Staff",
            value: dashboardStats?.totalStaff || 0,
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-900/20",
            description: dashboardStats?.staffLimit
                ? `of ${dashboardStats.staffLimit} limit`
                : "No limit set",
            breakdown: dashboardStats?.breakdown
                ? `${dashboardStats.breakdown.managers}M / ${dashboardStats.breakdown.employees}E / ${dashboardStats.breakdown.salesReps}S`
                : ""
        },
        {
            title: "Pending Actions",
            value: dashboardStats?.pendingActions || 0,
            icon: Bell,
            color: "text-amber-600",
            bg: "bg-amber-50 dark:bg-amber-900/20",
            description: "Require attention",
            breakdown: dashboardStats?.breakdown
                ? `${dashboardStats.breakdown.openTickets} tickets, ${dashboardStats.breakdown.pendingProjectConversions} conversions`
                : ""
        }
    ];

    const getStatusColor = (status) => {
        const colors = {
            'New': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            'Contacted': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            'Meeting Done': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
            'Proposal Sent': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            'Won': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            'Lost': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            'Open': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            'Pending': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            'Escalated': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            'High': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            'Medium': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            'Low': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        };
        return colors[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    };

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="lg:hidden w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                        <img src="/dintask-logo.png" alt="DinTask" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Admin Dashboard</h1>
                        <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Welcome back, <span className="font-bold text-primary-600">{user?.name}</span>
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center h-[40vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
            )}

            {/* High-Level Metrics Cards */}
            {!loading && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {stats.map((stat, i) => (
                            <motion.div key={i} variants={fadeInUp}>
                                <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden group hover:shadow-md transition-all duration-300 rounded-2xl sm:rounded-3xl">
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                                            <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                                                <stat.icon size={20} className="sm:w-6 sm:h-6" />
                                            </div>
                                            {stat.trend && (
                                                <Badge variant="secondary" className="bg-slate-50 dark:bg-slate-800 text-[8px] sm:text-[10px] font-black uppercase tracking-tighter px-2 h-5 flex items-center gap-1">
                                                    <TrendingUp size={10} />
                                                    {stat.trend}
                                                </Badge>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">{stat.title}</p>
                                            <h4 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tighter">{stat.value}</h4>
                                            <p className="text-[9px] sm:text-xs text-slate-500 font-medium mt-1">{stat.description}</p>
                                            {stat.breakdown && (
                                                <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{stat.breakdown}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Business Performance Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Revenue Trend Chart */}
                        <motion.div variants={fadeInUp} className="lg:col-span-2">
                            <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
                                    <div>
                                        <CardTitle className="text-sm sm:text-lg font-black uppercase tracking-widest">Revenue Trend</CardTitle>
                                        <CardDescription className="text-[10px] sm:text-xs font-bold">Monthly Performance</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={revenuePeriod === 6 ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setRevenuePeriod(6)}
                                            className={cn(
                                                "h-8 px-3 text-[10px] font-black uppercase",
                                                revenuePeriod === 6 && "bg-primary-600 text-white"
                                            )}
                                        >
                                            6M
                                        </Button>
                                        <Button
                                            variant={revenuePeriod === 12 ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setRevenuePeriod(12)}
                                            className={cn(
                                                "h-8 px-3 text-[10px] font-black uppercase",
                                                revenuePeriod === 12 && "bg-primary-600 text-white"
                                            )}
                                        >
                                            12M
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 pt-0">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={revenueChartData || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#1e293b',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    color: '#fff',
                                                    fontSize: '12px'
                                                }}
                                                formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#10b981"
                                                strokeWidth={3}
                                                dot={{ fill: '#10b981', r: 4 }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Project Health Chart */}
                        <motion.div variants={fadeInUp}>
                            <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden">
                                <CardHeader className="p-4 sm:p-6">
                                    <CardTitle className="text-sm sm:text-lg font-black uppercase tracking-widest">Project Health</CardTitle>
                                    <CardDescription className="text-[10px] sm:text-xs font-bold">Status Distribution</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 pt-0">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={projectHealthChartData || []}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percentage }) => `${name}: ${percentage}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {(projectHealthChartData || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#1e293b',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    color: '#fff',
                                                    fontSize: '12px'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Sales Pipeline Chart */}
                    <motion.div variants={fadeInUp}>
                        <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden">
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="text-sm sm:text-lg font-black uppercase tracking-widest">Sales Pipeline</CardTitle>
                                <CardDescription className="text-[10px] sm:text-xs font-bold">Deal Distribution by Stage</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={pipelineChartData || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: 'none',
                                                borderRadius: '12px',
                                                color: '#fff',
                                                fontSize: '12px'
                                            }}
                                            formatter={(value, name) => [
                                                name === 'count' ? value : `₹${value.toLocaleString()}`,
                                                name === 'count' ? 'Deals' : 'Value'
                                            ]}
                                        />
                                        <Legend />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                        <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Actionable Lists Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Leads */}
                        <motion.div variants={fadeInUp}>
                            <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden">
                                <CardHeader className="p-4 sm:p-6 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm sm:text-base font-black uppercase tracking-widest">Recent Leads</CardTitle>
                                        <CardDescription className="text-[10px] sm:text-xs font-bold">Latest opportunities</CardDescription>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigate('/admin/sales')}
                                        className="text-primary-600 hover:text-primary-700 text-[10px] font-black uppercase"
                                    >
                                        View All <ArrowRight size={14} className="ml-1" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
                                    {actionableLists?.recentLeads?.length > 0 ? (
                                        actionableLists.recentLeads.map((lead) => (
                                            <div key={lead._id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                                                    <Building2 size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="text-sm font-black text-slate-900 dark:text-white truncate">{lead.name}</h5>
                                                    <p className="text-[10px] text-slate-500 font-medium truncate">{lead.company || 'No company'}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge className={cn("text-[8px] font-black uppercase px-2 py-0.5", getStatusColor(lead.status))}>
                                                            {lead.status}
                                                        </Badge>
                                                        <span className="text-[9px] text-slate-400 font-bold">
                                                            {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-slate-400">
                                            <Building2 size={32} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-xs font-bold">No recent leads</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Upcoming Follow-ups */}
                        <motion.div variants={fadeInUp}>
                            <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden">
                                <CardHeader className="p-4 sm:p-6 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm sm:text-base font-black uppercase tracking-widest">Upcoming Follow-ups</CardTitle>
                                        <CardDescription className="text-[10px] sm:text-xs font-bold">Scheduled activities</CardDescription>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigate('/admin/sales')}
                                        className="text-primary-600 hover:text-primary-700 text-[10px] font-black uppercase"
                                    >
                                        View All <ArrowRight size={14} className="ml-1" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
                                    {actionableLists?.upcomingFollowUps?.length > 0 ? (
                                        actionableLists.upcomingFollowUps.map((followUp) => (
                                            <div key={followUp._id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                                                    {followUp.type === 'Call' ? <Phone size={16} /> : <Calendar size={16} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="text-sm font-black text-slate-900 dark:text-white truncate">
                                                        {followUp.leadId?.name || 'Unknown Lead'}
                                                    </h5>
                                                    <p className="text-[10px] text-slate-500 font-medium truncate">
                                                        {followUp.leadId?.company || 'No company'}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge className="text-[8px] font-black uppercase px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                                            {followUp.type}
                                                        </Badge>
                                                        <span className="text-[9px] text-slate-400 font-bold">
                                                            {formatDistanceToNow(new Date(followUp.scheduledAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-slate-400">
                                            <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-xs font-bold">No upcoming follow-ups</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Open Support Tickets */}
                        <motion.div variants={fadeInUp}>
                            <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden">
                                <CardHeader className="p-4 sm:p-6 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm sm:text-base font-black uppercase tracking-widest">Open Tickets</CardTitle>
                                        <CardDescription className="text-[10px] sm:text-xs font-bold">Support requests</CardDescription>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigate('/admin/support')}
                                        className="text-primary-600 hover:text-primary-700 text-[10px] font-black uppercase"
                                    >
                                        View All <ArrowRight size={14} className="ml-1" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
                                    {actionableLists?.openTickets?.length > 0 ? (
                                        actionableLists.openTickets.map((ticket) => (
                                            <div key={ticket._id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                                                    <AlertCircle size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="text-sm font-black text-slate-900 dark:text-white truncate">{ticket.title}</h5>
                                                    <p className="text-[10px] text-slate-500 font-medium truncate">#{ticket.ticketId}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge className={cn("text-[8px] font-black uppercase px-2 py-0.5", getStatusColor(ticket.priority))}>
                                                            {ticket.priority}
                                                        </Badge>
                                                        <Badge className={cn("text-[8px] font-black uppercase px-2 py-0.5", getStatusColor(ticket.status))}>
                                                            {ticket.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-slate-400">
                                            <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-xs font-bold">No open tickets</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default AdminDashboard;
