import { AxiosError } from 'axios';
import { getDeviceInfo } from '@/utilities/deviceUtils';
import type { LoginDto } from '@/dtos/loginDto';
import type { ApiError } from '@/models/apiErrors';
import { safeInstance } from '@/services/axios';
import axios from 'axios';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  deviceToken?: string;
}

// Mobile registration with device info
export async function registerMobile(credentials: LoginDto): Promise<LoginResponse> {
  try {
    // Get device information
    const deviceInfo = await getDeviceInfo();
  
    const registerData = {
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
    
    const response = await safeInstance.post<LoginResponse>('/auth/user/register', registerData);
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Ovaj uređaj je već registriran');
    }
    console.error('Neočekivana greška prilikom registracije uređaja', error);
    throw new Error('Neočekivana greška prilikom registracije uređaja');
  }
}

export async function login(credentials: LoginDto): Promise<LoginResponse> {
  try {
    const response = await safeInstance.post<LoginResponse>('/auth/login', credentials);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('Login error response:', axiosError.response?.data);
      throw new Error(axiosError.response?.data?.message || 'Korisničko ime ili lozinka nisu ispravni');
    }
    console.error('Unexpected login error:', error);
    throw new Error('Neočekivana greška prilikom prijave');
  }
}