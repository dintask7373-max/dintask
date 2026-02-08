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
            await new Promise(resolve => setTimeout(resolve, 1500));
            if (inviteCode.startsWith('ADM-')) {
                addPendingRequest({
                    fullName: "Current User",
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
        <div className="min-h-screen w-full bg-white dark:bg-slate-950 relative flex flex-col items-center justify-start font-sans overflow-x-hidden">
            {/* Enhanced Background Visibility */}
            <div className="absolute inset-0 h-[420px] z-0 overflow-hidden">
                <img
                    src="/WLCOMPAGE .png"
                    alt="Background"
                    className="w-full h-full object-cover object-center opacity-70 dark:opacity-30 translate-y-[-10%]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-white dark:from-slate-950/40 dark:via-slate-950/80 dark:to-slate-950" />
            </div>

            {/* Join Workspace Content */}
            <div className="w-full max-w-[440px] mt-20 px-4 relative z-10 pb-20">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] p-10 md:p-12 border border-white dark:border-slate-800">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Join Workspace</h1>
                        <p className="text-slate-400 text-xs font-medium italic">Enter unique invite code from your admin</p>
                    </div>

                    <form onSubmit={handleJoin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">
                                Invite Code
                            </label>
                            <div className="relative group">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#4461f2] transition-colors" size={18} />
                                <Input
                                    placeholder="ADM-XXXX-XXXX"
                                    className="h-12 pl-11 bg-slate-50 border-slate-100 rounded-xl text-slate-900 font-bold text-sm tracking-widest placeholder:text-slate-300 placeholder:tracking-normal focus:bg-white focus:ring-2 focus:ring-[#4461f2]/10 transition-all duration-200"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 ml-1 font-medium">
                                Ask your admin for the referral link or code.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !inviteCode.trim()}
                            className={cn(
                                "w-full h-12 text-sm font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] mt-2",
                                status === 'success' ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20" : "bg-[#4461f2] hover:bg-[#3451e2] text-white shadow-[#4461f2]/20"
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
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        <span>Verifying...</span>
                                    </motion.div>
                                ) : status === 'success' ? (
                                    <motion.div
                                        key="success"
                                        initial={{ y: 10 }}
                                        animate={{ y: 0 }}
                                        className="flex items-center gap-2"
                                    >
                                        <CheckCircle2 size={18} /> Request Sent
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="idle"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center gap-2"
                                    >
                                        Join Team <ArrowRight size={18} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Button>

                        <div className="mt-6 p-5 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-start gap-3">
                            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                            <p className="text-[10px] leading-snug text-amber-700/80 font-semibold italic">
                                Your request will be sent to the admin. Once approved, you will join the premium workspace.
                            </p>
                        </div>
                    </form>

                    <div className="text-center mt-10">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Badge = ({ children, className }) => (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border tracking-tight", className)}>
        {children}
    </span>
);

export default JoinWorkspace;
