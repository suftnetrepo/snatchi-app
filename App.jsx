import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Navigator } from './src/navigation/AppNavigation';
import AppProvider from './src/hooks/appContext';
import { getFcmToken } from './src/utils/pushNotification';
import useLocation from './src/hooks/useLocation';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { glueStackConfigUi } from './gluestack-ui.config';
import { navigationRef } from './src/navigation/NavigationRef';
import { useProjectGeofencing, useGeofenceEvents } from './src/hooks/useProjectGeofencing';

function App() {
  useLocation();
  const { isInitialized, isInitializing, error, retry } = useProjectGeofencing({
    enableBackgroundSync: true,
    backgroundFetchInterval: 15,
    autoRetry: true
  });

  const { eventStats } = useGeofenceEvents(
    (event) => {
      console.log('🏠 User ENTERED:', event.id);
      // Your custom enter logic here
      // Send API call, update state, show notification, etc.
    },
    (event) => {
      console.log('🚪 User EXITED:', event.id);
      // Your custom exit logic here
      // Calculate time spent, log activity, etc.
    },
    (event) => {
      console.log('⏰ User DWELLING in:', event.id);
      // Your dwell logic here
    },
    (event) => {
      console.log('📍 Any geofence event:', event);
      // Handle all events in one place if preferred
    }
  );

  useEffect(() => {
    const setUpFcm = async () => {
      try {
        await getFcmToken();
      } catch (error) {
        if (__DEV__) console.error('Error with getFcmToken:', error);
      }
    };
    setUpFcm();

  }, []);

  return (
    <AppProvider>
      <GluestackUIProvider config={glueStackConfigUi}>
        <NavigationContainer ref={navigationRef}>
          <Navigator />

        </NavigationContainer>
      </GluestackUIProvider>
    </AppProvider>
  );
}

export default App;
