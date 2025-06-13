import { AxiosError } from 'axios';
import { getDeviceInfo } from '@/utilities/deviceUtils';
import type { LoginDto } from '@/dtos/loginDto';
import type { ApiError } from '@/models/apiErrors';
import apiClient, { safeInstance } from '@/services/axios';
import axios from 'axios';

export interface MobileLoginResponse {
  accessToken: string;
  refreshToken: string;
  deviceToken: string;
}

export interface RegularLoginResponse {
  accessToken: string;
  refreshToken: string;
}

//Prvi login + device reg
export async function registerMobile(credentials: LoginDto): Promise<MobileLoginResponse> {
  try {
    // Get device information
    const deviceInfo = await getDeviceInfo();
  
    const registerPayload = {
      email: credentials.email,
      password: credentials.password,
      deviceInfo: {
        platform: deviceInfo.platform,
        brand: deviceInfo.brand,
        modelName: deviceInfo.modelName,
        deviceName: deviceInfo.deviceName,
        osName: deviceInfo.osName,
        osVersion: deviceInfo.osVersion,
        deviceId: deviceInfo.deviceId,
        appVersion: deviceInfo.appVersion,
        buildVersion: deviceInfo.buildVersion
      }
    };
    
    const response = await safeInstance.post<MobileLoginResponse>('/auth/user/register', registerPayload);
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('Mobile registration error response:', axiosError.response?.data);
      throw new Error(axiosError.response?.data?.message || 'Mobile registration failed');
    }
    console.error('Unexpected mobile registration error:', error);
    throw new Error('An unexpected error occurred during mobile registration');
  }
}

//Regular login
export async function login(credentials: LoginDto): Promise<RegularLoginResponse> {
  try {
    const response = await safeInstance.post<RegularLoginResponse>('/auth/login', credentials);
    
    console.log('Regular login tokens:', {
      accessToken: response.data.accessToken ? '+' : '-',
      refreshToken: response.data.refreshToken ? '+' : '-'
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('Login error response:', axiosError.response?.data);
      throw new Error(axiosError.response?.data?.message || 'Login failed');
    }
    console.error('Unexpected login error:', error);
    throw new Error('An unexpected error occurred during login');
  }
}

export async function logoutDevice(): Promise<void> {
  try {
    //KORISTI SE ZA TESTIRANJE, DELETE KASNIJE
    await apiClient.post('/auth/logout-device');
  } catch (error) {
    console.error('Error during device logout:', error);
  }
}