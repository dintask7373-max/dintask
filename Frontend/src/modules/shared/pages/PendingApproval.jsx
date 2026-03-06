import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Clock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PendingApproval = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans">
            <Card className="w-full max-w-md border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden text-center">
                <div className="h-2 bg-yellow-500 w-full" />
                <CardHeader className="space-y-4 pt-10">
                    <div className="mx-auto w-24 h-24 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center text-yellow-500 mb-2">
                        <Clock size={48} strokeWidth={2} />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Approval Pending
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400 text-base max-w-xs mx-auto">
                        Your account has been created successfully and is waiting for administrator approval.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-400 text-left">
                        <div className="flex gap-3">
                            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white mb-1">What happens next?</p>
                                <p>Your team administrator has been notified. Once they approve your request, you will be able to log in with your credentials.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pb-8 pt-2">
                    <Button asChild variant="outline" className="w-full h-11 rounded-xl border-slate-200 dark:border-slate-800">
                        <Link to="/">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default PendingApproval;
