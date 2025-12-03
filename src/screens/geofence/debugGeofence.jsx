// Add this debug screen to your app (optional but helpful)
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, Alert } from 'react-native';
import {
    StyledHeader,
    StyledSafeAreaView,
} from 'fluent-styles';
import { geofencingSingleton } from '../../types/geofencing';
import BackgroundGeolocation from 'react-native-background-geolocation';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../utils/theme';
import { PROJECT_KEY, clear, store } from '../../utils/asyncStorage';

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

export const GeofencingDebug = () => {
    const [debugInfo, setDebugInfo] = useState('');
    const navigator = useNavigation();

    const checkStatus = async () => {
        let info = '=== GEOFENCING DEBUG ===\n\n';

        try {
            // Check initialization status
            const isInit = await geofencingSingleton.isInitialized();
            info += `✓ Initialized: ${isInit}\n`;

            // Check stored permission
            const storedPermission = await geofencingSingleton.getStoredPermissionStatus();
            info += `✓ Stored Permission: ${storedPermission}\n\n`;

            // Check BackgroundGeolocation state
            const state = await BackgroundGeolocation.getState();
            info += `--- BG State ---\n`;
            info += `Enabled: ${state.enabled}\n`;
            info += `isMoving: ${state.isMoving}\n`;
            info += `trackingMode: ${state.trackingMode}\n`;
            info += `schedulerEnabled: ${state.schedulerEnabled}\n\n`;

            // Check geofences
            const geofences = await BackgroundGeolocation.getGeofences();
            info += `--- Geofences (${geofences.length}) ---\n`;
            geofences.forEach(g => {
                info += `  ${g.identifier}\n`;
                info += `    Lat: ${g.latitude}, Lon: ${g.longitude}\n`;
                info += `    Radius: ${g.radius}m\n`;
            });
            info += '\n';

            // Check current location
            try {
                const loc = await BackgroundGeolocation.getCurrentPosition({ timeout: 5 });
                info += `--- Current Location ---\n`;
                info += `Lat: ${loc.coords.latitude}\n`;
                info += `Lon: ${loc.coords.longitude}\n`;
                info += `Accuracy: ${loc.coords.accuracy}m\n\n`;
            } catch (locErr) {
                info += `--- Location Error ---\n${locErr.message}\n\n`;
            }

            // Check currently inside
            const inside = geofencingSingleton.getCurrentGeofenceStates();
            info += `--- Currently Inside ---\n`;
            info += inside.length > 0 ? inside.join(', ') : 'None\n';

        } catch (error) {
            info += `\n❌ ERROR: ${error.message}`;
        }

        setDebugInfo(info);
    };

    const resetInitialization = async () => {
        if (confirm('Reset geofencing initialization? This simulates a fresh install.')) {
            await geofencingSingleton.resetInitialization();
            setDebugInfo('✅ Reset complete. Restart app to re-initialize.');
        }
    };

    const forceCheck = async () => {
        await geofencingSingleton.forceGeofenceCheck();
        setDebugInfo('✅ Manual geofence check triggered');
    };

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

    return (
        <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
            <StyledHeader skipAndroid={Platform.OS === 'android' ? false : true} marginHorizontal={8} statusProps={{ translucent: true }}>
                <StyledHeader.Full />
            </StyledHeader>
            <ScrollView style={styles.container}>
                <Text style={styles.title}>Geofencing Debug</Text>

                <TouchableOpacity style={styles.button} onPress={checkStatus}>
                    <Text style={styles.buttonText}>Check Status</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={forceCheck}>
                    <Text style={styles.buttonText}>Force Geofence Check</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={resetInitialization}>
                    <Text style={styles.buttonText}>Reset Initialization</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.buttonSuccess]} onPress={addTestGeofences}>
                    <Text style={styles.buttonText}>Add Today Test Geofence</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={() => navigator.goBack()}>
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>

                <View style={styles.debugBox}>
                    <Text style={styles.debugText}>{debugInfo || 'Tap "Check Status" to see debug info'}</Text>
                </View>
            </ScrollView>
        </StyledSafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    dangerButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    debugBox: {
        backgroundColor: '#1e1e1e',
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
    },
    debugText: {
        color: '#00ff00',
        fontFamily: 'Courier',
        fontSize: 12,
    },
    clearButton: { backgroundColor: '#6c757d' },
      buttonSuccess: { backgroundColor: '#28a745' },
});