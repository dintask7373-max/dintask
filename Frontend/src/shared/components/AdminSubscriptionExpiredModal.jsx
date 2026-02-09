import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CreditCard } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/shared/components/ui/dialog';

const AdminSubscriptionExpiredModal = ({ isOpen, expiryDate }) => {
  const navigate = useNavigate();

  const handleRenewPlan = () => {
    navigate('/admin/subscription');
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent
        className="max-w-lg bg-white dark:bg-slate-900 border-amber-200 dark:border-amet-900"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
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
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
              Subscription Expired!
            </DialogTitle>
            <DialogDescription className="text-center text-slate-600 dark:text-slate-400">
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

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 my-4">
          <h4 className="text-sm font-black text-amber-900 dark:text-amber-400 mb-2 flex items-center gap-2">
            <AlertCircle size={16} />
            Access Restrictions
          </h4>
          <ul className="text-xs text-amber-800 dark:text-amber-500 space-y-1 ml-6 list-disc">
            <li>All team members are blocked from logging in</li>
            <li>Most admin features are temporarily unavailable</li>
            <li>Only subscription management is accessible</li>
            <li>All data is safe and will be restored after renewal</li>
          </ul>
        </div>

        <DialogFooter className="flex flex-col gap-3">
          <Button
            onClick={handleRenewPlan}
            className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl gap-2 shadow-lg shadow-amber-600/20"
          >
            <CreditCard size={18} />
            Renew Plan Now
          </Button>
          <p className="text-xs text-center text-slate-400 italic">
            Your team can access the system again immediately after renewal
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminSubscriptionExpiredModal;
