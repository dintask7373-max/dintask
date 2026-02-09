import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import useProjectStore from '@/store/projectStore';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Search, Calendar, Briefcase, ChevronRight, User, LayoutGrid, ArrowRight, Users } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { cn } from '@/shared/utils/cn';

const AdminProjects = () => {
    const { projects, fetchProjects, loading } = useProjectStore();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [parent] = useAutoAnimate();

    useEffect(() => {
        fetchProjects();
    }, []);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clientCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.manager?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Project <span className="text-primary-600">Oversight</span></h1>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Monitor all active implementations</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative w-full sm:w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search projects or managers..."
                            className="pl-10 rounded-xl bg-white dark:bg-slate-900 border-none shadow-sm h-11"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div ref={parent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-20 text-slate-400">
                        <div className="animate-spin size-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
                        Loading tactical data...
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-slate-400 font-medium border-2 border-dashed rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-900/50">
                        <LayoutGrid size={48} className="mx-auto mb-4 opacity-20" />
                        No active projects found in deployment.
                    </div>
                ) : (
                    filteredProjects.map(project => (
                        <Card key={project._id} className="group border-none shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500">
                            <div className={`h-1.5 w-full ${project.status === 'completed' ? 'bg-emerald-500' : 'bg-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'}`} />
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <Badge variant="outline" className={cn(
                                        "uppercase tracking-widest text-[9px] font-black h-5 px-2 rounded-lg border-none",
                                        project.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-50 text-primary-600'
                                    )}>
                                        {project.status?.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                                        Target: {project.deadline ? format(new Date(project.deadline), 'MMM dd') : 'ASYNC'}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors uppercase leading-tight line-clamp-1">{project.name}</h3>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                            <Briefcase size={12} className="shrink-0" />
                                            {project.clientCompany || 'Direct Client'}
                                        </div>
                                    </div>

                                    <div className="py-4 border-t border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 rounded-xl shadow-sm">
                                                <AvatarImage src={project.manager?.avatar} />
                                                <AvatarFallback className="bg-slate-100 text-slate-500 text-[10px] font-black">{project.manager?.name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Assigned Manager</p>
                                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate max-w-[120px]">{project.manager?.name || 'UNASSIGNED'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Budget: <span className="text-slate-900 dark:text-white ml-1">₹{project.budget?.toLocaleString() || '0'}</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-primary-600 hover:bg-primary-50 rounded-xl text-[10px] font-black uppercase tracking-widest px-4 h-9"
                                            onClick={() => navigate(`/manager/projects/${project._id}`)} // Admin can use manager view to oversee
                                        >
                                            Oversight <ArrowRight size={14} className="ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminProjects;
