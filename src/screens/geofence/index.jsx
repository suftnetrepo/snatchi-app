import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Vibration
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
import { theme } from '../../utils/theme';
import { toModel } from '../../utils/help';

// ------------------------------------------------
// 🔥 Create dynamic test geofence for TODAY only
// ------------------------------------------------
function createDynamicTestGeofence() {
  const now = new Date();

  const latitude = 52.54223;
  const longitude = -0.30067;

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 0);

  const weekday = now.getDay() === 0 ? 7 : now.getDay();

  return [
    {
      id: "dynamic-test-" + now.getTime(),
      projectId: "dynamic-test-project",
      intergatorId: "test-integrator",
      siteName: "Dynamic Test Location (Today)",
      latitude,
      longitude,
      radius: 250,
      startDate: startOfDay.toISOString(),
      endDate: endOfDay.toISOString(),
      startTime: "00:00",
      endTime: "23:59",
      activeDays: [weekday],

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

    console.log("...............", events)

  // ------------------------------------------------
  // 🔥 Subscribe DIRECTLY to geofence events
  // ------------------------------------------------
  // useEffect(() => {
  //   console.log("👂 Subscribing directly to geofence events...");
  //   const unsubscribe = geofencingSingleton.addEventListener((event) => {
  //     console.log("📡 DIRECT EVENT:", event);

  //     setEvents(prev => {
  //       if (
  //         prev.length > 0 &&
  //         prev[0].id === event.id &&
  //         prev[0].transition === event.transition
  //       ) {
  //         return prev;
  //       }
  //       return [event, ...prev];
  //     });
  //   });

  //   return () => {
  //     console.log("🧹 Unsubscribe geofence listener");
  //     unsubscribe();
  //   };
  // }, []);

  // ------------------------------------------------
  // ADD TEST GEOFENCE
  // ------------------------------------------------
  const addTestGeofences = async () => {
    const testGeofences = createDynamicTestGeofence();
    try {
      await geofencingSingleton.clearAllProjects();
      await clear(PROJECT_KEY);
      await store(PROJECT_KEY, testGeofences);
      await geofencingSingleton.addProjects(testGeofences);

      Alert.alert('Success', 'Added test geofence for today!');
    } catch (error) {
      Alert.alert('Error', `Could not add test geofence: ${error}`);
    }
  };

  // ------------------------------------------------
  // CLEAR ALL
  // ------------------------------------------------
  const clearAllGeofences = async () => {
    try {
      await geofencingSingleton.clearAllProjects();
      await clear(PROJECT_KEY);
      setEvents([])
      Alert.alert('Success', 'Geofences cleared!');
    } catch (error) {
      Alert.alert('Error', `Failed to clear: ${error}`);
    }
  };

  // ------------------------------------------------
  // Manual force checks
  // ------------------------------------------------
  const forceCheck = async () => {
    try {
      await geofencingSingleton.forceGeofenceCheck();
    } catch (error) {
      Alert.alert('Error', `Failed: ${error}`);
    }
  };

  const refreshGeofences = async () => {
    try {
      await geofencingSingleton.triggerGeofenceRefresh();
    } catch (error) {
      Alert.alert('Error', `Failed: ${error}`);
    }
  };

// 🔥 SIMULATED ENTER / EXIT (UI SAFE)
// ------------------------------------------------
const simulateEvent = async (transition) => {
  console.log("--------------------------------------------------");
  console.log(`🎮 SIMULATION STARTED for: ${transition}`);

  // Build a unique UI-safe event
  const uiEvent = {
    id: "sim-" + Date.now().toString(36) + Math.random().toString(36).slice(2),
    transition,
    latitude: 52.54223,
    longitude: -0.30067,
    timestamp: new Date().toISOString(),
    siteName: "Manual Simulation",
    radius: 250,
    status: transition === "ENTER" ? "Enter" : "Exit",
    first_name: "Test",
    last_name: "User",
    completeAddress: "Simulated Address",

    // 🔥 The secret — React can never merge or skip this item
    _uid: `ui-${Date.now()}-${transition}-${Math.random()}`
  };

  console.log("📝 UI event built:", uiEvent);

  // -----------------------------
  // Vibration
  // -----------------------------
  try {
    console.log("📳 Vibrating...");
    Vibration.vibrate(300);
  } catch (e) {
    console.warn("⚠️ Vibration failed:", e);
  }

  // -----------------------------
  // Local Notification
  // -----------------------------
  try {
    console.log("🔔 Sending notification...");
    localNotificationService.defaultChannel();
    localNotificationService.showNotification(
      Date.now() % 100000,
      transition === "ENTER" ? "Entered Geofence" : "Exited Geofence",
      `${uiEvent.siteName}`,
      { simulated: true },
      { playSound: true }
    );
  } catch (e) {
    console.warn("⚠️ Notification failed:", e);
  }

  // -----------------------------
  // Add to UI list
  // -----------------------------
  console.log("🧾 Adding event to UI list…");
  setEvents(prev => [uiEvent, ...prev]);

  console.log("🎮 SIMULATION COMPLETE:", transition);
  console.log("--------------------------------------------------");
};

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader skipAndroid={Platform.OS === 'android' ? false : true} marginHorizontal={8} statusProps={{ translucent: true }}>
        <StyledHeader.Full />
      </StyledHeader>

      <ScrollView style={styles.container}>
        <Text style={styles.title}>Geofencing Test App</Text>

        {/* STATUS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <Text>Initialized: {true ? '✅' : '❌'}</Text>
          {/* <Text>Loading: {isLoading ? '⏳' : '✅'}</Text> */}
          {/* <Text>Geofences: {geofences.length}</Text>
          {error && <Text style={styles.errorText}>Error: {error}</Text>} */}
        </View>

        {/* BUTTONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Controls</Text>

          {/* <TouchableOpacity style={[styles.button, styles.buttonSuccess]} onPress={addTestGeofences}>
            <Text style={styles.buttonText}>Add Today Test Geofence</Text>
          </TouchableOpacity> */}

          {/* <TouchableOpacity style={[styles.button, styles.buttonInfo]} onPress={forceCheck}>
            <Text style={styles.buttonText}>Force Manual Check</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.buttonInfo]} onPress={refreshGeofences}>
            <Text style={styles.buttonText}>Refresh Geofences</Text>
          </TouchableOpacity> */}

          <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={clearAllGeofences}>
            <Text style={styles.buttonText}>Clear All Geofences</Text>
          </TouchableOpacity>

          {/* SIMULATIONS */}
          <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={() => simulateEvent("ENTER")}>
            <Text style={styles.buttonText}>Simulate ENTER</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={() => simulateEvent("EXIT")}>
            <Text style={styles.buttonText}>Simulate EXIT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={() => navigator.goBack()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>

        {/* EVENTS LOG */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Events Log ({events.length})</Text>

          {events.map((ev, i) => (
            <View key={i} style={styles.eventItem}>
              <View style={styles.eventHeader}>
                <Text style={[styles.eventTransition, ev.transition === "ENTER" ? styles.enterTransition : styles.exitTransition]}>
                  {ev.transition}
                </Text>
                <Text style={styles.eventTime}>{new Date(ev.timestamp).toLocaleTimeString()}</Text>
              </View>

              <Text style={styles.eventCoords}>
                {ev.latitude}, {ev.longitude}
              </Text>
            </View>
          ))}

          {events.length === 0 && (
            <Text style={styles.emptyText}>No events yet — simulate ENTER/EXIT!</Text>
          )}
        </View>
      </ScrollView>
    </StyledSafeAreaView>
  );
};

// ------------------------------------------------
// STYLES
// ------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },

  section: { backgroundColor: 'white', borderRadius: 8, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },

  errorText: { color: '#dc3545' },

  button: { padding: 14, borderRadius: 6, marginBottom: 10, alignItems: 'center' },
  buttonSuccess: { backgroundColor: '#28a745' },
  buttonInfo: { backgroundColor: '#17a2b8' },
  buttonDanger: { backgroundColor: '#dc3545' },
  buttonPrimary: { backgroundColor: '#007bff' },
  clearButton: { backgroundColor: '#6c757d' },
  buttonText: { color: 'white', fontWeight: 'bold' },

  eventItem: { borderLeftWidth: 3, borderLeftColor: '#17a2b8', paddingLeft: 12, marginBottom: 12 },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  eventTransition: { fontSize: 16, fontWeight: 'bold' },
  enterTransition: { color: '#28a745' },
  exitTransition: { color: '#dc3545' },
  eventTime: { fontSize: 12, color: '#666' },
  eventCoords: { fontSize: 12, color: '#555' },

  emptyText: { textAlign: 'center', color: '#666', marginTop: 20 },
});

export default GeofenceTestApp;
