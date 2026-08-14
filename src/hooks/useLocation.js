import {useEffect} from 'react';
import {Platform, PermissionsAndroid} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {store} from '../utils/asyncStorage';

const useLocation = (enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

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
          storeAddress(latitude, longitude).then(()=> {})
        },
        error => {
          handlePermissionDenied();
        },
        {enableHighAccuracy: true, timeout: 90000, maximumAge: 10000},
      );
    };

    const storeAddress = async (latitude, longitude) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        );
        const selectedAddress = await response.json();

        if (selectedAddress.address) {
          store('address', {
            addressLine1:
              selectedAddress?.address.suburb ||
              selectedAddress?.address.place ||
              selectedAddress?.address.municipality,
            town:
              selectedAddress?.address.town || selectedAddress?.address.city,
            county:
              selectedAddress?.address.county || selectedAddress?.address.state,
            postcode:
              selectedAddress?.address.country_code === 'gb' ||
              selectedAddress?.address.country_code === 'us'
                ? selectedAddress?.address.postcode
                : '',
            country: selectedAddress?.address.country,
            completeAddress: selectedAddress?.display_name,
            location: {
              type: 'Point',
              coordinates: [
                parseFloat(selectedAddress?.lat) || 0,
                parseFloat(selectedAddress?.lon) || 0,
              ],
            },
          }).then(() => {});
        }
      } catch (error) {
        if(__DEV__)
          console.error(error)
      }
    };

    const handlePermissionDenied = () => {
      store(
        'locationError',
        'The app requires access to your location to provide the nearby stores. Please enable location permissions in your device settings.',
      ).then(() => {});
    };

    requestLocationPermission();
  }, [enabled]);

  return;
};

export default useLocation;
