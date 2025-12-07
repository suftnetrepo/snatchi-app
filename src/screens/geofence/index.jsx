// Enhanced GeofencingDebug with log viewing functionality
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, Alert, TextInput } from 'react-native';
import {
    StyledHeader,
    StyledSafeAreaView,
} from 'fluent-styles';
import { geofencingSingleton } from '../../../scripts/geofencing';
import BackgroundGeolocation from 'react-native-background-geolocation';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../utils/theme';
import { PROJECT_KEY, clear, store } from '../../utils/asyncStorage';
import { getCurrentLocation } from '../../../scripts/getReliableLocation';

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
    const [logs, setLogs] = useState('');
    const [showLogs, setShowLogs] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [logLimit, setLogLimit] = useState('100');
    const navigator = useNavigation();

    const checkStatus = async () => {
        let info = '=== GEOFENCING DEBUG ===\n\n';

        try {
            // Check initialization status
            const isInit = await geofencingSingleton.handleState();
            info += `✓ Initialized: ${isInit}\n`;

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
                const loc = await getCurrentLocation();
                info += `--- Current Location ---\n`;
                info += `Lat: ${loc.latitude}\n`;
                info += `Lon: ${loc.longitude}\n`;
                info += `Accuracy: ${loc.provider}m\n\n`;
            } catch (locErr) {
                info += `--- Location Error ---\n${locErr.message}\n\n`;
            }

            // Check currently inside
            const inside = geofencingSingleton.getCurrentGeofenceStates();
            info += `--- Current Geofence States ---\n`;
            inside.forEach((state) => {
                info += state.join(', ') + 'None\n';
            })


        } catch (error) {
            info += `\n❌ ERROR: ${error.message}`;
        }

        setDebugInfo(info);
    };

    const viewLogs = async (type = 'all') => {
        try {
            let logText = '=== BACKGROUND GEOLOCATION LOGS ===\n\n';
            
            const query = {
                limit: parseInt(logLimit) || 100,
                order: 1 // Descending (most recent first)
            };

            // Add date filters if provided
            if (startDate) {
                try {
                    query.start = Date.parse(startDate);
                    logText += `Start Date: ${startDate}\n`;
                } catch (e) {
                    Alert.alert('Invalid Date', 'Start date format should be: YYYY-MM-DD or YYYY-MM-DD HH:mm:ss');
                    return;
                }
            }

            if (endDate) {
                try {
                    query.end = Date.parse(endDate);
                    logText += `End Date: ${endDate}\n`;
                } catch (e) {
                    Alert.alert('Invalid Date', 'End date format should be: YYYY-MM-DD or YYYY-MM-DD HH:mm:ss');
                    return;
                }
            }

            logText += `Limit: ${query.limit} records\n`;
            logText += `Order: Most Recent First\n\n`;
            logText += '--- LOG ENTRIES ---\n\n';

            // Get the logs
            const log = await BackgroundGeolocation.logger.getLog(query);
            
            if (log && log.length > 0) {
                log.split('\n').forEach((line, index) => {
                    if (line.trim()) {
                        logText += `${line}\n`;
                    }
                });
            } else {
                logText += 'No logs found for the specified criteria.\n';
            }

            setLogs(logText);
            setShowLogs(true);

        } catch (error) {
            Alert.alert('Error', `Failed to retrieve logs: ${error.message}`);
            setLogs(`❌ ERROR: ${error.message}`);
        }
    };

    const emailLogs = async () => {
        try {
            const query = {
                limit: parseInt(logLimit) || 100,
                order: 1 // Descending
            };

            if (startDate) {
                query.start = Date.parse(startDate);
            }
            if (endDate) {
                query.end = Date.parse(endDate);
            }

            await BackgroundGeolocation.logger.emailLog('your-email@example.com', query);
            Alert.alert('Success', 'Email composer opened with logs');
        } catch (error) {
            Alert.alert('Error', `Failed to prepare email: ${error.message}`);
        }
    };

    const destroyLogs = async () => {
        Alert.alert(
            'Destroy All Logs',
            'Are you sure you want to permanently delete all logs? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Destroy',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await BackgroundGeolocation.logger.destroyLog();
                            Alert.alert('Success', 'All logs have been destroyed');
                            setLogs('');
                        } catch (error) {
                            Alert.alert('Error', `Failed to destroy logs: ${error.message}`);
                        }
                    }
                }
            ]
        );
    };

    const setQuickDate = (days) => {
        const now = new Date();
        const past = new Date();
        past.setDate(past.getDate() - days);
        
        setStartDate(past.toISOString().split('T')[0]);
        setEndDate(now.toISOString().split('T')[0]);
    };

    const resetInitialization = async () => {
        Alert.alert(
            'Reset Initialization',
            'Reset geofencing initialization? This simulates a fresh install.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        await geofencingSingleton.initialize();
                        setDebugInfo('✅ Reset complete. Restart app to re-initialize.');
                    }
                }
            ]
        );
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

    const clearAllGeofences = async () => {
        try {
            await geofencingSingleton.clearAllProjects();
            await clear(PROJECT_KEY);
            Alert.alert('Success', 'Geofences cleared!');
        } catch (error) {
            Alert.alert('Error', `Failed to clear: ${error}`);
        }
    };

    return (
        <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
            <StyledHeader skipAndroid={Platform.OS === 'android' ? false : true} marginHorizontal={8} statusProps={{ translucent: true }}>
                <StyledHeader.Full />
            </StyledHeader>
            <ScrollView style={styles.container}>
                <Text style={styles.title}>Geofencing Debug</Text>

                {/* Status Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Status & Control</Text>
                    
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

                    <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={clearAllGeofences}>
                        <Text style={styles.buttonText}>Clear All Geofences</Text>
                    </TouchableOpacity>
                </View>

                {/* Logs Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📋 Log Viewer</Text>
                    
                    {/* Quick Date Filters */}
                    <View style={styles.quickFilters}>
                        <TouchableOpacity style={styles.quickButton} onPress={() => setQuickDate(1)}>
                            <Text style={styles.quickButtonText}>Last 24h</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickButton} onPress={() => setQuickDate(7)}>
                            <Text style={styles.quickButtonText}>Last 7d</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickButton} onPress={() => setQuickDate(30)}>
                            <Text style={styles.quickButtonText}>Last 30d</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Date Inputs */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Start Date (YYYY-MM-DD HH:mm:ss)</Text>
                        <TextInput
                            style={styles.input}
                            value={startDate}
                            onChangeText={setStartDate}
                            placeholder="2024-01-01 or 2024-01-01 13:00"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>End Date (YYYY-MM-DD HH:mm:ss)</Text>
                        <TextInput
                            style={styles.input}
                            value={endDate}
                            onChangeText={setEndDate}
                            placeholder="2024-12-31 or 2024-12-31 23:59"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Limit (max records)</Text>
                        <TextInput
                            style={styles.input}
                            value={logLimit}
                            onChangeText={setLogLimit}
                            placeholder="100"
                            keyboardType="numeric"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Log Action Buttons */}
                    <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={() => viewLogs()}>
                        <Text style={styles.buttonText}>📖 View Logs</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, styles.buttonInfo]} onPress={emailLogs}>
                        <Text style={styles.buttonText}>📧 Email Logs</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, styles.buttonWarning]} onPress={destroyLogs}>
                        <Text style={styles.buttonText}>🗑️ Destroy All Logs</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.button, styles.clearButton]} 
                        onPress={() => {
                            setStartDate('');
                            setEndDate('');
                            setLogLimit('100');
                            setLogs('');
                            setShowLogs(false);
                        }}
                    >
                        <Text style={styles.buttonText}>Clear Filters</Text>
                    </TouchableOpacity>
                </View>

                {/* Debug Info Box */}
                {debugInfo ? (
                    <View style={styles.debugBox}>
                        <Text style={styles.debugBoxTitle}>Status Info</Text>
                        <Text style={styles.debugText}>{debugInfo}</Text>
                    </View>
                ) : null}

                {/* Logs Display */}
                {showLogs && logs ? (
                    <View style={[styles.debugBox, styles.logsBox]}>
                        <Text style={styles.debugBoxTitle}>Logs</Text>
                        <ScrollView style={styles.logsScrollView} nestedScrollEnabled={true}>
                            <Text style={styles.debugText}>{logs}</Text>
                        </ScrollView>
                    </View>
                ) : null}

                <TouchableOpacity style={[styles.button, styles.clearButton, { marginTop: 20 }]} onPress={() => navigator.goBack()}>
                    <Text style={styles.buttonText}>← Go Back</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
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
        color: '#333',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
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
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    buttonPrimary: {
        backgroundColor: '#007AFF',
    },
    buttonSuccess: {
        backgroundColor: '#28a745',
    },
    buttonDanger: {
        backgroundColor: '#dc3545',
    },
    buttonWarning: {
        backgroundColor: '#ffc107',
    },
    buttonInfo: {
        backgroundColor: '#17a2b8',
    },
    dangerButton: {
        backgroundColor: '#FF3B30',
    },
    clearButton: {
        backgroundColor: '#6c757d',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    quickFilters: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    quickButton: {
        flex: 1,
        backgroundColor: '#e9ecef',
        padding: 10,
        borderRadius: 6,
        marginHorizontal: 4,
    },
    quickButtonText: {
        textAlign: 'center',
        color: '#495057',
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
        color: '#495057',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 6,
        padding: 12,
        fontSize: 14,
        color: '#333',
    },
    debugBox: {
        backgroundColor: '#1e1e1e',
        padding: 15,
        borderRadius: 8,
        marginBottom: 16,
    },
    logsBox: {
        height: 400,
    },
    logsScrollView: {
        flex: 1,
        maxHeight: 360,
    },
    debugBoxTitle: {
        color: '#00ff00',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        fontFamily: 'Courier',
    },
    debugText: {
        color: '#00ff00',
        fontFamily: 'Courier',
        fontSize: 12,
    },
});