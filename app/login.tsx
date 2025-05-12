import { View } from 'react-native';
import React from 'react';
import LoginView from '@/components/LoginView';

export default function PingTestScreen() {
  return (
    <View style={{ flex: 1 }} accessibilityLabel="Login Test Screen">
      <LoginView />
    </View>
  );
}