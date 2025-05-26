import { View } from 'react-native';
import React from 'react';
import VehiclesTable from '@/components/vehicleData/VehiclesTable';

export default function UserDetailsScreen() {
  return (
    <View style={{ flex: 1 }} accessibilityLabel="Vehicles Table Screen">
      <VehiclesTable />
    </View>
  );
}