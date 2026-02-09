import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Briefcase,
    BarChart3,
    Users,
    ShieldCheck,
    Save,
    RotateCcw,
    Plus,
    Trash2,
    ChevronRight,
    Edit3,
    Layout
} from 'lucide-react';
import { toast } from 'sonner';
import useSuperAdminStore from '@/store/superAdminStore';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const IntelManager = () => {
    const { systemIntel, fetchSystemIntel, updateSystemIntel, seedSystemIntel, loading } = useSuperAdminStore();
    const [selectedRole, setSelectedRole] = useState(null);
    const [editData, setEditData] = useState(null);

    useEffect(() => {
        fetchSystemIntel();
    }, []);

    const handleSelectRole = (intel) => {
        setSelectedRole(intel.role);
        setEditData({ ...intel });
    };

    const handleAddField = (field) => {
        setEditData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const handleRemoveField = (field, index) => {
        setEditData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleFieldChange = (field, index, value) => {
        const newList = [...editData[field]];
        newList[index] = value;
        setEditData(prev => ({
            ...prev,
            [field]: newList
        }));
    };

    const handleSave = async () => {
        if (!editData) return;

        const success = await updateSystemIntel(editData.role, editData);
        if (success) {
            toast.success(`${editData.role} intel updated successfully`);
        } else {
            toast.error(`Failed to update ${editData.role} intel`);
        }
    };

    const handleSeed = async () => {
        if (confirm('Are you sure you want to reset all intel to default values? This will overwrite existing changes.')) {
            const success = await seedSystemIntel();
            if (success) {
                toast.success('System intel reset to defaults');
                setSelectedRole(null);
                setEditData(null);
            } else {
                toast.error('Failed to seed system intel');
            }
        }
    };

    const roleIcons = {
        Admin: Shield,
        Manager: Briefcase,
        Sales: BarChart3,
        Employee: Users,
        SuperAdmin: ShieldCheck
    };

    const roleColors = {
        Admin: 'text-blue-500 bg-blue-500/10',
        Manager: 'text-amber-500 bg-amber-500/10',
        Sales: 'text-emerald-500 bg-emerald-500/10',
        Employee: 'text-primary-500 bg-primary-500/10',
        SuperAdmin: 'text-purple-600 bg-purple-600/10'
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Layout className="text-primary-600" size={32} />
                        Infrastructure Intel
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                        Configure the tactical breakdowns shown on the Welcome Portal.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={handleSeed}
                    className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold group"
                >
                    <RotateCcw size={16} className="mr-2 group-hover:rotate-180 transition-transform duration-500" />
                    Reset to Defaults
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Role List */}
                <div className="lg:col-span-4 space-y-4">
                    {systemIntel.map((intel) => {
                        const Icon = roleIcons[intel.role] || Layout;
                        const colorClass = roleColors[intel.role] || 'text-slate-500 bg-slate-500/10';
                        const isActive = selectedRole === intel.role;

                        return (
                            <motion.button
                                key={intel.role}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelectRole(intel)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 ${isActive
                                    ? 'bg-white dark:bg-slate-900 border-primary-500 shadow-xl shadow-primary-500/10 ring-1 ring-primary-500/20'
                                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                    }`}
                            >
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                                    <Icon size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">
                                        {intel.role}
                                    </h3>
                                    <p className="text-xs text-slate-500 truncate font-medium">{intel.title}</p>
                                </div>
                                <ChevronRight
                                    size={18}
                                    className={`transition-transform duration-300 ${isActive ? 'translate-x-1 text-primary-500' : 'text-slate-300'}`}
                                />
                            </motion.button>
                        );
                    })}
                </div>

                {/* Edit Area */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {editData ? (
                            <motion.div
                                key={selectedRole}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
                                    <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 p-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${roleColors[selectedRole]}`}>
                                                    {React.createElement(roleIcons[selectedRole], { size: 28 })}
                                                </div>
                                                <div>
                                                    <CardTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                                                        {selectedRole} Configuration
                                                    </CardTitle>
                                                    <CardDescription className="font-medium">
                                                        Update the messaging for the {selectedRole.toLowerCase()} module
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={handleSave}
                                                className="bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest text-xs px-6 rounded-xl shadow-lg shadow-primary-900/20"
                                            >
                                                <Save size={16} className="mr-2" />
                                                Commit Changes
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8 space-y-8">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Entity Title</Label>
                                                <Input
                                                    value={editData.title}
                                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                                    placeholder="Strategic Command"
                                                    className="h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-xl font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tactical Process Descriptor</Label>
                                            <Input
                                                value={editData.process}
                                                onChange={(e) => setEditData({ ...editData, process: e.target.value })}
                                                placeholder="Step 1 -> Step 2 -> Step 3"
                                                className="h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-xl font-bold"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Core Workflow */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Core Workflow Modules</Label>
                                                    <button
                                                        onClick={() => handleAddField('flow')}
                                                        className="text-primary-600 hover:text-primary-700 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1"
                                                    >
                                                        <Plus size={12} /> Add Step
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {editData.flow.map((step, idx) => (
                                                        <div key={idx} className="flex gap-2">
                                                            <Input
                                                                value={step}
                                                                onChange={(e) => handleFieldChange('flow', idx, e.target.value)}
                                                                className="h-10 bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-lg text-sm font-medium"
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleRemoveField('flow', idx)}
                                                                className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg"
                                                            >
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Tactical Features */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tactical Feature Tags</Label>
                                                    <button
                                                        onClick={() => handleAddField('features')}
                                                        className="text-primary-600 hover:text-primary-700 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1"
                                                    >
                                                        <Plus size={12} /> Add Tag
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {editData.features.map((feature, idx) => (
                                                        <div key={idx} className="flex gap-2">
                                                            <Input
                                                                value={feature}
                                                                onChange={(e) => handleFieldChange('features', idx, e.target.value)}
                                                                className="h-10 bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-lg text-sm font-medium"
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleRemoveField('features', idx)}
                                                                className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg"
                                                            >
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-900/20">
                                <Edit3 size={48} className="text-slate-300 mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Select Entity to Modify</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Choose a role from the list to update its displayed intelligence.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default IntelManager;
