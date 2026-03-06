import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { toast } from 'sonner';

import useSuperAdminStore from '@/store/superAdminStore';

const ContactSalesModal = ({ isOpen, onOpenChange, planName }) => {
    const addInquiry = useSuperAdminStore(state => state.addInquiry);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        workEmail: '',
        firstName: '',
        lastName: '',
        phone: '',
        company: '',
        questions: ''
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.workEmail || !formData.firstName || !formData.lastName || !formData.phone || !formData.company) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            // Save to store
            addInquiry({
                ...formData,
                planSelected: planName,
            });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success(`Inquiry for ${planName} plan sent successfully!`);
            onOpenChange(false);
            setFormData({
                workEmail: '',
                firstName: '',
                lastName: '',
                phone: '',
                company: '',
                questions: ''
            });
        } catch (error) {
            toast.error('Failed to send inquiry. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto font-sans">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">Contact Sales</DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                        Interested in our {planName} plan? Fill out the form below.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="workEmail" className="font-semibold text-slate-700 dark:text-slate-200">
                            Work Email <span className="text-primary-500">*</span>
                        </Label>
                        <Input
                            id="workEmail"
                            type="email"
                            placeholder="you@company.com"
                            value={formData.workEmail}
                            onChange={handleChange}
                            className="bg-slate-50 dark:bg-slate-800/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="font-semibold text-slate-700 dark:text-slate-200">
                                First Name <span className="text-primary-500">*</span>
                            </Label>
                            <Input
                                id="firstName"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="bg-slate-50 dark:bg-slate-800/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="font-semibold text-slate-700 dark:text-slate-200">
                                Last Name <span className="text-primary-500">*</span>
                            </Label>
                            <Input
                                id="lastName"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="bg-slate-50 dark:bg-slate-800/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="font-semibold text-slate-700 dark:text-slate-200">
                            Phone <span className="text-primary-500">*</span>
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone}
                            onChange={handleChange}
                            className="bg-slate-50 dark:bg-slate-800/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="company" className="font-semibold text-slate-700 dark:text-slate-200">
                            Company <span className="text-primary-500">*</span>
                        </Label>
                        <Input
                            id="company"
                            placeholder="Acme Inc."
                            value={formData.company}
                            onChange={handleChange}
                            className="bg-slate-50 dark:bg-slate-800/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="questions" className="font-semibold text-slate-700 dark:text-slate-200">
                            What questions can we help to answer?
                        </Label>
                        <Textarea
                            id="questions"
                            placeholder="Tell us about your team's needs..."
                            className="min-h-[100px] bg-slate-50 dark:bg-slate-800/50 resize-none"
                            value={formData.questions}
                            onChange={handleChange}
                        />
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                        By submitting, I agree to DinTask's <span className="text-primary-600 hover:underline cursor-pointer">Privacy Policy</span> and consent to be contacted about my inquiry via email, phone, or SMS. I can opt out anytime.
                    </p>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 text-lg font-bold bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-500/20"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Submitting...
                            </div>
                        ) : "Submit"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ContactSalesModal;
