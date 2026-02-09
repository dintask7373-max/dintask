import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

/**
 * Admin Subscription Protected Route
 * Redirects admins with expired subscriptions to the Subscription page
 * Allows access only to subscription-related pages when expired
 */
const AdminSubscriptionProtectedRoute = ({ children }) => {
  const { user, role } = useAuthStore();

  // Only applies to admins
  if (role !== 'admin') {
    return children;
  }

  // Check if admin subscription has expired
  const now = new Date();
  const expiryDate = user?.subscriptionExpiry ? new Date(user.subscriptionExpiry) : null;
  const subscriptionExpired = expiryDate && expiryDate < now;

  // If subscription expired, redirect to subscription page
  if (subscriptionExpired) {
    const currentPath = window.location.pathname;

    // Allow access only to subscription page when expired
    const allowedPaths = ['/admin/subscription'];

    if (!allowedPaths.includes(currentPath)) {
      return <Navigate to="/admin/subscription" replace />;
    }
  }

  return children;
};

export default AdminSubscriptionProtectedRoute;
