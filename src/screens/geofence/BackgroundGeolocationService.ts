import BackgroundGeolocation, {
  Geofence,
  GeofenceEvent,
  GeofencesChangeEvent,
  Location,
} from 'react-native-background-geolocation';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  Alert,
  Platform,
  PermissionsAndroid,
  TouchableOpacity,
} from 'react-native';

class BackgroundGeolocationService {
  static async initialize() {
    // Configure the plugin
    await BackgroundGeolocation.ready({
      // Geolocation Config
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 10,
      // Activity Recognition
      stopTimeout: 5,
      // Application config
      debug: false, // <-- enable this for debug sounds & notifications
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      stopOnTerminate: false,
      startOnBoot: true,
      // HTTP / SQLite config
      
      autoSync: true,
    });

    // Listen to geofence events
    BackgroundGeolocation.onGeofence(this.onGeofence);
    BackgroundGeolocation.onGeofencesChange(this.onGeofencesChange);
  }

  static onGeofence(geofence: GeofenceEvent) {
    console.log('[onGeofence]', geofence);

    const { identifier, action, location } = geofence;
    
    // Create a notification
    BackgroundGeolocation.startGeofences();
    
    // Handle different geofence actions
    if (action === 'ENTER') {
      console.log(`User ENTERED geofence: ${identifier}`);
      // Send notification or trigger action
     // this.sendNotification(`Entered ${identifier}`, `You've entered ${identifier} area`);
    } else if (action === 'EXIT') {
      console.log(`User EXITED geofence: ${identifier}`);
     // this.sendNotification(`Exited ${identifier}`, `You've left ${identifier} area`);
    }
  }

  static onGeofencesChange(event: GeofencesChangeEvent) {
    console.log('[onGeofencesChange]', event);
  }

  static async addGeofence(geofence: Geofence) {
    try {
      await BackgroundGeolocation.addGeofence(geofence);
      console.log('Geofence added successfully:', geofence.identifier);
      return true;
    } catch (error) {
      console.error('Error adding geofence:', error);
      return false;
    }
  }

  static async removeGeofence(identifier: string) {
    try {
      await BackgroundGeolocation.removeGeofence(identifier);
      console.log('Geofence removed successfully:', identifier);
    } catch (error) {
      console.error('Error removing geofence:', error);
    }
  }

  static async getGeofences(): Promise<Geofence[]> {
    return await BackgroundGeolocation.getGeofences();
  }

  static async startGeofencing() {
    await BackgroundGeolocation.startGeofences();
  }

  static async stopGeofencing() {
    await BackgroundGeolocation.stop();
  }

  private static sendNotification(title: string, message: string) {
    // BackgroundGeolocation.schedule({
    //   title: title,
    //   body: message,
    //   channel: 'geofence-notifications',
    //   smallIcon: 'ic_notification',
    //   largeIcon: 'ic_launcher',
    // });
  }
}

export default BackgroundGeolocationService;