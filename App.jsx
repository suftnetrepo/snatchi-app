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
import { getStore } from './src/utils/asyncStorage';

function App() {
  const [granted, setGranted] = useState(null); // Change to null for loading state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initFcm = async () => {
      try {
        await geofencingSingleton.initialize();
        await fcmStart();
        const status = await getStore('GeofencingGranted');
        setGranted(status);
      } catch (error) {
        if (__DEV__) console.error('Error with initialization:', error);
        setGranted(false); // Set to false on error
      } finally {
        setIsLoading(false);
      }
    };
    initFcm();
  }, []);

  // Show loading indicator while initializing
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