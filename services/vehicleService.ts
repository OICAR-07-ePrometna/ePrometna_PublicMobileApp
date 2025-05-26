import apiClient from './axios';
import type { VehicleDto } from '../dtos/vehicleDto';
import type { VehicleDetailsDto } from '../dtos/vehicleDetailsDto';
import type { vehicleDetails } from '../models/vehicleDataModels';

const SERVICE = "vehicle";

export async function getMyVehicles(): Promise<VehicleDto[]> {
  try {
    const response = await apiClient.get(`/vehicle/`);
    console.log('Vehicles response:', response.status, response.data);
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
    console.log('Vehicle details response:', response.status, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching vehicle details for ${uuid}:`, {
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

export async function getVehicleByVin(vin: string): Promise<VehicleDetailsDto> {
  try {
    const response = await apiClient.get(`/vehicle/vin/${vin}`);
    console.log('Vehicle by VIN response:', response.status, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching vehicle details for VIN ${vin}:`, {
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

export async function getVehicle(guid: string): Promise<vehicleDetails | undefined> {
  try {
    const response = await apiClient.get(`/${SERVICE}/${guid}`);
    console.log('Vehicle response:', response.status, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching vehicle for GUID ${guid}:`, {
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