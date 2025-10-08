import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { geofencingSingleton } from '../../types/geofencing'; // Adjust import path
import type { GeofenceEvent, ProjectGeofence, GeofencingState } from '../../types/geofencing/types'; // Adjust import path
import {useNavigation} from '@react-navigation/native';

const GeofenceTestApp = () => {
    const navigator = useNavigation();
  const [state, setState] = useState<GeofencingState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    geofences: [],
  });
  const [events, setEvents] = useState<GeofenceEvent[]>([]);
  const [insideGeofences, setInsideGeofences] = useState<string[]>([]);

  // Test geofences - PE2 5SP Peterborough coordinates
  const testGeofences: ProjectGeofence[] = [
    {
      id: "67bc2c1ebb47cab9f8a156f1",
      latitude: 52.5728,
      longitude: -0.2436,
      projectId: "67bc2bd0bb47cab9f8a156e9",
      intergatorId: "679733468f42d980183f89bd",
      siteName: "Peterborough Cathedral",
      radius: 200,
      startDate: "2025-10-03T08:00:00.000Z",
      endDate: "2025-10-03T18:00:00.000Z",
      startTime: "08:00",
      endTime: "18:00",
      activeDays: [5], // Friday
      completeAddress: "Peterborough Cathedral, Minster Precincts, Peterborough PE1 1XS, United Kingdom",
      status: "ENTER",
      userId: "67973603e0a110edbc266747",
      firstName: "bella",
      lastName: "Aghori"
    },
    {
      id: "67bc2c1ebb47cab9f8a156f2",
      latitude: 52.5744,
      longitude: -0.2427,
      projectId: "67bc2bd0bb47cab9f8a156e9",
      intergatorId: "679733468f42d980183f89bd",
      siteName: "Queensgate Shopping Centre",
      radius: 200,
      startDate: "2025-10-03T08:00:00.000Z",
      endDate: "2025-10-03T20:00:00.000Z",
      startTime: "08:00",
      endTime: "20:00",
      activeDays: [5], // Friday
      completeAddress: "Queensgate Shopping Centre, Peterborough PE1 1NT, United Kingdom",
      status: "ENTER",
      userId: "67973603e0a110edbc266747",
      firstName: "bella",
      lastName: "Aghori"
    },
    {
      id: "67bc2c1ebb47cab9f8a156f3",
      latitude: 52.5740,
      longitude: -0.2515,
      projectId: "67bc2bd0bb47cab9f8a156e9",
      intergatorId: "679733468f42d980183f89bd",
      siteName: "Peterborough Railway Station",
      radius: 200,
      startDate: "2025-10-03T06:00:00.000Z",
      endDate: "2025-10-03T23:59:00.000Z",
      startTime: "06:00",
      endTime: "23:59",
      activeDays: [5], // Friday
      completeAddress: "Station Rd, Peterborough PE1 1QL, United Kingdom",
      status: "ENTER",
      userId: "67973603e0a110edbc266747",
      firstName: "bella",
      lastName: "Aghori"
    }
  ];

