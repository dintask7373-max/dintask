import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Download, TrendingUp, Users, Wallet, Calendar } from 'lucide-react';
import apiRequest from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PartnerAnalyticsModal = ({ isOpen, onClose, partner }) => {
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState([]);

    useEffect(() => {
        if (isOpen && partner) {
            fetchAnalytics();
        }
    }, [isOpen, partner]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await apiRequest(`/partners/analytics/${partner._id}`);
            if (res.success) {
                setAnalyticsData(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = () => {
        try {
            const doc = new jsPDF();

            // Title
            doc.setFontSize(20);
            doc.setTextColor(40, 40, 40);
            doc.text('Partner Performance Report', 105, 15, { align: 'center' });

            // Partner Info
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text(`Partner: ${partner.name || partner.companyName || 'N/A'}`, 20, 30);
            doc.text(`Referral Code: ${partner.referralCode || 'N/A'}`, 20, 37);
            doc.text(`Report Date: ${format(new Date(), 'dd MMM yyyy')}`, 20, 44);

            // Summary Stats
            const totalReferrals = analyticsData.reduce((acc, curr) => acc + curr.referrals, 0);
            const totalEarnings = analyticsData.reduce((acc, curr) => acc + curr.earnings, 0);

            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Summary (Last 12 Months)', 20, 55);

            autoTable(doc, {
                startY: 60,
                head: [['Metric', 'Value']],
                body: [
                    ['Total Referrals', totalReferrals],
                    ['Total Commission Earned', `INR ${totalEarnings.toLocaleString()}`],
                    ['Average Monthly Earnings', `INR ${(totalEarnings / 12).toFixed(2)}`],
                ],
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246] }
            });

            // Monthly Breakdown Table
            const finalY = doc.lastAutoTable?.finalY || 80;
            doc.text('Monthly Breakdown', 20, finalY + 15);

            autoTable(doc, {
                startY: finalY + 20,
                head: [['Month', 'Referrals', 'Earnings (INR)']],
                body: analyticsData.map(item => [
                    item.name,
                    item.referrals,
                    item.earnings.toLocaleString()
                ]),
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246] }
            });

            doc.save(`${partner.referralCode || 'partner'}_report.pdf`);
            toast.success('Report downloaded successfully');
        } catch (err) {
            console.error('PDF Generation Error Detail:', err);
            toast.error(`PDF Error: ${err.message || 'Check console'}`);
        }
    };

    if (!partner) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white border-none rounded-2xl">
                <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-slate-900">
                                    {partner.name || partner.companyName} Analytics
                                </DialogTitle>
                                <p className="text-sm text-slate-500">Performance overview for the last 12 months</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="gap-2 border-slate-200 hover:bg-white hover:text-blue-600 transition-all rounded-xl shadow-sm"
                            onClick={generatePDF}
                            disabled={loading}
                        >
                            <Download size={18} />
                            Download PDF Report
                        </Button>
                    </div>
                </DialogHeader>

                <div className="p-6 overflow-y-auto max-h-[80vh]">
                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <div className="flex items-center gap-3 mb-3 text-blue-600">
                                        <Users size={20} />
                                        <span className="text-sm font-semibold uppercase tracking-wider">Total Referrals</span>
                                    </div>
                                    <div className="text-3xl font-bold text-slate-900">
                                        {analyticsData.reduce((acc, curr) => acc + curr.referrals, 0)}
                                    </div>
                                </div>
                                <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                    <div className="flex items-center gap-3 mb-3 text-emerald-600">
                                        <Wallet size={20} />
                                        <span className="text-sm font-semibold uppercase tracking-wider">Total Earnings</span>
                                    </div>
                                    <div className="text-3xl font-bold text-slate-900">
                                        ₹{analyticsData.reduce((acc, curr) => acc + curr.earnings, 0).toLocaleString()}
                                    </div>
                                </div>
                                <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100">
                                    <div className="flex items-center gap-3 mb-3 text-amber-600">
                                        <Calendar size={20} />
                                        <span className="text-sm font-semibold uppercase tracking-wider">Avg. Monthly</span>
                                    </div>
                                    <div className="text-3xl font-bold text-slate-900">
                                        ₹{(analyticsData.reduce((acc, curr) => acc + curr.earnings, 0) / 12).toFixed(0).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 gap-8">
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                                        <TrendingUp className="text-blue-500" size={20} />
                                        Earnings Trend (INR)
                                    </h3>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={analyticsData}>
                                                <defs>
                                                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Earnings']}
                                                />
                                                <Area type="monotone" dataKey="earnings" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                                        <Users className="text-blue-500" size={20} />
                                        Monthly Referrals
                                    </h3>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={analyticsData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                                <Tooltip
                                                    cursor={{ fill: '#f8fafc' }}
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                />
                                                <Bar dataKey="referrals" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PartnerAnalyticsModal;
