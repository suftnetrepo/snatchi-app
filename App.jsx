import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Navigator } from './src/navigation/AppNavigation';
import AppProvider from './src/hooks/appContext';
import { fcmStart } from './src/utils/pushNotification';
import { toModel } from './src/utils/help';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { glueStackConfigUi } from './gluestack-ui.config';
import { navigationRef } from './src/navigation/NavigationRef';
import { useProjectGeofencing, useGeofenceEvents } from './src/hooks/useGeofencing';
import { useFence } from './src/hooks/useFence';
import { clear } from './src/utils/asyncStorage';
import { NotificationBus } from './scripts/notificationBus';

function App() {
  // clear().catch(); // For testing purposes only. Remove in production.
  const { handleSave } = useFence();
  const {} = useProjectGeofencing({
    enableBackgroundSync: true,
    backgroundFetchInterval: 15,
    autoRetry: true
  });

  const { eventStats } = useGeofenceEvents(
    (event) => {
      console.log('🏠 User ENTERED:......', toModel(event));
      if (__DEV__) {
        NotificationBus.emit('GEOFENCE_EVENT', {
          type: 'ENTER',
          event
        });
        console.log('Geofence saved:', event);
      }

      // handleSave(toModel(event)).then((res) => {
      //   if (__DEV__) console.log('Geofence saved:', res);
      // }).catch((err) => {
      //   if (__DEV__) console.error('Error saving geofence:', err);
      // });
    },
    (event) => {
      if (__DEV__) {
        NotificationBus.emit('GEOFENCE_EVENT', {
          type: 'EXIT',
          event
        });
        console.log('Geofence saved:', event);
      }
      // handleSave(toModel(event)).then((res) => {
      //   if (__DEV__) console.log('Geofence saved:', res);
      // }).catch((err) => {
      //   if (__DEV__) console.error('Error saving geofence:', err);
      // });
    },
    (event) => {
      if (__DEV__) {
        NotificationBus.emit('GEOFENCE_EVENT', {
          type: 'DWELL',
          event
        });
        console.log('⏰ User DWELLING in:', event); }
        // Your dwell logic here
      },
      (event) => {
        console.log('📍 Any geofence event:', event);
        // Handle all events in one place if preferred
      }
  );

  useEffect(() => {
    const initFcm = async () => {
      try {
        await fcmStart();
      } catch (error) {
        if (__DEV__) console.error('Error with getFcmToken:', error);
      }
    };
    initFcm();
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
