import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import useSalesStore from '@/store/salesStore';

const CRMHome = () => {
  const { crmStats, fetchCRMStats } = useSalesStore();

  React.useEffect(() => {
    fetchCRMStats();
  }, [fetchCRMStats]);

  // Use live data or fallbacks
  const leadData = crmStats?.leadDistribution || [
    { name: 'New', value: 0 },
    { name: 'Contacted', value: 0 },
    { name: 'Meeting Done', value: 0 },
    { name: 'Proposal Sent', value: 0 },
    { name: 'Won', value: 0 },
    { name: 'Lost', value: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM Dashboard</h1>
          <p className="text-muted-foreground">Manage your leads, sales pipeline, and follow-ups</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crmStats?.totalLeads || 0}</div>
            <p className="text-xs text-muted-foreground">Global Count</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crmStats?.activeDeals || 0}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Won Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crmStats?.wonDealsCount || 0}</div>
            <p className="text-xs text-muted-foreground text-green-600">Successfully closed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lost Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crmStats?.lostDealsCount || 0}</div>
            <p className="text-xs text-muted-foreground text-red-500">Oppurtunities lost</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leads" className="w-full">
        <TabsList>
          <TabsTrigger value="leads">Leads Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Sales Pipeline</TabsTrigger>
          <TabsTrigger value="tasks">Follow-Up Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="leads" className="mt-4">
          <Card className="border-2 border-primary-100 shadow-xl shadow-primary-200/50 bg-gradient-to-br from-white to-primary-50/20 dark:from-slate-900 dark:to-primary-900/10 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-white/50 dark:bg-slate-900/50 border-b border-primary-50 dark:border-slate-800">
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Lead Distribution</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase text-primary-600/70">By lead status</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', shadow: 'xl' }} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pipeline" className="mt-4">
          <Card className="border-2 border-indigo-100 shadow-xl shadow-indigo-200/50 bg-gradient-to-br from-white to-indigo-50/20 dark:from-slate-900 dark:to-indigo-900/10 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-white/50 dark:bg-slate-900/50 border-b border-indigo-50 dark:border-slate-800">
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Sales Pipeline</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase text-indigo-600/70">Current deals by stage</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Tactical mapping coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tasks" className="mt-4">
          <Card className="border-2 border-emerald-100 shadow-xl shadow-emerald-200/50 bg-gradient-to-br from-white to-emerald-50/20 dark:from-slate-900 dark:to-emerald-900/10 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-white/50 dark:bg-slate-900/50 border-b border-emerald-50 dark:border-slate-800">
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Follow-Up Tasks</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase text-emerald-600/70">Today's scheduled follow-ups</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Synchronization queue coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CRMHome;
