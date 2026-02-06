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
    Clock
} from 'lucide-react';
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
    const { admins, stats, fetchAdmins, fetchDashboardStats, updateAdminStatus } = useSuperAdminStore();
    const { role } = useAuthStore();
    const isSuperAdmin = role === 'superadmin';

    React.useEffect(() => {
        fetchDashboardStats();
        fetchAdmins();
    }, [fetchDashboardStats, fetchAdmins]);

    const chartData = [
        { name: 'Jul', revenue: 250000, growth: 12 },
        { name: 'Aug', revenue: 310000, growth: 15 },
        { name: 'Sep', revenue: 280000, growth: 10 },
        { name: 'Oct', revenue: 350000, growth: 18 },
        { name: 'Nov', revenue: 420000, growth: 22 },
        { name: 'Dec', revenue: 485000, growth: 25 },
    ];

    const pieData = [
        { name: 'Starter', value: 4, color: '#94a3b8' },
        { name: 'Pro Team', value: 6, color: '#3b82f6' },
        { name: 'Business', value: 2, color: '#8b5cf6' },
    ];

    const summaryCards = [
        {
            title: 'Total Revenue',
            value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
            trend: '+12.5%',
            icon: <IndianRupee className="text-emerald-500" size={20} />,
            bg: 'bg-emerald-50 dark:bg-emerald-900/10',
            restricted: true // Only for superadmin
        },
        {
            title: 'Active Companies',
            value: stats.activeCompanies,
            trend: '+2',
            icon: <Building2 className="text-blue-500" size={20} />,
            bg: 'bg-blue-50 dark:bg-blue-900/10'
        },
    ].filter(card => !card.restricted || isSuperAdmin);

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
                {/* Total Revenue */}
                {isSuperAdmin && (
                    <motion.div variants={fadeInUp}>
                        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 group transition-all duration-300 overflow-hidden rounded-xl md:rounded-3xl">
                            <CardContent className="p-3 sm:p-5">
                                <div className="flex justify-between items-start mb-2 sm:mb-3">
                                    <div className="p-1.5 sm:p-2.5 rounded-lg md:rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 group-hover:scale-105 transition-transform">
                                        <IndianRupee className="text-emerald-500" size={14} />
                                    </div>
                                    <div className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                                        <ArrowUpRight size={8} /> 12%
                                    </div>
                                </div>
                                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Revenue</p>
                                <h3 className="text-sm sm:text-lg lg:text-2xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">₹{stats.totalRevenue > 100000 ? `${(stats.totalRevenue / 100000).toFixed(1)}L` : stats.totalRevenue.toLocaleString('en-IN')}</h3>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

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
                            <h3 className="text-sm sm:text-lg lg:text-2xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">{stats.activeCompanies}</h3>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Pending Admins Card */}
                <motion.div variants={fadeInUp}>
                    <Card
                        className="border-none shadow-sm bg-white dark:bg-slate-900 group transition-all duration-300 overflow-hidden rounded-xl md:rounded-3xl cursor-pointer"
                        onClick={() => navigate('/superadmin/admins')}
                    >
                        <CardContent className="p-3 sm:p-5">
                            <div className="flex justify-between items-start mb-2 sm:mb-3">
                                <div className="p-1.5 sm:p-2.5 rounded-lg md:rounded-2xl bg-amber-50 dark:bg-amber-900/10 group-hover:scale-105 transition-transform">
                                    <Activity className="text-amber-500" size={14} />
                                </div>
                                {admins.filter(a => a.status === 'pending').length > 0 && (
                                    <Badge className="bg-amber-500 text-[7px] md:text-[8px] font-black uppercase text-white border-none h-4 px-1.5 flex items-center justify-center">Alert</Badge>
                                )}
                            </div>
                            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Pending</p>
                            <h3 className="text-sm sm:text-lg lg:text-2xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
                                {admins.filter(a => a.status === 'pending').length}
                            </h3>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Total Enquiries */}
                <motion.div variants={fadeInUp}>
                    <Card
                        className="border-none shadow-sm bg-white dark:bg-slate-900 group transition-all duration-300 overflow-hidden rounded-xl md:rounded-3xl cursor-pointer"
                        onClick={() => navigate('/superadmin/inquiries')}
                    >
                        <CardContent className="p-3 sm:p-5">
                            <div className="flex justify-between items-start mb-2 sm:mb-3">
                                <div className="p-1.5 sm:p-2.5 rounded-lg md:rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 group-hover:scale-105 transition-transform">
                                    <Zap className="text-indigo-500" size={14} />
                                </div>
                            </div>
                            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Enquiries</p>
                            <h3 className="text-sm sm:text-lg lg:text-2xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
                                {useSuperAdminStore.getState().inquiries.length}
                            </h3>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Pending Approvals Section (Compact) */}
            {admins.filter(a => a.status === 'pending').length > 0 && (
                <motion.div variants={fadeInUp}>
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-xl md:rounded-[2rem] overflow-hidden border-2 border-amber-500/20">
                        <CardHeader className="flex flex-row items-center justify-between px-4 py-2 bg-amber-500/5 border-b border-amber-500/10">
                            <div className="flex items-center gap-1.5">
                                <div className="p-1.5 bg-amber-500 rounded-lg text-white">
                                    <Clock size={12} />
                                </div>
                                <CardTitle className="text-[10px] sm:text-xs font-black text-amber-900 dark:text-amber-500 uppercase tracking-widest leading-none">Approvals Needed</CardTitle>
                            </div>
                            <Badge className="bg-amber-500 text-white font-black text-[8px] px-2 h-4">{admins.filter(a => a.status === 'pending').length}</Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {admins.filter(a => a.status === 'pending').map((adm) => (
                                    <div key={adm._id} className="p-2 sm:p-4 flex items-center justify-between gap-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="flex items-center gap-2 w-full sm:w-auto overflow-hidden">
                                            <Avatar className="h-7 w-7 border-2 border-white dark:border-slate-800 shadow-sm shrink-0">
                                                <AvatarFallback className="bg-amber-100 text-amber-600 font-black text-[9px] tracking-tighter">{adm.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <h4 className="font-black text-slate-900 dark:text-white text-[11px] sm:text-sm leading-tight truncate">{adm.name}</h4>
                                                <p className="text-[8px] font-bold text-slate-400 truncate uppercase tracking-tighter mt-0.5">{adm.owner} • {adm.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <Button
                                                size="sm"
                                                className="h-7 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-black text-[9px] gap-1 text-white border-none"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateAdminStatus(adm._id, 'active');
                                                    toast.success("Account Approved!");
                                                }}
                                            >
                                                <ShieldCheck size={10} /> <span className="hidden sm:inline">Approve</span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-red-500"
                                                onClick={() => navigate('/superadmin/admins')}
                                            >
                                                <ChevronRight size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Growth Chart */}
                {isSuperAdmin && (
                    <motion.div variants={fadeInUp} className="lg:col-span-2">
                        <Card className="h-full border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden rounded-xl md:rounded-[2rem]">
                            <CardHeader className="flex flex-row items-center justify-between px-5 md:px-8 py-4 md:py-6 border-b border-slate-50 dark:border-slate-800/50">
                                <div>
                                    <CardTitle className="text-xs md:text-base font-black uppercase tracking-widest text-slate-900 dark:text-slate-200">Revenue</CardTitle>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Growth trends</p>
                                </div>
                                <Select defaultValue="6">
                                    <SelectTrigger className="w-[90px] md:w-[110px] h-7 md:h-8 text-[8px] md:text-[9px] font-black uppercase tracking-tighter bg-slate-50 border-none dark:bg-slate-800 rounded-lg">
                                        <SelectValue placeholder="Period" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="6" className="text-[10px] font-bold">6M</SelectItem>
                                        <SelectItem value="12" className="text-[10px] font-bold">1Y</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardHeader>
                            <CardContent className="px-3 md:px-6 pb-4 md:pb-6">
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
                                                {adm.name}
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6 border-2 border-white dark:border-slate-800 shadow-sm">
                                                        <AvatarFallback className="text-[9px] font-black bg-primary-50 text-primary-600 uppercase">{adm.owner.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[100px]">{adm.owner}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <Badge variant="outline" className="text-[9px] font-black border-none bg-primary-50 dark:bg-primary-900/10 text-primary-600 uppercase tracking-widest px-2 py-0.5 rounded-md">
                                                    {adm.plan}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-3 text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                                                {adm.joinedDate}
                                            </TableCell>
                                            <TableCell className="py-3 text-right pr-8">
                                                <Badge className={cn(
                                                    "text-[8px] h-5 px-2 font-black uppercase tracking-widest rounded-full",
                                                    adm.status === 'active' ? "bg-emerald-500" :
                                                        adm.status === 'pending' ? "bg-amber-500" : "bg-red-500"
                                                )}>
                                                    {adm.status}
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
                                            <h4 className="font-black text-slate-900 dark:text-white text-sm">{adm.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-5 w-5 border border-white dark:border-slate-800 shadow-sm">
                                                    <AvatarFallback className="text-[8px] font-black bg-primary-50 text-primary-600 uppercase">{adm.owner.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-[11px] font-bold text-slate-500">{adm.owner}</span>
                                            </div>
                                        </div>
                                        <Badge className={cn(
                                            "text-[8px] h-5 px-2 font-black uppercase tracking-widest rounded-full",
                                            adm.status === 'active' ? "bg-emerald-500" :
                                                adm.status === 'pending' ? "bg-amber-500" : "bg-red-500"
                                        )}>
                                            {adm.status}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest border-t border-slate-50 dark:border-slate-800/50 pt-2 text-wrap">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-slate-400">PLAN:</span>
                                            <span className="text-primary-600">{adm.plan}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-slate-400">JOINED:</span>
                                            <span className="text-slate-600 dark:text-slate-300">{adm.joinedDate}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>

    );
};

export default SuperAdminDashboard;
