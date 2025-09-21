import React, { useEffect, useState } from 'react';
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
import BackgroundGeolocationService from './BackgroundGeolocationService';
import Geolocation from '@react-native-community/geolocation';
import { useNavigation } from '@react-navigation/native';

const GeofencingD = () => {
     const navigate = useNavigation()
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [geofences, setGeofences] = useState<any[]>([]);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Request location permissions
      if (Platform.OS === 'android') {
        await requestLocationPermission();
      }

      // Initialize background geolocation
      await BackgroundGeolocationService.initialize();
      
      // Get current location
      getCurrentLocation();
      
      // Load existing geofences
      loadGeofences();
    } catch (error) {
      console.error('Initialization error:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location for geofencing',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation(position.coords);
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const loadGeofences = async () => {
    const fences = await BackgroundGeolocationService.getGeofences();
    setGeofences(fences);
  };

  const addSampleGeofence = async () => {
    if (!currentLocation) {
      Alert.alert('Error', 'Please wait for location to be available');
      return;
    }

    const geofence = {
      identifier: 'Office',
      radius: 100, // 100 meters
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      notifyOnEntry: true,
      notifyOnExit: true,
      extras: {
        radius: 100,
        center: { latitude: currentLocation.latitude, longitude: currentLocation.longitude }
      }
    };

    const success = await BackgroundGeolocationService.addGeofence(geofence);
    if (success) {
      Alert.alert('Success', 'Geofence added around your current location');
      loadGeofences();
    } else {
      Alert.alert('Error', 'Failed to add geofence');
    }
  };

  const addCustomGeofence = async (lat: number, lng: number, identifier: string) => {
    const geofence = {
      identifier: identifier,
      radius: 150,
      latitude: lat,
      longitude: lng,
      notifyOnEntry: true,
      notifyOnExit: true,
    };

    const success = await BackgroundGeolocationService.addGeofence(geofence);
    if (success) {
      Alert.alert('Success', `Geofence ${identifier} added`);
      loadGeofences();
    }
  };

  const removeAllGeofences = async () => {
    const fences = await BackgroundGeolocationService.getGeofences();
    for (const fence of fences) {
      await BackgroundGeolocationService.removeGeofence(fence.identifier);
    }
    loadGeofences();
    Alert.alert('Success', 'All geofences removed');
  };

  return (
    <View style={styles.container}>
       
      <ScrollView style={styles.scrollView}>
        
        <Text style={styles.title}>Geofencing Demo..</Text>
        <TouchableOpacity  onPress={() => navigate.goBack()}>
                  <Text style={styles.title}>Go Back</Text>
                </TouchableOpacity>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Location</Text>
          {currentLocation ? (
            <Text>
              Lat: {currentLocation.latitude.toFixed(6)}, 
              Lng: {currentLocation.longitude.toFixed(6)}
            </Text>
          ) : (
            <Text>Getting location...</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Geofences ({geofences.length})</Text>
          {geofences.map((fence, index) => (
            <View key={index} style={styles.geofenceItem}>
              <Text>{fence.identifier}</Text>
              <Text>Radius: {fence.radius}m</Text>
            </View>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Add Geofence at Current Location"
            onPress={addSampleGeofence}
          />
          
          <View style={styles.spacer} />
          
          <Button
            title="Add Sample Office Geofence"
            onPress={() => addCustomGeofence(37.3318, -122.0312, 'Apple Park')}
          />
          
          <View style={styles.spacer} />
          
          <Button
            title="Remove All Geofences"
            onPress={removeAllGeofences}
            color="red"
          />
          
          <View style={styles.spacer} />
          
          <Button
            title="Start Geofencing"
            onPress={() => BackgroundGeolocationService.startGeofencing()}
            color="green"
          />
          
          <View style={styles.spacer} />
          
          <Button
            title="Stop Geofencing"
            onPress={() => BackgroundGeolocationService.stopGeofencing()}
            color="orange"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  geofenceItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  buttonContainer: {
    marginTop: 20,
  },
  spacer: {
    height: 10,
  },
});

export default GeofencingD;