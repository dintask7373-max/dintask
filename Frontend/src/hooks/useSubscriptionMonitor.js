import { useEffect, useState } from 'react';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';

/**
 * Hook to monitor subscription status for team members
 * Checks subscription every 5 minutes and handles expiry
 */
const useSubscriptionMonitor = () => {
  const { role, logout } = useAuthStore();
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleLogout = () => {
    setShowExpiredModal(false);
    logout();
    window.location.href = '/login';
  };

  const checkSubscription = async () => {
    // Only check for team members
    const teamMemberRoles = ['employee', 'manager', 'sales'];
    if (!teamMemberRoles.includes(role) || isChecking) {
      return;
    }

    try {
      setIsChecking(true);
      await api('/auth/subscription-status');
      // Subscription is active, do nothing
    } catch (error) {
      // If error indicates subscription expiry, show modal
      if (error.message?.includes('subscription') || error.message?.includes('expired')) {
        setShowExpiredModal(true);
      }
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    const teamMemberRoles = ['employee', 'manager', 'sales'];

    if (!teamMemberRoles.includes(role)) {
      return;
    }

    // Check immediately on mount
    checkSubscription();

    // Check every 5 minutes
    const interval = setInterval(checkSubscription, 5 * 60 * 1000);

    // Listen for subscription expired events from API
    const handleSubscriptionExpired = (event) => {
      console.log('Subscription expired event received:', event.detail);
      setShowExpiredModal(true);
    };

    window.addEventListener('subscriptionExpired', handleSubscriptionExpired);

    return () => {
      clearInterval(interval);
      window.removeEventListener('subscriptionExpired', handleSubscriptionExpired);
    };
  }, [role]);

  return {
    showExpiredModal,
    handleLogout
  };
};

export default useSubscriptionMonitor;
