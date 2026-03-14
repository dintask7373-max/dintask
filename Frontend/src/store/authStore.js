import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import apiRequest from '../lib/api';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            role: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,

            login: async (email, password, selectedRole) => {
                set({ loading: true, error: null });

                try {
                    let response;
                    if (selectedRole === 'superadmin') {
                        response = await apiRequest('/superadmin/login', {
                            method: 'POST',
                            body: { adminId: email, secureKey: password }
                        });
                    } else {
                        response = await apiRequest('/auth/login', {
                            method: 'POST',
                            body: { email, password, role: selectedRole }
                        });
                    }


                    if (response.success) {
                        const rawRole = response.user.role || selectedRole;
                        // Frontend expects 'superadmin', backend might send 'super_admin'
                        // Also normalize 'sales_executive' to 'sales'
                        let normalizedRole = rawRole;
                        if (rawRole === 'super_admin') normalizedRole = 'superadmin';
                        if (rawRole === 'sales_executive') normalizedRole = 'sales';

                        console.log('[AuthStore] Login Success - Raw:', rawRole, 'Normalized:', normalizedRole);

                        set({
                            user: response.user,
                            role: normalizedRole,
                            token: response.token,
                            isAuthenticated: true,
                            loading: false,
                        });
                        return { success: true };
                    } else {
                        throw new Error(response.error || 'Login failed');
                    }
                } catch (err) {
                    const errorMessage = err.message || 'Login failed';
                    set({
                        loading: false,
                        error: errorMessage,
                    });
                    return { success: false, error: errorMessage };
                }
            },

            register: async (userData) => {
                set({ loading: true, error: null });
                try {
                    const response = await apiRequest('/auth/register', {
                        method: 'POST',
                        body: userData
                    });

                    if (response.success) {
                        set({ loading: false });
                        return response;
                    } else {
                        throw new Error(response.error || 'Registration failed');
                    }
                } catch (err) {
                    set({ loading: false, error: err.message });
                    return false;
                }
            },

            fetchProfile: async () => {
                const { role, token, logout } = get();
                if (!token) return;

                try {
                    let response;
                    if (role === 'superadmin' || role === 'super_admin' || role === 'superadmin_staff') {
                        response = await apiRequest('/superadmin/me');
                    } else {
                        response = await apiRequest('/auth/me');
                    }

                    if (response.success) {
                        const rawRole = response.data?.role || response.user?.role || role;
                        // Helper to keep role consistent
                        let normalizedRole = rawRole;
                        if (rawRole === 'super_admin') normalizedRole = 'superadmin';
                        if (rawRole === 'sales_executive') normalizedRole = 'sales';

                        set({
                            user: response.data || response.user,
                            role: normalizedRole,
                            error: null
                        });
                    } else {
                        // If response is not success (e.g. 401 handled by apiRequest throwing)
                        // but just in case it returns success: false
                        logout();
                    }
                } catch (err) {
                    console.error('Failed to fetch user profile, logging out:', err);
                    logout();
                }
            },

            logout: async () => {
                const { role } = get();

                try {
                    // Call the appropriate backend logout endpoint
                    if (role === 'superadmin' || role === 'superadmin_staff') {
                        await apiRequest('/superadmin/logout');
                    } else {
                        await apiRequest('/auth/logout');
                    }

                    // Disconnect socket on logout
                    const socketService = (await import('../services/socket')).default;
                    socketService.disconnect();
                } catch (err) {
                    console.error('Logout API failed:', err);
                }

                set({
                    user: null,
                    role: null,
                    token: null,
                    isAuthenticated: false,
                    error: null,
                });
            },

            updateProfile: async (updatedData) => {
                set({ loading: true });
                const { role } = get();

                try {
                    let response;
                    if (role === 'superadmin' || role === 'superadmin_staff') {
                        // Handle form data if it contains a file
                        const body = updatedData;
                        response = await apiRequest('/superadmin/updateprofile', {
                            method: 'PUT',
                            body
                        });
                    } else {
                        // Regular user update
                        response = await apiRequest('/auth/updatedetails', {
                            method: 'PUT',
                            body: updatedData
                        });
                    }

                    if (response && response.success) {
                        set((state) => ({
                            user: response.data || state.user,
                            loading: false
                        }));
                        return true;
                    } else {
                        throw new Error(response?.error || 'Update failed');
                    }
                } catch (err) {
                    set({ loading: false, error: err.message });
                    return false;
                }
            },

            changePassword: async (currentPassword, newPassword) => {
                set({ loading: true });
                const { role } = get();

                try {
                    let response;
                    if (role === 'superadmin' || role === 'superadmin_staff') {
                        response = await apiRequest('/superadmin/changepassword', {
                            method: 'PUT',
                            body: { currentPassword, newPassword }
                        });
                    } else {
                        response = await apiRequest('/auth/updatepassword', {
                            method: 'PUT',
                            body: { currentPassword, newPassword }
                        });
                    }

                    if (response && response.success) {
                        set({ loading: false });
                        return true;
                    } else {
                        throw new Error(response?.error || 'Password update failed');
                    }
                } catch (err) {
                    set({ loading: false, error: err.message });
                    return false;
                }
            },

            forgotPassword: async (email, role) => {
                set({ loading: true, error: null });
                try {
                    const response = await apiRequest('/auth/forgotpassword', {
                        method: 'POST',
                        body: { email, role }
                    });

                    if (response.success) {
                        set({ loading: false });
                        return { success: true };
                    } else {
                        throw new Error(response.error || 'Failed to send reset email');
                    }
                } catch (err) {
                    set({ loading: false, error: err.message });
                    return { success: false, error: err.message };
                }
            },

            resetPassword: async (token, role, password) => {
                set({ loading: true, error: null });
                try {
                    const response = await apiRequest(`/auth/resetpassword/${token}?role=${role}`, {
                        method: 'PUT',
                        body: { password }
                    });

                    if (response.success) {
                        set({ loading: false });
                        return { success: true };
                    } else {
                        throw new Error(response.error || 'Password reset failed');
                    }
                } catch (err) {
                    set({ loading: false, error: err.message });
                    return { success: false, error: err.message };
                }
            },

            sendOtp: async (phone, role) => {
                set({ loading: true, error: null });
                try {
                    const response = await apiRequest('/auth/send-otp', {
                        method: 'POST',
                        body: { phone, role }
                    });

                    if (response.success) {
                        set({ loading: false });
                        return response;
                    } else {
                        throw new Error(response.error || 'Failed to send OTP');
                    }
                } catch (err) {
                    set({ loading: false, error: err.message });
                    return { success: false, error: err.message };
                }
            },

            verifyOtp: async (phone, otp, role) => {
                set({ loading: true, error: null });
                try {
                    const response = await apiRequest('/auth/verify-otp', {
                        method: 'POST',
                        body: { phone, otp, role }
                    });

                    if (response.success) {
                        const rawRole = response.user.role || role;
                        let normalizedRole = rawRole;
                        if (rawRole === 'sales_executive') normalizedRole = 'sales';

                        set({
                            user: response.user,
                            role: normalizedRole,
                            token: response.token,
                            isAuthenticated: true,
                            loading: false,
                        });
                        return { success: true };
                    } else {
                        throw new Error(response.error || 'Invalid OTP');
                    }
                } catch (err) {
                    set({ loading: false, error: err.message });
                    return { success: false, error: err.message };
                }
            },

            checkEmail: async (email, role) => {
                try {
                    const response = await apiRequest(`/auth/check-email?email=${encodeURIComponent(email)}&role=${role || ''}`);
                    return response;
                } catch (err) {
                    console.error('Email check failed:', err);
                    return { success: false, exists: false };
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'dintask-auth-storage',
            storage: createJSONStorage(() => {
                try {
                    // Test if localStorage is available and accessible
                    const testKey = '__storage_test__';
                    localStorage.setItem(testKey, testKey);
                    localStorage.removeItem(testKey);
                    return localStorage;
                } catch (e) {
                    console.warn('LocalStorage is not available, using memory storage fallback:', e);
                    // Memory-based storage fallback for environments where localStorage is blocked
                    const memoryStorage = new Map();
                    return {
                        getItem: (name) => memoryStorage.get(name) || null,
                        setItem: (name, value) => memoryStorage.set(name, value),
                        removeItem: (name) => memoryStorage.delete(name),
                        clear: () => memoryStorage.clear(),
                    };
                }
            }),
        }
    )
);

export default useAuthStore;
