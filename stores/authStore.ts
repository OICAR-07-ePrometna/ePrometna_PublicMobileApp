import { create } from 'zustand';
import type { User } from '@/models/user';
import { UserRole } from '@/enums/userRole';
import * as authService from '@/services/authService';
import * as userService from '@/services/userService'; // Add this import
import * as tokenUtils from '@/utilities/tokenUtils';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  deviceToken: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  userData: User | null;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string, rememberDevice: boolean) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: () => Promise<boolean>;
  getUserRole: () => UserRole | undefined;
  refreshUserData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  deviceToken: null,
  accessToken: null,
  refreshToken: null,
  userData: null,
  loading: false,
  error: null,

  login: async (email: string, password: string, rememberDevice: boolean) => {
    set({ loading: true, error: null });
    try {
      const { accessToken, refreshToken, deviceToken } = await authService.loginMobile({
        email,
        password
      });

      console.log('Login successful, received all tokens');

      if (!accessToken || !refreshToken || !deviceToken) {
        throw new Error('Invalid response from server: missing tokens');
      }

      //User info za auth
      const tokenUser = tokenUtils.getUserFromToken(deviceToken);

      if (rememberDevice) {
        await tokenUtils.storeTokens(deviceToken, accessToken, refreshToken);
      }
      set({
        deviceToken,
        accessToken,
        refreshToken,
        userData: tokenUser,
        loading: false
      });

      //fetch full user
      try {
        console.log('Fetching complete user data...');
        const userData = await userService.getLoggedInUser();

        if (userData) {
          console.log('Retrieved complete user data');

          if (rememberDevice) {
            await SecureStore.setItemAsync(tokenUtils.USER_DATA_KEY, JSON.stringify(userData));
          }

          set({ userData });
        }
      } catch (userDataError) {
        console.error('Error fetching complete user data:', userDataError);
      }
    } catch (error) {
      let errorMessage = 'Login failed';

      if (error instanceof Error) {
        console.error('Login error:', error.message);
        errorMessage = error.message;
      }

      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    try {
      await authService.logoutDevice();
      await tokenUtils.clearTokens();

      set({
        deviceToken: null,
        accessToken: null,
        refreshToken: null,
        userData: null,
        error: null
      });
    } catch (error) {
      console.error('Logout error:', error);
      set({
        deviceToken: null,
        accessToken: null,
        refreshToken: null,
        userData: null
      });
    }
  },

  isAuthenticated: async () => {
    try {
      const deviceToken = await tokenUtils.getToken(tokenUtils.DEVICE_TOKEN_KEY);
      return deviceToken !== null && deviceToken !== '';
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  getUserRole: () => {
    return get().userData?.role;
  },

  refreshUserData: async () => {
    try {
      set({ loading: true, error: null });

      if (await get().isAuthenticated()) {
        const userData = await userService.getLoggedInUser();

        if (userData) {
          set({ userData });
          await SecureStore.setItemAsync(tokenUtils.USER_DATA_KEY, JSON.stringify(userData));
        }
      }

      set({ loading: false });
    } catch (error) {
      console.error('Error refreshing user data:', error);
      set({ error: 'Failed to refresh user data', loading: false });
    }
  }
}));