import { getLoggedInUser } from '@/services/userService';
import apiClient from '@/services/axios';

// Mock the apiClient
jest.mock('@/services/axios', () => ({
    get: jest.fn(),
    post: jest.fn(),
}));

const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('getLoggedInUser', () => {
    const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        mockConsoleLog.mockRestore();
        mockConsoleError.mockRestore();
    });

    describe('successful API calls', () => {
        it('should fetch logged in user data and return User object', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'john.doe@example.com',
                firstName: 'John',
                lastName: 'Doe',
                username: 'johndoe',
                isActive: true,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-06-01T00:00:00Z',
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
            expect(mockConsoleLog).toHaveBeenCalledWith(
                'Logged in user data:',
                mockUser
            );
        });
    });

    describe('error handling', () => {
        it('should handle 401 Unauthorized errors', async () => {
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
                'Error fetching current user:',
                mockError
            );
        });

        it('should handle 403 Forbidden errors', async () => {
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
                'Error fetching current user:',
                mockError
            );
        });

        it('should handle 404 Not Found errors', async () => {
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
                'Error fetching current user:',
                mockError
            );
        });

        it('should handle 500 Internal Server Error', async () => {
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
                'Error fetching current user:',
                mockError
            );
        });
    });
});