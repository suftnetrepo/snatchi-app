import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Navigator } from './src/navigation/AppNavigation';
import AppProvider from './src/hooks/appContext';
import { fcmStart } from './scripts/pushNotification';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { glueStackConfigUi } from './gluestack-ui.config';
import { navigationRef } from './src/navigation/NavigationRef';
import useLocation from './src/hooks/useLocation';
import {useAppContext} from './src/hooks/appContext';

function AppContent() {
  const {user} = useAppContext();
  useLocation(Boolean(user));

  useEffect(() => {
    const initFCM = async () => {
      try {
        await fcmStart();
      } catch (error) {
        console.error('FCM initialization error:', error);
      }
    };

    const init = async () => {
      await initFCM();
    };

    init();
  }, []);

  return (
    <GluestackUIProvider config={glueStackConfigUi}>
      <NavigationContainer ref={navigationRef}>
        <Navigator />
      </NavigationContainer>
    </GluestackUIProvider>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
