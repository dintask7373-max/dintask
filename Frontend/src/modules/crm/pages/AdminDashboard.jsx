import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, Award, XCircle, Briefcase, Filter, MapPin } from 'lucide-react';
import useCRMStore from '@/store/crmStore';
import useScheduleStore from '@/store/scheduleStore';
import { fadeInUp, staggerContainer } from '@/shared/utils/animations';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Badge } from '@/shared/components/ui/badge';

const AdminDashboard = () => {
  const { leads, getPipelineData, crmStats, fetchCRMStats } = useCRMStore();
  const { schedules } = useScheduleStore();

  React.useEffect(() => {
    fetchCRMStats();
  }, [fetchCRMStats]);

  const adminMeetings = (schedules || []).filter(s =>
    s.assignedTo?.toLowerCase().includes('admin')
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Sample data for charts
  const pipelineData = getPipelineData();
  // Performance metrics for table
  const employeePerformance = crmStats?.performance || [
    { name: 'Loading...', leads: 0, won: 0, lost: 0, conversion: 0 },
  ];

  // Distribution chart data
  const leadDistribution = crmStats?.leadDistribution || pipelineData.map(stage => ({
    name: stage.stage,
    value: stage.leads.length,
  }));

  const totalLeads = crmStats?.totalLeads || leads.length;
  const activeDeals = crmStats?.activeDeals || leads.filter(lead =>
    ['Contacted', 'Follow-Up', 'Interested', 'Meeting Done', 'Proposal Sent'].includes(lead.status)
  ).length;
  const wonDeals = crmStats?.wonDealsCount || leads.filter(lead => lead.status === 'Won').length;
  const lostDeals = crmStats?.lostDealsCount || leads.filter(lead => lead.status === 'Lost').length;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-8 pb-10"
    >
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 px-1 sm:px-0">
          <div className="lg:hidden w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
            <img src="/dintask-logo.png" alt="DinTask" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              CRM <span className="text-primary-600">Dashboard</span> <TrendingUp className="text-primary-600 hidden sm:block" size={24} />
            </h1>
            <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Strategic overview of company sales performance</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { title: 'Total Leads', value: totalLeads, icon: Users, color: 'blue', desc: '+15% growth' },
          { title: 'Active Deals', value: activeDeals, icon: Briefcase, color: 'indigo', desc: '+8% growth' },
          { title: 'Won Deals', value: wonDeals, icon: Award, color: 'emerald', desc: '+20% growth' },
          { title: 'Lost Deals', value: lostDeals, icon: XCircle, color: 'red', desc: '-10% drop' }
        ].map((item, index) => (
          <motion.div key={index} variants={fadeInUp}>
            <Card className={cn(
              "border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 relative overflow-hidden h-full rounded-2xl",
              `hover:shadow-lg hover:shadow-${item.color}-500/10 transition-all duration-300`
            )}>
              <div className={`absolute -right-4 -top-4 p-4 opacity-[0.03] text-${item.color}-600 dark:text-${item.color}-400 rotate-12`}>
                <item.icon size={100} />
              </div>
              <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-5 pb-1 sm:pb-2 relative z-10">
                <CardTitle className={`text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest`}>{item.title}</CardTitle>
                <div className={`p-1.5 sm:p-2 bg-${item.color}-50 dark:bg-${item.color}-900/20 rounded-lg text-${item.color}-600 dark:text-${item.color}-400`}>
                  <item.icon size={14} className="sm:w-4 sm:h-4" />
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-5 pt-0 relative z-10">
                <div className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight mb-0.5">{item.value}</div>
                <p className={`text-[8px] sm:text-[10px] font-bold ${item.color === 'red' ? 'text-red-500' : 'text-emerald-500'} uppercase tracking-tighter`}>{item.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div variants={fadeInUp}>
        <Tabs defaultValue="pipeline" className="w-full">
          <div className="flex items-center justify-between mb-4 overflow-x-auto no-scrollbar pb-2">
            <TabsList className="bg-slate-100 dark:bg-slate-800/50 h-10 sm:h-11 rounded-xl sm:rounded-2xl p-1 w-full sm:w-auto">
              <TabsTrigger
                value="pipeline"
                className="flex-1 sm:flex-none rounded-lg sm:rounded-xl px-4 sm:px-6 font-black text-[10px] sm:text-xs uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all flex items-center gap-2"
              >
                <Target size={14} /><span className="hidden sm:inline">Pipeline</span>
              </TabsTrigger>
              <TabsTrigger
                value="employee"
                className="flex-1 sm:flex-none rounded-lg sm:rounded-xl px-4 sm:px-6 font-black text-[10px] sm:text-xs uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all flex items-center gap-2"
              >
                <Users size={14} /><span className="hidden sm:inline">Performance</span>
              </TabsTrigger>
              <TabsTrigger
                value="leads"
                className="flex-1 sm:flex-none rounded-lg sm:rounded-xl px-4 sm:px-6 font-black text-[10px] sm:text-xs uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all flex items-center gap-2"
              >
                <Filter size={14} /><span className="hidden sm:inline">Sources</span>
              </TabsTrigger>
              <TabsTrigger
                value="schedule"
                className="flex-1 sm:flex-none rounded-lg sm:rounded-xl px-4 sm:px-6 font-black text-[10px] sm:text-xs uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all flex items-center gap-2"
              >
                <CalendarIcon size={14} /><span className="hidden sm:inline">Schedule</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pipeline" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="border-none shadow-sm rounded-2xl sm:rounded-[2rem] bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 p-4 sm:p-6">
                  <CardTitle className="text-sm sm:text-lg font-black uppercase tracking-widest text-slate-400">Pipeline Overview</CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-6">
                  <div className="h-[250px] sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={leadDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={30}>
                          {leadDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-2xl sm:rounded-[2rem] bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 p-4 sm:p-6">
                  <CardTitle className="text-sm sm:text-lg font-black uppercase tracking-widest text-slate-400">Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="h-[200px] sm:h-[280px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={leadDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {leadDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {leadDistribution.slice(0, 4).map((entry, index) => (
                      <div key={index} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="employee" className="mt-0">
            <Card className="border-none shadow-sm rounded-2xl sm:rounded-[2rem] bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-lg font-black uppercase tracking-widest text-slate-400">Performance Matrix</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-800/30">
                        <TableHead className="w-[180px] whitespace-nowrap px-4 sm:px-6 h-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Employee</TableHead>
                        <TableHead className="text-center whitespace-nowrap h-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Leads</TableHead>
                        <TableHead className="text-center whitespace-nowrap h-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Wins</TableHead>
                        <TableHead className="text-center whitespace-nowrap h-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Loss</TableHead>
                        <TableHead className="text-center whitespace-nowrap h-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Follow-ups</TableHead>
                        <TableHead className="text-right whitespace-nowrap px-4 sm:px-6 h-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Conversion</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employeePerformance.map((employee) => (
                        <TableRow key={employee.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-800 transition-colors">
                          <TableCell className="px-4 sm:px-6 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center text-[10px] font-black">
                                {employee.name.charAt(0)}
                              </div>
                              <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">{employee.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-[11px] font-bold">{employee.leads}</TableCell>
                          <TableCell className="text-center text-[11px] font-bold text-emerald-600">{employee.won}</TableCell>
                          <TableCell className="text-center text-[11px] font-bold text-red-500">{employee.lost}</TableCell>
                          <TableCell className="text-center text-[11px] font-bold text-primary-600">{employee.followUps || 0}</TableCell>
                          <TableCell className="text-right px-4 sm:px-6">
                            <span className={cn(
                              "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest",
                              employee.conversion > 70 ? "bg-emerald-50 text-emerald-600" :
                                employee.conversion > 40 ? "bg-blue-50 text-blue-600" :
                                  "bg-orange-50 text-orange-600"
                            )}>
                              {employee.conversion}%
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="mt-0">
            <Card className="border-none shadow-sm rounded-2xl sm:rounded-[2rem] bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-lg font-black uppercase tracking-widest text-slate-400">Lead Sources</CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                <div className="h-[250px] sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={crmStats?.sourceDistribution || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="source" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                      <Bar dataKey="count" fill="#8884d8" radius={[6, 6, 0, 0]} barSize={35}>
                        {
                          (crmStats?.sourceDistribution || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))
                        }
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="schedule" className="mt-0">
            <Card className="border-none shadow-sm rounded-2xl sm:rounded-[2rem] bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm sm:text-lg font-black uppercase tracking-widest text-slate-400">Recent Follow-ups</CardTitle>
                  <Badge className="bg-primary-600 text-[10px] font-black h-5">{crmStats?.recentFollowUps?.length || 0}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="space-y-2 sm:space-y-3">
                  {crmStats?.recentFollowUps?.length > 0 ? (
                    crmStats.recentFollowUps.map(followup => (
                      <div key={followup._id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex flex-col items-center justify-center text-primary-600 shrink-0">
                            <span className="text-[8px] sm:text-[10px] font-black uppercase">{format(new Date(followup.scheduledAt), 'MMM')}</span>
                            <span className="text-xs sm:text-sm font-black leading-none">{format(new Date(followup.scheduledAt), 'dd')}</span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {followup.leadId?.name || 'Unknown Lead'}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                              <span className="flex items-center gap-1 font-bold whitespace-nowrap">
                                <Users size={10} /> {followup.salesRepId?.name}
                              </span>
                              <span className="hidden sm:flex items-center gap-1 font-bold truncate">
                                <Clock size={10} /> {format(new Date(followup.scheduledAt), 'hh:mm a')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize text-[8px] font-black h-5 shrink-0 px-2">
                          {followup.type}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 sm:py-20 flex flex-col items-center justify-center text-slate-400">
                      <CalendarIcon size={40} className="opacity-20 mb-3" />
                      <p className="font-black text-[10px] uppercase tracking-widest">No scheduled events</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
