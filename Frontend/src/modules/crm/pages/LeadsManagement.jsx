import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import useCRMStore from '@/store/crmStore';
import { cn } from '@/shared/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

const LeadsManagement = () => {
  const {
    leads,
    addLead,
    editLead,
    deleteLead,
    assignLead,
  } = useCRMStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [open, setOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    company: '',
    source: 'Manual',
    owner: 'EMP-001',
    status: 'New',
    notes: '',
  });

  const leadStatuses = ['New', 'Contacted', 'Follow-Up', 'Interested', 'Closed', 'Lost'];
  const leadSources = ['Call', 'Website', 'WhatsApp', 'Referral', 'Manual'];

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.mobile.includes(searchTerm);
      const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, filterStatus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingLead) {
      editLead(editingLead.id, formData);
    } else {
      addLead(formData);
    }
    resetForm();
    setOpen(false);
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setFormData(lead);
    setOpen(true);
  };

  const handleDelete = (leadId) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      deleteLead(leadId);
    }
  };

  const resetForm = () => {
    setEditingLead(null);
    setFormData({
      name: '',
      mobile: '',
      email: '',
      company: '',
      source: 'Manual',
      owner: 'EMP-001',
      status: 'New',
      notes: '',
    });
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
              Lead <span className="text-primary-600">Assets</span>
            </h1>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-1 leading-none">
              High-velocity acquisition active
            </p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="h-9 px-4 sm:px-6 shadow-lg shadow-primary-500/20 bg-primary-600 hover:bg-primary-700 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest w-full sm:w-auto">
              <Plus className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Initialize Lead</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
              <DialogDescription>
                {editingLead ? 'Update the lead information below.' : 'Enter the lead details below.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Lead Source</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) => setFormData({ ...formData, source: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {leadSources.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Lead Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {leadStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner">Lead Owner</Label>
                <Select
                  value={formData.owner}
                  onValueChange={(value) => setFormData({ ...formData, owner: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMP-001">John Doe (Sales Rep 1)</SelectItem>
                    <SelectItem value="EMP-002">Jane Smith (Sales Rep 2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional notes"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingLead ? 'Update Lead' : 'Add Lead'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {/* Stats Bar Addon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Pool', value: leads.length, color: 'primary' },
          { label: 'Interested', value: leads.filter(l => l.status === 'Interested').length, color: 'amber' },
          { label: 'Strategic', value: leads.filter(l => l.status === 'Closed').length, color: 'emerald' },
          { label: 'Lost Flow', value: leads.filter(l => l.status === 'Lost').length, color: 'slate' }
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
              <p className={cn("text-lg sm:text-xl font-black leading-none", stat.color === 'primary' ? 'text-primary-600' : stat.color === 'amber' ? 'text-amber-600' : stat.color === 'emerald' ? 'text-emerald-600' : 'text-slate-600')}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
        <CardContent className="p-3 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search leads..."
                className="pl-9 h-9 sm:h-10 bg-slate-50 border-none dark:bg-slate-800 rounded-xl font-bold text-[10px] sm:text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[140px] h-9 sm:h-10 bg-slate-50 border-none dark:bg-slate-800 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800">
                  <SelectItem value="all" className="text-[10px] font-black uppercase">All</SelectItem>
                  {leadStatuses.map((status) => (
                    <SelectItem key={status} value={status} className="text-[10px] font-black uppercase">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto hidden lg:block">
            <Table>
              <TableHeader>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead ID</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Company</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 border-slate-100 dark:border-slate-800 transition-colors">
                    <TableCell className="p-4 font-black text-xs text-slate-400 tracking-tighter">{lead.id}</TableCell>
                    <TableCell className="p-4 font-bold text-slate-900 dark:text-white text-xs">{lead.name}</TableCell>
                    <TableCell className="p-4 text-xs font-bold text-slate-500">{lead.company}</TableCell>
                    <TableCell className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">{lead.mobile}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{lead.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">{lead.source}</Badge>
                    </TableCell>
                    <TableCell className="p-4">
                      <Badge
                        className={cn(
                          "text-[9px] font-black uppercase tracking-widest h-5 px-2",
                          lead.status === 'Won' ? 'bg-emerald-50 text-emerald-600 shadow-none border-none' :
                            lead.status === 'Lost' ? 'bg-red-50 text-red-600 shadow-none border-none' :
                              lead.status === 'Interested' ? 'bg-amber-50 text-amber-600 shadow-none border-none' :
                                'bg-primary-50 text-primary-600 shadow-none border-none'
                        )}
                      >
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                          onClick={() => handleEdit(lead)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                          onClick={() => handleDelete(lead.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List */}
          <div className="lg:hidden space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredLeads.map((lead) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={lead.id}
                  className="group relative overflow-hidden p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center text-sm font-black uppercase shadow-inner shadow-primary-500/10">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[14px] font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{lead.name}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{lead.company}</p>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "text-[8px] font-black uppercase tracking-widest h-5 px-2",
                        lead.status === 'Won' ? 'bg-emerald-50 text-emerald-600 shadow-none border-none' :
                          lead.status === 'Lost' ? 'bg-red-50 text-red-600 shadow-none border-none' :
                            lead.status === 'Interested' ? 'bg-amber-50 text-amber-600 shadow-none border-none' :
                              'bg-primary-50 text-primary-600 shadow-none border-none'
                      )}
                    >
                      {lead.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Contact Node</p>
                      <p className="text-[10px] font-black text-slate-700 dark:text-slate-200 truncate tracking-tight">{lead.mobile}</p>
                      <p className="text-[8px] font-bold text-slate-400 truncate opacity-80 mt-0.5">{lead.email}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Origin Source</p>
                      <Badge variant="outline" className="text-[8px] font-black uppercase h-5 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50">
                        {lead.source}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-1">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic flex items-center gap-1.5">
                      <span className="size-1 rounded-full bg-slate-300 animate-pulse" />
                      Node #{lead.id}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-slate-400 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm"
                        onClick={() => handleEdit(lead)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-slate-400 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm"
                        onClick={() => handleDelete(lead.id)}
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {filteredLeads.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No leads found. Try adjusting your search or filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadsManagement;
