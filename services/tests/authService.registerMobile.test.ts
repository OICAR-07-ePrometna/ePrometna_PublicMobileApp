import { registerMobile } from '@/services/authService';
import { safeInstance } from '@/services/axios';
import { getDeviceInfo } from '@/utilities/deviceUtils';
import axios from 'axios';
import type { LoginDto } from '@/dtos/loginDto';

// Mock the safeInstance
jest.mock('@/services/axios', () => ({
    safeInstance: {
        post: jest.fn(),
    },
}));

// Mock axios error
jest.mock('axios', () => ({
    isAxiosError: jest.fn(),
}));

// Mock getDeviceInfo utility
jest.mock('@/utilities/deviceUtils', () => ({
    getDeviceInfo: jest.fn(),
}));

const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('registerMobile', () => {
    const mockSafeInstance = safeInstance as jest.Mocked<typeof safeInstance>;
    const mockGetDeviceInfo = getDeviceInfo as jest.MockedFunction<typeof getDeviceInfo>;

    const mockCredentials: LoginDto = {
        email: 'newuser@example.com',
        password: 'password123',
    };

    const mockDeviceInfo = {
        platform: 'ios',
        brand: 'Apple',
        modelName: 'iPhone 14',
        deviceName: 'Random iPhone',
        osName: 'iOS',
        osVersion: '17.1.0',
        deviceId: 'device-uuid-123',
        appVersion: '1.2.3',
        buildVersion: '456',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetDeviceInfo.mockResolvedValue(mockDeviceInfo);
    });

    afterAll(() => {
        mockConsoleError.mockRestore();
    });

    describe('successful mobile registration', () => {
        it('should register mobile user successfully', async () => {
            const mockResponse = {
                data: {
                    accessToken: 'mobile-access-token-123',
                    refreshToken: 'mobile-refresh-token-456',
                    deviceToken: 'mobile-device-token-789',
                },
                status: 201,
                statusText: 'Created',
            };

            mockSafeInstance.post.mockResolvedValueOnce(mockResponse);

            const result = await registerMobile(mockCredentials);

            const expectedData = {
                email: 'newuser@example.com',
                password: 'password123',
                deviceInfo: {
                    platform: 'ios',
                    brand: 'Apple',
                    modelName: 'iPhone 14',
                    deviceName: 'Random iPhone',
                    osName: 'iOS',
                    osVersion: '17.1.0',
                    deviceId: 'device-uuid-123',
                    appVersion: '1.2.3',
                    buildVersion: '456',
                },
            };

            expect(mockGetDeviceInfo).toHaveBeenCalledTimes(1);
            expect(mockSafeInstance.post).toHaveBeenCalledWith('/auth/user/register', expectedData);
            expect(mockSafeInstance.post).toHaveBeenCalledTimes(1);
            expect(result).toEqual({
                accessToken: 'mobile-access-token-123',
                refreshToken: 'mobile-refresh-token-456',
                deviceToken: 'mobile-device-token-789',
            });
        });
    });

    describe('device info integration', () => {
        it('should call getDeviceInfo and use the returned data', async () => {
            const customDeviceInfo = {
                platform: 'web',
                brand: 'Unknown',
                modelName: 'Browser',
                deviceName: 'Web Browser',
                osName: 'Windows',
                osVersion: '11',
                deviceId: 'web-device-id',
                appVersion: '2.0.0',
                buildVersion: '999',
            };

            mockGetDeviceInfo.mockResolvedValueOnce(customDeviceInfo);

            const mockResponse = {
                data: {
                    accessToken: 'token',
                    refreshToken: 'refresh',
                    deviceToken: 'device',
                },
                status: 201,
            };

            mockSafeInstance.post.mockResolvedValueOnce(mockResponse);

            await registerMobile(mockCredentials);

            expect(mockGetDeviceInfo).toHaveBeenCalledTimes(1);
            expect(mockSafeInstance.post).toHaveBeenCalledWith('/auth/user/register', {
                email: 'newuser@example.com',
                password: 'password123',
                deviceInfo: customDeviceInfo,
            });
        });

        it('should handle getDeviceInfo throwing an error', async () => {
            const deviceError = new Error('Failed to get device info');
            mockGetDeviceInfo.mockRejectedValueOnce(deviceError);

            await expect(registerMobile(mockCredentials)).rejects.toThrow('Neočekivana greška prilikom registracije uređaja');

            expect(mockConsoleError).toHaveBeenCalledWith('Neočekivana greška prilikom registracije uređaja', deviceError);
            expect(mockSafeInstance.post).not.toHaveBeenCalled();
        });
    });
})