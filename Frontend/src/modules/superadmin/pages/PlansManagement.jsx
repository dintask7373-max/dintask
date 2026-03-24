import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Edit2, Trash2, X, Check, Clock, Users, IndianRupee, Layout, Shield, Zap, Info } from 'lucide-react';
import useSuperAdminStore from '@/store/superAdminStore';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';

const PlansManagement = () => {
    const { plans, loading, fetchPlans, addPlan, updatePlan, deletePlan } = useSuperAdminStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [featureInput, setFeatureInput] = useState('');

    const [planForm, setPlanForm] = useState({
        name: '',
        price: '',
        userLimit: '',
        isActive: true,
        features: [],
        duration: '30'
    });

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const handleOpenModal = (plan = null) => {
        if (plan) {
            setIsEditMode(true);
            setSelectedPlanId(plan._id);
            setPlanForm({
                name: plan.name || '',
                price: plan.price?.toString() || '0',
                userLimit: plan.userLimit?.toString() || '1',
                isActive: plan.isActive !== undefined ? plan.isActive : true,
                features: Array.isArray(plan.features) ? [...plan.features] : [],
                duration: plan.duration?.toString() || '30'
            });
        } else {
            setIsEditMode(false);
            setPlanForm({
                name: '',
                price: '',
                userLimit: '',
                isActive: true,
                features: [],
                duration: '30'
            });
        }
        setIsModalOpen(true);
    };

    const addFeature = () => {
        if (featureInput.trim()) {
            setPlanForm({
                ...planForm,
                features: [...planForm.features, featureInput.trim().toUpperCase()]
            });
            setFeatureInput('');
        }
    };

    const removeFeature = (index) => {
        setPlanForm({
            ...planForm,
            features: planForm.features.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { name, price, userLimit, duration } = planForm;

        if (!name.trim()) {
            toast.error("Plan Name is required");
            return;
        }

        if (price === '' || userLimit === '' || !duration) {
            toast.error('Identity Conflict: Missing critical module parameters');
            return;
        }

        if (Number(price) < 0) {
            toast.error("Value cannot be negative");
            return;
        }

        if (Number(userLimit) < 1) {
            toast.error("Member limit must be at least 1");
            return;
        }

        if (Number(duration) < 1) {
            toast.error("Validity must be at least 1 day");
            return;
        }

        const planData = {
            ...planForm,
            price: Number(planForm.price),
            userLimit: Number(planForm.userLimit),
            duration: Number(planForm.duration)
        };

        let success;
        if (isEditMode) {
            success = await updatePlan(selectedPlanId, planData);
            if (success) toast.success("TIER SYNCHRONIZED: Protocol parameters updated");
        } else {
            success = await addPlan(planData);
            if (success) toast.success("TIER INITIALIZED: New protocol node deployed");
        }

        if (success) setIsModalOpen(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("CRITICAL ACTION: Are you sure you want to terminate this protocol node?")) {
            const success = await deletePlan(id);
            if (success) toast.success("NODE TERMINATED: Tier removed from system");
        }
    };

    const filteredPlans = plans.filter(plan =>
        plan.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-8 space-y-8 bg-white dark:bg-slate-950 min-h-screen font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                        Node <span className="text-primary-600">Calibration</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] pl-1 opacity-70">Infrastructure Tier Framework Management</p>
                </div>
                <Button 
                    onClick={() => handleOpenModal()} 
                    className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl shadow-slate-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest gap-3"
                >
                    <Plus size={20} />
                    Deploy New Node
                </Button>
            </div>

            {/* Utility Bar */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <Input
                        placeholder="SEARCH PROTOCOL NODES..."
                        className="h-14 pl-14 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm focus:ring-2 focus:ring-primary-500/20 font-bold text-xs uppercase tracking-widest"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="ghost" className="h-14 px-6 rounded-2xl gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white dark:hover:bg-slate-800">
                    <Filter size={18} />
                    Calibrate Filters
                </Button>
            </div>

            {/* Plans Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredPlans.map((plan) => (
                    <motion.div
                        layout
                        key={plan._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group"
                    >
                        <Card className="relative h-full border-none shadow-xl shadow-slate-100 dark:shadow-none bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden group-hover:shadow-2xl group-hover:shadow-primary-500/10 transition-all duration-500">
                            <div className="absolute top-0 left-0 w-2 h-full bg-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <CardContent className="p-10 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <Badge className={`${plan.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full`}>
                                            {plan.isActive ? 'NODE ONLINE' : 'NODE OFFLINE'}
                                        </Badge>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-4">{plan.name}</h3>
                                        <p className="text-[10px] text-slate-400 font-medium">Valid for {plan.duration} Days • {plan.userLimit} Member Limit</p>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(plan)} className="size-10 rounded-xl hover:bg-primary-50 hover:text-primary-600">
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(plan._id)} className="size-10 rounded-xl hover:bg-red-50 hover:text-red-600">
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-50">Base Recurring Value</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">₹{plan.price}</span>
                                        <span className="text-xs font-bold text-slate-400 uppercase italic">/ {plan.duration}D</span>
                                    </div>
                                </div>

                                <div className="space-y-3 pl-2">
                                    {plan.features?.slice(0, 4).map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            <div className="size-1.5 rounded-full bg-primary-500 group-hover:scale-150 transition-transform" />
                                            {feature}
                                        </div>
                                    ))}
                                    {plan.features?.length > 4 && (
                                        <p className="text-[9px] font-black text-primary-500 uppercase tracking-widest mt-2 pl-4">+{plan.features.length - 4} Additional Sub-Modules</p>
                                    )}
                                </div>

                                <Button 
                                    onClick={() => handleOpenModal(plan)}
                                    className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all duration-300"
                                >
                                    Re-Calibrate Node
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}

                {!loading && filteredPlans.length === 0 && (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="size-20 rounded-[2rem] bg-slate-50 dark:bg-slate-900 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <Layout className="text-slate-300" size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No Protocol Modules Detected</h3>
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
                                        <Label htmlFor="userLimit" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">ALLOWED MEMBERS</Label>
                                        <Input
                                            id="userLimit"
                                            type="number"
                                            placeholder="50"
                                            className="h-14 rounded-2xl bg-white dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 font-black text-xs tracking-widest px-6"
                                            value={planForm.userLimit}
                                            onChange={(e) => setPlanForm({ ...planForm, userLimit: e.target.value })}
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
                                            <Badge key={idx} className="bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 py-2 px-4 rounded-xl gap-3 text-[9px] font-black uppercase tracking-widest border-none items-center flex">
                                                {feature}
                                                <button type="button" onClick={() => removeFeature(idx)} className="cursor-pointer hover:text-red-500 transition-colors focus:outline-none pointer-events-auto flex items-center justify-center">
                                                    <X size={14} />
                                                </button>
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
