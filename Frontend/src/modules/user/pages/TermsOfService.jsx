import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { fadeInUp } from '@/shared/utils/animations';
import { motion } from 'framer-motion';

const TermsOfService = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen pb-10">
            <div className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="flex items-center p-4 justify-between max-w-[600px] mx-auto">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-lg font-bold">Terms of Service</h2>
                    <div className="w-10"></div>
                </div>
            </div>

            <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="max-w-[600px] mx-auto px-6 pt-4 space-y-6"
            >
                <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                        <FileText size={48} />
                    </div>
                </div>

                <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                    <CardContent className="p-6 space-y-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        <div>
                            <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">1. Acceptance of Terms</h3>
                            <p>By accessing and using DinTask, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>
                        </div>
                        <div>
                            <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">2. Provision of Services</h3>
                            <p>You agree and acknowledge that DinTask is entitled to modify, improve or discontinue any of its services at its sole discretion and without notice to you even if it may result in you being prevented from accessing any information contained in it.</p>
                        </div>
                        <div>
                            <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">3. Proprietary Rights</h3>
                            <p>You acknowledge and agree that DinTask may contain proprietary and confidential information including trademarks, service marks and patents protected by intellectual property laws and international intellectual property treaties.</p>
                        </div>
                        <div>
                            <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">4. Termination of Agreement</h3>
                            <p>The Terms of this agreement will continue to apply in perpetuity until terminated by either party without notice at any time for any reason. Terms that are to continue in perpetuity shall be unaffected by the termination of this agreement.</p>
                        </div>
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-xs text-center">Effective Date: January 01, 2026</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default TermsOfService;
