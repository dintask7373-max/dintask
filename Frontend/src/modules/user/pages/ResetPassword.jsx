import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Shield, Lock, CheckCircle2, AlertCircle, Terminal, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import useAuthStore from '@/store/authStore';

const ResetPassword = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || '';
  const navigate = useNavigate();
  const { resetPassword, loading, error, clearError } = useAuthStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleReset = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Security token must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Identity key mismatch');
      return;
    }

    const result = await resetPassword(token, role, password);
    if (result.success) {
      setIsSuccess(true);
      toast.success('Security protocol updated successfully');
    }
  };

  const getLoginPath = () => {
    switch (role) {
      case 'superadmin':
      case 'superadmin_staff': return '/superadmin/login';
      case 'admin': return '/admin/login';
      case 'manager': return '/manager/login';
      case 'sales': return '/sales/login';
      default: return '/employee/login';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-xl mb-4 border border-slate-100 dark:border-slate-800">
            <img src="/dintask-logo.png" alt="DinTask" className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Security Over-ride
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm uppercase tracking-widest font-bold">
            {isSuccess ? 'Access Restored' : 'Establishing New Encryption Key'}
          </p>
        </div>

        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
          <CardContent className="pt-10 pb-10 px-8">
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.form
                  key="reset-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleReset}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">New Identity Key</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Confirm Identity Key</Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-sm font-black bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-primary-900/20 transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Updating Protocols...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <KeyRound size={18} />
                        Apply New Key
                      </div>
                    )}
                  </Button>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <Terminal className="text-primary-500 size-4" />
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none">
                      Encryption Strength: AES-256 Validated
                    </p>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="success-view"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6"
                >
                  <div className="flex justify-center">
                    <div className="size-20 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-bounce shadow-lg shadow-emerald-500/10">
                      <CheckCircle2 size={40} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Sync Complete</h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 italic leading-relaxed mt-2">
                      Identity verification successful. Your master access key has been updated across the network.
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate(getLoginPath())}
                    className="w-full h-12 text-sm font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-900/20"
                  >
                    Return to Secure Terminal
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
          &copy; 2026 DinTask Auth Node • DT-SEC-77
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
