import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useProjectStore from '@/store/projectStore';
import useTaskStore from '@/store/taskStore'; // Assuming taskStore is available
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const ManagerProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, fetchProjects, updateProjectStatus } = useProjectStore(); // Or fetchProject(id) if available
  const { tasks, fetchTasks } = useTaskStore(); // Or fetchTasksByProject(id)

  useEffect(() => {
    if (projects.length === 0) fetchProjects();
    // Optimized: fetchTasks(); // Ideally fetch by project from API
  }, [id]);

  const project = projects.find(p => p._id === id || p.id === id);
  const projectTasks = tasks.filter(t => t.project === id || t.projectId === id);

  if (!project) return <div className="p-8 text-center text-slate-500">Project not found or loading...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{project.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="uppercase text-[10px] tracking-widest font-bold">
              {project.status?.replace('_', ' ')}
            </Badge>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-widest">
              {project.clientCompany}
            </span>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          {project.status === 'active' && (
            <Button
              variant="outline"
              onClick={() => updateProjectStatus(project._id || project.id, 'completed')}
              className="font-black uppercase tracking-widest text-xs border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
            >
              Mark Completed
            </Button>
          )}
          <Button onClick={() => navigate(`/manager/assign-task?projectId=${project._id || project.id}`)} className="font-black uppercase tracking-widest text-xs">
            Assign New Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 dark:border-slate-800">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{project.description}</p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Client Email</label>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{project.clientEmail || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Budget</label>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">${project.amount?.toLocaleString() || '0'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks List */}
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Active Tasks</CardTitle>
              <Badge variant="outline">{projectTasks.length}</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {projectTasks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No active tasks for this project</div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {projectTasks.map(task => (
                    <div key={task.id || task._id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${task.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'}`} />
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{task.title}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.assignedTo?.length || 0} Assignees</div>
                        </div>
                      </div>
                      <Badge variant={task.status === 'completed' ? 'default' : 'secondary'} className="uppercase text-[9px] font-black tracking-widest">
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Stats/Timeline */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 dark:border-slate-800">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="text-slate-400" size={16} />
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Created</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{project.createdAt ? format(new Date(project.createdAt), 'MMM dd, yyyy') : 'N/A'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManagerProjectDetails;
