// React Hooks that use the singleton

import { useState, useEffect, useCallback, useRef } from 'react';
import { geofencingSingleton, GeofencingState } from '../types/geofencing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundGeolocation, {
  GeofenceEvent as RNBGGeofenceEvent,
} from 'react-native-background-geolocation';
import { GeofenceEvent, GeofenceRegion, GeofenceTransition } from 'types/geofencing/types';

interface UseGeofencingOptions {
  autoInitialize?: boolean;
  autoRestorePersisted?: boolean;
}

const STORAGE_KEY = 'persisted_geofences';

// Main hook for using the geofencing singleton
export const useGeofencing = (options: UseGeofencingOptions = {}) => {
  const { autoInitialize = true, autoRestorePersisted = true } = options;
  const [state, setState] = useState<GeofencingState>(geofencingSingleton.getState());

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = geofencingSingleton.addStateListener(setState);
    return unsubscribe;
  }, []);

  // Auto-initialize
  useEffect(() => {
    if (autoInitialize && !state.isInitialized && !state.isLoading) {
      geofencingSingleton.initialize().then(success => {
        if (success && autoRestorePersisted) {
          geofencingSingleton.restorePersistedGeofences();
        }
      });
    }
  }, [autoInitialize, autoRestorePersisted, state.isInitialized, state.isLoading]);

  // Wrap singleton methods to maintain consistent API
  const actions = {
    initialize: useCallback(() => geofencingSingleton.initialize(), []),
    requestPermissions: useCallback(() => geofencingSingleton.requestPermissions(), []),
    addGeofence: useCallback((region: GeofenceRegion) => geofencingSingleton.addGeofence(region), []),
    removeGeofence: useCallback((id: string) => geofencingSingleton.removeGeofence(id), []),
    removeAllGeofences: useCallback(() => geofencingSingleton.removeAllGeofences(), []),
    startMonitoring: useCallback(() => geofencingSingleton.startMonitoring(), []),
    stopMonitoring: useCallback(() => geofencingSingleton.stopMonitoring(), []),
    restorePersistedGeofences: useCallback(() => geofencingSingleton.restorePersistedGeofences(), []),
    getActiveGeofences: useCallback(() => geofencingSingleton.getActiveGeofences(), []),
    getPersistedGeofences: useCallback(() => geofencingSingleton.getPersistedGeofences(), []),
  };

  return {
    ...state,
    ...actions
  };
};


export const useGeofenceEvents = (callback: (event: GeofenceEvent) => void) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const subscription = BackgroundGeolocation.onGeofence((geofence: RNBGGeofenceEvent) => {
      let transition: GeofenceTransition;
      
      switch (geofence.action) {
        case 'ENTER':
          transition = 'ENTER';
          break;
        case 'EXIT':
          transition = 'EXIT';
          break;
        case 'DWELL':
          transition = 'DWELL';
          break;
        default:
          console.warn('Unknown geofence action:', geofence.action);
          transition = 'ENTER';
      }

      const event: GeofenceEvent = {
        id: geofence.identifier,
        transition: transition,
        latitude: geofence.location.coords.latitude,
        longitude: geofence.location.coords.longitude,
        timestamp: geofence.location.timestamp || Date.now().toLocaleString()
      };
      
      callbackRef.current(event);
    });

    return () => subscription.remove();
  }, []);
};

export const useGeofenceRegions = () => {
  const [regions, setRegions] = useState<GeofenceRegion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadRegions = useCallback(async () => {
    setIsLoading(true);
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const parsedRegions = stored ? JSON.parse(stored) : [];
      setRegions(parsedRegions);
    } catch (error) {
      console.error('❌ Failed to load regions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveRegions = useCallback(async (newRegions: GeofenceRegion[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newRegions));
      setRegions(newRegions);
    } catch (error) {
      console.error('❌ Failed to save regions:', error);
      throw error;
    }
  }, []);

  const addRegion = useCallback(async (region: GeofenceRegion) => {
    const updated = [...regions.filter(r => r.id !== region.id), region];
    await saveRegions(updated);
  }, [regions, saveRegions]);

  const removeRegion = useCallback(async (id: string) => {
    const updated = regions.filter(r => r.id !== id);
    await saveRegions(updated);
  }, [regions, saveRegions]);

  const clearRegions = useCallback(async () => {
    await saveRegions([]);
  }, [saveRegions]);

  useEffect(() => {
    loadRegions();
  }, [loadRegions]);

  return {
    regions,
    isLoading,
    loadRegions,
    addRegion,
    removeRegion,
    clearRegions
  };
};
