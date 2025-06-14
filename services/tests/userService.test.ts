import { getLoggedInUser } from '@/services/userService';
import apiClient from '@/services/axios';
import { UserRole } from '@/enums/userRole';

// Mock the apiClient
jest.mock('@/services/axios', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
    },
}));

const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('getLoggedInUser', () => {
    const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        mockConsoleError.mockRestore();
    });

    describe('successful API calls', () => {
        it('should fetch logged in user data and return User object', async () => {
            const mockUser = {
                uuid: 'user-uuid-123',
                firstName: 'John',
                lastName: 'Doe',
                oib: '12345678901',
                residence: 'Zagreb',
                birthDate: '1990-01-15',
                email: 'john.doe@example.com',
                role: UserRole.Osoba,
                registeredDevice: null,
                policeToken: null
            };

            const mockResponse = {
                status: 200,
                data: mockUser,
            };

            mockApiClient.get.mockResolvedValueOnce(mockResponse);

            const result = await getLoggedInUser();

            expect(mockApiClient.get).toHaveBeenCalledWith('/user/my-data');
            expect(mockApiClient.get).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockUser);
        });
    });

    describe('error handling', () => {
        it('should handle 401 status code', async () => {
            const mockError = {
                message: 'Request failed with status code 401',
                response: {
                    status: 401,
                    statusText: 'Unauthorized',
                    data: {
                        error: 'Token expired',
                        message: 'Please log in again'
                    },
                },
                config: {
                    url: '/user/my-data',
                    baseURL: 'https://api.example.com',
                    headers: { 'Authorization': 'Bearer expired-token' },
                },
            };

            mockApiClient.get.mockRejectedValueOnce(mockError);

            await expect(getLoggedInUser()).rejects.toBe(mockError);

            expect(mockConsoleError).toHaveBeenCalledWith(
                'Greška prilikom dohvaćanja korisnika:',
                mockError
            );
        });

        it('should handle 403 status code', async () => {
            const mockError = {
                message: 'Request failed with status code 403',
                response: {
                    status: 403,
                    statusText: 'Forbidden',
                    data: {
                        error: 'Insufficient permissions',
                        message: 'Access denied'
                    },
                },
                config: {
                    url: '/user/my-data',
                },
            };

            mockApiClient.get.mockRejectedValueOnce(mockError);

            await expect(getLoggedInUser()).rejects.toBe(mockError);

            expect(mockConsoleError).toHaveBeenCalledWith(
                'Greška prilikom dohvaćanja korisnika:',
                mockError
            );
        });

        it('should handle 404 status code', async () => {
            const mockError = {
                message: 'Request failed with status code 404',
                response: {
                    status: 404,
                    statusText: 'Not Found',
                    data: {
                        error: 'User not found',
                        message: 'The requested user does not exist'
                    },
                },
                config: {
                    url: '/user/my-data',
                    baseURL: 'https://api.example.com',
                },
            };

            mockApiClient.get.mockRejectedValueOnce(mockError);

            await expect(getLoggedInUser()).rejects.toBe(mockError);

            expect(mockConsoleError).toHaveBeenCalledWith(
                'Greška prilikom dohvaćanja korisnika:',
                mockError
            );
        });

        it('should handle 500 status code', async () => {
            const mockError = {
                message: 'Request failed with status code 500',
                response: {
                    status: 500,
                    statusText: 'Internal Server Error',
                    data: {
                        error: 'Database error',
                        message: 'Unable to retrieve user data'
                    },
                },
                config: {
                    url: '/user/my-data',
                    baseURL: 'https://api.example.com',
                },
            };

            mockApiClient.get.mockRejectedValueOnce(mockError);

            await expect(getLoggedInUser()).rejects.toBe(mockError);

            expect(mockConsoleError).toHaveBeenCalledWith(
                'Greška prilikom dohvaćanja korisnika:',
                mockError
            );
        });
    });
});