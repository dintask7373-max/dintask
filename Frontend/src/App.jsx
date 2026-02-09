import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/shared/components/ui/sonner';
import AppRouter from './router/AppRouter';
import useAuthStore from './store/authStore';
import useSubscriptionMonitor from './hooks/useSubscriptionMonitor';
import SubscriptionExpiredModal from './shared/components/SubscriptionExpiredModal';
import AdminSubscriptionExpiredModal from './shared/components/AdminSubscriptionExpiredModal';
import './index.css';

function App() {
  const { isAuthenticated, fetchProfile } = useAuthStore();
  const { showTeamExpiredModal, showAdminExpiredModal, handleTeamLogout, adminExpiryDate } = useSubscriptionMonitor();

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  return (
    <BrowserRouter>
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <AppRouter />
        <Toaster richColors position="top-right" />

        {/* Team Member: Subscription Expiry Modal (Forces Logout) */}
        <SubscriptionExpiredModal
          isOpen={showTeamExpiredModal}
          onLogout={handleTeamLogout}
        />

        {/* Admin: Subscription Expiry Modal (Restricts Access) */}
        <AdminSubscriptionExpiredModal
          isOpen={showAdminExpiredModal}
          expiryDate={adminExpiryDate}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
