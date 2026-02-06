import { create } from 'zustand';
import apiRequest from '../lib/api';

const useSubscriptionStore = create((set, get) => ({
  plans: [],
  billingHistory: [],
  loading: false,
  error: null,

  fetchPlans: async () => {
    set({ loading: true });
    try {
      const response = await apiRequest('/admin/plans');
      if (response.success) {
        set({ plans: response.data, loading: false });
      }
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchBillingHistory: async () => {
    set({ loading: true });
    try {
      const response = await apiRequest('/payments/history');
      if (response.success) {
        set({ billingHistory: response.data, loading: false });
      }
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createOrder: async (planId) => {
    try {
      const response = await apiRequest('/payments/create-order', {
        method: 'POST',
        body: { planId }
      });
      return response;
    } catch (err) {
      console.error('Order creation failed:', err);
      return { success: false, error: err.message };
    }
  },

  verifyPayment: async (paymentData) => {
    try {
      const response = await apiRequest('/payments/verify', {
        method: 'POST',
        body: paymentData
      });
      return response;
    } catch (err) {
      console.error('Payment verification failed:', err);
      return { success: false, error: err.message };
    }
  },

  downloadInvoice: async (paymentId, orderId) => {
    try {
      const token = sessionStorage.getItem('dintask-auth-storage')
        ? JSON.parse(sessionStorage.getItem('dintask-auth-storage')).state.token
        : null;

      const response = await fetch(`http://localhost:5000/api/v1/payments/invoice/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to download invoice');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Invoice download failed:', err);
      toast.error('Failed to download invoice');
    }
  }
}));

export default useSubscriptionStore;
