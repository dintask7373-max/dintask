import React, { useMemo } from 'react';
import {
    Users,
    Building2,
    IndianRupee,
    TrendingUp,
    Activity,
    ArrowUpRight,
    Globe,
    ShieldCheck,
    Zap,
    MoreVertical,
    ChevronRight,
    Clock,
    Calendar,
    Lock,
    MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/shared/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import useSuperAdminStore from '@/store/superAdminStore';
import { cn } from '@/shared/utils/cn';
import { fadeInUp, staggerContainer, scaleOnTap } from '@/shared/utils/animations';

import { useNavigate } from 'react-router-dom';

import useAuthStore from '@/store/authStore';

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const {
        admins,
        stats,
        revenueTrends,
        planDistribution,
        pendingSupport,
        recentInquiries,
        fetchAdmins,
        fetchDashboardStats,
        fetchBillingStats,
        fetchPlanDistribution,
        fetchPendingSupport,
        fetchRecentInquiries,
        updateAdminStatus
    } = useSuperAdminStore();
    const { role } = useAuthStore();
    const isSuperAdmin = role === 'superadmin' || role === 'superadmin_staff';
    const isSuperAdminRoot = role === 'superadmin';

    const [revenuePeriod, setRevenuePeriod] = React.useState('6');

    React.useEffect(() => {
        fetchDashboardStats();
        fetchAdmins();
        fetchPlanDistribution();
        fetchPendingSupport();
        fetchRecentInquiries();
    }, []);

    React.useEffect(() => {
        fetchBillingStats(revenuePeriod);
    }, [revenuePeriod]);

    // Use real revenue trends from backend or fallback to empty array
    const chartData = revenueTrends && revenueTrends.length > 0 ? revenueTrends : [];

    // Use real plan distribution from backend or fallback to empty array
    const pieData = planDistribution && planDistribution.length > 0 ? planDistribution : [];



    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-4 md:space-y-6 pb-8 md:pb-12 px-1 md:px-0"
        >
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                    <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        System Overview <ShieldCheck className="text-primary-600 fill-primary-600/10" size={20} />
                    </h1>
                    <p className="text-[9px] sm:text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                        Growth & activity
                    </p>
                </div>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Total Revenue - Root Or Staff (Locked for Staff) */}
                <motion.div variants={fadeInUp}>
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 group transition-all duration-300 overflow-hidden rounded-xl md:rounded-3xl relative">
                        {!isSuperAdminRoot && (
                            <div className="absolute inset-0 bg-slate-50/10 dark:bg-slate-950/20 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-2 text-center">
                                <Lock className="text-slate-400 mb-1" size={16} />
                                <span className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">Confidential Data</span>
                            </div>
                        )}
                        <CardContent className="p-3 sm:p-5">
                            <div className="flex justify-between items-start mb-2 sm:mb-3">
                                <div className="p-1.5 sm:p-2.5 rounded-lg md:rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 group-hover:scale-105 transition-transform">
                                    <IndianRupee className="text-emerald-500" size={14} />
                                </div>
                                {isSuperAdminRoot && (
                                    <div className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                                        <ArrowUpRight size={8} /> {stats?.monthlyGrowthPercentage || 0}%
                                    </div>
                                )}
                            </div>
                            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Revenue</p>
                            <h3 className="text-sm sm:text-lg lg:text-2xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
                                {isSuperAdminRoot
                                    ? `₹${(stats?.totalRevenue || 0) > 100000 ? `${((stats?.totalRevenue || 0) / 100000).toFixed(1)}L` : (stats?.totalRevenue || 0).toLocaleString('en-IN')}`
                                    : '₹ ••••••'
                                }
                            </h3>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Active Companies */}
                <motion.div variants={fadeInUp}>
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 group transition-all duration-300 overflow-hidden rounded-xl md:rounded-3xl">
                        <CardContent className="p-3 sm:p-5">
                            <div className="flex justify-between items-start mb-2 sm:mb-3">
                                <div className="p-1.5 sm:p-2.5 rounded-lg md:rounded-2xl bg-blue-50 dark:bg-blue-900/10 group-hover:scale-105 transition-transform">
                                    <Building2 className="text-blue-500" size={14} />
                                </div>
                                <div className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-black text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded-full uppercase">
                                    Live
                                </div>
                            </div>
                            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Active</p>
                            <h3 className="text-sm sm:text-lg lg:text-2xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">{stats?.activeCompanies || 0}</h3>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Total Users */}
                <motion.div variants={fadeInUp}>
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 group transition-all duration-300 overflow-hidden rounded-xl md:rounded-3xl">
                        <CardContent className="p-3 sm:p-5">
                            <div className="flex justify-between items-start mb-2 sm:mb-3">
                                <div className="p-1.5 sm:p-2.5 rounded-lg md:rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 group-hover:scale-105 transition-transform">
                                    <Users className="text-indigo-500" size={14} />
                                </div>
                                <div className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded-full uppercase">
                                    Global
                                </div>
                            </div>
                            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Total Users</p>
                            <h3 className="text-sm sm:text-lg lg:text-2xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">{stats?.totalUsers || 0}</h3>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Active Support Tickets */}
                <motion.div variants={fadeInUp}>
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 group transition-all duration-300 overflow-hidden rounded-xl md:rounded-3xl cursor-pointer"
                        onClick={() => navigate('/superadmin/support')}>
                        <CardContent className="p-3 sm:p-5">
                            <div className="flex justify-between items-start mb-2 sm:mb-3">
                                <div className="p-1.5 sm:p-3 rounded-xl bg-orange-50 dark:bg-orange-900/10 group-hover:scale-105 transition-transform">
                                    <MessageSquare className="text-orange-500" size={16} />
                                </div>
                                <div className="text-[8px] sm:text-[10px] font-black text-orange-500 uppercase tracking-widest">Ongoing</div>
                            </div>
                            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Pending Tickets</p>
                            <h3 className="text-sm sm:text-lg lg:text-2xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">{pendingSupport?.length || 0}</h3>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>



            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Growth Chart */}
                {isSuperAdmin && (
                    <motion.div variants={fadeInUp} className="lg:col-span-2">
                        <Card className="h-full border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden rounded-xl md:rounded-[2rem] relative">
                            {!isSuperAdminRoot && (
                                <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/60 backdrop-blur-md z-20 flex flex-col items-center justify-center p-8 text-center">
                                    <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 shadow-xl">
                                        <Lock className="text-slate-500" size={28} />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-2 italic">Confidential Growth Data</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase max-w-[200px]">Finance-related insights are restricted to Administrator Root access only.</p>
                                </div>
                            )}
                            <CardHeader className="flex flex-row items-center justify-between px-5 md:px-8 py-4 md:py-6 border-b border-slate-50 dark:border-slate-800/50">
                                <div>
                                    <CardTitle className="text-xs md:text-base font-black uppercase tracking-widest text-slate-900 dark:text-slate-200">Revenue</CardTitle>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Growth trends</p>
                                </div>
                                <Select value={revenuePeriod} onValueChange={setRevenuePeriod} disabled={!isSuperAdminRoot}>
                                    <SelectTrigger className="w-[90px] md:w-[110px] h-7 md:h-8 text-[8px] md:text-[9px] font-black uppercase tracking-tighter bg-slate-50 border-none dark:bg-slate-800 rounded-lg">
                                        <SelectValue placeholder="Period" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="6" className="text-[10px] font-bold">Last 6 Months</SelectItem>
                                        <SelectItem value="12" className="text-[10px] font-bold">Last 1 Year</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardHeader>
                            <CardContent className="px-3 md:px-6 pb-4 md:pb-6">
                                {isSuperAdminRoot && chartData.length > 0 ? (
                                    <div className="h-[160px] md:h-[240px] w-full mt-4">
                                        <ResponsiveContainer width="100%" height="100%" debounce={50}>
                                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                                />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="revenue"
                                                    stroke="#3b82f6"
                                                    strokeWidth={4}
                                                    fillOpacity={1}
                                                    fill="url(#colorRev)"
                                                    animationDuration={2000}
                                                    animationBegin={500}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-[160px] md:h-[240px] w-full mt-4 flex items-center justify-center">
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{isSuperAdminRoot ? 'No revenue data yet' : 'Data Locked'}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Plan Distribution */}
                <motion.div variants={fadeInUp}>
                    <Card className="h-full border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden rounded-xl md:rounded-[2rem]">
                        <CardHeader className="px-5 md:px-8 py-4 md:py-6 border-b border-slate-50 dark:border-slate-800/50">
                            <CardTitle className="text-xs md:text-base font-black uppercase tracking-widest text-slate-900 dark:text-slate-200">Adoption</CardTitle>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Plan distribution</p>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center px-4 md:px-6 pb-4 md:pb-6 pt-3 md:pt-4">
                            {pieData.length > 0 ? (
                                <>
                                    <div className="h-[150px] md:h-[190px] w-full">
                                        <ResponsiveContainer width="100%" height="100%" debounce={50}>
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={75}
                                                    paddingAngle={8}
                                                    dataKey="value"
                                                    animationDuration={1500}
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ fontSize: '10px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="w-full space-y-2 mt-4">
                                        {pieData.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{item.name}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">{item.value} Org</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="h-[150px] md:h-[190px] w-full flex items-center justify-center">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No plan data yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div >

            {/* Bottom Lists Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Pending Support Tickets List */}
                <motion.div variants={fadeInUp}>
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-xl md:rounded-[2rem] overflow-hidden h-full">
                        <CardHeader className="flex flex-row items-center justify-between px-5 py-4 border-b border-slate-50 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                    <ShieldCheck className="text-amber-500" size={14} />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-black uppercase tracking-tight">Pending Support</CardTitle>
                                    <CardDescription className="text-[10px] font-bold">Requires attention</CardDescription>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/superadmin/support')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-amber-500">
                                View All
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                {pendingSupport && pendingSupport.length > 0 ? (
                                    pendingSupport.slice(0, 3).map((ticket) => (
                                        <div key={ticket._id} className="p-3 sm:p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => navigate(`/superadmin/support/${ticket._id}`)}>
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1">{ticket.subject}</h4>
                                                <Badge className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 font-black text-[8px] px-1.5 h-4 uppercase border-none">{ticket.status}</Badge>
                                            </div>
                                            <p className="text-[10px] text-slate-500 line-clamp-2 mb-2">{ticket.description}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <Avatar className="h-4 w-4">
                                                        <AvatarFallback className="text-[8px] bg-slate-100 dark:bg-slate-800">{ticket.creator?.name?.charAt(0) || 'U'}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">{ticket.companyId?.companyName || 'Unknown Company'}</span>
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">{ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM dd') : 'N/A'}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center">
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No pending tickets</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recent Inquiries List */}
                <motion.div variants={fadeInUp}>
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-xl md:rounded-[2rem] overflow-hidden h-full">
                        <CardHeader className="flex flex-row items-center justify-between px-5 py-4 border-b border-slate-50 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                    <Zap className="text-indigo-500" size={14} />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-black uppercase tracking-tight">Recent Inquiries</CardTitle>
                                    <CardDescription className="text-[10px] font-bold">New leads & contacts</CardDescription>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/superadmin/inquiries')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500">
                                View All
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                {recentInquiries && recentInquiries.length > 0 ? (
                                    recentInquiries.slice(0, 3).map((inquiry) => (
                                        <div key={inquiry._id} className="p-3 sm:p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => navigate('/superadmin/inquiries')}>
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-slate-900 dark:text-white text-xs">{inquiry.name}</h4>
                                                <Badge className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 font-black text-[8px] px-1.5 h-4 uppercase border-none">{inquiry.status || 'New'}</Badge>
                                            </div>
                                            <p className="text-[10px] text-slate-500 mb-2 truncate">{inquiry.email}</p>
                                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-lg">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Type:</span>
                                                <span className="text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase">{inquiry.type || 'General'}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center">
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No recent inquiries</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

            </div>

            {/* Recent Activity Table */}
            <motion.div variants={fadeInUp}>
                <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-xl md:rounded-[2rem] overflow-hidden">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 md:px-8 py-4 sm:py-6 gap-3 md:gap-4 border-b border-slate-50 dark:border-slate-800">
                        <div>
                            <CardTitle className="text-sm sm:text-lg font-black uppercase tracking-tight">Recent Registrations</CardTitle>
                            <CardDescription className="text-[10px] sm:text-xs text-slate-500 font-bold">Newly boarded accounts</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/superadmin/admins')} className="text-[10px] font-black uppercase tracking-widest gap-1 text-primary-600 hover:bg-primary-50 rounded-lg w-full sm:w-auto justify-center h-8 md:h-10">
                            View All <ChevronRight size={14} />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-slate-50 dark:border-slate-800">
                                        <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Company Name</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Owner</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Plan</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Joined</TableHead>
                                        <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {admins.slice(0, 3).map((adm) => (
                                        <TableRow
                                            key={adm._id}
                                            className="border-slate-50 dark:border-slate-800 group cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-shadow duration-300"
                                            onClick={() => navigate('/superadmin/admins')}
                                        >
                                            <TableCell className="pl-8 py-3 font-black text-slate-900 dark:text-white text-xs">
                                                {adm.companyName}
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6 border-2 border-white dark:border-slate-800 shadow-sm">
                                                        <AvatarFallback className="text-[9px] font-black bg-primary-50 text-primary-600 uppercase">
                                                            {(adm.name || 'A').charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[100px]">{adm.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <Badge variant="outline" className="text-[9px] font-black border-none bg-primary-50 dark:bg-primary-900/10 text-primary-600 uppercase tracking-widest px-2 py-0.5 rounded-md">
                                                    {adm.subscriptionPlan || 'No Plan'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-3 text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                                                {adm.createdAt ? format(new Date(adm.createdAt), 'MMM dd, yyyy') : 'N/A'}
                                            </TableCell>
                                            <TableCell className="py-3 text-right pr-8">
                                                <Badge className={cn(
                                                    "text-[8px] h-5 px-2 font-black uppercase tracking-widest rounded-full",
                                                    adm.subscriptionStatus === 'active' ? "bg-emerald-500" : "bg-red-500"
                                                )}>
                                                    {adm.subscriptionStatus}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-slate-50 dark:divide-slate-800">
                            {admins.slice(0, 3).map((adm) => (
                                <div
                                    key={adm._id}
                                    className="p-4 space-y-3 active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors"
                                    onClick={() => navigate('/superadmin/admins')}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-0.5">
                                            <h4 className="font-black text-slate-900 dark:text-white text-sm">{adm.companyName}</h4>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-5 w-5 border border-white dark:border-slate-800 shadow-sm">
                                                    <AvatarFallback className="text-[8px] font-black bg-primary-50 text-primary-600 uppercase">
                                                        {(adm.name || 'A').charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-[11px] font-bold text-slate-500">{adm.name}</span>
                                            </div>
                                        </div>
                                        <Badge className={cn(
                                            "text-[8px] h-5 px-2 font-black uppercase tracking-widest rounded-full",
                                            adm.subscriptionStatus === 'active' ? "bg-emerald-500" : "bg-red-500"
                                        )}>
                                            {adm.subscriptionStatus}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest border-t border-slate-50 dark:border-slate-800/50 pt-2 text-wrap">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-slate-400">PLAN:</span>
                                            <span className="text-primary-600">{adm.subscriptionPlan || 'No Plan'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-slate-400">JOINED:</span>
                                            <span className="text-slate-600 dark:text-slate-300">
                                                {adm.createdAt ? format(new Date(adm.createdAt), 'MMM dd') : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div >
        </motion.div >

    );
};

export default SuperAdminDashboard;
