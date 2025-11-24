import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Navigator } from './src/navigation/AppNavigation';
import AppProvider from './src/hooks/appContext';
import { fcmStart } from './src/utils/pushNotification';
import { toModel } from './src/utils/help';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { Vibration } from 'react-native';
import { glueStackConfigUi } from './gluestack-ui.config';
import { navigationRef } from './src/navigation/NavigationRef';
import { useProjectGeofencing, useGeofenceEvents } from './src/hooks/useGeofencing';
import { useFence } from './src/hooks/useFence';
import { localNotificationService } from './Notification/LocalNotificationService';
import { removeStore } from './src/utils/asyncStorage';

function App() {
   removeStore("chatUser").catch(()=> {})
  const { handleSave } = useFence();
  const { isInitializing, isInitialized } = useProjectGeofencing({
    enableBackgroundSync: true,
    backgroundFetchInterval: 15,
    autoRetry: true
  });

  // const { eventStats } = useGeofenceEvents(
  //   (event) => {
  //     const model = toModel(event);

  //     // 📳 Vibrate once (300ms)
  //     Vibration.vibrate(300);

  //     localNotificationService.defaultChannel();
  //     localNotificationService.showNotification(
  //       Date.now() % 100000,
  //       "Entered Geofence",
  //       `${model.siteName}`,
  //       { test: true },
  //       { playSound: true }
  //     );

  //     // 💾 Save to database (your existing API)
  //     handleSave(model)
  //       .then((res) => console.log("ENTER saved:", res))
  //       .catch((err) => console.error("Save error:", err));
  //   },
  //   (event) => {
  //     const model = toModel(event);

  //     // 📳 Vibrate once (300ms)
  //     Vibration.vibrate(300);

  //     localNotificationService.defaultChannel();
  //     localNotificationService.showNotification(
  //       Date.now() % 100000,
  //       "Exited Geofence",
  //       `${model.siteName}`,
  //       { test: true },
  //       { playSound: true }
  //     );

  //     // 💾 Save to database (your existing API)
  //     handleSave(model)
  //       .then((res) => console.log("ENTER saved:", res))
  //       .catch((err) => console.error("Save error:", err));

  //   },
  //   (event) => {
  //     console.log('📍 Any geofence event:', event);
  //     // Handle all events in one place if preferred
  //   }
  // );

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
