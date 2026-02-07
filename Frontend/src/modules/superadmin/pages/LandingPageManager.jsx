import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Save,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    Image as ImageIcon,
    Type,
    Palette
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import axios from 'axios';
import useAuthStore from '@/store/authStore';

const LandingPageManager = () => {
    const [sections, setSections] = useState({});
    const [userTestimonials, setUserTestimonials] = useState([]); // New state for user testimonials
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('hero');
    const [message, setMessage] = useState({ type: '', text: '' });
    const { token } = useAuthStore();

    const sectionNames = [
        { id: 'hero', label: 'Hero Section', icon: '🚀' },
        { id: 'features', label: 'Features/Modules', icon: '⭐' },
        { id: 'strategic_options', label: 'Strategic Options', icon: '🎯' },
        { id: 'tactical_preview', label: 'Tactical Preview', icon: '📊' },
        { id: 'testimonial', label: 'Testimonial', icon: '💬' },
        { id: 'pricing', label: 'Pricing Plans', icon: '💰' },
        { id: 'demo_cta', label: 'Demo CTA', icon: '🎬' },
        { id: 'footer', label: 'Footer', icon: '📋' }
    ];

    useEffect(() => {
        fetchAllContent();
    }, []);

    const fetchAllContent = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/v1/landing-page');
            const contentMap = {};
            response.data.data.forEach(item => {
                contentMap[item.section] = item;
            });
            setSections(contentMap);
        } catch (error) {
            console.error('Error fetching content:', error);
            showMessage('error', 'Failed to fetch content');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSection = async (section) => {
        if (!token) {
            showMessage('error', 'You must be logged in to save changes');
            return;
        }

        setSaving(true);
        try {
            await axios.put(
                `http://localhost:5000/api/v1/landing-page/${section}`,
                sections[section],
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            showMessage('success', `${section} section updated successfully!`);
        } catch (error) {
            console.error('Error saving content:', error);
            showMessage('error', error.response?.data?.message || 'Failed to save content');
        } finally {
            setSaving(false);
        }
    };

    const initializeDefaultContent = async () => {
        if (!token) {
            showMessage('error', 'You must be logged in to initialize content');
            return;
        }

        setSaving(true);
        try {
            await axios.post(
                'http://localhost:5000/api/v1/landing-page/initialize',
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            showMessage('success', 'Default content initialized!');
            fetchAllContent();
        } catch (error) {
            console.error('Error initializing content:', error);
            showMessage('error', error.response?.data?.message || 'Failed to initialize content');
        } finally {
            setSaving(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const updateSectionData = (section, field, value) => {
        setSections(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const addArrayItem = (section, field, defaultValue) => {
        const current = sections[section]?.[field] || [];
        updateSectionData(section, field, [...current, defaultValue]);
    };

    const updateArrayItem = (section, field, index, value) => {
        const current = [...(sections[section]?.[field] || [])];
        current[index] = value;
        updateSectionData(section, field, current);
    };

    const removeArrayItem = (section, field, index) => {
        const current = [...(sections[section]?.[field] || [])];
        current.splice(index, 1);
        updateSectionData(section, field, current);
    };

    // --- User Testimonials Logic ---
    const fetchUserTestimonials = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/v1/testimonials', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setUserTestimonials(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching user testimonials:', error);
        }
    };

    useEffect(() => {
        if (token) fetchUserTestimonials();
    }, [token]);

    const handleToggleApproval = async (id, currentStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/v1/testimonials/${id}/status`,
                { isApproved: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchUserTestimonials();
            showMessage('success', `Testimonial ${!currentStatus ? 'approved' : 'rejected'}`);
        } catch (error) {
            console.error(error);
            showMessage('error', 'Update failed');
        }
    };

    const handleToggleHighlight = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/v1/testimonials/${id}/highlight`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchUserTestimonials();
            showMessage('success', 'Highlight updated');
        } catch (error) {
            console.error(error);
            showMessage('error', 'Update failed');
        }
    };

    const handleDeleteTestimonial = async (id) => {
        if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/v1/testimonials/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchUserTestimonials();
            showMessage('success', 'Testimonial deleted');
        } catch (error) {
            console.error(error);
            showMessage('error', 'Delete failed');
        }
    };

    const handleImageUpload = async (file) => {
        if (!file) return null;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post('http://localhost:5000/api/v1/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                return response.data.imageUrl;
            }
        } catch (error) {
            console.error('Image upload failed:', error);
            showMessage('error', 'Image upload failed');
            return null;
        }
    };

    const renderHeroSection = () => {
        const data = sections.hero || {};
        return (
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Hero Title</label>
                    <textarea
                        value={data.heroTitle || ''}
                        onChange={(e) => updateSectionData('hero', 'heroTitle', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows={3}
                        placeholder="Your work, Powered by our life's work."
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Hero Subtitle</label>
                    <textarea
                        value={data.heroSubtitle || ''}
                        onChange={(e) => updateSectionData('hero', 'heroSubtitle', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows={3}
                        placeholder="An all-in-one workspace..."
                    />
                </div>
            </div>
        );
    };

    const renderFeaturesSection = () => {
        const data = sections.features || {};
        const modules = data.modules || [];

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Modules</h3>
                    <Button
                        onClick={() => addArrayItem('features', 'modules', {
                            id: '',
                            title: '',
                            description: '',
                            icon: '',
                            color: '',
                            features: []
                        })}
                        size="sm"
                        className="bg-primary-600 hover:bg-primary-700"
                    >
                        <Plus size={16} className="mr-2" /> Add Module
                    </Button>
                </div>

                {modules.map((module, index) => (
                    <Card key={index} className="border-2 border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base">Module {index + 1}</CardTitle>
                            <Button
                                onClick={() => removeArrayItem('features', 'modules', index)}
                                size="sm"
                                variant="destructive"
                            >
                                <Trash2 size={16} />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">ID</label>
                                    <input
                                        type="text"
                                        value={module.id || ''}
                                        onChange={(e) => {
                                            const updated = { ...module, id: e.target.value };
                                            updateArrayItem('features', 'modules', index, updated);
                                        }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                        placeholder="admin"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={module.title || ''}
                                        onChange={(e) => {
                                            const updated = { ...module, title: e.target.value };
                                            updateArrayItem('features', 'modules', index, updated);
                                        }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                        placeholder="Admin Console"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={module.description || ''}
                                    onChange={(e) => {
                                        const updated = { ...module, description: e.target.value };
                                        updateArrayItem('features', 'modules', index, updated);
                                    }}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Features (comma-separated)</label>
                                <input
                                    type="text"
                                    value={(module.features || []).join(', ')}
                                    onChange={(e) => {
                                        const updated = { ...module, features: e.target.value.split(',').map(f => f.trim()) };
                                        updateArrayItem('features', 'modules', index, updated);
                                    }}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                    placeholder="Manager Oversight, Employee Directory, System Analytics"
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    const renderStrategicOptionsSection = () => {
        const data = sections.strategic_options || {};
        const options = data.strategicOptions || [];

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Strategic Options</h3>
                    <Button
                        onClick={() => addArrayItem('strategic_options', 'strategicOptions', {
                            id: '',
                            title: '',
                            description: '',
                            icon: '',
                            color: '',
                            bgColor: '',
                            borderColor: ''
                        })}
                        size="sm"
                        className="bg-primary-600 hover:bg-primary-700"
                    >
                        <Plus size={16} className="mr-2" /> Add Option
                    </Button>
                </div>

                {options.map((option, index) => (
                    <Card key={index} className="border-2 border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base">Option {index + 1}</CardTitle>
                            <Button
                                onClick={() => removeArrayItem('strategic_options', 'strategicOptions', index)}
                                size="sm"
                                variant="destructive"
                            >
                                <Trash2 size={16} />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">ID</label>
                                    <input
                                        type="text"
                                        value={option.id || ''}
                                        onChange={(e) => {
                                            const updated = { ...option, id: e.target.value };
                                            updateArrayItem('strategic_options', 'strategicOptions', index, updated);
                                        }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                        placeholder="01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={option.title || ''}
                                        onChange={(e) => {
                                            const updated = { ...option, title: e.target.value };
                                            updateArrayItem('strategic_options', 'strategicOptions', index, updated);
                                        }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                        placeholder="OPTIONS 01"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={option.description || ''}
                                    onChange={(e) => {
                                        const updated = { ...option, description: e.target.value };
                                        updateArrayItem('strategic_options', 'strategicOptions', index, updated);
                                    }}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    const renderPricingSection = () => {
        const data = sections.pricing || {};
        const plans = data.plans || [];

        return (
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Pricing Title</label>
                    <input
                        type="text"
                        value={data.pricingTitle || ''}
                        onChange={(e) => updateSectionData('pricing', 'pricingTitle', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                        placeholder="Flexible Plans & Pricing"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Pricing Description</label>
                    <textarea
                        value={data.pricingDescription || ''}
                        onChange={(e) => updateSectionData('pricing', 'pricingDescription', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                        rows={2}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Background Color</label>
                    <input
                        type="text"
                        value={data.pricingBgColor || ''}
                        onChange={(e) => updateSectionData('pricing', 'pricingBgColor', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                        placeholder="#6374f2"
                    />
                </div>

                <div className="flex justify-between items-center mt-8">
                    <h3 className="text-lg font-bold text-slate-900">Pricing Plans</h3>
                    <Button
                        onClick={() => addArrayItem('pricing', 'plans', {
                            name: '',
                            price: '',
                            duration: '',
                            description: '',
                            features: [],
                            cta: '',
                            variant: 'default',
                            popular: false
                        })}
                        size="sm"
                        className="bg-primary-600 hover:bg-primary-700"
                    >
                        <Plus size={16} className="mr-2" /> Add Plan
                    </Button>
                </div>

                {plans.map((plan, index) => (
                    <Card key={index} className="border-2 border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base">Plan: {plan.name || `Plan ${index + 1}`}</CardTitle>
                            <Button
                                onClick={() => removeArrayItem('pricing', 'plans', index)}
                                size="sm"
                                variant="destructive"
                            >
                                <Trash2 size={16} />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={plan.name || ''}
                                        onChange={(e) => {
                                            const updated = { ...plan, name: e.target.value };
                                            updateArrayItem('pricing', 'plans', index, updated);
                                        }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                        placeholder="Pro"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Price</label>
                                    <input
                                        type="text"
                                        value={plan.price || ''}
                                        onChange={(e) => {
                                            const updated = { ...plan, price: e.target.value };
                                            updateArrayItem('pricing', 'plans', index, updated);
                                        }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                        placeholder="$12"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Duration</label>
                                    <input
                                        type="text"
                                        value={plan.duration || ''}
                                        onChange={(e) => {
                                            const updated = { ...plan, duration: e.target.value };
                                            updateArrayItem('pricing', 'plans', index, updated);
                                        }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                        placeholder="member / month"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={plan.description || ''}
                                    onChange={(e) => {
                                        const updated = { ...plan, description: e.target.value };
                                        updateArrayItem('pricing', 'plans', index, updated);
                                    }}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Features (comma-separated)</label>
                                <input
                                    type="text"
                                    value={(plan.features || []).join(', ')}
                                    onChange={(e) => {
                                        const updated = { ...plan, features: e.target.value.split(',').map(f => f.trim()) };
                                        updateArrayItem('pricing', 'plans', index, updated);
                                    }}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                    placeholder="Everything in Free, Advanced CRM, Google SSO"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">CTA Text</label>
                                    <input
                                        type="text"
                                        value={plan.cta || ''}
                                        onChange={(e) => {
                                            const updated = { ...plan, cta: e.target.value };
                                            updateArrayItem('pricing', 'plans', index, updated);
                                        }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                        placeholder="Upgrade Now"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Variant</label>
                                    <select
                                        value={plan.variant || 'default'}
                                        onChange={(e) => {
                                            const updated = { ...plan, variant: e.target.value };
                                            updateArrayItem('pricing', 'plans', index, updated);
                                        }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                    >
                                        <option value="default">Default</option>
                                        <option value="outline">Outline</option>
                                    </select>
                                </div>
                                <div className="flex items-center pt-7">
                                    <input
                                        type="checkbox"
                                        checked={plan.popular || false}
                                        onChange={(e) => {
                                            const updated = { ...plan, popular: e.target.checked };
                                            updateArrayItem('pricing', 'plans', index, updated);
                                        }}
                                        className="mr-2"
                                    />
                                    <label className="text-sm font-bold text-slate-700">Popular</label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    const renderTestimonialSection = () => {
        const data = sections.testimonial || {};
        return (
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Badge Text</label>
                    <input
                        type="text"
                        value={data.testimonialBadge || ''}
                        onChange={(e) => updateSectionData('testimonial', 'testimonialBadge', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                        placeholder="All-in-one suite"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                    <input
                        type="text"
                        value={data.testimonialTitle || ''}
                        onChange={(e) => updateSectionData('testimonial', 'testimonialTitle', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                        placeholder="DinTask One"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Subtitle</label>
                    <input
                        type="text"
                        value={data.testimonialSubtitle || ''}
                        onChange={(e) => updateSectionData('testimonial', 'testimonialSubtitle', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                        placeholder="The operating system for business."
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                    <textarea
                        value={data.testimonialDescription || ''}
                        onChange={(e) => updateSectionData('testimonial', 'testimonialDescription', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                        rows={3}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">CTA Button Text</label>
                    <input
                        type="text"
                        value={data.testimonialCtaText || ''}
                        onChange={(e) => updateSectionData('testimonial', 'testimonialCtaText', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                        placeholder="TRY DINTASK ONE"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Quote</label>
                    <textarea
                        value={data.testimonialQuote || ''}
                        onChange={(e) => updateSectionData('testimonial', 'testimonialQuote', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                        rows={3}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Author Name</label>
                        <input
                            type="text"
                            value={data.testimonialAuthorName || ''}
                            onChange={(e) => updateSectionData('testimonial', 'testimonialAuthorName', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                            placeholder="Rishi Sir"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Author Role</label>
                        <input
                            type="text"
                            value={data.testimonialAuthorRole || ''}
                            onChange={(e) => updateSectionData('testimonial', 'testimonialAuthorRole', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                            placeholder="Founder & CEO, DinTask"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Author Image URL</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={data.testimonialAuthorImage || ''}
                            onChange={(e) => updateSectionData('testimonial', 'testimonialAuthorImage', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                            placeholder="https://api.dicebear.com/7.x/avataaars/svg?seed=Rishi"
                        />
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const url = await handleImageUpload(file);
                                        if (url) {
                                            updateSectionData('testimonial', 'testimonialAuthorImage', url);
                                        }
                                    }
                                }}
                            />
                            <Button variant="outline" size="icon" className="shrink-0" title="Upload Image">
                                <ImageIcon size={16} />
                            </Button>
                        </div>
                    </div>
                    {data.testimonialAuthorImage && (
                        <div className="mt-2 w-20 h-20 rounded-full overflow-hidden border border-slate-200">
                            <img src={data.testimonialAuthorImage} alt="Author Preview" className="h-full w-full object-cover" />
                        </div>
                    )}
                </div>

                {/* User Testimonials Management */}
                <div className="border-t-2 border-slate-200 my-8 pt-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900">User Submitted Testimonials</h3>
                        <Button onClick={fetchUserTestimonials} variant="outline" size="sm">
                            <RefreshCw size={16} className="mr-2" /> Refresh List
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {userTestimonials.length === 0 ? (
                            <p className="text-slate-500 italic text-center py-8">No user testimonials submitted yet.</p>
                        ) : (
                            userTestimonials.map(t => (
                                <Card key={t._id} className={`border-l-4 ${t.isApproved ? 'border-l-green-500' : 'border-l-amber-500'}`}>
                                    <div className="p-4 flex flex-col md:flex-row gap-4 items-start">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-bold text-lg text-slate-900">{t.name}</h4>
                                                <Badge className={t.isApproved ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}>
                                                    {t.isApproved ? 'Approved' : 'Pending'}
                                                </Badge>
                                                {t.highlighted && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">Highlight</Badge>}
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium">{t.role}</p>
                                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <p className="text-slate-700 italic text-sm">"{t.testimonial}"</p>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-slate-400">
                                                <div className="flex text-yellow-400">
                                                    {[...Array(t.rating || 5)].map((_, i) => <span key={i}>★</span>)}
                                                </div>
                                                <span>Submitted: {new Date(t.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                                            <Button
                                                size="sm"
                                                className={`w-full justify-start ${t.isApproved ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300" : "bg-green-600 hover:bg-green-700 text-white"}`}
                                                onClick={() => handleToggleApproval(t._id, t.isApproved)}
                                            >
                                                {t.isApproved ? <EyeOff size={16} className="mr-2" /> : <CheckCircle size={16} className="mr-2" />}
                                                {t.isApproved ? 'Unapprove' : 'Approve'}
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className={`w-full justify-start ${t.highlighted ? "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100" : ""}`}
                                                onClick={() => handleToggleHighlight(t._id)}
                                            >
                                                {t.highlighted ? <CheckCircle size={16} className="mr-2" /> : <Plus size={16} className="mr-2" />}
                                                {t.highlighted ? 'Highlighted' : 'Highlight'}
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="w-full justify-start"
                                                onClick={() => handleDeleteTestimonial(t._id)}
                                            >
                                                <Trash2 size={16} className="mr-2" /> Delete
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderDemoCtaSection = () => {
        const data = sections.demo_cta || {};
        const images = data.demoFloatingImages || ['', '', '', ''];

        return (
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                    <textarea
                        value={data.demoTitle || ''}
                        onChange={(e) => updateSectionData('demo_cta', 'demoTitle', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                        rows={2}
                        placeholder="Ready to experience the Command Center?"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                    <textarea
                        value={data.demoDescription || ''}
                        onChange={(e) => updateSectionData('demo_cta', 'demoDescription', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                        rows={3}
                        placeholder="Join thousands of managers who have optimized their workforce..."
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Primary Button Text</label>
                        <input
                            type="text"
                            value={data.demoCtaPrimary || ''}
                            onChange={(e) => updateSectionData('demo_cta', 'demoCtaPrimary', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                            placeholder="START FREE TRIAL"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Secondary Button Text</label>
                        <input
                            type="text"
                            value={data.demoCtaSecondary || ''}
                            onChange={(e) => updateSectionData('demo_cta', 'demoCtaSecondary', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                            placeholder="BOOK A DEMO"
                        />
                    </div>
                </div>

                <div className="mt-8 border-t border-slate-200 pt-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Floating Images (Command Center)</h3>
                    <p className="text-sm text-slate-500 mb-4">Upload or paste URLs for the 4 floating dashboard preview images.</p>

                    <div className="grid grid-cols-2 gap-4">
                        {[0, 1, 2, 3].map((index) => (
                            <div key={index} className="space-y-2">
                                <label className="block text-xs font-bold text-slate-600">Image {index + 1}</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={images[index] || ''}
                                        onChange={(e) => {
                                            const newImages = [...images];
                                            newImages[index] = e.target.value;
                                            updateSectionData('demo_cta', 'demoFloatingImages', newImages);
                                        }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                        placeholder={`Image URL ${index + 1}`}
                                    />
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const url = await handleImageUpload(file);
                                                    if (url) {
                                                        const newImages = [...images];
                                                        newImages[index] = url;
                                                        updateSectionData('demo_cta', 'demoFloatingImages', newImages);
                                                    }
                                                }
                                            }}
                                        />
                                        <Button variant="outline" size="icon" className="shrink-0" title="Upload Image">
                                            <ImageIcon size={16} />
                                        </Button>
                                    </div>
                                </div>
                                {images[index] && (
                                    <div className="h-20 w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative group">
                                        <img src={images[index]} alt="Preview" className="h-full w-full object-cover" />
                                        <button
                                            onClick={() => {
                                                const newImages = [...images];
                                                newImages[index] = '';
                                                updateSectionData('demo_cta', 'demoFloatingImages', newImages);
                                            }}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'hero':
                return renderHeroSection();
            case 'features':
                return renderFeaturesSection();
            case 'strategic_options':
                return renderStrategicOptionsSection();
            case 'pricing':
                return renderPricingSection();
            case 'testimonial':
                return renderTestimonialSection();
            case 'demo_cta':
                return renderDemoCtaSection();
            default:
                return <div className="text-center text-slate-500 py-12">This section editor is coming soon...</div>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" />
                    <p className="text-lg font-bold text-slate-700">Loading content...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto"
            >
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 mb-2">
                                Landing Page Manager
                            </h1>
                            <p className="text-slate-600 font-medium">
                                Edit and manage all sections of the landing page
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={initializeDefaultContent}
                                variant="outline"
                                className="border-2 border-slate-300 hover:border-primary-600"
                            >
                                <RefreshCw size={18} className="mr-2" /> Reset to Default
                            </Button>
                            <Button
                                onClick={() => window.open('/', '_blank')}
                                className="bg-slate-700 hover:bg-slate-800"
                            >
                                <Eye size={18} className="mr-2" /> Preview
                            </Button>
                        </div>
                    </div>

                    {/* Message Alert */}
                    {message.text && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                        >
                            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span className="font-bold">{message.text}</span>
                        </motion.div>
                    )}
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Sidebar - Section Selector */}
                    <Card className="col-span-3 border-2 border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-lg">Sections</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {sectionNames.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full text-left px-4 py-3 rounded-lg font-bold text-sm transition-all ${activeSection === section.id
                                        ? 'bg-primary-600 text-white shadow-lg'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    <span className="mr-2">{section.icon}</span>
                                    {section.label}
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Main Content Area */}
                    <div className="col-span-9 space-y-6">
                        <Card className="border-2 border-slate-200">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-2xl">
                                        {sectionNames.find(s => s.id === activeSection)?.label}
                                    </CardTitle>
                                    <Button
                                        onClick={() => handleSaveSection(activeSection)}
                                        disabled={saving}
                                        className="bg-primary-600 hover:bg-primary-700"
                                    >
                                        {saving ? (
                                            <RefreshCw size={18} className="mr-2 animate-spin" />
                                        ) : (
                                            <Save size={18} className="mr-2" />
                                        )}
                                        Save Section
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {renderActiveSection()}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LandingPageManager;
