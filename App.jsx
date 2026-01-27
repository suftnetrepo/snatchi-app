import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Navigator } from './src/navigation/AppNavigation';
import AppProvider from './src/hooks/appContext';
import { fcmStart } from './scripts/pushNotification';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { glueStackConfigUi } from './gluestack-ui.config';
import { navigationRef } from './src/navigation/NavigationRef';
import useLocation from './src/hooks/useLocation';
import { useGeofenceForeground } from './src/hooks/useGeofencing';

function App() {
  useLocation()
  // useGeofenceForeground(granted, debounceMs = 2000)

  useEffect(() => {
    const initFCM = async () => {
      try {
        await fcmStart();
      } catch (error) {
        console.error('FCM initialization error:', error);
      }
    };

    const init = async () => {
      await initFCM()
    };

    init();
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