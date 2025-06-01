import { View } from 'react-native';
import React from 'react';
import CreateQrCode from '@/components/CreateQrCode';

export default function CreateQrScreen() {
  return (
    <View style={{ flex: 1 }} accessibilityLabel="Create QR Code Screen">
      <CreateQrCode />
    </View>
  );
}