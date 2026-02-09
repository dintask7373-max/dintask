import { useEffect, useState } from 'react';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';

/**
 * Hook to monitor subscription status
 * - For team members: Checks admin subscription and logs out if expired
 * - For admins: Detects own subscription expiry and restricts access
 */
const useSubscriptionMonitor = () => {
  const { role, user, logout } = useAuthStore();
  const [showTeamExpiredModal, setShowTeamExpiredModal] = useState(false);
  const [showAdminExpiredModal, setShowAdminExpiredModal] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleTeamLogout = () => {
    setShowTeamExpiredModal(false);
    logout();
    window.location.href = '/login';
  };

  const checkSubscription = async () => {
    const teamMemberRoles = ['employee', 'manager', 'sales'];

    // Team members: check if admin subscription expired
    if (teamMemberRoles.includes(role) && !isChecking) {
      try {
        setIsChecking(true);
        await api('/auth/subscription-status');
        // Subscription is active, do nothing
      } catch (error) {
        // If error indicates subscription expiry, show modal and logout
        if (error.message?.includes('subscription') || error.message?.includes('expired')) {
          setShowTeamExpiredModal(true);
        }
      } finally {
        setIsChecking(false);
      }
    }

    // Admins: check their own subscription status
    if (role === 'admin' && user) {
      const now = new Date();
      const expiryDate = user.subscriptionExpiry ? new Date(user.subscriptionExpiry) : null;

      if (expiryDate && expiryDate < now) {
        setShowAdminExpiredModal(true);
      } else {
        setShowAdminExpiredModal(false);
      }
    }
  };

  useEffect(() => {
    const teamMemberRoles = ['employee', 'manager', 'sales'];

    if (!teamMemberRoles.includes(role) && role !== 'admin') {
      return;
    }

    // Check immediately on mount
    checkSubscription();

    // For team members: check every 5 minutes
    // For admins: check every 2 minutes (more frequent)
    const interval = role === 'admin' ? 2 * 60 * 1000 : 5 * 60 * 1000;
    const checkInterval = setInterval(checkSubscription, interval);

    // Listen for subscription expired events from API
    const handleSubscriptionExpired = (event) => {
      console.log('Subscription expired event received:', event.detail);
      if (role === 'admin') {
        setShowAdminExpiredModal(true);
      } else {
        setShowTeamExpiredModal(true);
      }
    };

    window.addEventListener('subscriptionExpired', handleSubscriptionExpired);

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('subscriptionExpired', handleSubscriptionExpired);
    };
  }, [role, user]);

  return {
    showTeamExpiredModal,
    showAdminExpiredModal,
    handleTeamLogout,
    adminExpiryDate: user?.subscriptionExpiry
  };
};

export default useSubscriptionMonitor;
