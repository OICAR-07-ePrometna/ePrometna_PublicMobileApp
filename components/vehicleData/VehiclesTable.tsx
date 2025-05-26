import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getMyVehicles, getVehicleDetails } from '@/services/vehicleService';
import type { UserVehiclesDto } from '@/dtos/userVehiclesDto';

const VehiclesTable: React.FC = () => {
  const [vehicles, setVehicles] = useState<UserVehiclesDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filteredVehicles = useMemo(() => {
    if (!search) return vehicles;
    
    const searchTerm = search.toLowerCase();
    return vehicles.filter(vehicle => 
      vehicle.registration.toLowerCase().includes(searchTerm)
    );
  }, [vehicles, search]);

  const getOwnerName = (vehicle: UserVehiclesDto): string => {
    if (!vehicle.ownerDetails || !vehicle.ownerDetails.firstName || !vehicle.ownerDetails.lastName) {
      return '-';
    }

    const firstName = vehicle.ownerDetails.firstName || '';
    const lastName = vehicle.ownerDetails.lastName || '';

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else {
      return '-';
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    return dateString;
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const fetchedVehicles = await getMyVehicles();

      const userVehicles: UserVehiclesDto[] = [];

      for (const vehicle of fetchedVehicles) {
        try {
          const vehicleDetails = await getVehicleDetails(vehicle.uuid);
          userVehicles.push({
            ...vehicle,
            // Placeholderi za reg
            lastRegistrationDate: '01-01-2025',
            category: 'B',
            validUntil: '01-01-2026',
            ownerDetails: vehicleDetails.owner
          });
        } catch (err) {
          console.error(`Error fetching details for vehicle ${vehicle.uuid}:`, err);
        }
      }
      
      console.log('Fetched vehicles:', userVehicles);
      setVehicles(userVehicles);
    } catch (err) {
      setError('Failed to load vehicles. Please try again later.');
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewVehicleDetails = (uuid: string) => {
    if (uuid) {
      router.push({
        pathname: '/vehicleSummary',
        params: { uuid }
      });
    } else {
      console.error('No UUID provided for vehicle details');
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const renderVehicleItem = ({ item }: { item: UserVehiclesDto }) => (
    <TouchableOpacity
      style={styles.vehicleItem}
      onPress={() => viewVehicleDetails(item.uuid)}
    >
      <View style={styles.vehicleRow}>
        <Text style={styles.vehicleText}>{item.registration}</Text>
        <Text style={styles.vehicleText}>{item.model}</Text>
      </View>
      <View style={styles.vehicleRow}>
        <Text style={styles.vehicleText}>{item.vehicleType}</Text>
        <Text style={styles.vehicleText}>{formatDate(item.lastRegistrationDate ?? null)}</Text>
      </View>
      <View style={styles.vehicleRow}>
        <Text style={styles.vehicleText}>{item.category}</Text>
        <Text style={styles.vehicleText}>{getOwnerName(item)}</Text>
      </View>
      <View style={styles.vehicleRow}>
        <Text style={styles.vehicleText}>{formatDate(item.validUntil ?? null)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading vehicles...</Text>
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
      <Text style={styles.title}>Vozila</Text>
      
      <TextInput
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
        placeholder="Pretraži po registraciji"
        placeholderTextColor="#666"
      />

      {vehicles.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.noVehiclesText}>
            Trenutno niste vlasnik ili povlašteni korisnik nijednog vozila.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredVehicles}
          keyExtractor={(item) => item.uuid}
          renderItem={renderVehicleItem}
          style={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  vehicleItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  vehicleText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
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
  },
  noVehiclesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 16,
  },
});

export default VehiclesTable;