import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import useProjectStore from '@/store/projectStore';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
    Search,
    Calendar,
    Briefcase,
    ChevronRight,
    User,
    LayoutGrid,
    ArrowRight,
    Users,
    ChevronLeft,
    Clock,
    Layout
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Input } from '@/shared/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';

const AdminProjects = () => {
    const {
        projects,
        projectPagination,
        fetchProjects,
        loading
    } = useProjectStore();

    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(9); // 3x3 grid default
    const [parent] = useAutoAnimate();

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProjects({ page, limit, search: searchTerm });
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [fetchProjects, page, limit, searchTerm]);

    const handleRefresh = () => {
        fetchProjects({ page, limit, search: searchTerm });
        toast.info('Synchronizing project data...');
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Project <span className="text-primary-600">Oversight</span></h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Observing active sectoral implementations</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge className="bg-primary-50 text-primary-600 border-primary-100 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm">
                        {projectPagination.total} Total Projects
                    </Badge>
                </div>
            </div>

            {/* Tactical Control Bar */}
            <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800/50">
                <CardContent className="p-4 flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Identify mission-critical assets..."
                            className="pl-12 h-12 border-none rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-[11px] font-bold"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-1 lg:pb-0 custom-scrollbar">
                        <Select
                            value={limit.toString()}
                            onValueChange={(val) => {
                                setLimit(parseInt(val));
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[140px] h-12 rounded-2xl border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest">
                                <SelectValue placeholder="Limit" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 p-1">
                                <SelectItem value="6" className="rounded-xl text-[10px] font-black uppercase p-3">Show 6</SelectItem>
                                <SelectItem value="9" className="rounded-xl text-[10px] font-black uppercase p-3">Show 9</SelectItem>
                                <SelectItem value="15" className="rounded-xl text-[10px] font-black uppercase p-3">Show 15</SelectItem>
                                <SelectItem value="30" className="rounded-xl text-[10px] font-black uppercase p-3">Show 30</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            className="rounded-2xl h-12 px-6 gap-2 border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest shrink-0"
                            disabled={loading}
                        >
                            <Clock className={cn("size-4", loading && "animate-spin")} />
                            <span>Re-Sync</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div ref={parent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
                {loading && projects.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="size-16 rounded-[2rem] bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                            <Layout className="size-8 text-primary-600 animate-pulse" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Interrogating Database</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Retrieving sectoral implementation records...</p>
                        </div>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-32 space-y-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] bg-white dark:bg-slate-900/50">
                        <div className="size-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-200 dark:text-slate-700">
                            <LayoutGrid size={48} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">Zero Assets</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 max-w-[240px] mx-auto">
                                No implementation records matching these parameters were identified in the current sector.
                            </p>
                        </div>
                    </div>
                ) : (
                    projects.map(project => (
                        <Card key={project._id} className="group border-none shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500 border border-slate-50 dark:border-slate-800/50">
                            <div className={`h-1.5 w-full ${project.status === 'completed' ? 'bg-emerald-500' : 'bg-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'}`} />
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <Badge variant="outline" className={cn(
                                        "uppercase tracking-widest text-[9px] font-black h-6 px-3 rounded-xl border-none shadow-sm",
                                        project.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-50 text-primary-600'
                                    )}>
                                        {project.status?.replace('_', ' ')}
                                    </Badge>
                                    <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-400 text-[9px] font-black uppercase tracking-widest border-none px-3 h-6 rounded-xl">
                                        ETA: {project.deadline ? format(new Date(project.deadline), 'MMM dd') : 'ASYNC'}
                                    </Badge>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors uppercase leading-tight line-clamp-1 truncate tracking-tight">{project.name}</h3>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">
                                            <Briefcase size={12} className="shrink-0 text-slate-300" />
                                            {project.client?.company || project.clientCompany || 'Direct Intelligence'}
                                        </div>
                                    </div>

                                    <div className="py-5 border-t border-b border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <Avatar className="h-12 w-12 rounded-2xl shadow-inner border-2 border-white dark:border-slate-900">
                                                    <AvatarImage src={project.manager?.avatar} />
                                                    <AvatarFallback className="bg-primary-50 text-primary-600 text-xs font-black">{project.manager?.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="absolute -bottom-1 -right-1 size-4 rounded-lg bg-emerald-500 border-2 border-white dark:border-slate-900" />
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5 opacity-60">Lead Architect</p>
                                                <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase truncate max-w-[140px] tracking-wide">{project.manager?.name || 'UNASSIGNED-UNIT'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest opacity-60">Allocation</p>
                                            <p className="text-xs font-black text-slate-900 dark:text-white tracking-tight">₹{project.budget?.toLocaleString() || '0'}</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="rounded-2xl h-11 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white transition-all duration-300 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200 dark:shadow-none translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100"
                                            onClick={() => navigate(`/manager/projects/${project._id}`)}
                                        >
                                            Intercept <ChevronRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Tactical Pagination Controls */}
            {projectPagination && projectPagination.total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-100 dark:border-slate-800/50">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Operationalizing <span className="text-slate-900 dark:text-white italic">{projects.length}</span> / <span className="text-slate-900 dark:text-white italic">{projectPagination.total}</span> sectoral assets
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={page === 1 || loading}
                            onClick={() => setPage(page - 1)}
                            className="rounded-xl size-12 border-slate-200 dark:border-slate-800 hover:bg-primary-50 hover:text-primary-600 active:scale-95 transition-all shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </Button>

                        <div className="flex items-center gap-2 px-4">
                            {[...Array(projectPagination.pages)].map((_, i) => {
                                const p = i + 1;
                                if (projectPagination.pages > 5) {
                                    if (p !== 1 && p !== projectPagination.pages && Math.abs(p - page) > 1) {
                                        if (p === 2 || p === projectPagination.pages - 1) return <span key={p} className="text-slate-300">...</span>;
                                        return null;
                                    }
                                }

                                return (
                                    <Button
                                        key={p}
                                        variant={page === p ? "default" : "outline"}
                                        onClick={() => setPage(p)}
                                        className={cn(
                                            "rounded-xl size-10 text-[10px] font-black shadow-sm transition-all",
                                            page === p ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 scale-110 shadow-lg shadow-slate-200 dark:shadow-none" : "border-slate-100 dark:border-slate-800 text-slate-400 hover:border-primary-200"
                                        )}
                                        disabled={loading}
                                    >
                                        {p}
                                    </Button>
                                );
                            })}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            disabled={page === projectPagination.pages || loading}
                            onClick={() => setPage(page + 1)}
                            className="rounded-xl size-12 border-slate-200 dark:border-slate-800 hover:bg-primary-50 hover:text-primary-600 active:scale-95 transition-all shadow-sm"
                        >
                            <ChevronRight size={20} />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProjects;
