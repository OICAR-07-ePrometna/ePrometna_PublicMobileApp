import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { getMyVehicles, getVehicleDetails } from '@/services/vehicleService';
import { formatDate } from '@/utilities/formatDate';
import type { UserVehiclesDto } from '@/dtos/userVehiclesDto';

const VehiclesTable: React.FC = () => {
  const [vehicles, setVehicles] = useState<UserVehiclesDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.registration.toLowerCase().includes(search.toLowerCase())
  );

  const getOwnerName = (vehicle: UserVehiclesDto): string => {
    const { firstName, lastName } = vehicle.ownerDetails || {}
    return firstName && lastName ? `${firstName} ${lastName}` : '-';
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
      console.error('UUID vozila nije dostupan za pregled detalja.');
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
        <Text style={[styles.vehicleText, styles.registrationText]}>{item.registration}</Text>
        <Text style={styles.vehicleText}>{item.model}</Text>
      </View>
      <View style={styles.vehicleRow}>
        <Text style={styles.vehicleText}>{item.vehicleType}</Text>
        <Text style={styles.vehicleText}>{item.lastRegistrationDate ? formatDate(item.lastRegistrationDate) : '-'}</Text>
      </View>
      <View style={styles.vehicleRow}>
        <Text style={styles.vehicleText}>{item.category}</Text>
        <Text style={styles.vehicleText}>{getOwnerName(item)}</Text>
      </View>
      <View style={styles.vehicleRow}>
        <Text style={styles.vehicleText}>{item.validUntil ? formatDate(item.validUntil) : '-'}</Text>
        <View style={styles.spacer} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Učitavanje vozila...</Text>
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
      <View style={styles.content}>
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
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  vehicleItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  vehicleText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'left',
  },
  registrationText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  spacer: {
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    padding: 16,
  },
  noVehiclesText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    padding: 16,
  },
});

export default VehiclesTable;