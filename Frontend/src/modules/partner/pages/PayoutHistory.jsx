import React, { useState, useEffect } from 'react';
import {
    Receipt,
    Search,
    ExternalLink,
    Calendar,
    CheckCircle2,
    FileDown,
    Info,
    ArrowDownToLine,
    TrendingDown,
    Dot
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import apiRequest from '@/lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PayoutHistory = () => {

    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        try {
            const res = await apiRequest('/partners/my-payouts');
            if (res.success) {

                setPayouts(res.data);
            }
        } catch (err) {
            toast.error('Failed to load payout history');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReceipt = (payout) => {
        try {
            const doc = new jsPDF();
            const date = new Date(payout.createdAt).toLocaleDateString();

            // Header
            doc.setFontSize(22);
            doc.setTextColor(30, 41, 59); // slate-800
            doc.text('DIN TASK', 105, 20, { align: 'center' });
            
            doc.setFontSize(16);
            doc.text('PAYOUT RECEIPT', 105, 35, { align: 'center' });
            
            // Divider
            doc.setDrawColor(226, 232, 240); // slate-200
            doc.line(20, 45, 190, 45);

            // Details
            doc.setFontSize(12);
            doc.setTextColor(100, 116, 139); // slate-500
            doc.text('Transaction Details:', 20, 60);
            
            doc.setTextColor(30, 41, 59);
            const details = [
                ['Transaction ID', payout.transactionRef || 'N/A'],
                ['Date', date],
                ['Status', payout.status.toUpperCase()],
                ['Type', 'Bank Transfer'],
                ['Amount', `INR ${payout.amount.toLocaleString()}`]
            ];

            autoTable(doc, {
                startY: 70,
                head: [['Label', 'Value']],
                body: details,
                theme: 'striped',
                headStyles: { fillColor: [79, 70, 229] }, // primary-600
                margin: { left: 20, right: 20 }
            });


            // Footer
            const finalY = doc.lastAutoTable.finalY + 30;
            doc.setFontSize(10);
            doc.setTextColor(148, 163, 184); // slate-400
            doc.text('This is a computer-generated receipt.', 105, finalY, { align: 'center' });
            doc.text('DinTask - Team Management Platform', 105, finalY + 7, { align: 'center' });

            doc.save(`Payout_Receipt_${payout.transactionRef}.pdf`);
            toast.success('Receipt downloaded successfully');
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error('Failed to generate PDF');
        }
    };


    return (
        <div className="max-w-5xl space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Payout History</h1>
                    <p className="text-slate-500 font-bold text-sm tracking-widest mt-1 opacity-60">Complete record of your earnings transfers</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-3 flex gap-4 items-center">
                    <div className="h-10 w-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest leading-none">Account Status</p>
                        <h4 className="text-sm font-black text-emerald-900 mt-1">Ready for Payout</h4>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Payout</p>
                    <h3 className="text-2xl font-black text-slate-900">₹0.00</h3>
                    <p className="text-[11px] font-bold text-slate-400 mt-2">N/A</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Balance</p>
                    <h3 className="text-2xl font-black text-slate-900">₹0.00</h3>
                    <p className="text-[11px] font-bold text-primary-600 mt-2 flex items-center"><TrendingDown size={12} className="mr-1 rotate-180" /> In Approval</p>
                </div>
            </div>

            {/* Main List */}
            <div className="space-y-4">
                <h3 className="font-black text-slate-900 uppercase tracking-tight px-2 flex items-center gap-2">
                    <Receipt size={18} className="text-primary-500" /> Transaction Timeline
                </h3>

                <div className="space-y-4">
                    {payouts.length > 0 ? payouts.map((payout, idx) => (
                        <div key={idx} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-primary-200 transition-all duration-300">
                            <div className="flex items-center gap-5">
                                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                    <span className="text-[10px] font-black uppercase tracking-tighter leading-none">FEB</span>
                                    <span className="text-xl font-black leading-none mt-1">{new Date(payout.createdAt).getDate()}</span>
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 flex items-center gap-2">
                                        Bank Transfer <Dot className="text-slate-300" /> <span className="text-xs text-primary-600 uppercase tracking-widest">{payout.transactionRef}</span>
                                    </h4>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Payout released to your default bank account</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 pl-14 md:pl-0">
                                <div className="text-right">
                                    <span className="text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">Completed</span>
                                    <div className="text-2xl font-black text-slate-900 mt-1 tracking-tighter">₹{payout.amount}</div>
                                </div>
                                <Button 
                                    onClick={() => handleDownloadReceipt(payout)}
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-primary-50 hover:text-primary-600 transition-all"
                                >
                                    <ArrowDownToLine size={24} />
                                </Button>

                            </div>
                        </div>
                    )) : (
                        <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
                            <div className="h-20 w-20 bg-slate-200/50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                                <Receipt size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Transactions Yet</h3>
                            <p className="text-slate-400 max-w-xs mx-auto text-sm mt-3 font-medium">Your payout history will appear here once the first commission is released by the administrator.</p>
                            <Button variant="outline" className="mt-8 rounded-xl h-11 border-slate-200 font-bold px-8">Contact Support</Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Notice */}
            <div className="bg-primary-50 border border-primary-100 rounded-[2rem] p-6 flex gap-4">
                <Info className="text-primary-600 shrink-0 mt-0.5" size={20} />
                <div>
                    <h4 className="text-sm font-black text-primary-900 uppercase tracking-tight">Payout Policy</h4>
                    <p className="text-xs text-primary-700/80 mt-1 font-medium leading-relaxed">
                        Commissions are settled on a weekly basis (every Monday). Min payout amount is ₹1,000. All transfers are made to the bank account details provided during registration.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PayoutHistory;
