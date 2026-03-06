import React, { useEffect, useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import useProjectStore from '@/store/projectStore';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Search, Calendar, Briefcase, ChevronRight } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAutoAnimate } from '@formkit/auto-animate/react';

const ManagerProjects = () => {
  const { projects, fetchProjects, loading } = useProjectStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [parent] = useAutoAnimate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clientCompany?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">My Projects</h1>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Manage Assign Projects</p>
        </div>
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search projects..."
            className="pl-10 rounded-xl bg-white dark:bg-slate-900 border-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div ref={parent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-400">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 font-medium border-2 border-dashed rounded-3xl">No projects found.</div>
        ) : (
          filteredProjects.map(project => (
            <Card key={project._id} className="group border-2 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-[2rem] overflow-hidden cursor-pointer bg-white dark:bg-slate-900" onClick={() => navigate(`/manager/projects/${project._id}`)}>
              <div className={cn(
                "h-1.5 w-full transition-colors",
                project.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
              )} />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className="uppercase tracking-widest text-[10px] font-black border-slate-100 bg-slate-50 text-slate-600">
                    {project.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Deadline: {project.deadline ? format(new Date(project.deadline), 'MMM dd') : 'N/A'}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">{project.name}</h3>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-6">
                  <Briefcase size={14} className="text-slate-400" />
                  {project.clientCompany || 'No Company'}
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex -space-x-2">
                    {/* Placeholder for team avatars */}
                    <div className="h-8 w-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                      +
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-primary-600 hover:bg-primary-50 rounded-lg text-xs font-black uppercase tracking-widest">
                    View Details <ChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ManagerProjects;