useEffect(() => {
  // Subscribe to state changes
  const unsubscribeState = geofencingSingleton.addStateListener((newState: any) => {
    setState(newState);
  });

  // Subscribe to geofence events
  const unsubscribeEvents = geofencingSingleton.addEventListener((event: GeofenceEvent) => {
      console.log('📱 App received geofence event:', event);
      setEvents(prev => [event, ...prev].slice(0, 20)); // Keep last 20 events
      
      // Update inside tracking
      setInsideGeofences(geofencingSingleton.getCurrentGeofenceStates());
      
      // Show alert for demonstration
      Alert.alert(
        `Geofence ${event.transition}`,
        `Zone: ${event.id}\nTime: ${new Date(event.timestamp).toLocaleTimeString()}`,
        [{ text: 'OK' }]
      );
    });

  return () => {
    unsubscribeState();
    unsubscribeEvents();
  };
}, []);
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        const allGranted = Object.values(granted).every(
          status => status === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          Alert.alert('Permissions Required', 'Location permissions are required for geofencing to work.');
          return false;
        }
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    }

    return await geofencingSingleton.requestPermissions();
  };

  const initializeGeofencing = async () => {
    try {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        Alert.alert('Error', 'Location permissions are required');
        return;
      }

      await geofencingSingleton.initialize(true); // Enable debug mode
      Alert.alert('Success', 'Geofencing initialized!');
    } catch (error) {
      Alert.alert('Error', `Failed to initialize: ${error}`);
    }
  };

  const addTestGeofences = async () => {
    try {
      await geofencingSingleton.addProjects(testGeofences);
      Alert.alert('Success', `Added ${testGeofences.length} test geofences!`);
    } catch (error) {
      Alert.alert('Error', `Failed to add geofences: ${error}`);
    }
  };

  const clearAllGeofences = async () => {
    try {
      await geofencingSingleton.clearAllProjects();
      setEvents([]);
      setInsideGeofences([]);
      Alert.alert('Success', 'All geofences cleared!');
    } catch (error) {
      Alert.alert('Error', `Failed to clear geofences: ${error}`);
    }
  };

  const forceCheck = async () => {
    try {
      await geofencingSingleton.forceGeofenceCheck();
      setInsideGeofences(geofencingSingleton.getCurrentGeofenceStates());
      Alert.alert('Success', 'Manual geofence check completed!');
    } catch (error) {
      Alert.alert('Error', `Failed to check geofences: ${error}`);
    }
  };

  const refreshGeofences = async () => {
    try {
      await geofencingSingleton.triggerGeofenceRefresh();
      setInsideGeofences(geofencingSingleton.getCurrentGeofenceStates());
      Alert.alert('Success', 'Geofence refresh completed!');
    } catch (error) {
      Alert.alert('Error', `Failed to refresh geofences: ${error}`);
    }
  };

  const debugCurrentLocation = async () => {
    try {
      // const location = await geofencingSingleton.getCurrentPosition();
      // console.log('🌍 Current location:', location);
      
      // Alert.alert(
      //   'Current Location',
      //   `Lat: ${location.latitude.toFixed(6)}\nLng: ${location.longitude.toFixed(6)}\n\nDistance to PE2 5SP:\n${calculateDistance(
      //     location.latitude,
      //     location.longitude,
      //     52.541332,
      //     -0.299986
      //   ).toFixed(0)}m`,
      //   [{ text: 'OK' }]
      // );
    } catch (error) {
      Alert.alert('Error', `Failed to get location: ${error}`);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Geofencing Test App</Text>
      
      {/* Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <Text style={styles.statusText}>
          Initialized: {state.isInitialized ? '✅' : '❌'}
        </Text>
        <Text style={styles.statusText}>
          Loading: {state.isLoading ? '⏳' : '✅'}
        </Text>
        <Text style={styles.statusText}>
          Geofences: {state.geofences.length}
        </Text>
        <Text style={styles.statusText}>
          Currently Inside: {insideGeofences.length}
        </Text>
        {state.error && (
          <Text style={styles.errorText}>Error: {state.error}</Text>
        )}
      </View>

      {/* Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Controls</Text>
        
        <TouchableOpacity 
          style={[styles.button, !state.isInitialized && styles.buttonPrimary]} 
          onPress={initializeGeofencing}
          disabled={state.isLoading}
        >
          <Text style={styles.buttonText}>Initialize Geofencing</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.buttonSuccess]} 
          onPress={addTestGeofences}
          disabled={!state.isInitialized || state.isLoading}
        >
          <Text style={styles.buttonText}>Add Test Geofences</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.buttonInfo]} 
          onPress={debugCurrentLocation}
          disabled={!state.isInitialized}
        >
          <Text style={styles.buttonText}>Debug Current Location</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.buttonInfo]} 
          onPress={forceCheck}
          disabled={!state.isInitialized}
        >
          <Text style={styles.buttonText}>Force Manual Check</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.buttonInfo]} 
          onPress={refreshGeofences}
          disabled={!state.isInitialized}
        >
          <Text style={styles.buttonText}>Refresh Geofences</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.buttonDanger]} 
          onPress={clearAllGeofences}
          disabled={!state.isInitialized}
        >
          <Text style={styles.buttonText}>Clear All Geofences</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={()=> navigator.goBack()}
          disabled={!state.isInitialized}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>

      {/* Current Geofences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Geofences</Text>
        {state.geofences.map((geofence: { projectId: any; id: any; siteName: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; radius: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; startTime: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; endTime: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; latitude: number; longitude: number; }, index: any) => (
          <View key={`${geofence.projectId}-${geofence.id}`} style={styles.geofenceItem}>
            <Text style={styles.geofenceName}>{geofence.siteName}</Text>
            <Text style={styles.geofenceDetails}>
              Radius: {geofence.radius}m | {geofence.startTime}-{geofence.endTime}
            </Text>
            <Text style={styles.geofenceCoords}>
              {geofence.latitude.toFixed(6)}, {geofence.longitude.toFixed(6)}
            </Text>
            <Text style={[
              styles.geofenceStatus, 
              insideGeofences.includes(`${geofence.projectId}-${geofence.id}`) && styles.insideStatus
            ]}>
              {insideGeofences.includes(`${geofence.projectId}-${geofence.id}`) ? 'INSIDE' : 'OUTSIDE'}
            </Text>
          </View>
        ))}
        {state.geofences.length === 0 && (
          <Text style={styles.emptyText}>No geofences added yet</Text>
        )}
      </View>

      {/* Events Log */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Events Log ({events.length})</Text>
          <TouchableOpacity onPress={()=> {}} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
        
        {events.map((event, index) => (
          <View key={`${event.id}-${event.timestamp}-${index}`} style={styles.eventItem}>
            <View style={styles.eventHeader}>
              <Text style={[
                styles.eventTransition,
                event.transition === 'ENTER' ? styles.enterTransition : styles.exitTransition
              ]}>
                {event.transition}
              </Text>
              <Text style={styles.eventTime}>
                {new Date(event.timestamp).toLocaleTimeString()}
              </Text>
            </View>
            <Text style={styles.eventId}>{event.id}</Text>
            <Text style={styles.eventCoords}>
              {event.latitude.toFixed(6)}, {event.longitude.toFixed(6)}
            </Text>
          </View>
        ))}
        
        {events.length === 0 && (
          <Text style={styles.emptyText}>No events yet - try walking near a geofence!</Text>
        )}
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <Text style={styles.instructionText}>
          1. Update the coordinates in testGeofences to your actual location
        </Text>
        <Text style={styles.instructionText}>
          2. Initialize geofencing and add test geofences
        </Text>
        <Text style={styles.instructionText}>
          3. Walk around to test enter/exit events
        </Text>
        <Text style={styles.instructionText}>
          4. Use "Force Manual Check" if you're already inside a geofence
        </Text>
        <Text style={styles.instructionText}>
          5. Check console logs for detailed debug info
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#007bff',
  },
  buttonSuccess: {
    backgroundColor: '#28a745',
  },
  buttonInfo: {
    backgroundColor: '#17a2b8',
  },
  buttonDanger: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  geofenceItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
    marginBottom: 12,
  },
  geofenceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  geofenceDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  geofenceCoords: {
    fontSize: 12,
    color: '#999',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  geofenceStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6c757d',
    marginTop: 4,
  },
  insideStatus: {
    color: '#28a745',
  },
  eventItem: {
    borderLeftWidth: 3,
    borderLeftColor: '#17a2b8',
    paddingLeft: 12,
    marginBottom: 12,
    paddingBottom: 8,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventTransition: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  enterTransition: {
    color: '#28a745',
  },
  exitTransition: {
    color: '#dc3545',
  },
  eventTime: {
    fontSize: 12,
    color: '#999',
  },
  eventId: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  eventCoords: {
    fontSize: 12,
    color: '#999',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  clearButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
});

export default GeofenceTestApp;