import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Navigator } from './src/navigation/AppNavigation';
import AppProvider from './src/hooks/appContext';
import { fcmStart } from './src/utils/pushNotification';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { glueStackConfigUi } from './gluestack-ui.config';
import { navigationRef } from './src/navigation/NavigationRef';
import { geofencingSingleton } from './src/types/geofencing';
import { StyledIndicator } from './src/components/indicator';

function App() {
  const [granted, setGranted] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
    const init = async () => {
      try {
        console.log('🎬 [APP] Starting app initialization');

        // Initialize geofencing (only runs full setup once per app lifetime)
        const geofenceGranted = await geofencingSingleton.initialize();
        console.log('📍 [APP] Geofencing permission:', geofenceGranted);
        setGranted(geofenceGranted);

        // Initialize FCM
        const fcmToken = await fcmStart();
        console.log('🔔 [APP] FCM token:', fcmToken ? 'received' : 'none');

        console.log('✅ [APP] Initialization complete');
      } catch (error) {
        console.error('❌ [APP] Initialization error:', error);
        setGranted(false);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []); 


  if (isLoading) {
    return <StyledIndicator />;
  }

  return (
    <AppProvider>
      <GluestackUIProvider config={glueStackConfigUi}>
        <NavigationContainer ref={navigationRef}>
          <Navigator granted={granted} />
        </NavigationContainer>
      </GluestackUIProvider>
    </AppProvider>
  );
}

export default App;