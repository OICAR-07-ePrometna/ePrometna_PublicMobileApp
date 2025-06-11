import { createTempData } from '@/services/tempDataService';
import apiClient from '@/services/axios';

// MOCK API CLIENT
jest.mock('@/services/axios', () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
    },
}));

const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('createTempData', () => {
    const mockVehicleUuid = '9950a232-6d95-452e-97b6-ed68742a1dca';
    const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        mockConsoleLog.mockRestore();
        mockConsoleError.mockRestore();
    });

    describe('successful API calls', () => {
        it('should create temp data and return response data', async () => {
            const mockResponseData = '8c8eebae-9e56-44de-a5e2-01b314bd105f';
            const mockResponse = {
                status: 201,
                data: mockResponseData,
            };

            mockApiClient.post.mockResolvedValueOnce(mockResponse);

            const result = await createTempData(mockVehicleUuid);

            expect(mockApiClient.post).toHaveBeenCalledWith(`/tempdata/${mockVehicleUuid}`);
            expect(mockApiClient.post).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockResponseData);
            expect(mockConsoleLog).toHaveBeenCalledWith(
                'TempData created:',
                201,
                mockResponseData
            );
        });

        it('should handle different response status codes', async () => {
            const mockResponse = {
                status: 200,
                data: '4718d8c6-a3db-4387-b141-d9c0611dab88',
            };

            mockApiClient.post.mockResolvedValueOnce(mockResponse);

            const result = await createTempData(mockVehicleUuid);

            expect(result).toBe('4718d8c6-a3db-4387-b141-d9c0611dab88');
            expect(mockConsoleLog).toHaveBeenCalledWith(
                'TempData created:',
                200,
                '4718d8c6-a3db-4387-b141-d9c0611dab88'
            );
        });
    });

    describe('error handling', () => {
        it('should handle network errors and log detailed error info', async () => {
            const mockError = {
                message: 'Network Error',
                response: {
                    status: 500,
                    statusText: 'Internal Server Error',
                    data: { error: 'Database connection failed' },
                },
                config: {
                    url: '/tempdata/9950a232-6d95-452e-97b6-ed68742a1dca',
                    baseURL: 'https://api.example.com',
                    headers: { 'Content-Type': 'application/json' },
                },
            };

            mockApiClient.post.mockRejectedValueOnce(mockError);

            await expect(createTempData(mockVehicleUuid)).rejects.toBe(mockError);

            expect(mockConsoleError).toHaveBeenCalledWith(
                `Error creating temp data for vehicle ${mockVehicleUuid}:`,
                {
                    message: 'Network Error',
                    status: 500,
                    statusText: 'Internal Server Error',
                    data: { error: 'Database connection failed' },
                    config: {
                        url: '/tempdata/9950a232-6d95-452e-97b6-ed68742a1dca',
                        baseURL: 'https://api.example.com',
                        headers: { 'Content-Type': 'application/json' },
                    },
                }
            );
        });
    });
});