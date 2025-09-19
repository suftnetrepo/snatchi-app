import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useGeofencing, useGeofenceEvents } from '../../hooks/useGeofencing';
import { GeofenceRegion, GeofenceEvent } from '../../types/geofencing/types';

const Login = () => {
  const [lastEvent, setLastEvent] = useState<GeofenceEvent | null>(null);
  const [location, setLocation] = useState<any>(null);
  const [status, setStatus] = useState<string>('Checking...');

  const {
    isInitialized,
    isLoading,
    error,
    geofences,
    initialize,
    requestPermissions,
    addGeofence,
    removeAllGeofences,
    startMonitoring,
    stopMonitoring,
    getActiveGeofences
  } = useGeofencing({
    autoInitialize: true,
    autoRestorePersisted: true
  });

  // Listen to geofence events
  useGeofenceEvents((event) => {
    console.log('🔔 Geofence event received:', event);
    setLastEvent(event);

    Alert.alert(
      'Geofence Event',
      `${event.transition} - ${event.id}`,
      [{ text: 'OK' }]
    );
  });

  // Update status based on state
  useEffect(() => {
    if (isLoading) {
      setStatus('Initializing...');
    } else if (error) {
      setStatus(`Error: ${error}`);
    } else if (isInitialized) {
      setStatus('Ready and monitoring');
    } else {
      setStatus('Not initialized');
    }
  }, [isInitialized, isLoading, error]);

  // Mock location from last geofence event
  useEffect(() => {
    if (lastEvent) {
      setLocation({
        coords: {
          latitude: lastEvent.latitude,
          longitude: lastEvent.longitude,
        },
        timestamp: new Date().getTime()
      });
    }
  }, [lastEvent]);

  const checkStatus = async () => {
    try {
      setStatus('Checking status...');

      if (!isInitialized) {
        const initialized = await initialize();
        if (!initialized) {
          setStatus('Failed to initialize');
          return;
        }
      }

      const hasPermissions = await requestPermissions();
      const activeGeofences = await getActiveGeofences();

      setStatus(
        `${hasPermissions ? 'Authorized' : 'Not Authorized'} | ` +
        `${activeGeofences.length} geofences active`
      );

      console.log('📊 Status check:', {
        initialized: isInitialized,
        hasPermissions,
        activeGeofences: activeGeofences.length,
        persistedGeofences: geofences.length
      });
    } catch (err) {
      setStatus(`Check failed: ${err}`);
    }
  };

  const addTestGeofence = async () => {
    try {
      // Generate a test geofence with random coordinates near a center point
      const centerLat = 37.7749; // San Francisco
      const centerLng = -122.4194;
      const randomOffset = () => (Math.random() - 0.5) * 0.01; // ~0.5km radius

      const testGeofence = {
        id: `test_geofence_${Date.now()}`,
        latitude: centerLat + randomOffset(),
        longitude: centerLng + randomOffset(),
        radius: 100 + Math.floor(Math.random() * 400) // 100-500m radius
      };

      console.log('➕ Adding test geofence:', testGeofence);
      const success = await addGeofence(testGeofence);

      if (success) {
        Alert.alert(
          'Success',
          `Test geofence added!\nID: ${testGeofence.id}\nRadius: ${testGeofence.radius}m`,
          [{ text: 'OK' }]
        );

        // Start monitoring if not already started
        await startMonitoring();
      } else {
        Alert.alert('Error', 'Failed to add test geofence', [{ text: 'OK' }]);
      }
    } catch (err) {
      console.error('❌ Failed to add test geofence:', err);
      Alert.alert('Error', `Failed to add geofence: ${err}`, [{ text: 'OK' }]);
    }
  };

  const handleRemoveAllGeofences = async () => {
    Alert.alert(
      'Remove All Geofences',
      'Are you sure you want to remove all geofences?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove All',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Removing all geofences...');
              const success = await removeAllGeofences();

              if (success) {
                Alert.alert('Success', 'All geofences removed', [{ text: 'OK' }]);
                await stopMonitoring();
              } else {
                Alert.alert('Error', 'Failed to remove geofences', [{ text: 'OK' }]);
              }
            } catch (err) {
              console.error('❌ Failed to remove all geofences:', err);
              Alert.alert('Error', `Failed to remove geofences: ${err}`, [{ text: 'OK' }]);
            }
          }
        }
      ]
    );
  };

  // Determine authorization status
  const isAuthorized = isInitialized && !error;
  const isEnabled = isInitialized && geofences.length > 0;
  const servicesEnabled = isInitialized; // Simplified for this test

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Geofencing Singleton Status</Text>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Module Status:</Text>
          <Text style={[styles.statusValue, isInitialized ? styles.statusSuccess : styles.statusWarning]}>
            {isLoading ? 'Initializing...' : isInitialized ? 'Ready' : 'Not Ready'}
          </Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Authorization:</Text>
          <Text style={[styles.statusValue, isAuthorized ? styles.statusSuccess : styles.statusError]}>
            {isAuthorized ? 'Granted' : 'Not Granted'}
          </Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Monitoring:</Text>
          <Text style={[styles.statusValue, isEnabled ? styles.statusSuccess : styles.statusError]}>
            {isEnabled ? 'Active' : 'Inactive'}
          </Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Current Status:</Text>
          <Text style={styles.statusValue}>{status}</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Geofences:</Text>
          <Text style={styles.statusValue}>{geofences.length} active</Text>
          {geofences.length > 0 && (
            <View style={styles.geofencesList}>
              {geofences.slice(0, 3).map((geofence, index) => (
                <Text key={index} style={styles.geofenceItem}>
                  {geofence.id} ({geofence.radius}m)
                </Text>
              ))}
              {geofences.length > 3 && (
                <Text style={styles.geofenceItem}>... and {geofences.length - 3} more</Text>
              )}
            </View>
          )}
        </View>

        {lastEvent && (
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Last Event:</Text>
            <Text style={styles.statusValue}>
              {lastEvent.transition} - {lastEvent.id}
            </Text>
            <Text style={styles.geofenceItem}>
              {new Date(lastEvent.timestamp).toLocaleString()}
            </Text>
          </View>
        )}

        {error && (
          <View style={[styles.statusCard, styles.errorCard]}>
            <Text style={styles.statusLabel}>Error:</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {location && (
          <View style={styles.locationCard}>
            <Text style={styles.locationTitle}>Last Location:</Text>
            <Text>Latitude: {location.coords.latitude.toFixed(6)}</Text>
            <Text>Longitude: {location.coords.longitude.toFixed(6)}</Text>
            <Text>Time: {new Date(location.timestamp).toLocaleTimeString()}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button title="Check Status" onPress={checkStatus} color="#4CAF50" />
          <View style={styles.buttonSpacer} />
          <Button
            title="Add Test Geofence"
            onPress={addTestGeofence}
            color="#2196F3"
            disabled={!isInitialized}
          />
          <View style={styles.buttonSpacer} />
          <Button
            title="Remove All Geofences"
            onPress={handleRemoveAllGeofences}
            color="#F44336"
            disabled={geofences.length === 0}
          />
        </View>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            Note: This uses the Singleton GeofencingModule with shared state across all components.
            Events are automatically broadcast to all listeners.
          </Text>
        </View>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Text>Initializing geofencing module...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  statusLabel: {
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 16,
  },
  statusSuccess: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statusWarning: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  statusError: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  errorCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
  },
  geofencesList: {
    marginTop: 10,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#E0E0E0',
  },
  geofenceItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  locationCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  locationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: '#2196F3',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  buttonSpacer: {
    height: 10,
  },
  note: {
    padding: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  noteText: {
    color: '#0D47A1',
    fontStyle: 'italic',
  },
  loadingOverlay: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
  },
});

export default Login;