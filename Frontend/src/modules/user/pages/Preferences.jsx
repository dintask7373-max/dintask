import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Switch } from "@/shared/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { fadeInUp } from '@/shared/utils/animations';

const Preferences = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        darkMode: document.documentElement.classList.contains('dark'),
    });

    const toggleDarkMode = () => {
        const isDark = !settings.darkMode;
        setSettings({ ...settings, darkMode: isDark });
        document.documentElement.classList.toggle('dark');
        toast.info(`${isDark ? 'Dark' : 'Light'} mode enabled`);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen pb-32">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="flex items-center p-4 justify-between max-w-[480px] mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-lg font-bold">Workspace</h2>
                    <div className="w-10"></div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 pt-12 space-y-8">
                {/* Appearance */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Appearance</h3>
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800">
                        <CardContent className="p-0">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                                        {settings.darkMode ? <Moon size={20} className="text-blue-500" /> : <Sun size={20} className="text-amber-500" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode</p>
                                        <p className="text-[10px] text-slate-400 font-medium tracking-tight">Switch between light and dark themes</p>
                                    </div>
                                </div>
                                <Switch checked={settings.darkMode} onCheckedChange={toggleDarkMode} className="data-[state=checked]:bg-primary" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Preferences;
