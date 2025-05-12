import { View } from 'react-native';
import React from 'react';
import LoginView from '@/components/LoginView';

export default function LoginScreen() {
  return (
    <View style={{ flex: 1 }} accessibilityLabel="Login Screen">
      <LoginView />
    </View>
  );
}