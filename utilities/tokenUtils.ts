import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import type { TokenClaims } from '@/models/tokenClaims';
import type { User } from '@/models/user';

export const DEVICE_TOKEN_KEY = 'deviceToken';
export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const USER_DATA_KEY = 'userData';

export async function storeTokens(deviceToken: string, accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync(DEVICE_TOKEN_KEY, deviceToken);
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function getToken(key: string) {
  return SecureStore.getItemAsync(key);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(DEVICE_TOKEN_KEY);
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_DATA_KEY);
}

export function getUserFromToken(token: string): User | null {
  try {
    if (!token || typeof token !== 'string') {
      console.error('Pogrešan format tokena');
      return null;
    }
    
    const decoded = jwtDecode<TokenClaims>(token);
    
    return {
      uuid: decoded.uuid,
      email: decoded.email,
      role: decoded.role,
      firstName: '',
      lastName: '',
      oib: '',
      residence: '',
      birthDate: '',
    };
  } catch (error) {
    console.error('Neuspješno dekodiranje tokena:', error);
    return null;
  }
}