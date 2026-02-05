import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Link2,
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    Building2,
    Users,
    Zap
} from 'lucide-react';
import { toast } from 'sonner';
import useEmployeeStore from '@/store/employeeStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/utils/cn';

const JoinWorkspace = () => {
    const navigate = useNavigate();
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, checking, success, error
    const addPendingRequest = useEmployeeStore(state => state.addPendingRequest);

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!inviteCode.trim()) {
            toast.error("Please enter a valid invite code");
            return;
        }

        setLoading(true);
        setStatus('checking');

        try {
            // Simulate API verification of the code
            await new Promise(resolve => setTimeout(resolve, 1500));

            // In a real app, we'd verify the code against the backend/store
            // For now, let's assume if it starts with 'ADM-', it's valid
            if (inviteCode.startsWith('ADM-')) {
                addPendingRequest({
                    fullName: "Current User", // In real app, get from authStore
                    email: "user@example.com",
                    workspaceId: inviteCode,
                    role: 'Employee'
                });

                setStatus('success');
                toast.success("Request sent successfully!");
                setTimeout(() => navigate('/employee/success-join'), 1000);
            } else {
                setStatus('error');
                toast.error("Invalid invite code. Please check and try again.");
            }
        } catch (error) {
            setStatus('error');
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Left Side: Info */}
                <div className="flex-1 space-y-6">
                    <div className="space-y-2">
                        <Badge className="bg-primary-50 text-primary-600 border-primary-100 px-3 py-1 font-bold">
                            Join Your Team
                        </Badge>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                            Work Together with Your Workspace Team
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
                            Joining a workspace gives you access to premium features, shared boards, and team collaboration tools.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        <FeatureCard
                            icon={Link2}
                            title="Shared Resources"
                            desc="Access your team's documents, sheets, and tasks in one place."
                        />
                        <FeatureCard
                            icon={ShieldCheck}
                            title="Admin Support"
                            desc="Get direct help and resources from your workspace administrator."
                        />
                        <FeatureCard
                            icon={Users}
                            title="Colleagues"
                            desc="Stay connected with your team members across the dashboard."
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Premium Features"
                            desc="Unlock advanced tools through your admin's active subscription."
                        />
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="w-full md:w-[400px] shrink-0">
                    <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden">
                        <div className="h-2 bg-primary-600 w-full" />
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-2xl font-bold">Join Workspace</CardTitle>
                            <CardDescription className="font-medium">
                                Enter the unique invite code provided by your administrator.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                            <form onSubmit={handleJoin} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                                        Invite Code
                                    </label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                                        <Input
                                            placeholder="ADM-XXXX-XXXX"
                                            className="h-14 pl-12 bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-2xl font-mono text-lg tracking-wider focus:ring-4 focus:ring-primary-500/10 transition-all font-bold"
                                            value={inviteCode}
                                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                            disabled={loading}
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 px-1 italic">
                                        Ask your admin for the referral link or code.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading || !inviteCode.trim()}
                                    className={cn(
                                        "w-full h-14 rounded-2xl text-lg font-bold transition-all duration-300 relative overflow-hidden",
                                        status === 'success' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-primary-600 hover:bg-primary-700"
                                    )}
                                >
                                    <AnimatePresence mode="wait">
                                        {loading ? (
                                            <motion.div
                                                key="loading"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex items-center gap-2"
                                            >
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Verifying...
                                            </motion.div>
                                        ) : status === 'success' ? (
                                            <motion.div
                                                key="success"
                                                initial={{ y: 20 }}
                                                animate={{ y: 0 }}
                                                className="flex items-center gap-2"
                                            >
                                                <CheckCircle2 size={20} /> Request Sent
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="idle"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex items-center gap-2"
                                            >
                                                Join Team <ArrowRight size={20} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Button>

                                <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-start gap-3">
                                    <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                                    <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                                        Your request will be sent to the admin. Once approved, you will automatically transition to the premium workspace subscription.
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3 group hover:border-primary-500/30 transition-all duration-300">
        <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icon size={20} strokeWidth={2.5} />
        </div>
        <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
        </div>
    </div>
);

const Badge = ({ children, className }) => (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border tracking-tight", className)}>
        {children}
    </span>
);

export default JoinWorkspace;
