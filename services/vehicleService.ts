import apiClient from './axios';
import type { VehicleDto } from '../dtos/vehicleDto';
import type { VehicleDetailsDto } from '../dtos/vehicleDetailsDto';

const SERVICE = "vehicle";

export async function getMyVehicles(): Promise<VehicleDto[]> {
  try {
    const response = await apiClient.get(`/vehicle/`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user vehicles:', {
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

export async function getVehicleDetails(uuid: string): Promise<VehicleDetailsDto> {
  try {
    const response = await apiClient.get(`/vehicle/${uuid}`);
    return response.data;
  } catch (error: any) {
    console.error(`Greška prilikom dohvaćanja podataka za vozilo - ${uuid}:`, {
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