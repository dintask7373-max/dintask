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
      const lead = leads.find(l => l.id === followUp.leadId);
      const isOwner = lead?.owner === currentUserId;
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
      className="space-y-6 pb-20"
    >
      {/* Header Info */}
      <motion.div variants={fadeInUp} className="px-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none flex items-center gap-3">
              CRM <span className="text-primary-600">Home</span>
            </h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mt-2 leading-none flex items-center gap-1.5">
              Dashboard Overview
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-400 border-none rounded-lg font-black text-[9px] uppercase tracking-widest px-2.5 py-1">
              {format(new Date(), 'HH:mm')}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Assigned Leads', value: assignedLeads.length, icon: Users, color: 'indigo', trend: 'Total' },
          { label: 'Follow-ups', value: todayFollowUps.length, icon: CalendarIcon, color: 'amber', trend: 'Today' },
          { label: 'Pending Tasks', value: pendingTasks.length, icon: ListTodo, color: 'emerald', trend: 'Active' },
          { label: 'Conversion', value: '14.2%', icon: TrendingUp, color: 'primary', trend: 'Rate' }
        ].map((stat, i) => (
          <motion.div key={i} variants={fadeInUp}>
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden group border border-slate-50 dark:border-slate-800/50 hover:shadow-xl hover:shadow-primary-500/5 transition-all">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className={cn(
                  "size-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                  stat.color === 'indigo' ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20" :
                    stat.color === 'amber' ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20" :
                      stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" :
                        "bg-primary-50 text-primary-600 dark:bg-primary-900/20"
                )}>
                  <stat.icon size={20} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{stat.value}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="h-0.5 w-4 bg-slate-100 dark:bg-slate-800 rounded-full" />
                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest italic">{stat.trend}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Activity Graph */}
      <motion.div variants={fadeInUp}>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-50 dark:border-slate-800/50">
          <CardHeader className="py-4 px-6 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Activity Overview</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest rounded-lg border-slate-100 dark:border-slate-800 h-6">W-52</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="h-[180px] sm:h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e6fd9" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#1e6fd9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.02)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                      fontSize: '10px',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      padding: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke="#1e6fd9"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorLeads)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sections with Tabs */}
      <motion.div variants={fadeInUp}>
        <Tabs defaultValue="leads" className="w-full">
          <div className="flex items-center justify-center mb-6">
            <TabsList className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl h-11 w-full max-w-md border border-slate-100 dark:border-slate-800 shadow-sm">
              <TabsTrigger
                value="leads"
                className="flex-1 rounded-xl h-8 text-[9px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary-600 data-[state=active]:shadow-sm"
              >
                Leads
              </TabsTrigger>
              <TabsTrigger
                value="followups"
                className="flex-1 rounded-xl h-8 text-[9px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary-600 data-[state=active]:shadow-sm"
              >
                Schedule
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className="flex-1 rounded-xl h-8 text-[9px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary-600 data-[state=active]:shadow-sm"
              >
                Tasks
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="leads" className="mt-0 focus-visible:outline-none focus-visible:ring-0 space-y-3">
            {assignedLeads.length > 0 ? (
              assignedLeads.map((lead) => (
                <motion.div
                  key={lead.id}
                  variants={fadeInUp}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-50 dark:border-slate-800/50 shadow-sm flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600 transition-all">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="text-[11px] font-black uppercase tracking-tight text-slate-900 dark:text-white transition-colors group-hover:text-primary-600">{lead.name}</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{lead.company}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      className={cn(
                        "border-none px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                        lead.status === 'Won' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' :
                          lead.status === 'Lost' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' :
                            lead.status === 'Interested' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' :
                              'bg-slate-100 text-slate-600 dark:bg-slate-800'
                      )}
                    >
                      {lead.status}
                    </Badge>
                    <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">{format(new Date(lead.createdAt), 'dd MMM')}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <Users size={40} className="mb-3 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Leads</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="followups" className="mt-0 space-y-3">
            {todayFollowUps.length > 0 ? (
              todayFollowUps.map((followUp) => {
                const lead = leads.find(l => l.id === followUp.leadId);
                return (
                  <motion.div
                    key={followUp.id}
                    variants={fadeInUp}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800/50 shadow-sm group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center">
                          <Clock size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-tight text-slate-900 dark:text-white">{lead?.name}</p>
                          <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mt-1">{followUp.type} • {format(new Date(followUp.scheduledAt), 'HH:mm')}</p>
                        </div>
                      </div>
                      <Button size="sm" className="h-7 w-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 p-0">
                        <CheckCircle size={14} />
                      </Button>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic border-l-2 border-slate-100 dark:border-slate-800 pl-3">
                      "{followUp.notes || 'No tactical notes provided.'}"
                    </p>
                  </motion.div>
                )
              })
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl">
                <CalendarIcon size={40} className="mb-3 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Clear Schedule</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="mt-0 space-y-3">
            {pendingTasks.length > 0 ? (
              pendingTasks.map((task) => (
                <motion.div
                  key={task.id}
                  variants={fadeInUp}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-50 dark:border-slate-800/50 shadow-sm flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ListTodo size={20} />
                    </div>
                    <div>
                      <h3 className="text-[11px] font-black uppercase tracking-tight text-slate-900 dark:text-white">{task.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={cn(
                          "h-4 px-1.5 text-[7px] font-black uppercase tracking-tighter border-none",
                          task.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600'
                        )}>
                          {task.priority}
                        </Badge>
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">{format(new Date(task.deadline), 'dd MMM')}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all h-10 w-10">
                    <CheckCircle size={20} />
                  </Button>
                </motion.div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl">
                <ListTodo size={40} className="mb-3 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Tasks</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default EmployeeDashboard;
