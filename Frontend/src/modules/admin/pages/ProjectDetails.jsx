import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useProjectStore from '@/store/projectStore';
import useTaskStore from '@/store/taskStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ArrowLeft, CheckCircle, Clock, Trash2, Briefcase, User, Layers } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';

const AdminProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { projects, fetchProjects, updateProjectStatus, deleteProject, loading } = useProjectStore();
    const { tasks, fetchTasks } = useTaskStore();

    useEffect(() => {
        const loadData = async () => {
            if (projects.length === 0) await fetchProjects();
            await fetchTasks();
        };
        loadData();
    }, [fetchProjects, fetchTasks]);

    const project = projects.find(p => p._id === id || p.id === id);
    const projectTasks = tasks.filter(t => t.project === id || t.projectId === id);

    if (loading && !project) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="size-16 rounded-[2rem] bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                    <Layers className="size-8 text-primary-600 animate-pulse" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Interrogating Assets</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Retrieving mission data...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="p-12 text-center space-y-4">
                <div className="text-slate-400 font-bold uppercase tracking-widest text-sm italic">Project Not Identified</div>
                <Button variant="outline" onClick={() => navigate('/admin/projects')} className="rounded-xl uppercase text-[10px] font-black tracking-[0.2em]">
                    Return to Fleet
                </Button>
            </div>
        );
    }

    const handleDelete = async () => {
        if (window.confirm("CRITICAL: This will permanently purge this project and ALL associated tasks. This action is irreversible. Continue?")) {
            const success = await deleteProject(project._id || project.id);
            if (success) {
                toast.success("Project decommissioned successfully");
                navigate('/admin/projects');
            } else {
                toast.error("Failed to terminate project");
            }
        }
    };

    const handleStatusChange = async (newStatus) => {
        const success = await updateProjectStatus(project._id || project.id, newStatus);
        if (success) {
            toast.success(`Project status updated to ${newStatus}`);
        } else {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Tactical Navigation Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigate('/admin/projects')} 
                        className="rounded-2xl size-12 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50"
                    >
                        <ArrowLeft size={18} className="text-slate-600" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">{project.name}</h1>
                            <Badge variant="outline" className={cn(
                                "uppercase text-[9px] tracking-[0.15em] font-black h-6 px-3 rounded-xl border-none shadow-sm",
                                project.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-50 text-primary-600'
                            )}>
                                {project.status?.replace('_', ' ')}
                            </Badge>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
                             <Briefcase size={10} /> Sector: {project.clientCompany || 'Internal Asset'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        onClick={handleDelete}
                        className="rounded-2xl h-12 px-6 border-red-100 text-red-600 bg-red-50 hover:bg-red-100 transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-200/20"
                    >
                        <Trash2 size={16} className="mr-2" /> Decommission
                    </Button>
                    
                    {project.status !== 'completed' && (
                        <Button 
                            onClick={() => handleStatusChange('completed')}
                            className="rounded-2xl h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 transition-all text-[10px] font-black uppercase tracking-[0.2em]"
                        >
                            <CheckCircle size={16} className="mr-2" /> Mark Finalized
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Deployment Data */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-none shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-50 dark:border-slate-800/50">
                        <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800/50">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 italic">Core Mission Briefing</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-loose italic">
                                "{project.description || 'No detailed mission parameters provided for this deployment.'}"
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest opacity-60">Architect in Charge</label>
                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="size-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-sm">
                                            {project.manager?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wide">
                                            {project.manager?.name || 'Unassigned Unit'}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest opacity-60">Financial Allocation</label>
                                    <div className="mt-3">
                                        <div className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">
                                            ₹{project.budget?.toLocaleString() || '0'}
                                        </div>
                                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Operational Budget</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Operational Node Grid (Tasks) */}
                    <Card className="border-none shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-50 dark:border-slate-800/50">
                        <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800/50 flex flex-row items-center justify-between">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 italic text-nowrap mr-4">Deployment Nodes</CardTitle>
                            <Badge className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-6 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                {projectTasks.length} NODES
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            {projectTasks.length === 0 ? (
                                <div className="p-20 text-center flex flex-col items-center justify-center">
                                    <div className="size-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-200 dark:text-slate-700 mb-4">
                                        <Layers size={32} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Zero active nodes in this sector</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {projectTasks.map(task => (
                                        <div key={task.id || task._id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                                            <div className="flex items-center gap-5">
                                                <div className={cn(
                                                    "size-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm",
                                                    task.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                )}>
                                                    {task.status === 'completed' ? <CheckCircle size={20} /> : <Clock size={20} />}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight italic group-hover:text-primary-600 transition-colors">
                                                        {task.title}
                                                    </div>
                                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                                        <User size={10} /> {task.assignedTo?.length || 0} Operators Assigned
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={cn(
                                                "uppercase text-[9px] font-black tracking-widest h-6 px-3 rounded-xl border-none shadow-sm",
                                                task.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                            )}>
                                                {task.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Logistics Column */}
                <div className="space-y-8">
                    <Card className="border-none shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-50 dark:border-slate-800/50">
                        <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800/50">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 italic">Temporal Data</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-center gap-5">
                                <div className="size-11 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400">
                                    <Clock size={18} />
                                </div>
                                <div className="min-w-0">
                                    <label className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em] opacity-60">System Inception</label>
                                    <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mt-1">
                                        {project.createdAt ? format(new Date(project.createdAt), 'MMM dd, yyyy') : 'Async Initialized'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-5">
                                <div className="size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                    <Layers size={18} />
                                </div>
                                <div className="min-w-0">
                                    <label className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em] opacity-60">Deadline Node</label>
                                    <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mt-1">
                                        {project.deadline ? format(new Date(project.deadline), 'MMM dd, yyyy') : 'No Limit Defined'}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-slate-200/20 dark:shadow-none bg-primary-600 dark:bg-primary-600 rounded-[2.5rem] overflow-hidden p-1">
                        <div className="p-8 space-y-4">
                            <div className="size-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                                <Layers size={20} />
                            </div>
                            <div>
                                <h4 className="text-white font-black uppercase italic tracking-tight">Node Insight</h4>
                                <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-2 leading-relaxed">
                                    View real-time deployment status across all sectoral assets for this implementation.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminProjectDetails;
