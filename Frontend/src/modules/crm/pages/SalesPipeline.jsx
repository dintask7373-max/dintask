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

const SalesPipeline = () => {
  const {
    leads,
    getPipelineData,
    moveLead,
    addLead,
    editLead,
    deleteLead,
    pipelineStages
  } = useCRMStore();

  const [draggedLead, setDraggedLead] = useState(null);
  const [draggedFromStage, setDraggedFromStage] = useState(null);
  const [isOutcomeOpen, setIsOutcomeOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [editingDealData, setEditingDealData] = useState(null);
  const [outcomeReason, setOutcomeReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

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

  // Calculate totals and filter data
  const processedPipeline = useMemo(() => {
    return pipelineData.map(column => {
      const filteredLeads = column.leads.filter(lead => {
        if (!lead) return false;
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPriority = filterPriority === 'all' || lead.priority === filterPriority;
        return matchesSearch && matchesPriority;
      });

      const totalValue = filteredLeads.reduce((sum, lead) => sum + (Number(lead.amount) || 0), 0);

      return {
        ...column,
        leads: filteredLeads,
        totalValue
      };
    });
  }, [pipelineData, searchTerm, filterPriority]);

  const handleDragStart = (e, leadId, stage) => {
    setDraggedLead(leadId);
    setDraggedFromStage(stage);
    // Add a ghost class to the dragged element if needed
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (toStage) => {
    if (draggedLead && draggedFromStage !== toStage) {
      moveLead(draggedLead, draggedFromStage, toStage);

      if (toStage === 'Won' || toStage === 'Lost') {
        const lead = leads.find(l => l.id === draggedLead);
        setSelectedLead({ ...lead, status: toStage }); // Temporarily update status for dialog
        setIsOutcomeOpen(true);
      } else {
        toast.success(`Deal moved to ${toStage}`);
      }
    }
    setDraggedLead(null);
    setDraggedFromStage(null);
  };

  const handleSubmitReason = () => {
    toast.success(`Deal marked as ${selectedLead.status}`);
    setIsOutcomeOpen(false);
    setOutcomeReason('');
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
      amount: lead.amount.toString() // Ensure amount is editable string
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingDealData.name || !editingDealData.company) {
      toast.error("Name and Company are required");
      return;
    }

    editLead(editingDealData.id, {
      ...editingDealData,
      amount: parseFloat(editingDealData.amount) || 0
    });

    toast.success("Deal updated successfully");
    setIsEditOpen(false);
    setEditingDealData(null);
  };

  const handleDeleteDeal = (id) => {
    if (confirm('Are you sure you want to delete this deal?')) {
      deleteLead(id);
      toast.success("Deal deleted");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 sm:p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3 px-1">
          <div className="lg:hidden size-8 rounded-lg overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
            <img src="/src/assets/logo.png" alt="DinTask" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">Sales <span className="text-primary-600">Pipeline</span></h1>
            <p className="text-slate-500 dark:text-slate-400 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] leading-none mt-1">Acquisition Velocity</p>
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
            <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800">
              <SelectItem value="all" className="text-[9px] font-black uppercase">All</SelectItem>
              <SelectItem value="high" className="text-[9px] font-black uppercase">High</SelectItem>
              <SelectItem value="medium" className="text-[9px] font-black uppercase">Medium</SelectItem>
              <SelectItem value="low" className="text-[9px] font-black uppercase">Low</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsAddOpen(true)} className="gap-1.5 h-8 sm:h-9 bg-primary-600 hover:bg-primary-700 rounded-xl shadow-lg shadow-primary-500/20 px-3 sm:px-4">
            <Plus size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Deploy deal</span>
          </Button>
        </div>
      </div>

      {/* Kanban Board Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 scrollbar-hide">
        <div className="flex h-full gap-3 sm:gap-4 min-w-max px-1">
          {processedPipeline.map(({ stage, leads: stageLeads, totalValue }) => (
            <div
              key={stage}
              className="flex flex-col w-[220px] sm:w-[240px] bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-slate-100/50 dark:border-slate-800 h-full max-h-full transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage)}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-slate-100 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-t-2xl sticky top-0 z-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-[11px] uppercase tracking-[0.15em] text-slate-700 dark:text-slate-300">{stage}</h3>
                  <Badge variant="outline" className="h-5 text-[10px] bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 font-black">
                    {stageLeads.length}
                  </Badge>
                </div>
                <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={cn("h-full transition-all duration-500",
                    stage === 'Won' ? 'bg-emerald-500' :
                      stage === 'Lost' ? 'bg-red-500' : 'bg-primary-500'
                  )} style={{ width: '100%' }} />
                </div>
                <div className="mt-2 text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                  Val: <span className="text-slate-900 dark:text-white">₹{totalValue.toLocaleString()}</span>
                </div>
              </div>

              {/* Column Content (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
                {stageLeads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-24 text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl bg-white/30 dark:bg-slate-900/10">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Empty</p>
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id, stage)}
                      className="group bg-white dark:bg-slate-900 p-2.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary-100 dark:hover:border-primary-900/50 transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-10 h-10 bg-slate-50 dark:bg-slate-800/30 rounded-bl-full -mr-5 -mt-5 group-hover:scale-110 transition-transform" />

                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <Badge
                          variant="outline"
                          className={cn("text-[8px] uppercase font-black px-1.5 py-0 border shadow-none", getPriorityColor(lead.priority))}
                        >
                          {lead.priority}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600 rounded-lg">
                              <MoreHorizontal size={12} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem onClick={() => handleEditClick(lead)} className="text-xs font-bold">
                              <Edit2 className="mr-2 h-3 w-3" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500 focus:text-red-500 text-xs font-bold" onClick={() => handleDeleteDeal(lead.id)}>
                              <Trash2 className="mr-2 h-3 w-3" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <h4 className="font-black text-slate-900 dark:text-white text-[10px] mb-0.5 line-clamp-1 relative z-10 leading-tight tracking-tight uppercase">{lead.name}</h4>

                      <div className="flex items-center gap-1.5 text-[8px] text-slate-400 mb-2 relative z-10 font-black uppercase tracking-widest leading-none">
                        <Building2 size={9} className="text-slate-300 shrink-0" />
                        <span className="truncate">{lead.company}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800 relative z-10">
                        <div className="flex items-center gap-0.5 text-primary-600 font-black text-[10px] tracking-tight">
                          <IndianRupee size={9} className="stroke-[3px]" />
                          {Number(lead.amount || 0).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 text-[8px] text-slate-300 font-black uppercase tracking-widest whitespace-nowrap">
                          {lead.deadline ? format(new Date(lead.deadline), 'MMM d') : '—'}
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
            <div className="space-y-2">
              <Label htmlFor="reason">Reason / Notes</Label>
              <Textarea
                id="reason"
                placeholder={selectedLead?.status === 'Won' ? "What went well?" : "Why did we lose this deal?"}
                className="min-h-[100px]"
                value={outcomeReason}
                onChange={(e) => setOutcomeReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOutcomeOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitReason} className={selectedLead?.status === 'Won' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}>
              Confirm {selectedLead?.status}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Deal Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Deal</DialogTitle>
            <DialogDescription>Create a new opportunity in your pipeline.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={newDealData.name}
                onChange={(e) => setNewDealData({ ...newDealData, name: e.target.value })}
                className="col-span-3"
                placeholder="Deal Name / Contact"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">Company</Label>
              <Input
                id="company"
                value={newDealData.company}
                onChange={(e) => setNewDealData({ ...newDealData, company: e.target.value })}
                className="col-span-3"
                placeholder="Company Name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Value (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={newDealData.amount}
                onChange={(e) => setNewDealData({ ...newDealData, amount: e.target.value })}
                className="col-span-3"
                placeholder="50000"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">Priority</Label>
              <Select
                value={newDealData.priority}
                onValueChange={(val) => setNewDealData({ ...newDealData, priority: val })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddDeal}>Create Deal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Deal Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
            <DialogDescription>Update deal details.</DialogDescription>
          </DialogHeader>
          {editingDealData && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Name</Label>
                <Input
                  id="edit-name"
                  value={editingDealData.name}
                  onChange={(e) => setEditingDealData({ ...editingDealData, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-company" className="text-right">Company</Label>
                <Input
                  id="edit-company"
                  value={editingDealData.company}
                  onChange={(e) => setEditingDealData({ ...editingDealData, company: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-amount" className="text-right">Value (₹)</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={editingDealData.amount}
                  onChange={(e) => setEditingDealData({ ...editingDealData, amount: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-priority" className="text-right">Priority</Label>
                <Select
                  value={editingDealData.priority}
                  onValueChange={(val) => setEditingDealData({ ...editingDealData, priority: val })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesPipeline;