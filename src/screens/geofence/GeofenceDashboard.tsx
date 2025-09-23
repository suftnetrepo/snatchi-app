import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useGeofenceEvents, useProjectState } from '../../hooks/useProjectGeofencing';
import { geofencingSingleton } from '../../types/geofencing';
import type { GeofenceEvent, ProjectGeofence } from '../../types/geofencing/types';

export default function GeofenceDashboard() {
  const { geofences, isInitialized, error } = useProjectState();
  const [logs, setLogs] = useState<GeofenceEvent[]>([]);

  // Listen to ENTER / EXIT / DWELL events
  useGeofenceEvents(event => {
    setLogs(prev => [
      { ...event, id: `${event.id}-${Date.now()}` },
      ...prev,
    ].slice(0, 20));
  });

  // 🔹 Add test project at PE2 5SP
  const addTestGeofence = async () => {
    const testProject: ProjectGeofence = {
      projectId: 'test-project-pe2',
      id: 'pe2-5sp',
      siteName: 'PE2 5SP Test',
      latitude: 52.541332,
      longitude: -0.299986,
      radius: 200,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '00:00',
      endTime: '23:59',
      activeDays: [0, 1, 2, 3, 4, 5, 6],
    };
    await geofencingSingleton.addProjects([testProject]);
  };

  // 🔹 Clear all
  const clearGeofences = async () => {
    await geofencingSingleton.clearAllProjects();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>📍 Geofence Dashboard</Text>
        <Text style={styles.status}>
          Status: {isInitialized ? '✅ Initialized' : '⏳ Not Ready'}
        </Text>
        {error && <Text style={styles.error}>Error: {error}</Text>}

        {/* 🔹 Test buttons */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.button} onPress={addTestGeofence}>
            <Text style={styles.buttonText}>➕ Add PE2 5SP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearGeofences}>
            <Text style={[styles.buttonText, { color: 'white' }]}>🗑 Clear All</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Active Geofences</Text>
        {geofences.length === 0 ? (
          <Text style={styles.empty}>No active projects</Text>
        ) : (
          <FlatList
            data={geofences}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.projectCard}>
                <Text style={styles.projectName}>{item.siteName ?? item.id}</Text>
                <Text>ID: {item.projectId}</Text>
                <Text>
                  {item.startTime}-{item.endTime} | Days:{" "}
                  {item.activeDays?.join(",") || "0-6"}
                </Text>
                <Text>
                  Lat: {item.latitude}, Lng: {item.longitude}, R: {item.radius}m
                </Text>
              </View>
            )}
          />
        )}

        <Text style={styles.sectionTitle}>Event Logs</Text>
        {logs.length === 0 ? (
          <Text style={styles.empty}>No events yet...</Text>
        ) : (
          <FlatList
            data={logs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.logCard}>
                <Text style={styles.logAction}>{item.transition}</Text>
                <Text>{item.id}</Text>
                <Text style={styles.logTime}>
                  {new Date(item.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { padding: 16 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  status: { fontSize: 16, marginBottom: 5 },
  error: { color: 'red', marginVertical: 5 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 },
  button: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: { backgroundColor: '#d32f2f' },
  buttonText: { fontWeight: '600', color: '#fff', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  projectCard: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  projectName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  logCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  logAction: { fontWeight: '700', fontSize: 14, marginBottom: 2 },
  logTime: { fontSize: 12, color: '#666' },
  empty: { color: '#666', fontStyle: 'italic', marginVertical: 6 },
});
