import type { User } from '@/models/user';
import apiClient from '@/services/axios';

export async function getLoggedInUser(): Promise<User | undefined> {
  try {
    const response = await apiClient.get(`/user/my-data`);
    return response.data;
  } catch (error) {
    console.error('Greška prilikom dohvaćanja korisnika:', error);
    throw error;
  }
}
