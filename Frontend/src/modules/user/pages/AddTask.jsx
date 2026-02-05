import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Calendar as CalendarIcon, Flag, AlignLeft, Tag, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Calendar } from "@/shared/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/utils/cn";
import useTaskStore from '@/store/taskStore';
import { fadeInUp, scaleOnTap } from '@/shared/utils/animations';

import useAuthStore from '@/store/authStore';

const AddTask = () => {
    const navigate = useNavigate();
    const addTask = useTaskStore(state => state.addTask);
    const { user } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: new Date(),
        priority: 'medium',
        labels: []
    });

    const [newLabel, setNewLabel] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title) {
            toast.error('Title is required');
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        addTask({
            ...formData,
            labels: [...formData.labels, 'Self Task'],
            status: 'pending',
            progress: 0,
            assignedTo: [user?.id || '1'], // Assigning to self dynamically
            assignedBy: 'self',
            activity: [
                { user: 'You', content: 'created this task', time: 'Just now', type: 'system' }
            ]
        });

        setIsSubmitting(false);
        toast.success('Task created successfully');
        navigate('/employee');
    };

    const addLabel = () => {
        if (newLabel && !formData.labels.includes(newLabel)) {
            setFormData({ ...formData, labels: [...formData.labels, newLabel] });
            setNewLabel('');
        }
    };

    const removeLabel = (label) => {
        setFormData({ ...formData, labels: formData.labels.filter(l => l !== label) });
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
                    <h2 className="text-lg font-bold">New Task</h2>
                    <div className="w-10"></div>
                </div>
            </div>

            <div className="max-w-[480px] mx-auto px-6 pt-4 space-y-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title & Description */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Task Title</Label>
                            <Input
                                placeholder="What needs to be done?"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="h-14 text-lg font-bold bg-white dark:bg-slate-900 border-none shadow-sm rounded-2xl focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Description</Label>
                            <Textarea
                                placeholder="Add more details..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="min-h-[120px] bg-white dark:bg-slate-900 border-none shadow-sm rounded-2xl focus:ring-2 focus:ring-primary/20 resize-none pt-4"
                            />
                        </div>
                    </div>

                    {/* Settings Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Deadline</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full h-12 pl-10 justify-start text-left font-bold text-xs bg-white dark:bg-slate-900 border-none shadow-sm rounded-xl relative hover:bg-white dark:hover:bg-slate-900",
                                            !formData.deadline && "text-muted-foreground"
                                        )}
                                    >
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10">
                                            <CalendarIcon size={16} />
                                        </div>
                                        {formData.deadline ? format(formData.deadline, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.deadline}
                                        onSelect={(date) => setFormData({ ...formData, deadline: date || new Date() })}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) => setFormData({ ...formData, priority: value })}
                            >
                                <SelectTrigger className="w-full h-12 bg-white dark:bg-slate-900 border-none shadow-sm rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 pl-10 relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10">
                                        <Flag size={16} />
                                    </div>
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent position="popper" sideOffset={5} align="start" className="w-[var(--radix-select-trigger-width)]">
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Labels</Label>
                        <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] items-center">
                            <AnimatePresence>
                                {formData.labels.map(label => (
                                    <motion.div
                                        key={label}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="h-8 flex items-center gap-1.5 px-3 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest"
                                    >
                                        <span>{label}</span>
                                        <button type="button" onClick={() => removeLabel(label)} className="hover:text-primary-700">
                                            <X size={12} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <div className="relative flex-1 min-w-[120px]">
                                <Input
                                    placeholder="Add label..."
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLabel(); } }}
                                    className="h-10 bg-white dark:bg-slate-900 border-none shadow-sm rounded-full text-[10px] pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={addLabel}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                        >
                            {isSubmitting ? (
                                <span className="animate-pulse">Creating Task...</span>
                            ) : (
                                <>
                                    <CheckCircle2 size={24} />
                                    <span>Create Task</span>
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTask;
