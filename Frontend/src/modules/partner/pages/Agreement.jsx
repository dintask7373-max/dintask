import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Upload,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { toast } from 'sonner';
import apiRequest from '@/lib/api';
import useAuthStore from '@/store/authStore';

const Agreement = () => {
    const { user, fetchProfile } = useAuthStore();
    const navigate = useNavigate();
    const [signature, setSignature] = useState(null);
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('File size should be less than 2MB');
                return;
            }
            setSignature(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!preview) {
            toast.error('Please upload your signature image');
            return;
        }

        setSubmitting(true);
        try {
            const res = await apiRequest('/partners/agreement/submit', {
                method: 'PUT',
                body: { signatureImage: preview }
            });

            if (res.success) {
                toast.success('Agreement submitted for approval!');
                await fetchProfile();
                navigate('/partner');
            }
        } catch (err) {
            toast.error(err.message || 'Failed to submit agreement');
        } finally {
            setSubmitting(false);
        }
    };

    if (user?.agreementStatus === 'submitted') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <Card className="max-w-md w-full rounded-[2.5rem] border-none shadow-2xl p-8 text-center space-y-6">
                    <div className="h-20 w-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <Loader2 size={40} className="animate-spin" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">Approval Pending</h2>
                    <p className="text-slate-500 font-medium">Your agreement and signature have been submitted. Please wait for the SuperAdmin to review and activate your account.</p>
                    <div className="pt-4">
                        <Button variant="outline" onClick={() => navigate('/partner')} className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs">
                            Back to Dashboard
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Partnership Agreement</h1>
                    <p className="text-slate-500 font-medium max-w-2xl mx-auto">Please review the terms and conditions of our partnership program. You must provide a digital signature to proceed.</p>
                </div>

                <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
                    <div className="p-8 md:p-12 space-y-8">
                        {/* Agreement Content */}
                        <div className="bg-slate-50 rounded-2xl p-8 h-96 overflow-y-auto border border-slate-100 prose prose-slate prose-sm max-w-none">
                            <h3 className="uppercase tracking-widest font-black text-slate-800 mb-4">Terms of Partnership</h3>
                            <p>This Partnership Agreement ("Agreement") is entered into between DinTask ("the Company") and the undersigned Partner.</p>
                            <h4>1. Scope of Work</h4>
                            <p>The Partner agrees to refer potential clients to the Company's SaaS platform. The Partner shall represent the Company's services accurately and professionally.</p>
                            <h4>2. Commission Structure</h4>
                            <p>The Partner will earn commissions on successful client registrations and active subscriptions. Commission rates are determined by the Company and may be subject to periodic review.</p>
                            <h4>3. Confidentiality</h4>
                            <p>The Partner agrees to maintain the confidentiality of all proprietary information shared by the Company during the course of the partnership.</p>
                            <h4>4. Termination</h4>
                            <p>Either party may terminate this agreement with 30 days' written notice. Upon termination, any outstanding commissions will be settled according to the terms existing at that time.</p>
                            <p className="pt-8 text-slate-400 italic">By uploading your signature below, you acknowledge that you have read, understood, and agree to be bound by these terms.</p>
                        </div>

                        {/* Signature Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                                    <Upload size={20} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Upload Your Signature</h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 items-start">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Signature Image (PNG/JPG)</Label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="h-40 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 bg-slate-50 transition-all group-hover:border-primary-400 group-hover:bg-primary-50/30">
                                            <Upload className="text-slate-400 group-hover:text-primary-500" />
                                            <p className="text-xs font-bold text-slate-500 group-hover:text-primary-700">Click or drag your signature image</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium flex items-center gap-2">
                                        <AlertCircle size={12} /> Max file size: 2MB
                                    </p>
                                </div>

                                {preview && (
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preview</Label>
                                        <div className="h-40 rounded-2xl border border-slate-100 bg-white p-4 flex items-center justify-center shadow-lg shadow-slate-200/50">
                                            <img src={preview} alt="Signature Preview" className="max-h-full max-w-full object-contain" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex justify-end">
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting || !preview}
                                className="h-14 px-12 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 group"
                            >
                                {submitting ? 'Submitting...' : 'Sign & Submit Agreement'}
                                <ArrowRight className="ml-2 group-hover:translate-x-1" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Agreement;
