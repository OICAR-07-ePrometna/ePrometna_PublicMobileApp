import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { getVehicleDetails } from '@/services/vehicleService';
import type { VehicleDetailsDto } from '@/dtos/vehicleDetailsDto';
import type { VehicleSummary } from '@/models/vehicleDataModels';

type RouteParams = {
  VehicleDetails: {
    uuid: string;
  };
};

interface VehiclesSummaryScreenProps {
  data?: VehicleSummary;
  variant?: "display" | "edit" | "create";
  uuid?: string;
  onDataUpdate?: (value: VehicleSummary) => void;
}

const VehiclesSummary: React.FC<VehiclesSummaryScreenProps> = ({
  data,
  variant = "display",
  uuid: propUuid,
  onDataUpdate,
}) => {
  const route = useRoute<RouteProp<RouteParams, 'VehicleDetails'>>();
  const vehicleUuid = propUuid || route.params?.uuid;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<VehicleDetailsDto>({} as VehicleDetailsDto);
  const [summary, setSummary] = useState<VehicleSummary>(data || {} as VehicleSummary);

  const isReadonly = variant === "display";

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    return dateString;
  };

  const mapVehicleSummaryToFields = (vehicleData: VehicleDetailsDto) => {
    if (!vehicleData.summary) return;

    const vehicleSummary = vehicleData.summary;

    setSummary({
      ...vehicleSummary,
      dateFirstRegistration: formatDate(vehicleSummary.dateFirstRegistration),
      firstRegistrationInCroatia: formatDate(vehicleSummary.firstRegistrationInCroatia),
    });
  };

  const fetchVehicleDetails = async () => {
    if (!vehicleUuid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const vehicleDetails = await getVehicleDetails(vehicleUuid);
      console.log('Vehicle details:', vehicleDetails);

      setVehicle(vehicleDetails);
      mapVehicleSummaryToFields(vehicleDetails);
    } catch (err) {
      setError('Failed to load vehicle details. Please try again later.');
      console.error('Error fetching vehicle details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data) {
      setSummary(data);
      setLoading(false);
    } else {
      fetchVehicleDetails();
    }
  }, [data, vehicleUuid]);

  const handleInputChange = (field: keyof VehicleSummary, value: string) => {
    const updatedSummary = { ...summary, [field]: value };
    setSummary(updatedSummary);
    onDataUpdate?.(updatedSummary);
  };

  const renderTextField = (
    label: string,
    field: keyof VehicleSummary,
    isHalfWidth = false
  ) => (
    <View style={[styles.fieldContainer, isHalfWidth && styles.halfWidth]}>
      <Text style={styles.fieldLabel}>{label}:</Text>
      <TextInput
        style={[styles.textInput, isReadonly && styles.readonlyInput]}
        value={summary[field] || ''}
        onChangeText={(value) => handleInputChange(field, value)}
        editable={!isReadonly}
        multiline={false}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading vehicle data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Podaci o vozilu</Text>
        
        <View style={styles.formContainer}>
          {/* First Column */}
          <View style={styles.column}>
            {renderTextField('J', 'vehicleCategory')}
            {renderTextField('D.1', 'mark')}
            {renderTextField('D.2', 'homologationType')}
            {renderTextField('D.3', 'tradeName')}
            {renderTextField('E', 'chassisNumber')}
            {renderTextField('(2)', 'bodyShape')}
            {renderTextField('(3)', 'vehicleUse')}
            
            <View style={styles.row}>
              {renderTextField('B', 'dateFirstRegistration', true)}
              {renderTextField('(4)', 'firstRegistrationInCroatia', true)}
            </View>
            
            <View style={styles.row}>
              {renderTextField('F.1', 'technicallyPermissibleMaximumLadenMass', true)}
              {renderTextField('F.2', 'permissibleMaximumLadenMass', true)}
            </View>
            
            <View style={styles.row}>
              {renderTextField('G', 'unladenMass', true)}
              {renderTextField('(5)', 'permissiblePayload', true)}
            </View>
            
            {renderTextField('K', 'typeApprovalNumber')}
            
            <View style={styles.row}>
              {renderTextField('P.1', 'engineCapacity', true)}
              {renderTextField('P.2', 'enginePower', true)}
            </View>
            
            {renderTextField('P.3', 'fuelOrPowerSource')}
            
            <View style={styles.row}>
              {renderTextField('P.4', 'ratedEngineSpeed', true)}
              {renderTextField('S.1', 'numberOfSeats', true)}
            </View>
            
            {renderTextField('R', 'colourOfVehicle')}
            
            <View style={styles.row}>
              {renderTextField('(6)', 'length', true)}
              {renderTextField('(7)', 'width', true)}
            </View>
            
            <View style={styles.row}>
              {renderTextField('(8)', 'height', true)}
              {renderTextField('T', 'maximumNetPower', true)}
            </View>
            
            <View style={styles.row}>
              {renderTextField('L', 'numberOfAxles', true)}
              {renderTextField('(9)', 'numberOfDrivenAxles', true)}
            </View>
            
            {renderTextField('(13)', 'mb')}
          </View>
          
          {/* Second Column */}
          <View style={styles.column}>
            {renderTextField('U.1', 'stationaryNoiseLevel')}
            {renderTextField('U.2', 'engineSpeedForStationaryNoiseTest')}
            {renderTextField('V.7', 'co2Emissions')}
            {renderTextField('V.9', 'ecCategory')}
            {renderTextField('(11)', 'tireSize')}
            {renderTextField('(12)', 'uniqueModelCode')}
            {renderTextField('(14)', 'model')}
            {renderTextField('(15)', 'additionalTireSizes')}
            {renderTextField('(16)', 'vehicleType')}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formContainer: {
    flex: 1,
  },
  column: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fieldContainer: {
    marginBottom: 12,
  },
  halfWidth: {
    flex: 1,
    marginHorizontal: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    minHeight: 40,
  },
  readonlyInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 4,
    margin: 16,
  },
});

export default VehiclesSummary;