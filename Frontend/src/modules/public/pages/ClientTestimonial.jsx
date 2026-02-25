import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Star, CheckCircle2 } from 'lucide-react';
import apiRequest from '@/lib/api';

const ClientTestimonial = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        testimonial: '',
        rating: 5,
        image: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingChange = (value) => {
        setFormData(prev => ({ ...prev, rating: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            await apiRequest('/testimonials', {
                method: 'POST',
                body: formData
            });
            setSubmitStatus('success');
            setFormData({ name: '', role: '', testimonial: '', rating: 5, image: '' });
        } catch (error) {
            console.error('Error submitting testimonial:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Share Your Story</h1>
                    <p className="text-slate-500 dark:text-slate-400">Tell us how DinTask has helped your team.</p>
                </div>

                {submitStatus === 'success' ? (
                    <div className="py-8 text-center text-green-600">
                        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Thank You!</h2>
                        <p className="font-medium text-slate-600 dark:text-slate-400">Your testimonial has been submitted for review.</p>
                        <Button variant="link" className="mt-4" onClick={() => setSubmitStatus(null)}>Submit Another</Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Your Name" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role / Company</Label>
                            <Input id="role" name="role" value={formData.role} onChange={handleChange} required placeholder="CEO at Company" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Rating</Label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={32}
                                        className={`cursor-pointer transition-colors ${star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
                                        onClick={() => handleRatingChange(star)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="testimonial">Message</Label>
                            <Textarea id="testimonial" name="testimonial" value={formData.testimonial} onChange={handleChange} required placeholder="Write your testimonial here..." className="h-32 resize-none" />
                        </div>

                        {submitStatus === 'error' && (
                            <p className="text-red-500 text-sm text-center">Something went wrong. Please try again.</p>
                        )}

                        <Button type="submit" disabled={isSubmitting} className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-6 text-lg">
                            {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ClientTestimonial;
