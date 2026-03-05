import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { Plus, Edit, Trash2, Search, FileUp, User, Mail, Phone, X, IndianRupee, ChevronLeft, ChevronRight } from 'lucide-react';
import useCRMStore from '@/store/crmStore';
import { cn } from '@/shared/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import { useDebounce } from '@/shared/hooks/use-debounce';

const LeadsManagement = () => {
  const { role } = useAuthStore();
  const {
    leads,
    salesExecutives,
    fetchLeads,
    fetchSalesExecutives,
    addLead,
    editLead,
    deleteLead,
    bulkDeleteLeads,
    assignLead,
    pagination
  } = useCRMStore();

  const fileInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const debouncedSearch = useDebounce(searchTerm, 500);

  React.useEffect(() => {
    fetchLeads({
      search: debouncedSearch,
      status: filterStatus === 'all' ? '' : filterStatus,
      page,
      limit
    });
    fetchSalesExecutives();
  }, [debouncedSearch, filterStatus, page, limit]);
  const [open, setOpen] = useState(false);

  // Import Assignment State
  const [importData, setImportData] = useState([]);
  const [isImportAssignOpen, setIsImportAssignOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
  const [bulkAssignee, setBulkAssignee] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const [editingLead, setEditingLead] = useState(null);
  const [selectedMobileLead, setSelectedMobileLead] = useState(null);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    company: '',
    source: 'Manual',
    owner: '',
    status: 'New',
    notes: '',
  });

  const leadStatuses = ['New', 'Contacted', 'Follow-Up', 'Interested', 'Closed', 'Won', 'Lost'];
  const leadSources = ['Call', 'Website', 'WhatsApp', 'Referral', 'Manual'];

  // Use leads directly from store as backend handles filtering and pagination
  const filteredLeads = leads;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingLead) {
      await editLead(editingLead._id || editingLead.id, formData);
    } else {
      await addLead(formData);
    }
    resetForm();
    setOpen(false);
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setFormData({
      ...lead,
      owner: lead.owner?._id || lead.owner || ''
    });
    setOpen(true);
  };

  const handleDelete = (leadId) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      deleteLead(leadId);
    }
  };

  const toggleLeadSelection = (id) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllLeads = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map((l) => l._id || l.id));
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
      owner: '',
      status: 'New',
      notes: '',
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          toast.error('Excel file is empty');
          return;
        }

        const parsedData = jsonData.map((row) => {
          // Helper to find value by multiple possible header names
          const getValue = (keys) => {
            const foundKey = Object.keys(row).find(k =>
              keys.some(key => k.toLowerCase().trim() === key.toLowerCase())
            );
            return foundKey ? row[foundKey] : null;
          };

          return {
            name: getValue(['Name', 'Full Name', 'Contact Name', 'name', 'full name']) || 'Unnamed Lead',
            mobile: String(getValue(['Mobile', 'Mobile Number', 'Phone', 'Contact Number', 'mobile', 'phone']) || ''),
            email: getValue(['Email', 'Email Address', 'Email ID', 'email', 'email address']) || '',
            company: getValue(['Company', 'Company Name', 'Organization', 'Business', 'company', 'company name']) || '',
            source: getValue(['Source', 'Source Type', 'source']) || 'Excel Import',
            owner: '',
            status: 'New',
            notes: getValue(['Notes', 'Notes/Remarks', 'Remarks', 'Description', 'notes', 'remarks']) || '',
          };
        }).filter(lead => lead.name && (lead.mobile || lead.email));

        if (parsedData.length === 0) {
          toast.error('No valid leads found in file');
          return;
        }

        setImportData(parsedData);
        setIsImportAssignOpen(true);
      } catch (error) {
        toast.error('Failed to parse Excel file');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = null;
  };

  const handleConfirmImport = async () => {
    if (!selectedAssignee) {
      toast.error("Please select a sales person to assign leads to");
      return;
    }

    let importedCount = 0;
    for (const lead of importData) {
      const leadData = { ...lead, owner: selectedAssignee };
      await addLead(leadData);
      importedCount++;
    }

    toast.success(`Imported & Assigned ${importedCount} leads`);
    setIsImportAssignOpen(false);
    setImportData([]);
    setSelectedAssignee('');
  };

  const handleBulkAssign = async () => {
    if (!bulkAssignee || selectedLeads.length === 0) return;

    setIsAssigning(true);
    let successCount = 0;
    try {
      for (const leadId of selectedLeads) {
        await assignLead(leadId, bulkAssignee);
        successCount++;
      }
      toast.success(`Successfully assigned ${successCount} leads`);
      setSelectedLeads([]);
      setIsBulkAssignOpen(false);
      setBulkAssignee('');
    } catch (error) {
      toast.error('Failed to assign some leads');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedLeads.length} leads?`)) {
      await bulkDeleteLeads(selectedLeads);
      setSelectedLeads([]);
    }
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
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {!['sales', 'sales_executive'].includes(role) && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx, .xls, .csv"
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="h-9 px-4 sm:px-6 border-slate-200 dark:border-slate-800 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest w-full sm:w-auto hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <FileUp className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
                <span>Import Assets</span>
              </Button>

              {selectedLeads.length > 0 && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                  <Button
                    onClick={() => setIsBulkAssignOpen(true)}
                    variant="outline"
                    className="h-9 px-4 border-primary-100 bg-primary-50/50 text-primary-600 rounded-xl font-black text-[9px] uppercase tracking-widest"
                  >
                    Bulk Assign ({selectedLeads.length})
                  </Button>
                  <Button
                    onClick={handleBulkDelete}
                    variant="outline"
                    className="h-9 px-4 border-red-100 bg-red-50 text-red-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-100"
                  >
                    Delete Selected
                  </Button>
                </div>
              )}
            </>
          )}

          {!['sales', 'sales_executive'].includes(role) && (
            <Button onClick={() => { resetForm(); setOpen(true); }} className="h-9 px-4 sm:px-6 shadow-lg shadow-primary-500/20 bg-primary-600 hover:bg-primary-700 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest w-full sm:w-auto">
              <Plus className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Initialize Lead</span>
            </Button>
          )}

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none sm:border bg-white dark:bg-slate-950">
              <div className="p-6 sm:p-8 space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {editingLead ? 'Refine' : 'Initialize'} <span className="text-primary-600">Lead</span>
                  </DialogTitle>
                  <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {editingLead ? 'Syncing tactical asset data' : 'Establishing new acquisition target'}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Entity Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="h-11 rounded-2xl border-slate-100 dark:border-slate-800 focus:ring-primary-500/20 bg-slate-50/50 dark:bg-slate-900/50 font-bold"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="mobile" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Mobile Vector</Label>
                      <Input
                        id="mobile"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        required
                        className="h-11 rounded-2xl border-slate-100 dark:border-slate-800 focus:ring-primary-500/20 bg-slate-50/50 dark:bg-slate-900/50 font-bold"
                        placeholder="+91 00000 00000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Communication Node</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="h-11 rounded-2xl border-slate-100 dark:border-slate-800 focus:ring-primary-500/20 bg-slate-50/50 dark:bg-slate-900/50 font-bold"
                        placeholder="target@intel.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="company" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Corporate Entity</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="h-11 rounded-2xl border-slate-100 dark:border-slate-800 focus:ring-primary-500/20 bg-slate-50/50 dark:bg-slate-900/50 font-bold"
                        placeholder="Global Corp"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="source" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Ingress Point</Label>
                      <Select
                        value={formData.source}
                        onValueChange={(value) => setFormData({ ...formData, source: value })}
                      >
                        <SelectTrigger className="h-11 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 font-bold">
                          <SelectValue placeholder="Select ingress" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          {leadSources.map((source) => (
                            <SelectItem key={source} value={source} className="rounded-xl">
                              {source}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="status" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Operational Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger className="h-11 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 font-bold">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          {leadStatuses.map((status) => (
                            <SelectItem key={status} value={status} className="rounded-xl">
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="owner" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Assigned Handler</Label>
                    <Select
                      value={formData.owner}
                      onValueChange={(value) => setFormData({ ...formData, owner: value })}
                    >
                      <SelectTrigger className="h-11 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 font-bold">
                        <SelectValue placeholder="Assign operator" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {salesExecutives.length > 0 ? (
                          salesExecutives.map((exec) => (
                            <SelectItem key={exec._id} value={exec._id} className="rounded-xl">
                              {exec.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="unassigned" disabled>No Operators Found</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Mission Log</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Enter tactical intel..."
                      className="h-11 rounded-2xl border-slate-100 dark:border-slate-800 focus:ring-primary-500/20 bg-slate-50/50 dark:bg-slate-900/50 font-bold"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setOpen(false)}
                      type="button"
                      className="h-12 flex-1 rounded-2xl font-black text-[10px] uppercase tracking-widest border-slate-100 dark:border-slate-800"
                    >
                      Abort
                    </Button>
                    <Button
                      type="submit"
                      className="h-12 flex-[2] rounded-2xl font-black text-[10px] uppercase tracking-widest bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20"
                    >
                      {editingLead ? 'Execute Update' : 'Initialize Asset'}
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>

          {/* Import Assignment Dialog */}
          <Dialog open={isImportAssignOpen} onOpenChange={setIsImportAssignOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Assign Imported Leads</DialogTitle>
                <DialogDescription>
                  You are importing {importData.length} leads. Who should manage them?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Sales Executive</Label>
                  <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose Assignee..." />
                    </SelectTrigger>
                    <SelectContent>
                      {salesExecutives.length > 0 ? (
                        salesExecutives.map((exec) => (
                          <SelectItem key={exec._id || exec.id} value={exec._id || exec.id}>
                            {exec.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No Sales Executives</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsImportAssignOpen(false)}>Cancel</Button>
                <Button onClick={handleConfirmImport} disabled={!selectedAssignee} className="bg-primary-600 hover:bg-primary-700 text-white">
                  Import & Assign
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Bulk Assignment Dialog */}
          <Dialog open={isBulkAssignOpen} onOpenChange={setIsBulkAssignOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Assign Multiple Leads</DialogTitle>
                <DialogDescription>
                  Choose a sales representative to assign the {selectedLeads.length} selected leads to.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Owner</Label>
                    <Select value={bulkAssignee} onValueChange={setBulkAssignee}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sales representative" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {salesExecutives.map((exec) => (
                          <SelectItem key={exec._id || exec.id} value={exec._id || exec.id}>
                            {exec.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsBulkAssignOpen(false)}>Cancel</Button>
                <Button
                  onClick={handleBulkAssign}
                  disabled={!bulkAssignee || isAssigning}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  {isAssigning ? 'Assigning...' : 'Assign Leads'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div >

      {/* Stats Bar */}
      < div className="grid grid-cols-2 md:grid-cols-4 gap-3" >
        {
          [
            { label: 'Total Pool', value: pagination.total, color: 'primary' },
            { label: 'Interested', value: leads.filter(l => l.status === 'Interested').length, color: 'amber' },
            { label: 'Strategic', value: leads.filter(l => l.status === 'Closed').length, color: 'emerald' },
            { label: 'Lost Flow', value: leads.filter(l => l.status === 'Lost').length, color: 'slate' }
          ].map((stat, i) => (
            <Card key={i} className={cn(
              "border-2 shadow-xl bg-gradient-to-br from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-800/20 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1",
              stat.color === 'primary' ? 'border-primary-100 shadow-primary-200/50' :
                stat.color === 'amber' ? 'border-amber-100 shadow-amber-200/50' :
                  stat.color === 'emerald' ? 'border-emerald-100 shadow-emerald-200/50' :
                    'border-slate-200 shadow-slate-200/50'
            )}>
              <CardContent className="p-3 sm:p-4">
                <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                <p className={cn("text-lg sm:text-xl font-black leading-none", stat.color === 'primary' ? 'text-primary-600' : stat.color === 'amber' ? 'text-amber-600' : stat.color === 'emerald' ? 'text-emerald-600' : 'text-slate-600')}>{stat.value}</p>
              </CardContent>
            </Card>
          ))
        }
      </div >

      <Card className="border-2 border-primary-100 shadow-2xl shadow-primary-200/30 dark:shadow-none bg-gradient-to-br from-white to-primary-50/20 dark:from-slate-900 dark:to-primary-900/10 rounded-3xl overflow-hidden">
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
                <SelectContent className="border-slate-100 dark:border-slate-800">
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
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300"
                      checked={selectedLeads.length > 0 && selectedLeads.length === filteredLeads.length}
                      onChange={toggleAllLeads}
                    />
                  </th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead ID</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Company</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead._id || lead.id} className={cn("hover:bg-slate-50/30 dark:hover:bg-slate-800/20 border-slate-100 dark:border-slate-800 transition-colors", selectedLeads.includes(lead._id || lead.id) && "bg-primary-50/30 dark:bg-primary-900/10")}>
                    <TableCell className="p-4 w-10">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        checked={selectedLeads.includes(lead._id || lead.id)}
                        onChange={() => toggleLeadSelection(lead._id || lead.id)}
                      />
                    </TableCell>
                    <TableCell className="p-4 font-black text-xs text-slate-400 tracking-tighter">
                      {(lead._id || lead.id).substr(-6)}
                    </TableCell>
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
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                        {lead.owner?.name || 'Unassigned'}
                      </span>
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
                          onClick={() => handleDelete(lead._id || lead.id)}
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

          {/* Pagination Controls - Desktop */}
          {pagination && pagination.pages > 1 && (
            <div className="hidden lg:flex items-center justify-between px-2 py-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Showing {Math.min(pagination.total, (pagination.currentPage - 1) * pagination.limit + 1)} to {Math.min(pagination.total, pagination.currentPage * pagination.limit)} of {pagination.total} assets
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === 1}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  className="h-8 w-8 p-0 rounded-lg border-slate-200"
                >
                  <ChevronLeft size={14} />
                </Button>

                {[...Array(pagination.pages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.pages ||
                    (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className={cn(
                          "h-8 w-8 p-0 rounded-lg text-[10px] font-black",
                          pagination.currentPage === pageNum
                            ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {pageNum}
                      </Button>
                    );
                  } else if (
                    pageNum === pagination.currentPage - 2 ||
                    pageNum === pagination.currentPage + 2
                  ) {
                    return <span key={pageNum} className="px-1 text-slate-400 text-[10px] font-black">...</span>;
                  }
                  return null;
                })}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === pagination.pages}
                  onClick={() => setPage(prev => Math.min(pagination.pages, prev + 1))}
                  className="h-8 w-8 p-0 rounded-lg border-slate-200"
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* Mobile Card List */}
          <div className="lg:hidden space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredLeads.map((lead) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={lead._id || lead.id}
                  onClick={() => {
                    setSelectedMobileLead(lead);
                    setIsMobileDetailOpen(true);
                  }}
                  className="group relative overflow-hidden p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center text-sm font-black uppercase shadow-inner shadow-primary-500/10 shrink-0">
                        {lead.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded-md tracking-tighter uppercase">
                            #{(lead._id || lead.id).substr(-6)}
                          </span>
                          <p className="text-[14px] font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight truncate">{lead.name}</p>
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 truncate">{lead.company}</p>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "text-[8px] font-black uppercase tracking-widest h-5 px-2 shrink-0",
                        lead.status === 'Won' ? 'bg-emerald-50 text-emerald-600 shadow-none border-none' :
                          lead.status === 'Lost' ? 'bg-red-50 text-red-600 shadow-none border-none' :
                            lead.status === 'Interested' ? 'bg-amber-50 text-amber-600 shadow-none border-none' :
                              'bg-primary-50 text-primary-600 shadow-none border-none'
                      )}
                    >
                      {lead.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-800/50">
                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Details</p>
                      <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">{lead.mobile}</p>
                      <p className="text-[9px] text-slate-400 truncate lowercase">{lead.email}</p>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-800/50">
                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Management</p>
                      <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">{lead.owner?.name || 'Unassigned'}</p>
                      <Badge variant="outline" className="text-[8px] font-black uppercase border-none p-0 h-auto opacity-70 mt-0.5">{lead.source}</Badge>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 rounded-xl text-primary-600 hover:bg-primary-50 font-black text-[9px] uppercase tracking-widest"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(lead);
                      }}
                    >
                      <Edit className="size-3 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 rounded-xl text-red-500 hover:bg-red-50 font-black text-[9px] uppercase tracking-widest"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(lead._id || lead.id);
                      }}
                    >
                      <Trash2 className="size-3 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Pagination Controls - Mobile */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between px-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === 1}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  className="h-9 px-4 rounded-xl border-slate-200 text-[9px] font-black uppercase tracking-widest"
                >
                  <ChevronLeft size={14} className="mr-2" />
                  Prev
                </Button>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Page {pagination.currentPage} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === pagination.pages}
                  onClick={() => setPage(prev => Math.min(pagination.pages, prev + 1))}
                  className="h-9 px-4 rounded-xl border-slate-200 text-[9px] font-black uppercase tracking-widest"
                >
                  Next
                  <ChevronRight size={14} className="ml-2" />
                </Button>
              </div>
            )}
          </div>

          {/* Lead Details Dialog for Mobile */}
          <Dialog open={isMobileDetailOpen} onOpenChange={setIsMobileDetailOpen}>
            <DialogContent className="max-w-[95vw] sm:max-w-[500px] rounded-[2.5rem] p-0 border-none overflow-hidden bg-white dark:bg-slate-950 shadow-2xl">
              {/* Tactical Header */}
              <div className="relative bg-[#020617] p-8 pb-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-500/5 rounded-full -ml-12 -mb-12 blur-2xl" />

                <div className="relative z-10 space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-none truncate">
                    {selectedMobileLead?.company || 'Tactical Asset'}
                  </h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-80">
                    Sector Intelligence Overview
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileDetailOpen(false)}
                  className="absolute top-4 right-4 text-white/40 hover:text-white hover:bg-white/10 rounded-full h-8 w-8"
                >
                  <X size={18} />
                </Button>
              </div>

              {/* Content Chassis */}
              <div className="px-6 pb-8 -mt-6 relative z-20 space-y-5">
                {/* Primary Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Market Valuation</p>
                    <div className="flex items-center gap-1 text-primary-600 font-black text-lg">
                      <IndianRupee size={14} className="stroke-[3px]" />
                      <span>{Number(selectedMobileLead?.amount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Deployment Stage</p>
                    <Badge className={cn(
                      "text-[9px] font-black uppercase tracking-widest h-6 px-3 rounded-xl border-none",
                      selectedMobileLead?.status === 'Won' ? 'bg-emerald-50 text-emerald-600' :
                        selectedMobileLead?.status === 'Lost' ? 'bg-red-50 text-red-600' :
                          'bg-primary-50 text-primary-600'
                    )}>
                      {selectedMobileLead?.status}
                    </Badge>
                  </div>
                </div>

                {/* Personnel Linkages */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Personnel Linkages</h3>
                  <div className="space-y-2">
                    {[
                      { icon: <User className="size-4" />, label: 'Operator', value: selectedMobileLead?.name },
                      { icon: <Mail className="size-4" />, label: 'Hub', value: selectedMobileLead?.email, lower: true },
                      { icon: <Phone className="size-4" />, label: 'Direct', value: selectedMobileLead?.mobile || 'N/A' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 transition-colors hover:bg-white dark:hover:bg-slate-900 group">
                        <div className="size-10 rounded-xl bg-white dark:bg-slate-800 text-slate-400 group-hover:text-primary-600 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center transition-colors">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                          <p className={cn("text-xs font-black text-slate-900 dark:text-white truncate", item.lower ? "lowercase" : "uppercase")}>{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tactical Metadata Container */}
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Origin Node</p>
                      <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate">{selectedMobileLead?.source}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Handler</p>
                      <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate">{selectedMobileLead?.owner?.name || 'Unassigned'}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border-2 border-dashed border-slate-100 dark:border-slate-800 flex items-center justify-between px-4">
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Tactical Asset ID</p>
                    <p className="text-[10px] font-black text-primary-600 uppercase tracking-tighter">
                      #{(selectedMobileLead?._id || selectedMobileLead?.id || '').substr(-10)}
                    </p>
                  </div>
                </div>

                {/* Intelligence Log */}
                <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-1.5 rounded-full bg-primary-600 animate-pulse" />
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Active Intelligence Log</p>
                  </div>
                  <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-2 border-primary-100 dark:border-primary-900/30 pl-3">
                    {selectedMobileLead?.notes || 'No active mission tactical intel documented for this asset.'}
                  </p>
                </div>

                {/* Tactical Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    variant="ghost"
                    className="h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest text-primary-600 hover:bg-primary-50 transition-all border border-primary-50 dark:border-primary-900/30"
                    onClick={() => {
                      setIsMobileDetailOpen(false);
                      handleEdit(selectedMobileLead);
                    }}
                  >
                    Recalibrate
                  </Button>
                  <Button
                    className="h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
                    onClick={() => setIsMobileDetailOpen(false)}
                  >
                    Abort Review
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {filteredLeads.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No leads found. Try adjusting your search or filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div >
  );
};

export default LeadsManagement;
