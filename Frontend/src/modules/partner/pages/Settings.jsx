import React from 'react';
import {
    Settings as SettingsIcon,
    User,
    Lock,
    Bell,
    Shield,
    CreditCard,
    ChevronRight,
    LogOut
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import useAuthStore from '@/store/authStore';

const Settings = () => {
    const { user, logout } = useAuthStore();

    const settingsSections = [
        { title: 'Profile Information', icon: User, description: 'Update your personal and business details' },
        { title: 'Security & Password', icon: Lock, description: 'Manage your password and account security' },
        { title: 'Payout Settings', icon: CreditCard, description: 'Update your bank account and tax information' },
        { title: 'Notifications', icon: Bell, description: 'Choose what alerts you want to receive' },
    ];

    return (
        <div className="max-w-4xl space-y-8 pb-10">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Settings</h1>
                <p className="text-slate-500 font-bold text-sm tracking-widest mt-1 opacity-60">Manage your partner account and preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                    {settingsSections.map((section, idx) => (
                        <button key={idx} className="w-full text-left p-4 rounded-2xl bg-white border border-slate-100 hover:border-primary-200 transition-all group shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600">
                                    <section.icon size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black text-slate-900 truncate">{section.title}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{section.description}</p>
                                </div>
                                <ChevronRight size={16} className="text-slate-300" />
                            </div>
                        </button>
                    ))}

                    <Button onClick={logout} variant="ghost" className="w-full justify-start h-14 rounded-2xl text-red-600 hover:bg-red-50 hover:text-red-700 font-bold gap-4 px-4">
                        <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
                            <LogOut size={20} />
                        </div>
                        Sign Out
                    </Button>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <Card className="rounded-[2.5rem] border-slate-100 shadow-xl shadow-slate-200/40 bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                            <CardTitle className="text-xl font-black uppercase tracking-tight italic">Account <span className="text-primary-600">Overview</span></CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</Label>
                                    <Input defaultValue={user?.name} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</Label>
                                    <Input defaultValue={user?.email} disabled className="h-12 rounded-xl bg-slate-50 border-none font-bold opacity-50" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registration Type</Label>
                                <div className="h-12 flex items-center px-4 rounded-xl bg-slate-50 font-black text-xs text-slate-600 border border-slate-100 uppercase tracking-widest">
                                    {user?.partnerType || 'Individual Partner'}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <Button className="h-12 px-8 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary-500/20">
                                    Save Changes
                                </Button>
                                <Button variant="outline" className="h-12 px-8 rounded-xl font-black uppercase tracking-widest border-slate-200">
                                    View Documents
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6 flex gap-4">
                        <Shield className="text-amber-600 shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Compliance Verification</h4>
                            <p className="text-xs text-amber-700/80 mt-1 font-medium leading-relaxed">
                                Some changes to your profile may require re-verification of your identity or business documents. Our team typically reviews these within 48 hours.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
