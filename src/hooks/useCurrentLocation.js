import {useEffect, useState} from 'react';
import {getStore} from '../utils/asyncStorage';

const useCurrentLocation = () => {
  const [state, setState] = useState({
    data: '',
    loading: false,
    error: {},
    success: false,
  });

  const reverseGeocode = async () => {
    try {

      const location = await getStore('location')
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${location.latitude}&lon=${location.longitude}&format=json`,
      );
      const selectedAddress = await response.json();

      if (selectedAddress.address) {
        setState(pre => {
          return {
            ...pre,
            data: {
              addressLine1:
                selectedAddress?.address.suburb ||
                selectedAddress?.address.place ||
                selectedAddress?.address.municipality,
              town:
                selectedAddress?.address.town || selectedAddress?.address.city,
              county:
                selectedAddress?.address.county ||
                selectedAddress?.address.state,
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
            },
            loading: false,
            success: true,
          };
        });
      } else {
        setState(pre => {
          return {
            ...pre,
            success: false,
            loading: false,
          };
        });
      }
    } catch (error) {
      setState(pre => ({
        ...pre,
        loading: false,
        error: 'Failed to fetch address.',
      }));
    }
  };

  useEffect(() => {
    reverseGeocode();
  }, []);

  return {
    ...state,
  };
};

export {useCurrentLocation};
