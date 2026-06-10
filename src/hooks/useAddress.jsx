import React, {useState} from 'react';
import {VERBS} from '../../config';
import {zat} from '../utils/zap';

const useAddress = () => {
  const [state, setState] = useState({
    loading: false,
    error: null,
    success: false,
  });

  const handleReset = () => {
    setState(pre => {
      return {
        ...pre,
        error: null,
        success: false,
      };
    });
  };

  const handleError = error => {
    setState(pre => {
      return {...pre, error: error, loading: false, success: false};
    });
  };

  const handleFetch = async query => {
    const params = {
      q: query,
      format: 'json',
      addressdetails: 1,
      polygon_geojson: 0,
    };

    const queryString = new URLSearchParams(params).toString();
    setState(prev => ({...prev, loading: true, error: null}));
    const {success, data, errorMessage} = await zat(
      `https://nominatim.openstreetmap.org/search?${queryString}`,
      null,
      VERBS.GET,
    );

    if (success) {
      setState(pre => ({
        ...pre,
        loading: false,
      }));
      return data;
    } else {
      handleError(errorMessage || 'Failed to fetch the address.');
      return false;
    }
  };

  return {...state, handleFetch, handleReset};
};

export {useAddress};
