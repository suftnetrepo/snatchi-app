import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useGeofenceEvents, useProjectState } from '../../hooks/useProjectGeofencing';
import type { GeofenceEvent } from '../../types/geofencing/types';

export default function GeofenceDashboard() {
  const { geofences, isInitialized, error } = useProjectState();
  const [logs, setLogs] = useState<GeofenceEvent[]>([]);

  // Listen to ENTER / EXIT / DWELL events
  useGeofenceEvents(event => {
    setLogs(prev => [
      { ...event, id: `${event.id}-${Date.now()}` }, // ensure unique key
      ...prev.slice(0, 19), // keep last 20
    ]);
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📍 Geofence Dashboard</Text>
      <Text>Status: {isInitialized ? 'Initialized' : 'Not Ready'}</Text>
      {error && <Text style={styles.error}>Error: {error}</Text>}

      <Text style={styles.sectionTitle}>Active Geofences</Text>
      <FlatList
        data={geofences}
        keyExtractor={(item, index) => item.id || `geo-${index}`}
        renderItem={({ item }) => (
          <View style={styles.projectCard}>
            <Text style={styles.projectName}>{item.siteName ?? item.id}</Text>
            {item.projectId && <Text>ID: {item.projectId}</Text>}
            {item.startTime && item.endTime && (
              <Text>
                {item.startTime}-{item.endTime} | Days:{" "}
                {item.activeDays?.join(",") || "1-7"}
              </Text>
            )}
            <Text>
              Lat: {item.latitude}, Lng: {item.longitude}, R: {item.radius}m
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text>No active projects</Text>}
      />

      <Text style={styles.sectionTitle}>Event Logs</Text>
      <FlatList
        data={logs}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.logCard}>
            <Text style={styles.logAction}>{item.transition}</Text>
            <Text>{item.id}</Text>
            <Text style={styles.logTime}>{item.timestamp}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No events yet...</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  error: { color: 'red', marginVertical: 5 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 5 },
  projectCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  projectName: { fontSize: 15, fontWeight: '600' },
  logCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  logAction: { fontWeight: 'bold' },
  logTime: { fontSize: 12, color: '#666' },
});
