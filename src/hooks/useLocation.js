import {useEffect } from 'react';
import {Platform, PermissionsAndroid} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {store} from '../utils/asyncStorage';

const useLocation = () => {
  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message:
                'Your app needs access to your location to provide accurate information.',
              buttonPositive: 'OK',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            getLocation();
          } else {
            handlePermissionDenied();
          }
        } catch (err) {}
      } else if (Platform.OS === 'ios') {
        getLocation();
      }
    };

    const getLocation = () => {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          store('location', {latitude, longitude}).then(() => {});
        },
        error => {
          handlePermissionDenied();
        },
        {enableHighAccuracy: true, timeout: 90000, maximumAge: 10000},
      );
    };

    const handlePermissionDenied = () => {
      store(
        'locationError',
        'The app requires access to your location to provide the nearby stores. Please enable location permissions in your device settings.',
      ).then(() => {});
    };

    requestLocationPermission();
  }, []);

  return ;
};

export default useLocation;
