import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/shared/components/ui/sonner';
import AppRouter from './router/AppRouter';
import useAuthStore from './store/authStore';
import useSubscriptionMonitor from './hooks/useSubscriptionMonitor';
import SubscriptionExpiredModal from './shared/components/SubscriptionExpiredModal';
import './index.css';

function App() {
  const { isAuthenticated, fetchProfile } = useAuthStore();
  const { showExpiredModal, handleLogout } = useSubscriptionMonitor();

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

        {/* Subscription Expiry Modal for Team Members */}
        <SubscriptionExpiredModal
          isOpen={showExpiredModal}
          onLogout={handleLogout}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
