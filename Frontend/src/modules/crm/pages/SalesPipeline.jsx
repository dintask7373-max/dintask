import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import {
  GripVertical,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  IndianRupee,
  UserCircle,
  Building2,
  Edit2,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import useCRMStore from '@/store/crmStore';
import { cn } from '@/shared/utils/cn';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useDebounce } from '@/shared/hooks/use-debounce';
import useAuthStore from '@/store/authStore';
import { Shield } from 'lucide-react';

const SalesPipeline = () => {
  const {
    leads,
    getPipelineData,
    moveLead,
    addLead,
    editLead,
    deleteLead,
    pipelineStages,
    requestProjectConversion,
    fetchLeads
  } = useCRMStore();

  const { role } = useAuthStore();
  const canEdit = role === 'sales';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  const debouncedSearch = useDebounce(searchTerm, 500);

  React.useEffect(() => {
    fetchLeads({
      search: debouncedSearch,
      priority: filterPriority
    });
  }, [debouncedSearch, filterPriority]);

  const [draggedLead, setDraggedLead] = useState(null);
  const [draggedFromStage, setDraggedFromStage] = useState(null);
  const [isOutcomeOpen, setIsOutcomeOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [editingDealData, setEditingDealData] = useState(null);
  const [outcomeReason, setOutcomeReason] = useState('');
  const [outcomeDeadline, setOutcomeDeadline] = useState('');

  // New Deal Form State
  const [newDealData, setNewDealData] = useState({
    name: '',
    company: '',
    amount: '',
    priority: 'medium',
    stage: 'New',
    email: ''
  });

  const pipelineData = getPipelineData();

  // Calculate totals (filtering is now handled by backend)
  const processedPipeline = useMemo(() => {
    return pipelineData.map(column => {
      const totalValue = column.leads.reduce((sum, lead) => sum + (Number(lead.amount) || 0), 0);
      return {
        ...column,
        totalValue
      };
    });
  }, [pipelineData]);

  const handleDragStart = (e, leadId, stage) => {
    setDraggedLead(leadId);
    setDraggedFromStage(stage);
    // Add a ghost class to the dragged element if needed
    e.dataTransfer.effectAllowed = 'move';
    // Set data for compatibility
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (toStage) => {
    if (draggedLead && draggedFromStage !== toStage) {
      if (toStage === 'Won' || toStage === 'Lost') {
        const lead = leads.find(l => (l._id === draggedLead || l.id === draggedLead));
        setSelectedLead({ ...lead, status: toStage }); // Temporarily update status for dialog
        setOutcomeDeadline(lead.deadline ? new Date(lead.deadline).toISOString().split('T')[0] : '');
        setIsOutcomeOpen(true);
      } else {
        moveLead(draggedLead, draggedFromStage, toStage);
        toast.success(`Deal moved to ${toStage}`);
      }
    }
    setDraggedLead(null);
    setDraggedFromStage(null);
  };

  const handleSubmitOutcome = async () => {
    const leadId = selectedLead._id || selectedLead.id;

    // Update lead with status, reason (notes), and deadline
    await editLead(leadId, {
      status: selectedLead.status,
      notes: outcomeReason ? `${selectedLead.notes || ''}\nOutcome Note: ${outcomeReason}` : selectedLead.notes,
      deadline: outcomeDeadline || selectedLead.deadline
    });

    toast.success(`Deal marked as ${selectedLead.status}`);
    setIsOutcomeOpen(false);
    setOutcomeReason('');
    setOutcomeDeadline('');
    setSelectedLead(null);
  };

  const handleAddDeal = () => {
    if (!newDealData.name || !newDealData.company) {
      toast.error("Name and Company are required");
      return;
    }

    const deal = {
      ...newDealData,
      amount: parseFloat(newDealData.amount) || 0,
      owner: 'EMP-001', // Mock owner
      createdAt: new Date().toISOString(),
      status: newDealData.stage // Ensure status matches stage
    };

    const addedLead = addLead(deal);

    if (newDealData.stage !== 'New') {
      moveLead(addedLead.id, 'New', newDealData.stage);
    }

    toast.success("New deal added to pipeline");
    setIsAddOpen(false);
    setNewDealData({
      name: '',
      company: '',
      amount: '',
      priority: 'medium',
      stage: 'New',
      email: ''
    });
  };

  const handleEditClick = (lead) => {
    setEditingDealData({
      ...lead,
      amount: lead.amount.toString(), // Ensure amount is editable string
      deadline: lead.deadline ? new Date(lead.deadline).toISOString().split('T')[0] : ''
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingDealData.name || !editingDealData.company) {
      toast.error("Name and Company are required");
      return;
    }

    const leadId = editingDealData._id || editingDealData.id;
    if (!leadId) {
      toast.error("Invalid Asset ID");
      return;
    }

    editLead(leadId, {
      ...editingDealData,
      amount: parseFloat(editingDealData.amount) || 0
    });

    toast.success("Deal updated successfully");
    setIsEditOpen(false);
    setEditingDealData(null);
  };

  const handleDeleteDeal = (id) => {
    if (!id) return;
    if (confirm('Are you sure you want to remove this deal from the pipeline?')) {
      deleteLead(id);
      toast.success("Deal removed from pipeline");
    }
  };


  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-3">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-br from-white to-primary-50/20 dark:from-slate-900 dark:to-primary-900/10 p-2.5 sm:p-4 rounded-3xl shadow-xl shadow-primary-200/30 border-2 border-primary-100 dark:border-primary-900/30 shrink-0">
        <div className="flex items-center gap-3 px-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-base sm:text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">Sales <span className="text-primary-600">Pipeline</span></h1>
              {!canEdit && (
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 text-[7px] uppercase font-black tracking-widest px-1.5 py-0 flex items-center gap-1 h-4">
                  <Shield size={8} /> View Only
                </Badge>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] leading-none">Manage deal flow and conversions</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search..."
              className="pl-9 h-8 sm:h-9 w-full sm:w-[130px] lg:w-[220px] bg-slate-50 border-none dark:bg-slate-800 rounded-xl text-[10px] font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[90px] h-8 sm:h-9 bg-slate-50 border-none dark:bg-slate-800 rounded-xl text-[9px] font-black uppercase">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="border-slate-100 dark:border-slate-800">
              <SelectItem value="all" className="text-[9px] font-black uppercase">All</SelectItem>
              <SelectItem value="high" className="text-[9px] font-black uppercase">High</SelectItem>
              <SelectItem value="medium" className="text-[9px] font-black uppercase">Medium</SelectItem>
              <SelectItem value="low" className="text-[9px] font-black uppercase">Low</SelectItem>
            </SelectContent>
          </Select>
          {canEdit && (
            <Button onClick={() => setIsAddOpen(true)} className="gap-1.5 h-8 sm:h-9 bg-primary-600 hover:bg-primary-700 rounded-xl shadow-lg shadow-primary-500/20 px-3 sm:px-4">
              <Plus size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Add deal</span>
            </Button>
          )}
        </div>
      </div>

      {/* Kanban Board Area - Desktop */}
      <div className="hidden md:flex flex-1 overflow-x-auto overflow-y-hidden pb-4 scrollbar-hide">
        <div className="flex h-full gap-4 min-w-max px-1">
          {processedPipeline.map(({ stage, leads: stageLeads, totalValue }) => (
            <div
              key={stage}
              className="flex flex-col w-[260px] bg-gradient-to-b from-slate-50/80 to-slate-100/30 dark:from-slate-800/20 dark:to-slate-900/20 rounded-[2rem] border-2 border-slate-100/50 dark:border-slate-800 h-full max-h-full transition-colors hover:border-primary-100/50 dark:hover:border-primary-900/30"
              onDragOver={handleDragOver}
              onDrop={() => canEdit && handleDrop(stage)}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-t-3xl sticky top-0 z-10">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="font-black text-[11px] uppercase tracking-[0.15em] text-slate-700 dark:text-slate-300">{stage}</h3>
                  <Badge variant="outline" className="h-5 text-[10px] bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 font-black px-2">
                    {stageLeads.length}
                  </Badge>
                </div>
                <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={cn("h-full transition-all duration-500",
                    stage === 'Won' ? 'bg-emerald-500' :
                      stage === 'Lost' ? 'bg-red-500' : 'bg-primary-500'
                  )} style={{ width: '100%' }} />
                </div>
                <div className="mt-2.5 text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest px-0.5">
                  Valuation: <span className="text-slate-900 dark:text-white">₹{totalValue.toLocaleString()}</span>
                </div>
              </div>

              {/* Column Content (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {stageLeads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-24 text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl bg-white/30 dark:bg-slate-900/10 opacity-60">
                    <p className="text-[9px] font-black uppercase tracking-widest">No Intelligence</p>
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead._id || lead.id}
                      draggable={canEdit}
                      onDragStart={(e) => canEdit && handleDragStart(e, lead._id || lead.id, stage)}
                      className={cn(
                        "group bg-white dark:bg-slate-900 p-3.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 cursor-grab active:cursor-grabbing hover:shadow-xl hover:border-primary-100/50 dark:hover:border-primary-900/50 transition-all relative overflow-hidden",
                        !canEdit && "cursor-default active:cursor-default"
                      )}
                    >
                      <div className="absolute top-0 right-0 w-12 h-12 bg-slate-50 dark:bg-slate-800/30 rounded-bl-full -mr-6 -mt-6 group-hover:scale-110 transition-transform" />

                      <div className="flex justify-between items-start mb-3 relative z-10">
                        <Badge
                          variant="outline"
                          className={cn("text-[8px] uppercase font-black px-2 py-0.5 border shadow-none rounded-lg", getPriorityColor(lead.priority))}
                        >
                          {lead.priority}
                        </Badge>
                        {canEdit && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50">
                                <MoreHorizontal size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-2xl p-1.5">
                              <DropdownMenuItem onClick={() => handleEditClick(lead)} className="text-[10px] font-black uppercase tracking-widest rounded-xl px-3 py-2">
                                <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit Parameters
                              </DropdownMenuItem>
                              {lead.status === 'Won' && !lead.approvalStatus && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (!lead.deadline) {
                                      toast.error("Project deadline is mandatory. Please set a deadline first.");
                                      handleEditClick(lead);
                                      return;
                                    }
                                    requestProjectConversion(lead.id || lead._id);
                                  }}
                                  className="text-[10px] font-black uppercase tracking-widest text-emerald-600 focus:text-emerald-600 rounded-xl px-3 py-2"
                                >
                                  <Building2 className="mr-2 h-3.5 w-3.5" /> Project Deployment
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-red-500 focus:text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl px-3 py-2" onClick={() => handleDeleteDeal(lead._id || lead.id)}>
                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Purge Deal
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      <h4 className="font-black text-slate-900 dark:text-white text-xs mb-1 line-clamp-1 relative z-10 leading-tight tracking-tight uppercase">{lead.name}</h4>

                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mb-3 relative z-10 font-black uppercase tracking-widest leading-none">
                        <Building2 size={10} className="text-slate-300 shrink-0" />
                        <span className="truncate">{lead.company}</span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800 relative z-10">
                        <div className="flex items-center gap-1 text-primary-600 font-black text-xs tracking-tight">
                          <IndianRupee size={10} className="stroke-[3.5px]" />
                          {Number(lead.amount || 0).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-300 font-black uppercase tracking-widest whitespace-nowrap">
                          {lead.deadline ? format(new Date(lead.deadline), 'MMM d') : 'Active'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board Area - Mobile Card List */}
      <div className="md:hidden flex-1 overflow-y-auto space-y-3 pb-6 px-1">
        <AnimatePresence mode="popLayout">
          {processedPipeline.map(({ stage, leads: stageLeads }) => (
            stageLeads.length > 0 && (
              <div key={stage} className="space-y-3 pt-2">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full",
                      stage === 'Won' ? 'bg-emerald-500' : stage === 'Lost' ? 'bg-red-500' : 'bg-primary-500'
                    )} />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stage}</h3>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-black px-2 py-0 bg-slate-50 dark:bg-slate-900 border-none opacity-60">
                    {stageLeads.length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {stageLeads.map((lead) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={lead._id || lead.id}
                      className="group bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden active:scale-[0.98] transition-all"
                    >
                      <div className="flex items-start justify-between mb-3 relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="size-11 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center text-sm font-black uppercase shadow-inner shadow-primary-500/10 shrink-0">
                            {lead.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-slate-900 dark:text-white text-sm leading-tight uppercase tracking-tight truncate">{lead.name}</h4>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 truncate">{lead.company}</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn("text-[8px] uppercase font-black px-2 py-0.5 border shadow-none rounded-lg shrink-0", getPriorityColor(lead.priority))}
                        >
                          {lead.priority}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-800/50 flex flex-col justify-center">
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Deal Value</p>
                          <div className="flex items-center gap-1 text-primary-600 font-black text-xs">
                            <IndianRupee size={10} className="stroke-[3.5px]" />
                            {Number(lead.amount || 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-800/50 flex flex-col justify-center">
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Date</p>
                          <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase">
                            {lead.deadline ? format(new Date(lead.deadline), 'MMM d, yyyy') : 'No deadline'}
                          </p>
                        </div>
                      </div>

                      {canEdit && (
                        <div className="pt-3 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-4 rounded-xl text-primary-600 hover:bg-primary-50 font-black text-[10px] uppercase tracking-widest"
                            onClick={() => handleEditClick(lead)}
                          >
                            <Edit2 className="size-3.5 mr-2" />
                            Edit Deal
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-4 rounded-xl text-red-500 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest"
                            onClick={() => handleDeleteDeal(lead._id || lead.id)}
                          >
                            <Trash2 className="size-3.5 mr-2" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          ))}
        </AnimatePresence>
      </div>

      {/* Outcome Dialog */}
      <Dialog open={isOutcomeOpen} onOpenChange={setIsOutcomeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedLead?.status === 'Won' ? '🎉 Deal Won!' : 'Deal Lost'}
            </DialogTitle>
            <DialogDescription>
              Please provide a reason or notes for this outcome to verify.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedLead?.status === 'Won' && (
              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-xs font-black uppercase text-slate-500">Target project deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={outcomeDeadline}
                  onChange={(e) => setOutcomeDeadline(e.target.value)}
                  className="rounded-xl border-slate-100 dark:border-slate-800"
                />
                <p className="text-[9px] text-amber-600 font-bold uppercase italic">* Mandatory for project conversion</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-xs font-black uppercase text-slate-500">Outcome Notes</Label>
              <Textarea
                id="reason"
                placeholder={selectedLead?.status === 'Won' ? "Success parameters..." : "Loss details..."}
                className="min-h-[100px] rounded-xl border-slate-100 dark:border-slate-800"
                value={outcomeReason}
                onChange={(e) => setOutcomeReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="rounded-xl uppercase text-[10px] font-black" onClick={() => setIsOutcomeOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitOutcome} className={cn("rounded-xl uppercase text-[10px] font-black", selectedLead?.status === 'Won' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700')}>
              Confirm {selectedLead?.status}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Deal Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[450px] max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none sm:border bg-white dark:bg-slate-950">
          <div className="p-6 sm:p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Add New <span className="text-primary-600">Deal</span>
              </DialogTitle>
              <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Create a new business opportunity
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Contact Name</Label>
                <Input
                  id="name"
                  value={newDealData.name}
                  onChange={(e) => setNewDealData({ ...newDealData, name: e.target.value })}
                  placeholder="Deal Name / Contact"
                  className="h-11 rounded-2xl border-slate-100 dark:border-slate-800 focus:ring-primary-500/20 bg-slate-50/50 dark:bg-slate-900/50 font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Company Name</Label>
                <Input
                  id="company"
                  value={newDealData.company}
                  onChange={(e) => setNewDealData({ ...newDealData, company: e.target.value })}
                  placeholder="Company Name"
                  className="h-11 rounded-2xl border-slate-100 dark:border-slate-800 focus:ring-primary-500/20 bg-slate-50/50 dark:bg-slate-900/50 font-bold"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="amount" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Deal Value (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newDealData.amount}
                    onChange={(e) => setNewDealData({ ...newDealData, amount: e.target.value })}
                    placeholder="50000"
                    className="h-11 rounded-2xl border-slate-100 dark:border-slate-800 focus:ring-primary-500/20 bg-slate-50/50 dark:bg-slate-900/50 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="priority" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Priority</Label>
                  <Select
                    value={newDealData.priority}
                    onValueChange={(val) => setNewDealData({ ...newDealData, priority: val })}
                  >
                    <SelectTrigger className="h-11 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 font-bold">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="low" className="rounded-xl">Low</SelectItem>
                      <SelectItem value="medium" className="rounded-xl">Medium</SelectItem>
                      <SelectItem value="high" className="rounded-xl">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsAddOpen(false)} className="h-12 flex-1 rounded-2xl font-black text-[10px] uppercase tracking-widest border-slate-100 dark:border-slate-800">
                Cancel
              </Button>
              <Button onClick={handleAddDeal} className="h-12 flex-[2] rounded-2xl font-black text-[10px] uppercase tracking-widest bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20">
                Save Deal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Deal Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[450px] max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none sm:border bg-white dark:bg-slate-950">
          <div className="p-6 sm:p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Edit Deal <span className="text-primary-600">Details</span>
              </DialogTitle>
              <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Update deal information
              </DialogDescription>
            </DialogHeader>

            {editingDealData && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Contact Name</Label>
                  <Input
                    id="edit-name"
                    value={editingDealData.name}
                    onChange={(e) => setEditingDealData({ ...editingDealData, name: e.target.value })}
                    className="h-11 rounded-2xl border-slate-100 dark:border-slate-800 focus:ring-primary-500/20 bg-slate-50/50 dark:bg-slate-900/50 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-company" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Company Name</Label>
                  <Input
                    id="edit-company"
                    value={editingDealData.company}
                    onChange={(e) => setEditingDealData({ ...editingDealData, company: e.target.value })}
                    className="h-11 rounded-2xl border-slate-100 dark:border-slate-800 focus:ring-primary-500/20 bg-slate-50/50 dark:bg-slate-900/50 font-bold"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-amount" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Deal Value (₹)</Label>
                    <Input
                      id="edit-amount"
                      type="number"
                      value={editingDealData.amount}
                      onChange={(e) => setEditingDealData({ ...editingDealData, amount: e.target.value })}
                      className="h-11 rounded-2xl border-slate-100 dark:border-slate-800 focus:ring-primary-500/20 bg-slate-50/50 dark:bg-slate-900/50 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-priority" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Priority</Label>
                    <Select
                      value={editingDealData.priority}
                      onValueChange={(val) => setEditingDealData({ ...editingDealData, priority: val })}
                    >
                      <SelectTrigger className="h-11 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 font-bold">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="low" className="rounded-xl">Low</SelectItem>
                        <SelectItem value="medium" className="rounded-xl">Medium</SelectItem>
                        <SelectItem value="high" className="rounded-xl">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-deadline" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Target Deadline</Label>
                  <Input
                    id="edit-deadline"
                    type="date"
                    value={editingDealData.deadline}
                    onChange={(e) => setEditingDealData({ ...editingDealData, deadline: e.target.value })}
                    className="h-11 rounded-2xl border-slate-100 dark:border-slate-800 focus:ring-primary-500/20 bg-slate-50/50 dark:bg-slate-900/50 font-bold"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)} className="h-12 flex-1 rounded-2xl font-black text-[10px] uppercase tracking-widest border-slate-100 dark:border-slate-800">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} className="h-12 flex-[2] rounded-2xl font-black text-[10px] uppercase tracking-widest bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesPipeline;
