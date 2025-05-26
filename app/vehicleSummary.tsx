// app/vehicleSummary.tsx
import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import VehiclesSummary from '@/components/vehicleData/VehiclesSummary';

export default function VehicleSummaryScreen() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();

  return (
    <View style={{ flex: 1 }}>
      <VehiclesSummary uuid={uuid} />
    </View>
  );
}