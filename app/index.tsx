// app/index.tsx
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { 
  DEVICE_TOKEN_KEY, 
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_DATA_KEY 
} from '@/services/axios';
import { useRouter } from 'expo-router';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authStore = useAuthStore();
  const router = useRouter();

  const forceLogout = async () => {
    console.log('Force logout initiated');
    try {
      //Cisti secure store
      await SecureStore.deleteItemAsync(DEVICE_TOKEN_KEY);
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_DATA_KEY);
    
      authStore.logout();
      
      console.log('Force logout complete, redirecting to login');
      router.replace('/login');
    } catch (error) {
      console.error('Force logout error:', error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await authStore.isAuthenticated();
        console.log('isAuthenticated returned:', authenticated);
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={forceLogout}
        >
          <Text style={styles.logoutButtonText}>Force Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return isAuthenticated ? 
    <Redirect href="/(tabs)/explore" /> : 
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