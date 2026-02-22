import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/api';
import { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: true,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.login(username, password);

      if (response.success && response.data) {
        const { user } = response.data;

        // Store user info
        await AsyncStorage.setItem('user', JSON.stringify(user));

        set({
          token: response.data.token,
          user: user,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      await apiClient.logout();
      await AsyncStorage.removeItem('user');

      set({
        token: null,
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      await AsyncStorage.removeItem('user');
      set({
        token: null,
        user: null,
        isLoading: false,
        error: null,
      });
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true });

    try {
      // Try to get stored token and user
      const token = await apiClient.getToken();
      const userStr = await AsyncStorage.getItem('user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({
          token,
          user,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
