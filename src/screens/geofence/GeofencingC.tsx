// App.tsx

import React, { useEffect } from 'react';
import { Alert, View, Text, Platform, TouchableOpacity } from 'react-native';
import BackgroundGeolocation, {
  Geofence,
  GeofenceEvent,
  State,
} from 'react-native-background-geolocation';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useNavigation } from '@react-navigation/native';

const GEOFENCE_ID = 'my_geofence';
const GEOFENCE_RADIUS = 200; // meters
const GEOFENCE_LATITUDE = 52.541332;
const GEOFENCE_LONGITUDE = -0.299986;

const GeofencingC = () => {
       const navigate = useNavigation()
  useEffect(() => {
    const init = async () => {
      // 1. Permissions
      await requestPermissions();

      // 2. Configure the plugin
      await BackgroundGeolocation.ready({
        // Required config fields:
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        distanceFilter: 50, 
        stopOnTerminate: false, 
        startOnBoot: true,
        // Geofence-specific
        geofenceProximityRadius: 1000, // radius within which geofences are actively monitored. Adjust as needed.
        geofenceModeHighAccuracy: true,
        // Optional: notifications, etc.
        // debug: true, // ← enable for debugging (shows notification etc)
      });

      // 3. Add the geofence
      const fence: Geofence = {
        identifier: GEOFENCE_ID,
        radius: GEOFENCE_RADIUS,
        latitude: GEOFENCE_LATITUDE,
        longitude: GEOFENCE_LONGITUDE,
        notifyOnEntry: true,
        notifyOnExit: true,
        notifyOnDwell: false,        // optional
        loiteringDelay: 30000,       // if you want dwell
        extras: { note: "Test fence" }
      };

      try {
        await BackgroundGeolocation.addGeofence(fence);
        console.log('[Geofence] added successfully');
      } catch (error) {
        console.warn('[Geofence] failed to add', error);
      }

      // 4. Listen for geofence events
      BackgroundGeolocation.onGeofence((event) => {
        const { identifier, action, location } = event;
        console.log(`[Geofence Event] ${identifier} -> ${action}`, location);
        // You can show an alert, send notification, etc.
        Alert.alert('Geofence event', `${identifier} : ${action}`);
      });

      // Optionally, listen for when geofences change (active ones etc)
      BackgroundGeolocation.onGeofencesChange((event) => {
        const { on, off } = event;
        console.log('Geofences now active:', on);
        console.log('Geofences removed / deactivated:', off);
      });

      // 5. Start geofencing-only or full tracking
      // If you only need geofence events (not full location tracking), use:
      await BackgroundGeolocation.startGeofences();
      // If you want continuous tracking + geofences, use:
      // await BackgroundGeolocation.start();
    };

    init();

    // Clean up listeners on unmount
    return () => {
      BackgroundGeolocation.removeListeners();
    };
  }, []);

  const requestPermissions = async () => {
    try {
      // Always request foreground location
      const resFine = await request(
        Platform.select({
          ios: PERMISSIONS.IOS.LOCATION_ALWAYS, // might need LOCATION_WHEN_IN_USE first then ALWAYS
          android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        })!
      );
      console.log('Fine location permission:', resFine);

      if (Platform.OS === 'android') {
        const bg = await request(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
        console.log('Background location permission:', bg);
      }
    } catch (err) {
      console.warn('Permissions error', err);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
         <TouchableOpacity  onPress={() => navigate.goBack()}>
                  <Text >Go Back</Text>
                </TouchableOpacity>
      <Text>Geofence Demo Running</Text>
    </View>
  );
};

export default GeofencingC;
