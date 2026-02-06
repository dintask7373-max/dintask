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
                        set({
                            user: response.user,
                            role: response.user.role || selectedRole,
                            token: response.token,
                            isAuthenticated: true,
                            loading: false,
                        });
                        return true;
                    } else {
                        throw new Error(response.error || 'Login failed');
                    }
                } catch (err) {
                    set({
                        loading: false,
                        error: err.message || 'Login failed',
                    });
                    return false;
                }
            },

            fetchProfile: async () => {
                const { role, token } = get();
                if (!token) return;

                try {
                    let response;
                    if (role === 'superadmin') {
                        response = await apiRequest('/superadmin/me');
                    } else {
                        response = await apiRequest('/auth/me');
                    }

                    if (response.success) {
                        set({ user: response.data || response.user });
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
                    if (role === 'superadmin') {
                        // Handle form data if it contains a file
                        let body = updatedData;
                        let headers = {};

                        if (updatedData instanceof FormData) {
                            // Fetch will handle Content-Type for FormData
                        }

                        const response = await apiRequest('/superadmin/updateprofile', {
                            method: 'PUT',
                            body
                        });

                        if (response.success) {
                            set({ user: response.data, loading: false });
                            return true;
                        }
                    }

                    // Mock for others
                    await new Promise((resolve) => setTimeout(resolve, 800));
                    set((state) => ({
                        user: { ...state.user, ...updatedData },
                        loading: false
                    }));
                    return true;
                } catch (err) {
                    set({ loading: false, error: err.message });
                    return false;
                }
            },

            changePassword: async (currentPassword, newPassword) => {
                set({ loading: true });
                const { role } = get();

                try {
                    if (role === 'superadmin') {
                        const response = await apiRequest('/superadmin/changepassword', {
                            method: 'PUT',
                            body: { currentPassword, newPassword }
                        });

                        if (response.success) {
                            set({ loading: false });
                            return true;
                        }
                    }

                    // Mock for others
                    await new Promise((resolve) => setTimeout(resolve, 800));
                    set({ loading: false });
                    return true;
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
