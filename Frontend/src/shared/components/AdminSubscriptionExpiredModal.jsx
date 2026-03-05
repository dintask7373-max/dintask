import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CreditCard } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/shared/components/ui/dialog';

const AdminSubscriptionExpiredModal = ({ isOpen, expiryDate }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleRenewPlan = () => {
    navigate('/admin/subscription');
  };

  // Automatically close if user is already on the subscription page
  const isSubscriptionPage = location.pathname === '/admin/subscription';
  const shouldShow = isOpen && !isSubscriptionPage;

  return (
    <Dialog open={shouldShow} onOpenChange={() => { }}>
      <DialogContent
        className="max-w-lg bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900 p-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <div className="p-8">
          <DialogHeader>
            <div className="flex flex-col items-center text-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="size-20 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center"
              >
                <AlertCircle className="text-amber-600 dark:text-amber-400" size={40} />
              </motion.div>
              <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Subscription Expired!
              </DialogTitle>
              <DialogDescription className="text-center text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Your subscription plan has expired on{' '}
                <strong className="text-slate-900 dark:text-white">
                  {expiryDate ? new Date(expiryDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : 'recently'}
                </strong>.
                Please renew your plan to continue using all features and enable access for your team members.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 rounded-2xl p-5 my-6">
            <h4 className="text-[11px] font-black text-amber-900 dark:text-amber-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
              <AlertCircle size={14} />
              Access Restrictions
            </h4>
            <ul className="text-xs text-amber-800 dark:text-amber-500 space-y-2 ml-1">
              <li className="flex gap-2">
                <span className="text-amber-400">•</span>
                <span>All team members are blocked from logging in</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400">•</span>
                <span>Most admin features are temporarily unavailable</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400">•</span>
                <span>Only subscription management is accessible</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400">•</span>
                <span>All data is safe and will be restored after renewal</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              onClick={handleRenewPlan}
              className="w-full h-14 bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-widest rounded-2xl gap-3 shadow-xl shadow-amber-600/20 text-sm"
            >
              <CreditCard size={20} />
              Renew Plan Now
            </Button>
            <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest opacity-70">
              Access will be restored immediately after payment
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminSubscriptionExpiredModal;
