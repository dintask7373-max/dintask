import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save,
    LayoutGrid,
    Zap,
    CheckCircle2,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    Plus,
    Trash2,
    Shield,
    Users,
    Briefcase,
    User
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import useSuperAdminStore from '@/store/superAdminStore';
import { cn } from '@/shared/utils/cn';

const IntelManager = () => {
    const { systemIntel, fetchSystemIntel, updateSystemIntel, seedSystemIntel, loading } = useSuperAdminStore();
    const [editData, setEditData] = useState({});
    const [activeRole, setActiveRole] = useState('Admin');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSystemIntel();
    }, []);

    useEffect(() => {
        if (systemIntel && systemIntel.length > 0) {
            const map = {};
            systemIntel.forEach(item => {
                map[item.role] = { ...item };
            });
            setEditData(map);
        }
    }, [systemIntel]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleSave = async () => {
        setSaving(true);
        const success = await updateSystemIntel(activeRole, editData[activeRole]);
        if (success) {
            showMessage('success', `${activeRole} Infrastructure Intel updated successfully!`);
        } else {
            showMessage('error', 'Failed to update intelligence data.');
        }
        setSaving(false);
    };

    const handleSeed = async () => {
        if (window.confirm('This will reset all intel to default values. Continue?')) {
            const success = await seedSystemIntel();
            if (success) {
                showMessage('success', 'Intelligence data reset to defaults.');
            } else {
                showMessage('error', 'Reset failed.');
            }
        }
    };

    const updateField = (field, value) => {
        setEditData(prev => ({
            ...prev,
            [activeRole]: {
                ...prev[activeRole],
                [field]: value
            }
        }));
    };

    const handleArrayChange = (field, index, value) => {
        const newData = { ...editData[activeRole] };
        newData[field][index] = value;
        updateField(field, newData[field]);
    };

    const addArrayItem = (field) => {
        const newData = { ...editData[activeRole] };
        newData[field] = [...newData[field], ''];
        updateField(field, newData[field]);
    };

    const removeArrayItem = (field, index) => {
        const newData = { ...editData[activeRole] };
        newData[field] = newData[field].filter((_, i) => i !== index);
        updateField(field, newData[field]);
    };

    if (loading && !systemIntel.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="animate-spin text-primary-600" size={32} />
            </div>
        );
    }

    const roles = [
        { id: 'Admin', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { id: 'Manager', icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { id: 'Sales', icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { id: 'Employee', icon: User, color: 'text-primary-500', bg: 'bg-primary-500/10' }
    ];

    const currentData = editData[activeRole] || { role: activeRole, title: '', process: '', flow: [], features: [] };

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <LayoutGrid className="text-primary-600" size={36} />
                        Infrastructure <span className="text-primary-600">Intel Manager</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Configure tactical module information for the public welcome page.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleSeed} className="font-bold border-2">
                        Reset Defaults
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary-600 hover:bg-primary-700 font-bold px-8 shadow-lg shadow-primary-500/20"
                    >
                        {saving ? <RefreshCw className="animate-spin mr-2" /> : <Save className="mr-2" />}
                        Save Intelligence
                    </Button>
                </div>
            </div>

            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={cn(
                            "p-4 rounded-2xl flex items-center gap-3 font-bold shadow-sm",
                            message.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                        )}
                    >
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-3 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Tactical Entities</p>
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => setActiveRole(role.id)}
                            className={cn(
                                "w-full p-4 rounded-2xl flex items-center gap-4 transition-all border-2 text-left font-black tracking-tight",
                                activeRole === role.id
                                    ? "bg-white border-primary-600 shadow-xl shadow-primary-500/5 text-slate-900"
                                    : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
                            )}
                        >
                            <div className={cn("size-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner", role.bg)}>
                                <role.icon className={cn("size-6", role.color)} />
                            </div>
                            <span className="text-lg">{role.id} Portal</span>
                        </button>
                    ))}
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-9 space-y-6">
                    <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                            <div className="flex items-center gap-4">
                                <div className={cn("size-14 rounded-2xl flex items-center justify-center", roles.find(r => r.id === activeRole).bg)}>
                                    {React.createElement(roles.find(r => r.id === activeRole).icon, { size: 32, className: roles.find(r => r.id === activeRole).color })}
                                </div>
                                <CardTitle className="text-3xl font-black text-slate-900 tracking-tighter">
                                    {activeRole} Intelligence <span className="text-slate-400 font-medium">Config</span>
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            {/* Base Info */}
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Module Title</label>
                                    <input
                                        type="text"
                                        value={currentData.title}
                                        onChange={(e) => updateField('title', e.target.value)}
                                        className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white transition-all text-slate-900 font-bold outline-none shadow-inner"
                                        placeholder="e.g., Strategic Command"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Tactical Process</label>
                                    <input
                                        type="text"
                                        value={currentData.process}
                                        onChange={(e) => updateField('process', e.target.value)}
                                        className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white transition-all text-slate-900 font-bold italic outline-none shadow-inner"
                                        placeholder="e.g., Oversight -> Allocation -> Intelligence"
                                    />
                                </div>
                            </div>

                            <div className="h-px bg-slate-100" />

                            {/* Core Workflow Editor */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-black text-slate-900 tracking-tight">Core Workflow</h4>
                                        <p className="text-xs text-slate-500 font-medium">Define the primary operational steps for this role.</p>
                                    </div>
                                    <Button size="sm" onClick={() => addArrayItem('flow')} className="bg-slate-900 hover:bg-black font-bold h-9 px-4 rounded-xl">
                                        <Plus size={16} className="mr-2" /> Add Step
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {currentData.flow.map((step, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center gap-3 group"
                                        >
                                            <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 font-black text-slate-400 group-focus-within:bg-primary-50 group-focus-within:text-primary-600 transition-colors">
                                                {idx + 1}
                                            </div>
                                            <input
                                                type="text"
                                                value={step}
                                                onChange={(e) => handleArrayChange('flow', idx, e.target.value)}
                                                className="flex-1 h-12 px-5 rounded-xl bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white transition-all text-sm font-bold text-slate-700 outline-none"
                                            />
                                            <button
                                                onClick={() => removeArrayItem('flow', idx)}
                                                className="size-10 rounded-xl hover:bg-red-50 hover:text-red-500 text-slate-300 transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-slate-100" />

                            {/* Features Editor */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-black text-slate-900 tracking-tight">Key Features</h4>
                                        <p className="text-xs text-slate-500 font-medium">Highlight critical modules or capabilities.</p>
                                    </div>
                                    <Button size="sm" onClick={() => addArrayItem('features')} className="bg-slate-900 hover:bg-black font-bold h-9 px-4 rounded-xl">
                                        <Plus size={16} className="mr-2" /> Add Tag
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    {currentData.features.map((tag, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 p-1.5 pl-4 rounded-xl border border-slate-200 transition-colors group"
                                        >
                                            <input
                                                type="text"
                                                value={tag}
                                                onChange={(e) => handleArrayChange('features', idx, e.target.value)}
                                                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none w-24 focus:w-32 transition-all"
                                            />
                                            <button
                                                onClick={() => removeArrayItem('features', idx)}
                                                className="size-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-red-500 hover:shadow-md transition-all"
                                            >
                                                <Plus size={14} className="rotate-45" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default IntelManager;
