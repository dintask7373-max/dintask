import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Calendar as CalendarIcon, CheckCircle, Clock, AlertCircle, TrendingUp, Users, ListTodo } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import useCRMStore from '@/store/crmStore';
import useAuthStore from '@/store/authStore';
import useTaskStore from '@/store/taskStore';
import { fadeInUp, staggerContainer } from '@/shared/utils/animations';
import { cn } from '@/shared/utils/cn';

const chartData = [
  { name: 'Mon', leads: 4, tasks: 2 },
  { name: 'Tue', leads: 7, tasks: 5 },
  { name: 'Wed', leads: 5, tasks: 8 },
  { name: 'Thu', leads: 8, tasks: 3 },
  { name: 'Fri', leads: 12, tasks: 6 },
  { name: 'Sat', leads: 9, tasks: 4 },
  { name: 'Sun', leads: 6, tasks: 2 },
];

const EmployeeDashboard = () => {
  const { user } = useAuthStore();
  const { tasks } = useTaskStore();
  const {
    leads,
    followUps,
  } = useCRMStore();

  const currentUserId = user?.id;

  // Filter data for current user
  const assignedLeads = useMemo(() => {
    if (!currentUserId) return [];
    return leads.filter(lead => lead.owner === currentUserId);
  }, [leads, currentUserId]);

  const todayFollowUps = useMemo(() => {
    if (!currentUserId) return [];
    const today = new Date();
    return followUps.filter(followUp => {
      // Find the lead to check ownership (if followUp doesn't have owner, assume lead owner)
      const lead = leads.find(l => l.id === followUp.leadId);
      const isOwner = lead?.owner === currentUserId; // simplified check

      const followUpDate = new Date(followUp.scheduledAt);
      return (
        isOwner &&
        followUpDate.toDateString() === today.toDateString() &&
        followUp.status !== 'Completed'
      );
    });
  }, [followUps, leads, currentUserId]);

  const pendingTasks = useMemo(() => {
    if (!currentUserId) return [];
    return tasks.filter(task =>
      task.status !== 'completed' &&
      (Array.isArray(task.assignedTo) ? task.assignedTo.includes(currentUserId) : task.assignedTo === currentUserId)
    );
  }, [tasks, currentUserId]);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-8 pb-10"
    >
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3">
          <div className="lg:hidden size-9 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
            <img src="/src/assets/logo.png" alt="DinTask" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
              CRM <span className="text-primary-600">Terminal</span>
            </h1>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-1 leading-none">
              Node synchronization: <span className="text-emerald-500">Active</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border-none rounded-lg font-black text-[9px] uppercase tracking-widest px-3 py-1">
            Sync: {format(new Date(), 'HH:mm')}
          </Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Assigned Leads', value: assignedLeads.length, icon: Users, color: 'indigo', trend: '+2 this week' },
          { label: 'Follow-ups', value: todayFollowUps.length, icon: CalendarIcon, color: 'amber', trend: 'Tactical' },
          { label: 'Pending Ops', value: pendingTasks.length, icon: ListTodo, color: 'emerald', trend: 'Priority' },
          { label: 'Conversion', value: '14.2%', icon: TrendingUp, color: 'primary', trend: 'Velocity' }
        ].map((stat, i) => (
          <motion.div key={i} variants={fadeInUp}>
            <Card className="border-none shadow-sm sm:shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden group">
              <CardContent className="p-3 sm:p-5 flex items-center justify-between">
                <div className="space-y-3 sm:space-y-4">
                  <div className={cn(
                    "size-8 sm:size-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0",
                    stat.color === 'indigo' ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20" :
                      stat.color === 'amber' ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20" :
                        stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" :
                          "bg-primary-50 text-primary-600 dark:bg-primary-900/20"
                  )}>
                    <stat.icon size={14} className="sm:size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                    <p className="text-base sm:text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{stat.value}</p>
                    <p className="text-[7px] sm:text-[8px] font-black text-slate-500 uppercase tracking-tighter italic mt-1">{stat.trend}</p>
                  </div>
                </div>
                <div className="hidden sm:block size-16 -mr-4 opacity-[0.03] dark:opacity-[0.07] transform rotate-12 transition-transform group-hover:rotate-0">
                  <stat.icon size={64} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Graph Section - Highly Responsive */}
      <motion.div variants={fadeInUp}>
        <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
          <CardHeader className="py-3 px-5 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-400">Activity Momentum</CardTitle>
              <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic leading-none">Telemetry active</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-primary-500" />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Leads</span>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <div className="size-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ops</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="h-[180px] sm:h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary-600)" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="var(--color-primary-600)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      fontSize: '10px',
                      fontWeight: 900,
                      textTransform: 'uppercase'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorLeads)"
                  />
                  <Area
                    type="monotone"
                    dataKey="tasks"
                    stroke="#cbd5e1"
                    strokeWidth={2}
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <Tabs defaultValue="leads" className="w-full">
          <div className="flex items-center justify-between mb-3 overflow-x-auto scrollbar-hide pb-1">
            <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl h-9 border border-slate-100 dark:border-slate-800 gap-1">
              <TabsTrigger
                value="leads"
                className="rounded-lg px-4 h-7 text-[9px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-primary-600 data-[state=active]:shadow-sm whitespace-nowrap"
              >
                Lead Nodes
              </TabsTrigger>
              <TabsTrigger
                value="followups"
                className="rounded-lg px-4 h-7 text-[9px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-amber-600 data-[state=active]:shadow-sm whitespace-nowrap"
              >
                Sync Schedule
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className="rounded-lg px-4 h-7 text-[9px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm whitespace-nowrap"
              >
                Ops Queue
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="leads" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <Card className="border-none shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
              <CardHeader className="py-2.5 sm:py-3 px-4 sm:px-6 border-b border-slate-50 dark:border-slate-800">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Assigned Lead core</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto scrollbar-hide">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-slate-50 dark:border-slate-800">
                        <TableHead className="px-4 sm:px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Identifier</TableHead>
                        <TableHead className="px-4 sm:px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Authority</TableHead>
                        <TableHead className="px-4 sm:px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Organization</TableHead>
                        <TableHead className="px-4 sm:px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                        <TableHead className="hidden sm:table-cell px-4 sm:px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Deployment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedLeads.map((lead) => (
                        <TableRow key={lead.id} className="group border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <TableCell className="px-4 sm:px-6 py-2.5">
                            <span className="text-[10px] font-black text-slate-400 tabular-nums uppercase">#{String(lead.id).slice(-4)}</span>
                          </TableCell>
                          <TableCell className="px-4 sm:px-6 py-2.5">
                            <p className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white uppercase truncate max-w-[100px]">{lead.name}</p>
                          </TableCell>
                          <TableCell className="px-4 sm:px-6 py-2.5">
                            <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase truncate max-w-[100px]">{lead.company}</p>
                          </TableCell>
                          <TableCell className="px-4 sm:px-6 py-2.5">
                            <Badge
                              className={cn(
                                "border-none px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest",
                                lead.status === 'Won' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' :
                                  lead.status === 'Lost' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' :
                                    lead.status === 'Interested' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' :
                                      'bg-slate-50 text-slate-600 dark:bg-slate-800'
                              )}
                            >
                              {lead.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell px-4 sm:px-6 py-2.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{format(new Date(lead.createdAt), 'dd MMM yy')}</p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {assignedLeads.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Users size={48} className="opacity-20 mb-3" />
                    <p className="font-medium">No leads assigned to you yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="followups" className="mt-0">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                <CardTitle className="text-lg font-bold">Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {todayFollowUps.length > 0 ? (
                    todayFollowUps.map((followUp) => {
                      const lead = leads.find(l => l.id === followUp.leadId);
                      return (
                        <div key={followUp.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow group">
                          <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                            <CalendarIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                              <div className="font-bold text-slate-900 dark:text-white truncate text-base">
                                {lead?.name} <span className="text-slate-400 font-normal text-sm">from {lead?.company}</span>
                              </div>
                              <Badge variant="secondary" className="w-fit bg-amber-100 text-amber-700 border-amber-200">{followUp.type}</Badge>
                            </div>
                            <div className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-3">
                              <Clock size={14} />
                              {format(new Date(followUp.scheduledAt), 'h:mm a')}
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="truncate">{followUp.notes}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" className="h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs gap-1.5 shadow-sm shadow-emerald-500/20">
                                <CheckCircle size={14} /> Complete
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 rounded-lg border-slate-200 font-bold text-xs gap-1.5 hover:bg-slate-50">
                                <AlertCircle size={14} /> Reschedule
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <CalendarIcon size={48} className="opacity-20 mb-3" />
                      <p className="font-medium">No follow-ups scheduled for today.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-0">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                <CardTitle className="text-lg font-bold">Pending CRM Tasks</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                        <TableHead className="whitespace-nowrap px-6 h-12 text-xs font-bold uppercase tracking-wider text-slate-500">Task ID</TableHead>
                        <TableHead className="whitespace-nowrap h-12 text-xs font-bold uppercase tracking-wider text-slate-500">Title</TableHead>
                        <TableHead className="whitespace-nowrap h-12 text-xs font-bold uppercase tracking-wider text-slate-500">Deadline</TableHead>
                        <TableHead className="whitespace-nowrap h-12 text-xs font-bold uppercase tracking-wider text-slate-500">Priority</TableHead>
                        <TableHead className="whitespace-nowrap h-12 text-xs font-bold uppercase tracking-wider text-slate-500">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingTasks.map((task) => (
                        <TableRow key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-800 transition-colors">
                          <TableCell className="font-bold px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300">{task.id}</TableCell>
                          <TableCell className="whitespace-nowrap font-medium text-slate-900 dark:text-white">{task.title}</TableCell>
                          <TableCell className="whitespace-nowrap text-slate-500">{format(new Date(task.deadline), 'PPP HH:mm')}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge
                              className={cn(
                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-none",
                                task.priority === 'High' ? 'bg-red-100 text-red-700 border-red-200' :
                                  task.priority === 'Medium' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                    'bg-blue-100 text-blue-700 border-blue-200'
                              )}
                            >
                              {task.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline" className="text-slate-600 border-slate-300 px-2.5 py-0.5">{task.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {pendingTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <ListTodo size={48} className="opacity-20 mb-3" />
                    <p className="font-medium">No pending tasks.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default EmployeeDashboard;