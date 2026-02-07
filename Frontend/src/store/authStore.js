import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import mockUsers from '../data/mockUsers.json';
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
                const { role, token } = get();
                if (!token) return;

                try {
                    let response;
                    if (role === 'superadmin' || role === 'super_admin') {
                        response = await apiRequest('/superadmin/me');
                    } else {
                        response = await apiRequest('/auth/me');
                    }

                    if (response.success) {
                        const rawRole = response.data.role || response.user.role;
                        // Helper to keep role consistent
                        let normalizedRole = rawRole;
                        if (rawRole === 'super_admin') normalizedRole = 'superadmin';
                        if (rawRole === 'sales_executive') normalizedRole = 'sales';

                        // If role changed (e.g. from super_admin to superadmin), update it
                        set({
                            user: response.data || response.user,
                            role: normalizedRole
                        });
                    }
                } catch (err) {
                    console.error('Failed to fetch user profile:', err);
                }
            },

            logout: () => {
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
                    if (role === 'superadmin') {
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
                    if (role === 'superadmin') {
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

            clearError: () => set({ error: null }),
        }),
        {
            name: 'dintask-auth-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);

export default useAuthStore;
