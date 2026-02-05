import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, Camera, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import useAuthStore from '@/store/authStore';
import { fadeInUp, scaleOnTap } from '@/shared/utils/animations';

const PersonalAccount = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '+1 (555) 000-0000',
        location: 'San Francisco, CA',
        bio: 'Senior Marketing Specialist with a passion for data-driven results.'
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSaving(false);
        toast.success('Profile updated successfully');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen pb-32">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="flex items-center p-4 justify-between max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-lg font-bold">Personal Account</h2>
                    <div className="w-10"></div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 pt-12 space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-[240px,1fr] gap-12 items-start">
                    {/* Profile Picture */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center lg:items-start"
                    >
                        <div className="relative">
                            <Avatar className="h-32 w-32 lg:h-48 lg:w-48 ring-4 ring-white dark:ring-slate-800 shadow-xl">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} />
                                <AvatarFallback className="bg-primary text-white text-3xl font-black">{user?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="absolute bottom-1 right-1 lg:bottom-4 lg:right-4 p-2 lg:p-3 bg-primary text-white rounded-full shadow-lg border-2 border-white dark:border-slate-800"
                            >
                                <Camera size={16} />
                            </motion.button>
                        </div>
                        <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center lg:text-left ml-1">Employee ID: 49483</p>
                    </motion.div>

                    {/* Form */}
                    <form onSubmit={handleSave} className="space-y-8">
                        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Full Name</Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="pl-12 h-14 bg-white dark:bg-slate-900 border-none shadow-sm rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Email Address</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="pl-12 h-14 bg-white dark:bg-slate-900 border-none shadow-sm rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Phone Number</Label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="pl-12 h-14 bg-white dark:bg-slate-900 border-none shadow-sm rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location" className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Location</Label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="pl-12 h-14 bg-white dark:bg-slate-900 border-none shadow-sm rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex justify-end pt-4"
                        >
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="w-full md:w-auto md:px-12 h-14 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                            >
                                {isSaving ? (
                                    <span className="animate-pulse">Processing Changes...</span>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        <span>Apply Updates</span>
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PersonalAccount;
