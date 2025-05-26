import { View } from 'react-native';
import React from 'react';
import VehiclesTable from '@/components/vehicleData/VehiclesTable';

export default function VehicleDataScreen() {
  return (
    <View style={{ flex: 1 }} accessibilityLabel="Vehicles Table Screen">
      <VehiclesTable />
    </View>
  );
}