import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { fadeInUp } from '@/shared/utils/animations';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen pb-10">
            <div className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="flex items-center p-4 justify-between max-w-[600px] mx-auto">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-lg font-bold">Privacy Policy</h2>
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
                    <div className="p-4 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500">
                        <Shield size={48} />
                    </div>
                </div>

                <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                    <CardContent className="p-6 space-y-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        <div>
                            <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">1. Information We Collect</h3>
                            <p>We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This may include your name, email address, phone number, and any other information you choose to provide.</p>
                        </div>
                        <div>
                            <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">2. How We Use Your Information</h3>
                            <p>We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect DinTask and our users. We also use this information to offer you tailored content â€“ like giving you more relevant search results and ads.</p>
                        </div>
                        <div>
                            <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">3. Data Security</h3>
                            <p>We work hard to protect DinTask and our users from unauthorized access to or unauthorized alteration, disclosure or destruction of information we hold. We use encryption to keep your data private while in transit.</p>
                        </div>
                        <div>
                            <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">4. Changes to This Policy</h3>
                            <p>We may change this privacy policy from time to time. We will not reduce your rights under this Privacy Policy without your explicit consent. We always indicate the date the last changes were published.</p>
                        </div>
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-xs text-center">Last updated: January 15, 2026</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default PrivacyPolicy;
