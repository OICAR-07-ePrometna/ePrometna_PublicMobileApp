import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'expo-router';

export default function LogoutTab() {
  const { logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        router.replace('/login');
      } catch (error) {
        console.error('Greška prilikom odjave:', error);
        router.replace('/login');
      }
    };
    
    const timer = setTimeout(() => {
      performLogout();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>Odjavljivanje...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
});