import { create } from 'zustand';
import type { User } from '@/models/user';
import { UserRole } from '@/enums/userRole';
import * as authService from '@/services/authService';
import * as userService from '@/services/userService';
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
  checkIfFirstTimeUser: () => Promise<boolean>;
  fetchAndStoreUserData: (deviceToken: string, rememberDevice: boolean) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  deviceToken: null,
  accessToken: null,
  refreshToken: null,
  userData: null,
  loading: false,
  error: null,

  // Check if this is a first-time user (no device token stored)
  checkIfFirstTimeUser: async () => {
    try {
      const deviceToken = await tokenUtils.getToken(tokenUtils.DEVICE_TOKEN_KEY);
      return !deviceToken; // First time if no device token exists
    } catch (error) {
      console.error('Error checking first-time user:', error);
      return true;
    }
  },

  fetchAndStoreUserData: async (deviceToken: string, rememberDevice: boolean) => {
    try {
      console.log('Fetching complete user data...');
      const userData = await userService.getLoggedInUser();

      if (userData) {
        console.log('Retrieved complete user data');

        if (rememberDevice) {
          await SecureStore.setItemAsync(tokenUtils.USER_DATA_KEY, JSON.stringify(userData));
        }
        set({ userData });
      } else {
        const tokenUser = tokenUtils.getUserFromToken(deviceToken);
        set({ userData: tokenUser });
      }
    } catch (userDataError) {
      console.error('Error fetching complete user data:', userDataError);
      const tokenUser = tokenUtils.getUserFromToken(deviceToken);
      set({ userData: tokenUser });
    }
  },

  login: async (email: string, password: string, rememberDevice: boolean) => {
    set({ loading: true, error: null });
    try {
      const isFirstTime = await get().checkIfFirstTimeUser();
      
      if (isFirstTime) {
        // First-time user - use mobile registration
        const { accessToken, refreshToken, deviceToken } = await authService.registerMobile({
          email,
          password
        });

        console.log('Mobile registration successful, received all tokens');

        if (!accessToken || !refreshToken || !deviceToken) {
          throw new Error('Invalid response from server: missing tokens');
        }

        // Store the device token and other tokens
        if (rememberDevice) {
          await tokenUtils.storeTokens(deviceToken, accessToken, refreshToken);
        }

        set({
          deviceToken,
          accessToken,
          refreshToken,
          userData: null,
          loading: false
        });

        await get().fetchAndStoreUserData(deviceToken, rememberDevice);
        
      } else {
        console.log('Returning user, using regular login...');
        
        // Returning user - use regular login
        const { accessToken, refreshToken } = await authService.login({
          email,
          password
        });

        console.log('Regular login successful, received access and refresh tokens');

        if (!accessToken || !refreshToken) {
          throw new Error('Invalid response from server: missing tokens');
        }

        // Get existing device token
        const existingDeviceToken = await tokenUtils.getToken(tokenUtils.DEVICE_TOKEN_KEY);
        
        if (!existingDeviceToken) {
          throw new Error('Device token missing for returning user');
        }

        // Store the new access and refresh tokens
        if (rememberDevice) {
          await tokenUtils.storeTokens(existingDeviceToken, accessToken, refreshToken);
        }

        set({
          deviceToken: existingDeviceToken,
          accessToken,
          refreshToken,
          userData: null,
          loading: false
        });

        await get().fetchAndStoreUserData(existingDeviceToken, rememberDevice);
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
        const deviceToken = await tokenUtils.getToken(tokenUtils.DEVICE_TOKEN_KEY);
        if (deviceToken) {
          await get().fetchAndStoreUserData(deviceToken, true);
        }
      }

      set({ loading: false });
    } catch (error) {
      console.error('Error refreshing user data:', error);
      set({ error: 'Failed to refresh user data', loading: false });
    }
  }
}));