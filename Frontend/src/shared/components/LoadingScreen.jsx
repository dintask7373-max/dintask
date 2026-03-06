import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-slate-950">
            <div className="relative flex items-center justify-center mb-8">
                <div className="absolute w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800" />
                <div className="absolute w-24 h-24 rounded-full border-t-4 border-primary-600 animate-spin" />
                <div className="z-10 bg-white dark:bg-slate-950 p-4 rounded-3xl">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-pulse" />
                </div>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Initializing DinTask</h2>
            <p className="text-xs text-slate-400 font-medium animate-pulse">Synchronizing your workspace...</p>

            <div className="absolute bottom-12 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            </div>
        </div>
    );
};

export default LoadingScreen;
