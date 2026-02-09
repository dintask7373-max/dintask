import React, { useState } from 'react';
import {
  CheckCircle2,
  Calendar,
  Briefcase,
  Building2,
  ChevronDown,
  Search,
  IndianRupee,
  AlertCircle,
  UserCircle
} from 'lucide-react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import useCRMStore from '@/store/crmStore';
import useManagerStore from '@/store/managerStore';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/utils/cn';
import { format } from 'date-fns';
import { toast } from 'sonner';

const ProjectApprovals = () => {
  const { pendingProjects, fetchPendingProjects, approveProject } = useCRMStore();
  const { managers } = useManagerStore();

  React.useEffect(() => {
    fetchPendingProjects();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedManager, setSelectedManager] = useState('');
  const [parent] = useAutoAnimate();

  // Ensure pendingProjects is an array (state initialization checks)
  const projectsList = Array.isArray(pendingProjects) ? pendingProjects : [];

  const filteredProjects = projectsList.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = async () => {
    if (!selectedManager) {
      toast.error("Please select a manager to assign this project.");
      return;
    }

    // Approve and Assign use _id
    await approveProject(selectedProject._id || selectedProject.id, selectedManager);

    toast.success(`Project assigned to ${managers.find(m => (m._id || m.id) === selectedManager)?.name}`);
    setSelectedProject(null);
    setSelectedManager('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 px-1 sm:px-0">
          <div className="lg:hidden w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
            <img src="/dintask-logo.png" alt="DinTask" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Project <span className="text-primary-600">Approvals</span></h1>
            <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1 uppercase">Assign Won Deals to Managers</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-100 dark:border-slate-800">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search pending projects..."
            className="pl-9 h-9 sm:h-10 bg-slate-50 border-none dark:bg-slate-800 rounded-xl text-xs font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Badge variant="outline" className="hidden sm:flex h-9 px-4 rounded-xl text-xs font-bold bg-primary-50 text-primary-700 border-primary-100">
          {filteredProjects.length} Pending Approval
        </Badge>
      </div>

      <div ref={parent} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-full mb-3">
              <CheckCircle2 size={32} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="font-bold text-sm">No pending projects</p>
            <p className="text-xs">All won deals have been assigned.</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <Card key={project._id || project.id} className="border-none shadow-md hover:shadow-xl transition-shadow duration-300 group overflow-hidden bg-white dark:bg-slate-900 flex flex-col rounded-3xl h-full border border-slate-50 dark:border-slate-800/50">
              <div className="h-1.5 w-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Badge className="mb-2 bg-emerald-50 text-emerald-700 border-emerald-100 uppercase tracking-widest text-[9px] font-black px-2 py-0.5 shadow-none hover:bg-emerald-100">
                      Won Deal
                    </Badge>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-1">{project.name}</h3>
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
                      <Building2 size={12} />
                      {project.company}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Value</p>
                    <p className="text-sm font-black text-emerald-600 flex items-center justify-end gap-0.5">
                      <IndianRupee size={12} className="stroke-[3px]" />
                      {project.amount ? project.amount.toLocaleString() : '0'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-grow">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400">
                      <UserCircle size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Closed By</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Sales Rep: {project.owner?.name || project.owner?._id || project.owner || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Closed Date</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {format(new Date(project.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setSelectedProject(project)}
                  className="w-full h-11 rounded-xl bg-primary-600 hover:bg-primary-700 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-500/20"
                >
                  Assign Manager
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Assignment Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Assign Project Manager</DialogTitle>
            <DialogDescription className="text-xs font-medium">
              Select a manager to handle <strong>{selectedProject?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Select Manager</Label>
              <Select value={selectedManager} onValueChange={setSelectedManager}>
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 text-xs font-bold">
                  <SelectValue placeholder="Choose a manager..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {managers.map(manager => (
                    <SelectItem key={manager._id || manager.id} value={manager._id || manager.id} className="text-xs font-medium py-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${manager.name}`} />
                          <AvatarFallback>{manager.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{manager.name}</span>
                        <Badge variant="secondary" className="ml-auto text-[9px] h-5">{manager.department || 'General'}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-[10px] font-medium border border-amber-100 flex gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <p>Once assigned, this project will appear in the manager's dashboard for team allocation.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedProject(null)} className="rounded-xl h-11">Cancel</Button>
            <Button onClick={handleApprove} className="rounded-xl h-11 bg-primary-600 font-bold">Confirm Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectApprovals;
