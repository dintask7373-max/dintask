import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

const SplashScreen = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans overflow-hidden relative">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-primary-500/10 blur-[100px]"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                    className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px]"
                />
            </div>

            <div className="z-10 flex flex-col items-center text-center max-w-md">
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12, stiffness: 100, duration: 0.8 }}
                    className="mb-8 p-6 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl shadow-primary-500/20"
                >
                    <CheckCircle2 className="w-16 h-16 text-primary-600 dark:text-primary-500" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
                        DinTask
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 mb-12 leading-relaxed">
                        Streamline your workflow, manage tasks efficiently, and boost your productivity.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="w-full"
                >
                    <Button
                        onClick={() => navigate('/employee/login')}
                        className="w-full h-14 text-lg font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                    >
                        Get Started
                        <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Button>

                    <div className="mt-8 flex gap-2 justify-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.9 }}
                            className="w-2 h-2 rounded-full bg-primary-500"
                        />
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.0 }}
                            className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"
                        />
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.1 }}
                            className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"
                        />
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-6 text-xs text-slate-400 dark:text-slate-600 font-medium"
            >
                v1.0.0 • Powered by DinTask
            </motion.div>
        </div>
    );
};

export default SplashScreen;
