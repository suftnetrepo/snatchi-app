import { useState, useEffect, useRef } from 'react';
import { geofencingSingleton } from '../../scripts/geofencing';
import type { ProjectGeofence, GeofencingState } from '../types/types';
import { AppState, AppStateStatus } from 'react-native';

export const useGeofenceForeground = ({ 
  enabled = true, 
  debounceMs = 2000 
} = {}) => {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const lastCheckTime = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      const previousState = appState.current;
      appState.current = nextAppState;

      // Check if coming from background to foreground
      const isBackgroundToForeground = previousState.match(/inactive|background/) && 
                                      nextAppState === 'active';
      
      if (!isBackgroundToForeground) return;

      // Debounce check
      const now = Date.now();
      if (now - lastCheckTime.current < debounceMs) return;

      // Update last check time immediately to prevent rapid triggers
      lastCheckTime.current = now;

      // Small delay to let app settle before reinitializing
      setTimeout(async () => {
        try {
          const success = await geofencingSingleton.initialize();
          
          if (success) {
            
          }
        } catch (error) {
          console.error('Geofence reinitialization error:', error);
        }
      }, 500);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [enabled, debounceMs]);

  return appState.current;
};


