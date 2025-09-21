// hooks/useGeofencing.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundGeolocation, {
  GeofenceEvent as RNBGGeofenceEvent,
  State,
  Geofence as RNGeofence,
} from 'react-native-background-geolocation';
import { GeofenceEvent, GeofenceRegion, GeofenceTransition, GeofencingState } from '../types/geofencing/types';

const STORAGE_KEY = 'persisted_geofences';

//
// Main hook to manage geofencing state
//
export const useGeofencing = () => {
  const [state, setState] = useState<GeofencingState>({
    isInitialized: false,
    isLoading: false,
    error: null,
      geofences: [],   // ✅ add default
  });

  // initialize BackgroundGeolocation
const initialize = useCallback(async () => {
  try {
    setState((s) => ({ ...s, isLoading: true }));
    await BackgroundGeolocation.ready({
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 10,
      stopTimeout: 1,
      debug: true,
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      enableHeadless: true,
      geofenceProximityRadius: 1000,
      geofenceInitialTriggerEntry: true,
    });
    setState({
      isInitialized: true,
      isLoading: false,
      error: null,
      geofences: [],   // ✅ keep geofences
    });
    return true;
  } catch (error: any) {
    console.error('[Geofencing] init error:', error);
    setState({
      isInitialized: false,
      isLoading: false,
      error: error.message,
      geofences: [],   // ✅ required
    });
    return false;
  }
}, []);

  const requestPermissions = useCallback(async () => {
    return BackgroundGeolocation.requestPermission();
  }, []);

  const addGeofence = useCallback(async (region: GeofenceRegion) => {
    const gf: RNGeofence = {
      identifier: region.id,
      latitude: region.latitude,
      longitude: region.longitude,
      radius: region.radius,
      notifyOnEntry: true,
      notifyOnExit: true,
      notifyOnDwell: false,
      loiteringDelay: 30000,
    };
    await BackgroundGeolocation.addGeofence(gf);
  }, []);

  const removeGeofence = useCallback(async (id: string) => {
    await BackgroundGeolocation.removeGeofence(id);
  }, []);

  const removeAllGeofences = useCallback(async () => {
    await BackgroundGeolocation.removeGeofences();
  }, []);

  const startMonitoring = useCallback(async () => {
    await BackgroundGeolocation.start();
  }, []);

  const stopMonitoring = useCallback(async () => {
    await BackgroundGeolocation.stop();
  }, []);

  return {
    ...state,
    initialize,
    requestPermissions,
    addGeofence,
    removeGeofence,
    removeAllGeofences,
    startMonitoring,
    stopMonitoring,
  };
};

//
// Subscribe to geofence ENTER/EXIT/DWELL events
//
export const useGeofenceEvents = (callback: (event: GeofenceEvent) => void) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const subscription = BackgroundGeolocation.onGeofence((geofence: RNBGGeofenceEvent) => {
      let transition: GeofenceTransition = 'ENTER';
      switch (geofence.action) {
        case 'ENTER': transition = 'ENTER'; break;
        case 'EXIT': transition = 'EXIT'; break;
        case 'DWELL': transition = 'DWELL'; break;
      }

      const event: GeofenceEvent = {
        id: geofence.identifier,
        transition,
        latitude: geofence.location.coords.latitude,
        longitude: geofence.location.coords.longitude,
        timestamp: new Date().toISOString(),
      };

      callbackRef.current(event);
    });

    return () => subscription.remove();
  }, []);
};

//
// Manage persisted regions (AsyncStorage)
//
export const useGeofenceRegions = () => {
  const [regions, setRegions] = useState<GeofenceRegion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadRegions = useCallback(async () => {
    setIsLoading(true);
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      setRegions(parsed);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveRegions = useCallback(async (newRegions: GeofenceRegion[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newRegions));
    setRegions(newRegions);
  }, []);

  const addRegion = useCallback(async (region: GeofenceRegion) => {
    const updated = [...regions.filter((r) => r.id !== region.id), region];
    await saveRegions(updated);
  }, [regions, saveRegions]);

  const removeRegion = useCallback(async (id: string) => {
    const updated = regions.filter((r) => r.id !== id);
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
    addRegion,
    removeRegion,
    clearRegions,
    reload: loadRegions,
  };
};
