import React, { useState, useEffect } from 'react';
import {  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  SafeAreaView, StatusBar, Alert, TouchableOpacity } from 'react-native';
import { useGeofencing, useGeofenceEvents, useGeofenceRegions } from '../../hooks/useGeofencing';
import { GeofenceRegion, GeofenceEvent } from '../../types/geofencing/types';
import { useNavigation } from '@react-navigation/native';

const TEST_REGION = {
  id: 'home',
  latitude: 52.54135, // PE2 5SP
  longitude: -0.29997,
  radius: 150, // meters
};

const GeofencingL = () => {
       const navigate = useNavigation()
     const {
    initialize,
    requestPermissions,
    addGeofence,
    removeAllGeofences,
    startMonitoring,
    stopMonitoring,
  } = useGeofencing();

  const { regions, addRegion, clearRegions } = useGeofenceRegions();
  const [events, setEvents] = useState<any[]>([]);

  // Listen for ENTER/EXIT/DWELL
  useGeofenceEvents((event) => {
    setEvents((prev) => [
      {
        id: Date.now().toString(),
        message: `${event.transition} → ${event.id} @ ${event.latitude},${event.longitude}`,
      },
      ...prev,
    ]);
  });

  // Initialize on mount
  useEffect(() => {
    const setup = async () => {
      await initialize();
      await requestPermissions();
    };
    setup();
  }, [initialize, requestPermissions]);

  const handleAddGeofence = async () => {
    await addGeofence(TEST_REGION);
    await addRegion(TEST_REGION);
  };

  const handleClear = async () => {
    await removeAllGeofences();
    await clearRegions();
    setEvents([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>📍 Geofence Test</Text>

      {/* Controls */}
      <View style={styles.buttonRow}>
        <Button title="Add Geofence" onPress={handleAddGeofence} />
        <Button title="Start" onPress={startMonitoring} />
        <Button title="Stop" onPress={stopMonitoring} />
        <Button title="Clear All" color="red" onPress={handleClear} />
      </View>

      {/* Active Regions */}
      <Text style={styles.subtitle}>Active Regions:</Text>
      <FlatList
        data={regions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.listItem}>
            {item.id} → {item.latitude},{item.longitude} (r:{item.radius}m)
          </Text>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No regions added</Text>
        }
      />

      {/* Event Log */}
      <Text style={styles.subtitle}>Events:</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.eventItem}>{item.message}</Text>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No events yet</Text>
        }
      />
    </SafeAreaView>
  );
};

export default GeofencingL;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  subtitle: { fontSize: 16, fontWeight: '600', marginTop: 20 },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  listItem: { fontSize: 14, paddingVertical: 4 },
  eventItem: {
    fontSize: 14,
    paddingVertical: 4,
    color: 'green',
    fontWeight: '500',
  },
  emptyText: { fontSize: 14, fontStyle: 'italic', color: '#666' },
});