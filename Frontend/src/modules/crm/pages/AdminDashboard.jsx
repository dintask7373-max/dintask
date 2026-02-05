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
  const { leads, getPipelineData } = useCRMStore();
  const { schedules } = useScheduleStore();

  const adminMeetings = (schedules || []).filter(s =>
    s.assignedTo?.toLowerCase().includes('admin')
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Sample data for charts
  const pipelineData = getPipelineData();
  const employeePerformance = [
    { name: 'John Doe', leads: 15, won: 8, lost: 2 },
    { name: 'Jane Smith', leads: 20, won: 12, lost: 3 },
    { name: 'Mike Johnson', leads: 10, won: 5, lost: 1 },
  ];

  const leadDistribution = pipelineData.map(stage => ({
    name: stage.stage,
    value: stage.leads.length,
  }));

  const totalLeads = leads.length;
  const activeDeals = leads.filter(lead =>
    ['Contacted', 'Follow-Up', 'Interested', 'Meeting Done', 'Proposal Sent'].includes(lead.status)
  ).length;
  const wonDeals = leads.filter(lead => lead.status === 'Won').length;
  const lostDeals = leads.filter(lead => lead.status === 'Lost').length;

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
            <img src="/src/assets/dintask_logo_-removebg-preview.png" alt="DinTask" className="h-full w-full object-cover" />
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
                          <TableCell className="text-right px-4 sm:px-6">
                            <span className={cn(
                              "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest",
                              (employee.won / (employee.won + employee.lost)) > 0.7 ? "bg-emerald-50 text-emerald-600" :
                                (employee.won / (employee.won + employee.lost)) > 0.4 ? "bg-blue-50 text-blue-600" :
                                  "bg-orange-50 text-orange-600"
                            )}>
                              {((employee.won / (employee.won + employee.lost)) * 100).toFixed(0)}%
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
                    <BarChart data={[
                      { source: 'Web', count: 45 },
                      { source: 'Call', count: 30 },
                      { source: 'WA', count: 25 },
                      { source: 'Ref', count: 15 },
                      { source: 'Man', count: 10 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="source" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                      <Bar dataKey="count" fill="#8884d8" radius={[6, 6, 0, 0]} barSize={35}>
                        {
                          [0, 1, 2, 3, 4].map((entry, index) => (
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
                  <CardTitle className="text-sm sm:text-lg font-black uppercase tracking-widest text-slate-400">Events Schedule</CardTitle>
                  <Badge className="bg-primary-600 text-[10px] font-black h-5">{adminMeetings.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="space-y-2 sm:space-y-3">
                  {adminMeetings.length > 0 ? (
                    adminMeetings.map(meeting => (
                      <div key={meeting.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex flex-col items-center justify-center text-primary-600 shrink-0">
                            <span className="text-[8px] sm:text-[10px] font-black uppercase">{format(new Date(meeting.date), 'MMM')}</span>
                            <span className="text-xs sm:text-sm font-black leading-none">{format(new Date(meeting.date), 'dd')}</span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">{meeting.title}</h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                              <span className="flex items-center gap-1 font-bold whitespace-nowrap"><Clock size={10} /> {meeting.time}</span>
                              <span className="hidden sm:flex items-center gap-1 font-bold truncate"><MapPin size={10} /> {meeting.location || 'Remote'}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize text-[8px] font-black h-5 shrink-0 px-2">{meeting.type}</Badge>
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
