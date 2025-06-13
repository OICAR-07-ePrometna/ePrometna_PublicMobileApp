import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useAuthStore } from '@/stores/authStore';
import { getMyVehicles, getVehicleDetails } from '@/services/vehicleService';
import { createTempData } from '@/services/tempDataService';
import type { VehicleDto } from '@/dtos/vehicleDto';
import { styles } from '@/styles/generateQrCode';

type ScreenState = 'loading' | 'vehicleSelection' | 'qrGenerated' | 'error';

const CreateQrCode: React.FC = () => {
  const [screenState, setScreenState] = useState<ScreenState>('loading');
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleDto | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [qrGeneratedAt, setQrGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrSize, setQrSize] = useState(200);

  const filterVehicles = (query: string) => {
    if (!query.trim()) {
      setFilteredVehicles(vehicles);
      return;
    }

    const filtered = vehicles.filter(vehicle => {
      const registration = vehicle.registration?.toLowerCase() || '';
      const model = vehicle.model?.toLowerCase() || '';
      const vehicleType = vehicle.vehicleType?.toLowerCase() || '';
      const searchTerm = query.toLowerCase().trim();

      return registration.includes(searchTerm) || 
             model.includes(searchTerm) || 
             vehicleType.includes(searchTerm);
    });

    setFilteredVehicles(filtered);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    filterVehicles(text);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredVehicles(vehicles);
  };

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      if (!(await useAuthStore.getState().isAuthenticated())) {
        throw new Error('User is not authenticated');
      }

      // Fetch vehicles
      const userVehicles = await getMyVehicles();
      
      if (userVehicles.length === 0) {
        setError('Nemate registrirana vozila');
        setScreenState('error');
        return;
      }

      setVehicles(userVehicles);
      setFilteredVehicles(userVehicles);
      setScreenState('vehicleSelection');
    } catch (err: any) {
      console.error('Error loading vehicles:', err);
      setError(err.message || 'Failed to load vehicles');
      setScreenState('error');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCodeForVehicle = async (vehicle: VehicleDto) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedVehicle(vehicle);
      
      // createTempData returns only the UUID string
      const tempDataUuid = await createTempData(vehicle.uuid);
      const generatedAt = new Date().toISOString();

      setQrData(tempDataUuid);
      setQrGeneratedAt(generatedAt);
      setScreenState('qrGenerated');
      console.log('QR Code generated for vehicle:', vehicle.uuid, 'UUID:', tempDataUuid);
    } catch (err: any) {
      console.error('Error generating QR code:', err);
      setError(err.message || 'Failed to generate QR code');
      setScreenState('error');
    } finally {
      setLoading(false);
    }
  };

  const resetToVehicleSelection = () => {
    setScreenState('vehicleSelection');
    setSelectedVehicle(null);
    setQrData(null);
    setQrGeneratedAt(null);
    setError(null);
  };

  const getVehicleDisplayName = (vehicle: VehicleDto): string => {
    return vehicle.registration || `${vehicle.model} (${vehicle.uuid.substring(0, 8)})`;
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const renderVehicleItem = ({ item }: { item: VehicleDto }) => (
    <TouchableOpacity
      style={styles.vehicleItem}
      onPress={() => generateQRCodeForVehicle(item)}
      disabled={loading}
    >
      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleRegistration}>{getVehicleDisplayName(item)}</Text>
        <Text style={styles.vehicleModel}>{item.model}</Text>
        <Text style={styles.vehicleType}>{item.vehicleType}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </TouchableOpacity>
  );

  if (loading && screenState === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Učitavanje vozila...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (screenState === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="red" />
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={loadVehicles} style={styles.retryButton}>
            Pokušaj ponovno
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (screenState === 'vehicleSelection') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Odaberite vozilo</Text>
          <Text style={styles.subtitle}>Odaberite vozilo za koje želite generirati QR kod</Text>
          
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Pretraži po registraciji, modelu ili tipu..."
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholderTextColor="#999"
                autoCorrect={false}
                autoCapitalize="characters"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                  <Ionicons name="close" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
            {searchQuery.length > 0 && (
              <Text style={styles.searchResultsText}>
                {filteredVehicles.length} od {vehicles.length} vozila
              </Text>
            )}
          </View>
          
          <FlatList
            data={filteredVehicles}
            keyExtractor={(item) => item.uuid}
            renderItem={renderVehicleItem}
            style={styles.vehicleList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="car-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'Nema vozila koja odgovaraju pretraživanju' : 'Nema dostupnih vozila'}
                </Text>
                {searchQuery && (
                  <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
                    <Text style={styles.clearSearchText}>Obriši pretraživanje</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  if (screenState === 'qrGenerated' && qrData && qrGeneratedAt && selectedVehicle) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card style={styles.card}>
            <Card.Title title="E-Prometna QR Kod" titleStyle={styles.cardTitle} />
            <Card.Content>
              <View style={styles.qrContainer}>
                <Text style={styles.vehicleInfoText}>
                  {getVehicleDisplayName(selectedVehicle)}
                </Text>
                <Text style={styles.timestampText}>
                  Generirano: {new Date(qrGeneratedAt).toLocaleString('hr-HR')}
                </Text>
                <Text style={styles.timestampText}>
                  Traje do: {new Date(new Date(qrGeneratedAt).getTime() + 5 * 60 * 1000).toLocaleString('hr-HR')}
                </Text>
                
                <View style={styles.qrCodeWrapper}>
                  <QRCode
                    value={qrData}
                    size={qrSize}
                    color="black"
                    backgroundColor="white"
                    ecl="M"
                  />
                </View>

                <View style={styles.sizeControls}>
                  <Text style={styles.sizeLabel}>Veličina QR koda:</Text>
                  <View style={styles.sizeButtons}>
                    <TouchableOpacity
                      style={[styles.sizeButton, qrSize === 150 && styles.activeSizeButton]}
                      onPress={() => setQrSize(150)}
                    >
                      <Text style={[styles.sizeButtonText, qrSize === 150 && styles.activeSizeButtonText]}>
                        Mala
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.sizeButton, qrSize === 200 && styles.activeSizeButton]}
                      onPress={() => setQrSize(200)}
                    >
                      <Text style={[styles.sizeButtonText, qrSize === 200 && styles.activeSizeButtonText]}>
                        Srednja
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.sizeButton, qrSize === 250 && styles.activeSizeButton]}
                      onPress={() => setQrSize(250)}
                    >
                      <Text style={[styles.sizeButtonText, qrSize === 250 && styles.activeSizeButtonText]}>
                        Velika
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Button
                  mode="outlined"
                  onPress={resetToVehicleSelection}
                  style={styles.backButton}
                  icon="arrow-left"
                >
                  Promijeni vozilo
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
};

export default CreateQrCode;