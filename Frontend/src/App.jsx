import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/shared/components/ui/sonner';
import AppRouter from './router/AppRouter';
import useAuthStore from './store/authStore';
import useSubscriptionMonitor from './hooks/useSubscriptionMonitor';
import useSocketEvents from './hooks/useSocketEvents';
import SubscriptionExpiredModal from './shared/components/SubscriptionExpiredModal';
import AdminSubscriptionExpiredModal from './shared/components/AdminSubscriptionExpiredModal';
import './index.css';

import { requestForToken, onMessageListener } from './firebase';
import { toast } from 'sonner';

function App() {
  const { isAuthenticated, fetchProfile } = useAuthStore();
  const { showTeamExpiredModal, showAdminExpiredModal, handleTeamLogout, adminExpiryDate } = useSubscriptionMonitor();

  // Initialize Socket.io and global listeners
  useSocketEvents();

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      // Setup Push Notifications
      requestForToken();
    }
  }, [isAuthenticated, fetchProfile]);

  useEffect(() => {
    const unsubscribe = onMessageListener((payload) => {
      toast(payload.notification.title, {
        description: payload.notification.body,
        action: payload.data?.link ? {
          label: 'View',
          onClick: () => window.location.href = payload.data.link
        } : null
      });
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <AppRouter />
        <Toaster richColors position="top-right" />

        {/* Subscription Modals (Only if authenticated) */}
        {isAuthenticated && (
          <>
            <SubscriptionExpiredModal
              isOpen={showTeamExpiredModal}
              onLogout={handleTeamLogout}
            />

            <AdminSubscriptionExpiredModal
              isOpen={showAdminExpiredModal}
              expiryDate={adminExpiryDate}
            />
          </>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
