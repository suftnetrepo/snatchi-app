import { useEffect, useState } from 'react';
import BackgroundFetch from 'react-native-background-fetch';
import { geofencingSingleton } from '../types/geofencing';
import type { GeofencingState, GeofenceEvent } from '../types/geofencing/types';

/**
 * 🔹 Main hook to bootstrap geofencing once in App.tsx
 * Requests permissions → initializes → restores projects → sets up background fetch
 */
export function useProjectGeofencing() {
  useEffect(() => {
    const setup = async () => {
      // 1️⃣ Request runtime permissions
      const granted = await geofencingSingleton.requestPermissions();
      if (!granted) {
        console.warn('⚠️ Geofencing permissions not granted');
        return;
      }

      // 2️⃣ Init geofencing
      await geofencingSingleton.initialize();

      // 3️⃣ Restore projects
      await geofencingSingleton.restoreProjects();

      // 4️⃣ BackgroundFetch to re-apply valid projects
      BackgroundFetch.configure(
        {
          minimumFetchInterval: 15,
          stopOnTerminate: false,
          startOnBoot: true,
          enableHeadless: true,
        },
        async (taskId) => {
          await geofencingSingleton.restoreProjects();
          BackgroundFetch.finish(taskId);
        },
        (error) => console.log('[BackgroundFetch] Failed to configure', error)
      );

      BackgroundFetch.start();
    };

    setup();

    return () => {
      BackgroundFetch.stop();
    };
  }, []);
}

/**
 * 🔹 Subscribe to geofence ENTER/EXIT/DWELL events
 */
export function useGeofenceEvents(callback: (event: GeofenceEvent) => void) {
  useEffect(() => {
    const unsubscribe = geofencingSingleton.addEventListener(callback);
    return unsubscribe; // ✅ return cleanup directly (not wrapped)
  }, [callback]);
}

/**
 * 🔹 Hook to access current geofencing state (projects, error, etc)
 */
export function useProjectState(): GeofencingState {
  const [state, setState] = useState<GeofencingState>(
    geofencingSingleton.getState()
  );

  useEffect(() => {
    const unsubscribe = geofencingSingleton.addStateListener(setState);
    return unsubscribe; // ✅ same fix: return cleanup directly
  }, []);

  return state;
}
