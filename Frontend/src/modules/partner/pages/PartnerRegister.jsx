import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Building2,
    Mail,
    Phone,
    Lock,
    ShieldCheck,
    ArrowRight,
    ArrowLeft,
    Briefcase,
    IdCard,
    MapPin,
    Landmark,
    FileText,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/utils/cn';
import apiRequest from '@/lib/api';
import { toast } from 'sonner';
import { Upload, X, FileCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

const PartnerRegister = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [partnerType, setPartnerType] = useState(null); // 'Individual' or 'Company'

    const [formData, setFormData] = useState({
        // Auth & Common
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',

        // Individual
        fullName: '',
        panNumber: '',
        address: '',

        // Company
        companyName: '',
        gstNumber: '',
        companyPan: '',
        authorizedPersonName: '',

        // Bank Details
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: '',

        // Documents
        documents: [] // { type: 'PAN', url: '', fileName: '' }
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [emailError, setEmailError] = useState('');

    const [uploading, setUploading] = useState({}); // { 'PAN': true }

    const handleEmailBlur = async () => {
        if (!formData.email) return;
        const res = await apiRequest(`/auth/check-email?email=${encodeURIComponent(formData.email)}&role=partner`);
        if (res.success && res.exists) {
            setEmailError('This email is already registered as a partner');
            toast.error('Identity Conflict: Partner account already exists');
        } else {
            setEmailError('');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'email') setEmailError('');
    };


    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateStep = () => {
        if (step === 1) {
            if (!partnerType) {
                toast.error('Please select a registration type');
                return false;
            }
        }

        if (step === 2) {
            if (partnerType === 'Individual') {
                if (!formData.fullName.trim()) {
                    toast.error('Full Name is required');
                    return false;
                }
                if (!/^[a-zA-Z\s]+$/.test(formData.fullName)) {
                    toast.error('Full Name should only contain letters and spaces');
                    return false;
                }
                if (!formData.panNumber.trim()) {
                    toast.error('PAN Number is required');
                    return false;
                }
                if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
                    toast.error('Invalid PAN Number format (e.g. ABCDE1234F)');
                    return false;
                }
            } else {
                if (!formData.companyName.trim()) {
                    toast.error('Company Name is required');
                    return false;
                }
                if (!formData.companyPan.trim()) {
                    toast.error('Company PAN is required');
                    return false;
                }
                if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.companyPan)) {
                    toast.error('Invalid Company PAN format');
                    return false;
                }
                if (!formData.authorizedPersonName.trim()) {
                    toast.error('Authorized Person Name is required');
                    return false;
                }
                if (!/^[a-zA-Z\s]+$/.test(formData.authorizedPersonName)) {
                    toast.error('Authorized Person Name should only contain letters and spaces');
                    return false;
                }
            }
            if (!formData.address.trim()) {
                toast.error('Address is required');
                return false;
            }
        }

        if (step === 3) {
            if (emailError) {
                toast.error(emailError);
                return false;
            }
            if (!formData.email.trim() || !validateEmail(formData.email)) {
                toast.error('Please enter a valid email address');
                return false;
            }
            if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone)) {
                toast.error('Phone number must be exactly 10 digits');
                return false;
            }
            if (!formData.password || formData.password.length < 6) {
                toast.error('Password must be at least 6 characters');
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                toast.error('Passwords do not match');
                return false;
            }

            // Bank Details Validation
            if (!formData.accountHolderName.trim()) {
                toast.error('Account Holder Name is required');
                return false;
            }
            if (!/^[a-zA-Z\s]+$/.test(formData.accountHolderName)) {
                toast.error('Account Holder Name should only contain letters and spaces');
                return false;
            }
            if (!formData.accountNumber.trim()) {
                toast.error('Account Number is required');
                return false;
            }
            if (!/^\d{9,18}$/.test(formData.accountNumber)) {
                toast.error('Invalid Account Number (9-18 digits)');
                return false;
            }
            if (!formData.ifscCode.trim()) {
                toast.error('IFSC Code is required');
                return false;
            }
            if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
                toast.error('Invalid IFSC Code format (e.g. SBIN0001234)');
                return false;
            }
            if (!formData.bankName.trim()) {
                toast.error('Bank Name is required');
                return false;
            }
        }

        if (step === 4) {
            const hasPan = formData.documents.find(d => d.type === 'PAN Card');
            const hasId = formData.documents.find(d => d.type === 'Aadhar/Identity');
            if (!hasPan || !hasId) {
                toast.error('Please upload all required documents');
                return false;
            }
        }

        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(prev => ({ ...prev, [type]: true }));
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await apiRequest('/auth/upload', {
                method: 'POST',
                body: formData,
                isFormData: true
            });

            if (res.success) {
                const newDoc = { type, url: res.url, fileName: file.name };
                setFormData(prev => ({
                    ...prev,
                    documents: [...prev.documents.filter(d => d.type !== type), newDoc]
                }));
                toast.success(`${type} uploaded successfully`);
            }
        } catch (err) {
            toast.error(`Failed to upload ${type}`);
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    const removeDocument = (type) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.filter(d => d.type !== type)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                role: 'partner',
                partnerType,
                ...formData
            };

            const res = await apiRequest('/auth/register', {
                method: 'POST',
                body: payload
            });

            if (res.success) {
                toast.success('Registration successful! Please wait for admin approval.');
                setStep(6); // Success step
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Become a Partner</h2>
                <p className="text-slate-500 mt-2">Select your registration type to get started</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => setPartnerType('Individual')}
                    className={cn(
                        "p-6 border-2 rounded-2xl text-left transition-all duration-300 group hover:border-primary-500",
                        partnerType === 'Individual' ? "border-primary-500 bg-primary-50/50" : "border-slate-100 bg-white"
                    )}
                >
                    <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                        partnerType === 'Individual' ? "bg-primary-500 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-primary-100 group-hover:text-primary-600"
                    )}>
                        <User size={24} />
                    </div>
                    <h3 className="font-bold text-slate-900">Individual Partner</h3>
                    <p className="text-sm text-slate-500 mt-1">For independent professionals and freelancers</p>
                </button>

                <button
                    onClick={() => setPartnerType('Company')}
                    className={cn(
                        "p-6 border-2 rounded-2xl text-left transition-all duration-300 group hover:border-primary-500",
                        partnerType === 'Company' ? "border-primary-500 bg-primary-50/50" : "border-slate-100 bg-white"
                    )}
                >
                    <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                        partnerType === 'Company' ? "bg-primary-500 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-primary-100 group-hover:text-primary-600"
                    )}>
                        <Building2 size={24} />
                    </div>
                    <h3 className="font-bold text-slate-900">Company Partner</h3>
                    <p className="text-sm text-slate-500 mt-1">For agencies and registered businesses</p>
                </button>
            </div>

            <Button onClick={handleNext} className="w-full h-12 rounded-xl font-bold uppercase tracking-widest">
                Continue <ArrowRight size={18} className="ml-2" />
            </Button>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Basic Details</h2>
                <p className="text-slate-500 mt-2">Fill in your {partnerType} information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partnerType === 'Individual' ? (
                    <>
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                                name="fullName"
                                value={formData.fullName}
                                onChange={(e) => {
                                    if (/^[a-zA-Z\s]*$/.test(e.target.value)) handleChange(e);
                                }}
                                placeholder="As per PAN"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>PAN Number</Label>
                            <Input
                                name="panNumber"
                                value={formData.panNumber}
                                onChange={(e) => {
                                    e.target.value = e.target.value.toUpperCase();
                                    handleChange(e);
                                }}
                                maxLength={10}
                                placeholder="ABCDE1234F"
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-2 col-span-2">
                            <Label>Company Name</Label>
                            <Input name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Business Name" />
                        </div>
                        <div className="space-y-2">
                            <Label>GST Number (Optional)</Label>
                            <Input name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="22AAAAA0000A1Z5" />
                        </div>
                        <div className="space-y-2">
                            <Label>Company PAN</Label>
                            <Input
                                name="companyPan"
                                value={formData.companyPan}
                                onChange={(e) => {
                                    e.target.value = e.target.value.toUpperCase();
                                    handleChange(e);
                                }}
                                maxLength={10}
                                placeholder="ABCDE1234F"
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label>Authorized Person Name</Label>
                            <Input
                                name="authorizedPersonName"
                                value={formData.authorizedPersonName}
                                onChange={(e) => {
                                    if (/^[a-zA-Z\s]*$/.test(e.target.value)) handleChange(e);
                                }}
                                placeholder="Full Name"
                            />
                        </div>
                    </>
                )}
                <div className="space-y-2 col-span-2">
                    <Label>Address</Label>
                    <Input name="address" value={formData.address} onChange={handleChange} placeholder="Full Address" />
                </div>
            </div>

            <div className="flex gap-4">
                <Button variant="outline" onClick={handleBack} className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest">
                    <ArrowLeft size={18} className="mr-2" /> Back
                </Button>
                <Button onClick={handleNext} className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest">
                    Next <ArrowRight size={18} className="ml-2" />
                </Button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Account Setup</h2>
                <p className="text-slate-500 mt-2">Enter your contact and bank information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleEmailBlur}
                        placeholder="partner@example.com"
                        className={cn(emailError && "border-red-500 ring-1 ring-red-500")}
                    />
                    {emailError && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{emailError}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => {
                            if (/^\d*$/.test(e.target.value)) handleChange(e);
                        }}
                        maxLength={10}
                        placeholder="0000000000"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                        <Input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors p-1"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <div className="relative">
                        <Input
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors p-1"
                        >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
                <h4 className="flex items-center gap-2 font-bold text-slate-700 mb-3 text-xs uppercase tracking-widest">
                    <Landmark size={14} className="text-primary-500" /> Bank Details (For Payouts)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label className="text-[10px] uppercase">Account Holder Name</Label>
                        <Input
                            name="accountHolderName"
                            value={formData.accountHolderName}
                            onChange={(e) => {
                                if (/^[a-zA-Z\s]*$/.test(e.target.value)) handleChange(e);
                            }}
                            className="h-9 text-xs"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] uppercase">Account Number</Label>
                        <Input
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={(e) => {
                                if (/^\d*$/.test(e.target.value)) handleChange(e);
                            }}
                            className="h-9 text-xs"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] uppercase">IFSC Code</Label>
                        <Input
                            name="ifscCode"
                            value={formData.ifscCode}
                            onChange={(e) => {
                                e.target.value = e.target.value.toUpperCase();
                                handleChange(e);
                            }}
                            maxLength={11}
                            className="h-9 text-xs"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] uppercase">Bank Name</Label>
                        <Input name="bankName" value={formData.bankName} onChange={handleChange} className="h-9 text-xs" />
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <Button variant="outline" onClick={handleBack} className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest">
                    <ArrowLeft size={18} className="mr-2" /> Back
                </Button>
                <Button onClick={handleNext} className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest">
                    Next <ArrowRight size={18} className="ml-2" />
                </Button>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Document Upload</h2>
                <p className="text-slate-500 mt-2">Upload required documents for verification</p>
            </div>

            <div className="space-y-4">
                {[
                    { type: 'PAN Card', required: true, desc: partnerType === 'Individual' ? 'Individual PAN card' : 'Company PAN card' },
                    ...(partnerType === 'Company' ? [{ type: 'GST Certificate', required: false, desc: 'Optional but recommended' }] : []),
                    { type: 'Aadhar/Identity', required: true, desc: 'Proof of identity' }
                ].map((doc) => {
                    const uploaded = formData.documents.find(d => d.type === doc.type);
                    const isUploading = uploading[doc.type];

                    return (
                        <div key={doc.type} className={cn(
                            "p-4 rounded-2xl border-2 border-dashed transition-all",
                            uploaded ? "border-emerald-200 bg-emerald-50/30" : "border-slate-100 bg-slate-50/50 hover:border-primary-200"
                        )}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-10 w-10 rounded-xl flex items-center justify-center",
                                        uploaded ? "bg-emerald-100 text-emerald-600" : "bg-white text-slate-400 shadow-sm"
                                    )}>
                                        {uploaded ? <FileCheck size={20} /> : <IdCard size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">
                                            {doc.type} {doc.required && <span className="text-red-500">*</span>}
                                        </h4>
                                        <p className="text-[10px] text-slate-500 font-medium">{doc.desc}</p>
                                    </div>
                                </div>

                                {uploaded ? (
                                    <button onClick={() => removeDocument(doc.type)} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                                        <X size={16} />
                                    </button>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => handleFileUpload(e, doc.type)}
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            disabled={isUploading}
                                        />
                                        <Button size="sm" variant="outline" className="h-8 text-[10px] font-black uppercase tracking-widest bg-white">
                                            {isUploading ? 'Uploading...' : 'Upload'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-blue-50 p-4 rounded-xl flex gap-3 border border-blue-100">
                <AlertCircle className="text-blue-500 shrink-0" size={18} />
                <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                    Documents must be clear and readable. Allowed formats: JPG, PNG, PDF. Max size: 5MB.
                </p>
            </div>

            <div className="flex gap-4">
                <Button variant="outline" onClick={handleBack} className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest">
                    <ArrowLeft size={18} className="mr-2" /> Back
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={formData.documents.filter(d => d.type === 'PAN Card' || d.type === 'Aadhar/Identity').length < 2}
                    className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest"
                >
                    Next <ArrowRight size={18} className="ml-2" />
                </Button>
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Final Step</h2>
                <p className="text-slate-500 mt-2">Agreement and Submission</p>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                <div className="flex gap-3">
                    <FileText className="text-amber-500 shrink-0" size={20} />
                    <div>
                        <h4 className="text-sm font-bold text-amber-900">Partnership Agreement</h4>
                        <p className="text-xs text-amber-700 mt-1">
                            By submitting this form, you agree to our partner terms and conditions. Commissions are paid only after successful client payment and verification.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-5 items-center">
                        <input
                            id="agree_terms"
                            type="checkbox"
                            required
                            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600"
                        />
                    </div>
                    <Label htmlFor="agree_terms" className="text-[10px] leading-tight text-slate-500 font-bold uppercase tracking-widest cursor-pointer">
                        I confirm that all information provided is accurate and I agree to the{' '}
                        <Link to="/terms" className="text-primary-600 hover:underline">Partner Terms</Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
                    </Label>
                </div>
            </div>

            <div className="flex gap-4">
                <Button variant="outline" onClick={handleBack} className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest">
                    <ArrowLeft size={18} className="mr-2" /> Back
                </Button>
                <Button onClick={handleSubmit} disabled={loading} className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest">
                    {loading ? 'Processing...' : 'Register'} <ShieldCheck size={18} className="ml-2" />
                </Button>
            </div>
        </div>
    )

    const renderSuccess = () => (
        <div className="text-center space-y-6 py-8">
            <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 scale-125">
                <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Application Submitted!</h2>
            <p className="text-slate-500 max-w-sm mx-auto">
                Your application has been received and is currently under review by our team. You will receive an email once your account is activated.
            </p>
            <Button
                onClick={() => navigate('/partner/login')}
                variant="outline"
                className="h-12 px-8 rounded-xl font-bold uppercase tracking-widest"
            >
                Go to Login
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-xl w-full">
                {/* Logo Section */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-900/20">
                        <Briefcase size={24} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">DinTask <span className="text-primary-600">Partners</span></h1>
                </div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 border border-white relative overflow-hidden"
                >
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50">
                        <motion.div
                            className="h-full bg-primary-600"
                            initial={{ width: '0%' }}
                            animate={{ width: `${(step / 5) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {step === 1 && renderStep1()}
                            {step === 2 && renderStep2()}
                            {step === 3 && renderStep3()}
                            {step === 4 && renderStep4()}
                            {step === 5 && renderStep5()}
                            {step === 6 && renderSuccess()}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* Footer */}
                {step < 6 && (
                    <p className="text-center mt-8 text-slate-400 font-bold text-xs uppercase tracking-widest">
                        Already have a partner account? <Link to="/partner/login" className="text-primary-600 hover:underline">Sign In</Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default PartnerRegister;
