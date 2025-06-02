import { createTempData } from '@/services/tempDataService'; // Adjust path as needed
import apiClient from '@/services/axios'; // Adjust path as needed

// MOCK API CLIENT
jest.mock('@/services/axios', () => ({
  post: jest.fn(),
}));

// Mock console methods to avoid cluttering test output
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
  });
});