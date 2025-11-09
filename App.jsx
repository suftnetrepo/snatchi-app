import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Navigator } from './src/navigation/AppNavigation';
import AppProvider from './src/hooks/appContext';
import { getFcmToken } from './src/utils/pushNotification';
import { toModel } from './src/utils/help';
import useLocation from './src/hooks/useLocation';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { glueStackConfigUi } from './gluestack-ui.config';
import { navigationRef } from './src/navigation/NavigationRef';
import { useProjectGeofencing, useGeofenceEvents } from './src/hooks/useGeofencing';
import { useFence } from './src/hooks/useFence';

function App() {
  useLocation();
  const { handleSave } = useFence();
  const { isInitialized, isInitializing, error, retry } = useProjectGeofencing({
    enableBackgroundSync: true,
    backgroundFetchInterval: 15,
    autoRetry: true
  });

  const { eventStats } = useGeofenceEvents(
    (event) => {
      console.log('🏠 User ENTERED:......', toModel(event));
      handleSave(toModel(event)).then((res) => {
        if (__DEV__) console.log('Geofence saved:', res);
      }).catch((err) => {
        if (__DEV__) console.error('Error saving geofence:', err);
      });
    },
    (event) => {
      handleSave(toModel(event)).then((res) => {
        if (__DEV__) console.log('Geofence saved:', res);
      }).catch((err) => {
        if (__DEV__) console.error('Error saving geofence:', err);
      });
    },
    (event) => {
      console.log('⏰ User DWELLING in:', event);
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
