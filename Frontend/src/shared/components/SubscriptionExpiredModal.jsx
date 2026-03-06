import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, LogOut } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/shared/components/ui/dialog';

const SubscriptionExpiredModal = ({ isOpen, onLogout }) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent
        className="max-w-md bg-white dark:bg-slate-900 border-red-200 dark:border-red-900"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex flex-col items-center text-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="size-16 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center"
            >
              <AlertTriangle className="text-red-600 dark:text-red-400" size={32} />
            </motion.div>
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
              Subscription Expired
            </DialogTitle>
            <DialogDescription className="text-center text-slate-600 dark:text-slate-400">
              Your organization's subscription has expired. Please contact your administrator to renew the plan and continue accessing the system.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-3 mt-4">
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-4">
            <p className="text-xs font-bold text-red-700 dark:text-red-400 text-center">
              <strong>Note:</strong> You will be logged out automatically. Please ask your administrator to renew the subscription to regain access.
            </p>
          </div>
          <Button
            onClick={onLogout}
            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl gap-2"
          >
            <LogOut size={18} />
            Logout Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionExpiredModal;
