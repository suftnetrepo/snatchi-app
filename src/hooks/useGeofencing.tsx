import { useState, useEffect } from 'react';
import { geofencingSingleton } from '../types/geofencing';
import type { GeofenceEvent, ProjectGeofence, GeofencingState } from '../types/geofencing/types';

export const useProjectGeofencing = ({
  enableBackgroundSync = true,
  backgroundFetchInterval = 15,
  autoRetry = true,
} = {}) => {
  const [state, setState] = useState({
    isInitialized: false,
    isInitializing: false,
    error: null as string | null,
  });

  const initialize = async () => {
    try {
      setState(prev => ({ ...prev, isInitializing: true, error: null }));
      await geofencingSingleton.initialize(true);
      setState(prev => ({ ...prev, isInitialized: true, isInitializing: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to initialize',
        isInitializing: false 
      }));
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  return {
    ...state,
    retry: initialize,
  };
};

// export const useGeofenceEvents = (
//   onEnter?: (event: GeofenceEvent) => void,
//   onExit?: (event: GeofenceEvent) => void,
//   onDwell?: (event: GeofenceEvent) => void,
// ) => {
//   const [eventStats, setEventStats] = useState({
//     totalEvents: 0,
//     enterEvents: 0,
//     exitEvents: 0,
//     dwellEvents: 0,
//     eventsToday: 0,
//     lastEvent: null as GeofenceEvent | null,
//   });

//   useEffect(() => {
//     const unsubscribe = geofencingSingleton.addEventListener((event: GeofenceEvent) => {
//       setEventStats(prev => {
//         const isToday = new Date(event.timestamp).toDateString() === new Date().toDateString();
//         return {
//           totalEvents: prev.totalEvents + 1,
//           enterEvents: event.transition === 'ENTER' ? prev.enterEvents + 1 : prev.enterEvents,
//           exitEvents: event.transition === 'EXIT' ? prev.exitEvents + 1 : prev.exitEvents,
//           dwellEvents: event.transition === 'DWELL' ? prev.dwellEvents + 1 : prev.dwellEvents,
//           eventsToday: isToday ? prev.eventsToday + 1 : prev.eventsToday,
//           lastEvent: event,
//         };
//       });

//       switch (event.transition) {
//         case 'ENTER':
//           onEnter?.(event);
//           break;
//         case 'EXIT':
//           onExit?.(event);
//           break;
//         case 'DWELL':
//           onDwell?.(event);
//           break;
//       }
//     });

//     return () => unsubscribe();
//   }, [onEnter, onExit, onDwell]);

//   return { eventStats };
// };

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