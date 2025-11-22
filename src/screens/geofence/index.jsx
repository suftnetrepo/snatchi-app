import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {
  StyledHeader,
  StyledSafeAreaView,
} from 'fluent-styles';
import { geofencingSingleton } from '../../types/geofencing';
import { useNavigation } from '@react-navigation/native';
import { localNotificationService } from '../../../Notification/LocalNotificationService';
import { useProjectState } from '../../hooks/useGeofencing';
import { PROJECT_KEY, clear, store } from '../../utils/asyncStorage';
import { NotificationBus } from '../../../scripts/notificationBus';
import { theme } from '../../utils/theme';

function createDynamicTestGeofence() {
  const now = new Date();

  // 🌍 Your real physical testing location (PE2 area)
  const latitude = 52.54223;
  const longitude = -0.30067;

  // 📅 Build today's date window (00:00 → 23:59 Local Time)
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 0);

  // 🗓 Convert JS Sunday=0 → our 1–7 format
  const weekdayRN = now.getDay() === 0 ? 7 : now.getDay();

  return [
    {
      id: "dynamic-test-" + now.getTime(),
      projectId: "dynamic-test-project",
      intergatorId: "test-integrator",
      siteName: "Dynamic Test Location (Today)",
      latitude,
      longitude,
      radius: 250,

      // 🔥 Always active today
      startDate: startOfDay.toISOString(),
      endDate: endOfDay.toISOString(),

      startTime: "00:00",
      endTime: "23:59",

      activeDays: [weekdayRN],   // Only today — guaranteed match

      completeAddress: "Test Location, Orton Waterville, Peterborough PE2 5SP, UK",
      status: "Pending",
      userId: "test-user",
      firstName: "Test",
      lastName: "User",
    }
  ];
}

const GeofenceTestApp = () => {
  const navigator = useNavigation();
  const [events, setEvents] = useState([]);
  const { isInitialized, geofences, error, isLoading } = useProjectState();

  const handleGeofenceEvent = useCallback((payload) => {
    console.log("📡 Received geofence event:", payload);

    setEvents(prev => {
      if (prev.length > 0 && prev[0].id === payload.event.id && prev[0].transition === payload.type) {
        return prev;
      }

      return [
        {
          ...payload.event,
          transition: payload.type,
        },
        ...prev,
      ];
    });
  }, []);

  useEffect(() => {
    const listener = NotificationBus.on('GEOFENCE_EVENT', handleGeofenceEvent);
    return () => listener.remove();
  }, [handleGeofenceEvent]);

  const addTestGeofences = async () => {
    const testGeofences = createDynamicTestGeofence();
    try {
      await geofencingSingleton.clearAllProjects();
      await clear(PROJECT_KEY);
      await store(PROJECT_KEY, testGeofences);
      await geofencingSingleton.addProjects(testGeofences);
      Alert.alert('Success', `Added ${testGeofences.length} test geofences!`);
    } catch (error) {
      Alert.alert('Error', `Failed to add geofences: ${error}`);
    }
  };

  const clearAllGeofences = async () => {
    try {
      await geofencingSingleton.clearAllProjects();
      await clear(PROJECT_KEY);
      Alert.alert('Success', 'All geofences cleared!');
    } catch (error) {
      Alert.alert('Error', `Failed to clear geofences: ${error}`);
    }
  };

  const forceCheck = async () => {
    try {
      await geofencingSingleton.forceGeofenceCheck();
    } catch (error) {
      Alert.alert('Error', `Failed to check geofences: ${error}`);
    }
  };

  const refreshGeofences = async () => {
    try {
      await geofencingSingleton.triggerGeofenceRefresh();
    } catch (error) {
      Alert.alert('Error', `Failed to refresh geofences: ${error}`);
    }
  };

  const debugCurrentLocation = async () => {
    try {

    } catch (error) {
      Alert.alert('Error', `Failed to get location: ${error}`);
    }
  };


  const triggerNotification = () => {
    localNotificationService.defaultChannel();
    localNotificationService.showNotification(
      Date.now() % 100000,
      'Test notification',
      'This is a test notification body',
      { test: true },
      { playSound: true }
    );
  }

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader skipAndroid={Platform.OS === 'android' ? false : true} marginHorizontal={8} statusProps={{ translucent: true }}>
        <StyledHeader.Full></StyledHeader.Full>
      </StyledHeader>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Geofencing Test App</Text>

        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <Text style={styles.statusText}>
            Initialized: {isInitialized ? '✅' : '❌'}
          </Text>
          <Text style={styles.statusText}>
            Loading: {isLoading ? '⏳' : '✅'}
          </Text>
          <Text style={styles.statusText}>
            Geofences: {geofences.length}
          </Text>
          <Text style={styles.statusText}>
            {/* Currently Inside: {insideGeofences.length} */}
          </Text>
          {error && (
            <Text style={styles.errorText}>Error: {error}</Text>
          )}
        </View>

        {/* Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Controls</Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonSuccess]}
            onPress={addTestGeofences}
            disabled={!isInitialized || isLoading}
          >
            <Text style={styles.buttonText}>Add Test Geofences</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonInfo]}
            onPress={debugCurrentLocation}
            disabled={!isInitialized}
          >
            <Text style={styles.buttonText}>Debug Current Location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonInfo]}
            onPress={forceCheck}
            disabled={!isInitialized}
          >
            <Text style={styles.buttonText}>Force Manual Check</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonInfo]}
            onPress={refreshGeofences}
            disabled={!isInitialized}
          >
            <Text style={styles.buttonText}>Refresh Geofences</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={clearAllGeofences}
            disabled={!isInitialized}
          >
            <Text style={styles.buttonText}>Clear All Geofences</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={() => triggerNotification()}

          >
            <Text style={styles.buttonText}>Trigger Notification </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={() => navigator.goBack()}
            disabled={!isInitialized}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>

        {/* Current Geofences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Geofences</Text>
          {geofences.map((geofence, index) => (
            <View key={geofence.id} style={styles.geofenceItem}>
              <Text style={styles.geofenceName}>{geofence.siteName}</Text>
              <Text style={styles.geofenceDetails}>
                Radius: {geofence.radius}m | {geofence.startTime}-{geofence.endTime}
              </Text>
              <Text style={styles.geofenceCoords}>
                {geofence.latitude.toFixed(6)}, {geofence.longitude.toFixed(6)}
              </Text>
              <Text style={[
                styles.geofenceStatus,

              ]}>

              </Text>
            </View>
          ))}
          {geofences.length === 0 && (
            <Text style={styles.emptyText}>No geofences added yet</Text>
          )}
        </View>

        {/* Events Log */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Events Log ({events.length})</Text>
            <TouchableOpacity onPress={() => { }} style={styles.clearButton}>
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
    </StyledSafeAreaView>
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