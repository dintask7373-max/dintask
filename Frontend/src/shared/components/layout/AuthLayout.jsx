import React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';

const AuthLayout = ({
    brandTitle,
    brandSubtitle,
    formTitle,
    formSubtitle,
    bgImage = "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop",
    logoSrc = "/dintask-logo.png",
    children
}) => {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-slate-950 font-sans">
            {/* Brand Side */}
            <div className="hidden md:flex md:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-10 bg-cover bg-center"
                    style={{ backgroundImage: `url('${bgImage}')` }}
                />
                <div className="relative z-10 text-white space-y-6 max-w-md">
                    <div className="h-14 w-14 rounded-2xl bg-primary-600 flex items-center justify-center mb-6 shadow-xl shadow-primary-900/30">
                        <img src={logoSrc} alt="DinTask" className="h-9 w-9 object-contain" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight leading-tight">{brandTitle}</h1>
                    <p className="text-slate-400 text-lg">{brandSubtitle}</p>
                </div>
            </div>

            {/* Login Side */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
                {/* Decorative element for mobile */}
                <div className="md:hidden absolute top-0 left-0 w-full h-1 bg-primary-600 shadow-[0_0_20px_rgba(99,116,242,0.5)]" />

                <div className="w-full max-w-md space-y-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{formTitle}</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">{formSubtitle}</p>
                    </div>

                    <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden rounded-[2rem]">
                        <CardContent className="pt-10 pb-10 px-6 md:px-8 space-y-6">
                            {children}
                        </CardContent>
                    </Card>

                    <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                        &copy; 2026 DinTask Inc. Auth Protocol Secure
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
