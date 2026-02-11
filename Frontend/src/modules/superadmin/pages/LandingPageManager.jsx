import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Trash2, Plus, Save, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import { useNavigate } from 'react-router-dom';

const LandingPageManager = () => {
    const navigate = useNavigate();
    const [sections, setSections] = useState({
        hero: {
            heroBadge: '',
            heroTitle: '',
            heroSubtitle: '',
            heroCtaPrimary: '',
            heroCtaSecondary: ''
        },
        features: {
            modules: []
        },
        strategic_options: {
            options: []
        },
        tactical_preview: {
            tacticalTitle: '',
            tacticalSubtitle: '',
            showcaseImages: []
        }
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Fetch Initial Content
    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/v1/landing-page/content', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setSections(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching landing page content:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                navigate('/admin/login');
            } else {
                toast.error('Failed to load content');
            }
        } finally {
            setLoading(false);
        }
    };

    // Save All Changes
    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            // We update each section in parallel
            const updateRequests = Object.keys(sections).map(sectionKey => {
                // Skip mongo keys like _id, createdAt, updatedAt if they exist in state root
                if (['hero', 'features', 'strategic_options', 'tactical_preview'].includes(sectionKey)) {
                    return axios.put('http://localhost:5000/api/v1/landing-page/update', {
                        section: sectionKey,
                        data: sections[sectionKey]
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
                return Promise.resolve();
            });

            await Promise.all(updateRequests);
            toast.success('All changes saved successfully!');
            fetchContent(); // Refresh to ensure sync
        } catch (error) {
            console.error('Error saving changes:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                navigate('/admin/login');
            } else {
                toast.error('Failed to save changes');
            }
        } finally {
            setSaving(false);
        }
    };

    // Hero Section Handlers - Local State Only
    const handleHeroChange = (field, value) => {
        setSections(prev => ({
            ...prev,
            hero: { ...prev.hero, [field]: value }
        }));
    };

    // Features Section Handlers (Modules) - Local State Only
    const addModule = () => {
        const newModule = { title: 'New Module', description: 'Description', icon: 'Box', features: [] };
        setSections(prev => ({
            ...prev,
            features: {
                ...prev.features,
                modules: [...(prev.features?.modules || []), newModule]
            }
        }));
    };

    const removeModule = (index) => {
        setSections(prev => ({
            ...prev,
            features: {
                ...prev.features,
                modules: prev.features.modules.filter((_, i) => i !== index)
            }
        }));
    };

    const updateModule = (index, field, value) => {
        const updatedModules = [...sections.features.modules];
        updatedModules[index] = { ...updatedModules[index], [field]: value };
        setSections(prev => ({
            ...prev,
            features: { ...prev.features, modules: updatedModules }
        }));
    };

    // Strategic Options Handlers - Local State Only
    const addOption = () => {
        const newOption = { title: 'New Option', description: 'Description', icon: 'Target' };
        setSections(prev => ({
            ...prev,
            strategic_options: {
                ...prev.strategic_options,
                options: [...(prev.strategic_options?.options || []), newOption]
            }
        }));
    };

    const removeOption = (index) => {
        setSections(prev => ({
            ...prev,
            strategic_options: {
                ...prev.strategic_options,
                options: prev.strategic_options.options.filter((_, i) => i !== index)
            }
        }));
    };

    const updateOption = (index, field, value) => {
        const updatedOptions = [...sections.strategic_options.options];
        updatedOptions[index] = { ...updatedOptions[index], [field]: value };
        setSections(prev => ({
            ...prev,
            strategic_options: { ...prev.strategic_options, options: updatedOptions }
        }));
    };

    // Tactical Preview Handlers - Local State Only
    const handleTacticalChange = (field, value) => {
        setSections(prev => ({
            ...prev,
            tactical_preview: { ...prev.tactical_preview, [field]: value }
        }));
    };

    // Image Upload - Requires Immediate Upload to Cloudinary, then updates local state with URL
    const handleImageUpload = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/v1/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.data.success) {
                return res.data.imageUrl;
            }
        } catch (error) {
            console.error('Image upload failed:', error);
            toast.error('Image upload failed');
        }
        return null;
    };

    const addTacticalImage = async (file) => {
        if (!file) return;
        // Show loading state for upload if desirable, or toast
        const toastId = toast.loading('Uploading image...');
        const url = await handleImageUpload(file);
        if (url) {
            setSections(prev => ({
                ...prev,
                tactical_preview: {
                    ...prev.tactical_preview,
                    showcaseImages: [...(prev.tactical_preview?.showcaseImages || []), url]
                }
            }));
            toast.success('Image uploaded. Remember to Save Changes.', { id: toastId });
        } else {
            toast.dismiss(toastId);
        }
    };

    const removeTacticalImage = (index) => {
        setSections(prev => ({
            ...prev,
            tactical_preview: {
                ...prev.tactical_preview,
                showcaseImages: prev.tactical_preview.showcaseImages.filter((_, i) => i !== index)
            }
        }));
    };


    if (loading) return <div className="p-8 text-center">Loading content...</div>;

    return (
        <div className="space-y-8 pb-20 relative">
            <div className="flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10 py-4 border-b border-slate-200 -mx-6 px-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Landing Page Manager</h1>
                    <p className="text-sm text-slate-500">Edit content for the public landing page</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-primary-600 hover:bg-primary-700 text-white min-w-[140px]">
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                        </>
                    )}
                </Button>
            </div>

            {/* --- HERO SECTION --- */}
            <Card>
                <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Hero Section</h2>
                    <div className="grid gap-4">
                        <div>
                            <Label>Hero Badge (Top Pill)</Label>
                            <Input
                                value={sections.hero?.heroBadge || ''}
                                onChange={(e) => handleHeroChange('heroBadge', e.target.value)}
                                placeholder="e.g. YOUR COMPLETE CRM PLATFORM"
                            />
                        </div>
                        <div>
                            <Label>Hero Title</Label>
                            <Textarea
                                value={sections.hero?.heroTitle || ''}
                                onChange={(e) => handleHeroChange('heroTitle', e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>
                        <div>
                            <Label>Hero Subtitle</Label>
                            <Textarea
                                value={sections.hero?.heroSubtitle || ''}
                                onChange={(e) => handleHeroChange('heroSubtitle', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Primary CTA Text</Label>
                                <Input
                                    value={sections.hero?.heroCtaPrimary || ''}
                                    onChange={(e) => handleHeroChange('heroCtaPrimary', e.target.value)}
                                    placeholder="Get Started"
                                />
                            </div>
                            <div>
                                <Label>Secondary CTA Text</Label>
                                <Input
                                    value={sections.hero?.heroCtaSecondary || ''}
                                    onChange={(e) => handleHeroChange('heroCtaSecondary', e.target.value)}
                                    placeholder="View Modules"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* --- FEATURES / MODULES SECTION --- */}
            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Features / Modules</h2>
                        <Button onClick={addModule} size="sm" variant="outline"><Plus size={16} className="mr-2" /> Add Module</Button>
                    </div>
                    <div className="grid gap-6">
                        {(sections.features?.modules || []).map((module, index) => (
                            <div key={index} className="border p-4 rounded-lg relative bg-slate-50">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
                                    onClick={() => removeModule(index)}
                                >
                                    <Trash2 size={16} />
                                </Button>
                                <div className="grid gap-3 pr-10">
                                    <Input
                                        placeholder="Title"
                                        value={module.title || ''}
                                        onChange={(e) => updateModule(index, 'title', e.target.value)}
                                        className="font-bold"
                                    />
                                    <Textarea
                                        placeholder="Description"
                                        value={module.description || ''}
                                        onChange={(e) => updateModule(index, 'description', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Icon Name (e.g., ShieldCheck, Users)"
                                        value={module.icon || ''}
                                        onChange={(e) => updateModule(index, 'icon', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* --- STRATEGIC OPTIONS SECTION --- */}
            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Strategic Options</h2>
                        <Button onClick={addOption} size="sm" variant="outline"><Plus size={16} className="mr-2" /> Add Option</Button>
                    </div>
                    <div className="grid gap-6">
                        {(sections.strategic_options?.options || []).map((option, index) => (
                            <div key={index} className="border p-4 rounded-lg relative bg-slate-50">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
                                    onClick={() => removeOption(index)}
                                >
                                    <Trash2 size={16} />
                                </Button>
                                <div className="grid gap-3 pr-10">
                                    <Input
                                        placeholder="Title"
                                        value={option.title || ''}
                                        onChange={(e) => updateOption(index, 'title', e.target.value)}
                                        className="font-bold"
                                    />
                                    <Textarea
                                        placeholder="Description"
                                        value={option.description || ''}
                                        onChange={(e) => updateOption(index, 'description', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Icon Name"
                                        value={option.icon || ''}
                                        onChange={(e) => updateOption(index, 'icon', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>


            {/* --- TACTICAL PREVIEW SECTION --- */}
            <Card>
                <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Tactical Preview</h2>
                    <div className="grid gap-4 mb-6">
                        <div>
                            <Label>Section Title</Label>
                            <Input
                                value={sections.tactical_preview?.tacticalTitle || ''}
                                onChange={(e) => handleTacticalChange('tacticalTitle', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Badge Text (Subtitle)</Label>
                            <Input
                                value={sections.tactical_preview?.tacticalSubtitle || ''}
                                onChange={(e) => handleTacticalChange('tacticalSubtitle', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium text-slate-700">Showcase Images</h3>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    onChange={(e) => addTacticalImage(e.target.files[0])}
                                />
                                <Button size="sm" variant="outline">
                                    <Plus size={16} className="mr-2" /> Add Image
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {(sections.tactical_preview?.showcaseImages || []).map((img, index) => (
                                <div key={index} className="relative group rounded-lg overflow-hidden border bg-slate-100 aspect-video">
                                    <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => removeTacticalImage(index)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};

export default LandingPageManager;
