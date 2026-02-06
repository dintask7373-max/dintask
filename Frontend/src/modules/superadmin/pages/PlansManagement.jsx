import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Trash2,
    Edit2,
    Check,
    X,
    CreditCard,
    Zap,
    Users,
    ShieldCheck,
    Search,
    IndianRupee,
    Briefcase
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
import { toast } from 'sonner';
import useSuperAdminStore from '@/store/superAdminStore';
import { cn } from '@/shared/utils/cn';

const PlansManagement = () => {
    const { plans, fetchPlans, addPlan, deletePlan, updatePlan, loading } = useSuperAdminStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [planForm, setPlanForm] = useState({
        name: '',
        price: '',
        userLimit: '',
        isActive: true,
        features: [],
        duration: '30'
    });
    const [featureInput, setFeatureInput] = useState('');

    React.useEffect(() => {
        fetchPlans();
    }, []);

    const filteredPlans = (plans || []).filter(plan =>
        plan?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setEditingPlanId(null);
        setPlanForm({
            name: '',
            price: '',
            userLimit: '',
            isActive: true,
            features: [],
            duration: '30'
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (plan) => {
        setIsEditMode(true);
        setEditingPlanId(plan._id);
        setPlanForm({
            name: plan.name || '',
            price: plan.price?.toString() || '0',
            userLimit: plan.userLimit?.toString() || '1',
            isActive: plan.isActive !== undefined ? plan.isActive : true,
            features: Array.isArray(plan.features) ? [...plan.features] : [],
            duration: plan.duration?.toString() || '30'
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!planForm.name || planForm.price === '' || planForm.userLimit === '' || planForm.duration === '') {
            toast.error("Please fill in all required parameters");
            return;
        }

        const planData = {
            ...planForm,
            price: Number(planForm.price),
            userLimit: Number(planForm.userLimit),
            duration: Number(planForm.duration)
        };

        const success = isEditMode
            ? await updatePlan(editingPlanId, planData)
            : await addPlan(planData);

        if (success) {
            toast.success(`${planData.name} tier ${isEditMode ? 'recalibrated' : 'initialized'}`);
            setIsModalOpen(false);
        } else {
            toast.error("Operation failed");
        }
    };

    const addFeature = () => {
        if (!featureInput.trim()) return;
        setPlanForm(prev => ({
            ...prev,
            features: [...prev.features, featureInput.trim()]
        }));
        setFeatureInput('');
    };

    const removeFeature = (idx) => {
        setPlanForm(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== idx)
        }));
    };

    const handleDeletePlan = async (id, name) => {
        if (window.confirm(`Initiate deletion of ${name} tier?`)) {
            const success = await deletePlan(id);
            if (success) toast.success(`${name} tier decommissioned`);
        }
    };

    const togglePlanStatus = async (id, currentStatus) => {
        const success = await updatePlan(id, { isActive: !currentStatus });
        if (success) toast.success(`${!currentStatus ? 'Activated' : 'Deactivated'} tier sync`);
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                <div className="space-y-1">
                    <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight uppercase">
                        Protocol <span className="text-primary-600">Tiers</span> <CreditCard className="text-primary-600 animate-pulse" size={28} />
                    </h1>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] italic">
                        Platform subscription nodes management
                    </p>
                </div>
                <Button
                    onClick={handleOpenAddModal}
                    className="bg-primary-600 hover:bg-primary-700 h-11 px-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-500/20 text-white gap-2 transition-all transform hover:scale-105 active:scale-95"
                >
                    <Plus size={18} /> INITIALIZE NEW TIER
                </Button>
            </div>

            {/* Tactical Search Toolbar */}
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-5 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 shadow-xl flex flex-col md:flex-row gap-5 items-center">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <Input
                        placeholder="SEARCH NODES..."
                        className="h-12 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus-visible:ring-primary-500/30 font-bold uppercase text-xs tracking-widest"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Badge className="bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 px-5 py-2.5 rounded-2xl border-none h-auto font-black text-[10px] tracking-widest uppercase">
                        {plans.length} ACTIVE NODES
                    </Badge>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                <AnimatePresence>
                    {filteredPlans.map((plan, index) => (
                        <motion.div
                            key={plan._id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                        >
                            <Card className={cn(
                                "overflow-hidden border-2 transition-all duration-500 rounded-[3rem] group relative",
                                plan.isActive
                                    ? "border-slate-200/50 dark:border-slate-800/50 hover:border-primary-500/50 hover:shadow-2xl hover:shadow-primary-500/10"
                                    : "border-slate-100 dark:border-slate-900 opacity-60 grayscale scale-95"
                            )}>
                                <CardHeader className="p-8 pb-4">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800 text-primary-600 shadow-xl shadow-slate-200/50 dark:shadow-none group-hover:scale-110 transition-transform duration-500">
                                            {plan.name === 'Enterprise' ? <ShieldCheck size={28} /> : (plan.userLimit || 0) > 10 ? <Zap size={28} /> : <Briefcase size={28} />}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => { e.stopPropagation(); handleOpenEditModal(plan); }}
                                                className="w-10 h-10 rounded-2xl text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:scale-110 transition-all"
                                                title="Edit Node"
                                            >
                                                <Edit2 size={18} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => { e.stopPropagation(); togglePlanStatus(plan._id, plan.isActive); }}
                                                className={cn(
                                                    "w-10 h-10 rounded-2xl transition-all hover:scale-110",
                                                    plan.isActive ? "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" : "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                                )}
                                            >
                                                {plan.isActive ? <Check size={18} /> : <X size={18} />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan._id, plan.name); }}
                                                className="w-10 h-10 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-110 transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{plan.name}</CardTitle>
                                    <CardDescription className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-1 italic opacity-70">Pricing Vector</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 pt-2 space-y-8">
                                    <div className="flex items-center gap-2">
                                        <IndianRupee size={24} className="text-primary-600 font-black" />
                                        <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                                            {(plan.price || 0).toLocaleString('en-IN')}
                                        </span>
                                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest self-end pb-2 opacity-60">/ {plan.duration || 30} DAYS</span>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                            <Users size={18} className="text-primary-500" />
                                            CAPACITY: {plan.userLimit || 0} NODES
                                        </div>
                                        <div className="space-y-3 pl-2">
                                            {plan.features?.slice(0, 4).map((feature, i) => (
                                                <div key={i} className="flex items-center gap-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    <div className="size-1.5 rounded-full bg-emerald-500" />
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={() => handleOpenEditModal(plan)}
                                        className="w-full h-12 rounded-2xl border-2 border-slate-200 dark:border-slate-800 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all duration-300"
                                    >
                                        CALIBRATE DETAILS
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {filteredPlans.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <div className="inline-flex items-center justify-center size-20 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-6">
                            <Search size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Tiers Found</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2 italic">Search criteria returned 0 protocol nodes</p>
                    </div>
                )}
            </div>

            {/* Protocol Modal (Add/Edit) */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] flex flex-col z-[501]"
                        >
                            <div className="p-8 sm:p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-3">
                                        <div className="size-3 rounded-full bg-primary-600 animate-pulse" />
                                        {isEditMode ? 'NODE CALIBRATION' : 'INITIALIZE NODE'}
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure tier parameters and limits</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full size-10 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <X size={20} />
                                </Button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-6 sm:space-y-8 overflow-y-auto custom-scrollbar">
                                <div className="space-y-3">
                                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">TIER IDENTIFIER</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. STARTER, PRO, ENTERPRISE"
                                        className="h-14 rounded-2xl bg-white dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 font-black uppercase text-xs tracking-widest px-6"
                                        value={planForm.name}
                                        onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">PLAN VALUE (₹)</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            placeholder="2999"
                                            className="h-14 rounded-2xl bg-white dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 font-black text-xs tracking-widest px-6"
                                            value={planForm.price}
                                            onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="duration" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">VALIDITY (DAYS)</Label>
                                        <Input
                                            id="duration"
                                            type="number"
                                            placeholder="30"
                                            className="h-14 rounded-2xl bg-white dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 font-black text-xs tracking-widest px-6"
                                            value={planForm.duration}
                                            onChange={(e) => setPlanForm({ ...planForm, duration: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="userLimit" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">NODE CAPACITY</Label>
                                        <Input
                                            id="userLimit"
                                            type="number"
                                            placeholder="5"
                                            className="h-14 rounded-2xl bg-white dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 font-black text-xs tracking-widest px-6"
                                            value={planForm.userLimit}
                                            onChange={(e) => setPlanForm({ ...planForm, userLimit: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">DEPLOYMENT STATE</Label>
                                    <div className="flex items-center gap-4 h-14 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex-1">Is Active</span>
                                        <Switch
                                            checked={planForm.isActive}
                                            onCheckedChange={(checked) => setPlanForm({ ...planForm, isActive: checked })}
                                            className="data-[state=checked]:bg-emerald-600"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">NODAL FEATURES</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="e.g. 24/7 PRIORITY SUPPORT"
                                            className="h-14 rounded-2xl bg-white dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 font-bold text-xs px-6 flex-1"
                                            value={featureInput}
                                            onChange={(e) => setFeatureInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                        />
                                        <Button
                                            type="button"
                                            onClick={addFeature}
                                            className="h-14 w-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-200 dark:shadow-none hover:scale-105 transition-all"
                                        >
                                            <Plus size={24} />
                                        </Button>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {planForm.features.map((feature, idx) => (
                                            <Badge key={idx} className="bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 py-2 px-4 rounded-xl gap-3 text-[9px] font-black uppercase tracking-widest border-none">
                                                {feature}
                                                <X size={14} className="cursor-pointer hover:text-red-500 transition-colors" onClick={() => removeFeature(idx)} />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8 flex flex-col sm:flex-row gap-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        CANCEL
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-14 rounded-2xl bg-primary-600 hover:bg-primary-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/30 text-white transform hover:scale-105 active:scale-95 transition-all"
                                    >
                                        {isEditMode ? 'SYNCHRONIZE TIER' : 'INITIALIZE TIER'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PlansManagement;
