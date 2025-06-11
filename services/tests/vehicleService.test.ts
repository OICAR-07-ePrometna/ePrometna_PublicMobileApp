import { getMyVehicles } from '@/services/vehicleService';
import apiClient from '@/services/axios';

// MOCK API CLIENT
jest.mock('@/services/axios', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
    },
}));

const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('getMyVehicles', () => {
    const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        mockConsoleLog.mockRestore();
        mockConsoleError.mockRestore();
    });

    describe('successful API calls', () => {
        it('should fetch user vehicles and return array of VehicleDto', async () => {
            const mockVehicles = [
                {
                    id: '1',
                    make: 'Toyota',
                    model: 'Camry',
                    year: 2022,
                    licensePlate: 'ZG-1234-AA',
                    vin: 'VIN123456789',
                },
                {
                    id: '2',
                    make: 'Honda',
                    model: 'Civic',
                    year: 2021,
                    licensePlate: 'ST-4321-BB',
                    vin: 'VIN987654321',
                }
            ];

            const mockResponse = {
                status: 200,
                data: mockVehicles,
            };

            mockApiClient.get.mockResolvedValueOnce(mockResponse);

            const result = await getMyVehicles();

            expect(mockApiClient.get).toHaveBeenCalledWith('/vehicle/');
            expect(mockApiClient.get).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockVehicles);
            expect(mockConsoleLog).toHaveBeenCalledWith(
                'Vehicles response:',
                200,
                mockVehicles
            );
        });
        it('should handle single vehicle response', async () => {
            const mockVehicle = [
                {
                    id: '3',
                    make: 'Ford',
                    model: 'F-150',
                    year: 2023,
                    licensePlate: 'FORD-001',
                    vin: 'FORD123456789',
                }
            ];

            const mockResponse = {
                status: 200,
                data: mockVehicle,
            };

            mockApiClient.get.mockResolvedValueOnce(mockResponse);

            const result = await getMyVehicles();

            expect(result).toEqual(mockVehicle);
            expect(result).toHaveLength(1);
            expect(mockConsoleLog).toHaveBeenCalledWith(
                'Vehicles response:',
                200,
                mockVehicle
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
                        error: 'Invalid or expired token',
                        message: 'Authentication required'
                    },
                },
                config: {
                    url: '/vehicle/',
                    baseURL: 'https://api.example.com',
                },
            };

            mockApiClient.get.mockRejectedValueOnce(mockError);

            await expect(getMyVehicles()).rejects.toBe(mockError);

            expect(mockConsoleError).toHaveBeenCalledWith(
                'Error fetching user vehicles:',
                expect.objectContaining({
                    message: 'Request failed with status code 401',
                    status: 401,
                    statusText: 'Unauthorized',
                })
            );
        });
        it('should handle 404 Not Found errors', async () => {
            const mockError = {
                message: 'Request failed with status code 404',
                response: {
                    status: 404,
                    statusText: 'Not Found',
                    data: {
                        error: 'Vehicles not found for user',
                        message: 'No vehicles associated with this account'
                    },
                },
                config: {
                    url: '/vehicle/',
                },
            };

            mockApiClient.get.mockRejectedValueOnce(mockError);

            await expect(getMyVehicles()).rejects.toBe(mockError);

            expect(mockConsoleError).toHaveBeenCalledWith(
                'Error fetching user vehicles:',
                expect.objectContaining({
                    status: 404,
                    statusText: 'Not Found',
                })
            );
        });
    });
});