import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/shared/utils/animations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { toast } from 'sonner';
import { FileEdit, LayoutTemplate, Save, Loader2, Star, Layers, ArrowRight, ArrowLeft, HelpCircle, ChevronDown, Monitor, CheckCircle2, CreditCard, Shield, Trash2, Plus, FileText, Cookie } from 'lucide-react';
import useSuperAdminStore from '@/store/superAdminStore';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils/cn';
import TestimonialsManager from './TestimonialsManager';

const LandingPageManager = () => {
    const {
        landingPageContent,
        fetchLandingPageContent,
        updateLandingPageContent,
        platformContent,
        fetchPlatformContent,
        updatePlatformContent,
        faqsContent,
        fetchFaqsContent,
        updateFaqsContent,
        tacticalContent,
        fetchTacticalContent,
        updateTacticalContent,
        footerCtaContent,
        fetchFooterCtaContent,
        updateFooterCtaContent,
        pricingPlans,
        fetchPricingPlans,
        updatePricingPlan,
        tacticalModules,
        fetchTacticalModules,
        updateTacticalModule,
        privacyContent,
        fetchPrivacyContent,
        updatePrivacyPolicy,
        termsContent,
        fetchTermsContent,
        updateTermsService,
        cookieContent,
        fetchCookieContent,
        updateCookiePolicy
    } = useSuperAdminStore();

    const [activeSection, setActiveSection] = useState('hero');
    const [loading, setLoading] = useState(false);

    // Hero Form State
    const [heroForm, setHeroForm] = useState({
        badge: '',
        title: '',
        subtitle: '',
        ctaPrimary: '',
        ctaSecondary: ''
    });

    // Platform Form State
    const [platformForm, setPlatformForm] = useState({
        badge: '',
        title: '',
        subtitle: '',
        description: '',
        ctaText: '',
        quote: '',
        authorName: '',
        authorRole: '',
        authorImage: ''
    });

    // FAQs Form State
    const [faqsForm, setFaqsForm] = useState([
        { question: '', answer: '' },
        { question: '', answer: '' },
        { question: '', answer: '' }
    ]);

    // Pricing Form State
    const [pricingForm, setPricingForm] = useState([]);

    // Tactical Form State
    const [tacticalForm, setTacticalForm] = useState({
        title: '',
        subtitle: '',
        images: ['', '', ''],
        previewUrls: ['', '', '']
    });

    // Footer CTA Form State
    const [footerCtaForm, setFooterCtaForm] = useState({
        title: '',
        description: '',
        ctaPrimary: '',
        ctaSecondary: '',
        images: ['', '', '', ''],
        previewUrls: ['', '', '', '']
    });

    // Legal Policies Form State
    const [privacyForm, setPrivacyForm] = useState([]);
    const [termsForm, setTermsForm] = useState([]);
    const [cookiesForm, setCookiesForm] = useState([]);

    // Module Edit State
    const [editingModule, setEditingModule] = useState(null); // moduleId
    const [moduleForm, setModuleForm] = useState({
        title: '',
        description: '',
        targetAudience: '',
        themeColor: 'blue',
        icon: '',
        detailedFeatures: '', // string (comma or newline separated for edit)
        tags: '', // string
        image: '',
        previewUrl: ''
    });

    useEffect(() => {
        fetchLandingPageContent();
        fetchPlatformContent();
        fetchFaqsContent();
        fetchTacticalContent();
        fetchTacticalModules(); // Fetch modules
        fetchFooterCtaContent();
        fetchPricingPlans();
        fetchPrivacyContent();
        fetchTermsContent();
        fetchCookieContent();
    }, []);

    useEffect(() => {
        if (pricingPlans) {
            setPricingForm(pricingPlans);
        }
    }, [pricingPlans]);

    useEffect(() => {
        if (landingPageContent) {
            setHeroForm({
                badge: landingPageContent.badge || '',
                title: landingPageContent.title || '',
                subtitle: landingPageContent.subtitle || '',
                ctaPrimary: landingPageContent.ctaPrimary || '',
                ctaSecondary: landingPageContent.ctaSecondary || ''
            });
        }
    }, [landingPageContent]);

    useEffect(() => {
        if (platformContent) {
            setPlatformForm({
                badge: platformContent.badge || '',
                title: platformContent.title || '',
                subtitle: platformContent.subtitle || '',
                description: platformContent.description || '',
                ctaText: platformContent.ctaText || '',
                quote: platformContent.quote || '',
                authorName: platformContent.authorName || '',
                authorRole: platformContent.authorRole || '',
                authorImage: platformContent.authorImage || ''
            });
        }
    }, [platformContent]);

    useEffect(() => {
        if (faqsContent && faqsContent.length > 0) {
            const loaded = [...faqsContent];
            while (loaded.length < 3) {
                loaded.push({ question: '', answer: '' });
            }
            setFaqsForm(loaded.slice(0, 3));
        }
    }, [faqsContent]);

    useEffect(() => {
        if (tacticalContent) {
            setTacticalForm(prev => ({
                ...prev,
                title: tacticalContent.title || '',
                subtitle: tacticalContent.subtitle || '',
                images: tacticalContent.images && tacticalContent.images.length >= 3 ? tacticalContent.images.slice(0, 3) : ['', '', ''],
                previewUrls: tacticalContent.images && tacticalContent.images.length >= 3 ? tacticalContent.images.slice(0, 3) : ['', '', '']
            }));
        }
    }, [tacticalContent]);

    useEffect(() => {
        if (footerCtaContent) {
            setFooterCtaForm(prev => ({
                ...prev,
                title: footerCtaContent.title || '',
                description: footerCtaContent.description || '',
                ctaPrimary: footerCtaContent.ctaPrimary || '',
                ctaSecondary: footerCtaContent.ctaSecondary || '',
                images: footerCtaContent.images && footerCtaContent.images.length >= 4 ? footerCtaContent.images.slice(0, 4) : ['', '', '', ''],
                previewUrls: footerCtaContent.images && footerCtaContent.images.length >= 4 ? footerCtaContent.images.slice(0, 4) : ['', '', '', '']
            }));
        }
    }, [footerCtaContent]);

    useEffect(() => {
        if (privacyContent) setPrivacyForm(privacyContent.policySections || []);
    }, [privacyContent]);

    useEffect(() => {
        if (termsContent) setTermsForm(termsContent.policySections || []);
    }, [termsContent]);

    useEffect(() => {
        if (cookieContent) setCookiesForm(cookieContent.policySections || []);
    }, [cookieContent]);

    const handleHeroChange = (e) => {
        const { name, value } = e.target;
        setHeroForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePlatformChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'authorImage' && files && files[0]) {
            setPlatformForm(prev => ({ ...prev, authorImage: files[0] }));
        } else {
            setPlatformForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFaqChange = (index, field, value) => {
        const newFaqs = [...faqsForm];
        newFaqs[index] = { ...newFaqs[index], [field]: value };
        setFaqsForm(newFaqs);
    };

    const handleTacticalChange = (e) => {
        const { name, value } = e.target;
        setTacticalForm(prev => ({ ...prev, [name]: value }));
    };

    const handleTacticalImageChange = (index, file) => {
        if (file) {
            const newImages = [...tacticalForm.images];
            newImages[index] = file;

            const newPreviewUrls = [...tacticalForm.previewUrls];
            newPreviewUrls[index] = URL.createObjectURL(file);

            setTacticalForm(prev => ({
                ...prev,
                images: newImages,
                previewUrls: newPreviewUrls
            }));
        }
    };

    const handleFooterCtaChange = (e) => {
        const { name, value } = e.target;
        setFooterCtaForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFooterCtaImageChange = (index, file) => {
        if (file) {
            const newImages = [...footerCtaForm.images];
            newImages[index] = file;

            const newPreviewUrls = [...footerCtaForm.previewUrls];
            newPreviewUrls[index] = URL.createObjectURL(file);

            setFooterCtaForm(prev => ({
                ...prev,
                images: newImages,
                previewUrls: newPreviewUrls
            }));
        }
    };

    const handlePricingChange = (index, field, value) => {
        const newPricing = [...pricingForm];
        newPricing[index] = { ...newPricing[index], [field]: value };
        setPricingForm(newPricing);
    };

    const handleFeatureChange = (planIndex, featureIndex, value) => {
        const newPricing = [...pricingForm];
        const newFeatures = [...newPricing[planIndex].features];
        newFeatures[featureIndex] = value;
        newPricing[planIndex].features = newFeatures;
        setPricingForm(newPricing);
    };

    const handlePricingSubmit = async (index) => {
        setLoading(true);
        try {
            const plan = pricingForm[index];
            const success = await updatePricingPlan(plan._id, plan);
            if (success) toast.success(`${plan.name} plan updated!`);
            else toast.error('Failed to update plan.');
        } catch (error) {
            console.error(error);
            toast.error('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleHeroSubmit = async () => {
        setLoading(true);
        try {
            const success = await updateLandingPageContent(heroForm);
            if (success) toast.success('Hero section updated!');
            else toast.error('Failed to update.');
        } catch (error) {
            toast.error('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handlePlatformSubmit = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            Object.keys(platformForm).forEach(key => {
                if (key === 'authorImage') {
                    if (platformForm[key] instanceof File) {
                        formData.append('authorImage', platformForm[key]);
                    }
                    else if (typeof platformForm[key] === 'string') {
                        formData.append('authorImage', platformForm[key]);
                    }
                } else {
                    formData.append(key, platformForm[key]);
                }
            });

            const success = await updatePlatformContent(formData);
            if (success) toast.success('Platform section updated!');
            else toast.error('Failed to update.');
        } catch (error) {
            console.error(error);
            toast.error('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleFaqsSubmit = async () => {
        setLoading(true);
        try {
            const success = await updateFaqsContent(faqsForm);
            if (success) toast.success('FAQs updated!');
            else toast.error('Failed to update.');
        } catch (error) {
            toast.error('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleTacticalSubmit = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', tacticalForm.title);
            formData.append('subtitle', tacticalForm.subtitle);

            tacticalForm.images.forEach((img, index) => {
                if (img instanceof File) {
                    formData.append(`image_${index}`, img);
                }
            });

            const success = await updateTacticalContent(formData);
            if (success) toast.success('Tactical section updated!');
            else toast.error('Failed to update.');
        } catch (error) {
            console.error(error);
            toast.error('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleModuleEdit = (module) => {
        setEditingModule(module.moduleId);
        setModuleForm({
            title: module.title,
            description: module.description,
            targetAudience: module.targetAudience,
            themeColor: module.themeColor,
            icon: module.icon,
            detailedFeatures: module.detailedFeatures.join('\n'), // Use newline for textarea
            tags: module.tags.join(', '),
            image: '', // Reset file input
            previewUrl: module.image
        });
    };

    const handleModuleFormChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image' && files && files[0]) {
            setModuleForm(prev => ({ ...prev, image: files[0], previewUrl: URL.createObjectURL(files[0]) }));
        } else {
            setModuleForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleModuleSubmit = async () => {
        if (!editingModule) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', moduleForm.title);
            formData.append('description', moduleForm.description);
            formData.append('targetAudience', moduleForm.targetAudience);
            formData.append('themeColor', moduleForm.themeColor);
            formData.append('icon', moduleForm.icon);

            // Convert newline-separated to JSON array
            const featuresArray = moduleForm.detailedFeatures.split('\n').filter(s => s.trim());
            formData.append('detailedFeatures', JSON.stringify(featuresArray));

            // Convert comma-separated to JSON array
            const tagsArray = moduleForm.tags.split(',').map(s => s.trim()).filter(Boolean);
            formData.append('tags', JSON.stringify(tagsArray));

            if (moduleForm.image instanceof File) {
                formData.append('image', moduleForm.image);
            }

            const success = await updateTacticalModule(editingModule, formData);
            if (success) {
                toast.success('Module updated successfully!');
                setEditingModule(null); // Close editor
                fetchTacticalModules(); // Refresh list
            } else {
                toast.error('Failed to update module.');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleFooterCtaSubmit = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', footerCtaForm.title);
            formData.append('description', footerCtaForm.description);
            formData.append('ctaPrimary', footerCtaForm.ctaPrimary);
            formData.append('ctaSecondary', footerCtaForm.ctaSecondary);

            footerCtaForm.images.forEach((img, index) => {
                if (img instanceof File) {
                    formData.append(`image_${index}`, img);
                }
            });

            const success = await updateFooterCtaContent(formData);
            if (success) toast.success('Footer CTA section updated!');
            else toast.error('Failed to update.');
        } catch (error) {
            console.error(error);
            toast.error('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handlePolicyChange = (type, index, field, value) => {
        const setter = type === 'privacy' ? setPrivacyForm : type === 'terms' ? setTermsForm : setCookiesForm;
        setter(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const addPolicySection = (type) => {
        const setter = type === 'privacy' ? setPrivacyForm : type === 'terms' ? setTermsForm : setCookiesForm;
        setter(prev => [...prev, { title: '', content: '' }]);
    };

    const removePolicySection = (type, index) => {
        const setter = type === 'privacy' ? setPrivacyForm : type === 'terms' ? setTermsForm : setCookiesForm;
        setter(prev => prev.filter((_, i) => i !== index));
    };

    const handlePolicySubmit = async (type) => {
        setLoading(true);
        try {
            let success = false;
            if (type === 'privacy') success = await updatePrivacyPolicy(privacyForm);
            else if (type === 'terms') success = await updateTermsService(termsForm);
            else if (type === 'cookies') success = await updateCookiePolicy(cookiesForm);

            if (success) toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} Policy updated!`);
            else toast.error(`Failed to update ${type} policy.`);
        } catch (error) {
            toast.error('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-4 pb-8 max-w-7xl mx-auto px-4"
        >
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        Landing Page Manager <LayoutTemplate className="text-primary-600" size={24} />
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                        Manage public facing content
                    </p>
                </div>

                {/* Section Navigation */}
                <div className="grid grid-cols-2 md:flex flex-wrap bg-slate-100 dark:bg-slate-900 p-1 rounded-xl gap-1">
                    <button onClick={() => setActiveSection('hero')} className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all", activeSection === 'hero' ? "bg-white dark:bg-slate-800 text-primary-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}>Hero</button>
                    <button onClick={() => setActiveSection('platform')} className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all", activeSection === 'platform' ? "bg-white dark:bg-slate-800 text-primary-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}>DinTask One</button>
                    <button onClick={() => setActiveSection('tactical')} className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all", activeSection === 'tactical' ? "bg-white dark:bg-slate-800 text-primary-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}>Tactical</button>
                    <button onClick={() => setActiveSection('faqs')} className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all", activeSection === 'faqs' ? "bg-white dark:bg-slate-800 text-primary-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}>FAQs</button>
                    <button onClick={() => setActiveSection('pricing')} className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all", activeSection === 'pricing' ? "bg-white dark:bg-slate-800 text-primary-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}>Pricing</button>
                    <button onClick={() => setActiveSection('footerCta')} className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all", activeSection === 'footerCta' ? "bg-white dark:bg-slate-800 text-primary-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}>Command Center</button>
                    <button onClick={() => setActiveSection('testimonials')} className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all", activeSection === 'testimonials' ? "bg-white dark:bg-slate-800 text-primary-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}>Testimonials</button>
                    <button onClick={() => setActiveSection('policies')} className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all", activeSection === 'policies' ? "bg-white dark:bg-slate-800 text-primary-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}>Policies</button>
                </div>
            </motion.div>

            <AnimatePresence mode="wait">
                {activeSection === 'hero' ? (
                    <motion.div key="hero" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Hero Editor */}
                        <Card className="border-2 border-slate-100 shadow-lg bg-white dark:bg-slate-900 rounded-3xl h-fit">
                            <CardHeader className="border-b border-slate-50 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                                        <Star className="text-yellow-500" size={20} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-black uppercase tracking-tight">Hero Editor</CardTitle>
                                        <CardDescription className="text-xs font-bold">Main entry point</CardDescription>
                                    </div>
                                </div>
                                <Button onClick={handleHeroSubmit} disabled={loading} size="sm" className="w-full sm:w-auto font-bold uppercase">
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    <span className="ml-2">Save</span>
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Badge Text</Label>
                                        <Input name="badge" value={heroForm.badge} onChange={handleHeroChange} className="font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Headline</Label>
                                        <Textarea name="title" value={heroForm.title} onChange={handleHeroChange} className="font-black text-lg h-24 resize-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Subtitle</Label>
                                        <Textarea name="subtitle" value={heroForm.subtitle} onChange={handleHeroChange} className="min-h-[100px]" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Primary CTA</Label>
                                            <Input name="ctaPrimary" value={heroForm.ctaPrimary} onChange={handleHeroChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Secondary CTA</Label>
                                            <Input name="ctaSecondary" value={heroForm.ctaSecondary} onChange={handleHeroChange} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hero Preview */}
                        <div className="rounded-3xl overflow-hidden border-2 border-slate-100 shadow-xl bg-gradient-to-br from-[#FFEE8C] to-white p-8 text-center space-y-6 flex flex-col justify-center min-h-[400px]">
                            <span className="inline-block px-3 py-1 rounded-full bg-yellow-200/50 text-[10px] font-black uppercase tracking-widest text-slate-800 mx-auto border border-yellow-400/20">
                                {heroForm.badge || 'BADGE TEXT'}
                            </span>
                            <h1 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                                {heroForm.title || 'Your Headline Here'}
                            </h1>
                            <p className="text-base text-slate-600 font-medium leading-relaxed max-w-lg mx-auto">
                                {heroForm.subtitle || 'Your subtitle description goes here.'}
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                                <div className="px-6 py-3 bg-slate-900 text-white rounded-lg font-bold uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20">
                                    {heroForm.ctaPrimary || 'Button 1'}
                                </div>
                                <div className="px-6 py-3 bg-transparent text-slate-900 rounded-full font-bold uppercase tracking-widest text-xs border-2 border-slate-900">
                                    {heroForm.ctaSecondary || 'Button 2'}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : activeSection === 'platform' ? (
                    <motion.div key="platform" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Platform Editor */}
                        <Card className="border-2 border-slate-100 shadow-xl bg-white dark:bg-slate-900 rounded-[2rem] h-fit">
                            <CardHeader className="border-b border-slate-50 dark:border-slate-800 px-4 py-4 md:px-8 md:py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                                        <Layers className="text-indigo-500" size={20} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-black uppercase tracking-tight">One Platform Editor</CardTitle>
                                        <CardDescription className="text-xs font-bold">Customize the showcase section</CardDescription>
                                    </div>
                                </div>
                                <Button onClick={handlePlatformSubmit} disabled={loading} size="sm" className="w-full sm:w-auto font-bold uppercase">
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    <span className="ml-2">Save</span>
                                </Button>
                            </CardHeader>
                            <CardContent className="p-4 md:p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Badge Text</Label>
                                            <Input name="badge" value={platformForm.badge} onChange={handlePlatformChange} className="font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Button Text</Label>
                                            <Input name="ctaText" value={platformForm.ctaText} onChange={handlePlatformChange} className="font-bold" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Title</Label>
                                        <Input name="title" value={platformForm.title} onChange={handlePlatformChange} className="font-black text-lg" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Subtitle</Label>
                                        <Input name="subtitle" value={platformForm.subtitle} onChange={handlePlatformChange} className="font-bold uppercase" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Description</Label>
                                        <Textarea name="description" value={platformForm.description} onChange={handlePlatformChange} />
                                    </div>

                                    <div className="relative border-t border-slate-100 my-6 pt-6">
                                        <span className="absolute -top-3 left-0 bg-white dark:bg-slate-900 px-2 text-xs font-black text-slate-400 uppercase tracking-widest">Testimonial</span>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Quote</Label>
                                                <Textarea name="quote" value={platformForm.quote} onChange={handlePlatformChange} className="italic" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Author Name</Label>
                                                    <Input name="authorName" value={platformForm.authorName} onChange={handlePlatformChange} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Role</Label>
                                                    <Input name="authorRole" value={platformForm.authorRole} onChange={handlePlatformChange} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Author Image URL</Label>
                                                <Input
                                                    type="file"
                                                    name="authorImage"
                                                    accept="image/*"
                                                    onChange={handlePlatformChange}
                                                    className="text-xs font-mono file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Platform Preview */}
                        <div className="rounded-3xl overflow-hidden border-2 border-slate-100 shadow-xl bg-gradient-to-b from-[#FFEE8C] to-white p-8 flex flex-col justify-center min-h-[400px]">
                            <div className="grid gap-6 md:gap-12">
                                {/* Left Side */}
                                <div className="text-left space-y-6">
                                    <Badge className="bg-black/10 text-black border-none px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
                                        {platformForm.badge || 'BADGE'}
                                    </Badge>
                                    <h2 className="text-3xl lg:text-4xl font-black leading-none tracking-tight text-slate-900">
                                        {platformForm.title || 'Title Here'}
                                    </h2>
                                    <p className="text-base font-black text-slate-800 uppercase tracking-tight">
                                        {platformForm.subtitle || 'Subtitle Here'}
                                    </p>
                                    <p className="text-sm text-slate-700 font-medium leading-relaxed max-w-sm">
                                        {platformForm.description || 'Description goes here.'}
                                    </p>
                                    <div className="h-10 w-fit px-6 bg-black text-white rounded-lg font-black text-xs shadow-xl flex items-center gap-2">
                                        {platformForm.ctaText || 'BUTTON'} <ArrowRight size={14} />
                                    </div>
                                </div>

                                {/* Right Side (Quote) */}
                                <div className="pl-4 md:pl-8 border-l border-slate-900/20 py-4">
                                    <span className="text-7xl font-serif text-slate-900 absolute opacity-10 -ml-12 -mt-8">“</span>
                                    <blockquote className="text-lg font-black text-slate-900 italic leading-tight mb-4 relative">
                                        "{platformForm.quote || 'Quote text here'}"
                                    </blockquote>
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-full bg-slate-900 overflow-hidden border-2 border-white shadow-lg shrink-0">
                                            <img src={platformForm.authorImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=Rishi"} alt="Author" className="h-full w-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-black text-slate-900">{platformForm.authorName || 'Name'}</h4>
                                            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-tighter">{platformForm.authorRole || 'Role'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : activeSection === 'tactical' ? (
                    <motion.div key="tactical" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                        {/* Tactical Section Headers */}
                        <Card className="border-2 border-slate-100 shadow-lg bg-white dark:bg-slate-900 rounded-3xl h-fit">
                            <CardHeader className="border-b border-slate-50 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                        <Monitor className="text-green-500" size={20} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-black uppercase tracking-tight">Tactical Interface</CardTitle>
                                        <CardDescription className="text-xs font-bold">Manage section headers</CardDescription>
                                    </div>
                                </div>
                                <Button onClick={handleTacticalSubmit} disabled={loading} size="sm" className="w-full sm:w-auto font-bold uppercase">
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    <span className="ml-2">Save Headers</span>
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Subtitle (Badge)</Label>
                                    <Input name="subtitle" value={tacticalForm.subtitle} onChange={handleTacticalChange} className="font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Headline</Label>
                                    <Input name="title" value={tacticalForm.title} onChange={handleTacticalChange} className="font-black text-lg" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Modules Management */}
                        {editingModule ? (
                            <Card className="border-2 border-slate-100 shadow-lg bg-white dark:bg-slate-900 rounded-3xl">
                                <CardHeader className="border-b border-slate-50 dark:border-slate-800 px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <Button onClick={() => setEditingModule(null)} variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                            <ArrowLeft size={16} />
                                        </Button>
                                        <CardTitle className="text-sm md:text-lg font-black uppercase tracking-tight truncate line-clamp-1">
                                            Edit: {moduleForm.title}
                                        </CardTitle>
                                    </div>
                                    <Button onClick={handleModuleSubmit} disabled={loading} size="sm" className="w-full sm:w-auto font-bold uppercase bg-primary-600 text-xs h-8">
                                        {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                        <span className="ml-2">Save Module</span>
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-4 md:p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Title</Label>
                                                <Input name="title" value={moduleForm.title} onChange={handleModuleFormChange} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Description</Label>
                                                <Textarea name="description" value={moduleForm.description} onChange={handleModuleFormChange} className="h-32" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Target Audience</Label>
                                                <Input name="targetAudience" value={moduleForm.targetAudience} onChange={handleModuleFormChange} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Theme Color</Label>
                                                <select
                                                    name="themeColor"
                                                    value={moduleForm.themeColor}
                                                    onChange={handleModuleFormChange}
                                                    className="w-full rounded-md border border-slate-200 p-2 text-sm bg-white dark:bg-slate-950 dark:border-slate-800"
                                                >
                                                    {['blue', 'purple', 'amber', 'emerald', 'yellow', 'orange', 'red', 'green', 'indigo', 'pink'].map(c => (
                                                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Lucide Icon Name</Label>
                                                <Input name="icon" value={moduleForm.icon} onChange={handleModuleFormChange} placeholder="e.g. ShieldCheck" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Module Image</Label>
                                                <div className="border border-slate-200 rounded-xl overflow-hidden aspect-video bg-slate-100 flex items-center justify-center relative group">
                                                    {moduleForm.previewUrl ? (
                                                        <img src={moduleForm.previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                                    ) : (
                                                        <div className="text-slate-400 text-xs font-bold uppercase">No Image</div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Label htmlFor="module-image-upload" className="cursor-pointer bg-white text-black px-4 py-2 rounded-full font-bold text-xs uppercase hover:bg-slate-100 transition-colors">
                                                            Change Image
                                                        </Label>
                                                        <Input
                                                            id="module-image-upload"
                                                            type="file"
                                                            name="image"
                                                            accept="image/*"
                                                            onChange={handleModuleFormChange}
                                                            className="hidden"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Detailed Features (One per line)</Label>
                                                <Textarea name="detailedFeatures" value={moduleForm.detailedFeatures} onChange={handleModuleFormChange} className="h-32" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Tags (Comma separated)</Label>
                                                <Input name="tags" value={moduleForm.tags} onChange={handleModuleFormChange} />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Modules</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {tacticalModules.map((mod) => (
                                        <Card key={mod.moduleId} className="border-2 border-slate-100 shadow-md hover:shadow-lg transition-all cursor-pointer group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden" onClick={() => handleModuleEdit(mod)}>
                                            <div className="h-28 bg-slate-100 relative overflow-hidden flex items-center justify-center p-4">
                                                <img src={mod.image} alt={mod.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                                                <div className={`absolute top-3 right-3 p-1.5 rounded-full bg-${mod.themeColor}-100 text-${mod.themeColor}-600`}>
                                                    {/* Icon placeholder or actual icon if I had dynamic component */}
                                                    <div className={`w-3 h-3 bg-${mod.themeColor}-500 rounded-full`} />
                                                </div>
                                            </div>
                                            <CardContent className="p-4">
                                                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{mod.title}</h4>
                                                <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{mod.description}</p>
                                                <Button size="sm" variant="secondary" className="w-full mt-3 font-bold uppercase text-[10px] h-7">Edit</Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : activeSection === 'faqs' ? (
                    <motion.div key="faqs" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* FAQs Editor */}
                        <Card className="border-2 border-slate-100 shadow-lg bg-white dark:bg-slate-900 rounded-3xl h-fit">
                            <CardHeader className="border-b border-slate-50 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                                        <HelpCircle className="text-teal-500" size={20} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-black uppercase tracking-tight">FAQs Editor</CardTitle>
                                        <CardDescription className="text-xs font-bold">Manage frequently asked questions</CardDescription>
                                    </div>
                                </div>
                                <Button onClick={handleFaqsSubmit} disabled={loading} size="sm" className="w-full sm:w-auto font-bold uppercase">
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    <span className="ml-2">Save</span>
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {faqsForm.map((faq, index) => (
                                    <div key={index} className="space-y-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Question {index + 1}</h4>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-slate-600">Question Text</Label>
                                            <Input value={faq.question} onChange={(e) => handleFaqChange(index, 'question', e.target.value)} placeholder="Enter question..." className="font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-slate-600">Answer Text</Label>
                                            <Textarea value={faq.answer} onChange={(e) => handleFaqChange(index, 'answer', e.target.value)} placeholder="Enter answer..." className="min-h-[100px]" />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* FAQs Preview */}
                        <div className="rounded-3xl overflow-hidden border-2 border-slate-100 shadow-xl bg-white p-8 min-h-[400px] flex flex-col items-center justify-center bg-gradient-to-b from-[#FFEE8C] via-[#FFF9C4] to-white">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                                    Frequently asked questions.
                                </h2>
                            </div>
                            <div className="w-full space-y-4 max-w-lg">
                                {faqsForm.map((faq, index) => (
                                    <div key={index} className="border-2 border-yellow-200 bg-white/60 backdrop-blur-sm rounded-xl overflow-hidden">
                                        <div className="w-full flex items-center p-4 text-left gap-4">
                                            <div className="flex-shrink-0 size-8 rounded-lg flex items-center justify-center font-bold text-sm bg-[#FFEE8C] text-slate-900">
                                                {index + 1}
                                            </div>
                                            <span className="flex-1 font-bold text-slate-900 text-sm">
                                                {faq.question || 'Question goes here?'}
                                            </span>
                                            <ChevronDown size={20} className="text-slate-400" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : activeSection === 'pricing' ? (
                    <motion.div key="pricing" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {pricingForm.map((plan, index) => (
                                <Card key={plan._id || index} className="border-2 border-slate-100 shadow-lg bg-white dark:bg-slate-900 rounded-3xl h-fit">
                                    <CardHeader className="border-b border-slate-50 dark:border-slate-800 px-5 py-3 flex flex-row items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <CreditCard className="text-blue-500" size={16} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xs font-black uppercase tracking-tight">{plan.name}</CardTitle>
                                            </div>
                                        </div>
                                        <Button onClick={() => handlePricingSubmit(index)} disabled={loading} size="sm" className="h-7 text-[10px] font-bold uppercase">
                                            {loading ? <Loader2 className="animate-spin" size={12} /> : <Save size={12} />}
                                            <span className="ml-1">Save</span>
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-3">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Badge</Label>
                                            <Input value={plan.badge} onChange={(e) => handlePricingChange(index, 'badge', e.target.value)} className="font-bold text-xs" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subtitle</Label>
                                            <Input value={plan.subtitle} onChange={(e) => handlePricingChange(index, 'subtitle', e.target.value)} className="h-20" as="textarea" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Monthly</Label>
                                                <Input type="number" value={plan.monthlyPrice} onChange={(e) => handlePricingChange(index, 'monthlyPrice', e.target.value)} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Annual/Mo</Label>
                                                <Input type="number" value={plan.annualPriceMonthly} onChange={(e) => handlePricingChange(index, 'annualPriceMonthly', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Save Text</Label>
                                                <Input value={plan.yearlySaveText} onChange={(e) => handlePricingChange(index, 'yearlySaveText', e.target.value)} className="text-xs text-green-600" />
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-2 border-t border-slate-100">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Features</Label>
                                            <div className="space-y-2">
                                                {plan.features.map((feature, fIndex) => (
                                                    <Input
                                                        key={fIndex}
                                                        value={feature}
                                                        onChange={(e) => handleFeatureChange(index, fIndex, e.target.value)}
                                                        className="h-8 text-xs"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                ) : activeSection === 'footerCta' ? (
                    <motion.div key="footerCta" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Footer CTA Editor */}
                        <Card className="border-2 border-slate-100 shadow-lg bg-white dark:bg-slate-900 rounded-3xl h-fit">
                            <CardHeader className="border-b border-slate-50 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                        <CheckCircle2 className="text-purple-500" size={20} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-black uppercase tracking-tight">Command Center Editor</CardTitle>
                                        <CardDescription className="text-xs font-bold">Manage final call to action</CardDescription>
                                    </div>
                                </div>
                                <Button onClick={handleFooterCtaSubmit} disabled={loading} size="sm" className="w-full sm:w-auto font-bold uppercase">
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    <span className="ml-2">Save</span>
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Headline</Label>
                                        <Input name="title" value={footerCtaForm.title} onChange={handleFooterCtaChange} className="font-black text-lg" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Description</Label>
                                        <Textarea name="description" value={footerCtaForm.description} onChange={handleFooterCtaChange} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Primary CTA</Label>
                                            <Input name="ctaPrimary" value={footerCtaForm.ctaPrimary} onChange={handleFooterCtaChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Secondary CTA</Label>
                                            <Input name="ctaSecondary" value={footerCtaForm.ctaSecondary} onChange={handleFooterCtaChange} />
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Floating Images (Max 4)</Label>
                                        {[0, 1, 2, 3].map((index) => (
                                            <div key={index} className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-600">Image {index + 1}</span>
                                                    {footerCtaForm.previewUrls[index] && (
                                                        <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Selected</span>
                                                    )}
                                                </div>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFooterCtaImageChange(index, e.target.files[0])}
                                                    className="text-xs"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Footer CTA Preview */}
                        <div className="rounded-3xl overflow-hidden border-2 border-slate-100 shadow-xl bg-slate-900 p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
                            <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
                                {footerCtaForm.title || 'Ready to experience?'}
                            </h2>
                            <p className="text-slate-400 mb-8 max-w-sm text-sm">
                                {footerCtaForm.description || 'Description goes here.'}
                            </p>
                            <div className="flex gap-2">
                                <div className="px-6 py-3 bg-yellow-400 text-slate-900 rounded-xl font-black text-xs">
                                    {footerCtaForm.ctaPrimary || 'CTA 1'}
                                </div>
                                <div className="px-6 py-3 bg-slate-800 text-white rounded-xl font-black text-xs">
                                    {footerCtaForm.ctaSecondary || 'CTA 2'}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-8 opacity-50">
                                {[0, 1, 2, 3].map(idx => (
                                    <div key={idx} className="w-24 h-16 rounded-lg bg-white/10 overflow-hidden border border-white/10">
                                        {footerCtaForm.previewUrls[idx] ? (
                                            <img src={footerCtaForm.previewUrls[idx]} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : activeSection === 'policies' ? (
                    <motion.div key="policies" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                        <div className="grid grid-cols-1 gap-8">
                            {/* Policy Section Map */}
                            {[
                                { id: 'privacy', title: 'Privacy Policy', form: privacyForm, icon: Shield, color: 'blue' },
                                { id: 'terms', title: 'Terms of Service', form: termsForm, icon: FileText, color: 'indigo' },
                                { id: 'cookies', title: 'Cookie Policy', form: cookiesForm, icon: Cookie, color: 'amber' }
                            ].map((policy) => (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Policy Editor */}
                                    <Card className="border-2 border-slate-100 shadow-lg bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                                        <CardHeader className="border-b border-slate-50 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                                <div className={`p-2 bg-${policy.color}-50 dark:bg-${policy.color}-900/20 rounded-xl`}>
                                                    <policy.icon className={`text-${policy.color}-500`} size={20} />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg font-black uppercase tracking-tight">{policy.title} Editor</CardTitle>
                                                    <CardDescription className="text-xs font-bold">Manage landing page legal sections</CardDescription>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <Button variant="outline" size="sm" onClick={() => addPolicySection(policy.id)} className="font-bold uppercase text-[10px]">
                                                    <Plus size={14} className="mr-1" /> Add
                                                </Button>
                                                <Button onClick={() => handlePolicySubmit(policy.id)} disabled={loading} size="sm" className="font-bold uppercase">
                                                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                                    <span className="ml-2 text-xs">Save</span>
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-6">
                                            {policy.form.length === 0 ? (
                                                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                                                    <p className="text-slate-400 font-bold text-sm uppercase">No sections added yet</p>
                                                    <Button variant="link" onClick={() => addPolicySection(policy.id)} className="text-primary-600 font-black uppercase text-xs">Initialize sections</Button>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {policy.form.map((section, sIndex) => (
                                                        <div key={sIndex} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 relative group">
                                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button variant="ghost" size="icon" onClick={() => removePolicySection(policy.id, sIndex)} className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full">
                                                                    <Trash2 size={16} />
                                                                </Button>
                                                            </div>
                                                            <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Section Title</Label>
                                                                    <Input
                                                                        value={section.title}
                                                                        onChange={(e) => handlePolicyChange(policy.id, sIndex, 'title', e.target.value)}
                                                                        placeholder="e.g. Information Collection"
                                                                        className="font-black"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Section Content</Label>
                                                                    <Textarea
                                                                        value={section.content}
                                                                        onChange={(e) => handlePolicyChange(policy.id, sIndex, 'content', e.target.value)}
                                                                        placeholder="Describe the policy details..."
                                                                        className="min-h-[100px] text-sm leading-relaxed"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Policy Preview (Mobiles/Small Screen Styled) */}
                                    <div className="rounded-[2.5rem] border-8 border-slate-900 shadow-2xl bg-white dark:bg-slate-950 overflow-hidden flex flex-col h-[750px] relative">
                                        {/* Phone Notch/Status Bar Style */}
                                        <div className="h-12 bg-slate-900 flex items-center justify-center">
                                            <div className="w-20 h-5 bg-black rounded-b-2xl" />
                                        </div>

                                        {/* Browser Header Mockup */}
                                        <div className="border-b border-slate-100 dark:border-slate-800 p-4 flex items-center gap-2 bg-slate-50 dark:bg-slate-900">
                                            <div className="flex gap-1">
                                                <div className="size-2 rounded-full bg-red-400" />
                                                <div className="size-2 rounded-full bg-yellow-400" />
                                                <div className="size-2 rounded-full bg-green-400" />
                                            </div>
                                            <div className="flex-1 bg-white dark:bg-slate-800 rounded-full px-3 py-1 text-[10px] text-slate-400 truncate font-medium flex items-center gap-2">
                                                <Shield size={10} /> dintask.com/legal/{policy.id}
                                            </div>
                                        </div>

                                        {/* Preview Content */}
                                        <div className="flex-1 overflow-y-auto p-6 scroll-smooth bg-gradient-to-b from-yellow-50/50 to-white dark:from-slate-900/50 dark:to-slate-950">
                                            <Badge className="bg-primary-100 text-primary-700 border-none mb-4 font-black text-[9px] uppercase tracking-widest">
                                                Tactical Document
                                            </Badge>
                                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
                                                {policy.title}
                                            </h2>

                                            <div className="space-y-8">
                                                {policy.form.length > 0 ? (
                                                    policy.form.map((section, idx) => (
                                                        <div key={idx} className="space-y-3">
                                                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide border-l-4 border-yellow-400 pl-3">
                                                                {section.title || "Section Title"}
                                                            </h3>
                                                            <p className="text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                                                {section.content || "Section content will appear here once you start typing..."}
                                                            </p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                                        <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                            <policy.icon className="text-slate-400" size={32} />
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Content to Display</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer Mockup */}
                                            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                                                <div className="size-8 rounded-lg bg-slate-900 mx-auto mb-2" />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© 2026 DINTASK TACTICAL</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="testimonials" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        <TestimonialsManager />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default LandingPageManager;
