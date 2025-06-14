import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authStore = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await authStore.isAuthenticated();
        setIsAuthenticated(authenticated);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  return isAuthenticated ? 
    <Redirect href="/(tabs)/vehicleData" /> : 
    <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    padding: 12,
    borderRadius: 6,
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});