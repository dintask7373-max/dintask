import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

const Welcome = () => {
    const navigate = useNavigate();

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
            style={{
                backgroundImage: 'url("/WLCOMPAGE .png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                fontFamily: '"Plus Jakarta Sans", sans-serif'
            }}
        >
            {/* Subtle Gradient Overlay for dynamic contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>

            {/* Top-Left Branding - Flush Edge Position with negative nudge */}
            <motion.div
                initial={{ opacity: 0, x: -20, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8 }}
                onClick={() => navigate('/')}
                className="absolute top-0 -left-2 z-50 flex items-center gap-1 cursor-pointer group p-0"
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img
                        src="/dintask-logo.png"
                        alt="DinTask"
                        className="h-20 md:h-28 w-auto object-contain drop-shadow-2xl group-hover:scale-105 transition-transform"
                    />
                </div>
                <span className="text-lg md:text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Din<span className="text-primary-400">Task</span>
                </span>
            </motion.div>

            <div className="relative z-10 w-full max-w-2xl px-6 text-center">
                {/* Previous Logo Area removed from here */}

                {/* Welcome Text */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 1 }}
                    className="mb-8 md:mb-14"
                >
                    <h1 className="text-5xl md:text-8xl font-black text-white mb-4 md:mb-6 tracking-tighter drop-shadow-[0_8px_30px_rgba(0,0,0,0.5)] leading-[0.9]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        Welcome <span className="block text-primary-400 text-3xl md:text-5xl mt-2 md:mt-4 font-extrabold uppercase tracking-[0.25em] drop-shadow-md">Home Base</span>
                    </h1>
                    <p className="text-white text-lg md:text-2xl font-semibold max-w-xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] leading-relaxed italic opacity-90 px-4">
                        Maximize operational efficiency with tactical precision.
                    </p>
                </motion.div>

                {/* Action Buttons */}
                <div className="grid gap-3 sm:gap-6 sm:grid-cols-2 max-w-lg mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                    >
                        <Button
                            onClick={() => navigate('/employee/login')}
                            className="w-full h-14 md:h-20 bg-white/95 text-slate-900 hover:bg-white rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center gap-0.5 md:gap-1 group transition-all duration-500 border-none shadow-[0_10px_30px_rgba(0,0,0,0.2)] md:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-2xl hover:-translate-y-1 active:scale-95 backdrop-blur-md"
                        >
                            <div className="flex items-center gap-2">
                                <User size={18} className="text-primary-600 md:size-6" />
                                <span className="font-extrabold uppercase tracking-[0.15em] text-xs md:text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>Agent Portal</span>
                            </div>
                            <span className="text-[9px] md:text-[11px] font-bold text-slate-500 uppercase tracking-tighter flex items-center gap-1 opacity-80 group-hover:opacity-100 italic">
                                Access Workspace <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform md:size-3" />
                            </span>
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                    >
                        <Button
                            onClick={() => navigate('/admin/login')}
                            className="w-full h-14 md:h-20 bg-primary-600 text-white hover:bg-primary-500 rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center gap-0.5 md:gap-1 group transition-all duration-500 border-none shadow-[0_10px_30px_rgba(99,116,242,0.2)] md:shadow-[0_20px_50px_rgba(99,116,242,0.3)] hover:shadow-2xl hover:-translate-y-1 active:scale-95"
                        >
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={18} className="md:size-6" />
                                <span className="font-extrabold uppercase tracking-[0.15em] text-xs md:text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>Command Center</span>
                            </div>
                            <span className="text-[9px] md:text-[11px] font-bold text-primary-200 uppercase tracking-tighter flex items-center gap-1 opacity-80 group-hover:opacity-100 italic">
                                Tactical Admin <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform md:size-3" />
                            </span>
                        </Button>
                    </motion.div>
                </div>

                {/* Footer Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1 }}
                    className="mt-20"
                >
                    <button
                        onClick={() => navigate('/')}
                        className="text-white/60 hover:text-white text-sm font-black uppercase tracking-[0.4em] transition-all hover:tracking-[0.5em] drop-shadow-md"
                        style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                        [ Return to Intelligence ]
                    </button>
                </motion.div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 p-12 hidden lg:block">
                <div className="size-24 border-t-2 border-r-2 border-white/20 rounded-tr-[3rem]"></div>
            </div>
            <div className="absolute bottom-0 left-0 p-12 hidden lg:block">
                <div className="size-24 border-b-2 border-l-2 border-white/20 rounded-bl-[3rem]"></div>
            </div>
        </div>
    );
};

export default Welcome;
