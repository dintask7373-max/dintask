import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus,
    Check,
    X,
    Clock,
    User,
    Mail,
    Shield,
    Search,
    Filter,
    ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import useEmployeeStore from '@/store/employeeStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { format } from 'date-fns';
import { useAutoAnimate } from '@formkit/auto-animate/react';

const JoinRequests = () => {
    const { pendingRequests, approveRequest, rejectRequest } = useEmployeeStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [parent] = useAutoAnimate();

    const filteredRequests = pendingRequests.filter(req =>
        req.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleApprove = (id, name) => {
        const success = approveRequest(id);
        if (success) {
            toast.success(`${name} has been approved and added to your team!`);
        } else {
            toast.error("Failed to approve. Subscription limit might be reached.");
        }
    };

    const handleReject = (id, name) => {
        rejectRequest(id);
        toast.error(`${name}'s request has been rejected.`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Join Requests</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        New team members waiting for your approval.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className="bg-primary-50 text-primary-600 border-primary-100 px-3 py-1 text-xs font-bold">
                        {pendingRequests.length} Pending
                    </Badge>
                </div>
            </div>

            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-9 h-11 border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="rounded-xl h-11 gap-2 border-slate-200 dark:border-slate-800">
                        <Filter size={18} />
                        <span>Recent First</span>
                    </Button>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4" ref={parent}>
                <AnimatePresence mode="popLayout">
                    {filteredRequests.length > 0 ? (
                        filteredRequests.map((req, index) => (
                            <motion.div
                                key={req.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                            >
                                <Card className="border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-none transition-all duration-300 rounded-3xl overflow-hidden group">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                            <div className="flex-1 flex items-start gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/40 dark:to-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0 shadow-inner">
                                                    <User size={28} strokeWidth={2.5} />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none">
                                                            {req.fullName}
                                                        </h3>
                                                        <Badge variant="outline" className="rounded-full text-[10px] font-black uppercase tracking-tighter bg-blue-50/50 text-blue-600 border-blue-100">
                                                            {req.role}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 pt-1">
                                                        <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                                                            <Mail size={14} className="text-slate-400" /> {req.email}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                                                            <Shield size={14} className="text-slate-400" /> Ref: {req.workspaceId}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-sm font-medium text-slate-400">
                                                            <Clock size={14} /> {format(new Date(req.requestedDate), 'MMM dd, HH:mm')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <Button
                                                    onClick={() => handleReject(req.id, req.fullName)}
                                                    variant="outline"
                                                    className="rounded-2xl h-12 px-6 border-slate-200 dark:border-slate-800 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all font-bold group/reject"
                                                >
                                                    <X size={18} className="mr-2 group-hover/reject:rotate-90 transition-transform" />
                                                    Reject
                                                </Button>
                                                <Button
                                                    onClick={() => handleApprove(req.id, req.fullName)}
                                                    className="rounded-2xl h-12 px-8 bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200 dark:shadow-none font-bold group/approve"
                                                >
                                                    <Check size={18} className="mr-2 group-hover/approve:scale-125 transition-transform" />
                                                    Approve Access
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[40px] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-inner">
                            <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-200 dark:text-slate-800 mx-auto mb-6">
                                <UserPlus size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">All caught up!</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto font-medium">
                                No pending join requests at the moment. New requests from your team links will appear here.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-8 rounded-2xl border-primary-100 bg-primary-50/30 text-primary-600 font-bold hover:bg-primary-50 px-8"
                                onClick={() => window.history.back()}
                            >
                                Go Back
                            </Button>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default JoinRequests;
