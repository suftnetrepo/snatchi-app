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
            const inside = geofencingSingleton.getCurrentGeofenceStates();
            // You could add callback/event here if needed
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

export const useProjectState = () => {
  const [state, setState] = useState<GeofencingState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    geofences: [],
  });
  const [currentGeofences, setCurrentGeofences] = useState<string[]>([]);
  const [debugInfo, setDebugInfo] = useState({
    stateChangeCount: 0,
  });

  useEffect(() => {
    const unsubscribe = geofencingSingleton.addStateListener((newState: GeofencingState) => {
      setState(newState);
      setCurrentGeofences(geofencingSingleton.getCurrentGeofenceStates());
      setDebugInfo(prev => ({
        ...prev,
        stateChangeCount: prev.stateChangeCount + 1,
      }));
    });

    return () => unsubscribe();
  }, []);

  return {
    ...state,
    currentGeofences,
    debugInfo,
  };
};

export const useGeofenceManagement = () => {
  const [state, setState] = useState({
    isLoading: false,
    error: null as string | null,
  });

  const handleOperation = async (operation: () => Promise<void>) => {
    setState({ isLoading: true, error: null });
    try {
      await operation();
    } catch (error) {
      setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Operation failed'
      });
      throw error;
    }
    setState({ isLoading: false, error: null });
  };

  return {
    addProjects: (projects: ProjectGeofence[]) =>
      handleOperation(() => geofencingSingleton.addProjects(projects)),
    removeProjects: (projectIds: string[]) =>
      handleOperation(() => geofencingSingleton.removeProjects(projectIds)),
    clearAllProjects: () =>
      handleOperation(() => geofencingSingleton.clearAllProjects()),
    forceGeofenceCheck: () =>
      handleOperation(() => geofencingSingleton.forceGeofenceCheck()),
    refreshGeofences: () =>
      handleOperation(() => geofencingSingleton.triggerGeofenceRefresh()),
    isLoading: state.isLoading,
    error: state.error,
  };
};