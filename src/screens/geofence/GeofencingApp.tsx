// App.tsx - Main Geofencing Sample App
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import BackgroundGeolocation, {
  Location,
  Geofence,
  GeofenceEvent,
  State,
} from 'react-native-background-geolocation';
import { useNavigation } from '@react-navigation/native';

interface GeofenceLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

interface GeofenceLog {
  id: string;
  locationName: string;
  action: 'ENTER' | 'EXIT';
  timestamp: string;
}

const GeofencingApp: React.FC = () => {
   const navigate = useNavigation()
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [geofenceLocations] = useState<GeofenceLocation[]>([
    {
      id: 'home',
      name: 'Home',
      latitude: 52.54135, // San Francisco example
      longitude: -0.29997,
      radius: 200,
    },
    {
      id: 'work',
      name: 'Office',
      latitude: 52.54135,
      longitude: -0.29997,
      radius: 150,
    },
    {
      id: 'gym',
      name: 'Gym',
      latitude: 52.54135,
      longitude: -0.29997,
      radius: 100,
    },
  ]);
  const [geofenceLogs, setGeofenceLogs] = useState<GeofenceLog[]>([]);

  useEffect(() => {
    // Initialize the plugin
    initializeBackgroundGeolocation();

    return () => {
      // Clean up listeners when component unmounts
      BackgroundGeolocation.removeListeners();
    };
  }, []);

  const initializeBackgroundGeolocation = async () => {
    try {
      // Request permissions
      await requestPermissions();

      // Configure the plugin
      await BackgroundGeolocation.ready({
        // Geolocation Config
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        distanceFilter: 10,
        // Activity Recognition
        stopTimeout: 1,
        // Application config
        debug: true, // <-- enable this hear debug sounds in development
        logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
        enableHeadless: true,
        // HTTP / SQLite config
        autoSync: true,
        autoSyncThreshold: 0,
        // Geofencing config
        geofenceProximityRadius: 1000,
        geofenceInitialTriggerEntry: true,
      });

      // Set up event listeners
      setupEventListeners();

      console.log('[INFO] BackgroundGeolocation ready');
    } catch (error) {
      console.error('[ERROR] BackgroundGeolocation error:', error);
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      ]);

      if (
        granted['android.permission.ACCESS_FINE_LOCATION'] !==
          PermissionsAndroid.RESULTS.GRANTED ||
        granted['android.permission.ACCESS_BACKGROUND_LOCATION'] !==
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        Alert.alert(
          'Permission Required',
          'Location permissions are required for geofencing to work properly.',
        );
      }
    }
  };

  const setupEventListeners = () => {
    // Listen to location events
    BackgroundGeolocation.onLocation(
      (location: Location) => {
        console.log('[INFO] Location event:', location);
        setCurrentLocation(location);
      },
      (error) => {
        console.error('[ERROR] Location error:', error);
      }
    );

    // Listen to geofence events
    BackgroundGeolocation.onGeofence((geofenceEvent: GeofenceEvent) => {
      console.log('[INFO] Geofence event:', geofenceEvent);
      
      const locationName = geofenceLocations.find(
        loc => loc.id === geofenceEvent.identifier
      )?.name || geofenceEvent.identifier;

      const logEntry: GeofenceLog = {
        id: `${Date.now()}-${geofenceEvent.identifier}`,
        locationName,
        action: geofenceEvent.action as 'ENTER' | 'EXIT',
        timestamp: new Date().toLocaleString(),
      };

      setGeofenceLogs(prev => [logEntry, ...prev.slice(0, 19)]); // Keep last 20 logs

      // Show alert for geofence events
      Alert.alert(
        'Geofence Alert',
        `You ${geofenceEvent.action.toLowerCase()}ed ${locationName}`,
        [{ text: 'OK' }]
      );
    });

    // Listen to state changes
    BackgroundGeolocation.onProviderChange((provider) => {
      console.log('[INFO] Provider change:', provider);
    });
  };

  const toggleTracking = async () => {
    try {
      if (isEnabled) {
        await BackgroundGeolocation.stop();
        // Remove all geofences when stopping
        await BackgroundGeolocation.removeGeofences();
        setIsEnabled(false);
        console.log('[INFO] Tracking stopped');
      } else {
        // Add geofences before starting
        await addGeofences();
        await BackgroundGeolocation.start();
        setIsEnabled(true);
        console.log('[INFO] Tracking started');
      }
    } catch (error) {
      console.error('[ERROR] Toggle tracking error:', error);
      Alert.alert('Error', 'Failed to toggle tracking');
    }
  };

  const addGeofences = async () => {
    try {
      for (const location of geofenceLocations) {
        const geofence: Geofence = {
          identifier: location.id,
          radius: location.radius,
          latitude: location.latitude,
          longitude: location.longitude,
          notifyOnEntry: true,
          notifyOnExit: true,
          notifyOnDwell: false,
          loiteringDelay: 30000, // 30 seconds
        };

        await BackgroundGeolocation.addGeofence(geofence);
        console.log(`[INFO] Added geofence: ${location.name}`);
      }
    } catch (error) {
      console.error('[ERROR] Add geofences error:', error);
      Alert.alert('Error', 'Failed to add geofences');
    }
  };

  const getCurrentPosition = async () => {
    try {
      const location = await BackgroundGeolocation.getCurrentPosition({
        timeout: 30,
        persist: true,
        samples: 3,
        desiredAccuracy: 10,
      });
      setCurrentLocation(location);
      Alert.alert(
        'Current Location',
        `Lat: ${location.coords.latitude.toFixed(6)}\nLng: ${location.coords.longitude.toFixed(6)}`
      );
    } catch (error) {
      console.error('[ERROR] Get current position error:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const clearLogs = () => {
    setGeofenceLogs([]);
  };

  const renderGeofenceLocation = ({ item }: { item: GeofenceLocation }) => (
    <View style={styles.locationCard}>
      <Text style={styles.locationName}>{item.name}</Text>
      <Text style={styles.locationDetails}>
        Lat: {item.latitude.toFixed(6)}
      </Text>
      <Text style={styles.locationDetails}>
        Lng: {item.longitude.toFixed(6)}
      </Text>
      <Text style={styles.locationDetails}>
        Radius: {item.radius}m
      </Text>
    </View>
  );

  const renderGeofenceLog = ({ item }: { item: GeofenceLog }) => (
    <View style={[
      styles.logCard,
      item.action === 'ENTER' ? styles.enterLog : styles.exitLog
    ]}>
      <Text style={styles.logAction}>{item.action}</Text>
      <Text style={styles.logLocation}>{item.locationName}</Text>
      <Text style={styles.logTime}>{item.timestamp}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        
        <Text style={styles.title}>Geofencing Demo</Text>
        <Text style={styles.subtitle}>
          Status: {isEnabled ? 'Tracking' : 'Stopped'}
        </Text>
         <TouchableOpacity style={styles.button} onPress={() => navigate.goBack()}>
          <Text style={styles.title}>Go Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, isEnabled ? styles.stopButton : styles.startButton]}
          onPress={toggleTracking}
        >
          <Text style={styles.buttonText}>
            {isEnabled ? 'Stop Tracking' : 'Start Tracking'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={getCurrentPosition}>
          <Text style={styles.buttonText}>Get Current Location</Text>
        </TouchableOpacity>
      </View>

      {currentLocation && (
        <View style={styles.locationInfo}>
          <Text style={styles.sectionTitle}>Current Location</Text>
          <Text>Lat: {currentLocation.coords.latitude.toFixed(6)}</Text>
          <Text>Lng: {currentLocation.coords.longitude.toFixed(6)}</Text>
          <Text>Accuracy: {currentLocation.coords.accuracy.toFixed(1)}m</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Geofence Locations</Text>
        <FlatList
          data={geofenceLocations}
          keyExtractor={(item) => item.id}
          renderItem={renderGeofenceLocation}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.logHeader}>
          <Text style={styles.sectionTitle}>Geofence Events</Text>
          {geofenceLogs.length > 0 && (
            <TouchableOpacity onPress={clearLogs}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          data={geofenceLogs}
          keyExtractor={(item) => item.id}
          renderItem={renderGeofenceLog}
          style={styles.logList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No geofence events yet. Start tracking and move near a geofenced location.
            </Text>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  locationInfo: {
    backgroundColor: 'white',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  section: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  locationCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginRight: 15,
    minWidth: 150,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  locationDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clearText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  logList: {
    flex: 1,
  },
  logCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
  },
  enterLog: {
    borderLeftColor: '#4CAF50',
  },
  exitLog: {
    borderLeftColor: '#f44336',
  },
  logAction: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  logLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  logTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 20,
  },
});

export default GeofencingApp;