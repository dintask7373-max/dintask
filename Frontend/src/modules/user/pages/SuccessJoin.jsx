import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft, ShieldCheck, Mail } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

const SuccessJoin = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-50">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-primary-500/10 blur-[80px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 rounded-full bg-emerald-500/10 blur-[80px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full z-10"
            >
                <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-primary-500 to-emerald-500" />
                    <CardContent className="p-8 md:p-12 flex flex-col items-center text-center">
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
                            className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-8 shadow-inner"
                        >
                            <Clock size={40} strokeWidth={2.5} className="animate-pulse" />
                        </motion.div>

                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                            Request Sent!
                        </h2>

                        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed font-medium">
                            Your application to join the workspace has been submitted successfully. Our team will review your request shortly.
                        </p>

                        <div className="w-full space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                            <div className="flex items-center gap-3 text-left p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <ShieldCheck className="text-primary-500 shrink-0" size={20} />
                                <div className="text-xs">
                                    <p className="font-bold text-slate-800 dark:text-slate-200">Admin Approval Needed</p>
                                    <p className="text-slate-500">Wait for your admin to grant access.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-left p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <Mail className="text-primary-500 shrink-0" size={20} />
                                <div className="text-xs">
                                    <p className="font-bold text-slate-800 dark:text-slate-200">Email Notification</p>
                                    <p className="text-slate-500">You'll receive an email once approved.</p>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={() => navigate('/')}
                            variant="ghost"
                            className="mt-8 text-slate-500 font-bold hover:text-primary-600 transition-colors gap-2"
                        >
                            <ArrowLeft size={18} />
                            Back to Home
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default SuccessJoin;
