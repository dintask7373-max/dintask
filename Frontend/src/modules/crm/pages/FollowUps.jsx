import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Textarea } from '@/shared/components/ui/textarea';
import { Plus, Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, Search, Edit, Trash2, Users } from 'lucide-react';
import { format } from 'date-fns';
import useCRMStore from '@/store/crmStore';
import useAuthStore from '@/store/authStore';
import { cn } from '@/shared/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

const FollowUps = () => {
  const {
    leads,
    followUps,
    salesExecutives,
    addFollowUp,
    updateFollowUp,
    deleteFollowUp,
    fetchLeads,
    fetchFollowUps,
    fetchSalesExecutives
  } = useCRMStore();

  const { role } = useAuthStore();
  const isAdmin = role === 'admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [open, setOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [time, setTime] = useState('12:00');
  const [formData, setFormData] = useState({
    leadId: '',
    salesRepId: '',
    type: 'Call',
    notes: '',
    status: 'Scheduled',
  });

  const [leadSearch, setLeadSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const followUpTypes = ['Call', 'Meeting', 'Email', 'WhatsApp'];
  const followUpStatuses = ['Scheduled', 'Completed', 'Missed', 'Cancelled'];

  React.useEffect(() => {
    fetchLeads();
    fetchFollowUps();
    if (isAdmin) {
      fetchSalesExecutives();
    }
  }, [isAdmin, fetchSalesExecutives, fetchLeads, fetchFollowUps]);

  const suggestedLeads = useMemo(() => {
    if (!leadSearch || !leads) return [];
    const searchLower = leadSearch.toLowerCase();
    return leads.filter(lead =>
      lead.name.toLowerCase().includes(searchLower) ||
      lead.company.toLowerCase().includes(searchLower)
    );
  }, [leads, leadSearch]);

  const filteredFollowUps = useMemo(() => {
    if (!followUps || !leads) return [];
    return followUps.filter((followUp) => {
      const leadId = followUp.leadId?._id || followUp.leadId;
      const lead = leads.find(l => l.id === leadId || l._id === leadId) || (typeof followUp.leadId === 'object' ? followUp.leadId : null);

      const matchesSearch =
        lead?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead?.company?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || followUp.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [followUps, leads, searchTerm, filterStatus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.leadId) {
      alert("Please select a valid lead.");
      return;
    }

    const scheduledAt = new Date(selectedDate);
    const [hours, minutes] = time.split(':').map(Number);
    scheduledAt.setHours(hours, minutes, 0, 0);

    const followUpData = {
      ...formData,
      scheduledAt: scheduledAt.toISOString(),
    };

    if (editingFollowUp) {
      updateFollowUp(editingFollowUp.id || editingFollowUp._id, followUpData);
    } else {
      addFollowUp(followUpData);
    }
    resetForm();
    setOpen(false);
  };

  const handleEdit = (followUp) => {
    setEditingFollowUp(followUp);
    setFormData({
      leadId: followUp.leadId?._id || followUp.leadId,
      salesRepId: followUp.salesRepId?._id || followUp.salesRepId || '',
      type: followUp.type,
      notes: followUp.notes,
      status: followUp.status,
    });
    setSelectedDate(new Date(followUp.scheduledAt));
    setTime(format(new Date(followUp.scheduledAt), 'HH:mm'));

    // Set lead search
    const leadId = followUp.leadId?._id || followUp.leadId;
    const lead = leads.find(l => l.id === leadId || l._id === leadId);
    if (lead) setLeadSearch(lead.name);
    else if (typeof followUp.leadId === 'object') setLeadSearch(followUp.leadId.name);

    setOpen(true);
  };

  const handleDelete = (followUpId) => {
    if (confirm('Are you sure?')) {
      deleteFollowUp(followUpId);
    }
  };

  const handleStatusChange = (followUpId, status) => {
    updateFollowUp(followUpId, { status });
  };

  const resetForm = () => {
    setEditingFollowUp(null);
    setFormData({ leadId: '', salesRepId: '', type: 'Call', notes: '', status: 'Scheduled' });
    setLeadSearch('');
    setSelectedDate(new Date());
    setTime('12:00');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3">
          <div className="lg:hidden size-9 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
            <img src="/dintask-logo.png" alt="DinTask" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
              Follow-up <span className="text-primary-600">Terminal</span>
            </h1>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-1 leading-none">
              Node synchronization active
            </p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="h-9 px-4 sm:px-6 shadow-lg shadow-primary-500/20 bg-primary-600 hover:bg-primary-700 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest w-full sm:w-auto">
              <Plus className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Initialize Sync</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingFollowUp ? 'Edit Sync' : 'Schedule Sync'}</DialogTitle>
              <DialogDescription>Input tactical interaction details.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">

              {isAdmin && (
                <div className="space-y-2">
                  <Label>Assign To (Sales Rep)</Label>
                  <Select
                    value={formData.salesRepId}
                    onValueChange={(v) => setFormData({ ...formData, salesRepId: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select Sales Executive" /></SelectTrigger>
                    <SelectContent>
                      {salesExecutives?.map(s => (
                        <SelectItem key={s.id || s._id} value={s.id || s._id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2 relative">
                <Label>Lead Anchor</Label>
                <Input
                  placeholder="Search lead..."
                  value={leadSearch}
                  onChange={(e) => {
                    setLeadSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {showSuggestions && leadSearch && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {suggestedLeads.map((lead) => (
                      <div
                        key={lead.id || lead._id}
                        className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs font-bold"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setFormData({ ...formData, leadId: lead.id || lead._id });
                          setLeadSearch(lead.name);
                          setShowSuggestions(false);
                        }}
                      >
                        {lead.name} ({lead.company})
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {followUpTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <div className="border rounded-lg p-2 flex justify-center">
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full sm:w-auto">Confirm Schedule</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Schedule', value: (followUps || []).length, color: 'primary' },
          { label: 'Today Ops', value: (followUps || []).filter(f => format(new Date(f.scheduledAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length, color: 'amber' },
          { label: 'Completed', value: (followUps || []).filter(f => f.status === 'Completed').length, color: 'emerald' },
          { label: 'Overdue Flow', value: (followUps || []).filter(f => new Date(f.scheduledAt) < new Date() && f.status === 'Scheduled').length, color: 'red' }
        ].map((stat, i) => (
          <Card key={i} className={cn(
            "border-2 shadow-xl bg-gradient-to-br from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-800/20 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1",
            stat.color === 'primary' ? 'border-primary-100 shadow-primary-200/50' :
              stat.color === 'amber' ? 'border-amber-100 shadow-amber-200/50' :
                stat.color === 'emerald' ? 'border-emerald-100 shadow-emerald-200/50' :
                  'border-red-100 shadow-red-200/50'
          )}>
            <CardContent className="p-3 sm:p-4">
              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
              <p className={cn("text-lg sm:text-xl font-black leading-none",
                stat.color === 'primary' ? 'text-primary-600' :
                  stat.color === 'amber' ? 'text-amber-600' :
                    stat.color === 'emerald' ? 'text-emerald-600' : 'text-red-500'
              )}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-2 border-primary-100 shadow-2xl shadow-primary-200/30 dark:shadow-none bg-gradient-to-br from-white to-primary-50/20 dark:from-slate-900 dark:to-primary-900/10 rounded-3xl overflow-hidden">
        <CardContent className="p-3 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search..."
                className="pl-9 h-9 sm:h-10 bg-slate-50 border-none dark:bg-slate-800 rounded-xl font-bold text-[10px] sm:text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[140px] h-9 sm:h-10 bg-slate-50 border-none dark:bg-slate-800 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {followUpStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-slate-800/30">
                  <TableHead className="text-[10px] font-black tracking-widest uppercase">Lead Info</TableHead>
                  {isAdmin && <TableHead className="text-[10px] font-black tracking-widest uppercase">Assigned To</TableHead>}
                  <TableHead className="text-[10px] font-black tracking-widest uppercase">Type</TableHead>
                  <TableHead className="text-[10px] font-black tracking-widest uppercase">Schedule</TableHead>
                  <TableHead className="text-[10px] font-black tracking-widest uppercase">Status</TableHead>
                  <TableHead className="text-right text-[10px] font-black tracking-widest uppercase">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFollowUps.map((f) => {
                  const lead = leads.find(l => l.id === f.leadId || l._id === f.leadId) || f.leadId;
                  const salesRepName = f.salesRepId?.name || (f.salesRepId === 'self' ? 'Me' : 'Unknown');

                  return (
                    <TableRow key={f.id || f._id} className="border-slate-50 dark:border-slate-800">
                      <TableCell>
                        <p className="font-bold text-xs">{lead?.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-tight">{lead?.company}</p>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div className="size-5 rounded-full bg-slate-100 flex items-center justify-center">
                              <Users size={10} className="text-slate-400" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{salesRepName}</span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell><Badge variant="outline" className="text-[9px] font-black">{f.type}</Badge></TableCell>
                      <TableCell>
                        <p className="font-black text-[10px] text-slate-700 dark:text-slate-300">{format(new Date(f.scheduledAt), 'MMM d, yyyy')}</p>
                        <p className="text-[9px] text-slate-400 font-bold">{format(new Date(f.scheduledAt), 'HH:mm')}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-[9px] font-black h-5", f.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-50 text-primary-600')}>{f.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(f)}><Edit size={12} /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(f.id || f._id)}><Trash2 size={12} /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="lg:hidden space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredFollowUps.map((f) => {
                const lead = leads.find(l => l.id === f.leadId || l._id === f.leadId) || f.leadId;
                const isOverdue = new Date(f.scheduledAt) < new Date() && f.status === 'Scheduled';
                const salesRepName = f.salesRepId?.name;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={f.id || f._id}
                    className="group relative overflow-hidden p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "size-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                          f.type === 'Call' ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20" :
                            f.type === 'Meeting' ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20" :
                              f.type === 'Email' ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20" :
                                "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
                        )}>
                          {f.type === 'Call' ? <Clock size={18} /> :
                            f.type === 'Meeting' ? <CalendarIcon size={18} /> :
                              f.type === 'Email' ? <Search size={18} /> :
                                <CheckCircle2 size={18} />}
                        </div>
                        <div>
                          <p className="text-[13px] font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{lead?.name}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{lead?.company}</p>
                        </div>
                      </div>
                      <Badge className={cn(
                        "text-[8px] font-black uppercase tracking-widest h-5 px-2",
                        f.status === 'Completed' ? "bg-emerald-50 text-emerald-600 shadow-none border-none" :
                          f.status === 'Missed' ? "bg-red-50 text-red-600 shadow-none border-none" :
                            "bg-primary-50 text-primary-600 shadow-none border-none"
                      )}>
                        {f.status}
                      </Badge>
                    </div>

                    {isAdmin && salesRepName && (
                      <div className="mb-3 flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg w-fit">
                        <Users size={10} className="text-slate-400" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Assigned: {salesRepName}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Schedule</p>
                        <div className="flex items-center gap-1.5">
                          <Clock size={10} className="text-slate-400" />
                          <p className={cn(
                            "text-[10px] font-black uppercase tracking-tight",
                            isOverdue ? "text-red-500" : "text-slate-700 dark:text-slate-200"
                          )}>
                            {format(new Date(f.scheduledAt), 'MMM d, HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Interaction</p>
                        <Badge variant="outline" className="text-[8px] font-black uppercase h-5 border-slate-200 dark:border-slate-700">
                          {f.type}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-1">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter italic">
                        #{(f.id || f._id || '').toString().slice(-4)}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-slate-400 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm"
                          onClick={() => handleEdit(f)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-slate-400 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm"
                          onClick={() => handleDelete(f.id || f._id)}
                        >
                          <Trash2 size={14} className="text-red-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-emerald-500 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm"
                          onClick={() => handleStatusChange(f.id || f._id, 'Completed')}
                        >
                          <CheckCircle2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          {filteredFollowUps.length === 0 && (
            <div className="text-center py-16">
              <div className="size-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon size={24} className="text-slate-200 dark:text-slate-700" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Zero Operations Found</p>
              <p className="text-[9px] font-black text-slate-300 mt-1 uppercase">Schedule clear for synchronization</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FollowUps;
