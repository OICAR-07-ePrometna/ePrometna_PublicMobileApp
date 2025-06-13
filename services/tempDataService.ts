import apiClient from './axios';

export async function createTempData(vehicleUuid: string): Promise<string> {
  try {
    const response = await apiClient.post(`/tempdata/${vehicleUuid}`);
    console.log('TempData created:', response.status, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error creating temp data for vehicle ${vehicleUuid}:`, {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers,
      }
    });
    throw error;
  }
}